"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button } from "@/components/ui";
import DataTable from "@/components/common/DataTable";
import { Eye, Edit, Trash2, Plus, Filter, Search, Users, Loader2 } from "lucide-react";
import Link from "next/link";
import * as userAPI from "@/lib/api/user";

const UsersTable = () => {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
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

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(searchTerm && { search: searchTerm }),
        ...(filterRole && { role: filterRole }),
        ...(filterStatus !== '' && { status: filterStatus }),
      };

      const response = await userAPI.getAllUsers(params);
      
      if (response.success) {
        setUsers(response.data || []);
        setPagination(prev => ({
          ...prev,
          total: response.pagination?.total || 0,
          totalPages: response.pagination?.totalPages || 0,
        }));
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, filterRole, filterStatus]);

  useEffect(() => {
    fetchStats();
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pagination.page === 1) {
        fetchUsers();
      } else {
        setPagination(prev => ({ ...prev, page: 1 }));
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Format user data for display
  const formatUsers = (users) => {
    return users.map(user => ({
      id: user._id,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
      username: user.username,
      email: user.email,
      phone: user.phone || 'N/A',
      role: user.role,
      status: user.status === 1 ? 'Active' : 'Inactive',
      lastLogin: user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never',
      createdAt: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'
    }));
  };

  const formattedUsers = formatUsers(users);

  const handleDelete = async (userId) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await userAPI.deleteUser(userId);
      if (response.success) {
        fetchUsers();
        fetchStats();
      } else {
        alert(response.message || 'Failed to delete user');
      }
    } catch (err) {
      alert(err.message || 'Failed to delete user');
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
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

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-600 mt-1">Manage users, instructors, and admins</p>
        </div>
        <Link href="/users/add">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add User
          </Button>
        </Link>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeUsers}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Instructors</p>
              <p className="text-2xl font-bold text-blue-600">{stats.instructors}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Admins</p>
              <p className="text-2xl font-bold text-purple-600">{stats.admins}</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search users by name, email, or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="lg:w-48">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="instructor">Instructor</option>
            </select>
          </div>
          <div className="lg:w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={formattedUsers}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default UsersTable;

