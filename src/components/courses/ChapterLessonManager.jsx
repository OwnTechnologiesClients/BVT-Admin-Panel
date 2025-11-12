"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui";
import { Plus, Trash2, Edit, Eye, ArrowRight } from "lucide-react";

const ChapterLessonManager = ({ courseId }) => {
  const [chapters, setChapters] = useState([
    {
      id: 1,
      title: "Getting Started",
      description: "Introduction to the course",
      order: 1,
      duration: "2 hours",
      lessons: [
        {
          id: 1,
          title: "Course Overview",
          description: "Understanding the course structure",
          order: 1,
          duration: "30 minutes",
          type: "lecture",
          isActive: true
        }
      ]
    }
  ]);

  const [selectedChapter, setSelectedChapter] = useState(null);
  const [showLessonForm, setShowLessonForm] = useState(false);

  const addChapter = () => {
    const newChapter = {
      id: chapters.length + 1,
      title: "",
      description: "",
      order: chapters.length + 1,
      duration: "",
      lessons: []
    };
    setChapters([...chapters, newChapter]);
  };

  const updateChapter = (chapterId, field, value) => {
    setChapters(chapters.map(chapter => 
      chapter.id === chapterId 
        ? { ...chapter, [field]: value }
        : chapter
    ));
  };

  const deleteChapter = (chapterId) => {
    if (chapters.length > 1) {
      setChapters(chapters.filter(chapter => chapter.id !== chapterId));
    }
  };

  const addLesson = (chapterId) => {
    const chapter = chapters.find(c => c.id === chapterId);
    const newLesson = {
      id: chapter.lessons.length + 1,
      title: "",
      description: "",
      order: chapter.lessons.length + 1,
      duration: "",
      type: "lecture",
      isActive: true
    };
    
    setChapters(chapters.map(chapter => 
      chapter.id === chapterId 
        ? { ...chapter, lessons: [...chapter.lessons, newLesson] }
        : chapter
    ));
  };

  const updateLesson = (chapterId, lessonId, field, value) => {
    setChapters(chapters.map(chapter => 
      chapter.id === chapterId 
        ? {
            ...chapter,
            lessons: chapter.lessons.map(lesson =>
              lesson.id === lessonId 
                ? { ...lesson, [field]: value }
                : lesson
            )
          }
        : chapter
    ));
  };

  const deleteLesson = (chapterId, lessonId) => {
    setChapters(chapters.map(chapter => 
      chapter.id === chapterId 
        ? {
            ...chapter,
            lessons: chapter.lessons.filter(lesson => lesson.id !== lessonId)
          }
        : chapter
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Course Structure</h3>
        <Button
          onClick={addChapter}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Chapter
        </Button>
      </div>

      {chapters.map((chapter, chapterIndex) => (
        <div key={chapter.id} className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-500">
                Chapter {chapterIndex + 1}
              </span>
              <input
                type="text"
                value={chapter.title}
                onChange={(e) => updateChapter(chapter.id, 'title', e.target.value)}
                className="text-lg font-semibold text-gray-900 bg-transparent border-none focus:ring-0 p-0"
                placeholder="Chapter title"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => addLesson(chapter.id)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Lesson
              </Button>
              {chapters.length > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteChapter(chapter.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-3 mb-4">
            <input
              type="text"
              value={chapter.description}
              onChange={(e) => updateChapter(chapter.id, 'description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Chapter description"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={chapter.duration}
                onChange={(e) => updateChapter(chapter.id, 'duration', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Duration (e.g., 2 hours)"
              />
              <input
                type="number"
                value={chapter.order}
                onChange={(e) => updateChapter(chapter.id, 'order', parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Order"
                min="1"
              />
            </div>
          </div>

          {/* Lessons */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-700">Lessons ({chapter.lessons.length})</h4>
            {chapter.lessons.map((lesson, lessonIndex) => (
              <div key={lesson.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">
                      Lesson {lessonIndex + 1}
                    </span>
                    <input
                      type="text"
                      value={lesson.title}
                      onChange={(e) => updateLesson(chapter.id, lesson.id, 'title', e.target.value)}
                      className="font-medium text-gray-900 bg-transparent border-none focus:ring-0 p-0"
                      placeholder="Lesson title"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedChapter(chapter.id)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteLesson(chapter.id, lesson.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={lesson.description}
                    onChange={(e) => updateLesson(chapter.id, lesson.id, 'description', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Lesson description"
                  />
                  <input
                    type="text"
                    value={lesson.duration}
                    onChange={(e) => updateLesson(chapter.id, lesson.id, 'duration', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Duration"
                  />
                  <select
                    value={lesson.type}
                    onChange={(e) => updateLesson(chapter.id, lesson.id, 'type', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="lecture">Lecture</option>
                    <option value="practical">Practical</option>
                    <option value="workshop">Workshop</option>
                    <option value="assessment">Assessment</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChapterLessonManager;
