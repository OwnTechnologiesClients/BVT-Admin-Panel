"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Badge, Button } from "@/components/ui";
import DataTable from "@/components/common/DataTable";
import * as courseAPI from "@/lib/api/course";
import * as enrollmentAPI from "@/lib/api/enrollment";
import * as certificateAPI from "@/lib/api/certificate";
import { showError } from "@/lib/utils/sweetalert";
import CertificateModal from "./CertificateModal";
import { CheckCircle, Clock, Eye } from "lucide-react";

const CertificatesTable = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedCourseData, setSelectedCourseData] = useState(null);

  // Fetch all courses for the dropdown
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await courseAPI.getAllCourses({ status: 'active', limit: 1000 });
        if (response.success && response.data) {
          setCourses(response.data);
        }
      } catch (err) {
        console.error("Error fetching courses:", err);
        showError("Failed to load courses");
      }
    };
    fetchCourses();
  }, []);

  // Fetch enrollments when a course is selected
  useEffect(() => {
    const fetchEnrollments = async () => {
      if (!selectedCourseId) {
        setEnrollments([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await certificateAPI.getEligibleStudents({ courseId: selectedCourseId });
        if (response.success && response.data) {
          setEnrollments(response.data || []);
          // Get course data from the first enrollment or find it
          if (response.data.length > 0) {
            setSelectedCourseData(response.data[0].courseId);
          } else {
             setSelectedCourseData(courses.find(c => c._id === selectedCourseId || c.id === selectedCourseId));
          }
        }
      } catch (err) {
        console.error("Error fetching enrollments:", err);
        setError("Failed to fetch enrollments for this course");
        showError("Error", "Failed to fetch enrollments for this course");
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, [selectedCourseId, courses]);

  // Format data for the table
  const formattedData = enrollments.map((enrollment) => {
    const student = enrollment.studentId || {};
    const progress = enrollment.progress || 0;
    
    // Check if the student has passed at least one test
    const hasPassedExam = enrollment.testsCompleted && 
                          enrollment.testsCompleted.length > 0 && 
                          enrollment.testsCompleted.some(t => t.passed === true);
    
    // Eligibility criteria: 100% progress AND passed an exam
    const isEligible = progress >= 100 && hasPassedExam;

    return {
      id: enrollment._id,
      studentId: student._id,
      studentName: student.fullName || "Unknown Student",
      email: student.email || "N/A",
      progress: progress,
      examStatus: hasPassedExam ? "Passed" : "Not Passed",
      isEligible: isEligible,
      certificate: enrollment.certificate || null,
      originalEnrollment: enrollment,
    };
  });

  const columns = [
    {
      key: "studentName",
      label: "Student Name",
      render: (value, item) => (
        <div>
          <p className="font-medium text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{item.email}</p>
        </div>
      )
    },
    {
      key: "progress",
      label: "Course Progress",
      render: (value) => (
        <div className="flex items-center">
          <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 max-w-[100px]">
            <div 
              className={`h-2.5 rounded-full ${value >= 100 ? 'bg-green-600' : 'bg-blue-600'}`} 
              style={{ width: `${Math.min(value, 100)}%` }}
            ></div>
          </div>
          <span className="text-sm font-medium text-gray-700">{value}%</span>
        </div>
      )
    },
    {
      key: "examStatus",
      label: "Exam Status",
      render: (value) => (
        <Badge color={value === "Passed" ? "success" : "warning"}>
          {value}
        </Badge>
      )
    },
    {
      key: "certificate",
      label: "Issuance",
      render: (cert) => (
        cert ? (
          <div className="flex flex-col">
            <Badge color="success" className="w-fit flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Issued
            </Badge>
            <span className="text-[10px] text-gray-400 mt-1 whitespace-nowrap">
              {new Date(cert.issuedAt).toLocaleDateString()}
            </span>
          </div>
        ) : (
          <Badge color="gray" className="w-fit flex items-center gap-1">
             <Clock className="w-3 h-3" /> Pending
          </Badge>
        )
      )
    },
    {
      key: "viewer",
      label: "Certificate",
      render: (_, item) => (
        item.certificate ? (
          <a 
            href={item.certificate.certificateUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm bg-blue-50 px-3 py-1.5 rounded-lg transition-colors w-fit"
          >
            <Eye className="w-4 h-4" /> View
          </a>
        ) : (
          <span className="text-gray-400 text-sm italic">Not issued</span>
        )
      )
    },
    {
      key: "actions",
      label: "Action",
      render: (_, item) => (
        <div className="flex items-center gap-2">
          <Button 
            variant={item.certificate ? "outline" : "primary"}
            size="sm"
            disabled={!item.isEligible}
            title={!item.isEligible ? "Student must have 100% progress and passed exam to receive a certificate." : ""}
            onClick={() => {
              setSelectedStudent({
                id: item.studentId,
                fullName: item.studentName,
                email: item.email
              });
              setIsModalOpen(true);
            }}
          >
            {item.certificate ? "Reissue" : "Issue Certificate"}
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Course Selector */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <label htmlFor="course-select" className="block text-sm font-medium text-gray-700 mb-2">
          Select Course to Issue Certificates
        </label>
        <select
          id="course-select"
          className="w-full md:w-1/2 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
        >
          <option value="">-- Select a Course --</option>
          {courses.map((course) => (
            <option key={course._id || course.id} value={course._id || course.id}>
              {course.title}
            </option>
          ))}
        </select>
      </div>

      {/* Data Table */}
      {selectedCourseId && (
        <DataTable
          title="Course Students"
          description="View all enrolled students. Certificates can only be issued to those who have met all requirements (100% Progress + Passed Exam)."
          data={formattedData}
          columns={columns}
          searchPlaceholder="Search students by name or email..."
        />
      )}

      {/* Certificate Modal */}
      {isModalOpen && selectedStudent && selectedCourseData && (
        <CertificateModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            // Re-fetch data to show updated "Issued" status
            const fetchEnrollments = async () => {
              setLoading(true);
              try {
                const response = await certificateAPI.getEligibleStudents({ courseId: selectedCourseId });
                if (response.success && response.data) {
                  setEnrollments(response.data || []);
                }
              } catch (err) {
                console.error("Refresh error:", err);
              } finally {
                setLoading(false);
              }
            };
            fetchEnrollments();
          }}
          student={selectedStudent}
          course={selectedCourseData}
        />
      )}
    </div>
  );
};

export default CertificatesTable;
