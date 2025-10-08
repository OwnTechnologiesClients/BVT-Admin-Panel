"use client";

import React, { useState } from "react";
import { Badge, Button } from "@/components/ui";
import { Eye, Edit, Trash2, Plus, Filter, Search, GraduationCap, Users, Calendar, Award } from "lucide-react";

const ProgramsTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const programs = [
    {
      id: 1,
      title: "Advanced Naval Leadership Program",
      category: "Naval Operations",
      director: "Captain Michael Thompson",
      duration: "6 months",
      startDate: "2024-03-01",
      endDate: "2024-08-31",
      participants: 25,
      maxParticipants: 30,
      status: "Active",
      type: "Hybrid",
      cost: "$15,000",
      difficulty: "Advanced",
      modules: 8,
      certifications: ["Naval Leadership", "Strategic Planning"],
      createdAt: "2024-01-15"
    },
    {
      id: 2,
      title: "Marine Engineering Mastery",
      category: "Marine Engineering",
      director: "Commander Sarah Johnson",
      duration: "12 months",
      startDate: "2024-02-01",
      endDate: "2025-01-31",
      participants: 15,
      maxParticipants: 20,
      status: "Active",
      type: "Online",
      cost: "$12,000",
      difficulty: "Advanced",
      modules: 12,
      certifications: ["Marine Engineering", "Systems Design"],
      createdAt: "2024-01-20"
    },
    {
      id: 3,
      title: "Submarine Operations Certification",
      category: "Submarine Operations",
      director: "Commander Lisa Chen",
      duration: "8 months",
      startDate: "2024-04-01",
      endDate: "2024-11-30",
      participants: 12,
      maxParticipants: 15,
      status: "Upcoming",
      type: "Offline",
      cost: "$18,000",
      difficulty: "Advanced",
      modules: 10,
      certifications: ["Submarine Operations", "Underwater Navigation"],
      createdAt: "2024-02-01"
    },
    {
      id: 4,
      title: "Maritime Safety Specialist",
      category: "Maritime Safety",
      director: "Captain David Wilson",
      duration: "4 months",
      startDate: "2024-01-15",
      endDate: "2024-05-15",
      participants: 45,
      maxParticipants: 50,
      status: "Active",
      type: "Hybrid",
      cost: "$8,000",
      difficulty: "Intermediate",
      modules: 6,
      certifications: ["Safety Management", "Risk Assessment"],
      createdAt: "2023-12-15"
    },
    {
      id: 5,
      title: "Navigation Systems Expert",
      category: "Navigation",
      director: "Lieutenant Commander Alex Brown",
      duration: "6 months",
      startDate: "2024-03-15",
      endDate: "2024-09-15",
      participants: 30,
      maxParticipants: 35,
      status: "Active",
      type: "Online",
      cost: "$10,000",
      difficulty: "Intermediate",
      modules: 8,
      certifications: ["GPS Systems", "Electronic Navigation"],
      createdAt: "2024-02-10"
    },
    {
      id: 6,
      title: "Naval Architecture Fundamentals",
      category: "Marine Engineering",
      director: "Commander James Rodriguez",
      duration: "9 months",
      startDate: "2024-05-01",
      endDate: "2025-01-31",
      participants: 0,
      maxParticipants: 25,
      status: "Draft",
      type: "Hybrid",
      cost: "$14,000",
      difficulty: "Intermediate",
      modules: 9,
      certifications: ["Naval Architecture", "Structural Design"],
      createdAt: "2024-03-01"
    }
  ];

  const categories = ["All", "Marine Engineering", "Navigation", "Maritime Safety", "Naval Operations", "Submarine Operations"];

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.director.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "" || program.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "Active": return "success";
      case "Upcoming": return "info";
      case "Draft": return "warning";
      case "Completed": return "default";
      case "Cancelled": return "error";
      default: return "default";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "Online": return "info";
      case "Offline": return "default";
      case "Hybrid": return "warning";
      default: return "default";
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Beginner": return "info";
      case "Intermediate": return "warning";
      case "Advanced": return "error";
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

  const getEnrollmentProgress = (participants, max) => {
    return Math.round((participants / max) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Programs Management</h2>
          <p className="text-gray-600">Manage and monitor all training programs</p>
        </div>
        <Button variant="primary" className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add New Program
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
                placeholder="Search programs by title or director..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="lg:w-64">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category === "All" ? "" : category}>
                  {category}
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
              <p className="text-sm text-gray-600">Total Programs</p>
              <p className="text-2xl font-bold text-gray-900">{programs.length}</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Programs</p>
              <p className="text-2xl font-bold text-green-600">
                {programs.filter(p => p.status === "Active").length}
              </p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 font-semibold">✓</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Participants</p>
              <p className="text-2xl font-bold text-gray-900">
                {programs.reduce((sum, program) => sum + program.participants, 0)}
              </p>
            </div>
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Modules</p>
              <p className="text-2xl font-bold text-gray-900">
                {programs.reduce((sum, program) => sum + program.modules, 0)}
              </p>
            </div>
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Award className="w-4 h-4 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Programs Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Program</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Director</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Duration</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Participants</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Cost</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPrograms.map((program) => (
                <tr key={program.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{program.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge color={getDifficultyColor(program.difficulty)} size="sm">
                          {program.difficulty}
                        </Badge>
                        <span className="text-xs text-gray-600">{program.modules} modules</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-900">{program.director}</td>
                  <td className="py-4 px-4">
                    <Badge color="default">{program.category}</Badge>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="text-sm text-gray-900">{program.duration}</p>
                      <p className="text-xs text-gray-600">
                        {formatDate(program.startDate)} - {formatDate(program.endDate)}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="text-sm text-gray-900">{program.participants}/{program.maxParticipants}</p>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full" 
                          style={{ width: `${getEnrollmentProgress(program.participants, program.maxParticipants)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-600">{getEnrollmentProgress(program.participants, program.maxParticipants)}%</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Badge color={getTypeColor(program.type)}>{program.type}</Badge>
                  </td>
                  <td className="py-4 px-4">
                    <Badge color={getStatusColor(program.status)}>{program.status}</Badge>
                  </td>
                  <td className="py-4 px-4 text-gray-900 font-medium">{program.cost}</td>
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
              Showing {filteredPrograms.length} of {programs.length} programs
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

export default ProgramsTable;
