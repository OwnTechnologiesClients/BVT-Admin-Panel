"use client";

import React, { useState } from "react";
import { Badge, Button } from "@/components/ui";
import { Eye, Edit, Trash2, Plus, Filter, Search, Users, UserCheck, Award, MapPin } from "lucide-react";

const UsersTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const users = [
    {
      id: 1,
      firstName: "John",
      lastName: "Smith",
      email: "john.smith@navy.mil",
      role: "Student",
      department: "Marine Engineering",
      status: "Active",
      experience: "2 years",
      rating: 4.5,
      location: "San Diego, CA",
      lastActive: "2024-03-10",
      coursesCompleted: 5,
      certifications: ["Basic Engineering", "Safety Training"]
    },
    {
      id: 2,
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.johnson@navy.mil",
      role: "Instructor",
      department: "Navigation",
      status: "Active",
      experience: "8 years",
      rating: 4.8,
      location: "Norfolk, VA",
      lastActive: "2024-03-12",
      coursesCompleted: 15,
      certifications: ["Advanced Navigation", "GPS Systems", "Leadership"]
    },
    {
      id: 3,
      firstName: "Michael",
      lastName: "Brown",
      email: "michael.brown@navy.mil",
      role: "Mentor",
      department: "Maritime Safety",
      status: "Active",
      experience: "12 years",
      rating: 4.9,
      location: "Seattle, WA",
      lastActive: "2024-03-11",
      coursesCompleted: 25,
      certifications: ["Safety Management", "Risk Assessment", "Emergency Response"]
    },
    {
      id: 4,
      firstName: "Lisa",
      lastName: "Davis",
      email: "lisa.davis@navy.mil",
      role: "Student",
      department: "Submarine Operations",
      status: "Active",
      experience: "1 year",
      rating: 4.2,
      location: "Groton, CT",
      lastActive: "2024-03-09",
      coursesCompleted: 3,
      certifications: ["Basic Operations"]
    },
    {
      id: 5,
      firstName: "David",
      lastName: "Wilson",
      email: "david.wilson@navy.mil",
      role: "Instructor",
      department: "Naval Operations",
      status: "Inactive",
      experience: "15 years",
      rating: 4.7,
      location: "Pearl Harbor, HI",
      lastActive: "2024-02-28",
      coursesCompleted: 30,
      certifications: ["Strategic Planning", "Operations Management", "Leadership"]
    },
    {
      id: 6,
      firstName: "Jennifer",
      lastName: "Taylor",
      email: "jennifer.taylor@navy.mil",
      role: "Mentor",
      department: "Marine Engineering",
      status: "Active",
      experience: "10 years",
      rating: 4.6,
      location: "Newport News, VA",
      lastActive: "2024-03-12",
      coursesCompleted: 20,
      certifications: ["Marine Engineering", "Systems Design", "Project Management"]
    },
    {
      id: 7,
      firstName: "Robert",
      lastName: "Anderson",
      email: "robert.anderson@navy.mil",
      role: "Student",
      department: "Navigation",
      status: "Active",
      experience: "3 years",
      rating: 4.3,
      location: "Mayport, FL",
      lastActive: "2024-03-08",
      coursesCompleted: 7,
      certifications: ["Navigation Basics", "Chart Reading"]
    },
    {
      id: 8,
      firstName: "Emily",
      lastName: "Martinez",
      email: "emily.martinez@navy.mil",
      role: "Instructor",
      department: "Maritime Safety",
      status: "Active",
      experience: "6 years",
      rating: 4.8,
      location: "San Diego, CA",
      lastActive: "2024-03-11",
      coursesCompleted: 18,
      certifications: ["Safety Training", "Environmental Protection", "Compliance"]
    }
  ];

  const roles = ["All", "Student", "Instructor", "Mentor"];
  const statuses = ["All", "Active", "Inactive", "Pending"];

  const filteredUsers = users.filter(user => {
    const matchesSearch = `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "" || user.role === filterRole;
    const matchesStatus = filterStatus === "" || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "Active": return "success";
      case "Inactive": return "error";
      case "Pending": return "warning";
      default: return "default";
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "Student": return "info";
      case "Instructor": return "warning";
      case "Mentor": return "success";
      default: return "default";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="text-yellow-400">★</span>);
    }
    if (hasHalfStar) {
      stars.push(<span key="half" className="text-yellow-400">☆</span>);
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="text-gray-300">★</span>);
    }

    return stars;
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Users Management</h2>
          <p className="text-gray-600">Manage and monitor all users, instructors, and mentors</p>
        </div>
        <Button variant="primary" className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add New User
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search users by name, email, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div className="lg:w-48">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {roles.map(role => (
                <option key={role} value={role === "All" ? "" : role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="lg:w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {statuses.map(status => (
                <option key={status} value={status === "All" ? "" : status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Additional Filters Button */}
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            More Filters
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-green-600">
                {users.filter(u => u.status === "Active").length}
              </p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <UserCheck className="w-4 h-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Instructors</p>
              <p className="text-2xl font-bold text-yellow-600">
                {users.filter(u => u.role === "Instructor").length}
              </p>
            </div>
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-yellow-600 font-semibold">👨‍🏫</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Mentors</p>
              <p className="text-2xl font-bold text-purple-600">
                {users.filter(u => u.role === "Mentor").length}
              </p>
            </div>
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Award className="w-4 h-4 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Role</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Department</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Experience</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Rating</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Location</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {user.firstName[0]}{user.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-xs text-gray-500">{user.coursesCompleted} courses completed</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Badge color={getRoleColor(user.role)}>{user.role}</Badge>
                  </td>
                  <td className="py-4 px-4 text-gray-900">{user.department}</td>
                  <td className="py-4 px-4 text-gray-900">{user.experience}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1">
                      <div className="flex">
                        {renderStars(user.rating)}
                      </div>
                      <span className="text-sm text-gray-600 ml-1">{user.rating}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span className="text-sm text-gray-900">{user.location}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Badge color={getStatusColor(user.status)}>{user.status}</Badge>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="text-gray-700 hover:text-gray-900">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-gray-700 hover:text-gray-900">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {filteredUsers.length} of {users.length} users
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="primary" size="sm">1</Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">3</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersTable;
