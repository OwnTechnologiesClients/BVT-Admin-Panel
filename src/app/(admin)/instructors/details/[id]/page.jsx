"use client";

import React, { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageBreadcrumb } from "@/components/common";
import { Badge, Button } from "@/components/ui";
import { ArrowLeft, Edit, Trash2, Mail, Phone, MapPin, Calendar, Award, BookOpen, Loader2 } from "lucide-react";
import * as instructorAPI from "@/lib/api/instructor";

export default function InstructorDetailsPage({ params }) {
  const router = useRouter();
  const { id } = use(params);
  const [instructorData, setInstructorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInstructor = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const response = await instructorAPI.getInstructorById(id);
        
        if (response.success) {
          // Handle different response structures
          const instructor = response.data?.instructor || response.data?.data || response.data;
          
          if (!instructor) {
            setError("Instructor data not found in response");
            setLoading(false);
            return;
          }
          
          // Log for debugging
          console.log("Instructor data received:", instructor);
          
          // Flatten the data structure if userId is populated
          // The backend returns instructor with populated userId
          const flattenedData = {
            ...instructor,
            // User fields might be in userId object
            firstName: instructor.firstName || instructor.userId?.firstName || '',
            lastName: instructor.lastName || instructor.userId?.lastName || '',
            email: instructor.email || instructor.userId?.email || '',
            phone: instructor.phone || instructor.userId?.phone || '',
            profilePic: instructor.profilePic || instructor.userId?.profilePic || instructor.image || '',
            // Keep userId for reference
            userId: instructor.userId
          };
          
          setInstructorData(flattenedData);
        } else {
          setError(response.message || "Failed to fetch instructor");
        }
      } catch (err) {
        setError(err.message || "An error occurred while fetching instructor");
        console.error("Error fetching instructor:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructor();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageBreadcrumb 
          pageTitle="Loading..."
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Instructors", href: "/instructors" },
            { label: "Loading" }
          ]}
        />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
            <p className="mt-4 text-sm text-gray-600">Loading instructor details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !instructorData) {
    return (
      <div className="space-y-6">
        <PageBreadcrumb 
          pageTitle="Instructor Not Found"
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Instructors", href: "/instructors" },
            { label: "Not Found" }
          ]}
        />
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h1 className="text-xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-red-600">{error || "Instructor not found"}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => router.push('/instructors')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Instructors
          </Button>
        </div>
      </div>
    );
  }

  // Helper to get image URL - handle both relative and absolute URLs
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/images/user-placeholder.jpg";
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    // If it's a relative path, construct the full URL
    if (imagePath.startsWith("/uploads") || imagePath.startsWith("/images")) {
      return process.env.NEXT_PUBLIC_API_URL 
        ? `${process.env.NEXT_PUBLIC_API_URL}${imagePath}`
        : `http://localhost:5000${imagePath}`;
    }
    return imagePath;
  };

  const fullName = instructorData.firstName && instructorData.lastName
    ? `${instructorData.firstName} ${instructorData.lastName}`
    : instructorData.fullName || instructorData.name || "N/A";

  return (
    <div className="space-y-6">
      <PageBreadcrumb 
        pageTitle={`Instructor: ${fullName}`}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Instructors", href: "/instructors" },
          { label: fullName }
        ]}
      />

      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={() => router.push('/instructors')}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Instructors
        </Button>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => router.push(`/instructors/update/${id}`)}
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
              src={getImageUrl(instructorData.profilePic || instructorData.image || instructorData.userId?.profilePic)} 
              alt={fullName}
              className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
              onError={(e) => {
                e.target.src = "/images/user-placeholder.jpg";
              }}
            />
          </div>

          {/* Instructor Info */}
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{fullName}</h1>
              <p className="text-gray-600">
                {instructorData.navalRank || instructorData.rank || ""} 
                {instructorData.department && ` • ${instructorData.department}`} 
                {instructorData.experience && ` • ${instructorData.experience}`}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge color={instructorData.isActive !== false ? "success" : "warning"}>
                {instructorData.isActive !== false ? "Active" : "Inactive"}
              </Badge>
              {instructorData.emailVerified && (
                <Badge color="success">Email Verified</Badge>
              )}
              {instructorData.phoneVerified && (
                <Badge color="success">Phone Verified</Badge>
              )}
              {instructorData.department && (
                <Badge color="info">{instructorData.department}</Badge>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(instructorData.email || instructorData.userId?.email) && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{instructorData.email || instructorData.userId?.email}</span>
                </div>
              )}
              {(instructorData.phone || instructorData.userId?.phone) && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{instructorData.phone || instructorData.userId?.phone}</span>
                </div>
              )}
              {instructorData.location && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{instructorData.location}</span>
                </div>
              )}
              {instructorData.createdAt && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(instructorData.createdAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Instructor Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        {/* <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Date of Birth</label>
              <p className="text-gray-900">
                {instructorData.dob ? new Date(instructorData.dob).toLocaleDateString() : instructorData.userId?.dob ? new Date(instructorData.userId.dob).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Gender</label>
              <p className="text-gray-900">{instructorData.gender || instructorData.userId?.gender || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Marital Status</label>
              <p className="text-gray-900">{instructorData.maritalStatus || instructorData.userId?.maritalStatus || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Aadhar Number</label>
              <p className="text-gray-900">{instructorData.aadharNo || instructorData.userId?.aadharNo || 'N/A'}</p>
            </div>
          </div>
        </div> */}

        {/* Contact Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Primary Phone</label>
              <p className="text-gray-900">{instructorData.phone || instructorData.userId?.phone || 'N/A'}</p>
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
                {instructorData.specializations && Array.isArray(instructorData.specializations) ? (
                  instructorData.specializations.map((spec, index) => (
                    <Badge key={index} color="info">{typeof spec === 'string' ? spec : spec.name || spec.title || spec}</Badge>
                  ))
                ) : instructorData.specializations ? (
                  <Badge color="info">{instructorData.specializations}</Badge>
                ) : (
                  <span className="text-gray-500 text-sm">No specializations</span>
                )}
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
                {instructorData.certifications && Array.isArray(instructorData.certifications) && instructorData.certifications.length > 0 ? (
                  instructorData.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-yellow-600" />
                      <span className="text-gray-900">{typeof cert === 'string' ? cert : cert.name || cert.title || cert}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">No certifications</span>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Achievements</label>
              <div className="space-y-2 mt-1">
                {instructorData.achievements && Array.isArray(instructorData.achievements) && instructorData.achievements.length > 0 ? (
                  instructorData.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <span className="text-gray-900">{typeof achievement === 'string' ? achievement : achievement.title || achievement.name || achievement}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">No achievements</span>
                )}
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
            <div className="text-2xl font-bold text-blue-600">{instructorData.coursesTaught || 0}</div>
            <div className="text-sm text-gray-600">Courses Taught</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{instructorData.studentsEnrolled || 0}</div>
            <div className="text-sm text-gray-600">Students Enrolled</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{instructorData.rating || "N/A"}</div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {(instructorData.certifications && Array.isArray(instructorData.certifications)) 
                ? instructorData.certifications.length 
                : 0}
            </div>
            <div className="text-sm text-gray-600">Certifications</div>
          </div>
        </div>
      </div>
    </div>
  );
}
