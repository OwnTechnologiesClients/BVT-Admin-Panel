"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button } from "@/components/ui";
import { Eye, Edit, Trash2, Plus, Filter, Search } from "lucide-react";
import Link from "next/link";
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
  const fetchUsers = useCallback(async (page, limit, search, role, status) => {
    try {
      setLoading(true);
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
        setUsers(response.data || []);
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
      setLoading(false);
    }
  }, []);

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await userAPI.getUserStats();
      if (response.success && response.data) {
        setStats({
          totalUsers: response.data.totalUsers || 0,
          activeUsers: response.data.activeUsers || 0,
          instructors: response.data.instructors || 0,
          admins: response.data.admins || 0
        });
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

  // Debounced search (300ms like Oasis)
  const searchTimeoutRef = useRef(null);
  useEffect(() => {
    // Skip on initial mount - initial fetch already handles this
    if (isInitialMount.current) {
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      fetchUsers(1, pagination.limit, searchTerm, roleFilter, statusFilter);
    }, 300);
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, fetchUsers, pagination.limit, roleFilter, statusFilter]);

  // Handle filter changes - trigger API call
  useEffect(() => {
    // Skip on initial mount - initial fetch already handles this
    if (isInitialMount.current) {
      return;
    }
    fetchUsers(1, pagination.limit, searchTerm, roleFilter, statusFilter);
  }, [roleFilter, statusFilter, fetchUsers, pagination.limit, searchTerm]);

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

  const handleDelete = async (userId) => {
    const result = await showDeleteConfirm(
      'Delete User?',
      'This action cannot be undone. All user data will be permanently deleted.'
    );
    
    if (result.isConfirmed) {
    try {
      const response = await userAPI.deleteUser(userId);
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
    {
      key: "actions",
      label: "Actions",
      render: (value, item) => (
        <div className="flex items-center gap-2">
          <Link href={`/users/${item.id}/view`}>
            <Button variant="outline" size="sm" className="text-gray-700 hover:text-gray-900">
              <Eye className="w-4 h-4" />
            </Button>
          </Link>
          <Link href={`/users/${item.id}/edit`}>
            <Button variant="outline" size="sm" className="text-gray-700 hover:text-gray-900">
              <Edit className="w-4 h-4" />
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleDelete(item.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
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

  const filtersForTable = [
    {
      key: "role",
      label: "Role",
      options: ["admin", "instructor"]
    },
    {
      key: "status",
      label: "Status",
      options: ["Active", "Inactive"]
    }
  ];

  // Get unique roles from current users (for filter dropdown)
  const uniqueRoles = Array.from(
    new Set(users.map(u => u.role).filter(Boolean))
  ).sort();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {statsForTable.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {statsForTable.map((stat, index) => (
            <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color || 'text-gray-900'}`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`w-8 h-8 ${stat.bgColor || 'bg-blue-100'} rounded-lg flex items-center justify-center`}>
                  <span className={`${stat.iconColor || 'text-blue-600'} font-semibold`}>
                    {stat.icon}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters and Search - Matching MyCourses pattern */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Users</h2>
            <button
              onClick={() => router.push("/users/add")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add New User
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search users by name, email, or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Role Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Roles</option>
                {uniqueRoles.map(role => (
                  <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

          </div>
        </div>

        {/* Data Table */}
        <div className="p-6">
          {formattedUsers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {columns.map((column, index) => (
                      <th key={index} className="text-left py-3 px-4 font-medium text-gray-700">
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {formattedUsers.map((item, index) => (
                    <tr key={item.id || index} className="border-b border-gray-100 hover:bg-gray-50">
                      {columns.map((column, colIndex) => (
                        <td key={colIndex} className="py-4 px-4">
                          {column.render ? column.render(item[column.key], item) : item[column.key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.total > 0 && (
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Left side: Items info and page size selector */}
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-700">
                    Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{" "}
                    <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{" "}
                    <span className="font-medium">{pagination.total}</span> items
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-700">Show:</label>
                    <select
                      value={pagination.limit}
                      onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                      className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                </div>

                {/* Right side: Page navigation */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  
                  {/* Page numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }
                      
                      if (pageNum < 1 || pageNum > pagination.totalPages) return null;
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`min-w-[2.5rem] px-3 py-1 border rounded-md text-sm ${
                            pageNum === pagination.page
                              ? "bg-blue-600 text-white border-blue-600"
                              : "border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsersTable;

