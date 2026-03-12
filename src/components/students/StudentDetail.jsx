"use client";

import React, { useMemo, useState, useEffect } from "react";
import { FileText, Download, ExternalLink, Award } from "lucide-react";
import { ComponentCard } from "@/components/common/ComponentCard";
import { Badge, Button } from "@/components/ui";
import { getAllCourses } from "@/lib/api/course";
import { getStudentEnrollments, createEnrollment, deleteEnrollment } from "@/lib/api/enrollment";
import { showSuccess, showError, showDeleteConfirm } from "@/lib/utils/sweetalert";
import CertificateModal from "@/components/certificates/CertificateModal";

const InfoRow = ({ label, value }) => (
  <div>
    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
      {label}
    </p>
    <p className="text-sm font-semibold text-gray-900">{value || "—"}</p>
  </div>
);

const courseStatusColors = {
  "In Progress": "info",
  Completed: "success",
  Upcoming: "warning",
  Draft: "default",
};

const StudentDetail = ({ student }) => {
  const [activeTab, setActiveTab] = useState("info");
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [enrollmentDate, setEnrollmentDate] = useState("");
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [certCourse, setCertCourse] = useState(null);

  // Helper to get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    // If it's already a full URL (S3 or other), return as is
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    // If it's a data URL (base64), return as is
    if (imagePath.startsWith("data:image")) {
      return imagePath;
    }
    // Otherwise, construct URL using API base URL (for local files)
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${apiBaseUrl}${imagePath.startsWith('/') ? imagePath : '/' + imagePath}`;
  };

  const imageUrl = getImageUrl(student?.image || student?.profilePic);

  // Fetch student enrollments from API
  useEffect(() => {
    const fetchEnrollments = async () => {
      if (!student?._id) return;

      try {
        setLoadingEnrollments(true);
        setError(null);
        const response = await getStudentEnrollments(student._id);

        if (response.success) {
          const enrollmentsList = response.data?.enrollments || [];
          setEnrollments(enrollmentsList);

          // Transform enrollments to course format for display
          const coursesList = enrollmentsList.map((enrollment) => {
            const course = enrollment.courseId;

            // Helper to check if a value is an ObjectId (24 char hex string)
            const isObjectId = (val) => {
              if (typeof val !== 'string') return false;
              return /^[0-9a-fA-F]{24}$/.test(val);
            };

            // Get category name - avoid showing ObjectIds
            let categoryName = 'General';
            if (course.category) {
              if (typeof course.category === 'string') {
                categoryName = isObjectId(course.category) ? 'General' : course.category;
              } else if (typeof course.category === 'object' && course.category.name) {
                categoryName = course.category.name;
              }
            }

            // Get instructor name - avoid showing ObjectIds
            let instructorName = 'TBA';
            if (course.instructor) {
              if (typeof course.instructor === 'string') {
                instructorName = isObjectId(course.instructor) ? 'TBA' : course.instructor;
              } else if (typeof course.instructor === 'object') {
                if (course.instructor.userId?.firstName && course.instructor.userId?.lastName) {
                  instructorName = `${course.instructor.userId.firstName} ${course.instructor.userId.lastName}`;
                } else if (course.instructor.userId?.email) {
                  instructorName = course.instructor.userId.email;
                } else if (course.instructor.name) {
                  instructorName = course.instructor.name;
                }
              }
            }

            return {
              _id: enrollment._id,
              enrollmentId: enrollment._id,
              id: course._id || course.id,
              courseId: course._id || course.id,
              slug: course.slug, // Include slug for URL navigation
              title: course.title || course.name,
              category: categoryName,
              instructor: instructorName,
              enrollmentDate: new Date(enrollment.enrolledAt).toISOString().slice(0, 10),
              status: enrollment.status === 'active' ? 'In Progress' : enrollment.status === 'completed' ? 'Completed' : enrollment.status,
              progress: enrollment.progress || 0,
              completedAt: enrollment.completedAt
            };
          });
          setCourses(coursesList);
        } else {
          setError(response.message || "Failed to fetch enrollments");
        }
      } catch (err) {
        setError(err.message || "An error occurred while fetching enrollments");
      } finally {
        setLoadingEnrollments(false);
      }
    };

    fetchEnrollments();
  }, [student?._id]);

  // Fetch available courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoadingCourses(true);
        const response = await getAllCourses({ limit: 1000 }); // Get all courses

        if (response.success) {
          // Handle different response structures
          const coursesList = response.data?.courses || response.data || [];
          setAvailableCourses(coursesList);
        }
      } catch (err) {
        // Error fetching courses
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, []);

  const remainingCourses = useMemo(() => {
    const existingIds = new Set(courses.map((course) => course._id || course.id));
    return availableCourses.filter((course) => !existingIds.has(course._id || course.id));
  }, [courses, availableCourses]);

  const handleAddCourse = async (event) => {
    event.preventDefault();
    if (!selectedCourseId || !student?._id) return;

    try {
      setError(null);
      setLoadingCourses(true);

      const response = await createEnrollment({
        studentId: student._id,
        courseId: selectedCourseId,
        status: 'active',
        notes: enrollmentDate ? `Enrolled on ${enrollmentDate}` : undefined
      });

      if (response.success) {
        const enrollment = response.data?.enrollment;
        const course = enrollment.courseId;

        // Add to local state
        const newEnrollment = {
          _id: enrollment._id,
          enrollmentId: enrollment._id,
          id: course._id || course.id,
          courseId: course._id || course.id,
          title: course.title || course.name,
          category: typeof course.category === 'object' ? course.category?.name : course.category || 'General',
          instructor: typeof course.instructor === 'object'
            ? (course.instructor?.userId?.firstName && course.instructor?.userId?.lastName
              ? `${course.instructor.userId.firstName} ${course.instructor.userId.lastName}`
              : course.instructor?.userId?.email || 'TBA')
            : course.instructor || 'TBA',
          enrollmentDate: new Date(enrollment.enrolledAt).toISOString().slice(0, 10),
          status: enrollment.status === 'active' ? 'In Progress' : enrollment.status,
          progress: enrollment.progress || 0,
        };

        setCourses((prev) => [...prev, newEnrollment]);
        setEnrollments((prev) => [...prev, enrollment]);
        setSelectedCourseId("");
        setEnrollmentDate("");
        setShowAddCourse(false);
      } else {
        setError(response.message || "Failed to enroll student in course");
      }
    } catch (err) {
      setError(err.message || "An error occurred while enrolling student");
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleRemoveCourse = async (enrollmentId) => {
    const result = await showDeleteConfirm(
      'Unenroll Student?',
      'Are you sure you want to unenroll this student from the course?'
    );

    if (result.isConfirmed) {
      try {
        setError(null);
        setLoadingCourses(true);

        const response = await deleteEnrollment(enrollmentId);

        if (response.success) {
          showSuccess('Student Unenrolled!', 'The student has been unenrolled from the course successfully.');
          // Remove from local state
          setCourses((prev) => prev.filter((c) => c.enrollmentId !== enrollmentId));
          setEnrollments((prev) => prev.filter((e) => e._id !== enrollmentId));
        } else {
          const errorMsg = response.message || "Failed to unenroll student";
          setError(errorMsg);
          showError('Error', errorMsg);
        }
      } catch (err) {
        const errorMsg = err.message || "An error occurred while unenrolling student";
        setError(errorMsg);
        showError('Error', errorMsg);
      } finally {
        setLoadingCourses(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <ComponentCard title="Student Overview">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            {imageUrl && !imageError ? (
              <img
                src={imageUrl}
                alt={student.fullName}
                className="h-16 w-16 rounded-full object-cover border-2 border-gray-200 shadow-lg"
                onError={() => {
                  setImageError(true);
                }}
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-600 to-indigo-500 text-white shadow-lg flex items-center justify-center text-lg font-semibold">
                {student.fullName
                  .split(" ")
                  .slice(0, 2)
                  .map((name) => name.charAt(0))
                  .join("")}
              </div>
            )}
            <div>
              <p className="text-lg font-semibold text-gray-900">
                {student.fullName}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Badge color="info">
              Enrolled Courses: <span className="ml-1">{courses.length}</span>
            </Badge>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab("info")}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${activeTab === "info"
              ? "bg-blue-100 text-blue-600"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            Student Info
          </button>
          <button
            onClick={() => setActiveTab("courses")}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${activeTab === "courses"
              ? "bg-blue-100 text-blue-600"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            Courses & Progress
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${activeTab === "payments"
              ? "bg-blue-100 text-blue-600"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            Payment History
          </button>
        </div>
      </ComponentCard>

      {activeTab === "info" && (
        <ComponentCard title="Personal & Contact">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <InfoRow label="Email" value={student.email} />
            <InfoRow label="Phone" value={student.phone} />
            <InfoRow label="Age" value={student.age} />
            <InfoRow label="Gender" value={student.gender} />
            <InfoRow label="Date of Birth" value={student.dob} />
          </div>

          {(student.address || student.emergencyContact) && (
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              {student.address && (
                <ComponentCard title="Address" className="bg-gray-50">
                  <p className="text-sm text-gray-700">
                    {student.address.street || ""}
                    {student.address.street && <br />}
                    {[student.address.city, student.address.state]
                      .filter(Boolean)
                      .join(", ")}{" "}
                    {student.address.postalCode || ""}
                    {(student.address.city || student.address.state || student.address.postalCode) && <br />}
                    {student.address.country || ""}
                  </p>
                </ComponentCard>
              )}
              {student.emergencyContact && (
                <ComponentCard title="Emergency Contact" className="bg-gray-50">
                  <p className="text-sm text-gray-700">
                    {student.emergencyContact.name || "N/A"}
                    {student.emergencyContact.name && <br />}
                    {student.emergencyContact.relation && (
                      <>Relation: {student.emergencyContact.relation}<br /></>
                    )}
                    {student.emergencyContact.phone || ""}
                  </p>
                </ComponentCard>
              )}
            </div>
          )}

          {student.documents && student.documents.length > 0 && (
            <ComponentCard title="Documents" className="mt-6">
              <div className="space-y-3">
                {student.documents.map((doc, index) => (
                  <div
                    key={doc._id || doc.id || index}
                    className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {doc.type}
                      </p>
                      <p className="text-xs text-gray-500">{doc.fileName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        color={
                          doc.status === "Verified" ? "success" : "warning"
                        }
                      >
                        {doc.status || "Pending"}
                      </Badge>
                      {doc.uploadedAt && (
                        <p className="text-xs text-gray-400">
                          Uploaded{" "}
                          {new Date(doc.uploadedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ComponentCard>
          )}

          {student.notes && (
            <ComponentCard title="Notes" className="mt-6 bg-gray-50">
              <p className="text-sm text-gray-700">{student.notes}</p>
            </ComponentCard>
          )}
        </ComponentCard>
      )}

      {activeTab === "courses" && (
        <ComponentCard title="Course Progress" className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-600">
              Manage the student's enrollments and track progress.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddCourse((prev) => !prev)}
              disabled={loadingEnrollments || loadingCourses}
            >
              {showAddCourse ? "Cancel" : "Add Course"}
            </Button>
          </div>

          {showAddCourse && (
            <form
              onSubmit={handleAddCourse}
              className="rounded-2xl border border-blue-200 bg-blue-50 p-4"
            >
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                    Course
                  </label>
                  <select
                    value={selectedCourseId}
                    onChange={(event) => setSelectedCourseId(event.target.value)}
                    className="mt-1 w-full rounded-xl border border-blue-200 px-3 py-2 text-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    required
                    disabled={loadingCourses}
                  >
                    <option value="">
                      {loadingCourses ? "Loading courses..." : remainingCourses.length === 0 ? "No courses available" : "Select course"}
                    </option>
                    {remainingCourses.length === 0 && !loadingCourses && (
                      <option disabled>No courses available to add</option>
                    )}
                    {remainingCourses.map((course) => (
                      <option key={course._id || course.id} value={course._id || course.id}>
                        {course.title || course.name || 'Untitled Course'}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                    Enrollment Date
                  </label>
                  <input
                    type="date"
                    value={enrollmentDate}
                    onChange={(event) => setEnrollmentDate(event.target.value)}
                    className="mt-1 w-full rounded-xl border border-blue-200 px-3 py-2 text-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    disabled={loadingCourses || !selectedCourseId}
                  >
                    {loadingCourses ? "Enrolling..." : "Add Enrollment"}
                  </Button>
                </div>
              </div>
            </form>
          )}

          {loadingEnrollments ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-blue-600 border-r-transparent"></div>
                <p className="mt-2 text-sm text-gray-600">Loading enrollments...</p>
              </div>
            </div>
          ) : courses.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-8 text-center text-gray-600">
              No courses assigned yet. Use "Add Course" to enroll the student in a course.
            </div>
          ) : (
            <div className="space-y-4">
              {courses.map((course) => (
                <div
                  key={course.enrollmentId || course._id || course.id}
                  className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between"
                >
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-900">
                      {course.title || course.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {course.category || 'General'} • {course.instructor || 'TBA'}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>
                        Enrolled{" "}
                        {new Date(course.enrollmentDate).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </span>
                      <span>
                        Progress:{" "}
                        <strong className="text-gray-700">
                          {course.progress}%
                        </strong>
                      </span>
                      {course.nextMilestone && (
                        <span>Next: {course.nextMilestone}</span>
                      )}
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-100">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Badge color={courseStatusColors[course.status] || "default"}>
                      {course.status}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const courseSlug = course.slug;
                        if (courseSlug) {
                          window.location.href = `/students/${student._id || student.id}/courses/${courseSlug}`;
                        } else {
                          console.error('Course slug not available');
                        }
                      }}
                    >
                      View Progress
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveCourse(course.enrollmentId)}
                      disabled={loadingCourses}
                      className="text-red-600 hover:text-red-800 hover:border-red-300"
                    >
                      Remove
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCertCourse({ _id: course.courseId || course.id, title: course.title || course.name });
                        setCertModalOpen(true);
                      }}
                      className="text-amber-600 hover:text-amber-800 hover:border-amber-300"
                    >
                      <Award className="w-4 h-4 mr-1" />
                      Certificate
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ComponentCard>
      )}
      {activeTab === "payments" && (
        <StudentPayments studentId={student._id} />
      )}

      {/* Certificate Modal */}
      <CertificateModal
        isOpen={certModalOpen}
        onClose={() => { setCertModalOpen(false); setCertCourse(null); }}
        student={student}
        course={certCourse || {}}
      />
    </div>
  );
};

// Sub-component for student payments to manage its own state
import { getAllTransactions } from "@/lib/api/stripe";

const StudentPayments = ({ studentId }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await getAllTransactions({ studentId });
        if (response.success) {
          setPayments(response.data);
        }
      } catch (err) {
        console.error("Error fetching student payments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [studentId]);

  if (loading) return <div className="py-8 text-center text-gray-500">Loading payment history...</div>;

  return (
    <ComponentCard title="Payment History">
      {payments.length === 0 ? (
        <div className="py-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          No payment records found for this student.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 italic text-gray-400 text-xs">
                <th className="pb-3 font-medium">Item</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium text-right">Date</th>
                <th className="pb-3 font-medium text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payments.map((payment) => (
                <tr key={payment._id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-2">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-800">{payment.itemId?.title || "Item " + (payment.itemId?._id?.substring(0, 8) || "N/A")}</span>
                      <span className="text-[10px] uppercase text-gray-500 font-bold">{payment.itemType}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2 font-bold text-sm text-gray-800">{payment.amount?.toFixed(2)} NOK</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${payment.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="py-4 text-right text-xs text-gray-500">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 text-right">
                    {payment.invoice?.pdfUrl ? (
                      <button
                        onClick={() => window.open(payment.invoice.pdfUrl, '_blank')}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-[10px] font-bold uppercase"
                        title={`View Invoice: ${payment.invoice.invoiceNumber}`}
                      >
                        <FileText className="w-3 h-3" />
                        View
                      </button>
                    ) : (
                      <span className="text-[10px] text-gray-400 italic">N/A</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ComponentCard>
  );
};

export default StudentDetail;

