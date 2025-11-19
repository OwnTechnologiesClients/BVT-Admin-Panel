"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { PageBreadcrumb } from "@/components/common";
import { Badge, Button } from "@/components/ui";
import { ArrowLeft, Edit, Trash2, Users, Calendar, Award, Clock, DollarSign, Loader2 } from "lucide-react";
import * as programAPI from "@/lib/api/program";

export default function ProgramDetailsPage({ params }) {
  const router = useRouter();
  const { id } = use(params);
  const [programData, setProgramData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchProgram = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await programAPI.getProgramById(id);
        if (response.success) {
          setProgramData(response.data);
        } else {
          setError(response.message || 'Program not found');
        }
      } catch (err) {
        console.error('Error fetching program:', err);
        setError(err.message || 'Failed to fetch program');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProgram();
    }
  }, [id]);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${programData?.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeleting(true);
      const response = await programAPI.deleteProgram(id);
      if (response.success) {
        router.push('/programs');
      } else {
        alert(response.message || 'Failed to delete program');
      }
    } catch (err) {
      alert(err.message || 'Failed to delete program');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !programData) {
    return (
      <div className="space-y-6">
        <PageBreadcrumb 
          pageTitle="Program Details"
          breadcrumbs={[
            { label: "Home", href: "/admin/dashboard" },
            { label: "Programs", href: "/programs" },
            { label: "Program Details", href: `/programs/details/${id}` }
          ]}
        />
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h1 className="text-xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-red-600">{error || 'Program not found'}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => router.push('/programs')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Programs
          </Button>
        </div>
      </div>
    );
  }

  // Determine status based on dates
  let status = "Upcoming";
  if (programData.startDate && programData.endDate) {
    const now = new Date();
    const start = new Date(programData.startDate);
    const end = new Date(programData.endDate);
    if (now > end) {
      status = "Completed";
    } else if (now >= start && now <= end) {
      status = "Active";
    } else if (now < start) {
      status = "Upcoming";
    }
  }

  const startDate = programData.startDate ? new Date(programData.startDate).toISOString().split('T')[0] : 'N/A';
  const endDate = programData.endDate ? new Date(programData.endDate).toISOString().split('T')[0] : 'N/A';
  const type = programData.isOnline ? 'Online' : 'Offline';
  const cost = programData.cost === 0 || programData.cost === null ? 'Free' : `$${programData.cost}`;

  return (
    <div className="space-y-6">
      <PageBreadcrumb 
        pageTitle="Program Details"
        breadcrumbs={[
          { label: "Home", href: "/admin/dashboard" },
          { label: "Programs", href: "/programs" },
          { label: "Program Details", href: `/programs/details/${id}` }
        ]}
      />

      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={() => router.push('/programs')}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Programs
        </Button>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => router.push(`/programs/update/${id}`)}
          >
            <Edit className="w-4 h-4" />
            Edit Program
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center gap-2 text-red-600 hover:text-red-700"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Delete Program
          </Button>
        </div>
      </div>

      {/* Program Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{programData.title}</h1>
            <p className="text-gray-600 mt-2">{programData.description || 'No description available'}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge color="default">{programData.category?.name || programData.category || 'N/A'}</Badge>
            <Badge color={status === "Active" ? "success" : status === "Upcoming" ? "info" : "default"}>
              {status}
            </Badge>
            <Badge color="info">{type}</Badge>
            <Badge color="warning">{programData.difficulty || 'N/A'}</Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {programData.maxParticipants && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {programData.participants || 0}/{programData.maxParticipants} participants
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{programData.duration || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{startDate} - {endDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600 font-medium">{cost}</span>
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
            {programData.programDirector && (
              <div>
                <label className="text-sm font-medium text-gray-700">Program Director</label>
                <p className="text-gray-900">{programData.programDirector}</p>
              </div>
            )}
            {programData.maxParticipants && (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-700">Capacity</label>
                  <p className="text-gray-900">{programData.maxParticipants} participants</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Current Enrollment</label>
                  <p className="text-gray-900">{programData.participants || 0} participants</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ 
                        width: `${Math.min(((programData.participants || 0) / programData.maxParticipants) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Certifications */}
        {programData.certifications && programData.certifications.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Certifications</h3>
            <div className="space-y-2">
              {Array.isArray(programData.certifications) ? (
                programData.certifications.map((cert, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-yellow-600" />
                    <span className="text-gray-900">{cert}</span>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-yellow-600" />
                  <span className="text-gray-900">{programData.certifications}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Prerequisites */}
      {programData.prerequisites && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Prerequisites</h3>
          <div className="text-gray-900 whitespace-pre-line">{programData.prerequisites}</div>
        </div>
      )}

      {/* Program Modules */}
      {programData.modules && programData.modules.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Program Modules</h3>
          <div className="space-y-4">
            {programData.modules.map((module, index) => (
              <div key={module._id || index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Module {index + 1}: {module.title}
                    </h4>
                    {module.description && (
                      <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    {module.duration && (
                      <p className="text-sm text-gray-600">{module.duration}</p>
                    )}
                    {module.lessons && (
                      <p className="text-sm text-gray-600">{module.lessons.length} lessons</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {programData.skills && programData.skills.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills Developed</h3>
          <div className="flex flex-wrap gap-2">
            {programData.skills.map((skill, index) => (
              <Badge key={index} color="info">{skill}</Badge>
            ))}
          </div>
        </div>
      )}

      {/* Graduation Requirements */}
      {programData.graduationRequirements && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Graduation Requirements</h3>
          <div className="text-gray-900 whitespace-pre-line">{programData.graduationRequirements}</div>
        </div>
      )}
    </div>
  );
}
