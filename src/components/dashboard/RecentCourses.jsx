"use client";

import React from "react";
import { Badge, Button } from "@/components/ui";
import { Eye, Edit, Trash2 } from "lucide-react";

export const RecentCourses = () => {
  const courses = [
    {
      id: 1,
      title: "Advanced Naval Engineering Workshop",
      instructor: "Commander James Rodriguez",
      students: 15,
      status: "Active",
      type: "Offline",
      duration: "5 days",
      price: "$2,500",
    },
    {
      id: 2,
      title: "Maritime Security Operations",
      instructor: "Captain Michael Thompson",
      students: 12,
      status: "Active",
      type: "Offline",
      duration: "3 days",
      price: "$1,800",
    },
    {
      id: 3,
      title: "Submarine Operations Masterclass",
      instructor: "Commander Lisa Chen",
      students: 8,
      status: "Active",
      type: "Offline",
      duration: "7 days",
      price: "$3,200",
    },
    {
      id: 4,
      title: "Marine Engineering Fundamentals",
      instructor: "Commander Sarah Johnson",
      students: 150,
      status: "Active",
      type: "Online",
      duration: "8 weeks",
      price: "$800",
    },
    {
      id: 5,
      title: "Naval Architecture Principles",
      instructor: "Captain David Wilson",
      students: 25,
      status: "Draft",
      type: "Online",
      duration: "6 weeks",
      price: "$1,200",
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Recent Courses
        </h3>
        <Button variant="primary" size="sm">
          Add New Course
        </Button>
      </div>
      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Course
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Instructor
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Students
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Type
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Price
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id} className="border-b border-gray-100">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        {course.title}
                      </p>
                      <p className="text-sm text-gray-700">
                        {course.duration}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-900">
                    {course.instructor}
                  </td>
                  <td className="py-3 px-4 text-gray-900">
                    {course.students}
                  </td>
                  <td className="py-3 px-4 text-gray-900">
                    {course.type}
                  </td>
                  <td className="py-3 px-4 text-gray-900">
                    <Badge color={course.status === 'Active' ? 'success' : 'warning'}>
                      {course.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-gray-900">
                    {course.price}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="text-gray-700 hover:text-gray-900">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-gray-700 hover:text-gray-900">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-gray-700 hover:text-gray-900">
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
};
