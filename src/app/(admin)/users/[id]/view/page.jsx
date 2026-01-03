"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Edit, Loader2 } from "lucide-react";
import { Badge, Button } from "@/components/ui";
import Link from "next/link";
import * as userAPI from "@/lib/api/user";

export default function ViewUserPage() {
  const router = useRouter();
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await userAPI.getUserById(id);
        if (response.success) {
          setUser(response.data);
        } else {
          setError('User not found');
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        setError(err.message || 'Failed to fetch user');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUser();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="max-w-xl mx-auto p-8">
        <button 
          onClick={() => router.back()} 
          className="bg-gray-100 rounded-lg p-2 border mb-4 hover:bg-gray-200"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h1 className="text-xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-red-600">{error || 'User not found'}</p>
        </div>
      </div>
    );
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'instructor': return 'info';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    return status === 1 ? 'success' : 'error';
  };

  return (
    <div className="max-w-xl mx-auto p-8">
      <button 
        onClick={() => router.back()} 
        className="bg-gray-100 rounded-lg p-2 border mb-4 hover:bg-gray-200"
      >
        <ArrowLeft className="w-4 h-4" />
      </button>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">User Details</h1>
        <Link href={`/users/${id}/edit`}>
          <Button variant="outline" className="flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Edit User
          </Button>
        </Link>
      </div>
      <div className="bg-white border shadow rounded-xl p-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Name</label>
          <div className="text-lg font-semibold text-gray-900 mt-1">
            {user.firstName} {user.lastName}
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-500">Username</label>
          <div className="text-gray-700 mt-1 font-mono text-sm">@{user.username}</div>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-500">Email</label>
          <div className="text-gray-700 mt-1">{user.email}</div>
        </div>

        {user.phone && (
          <div>
            <label className="text-sm font-medium text-gray-500">Phone</label>
            <div className="text-gray-700 mt-1">{user.phone}</div>
          </div>
        )}

        <div className="flex items-center gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Role</label>
            <div className="mt-1">
              <Badge color={getRoleColor(user.role)}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Badge>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Status</label>
            <div className="mt-1">
              <Badge color={getStatusColor(user.status)}>
                {user.status === 1 ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </div>

        {user.lastLogin && (
          <div>
            <label className="text-sm font-medium text-gray-500">Last Login</label>
            <div className="text-gray-700 mt-1">
              {new Date(user.lastLogin).toLocaleString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        )}

        {user.createdAt && (
          <div>
            <label className="text-sm font-medium text-gray-500">Created At</label>
            <div className="text-gray-700 mt-1">
              {new Date(user.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

