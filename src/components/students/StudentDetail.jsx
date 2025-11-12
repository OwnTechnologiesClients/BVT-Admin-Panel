"use client";

import React, { useMemo, useState } from "react";
import { ComponentCard } from "@/components/common/ComponentCard";
import { Badge, Button } from "@/components/ui";
import { availableCoursesMock } from "@/data/studentsMockData";

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
  const [courses, setCourses] = useState(student.courses || []);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [enrollmentDate, setEnrollmentDate] = useState("");

  const remainingCourses = useMemo(() => {
    const existingIds = new Set(courses.map((course) => course.id));
    return availableCoursesMock.filter((course) => !existingIds.has(course.id));
  }, [courses]);

  const handleAddCourse = (event) => {
    event.preventDefault();
    const selectedCourse = remainingCourses.find(
      (course) => course.id === selectedCourseId
    );
    if (!selectedCourse) return;

    const newCourse = {
      id: selectedCourse.id,
      title: selectedCourse.title,
      category: selectedCourse.category,
      instructor: selectedCourse.instructor,
      enrollmentDate: enrollmentDate || new Date().toISOString().slice(0, 10),
      status: "In Progress",
      progress: 0,
      modulesCompleted: 0,
      totalModules: 10,
      lastActive: null,
      nextMilestone: "Orientation Session",
    };

    setCourses((prev) => [...prev, newCourse]);
    setSelectedCourseId("");
    setEnrollmentDate("");
    setShowAddCourse(false);
  };

  return (
    <div className="space-y-6">
      <ComponentCard title="Student Overview">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-600 to-indigo-500 text-white shadow-lg flex items-center justify-center text-lg font-semibold">
              {student.fullName
                .split(" ")
                .slice(0, 2)
                .map((name) => name.charAt(0))
                .join("")}
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">
                {student.fullName}
              </p>
              <p className="text-sm text-gray-500">{student.rank}</p>
              <p className="text-xs text-gray-400">{student.branch}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Badge color="info">
              Enrolled Courses: <span className="ml-1">{courses.length}</span>
            </Badge>
            <Badge color="success">
              Focus Area: <span className="ml-1">{student.branch}</span>
            </Badge>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab("info")}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "info"
                ? "bg-blue-100 text-blue-600"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Student Info
          </button>
          <button
            onClick={() => setActiveTab("courses")}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "courses"
                ? "bg-blue-100 text-blue-600"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Courses & Progress
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
            <InfoRow label="Rank" value={student.rank} />
            <InfoRow label="Branch" value={student.branch} />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <ComponentCard title="Address" className="bg-gray-50">
              <p className="text-sm text-gray-700">
                {student.address.street}
                <br />
                {student.address.city}, {student.address.state}{" "}
                {student.address.postalCode}
                <br />
                {student.address.country}
              </p>
            </ComponentCard>
            <ComponentCard title="Emergency Contact" className="bg-gray-50">
              <p className="text-sm text-gray-700">
                {student.emergencyContact.name}
                <br />
                Relation: {student.emergencyContact.relation}
                <br />
                {student.emergencyContact.phone}
              </p>
            </ComponentCard>
          </div>

            <ComponentCard title="Documents" className="mt-6">
              <div className="space-y-3">
                {student.documents.map((doc) => (
                  <div
                    key={doc.id}
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
                        {doc.status}
                      </Badge>
                      <p className="text-xs text-gray-400">
                        Uploaded{" "}
                        {new Date(doc.uploadedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ComponentCard>

          {student.notes && (
            <ComponentCard title="Notes" className="mt-6 bg-gray-50">
              <p className="text-sm text-gray-700">{student.notes}</p>
            </ComponentCard>
          )}
        </ComponentCard>
      )}

      {activeTab === "courses" && (
        <ComponentCard title="Course Progress" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-600">
              Manage the student's enrollments and track progress.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddCourse((prev) => !prev)}
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
                  >
                    <option value="">Select course</option>
                    {remainingCourses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
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
                  <Button type="submit" variant="primary" className="w-full">
                    Add Enrollment
                  </Button>
                </div>
              </div>
            </form>
          )}

          {courses.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-8 text-center text-gray-600">
              No courses assigned yet. Use “Add Course” to include a test
              enrollment.
            </div>
          ) : (
            <div className="space-y-4">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between"
                >
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-900">
                      {course.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {course.category} • {course.instructor}
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
                      onClick={() =>
                        (window.location.href = `/students/${student.id}/courses/${course.id}`)
                      }
                    >
                      View Progress
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ComponentCard>
      )}
    </div>
  );
};

export default StudentDetail;

