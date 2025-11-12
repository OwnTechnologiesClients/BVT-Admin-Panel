"use client";

import React, { useState } from "react";
import { PageBreadcrumb } from "@/components/common";
import { Badge, Button } from "@/components/ui";
import { Plus, Trash2, Edit, BookOpen } from "lucide-react";

export default function CourseCategoriesPage() {
  const [categories] = useState([
    {
      id: 1,
      name: "Marine Engineering",
      slug: "marine-engineering",
      description: "Courses related to marine engineering and ship systems",
      parentCategory: null,
      order: 1,
      coursesCount: 12,
      isActive: true
    },
    {
      id: 2,
      name: "Navigation",
      slug: "navigation",
      description: "Navigation systems and GPS technologies",
      parentCategory: null,
      order: 2,
      coursesCount: 8,
      isActive: true
    },
    {
      id: 3,
      name: "Maritime Safety",
      slug: "maritime-safety",
      description: "Safety protocols and emergency procedures",
      parentCategory: null,
      order: 3,
      coursesCount: 15,
      isActive: true
    },
    {
      id: 4,
      name: "Naval Operations",
      slug: "naval-operations",
      description: "Operational procedures and strategic planning",
      parentCategory: null,
      order: 4,
      coursesCount: 10,
      isActive: true
    }
  ]);

  const handleDelete = (categoryId) => {
    if (confirm("Are you sure you want to delete this category?")) {
      console.log("Delete category:", categoryId);
    }
  };

  return (
    <div className="space-y-6">
      <PageBreadcrumb 
        pageTitle="Course Categories"
        breadcrumbs={[
          { label: "Home", href: "/admin/dashboard" },
          { label: "Course Categories", href: "/admin/course-categories" }
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Course Categories</h2>
          <p className="text-gray-600">Manage course categories</p>
        </div>
        <Button
          onClick={() => window.location.href = '/admin/course-categories/add'}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Categories</p>
              <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Categories</p>
              <p className="text-2xl font-bold text-green-600">
                {categories.filter(c => c.isActive).length}
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
              <p className="text-sm text-gray-600">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900">
                {categories.reduce((sum, cat) => sum + cat.coursesCount, 0)}
              </p>
            </div>
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 font-semibold">📚</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inactive Categories</p>
              <p className="text-2xl font-bold text-red-600">
                {categories.filter(c => !c.isActive).length}
              </p>
            </div>
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-red-600 font-semibold">✗</span>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Slug</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Courses</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Order</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{category.name}</p>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-900">{category.slug}</td>
                  <td className="py-4 px-4 text-gray-900">{category.coursesCount}</td>
                  <td className="py-4 px-4 text-gray-900">{category.order}</td>
                  <td className="py-4 px-4">
                    <Badge color={category.isActive ? "success" : "error"}>
                      {category.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="text-gray-700 hover:text-gray-900">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDelete(category.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
