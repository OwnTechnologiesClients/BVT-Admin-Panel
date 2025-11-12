"use client";

import React from "react";
import { PageBreadcrumb } from "@/components/common";
import { Badge, Button } from "@/components/ui";
import { ArrowLeft, Edit, Trash2, Users, Calendar, Award, Clock, DollarSign } from "lucide-react";

export default function ProgramDetailsPage({ params }) {
  const { id } = params;

  // In a real app, you would fetch the program data by ID
  const programData = {
    id: id,
    title: "Naval Officer Development Program",
    description: "Comprehensive 12-month program designed to develop leadership skills, technical expertise, and strategic thinking capabilities for naval officers.",
    category: "Leadership Development",
    director: "Captain Sarah Williams",
    duration: "12 months",
    startDate: "2024-01-15",
    endDate: "2024-12-15",
    participants: 25,
    maxParticipants: 30,
    status: "Active",
    type: "Residential",
    cost: 15000,
    difficulty: "Advanced",
    modules: [
      {
        id: 1,
        title: "Leadership Fundamentals",
        description: "Core leadership principles and practices",
        duration: "6 weeks",
        lessonsCount: 18
      },
      {
        id: 2,
        title: "Strategic Planning",
        description: "Strategic thinking and planning methodologies",
        duration: "4 weeks",
        lessonsCount: 12
      },
      {
        id: 3,
        title: "Technical Excellence",
        description: "Advanced technical skills and knowledge",
        duration: "8 weeks",
        lessonsCount: 24
      }
    ],
    certifications: [
      "Naval Leadership Certificate",
      "Strategic Planning Certification",
      "Technical Excellence Badge"
    ],
    graduationRequirements: [
      "Complete all modules with 80% or higher",
      "Pass final comprehensive exam",
      "Complete capstone project",
      "Attend all mandatory sessions"
    ]
  };

  return (
    <div className="space-y-6">
      <PageBreadcrumb 
        pageTitle="Program Details"
        breadcrumbs={[
          { label: "Home", href: "/admin/dashboard" },
          { label: "Programs", href: "/admin/programs" },
          { label: "Program Details", href: `/admin/programs/details/${id}` }
        ]}
      />

      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Button variant="outline" className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Programs
        </Button>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Edit Program
          </Button>
          <Button variant="outline" className="flex items-center gap-2 text-red-600 hover:text-red-700">
            <Trash2 className="w-4 h-4" />
            Delete Program
          </Button>
        </div>
      </div>

      {/* Program Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{programData.title}</h1>
            <p className="text-gray-600 mt-2">{programData.description}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge color="default">{programData.category}</Badge>
            <Badge color={programData.status === "Active" ? "success" : "warning"}>
              {programData.status}
            </Badge>
            <Badge color="info">{programData.type}</Badge>
            <Badge color="warning">{programData.difficulty}</Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{programData.participants}/{programData.maxParticipants} participants</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{programData.duration}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{programData.startDate} - {programData.endDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">${programData.cost}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Program Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Program Information</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Program Director</label>
              <p className="text-gray-900">{programData.director}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Capacity</label>
              <p className="text-gray-900">{programData.maxParticipants} participants</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Current Enrollment</label>
              <p className="text-gray-900">{programData.participants} participants</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${(programData.participants / programData.maxParticipants) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Certifications */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Certifications</h3>
          <div className="space-y-2">
            {programData.certifications.map((cert, index) => (
              <div key={index} className="flex items-center gap-2">
                <Award className="w-4 h-4 text-yellow-600" />
                <span className="text-gray-900">{cert}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Program Modules */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Program Modules</h3>
        <div className="space-y-4">
          {programData.modules.map((module) => (
            <div key={module.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Module {module.id}: {module.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{module.duration}</p>
                  <p className="text-sm text-gray-600">{module.lessonsCount} lessons</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Graduation Requirements */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Graduation Requirements</h3>
        <ul className="space-y-2">
          {programData.graduationRequirements.map((requirement, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span className="text-gray-900">{requirement}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
