"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { PageBreadcrumb } from "@/components/common";
import { Badge, Button } from "@/components/ui";
import { ArrowLeft, Edit, Trash2, Mail, Phone, MapPin, Calendar, Award, BookOpen } from "lucide-react";

export default function InstructorDetailsPage({ params }) {
  const router = useRouter();
  const { id } = params;

  // In a real app, you would fetch the instructor data by ID
  const instructorData = {
    id: 1,
    firstName: "Sarah",
    lastName: "Johnson",
    fullName: "Sarah Johnson",
    email: "sarah.johnson@navy.mil",
    phone: "+1 (555) 123-4567",
    altPhone: "+1 (555) 987-6543",
    profilePic: "/images/user-placeholder.jpg",
    gender: "Female",
    dob: "1985-03-15",
    maritalStatus: "Single",
    aadharNo: "1234-5678-9012",
    presentAddress: "123 Naval Base Road, Norfolk, VA 23501",
    permanentAddress: "456 Oak Street, Norfolk, VA 23501",
    navalRank: "Commander",
    experience: "8 years",
    location: "Norfolk, VA",
    department: "Navigation",
    status: "Active",
    lastLogin: "2024-01-20T10:30:00Z",
    emailVerified: true,
    phoneVerified: true,
    createdAt: "2020-01-15",
    coursesTaught: 15,
    studentsEnrolled: 245,
    rating: 4.8,
    certifications: [
      "Advanced Navigation Certificate",
      "GPS Systems Mastery",
      "Leadership Development Badge"
    ],
    achievements: [
      "Top Instructor 2023",
      "Excellence in Teaching Award",
      "Student Satisfaction 95%+"
    ],
    specializations: [
      "Navigation Systems",
      "GPS Technology",
      "Maritime Navigation"
    ]
  };

  return (
    <div className="space-y-6">
      <PageBreadcrumb 
        pageTitle="Instructor Details"
        breadcrumbs={[
          { label: "Home", href: "/admin/dashboard" },
          { label: "Instructors", href: "/admin/instructors" },
          { label: "Instructor Details", href: `/admin/instructors/details/${id}` }
        ]}
      />

      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={() => router.push('/admin/instructors')}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Instructors
        </Button>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => router.push(`/admin/instructors/update/${id}`)}
          >
            <Edit className="w-4 h-4" />
            Edit Instructor
          </Button>
          <Button variant="outline" className="flex items-center gap-2 text-red-600 hover:text-red-700">
            <Trash2 className="w-4 h-4" />
            Delete Instructor
          </Button>
        </div>
      </div>

      {/* Instructor Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start gap-6">
          {/* Profile Picture */}
          <div className="flex-shrink-0">
            <img 
              src={instructorData.profilePic} 
              alt={instructorData.fullName}
              className="w-24 h-24 rounded-full object-cover"
            />
          </div>

          {/* Instructor Info */}
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{instructorData.fullName}</h1>
              <p className="text-gray-600">{instructorData.navalRank} • {instructorData.department} • {instructorData.experience}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge color={instructorData.status === "Active" ? "success" : "warning"}>
                {instructorData.status}
              </Badge>
              {instructorData.emailVerified && (
                <Badge color="success">Email Verified</Badge>
              )}
              {instructorData.phoneVerified && (
                <Badge color="success">Phone Verified</Badge>
              )}
              <Badge color="info">{instructorData.department}</Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">{instructorData.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">{instructorData.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">{instructorData.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Joined {new Date(instructorData.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Instructor Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Date of Birth</label>
              <p className="text-gray-900">{new Date(instructorData.dob).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Gender</label>
              <p className="text-gray-900">{instructorData.gender}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Marital Status</label>
              <p className="text-gray-900">{instructorData.maritalStatus}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Aadhar Number</label>
              <p className="text-gray-900">{instructorData.aadharNo}</p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Primary Phone</label>
              <p className="text-gray-900">{instructorData.phone}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Alternate Phone</label>
              <p className="text-gray-900">{instructorData.altPhone}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Present Address</label>
              <p className="text-gray-900">{instructorData.presentAddress}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Permanent Address</label>
              <p className="text-gray-900">{instructorData.permanentAddress}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department & Specializations */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Department & Specializations</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Department</label>
              <div className="flex flex-wrap gap-2 mt-1">
                <Badge color="info">{instructorData.department}</Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Specializations</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {instructorData.specializations.map((spec, index) => (
                  <Badge key={index} color="info">{spec}</Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Achievements & Certifications */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievements & Certifications</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Certifications</label>
              <div className="space-y-2 mt-1">
                {instructorData.certifications.map((cert, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-yellow-600" />
                    <span className="text-gray-900">{cert}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Achievements</label>
              <div className="space-y-2 mt-1">
                {instructorData.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-900">{achievement}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Teaching Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Teaching Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{instructorData.coursesTaught}</div>
            <div className="text-sm text-gray-600">Courses Taught</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{instructorData.studentsEnrolled}</div>
            <div className="text-sm text-gray-600">Students Enrolled</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{instructorData.rating}</div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{instructorData.certifications.length}</div>
            <div className="text-sm text-gray-600">Certifications</div>
          </div>
        </div>
      </div>
    </div>
  );
}
