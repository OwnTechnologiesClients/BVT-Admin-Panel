"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui";
import DataTable from "@/components/common/DataTable";
import * as userAPI from "@/lib/api/user";
import { showSuccess, showError, showDeleteConfirm } from "@/lib/utils/sweetalert";

const UsersTable = () => {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    instructors: 0,
    admins: 0
  });
  const isInitialMount = useRef(true);
  const hasInitialFetch = useRef(false);

  // Fetch users with server-side pagination (Oasis pattern)
  // Supports lightweight search without triggering full table loading state
  const fetchUsers = useCallback(async (page, limit, search, role, status, options = {}) => {
    const { skipLoading = false } = options;
    try {
      if (!skipLoading) setLoading(true);
      setError(null);
      
      const params = {
        page,
        limit,
        sort_column: 'createdAt',
        sort_direction: 'desc',
        ...(search && { search }),
        ...(role && { role }),
        ...(status && { status: status === 'Active' ? 1 : 0 })
      };

      const response = await userAPI.getAllUsers(params);
      if (response.success) {
        const usersData = response.data || [];
        setUsers(usersData);
        if (response.pagination) {
          setPagination({
            page: response.pagination.page || page,
            limit: response.pagination.limit || limit,
            total: response.pagination.total || 0,
            totalPages: response.pagination.totalPages || 0
          });
        }
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      const errorMsg = err.message || 'Failed to fetch users';
      setError(errorMsg);
      showError('Error Loading Users', errorMsg);
    } finally {
      if (!skipLoading) setLoading(false);
    }
  }, []);

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await userAPI.getUserStats();
      if (response.success && response.data) {
        setStats(prev => ({
          ...prev,
          totalUsers: response.data.totalUsers || 0,
          activeUsers: response.data.activeUsers || 0
        }));
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Initial fetch - only run once even in Strict Mode
  useEffect(() => {
    if (hasInitialFetch.current) return;
    hasInitialFetch.current = true;
    fetchUsers(1, 10, "", "", "");
    fetchStats();
    // Mark initial mount as complete after a short delay to allow other effects to skip
    const timer = setTimeout(() => {
      isInitialMount.current = false;
    }, 100);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update instructor and admin counts when users change
  useEffect(() => {
    if (users.length > 0) {
      const instructorCount = users.filter(u => u.role === 'instructor').length;
      const adminCount = users.filter(u => u.role === 'admin').length;
      
      setStats(prev => ({
        ...prev,
        instructors: instructorCount,
        admins: adminCount
      }));
    }
  }, [users]);

  // Handle search change from DataTable
  const handleSearchChange = useCallback((search) => {
    setSearchTerm(search);
    fetchUsers(1, pagination.limit, search, roleFilter, statusFilter);
  }, [fetchUsers, pagination.limit, roleFilter, statusFilter]);

  // Handle filter change from DataTable
  const handleFilterChange = useCallback((filters) => {
    const newRoleFilter = filters.role || "";
    const newStatusFilter = filters.status || "";
    
    setRoleFilter(newRoleFilter);
    setStatusFilter(newStatusFilter);
    
    fetchUsers(1, pagination.limit, searchTerm, newRoleFilter, newStatusFilter);
  }, [fetchUsers, pagination.limit, searchTerm]);

  // Handle page change
  const handlePageChange = useCallback((newPage) => {
    fetchUsers(newPage, pagination.limit, searchTerm, roleFilter, statusFilter);
  }, [fetchUsers, pagination.limit, searchTerm, roleFilter, statusFilter]);

  // Handle page size change
  const handlePageSizeChange = useCallback((newPageSize) => {
    fetchUsers(1, newPageSize, searchTerm, roleFilter, statusFilter);
  }, [fetchUsers, searchTerm, roleFilter, statusFilter]);

  // Format user data for display
  const formatUser = (user) => ({
    id: user._id,
    name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
    username: user.username,
    email: user.email,
    phone: user.phone || 'N/A',
    role: user.role,
    status: user.status === 1 ? 'Active' : 'Inactive',
    lastLogin: user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never',
    createdAt: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
    rawUser: user // Keep original for filtering
  });

  // Format users for display
  const formattedUsers = users.map(formatUser);

  const handleDelete = async (user) => {
    const result = await showDeleteConfirm(
      'Delete User?',
      'This action cannot be undone. All user data will be permanently deleted.'
    );
    
    if (result.isConfirmed) {
    try {
      const response = await userAPI.deleteUser(user.id);
      if (response.success) {
          showSuccess('User Deleted!', 'The user has been deleted successfully.');
        await fetchUsers(pagination.page, pagination.limit, searchTerm, roleFilter, statusFilter);
        fetchStats();
      } else {
          showError('Delete Failed', response.message || 'Failed to delete user');
        }
      } catch (err) {
        showError('Error', err.message || 'Failed to delete user');
      }
    }
  };

  const handleEdit = (user) => {
    router.push(`/users/${user.id}/edit`);
  };

  const handleView = (user) => {
    router.push(`/users/${user.id}/view`);
  };

  const handleAdd = () => {
    router.push("/users/add");
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'instructor': return 'info';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    return status === 'Active' ? 'success' : 'error';
  };

  const columns = [
    {
      key: "name",
      label: "User",
      render: (value, item) => (
        <div>
          <p className="font-medium text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">@{item.username}</p>
        </div>
      )
    },
    {
      key: "email",
      label: "Email",
      render: (value) => <span className="text-gray-700">{value}</span>
    },
    {
      key: "phone",
      label: "Phone",
      render: (value) => <span className="text-gray-700">{value}</span>
    },
    {
      key: "role",
      label: "Role",
      render: (value) => (
        <Badge color={getRoleColor(value)}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      )
    },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <Badge color={getStatusColor(value)}>
          {value}
        </Badge>
      )
    },
    {
      key: "lastLogin",
      label: "Last Login",
      render: (value) => <span className="text-gray-700">{value}</span>
    },
  ];

  const statsForTable = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: "👥",
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      label: "Active Users",
      value: stats.activeUsers,
      icon: "✓",
      bgColor: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      label: "Instructors",
      value: stats.instructors,
      icon: "👨‍🏫",
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      label: "Admins",
      value: stats.admins,
      icon: "👤",
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600"
    }
  ];

  const filters = [];

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Loading users...</p>
      </div>
    );
  }

  if (error && users.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <DataTable
      title="Users"
      data={formattedUsers}
      columns={columns}
      searchPlaceholder="Search users by name, email, or username..."
      filters={filters}
      stats={statsForTable}
      pagination={pagination}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
      onSearchChange={handleSearchChange}
      onFilterChange={handleFilterChange}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onView={handleView}
      serverSide={true}
    />
  );
};

export default UsersTable;

