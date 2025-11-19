"use client";

import React, { useState } from "react";
import { ComponentCard } from "@/components/common/ComponentCard";
import { Badge } from "@/components/ui";
import { ChevronDown, ChevronRight, CheckCircle, Circle, BookOpen, FileText, Award } from "lucide-react";

const StatCard = ({ label, value, helper, color = "text-gray-900" }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-lg/10">
    <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
    <p className={`mt-3 text-2xl font-semibold ${color}`}>{value}</p>
    {helper && <p className="mt-2 text-xs text-gray-500">{helper}</p>}
  </div>
);

const StudentCourseProgress = ({ student, course, enrollment, structure, progress }) => {
  const [expandedChapters, setExpandedChapters] = useState({});

  if (!student || !course) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 py-12 text-center text-gray-600">
        Course data not found for this student.
      </div>
    );
  }

  // Get progress details from props or course object
  const progressDetails = progress || course.progressDetails || {};
  const courseStructure = structure || course.structure || { chapters: [], tests: [] };
  const nextLesson = progressDetails.nextLesson || course.nextLesson;

  const chaptersCompleted = progressDetails.chaptersCompleted || 0;
  const totalChapters = progressDetails.totalChapters || 0;
  const lessonsCompleted = progressDetails.lessonsCompleted || 0;
  const totalLessons = progressDetails.totalLessons || 0;
  const testsCompleted = progressDetails.testsCompleted || 0;
  const totalTests = progressDetails.totalTests || 0;
  const overallProgress = progressDetails.overallProgress || course.progress || 0;

  const chaptersRemaining = Math.max(totalChapters - chaptersCompleted, 0);
  const lessonsRemaining = Math.max(totalLessons - lessonsCompleted, 0);

  const toggleChapter = (chapterId) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }));
  };

  return (
    <div className="space-y-6">
      <ComponentCard title="Course Overview">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-lg font-semibold text-gray-900">
              {course.title}
            </p>
            <p className="text-sm text-gray-500">
              {course.category} • {course.instructor}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Enrolled{" "}
              {new Date(course.enrollmentDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge color="info">{student.fullName}</Badge>
            <Badge>{student.rank}</Badge>
            <Badge color={course.status === "Completed" ? "success" : "warning"}>
              {course.status}
            </Badge>
          </div>
        </div>
        <div className="mt-4 h-3 rounded-full bg-gray-100">
          <div
            className="h-3 rounded-full bg-blue-500 transition-all"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-gray-500">
          {overallProgress}% complete • Last active{" "}
          {course.lastActive
            ? new Date(course.lastActive).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })
            : "No activity recorded"}
        </p>
      </ComponentCard>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Chapters Completed"
          value={`${chaptersCompleted}/${totalChapters}`}
          helper={chaptersRemaining > 0 ? `${chaptersRemaining} remaining` : "All chapters completed"}
        />
        <StatCard
          label="Progress"
          value={`${overallProgress}%`}
          helper="Based on chapters, lessons, and tests"
          color="text-blue-600"
        />
        <StatCard
          label="Next Lesson"
          value={nextLesson?.lessonTitle || "Not available"}
          helper={nextLesson ? `Chapter: ${nextLesson.chapterTitle}` : "All lessons completed"}
        />
        <StatCard
          label="Status"
          value={course.status}
          color={
            course.status === "Completed"
              ? "text-green-600"
              : course.status === "In Progress"
              ? "text-blue-600"
              : "text-yellow-600"
          }
        />
      </div>

      {/* Detailed Progress Section */}
      <ComponentCard title="Detailed Progress" className="space-y-4">
        {/* Chapters and Lessons */}
        {courseStructure.chapters && courseStructure.chapters.length > 0 ? (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Chapters & Lessons ({lessonsCompleted}/{totalLessons} lessons completed)
            </h3>
            {courseStructure.chapters.map((chapter) => {
              const isExpanded = expandedChapters[chapter._id];
              const chapterProgress = chapter.totalLessons > 0 
                ? Math.round((chapter.completedLessons / chapter.totalLessons) * 100)
                : 0;

              return (
                <div
                  key={chapter._id}
                  className="rounded-xl border border-gray-200 bg-white overflow-hidden"
                >
                  <button
                    onClick={() => toggleChapter(chapter._id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900">
                            {chapter.title}
                          </p>
                          {chapter.completed && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {chapter.completedLessons}/{chapter.totalLessons} lessons • {chapterProgress}% complete
                        </p>
                      </div>
                    </div>
                    <Badge color={chapter.completed ? "success" : "default"}>
                      {chapter.completed ? "Completed" : "In Progress"}
                    </Badge>
                  </button>

                  {isExpanded && chapter.lessons && chapter.lessons.length > 0 && (
                    <div className="border-t border-gray-200 bg-gray-50 p-4 space-y-2">
                      {chapter.lessons.map((lesson) => (
                        <div
                          key={lesson._id}
                          className="flex items-center gap-3 p-2 rounded-lg bg-white"
                        >
                          {lesson.completed ? (
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">{lesson.title}</p>
                            {lesson.completedAt && (
                              <p className="text-xs text-gray-500">
                                Completed {new Date(lesson.completedAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No chapters available for this course.</p>
        )}

        {/* Tests */}
        {courseStructure.tests && courseStructure.tests.length > 0 && (
          <div className="space-y-3 mt-6">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Award className="w-4 h-4" />
              Tests ({testsCompleted}/{totalTests} passed)
            </h3>
            <div className="space-y-2">
              {courseStructure.tests.map((test) => (
                <div
                  key={test._id}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white"
                >
                  <div className="flex items-center gap-3">
                    {test.passed ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : test.completed ? (
                      <Circle className="w-5 h-5 text-yellow-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-300" />
                    )}
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{test.title}</p>
                      <p className="text-xs text-gray-500">
                        Passing Score: {test.passingScore}% • Duration: {test.duration} min
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {test.completed && (
                      <>
                        <Badge color={test.passed ? "success" : "warning"}>
                          {test.passed ? "Passed" : "Failed"}
                        </Badge>
                        {test.score !== null && (
                          <p className="text-xs text-gray-500 mt-1">
                            Score: {test.score}%
                          </p>
                        )}
                      </>
                    )}
                    {!test.completed && (
                      <Badge color="default">Not Attempted</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </ComponentCard>

      <ComponentCard title="Activity Timeline" className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="mt-1.5 h-2 w-2 rounded-full bg-black" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">
                Latest Interaction: <span className="font-normal text-gray-600">
                  {course.lastActive
                    ? new Date(course.lastActive).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })
                    : "No activity recorded"}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-1.5 h-2 w-2 rounded-full bg-black" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">
                Chapters Completed: <span className="font-normal text-gray-600">
                  {chaptersCompleted} of {totalChapters} chapters finished
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-1.5 h-2 w-2 rounded-full bg-black" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">
                Lessons Completed: <span className="font-normal text-gray-600">
                  {lessonsCompleted} of {totalLessons} lessons finished
                </span>
              </p>
            </div>
          </div>

          {totalTests > 0 && (
            <div className="flex items-start gap-3">
              <div className="mt-1.5 h-2 w-2 rounded-full bg-black" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  Tests Completed: <span className="font-normal text-gray-600">
                    {testsCompleted} of {totalTests} tests passed
                  </span>
                </p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <div className="mt-1.5 h-2 w-2 rounded-full bg-black" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">
                Next Lesson: <span className="font-normal text-gray-600">
                  {nextLesson 
                    ? `${nextLesson.lessonTitle} (${nextLesson.chapterTitle})`
                    : "All lessons completed"}
                </span>
              </p>
            </div>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
};

export default StudentCourseProgress;
