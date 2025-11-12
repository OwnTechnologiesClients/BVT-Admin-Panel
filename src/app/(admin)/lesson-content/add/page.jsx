"use client";

import React, { useState } from "react";
import { PageBreadcrumb } from "@/components/common";
import { Button } from "@/components/ui";
import { ArrowLeft, Save, Upload, Video, FileText } from "lucide-react";

export default function AddLessonContentPage() {
  const [formData, setFormData] = useState({
    courseId: "",
    chapterId: "",
    lessonId: "",
    title: "",
    video: {
      filePath: "",
      fileName: "",
      duration: ""
    },
    document: {
      filePath: "",
      fileName: "",
      extractedText: "",
      pageCount: ""
    },
    isRequired: true,
    isActive: true
  });

  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const editorRef = React.useRef(null);

  // Courses data
  const courses = [
    { id: 1, name: "Advanced Naval Engineering Workshop" },
    { id: 2, name: "Maritime Security Operations" },
    { id: 3, name: "Submarine Operations Masterclass" }
  ];

  // Chapters data
  const chapters = [
    { id: 1, name: "Getting Started", courseId: 1 },
    { id: 2, name: "Ship Propulsion Systems", courseId: 1 },
    { id: 3, name: "Advanced Propulsion", courseId: 1 },
    { id: 4, name: "Security Fundamentals", courseId: 2 },
    { id: 5, name: "Threat Assessment", courseId: 2 },
    { id: 6, name: "Introduction to Submarines", courseId: 3 },
    { id: 7, name: "Underwater Navigation", courseId: 3 }
  ];

  // Lessons data
  const allLessons = [
    { id: 1, name: "Course Overview", chapterId: 1 },
    { id: 2, name: "Introduction to Naval Engineering", chapterId: 1 },
    { id: 3, name: "Propulsion System Components", chapterId: 2 },
    { id: 4, name: "Security Best Practices", chapterId: 4 },
    { id: 5, name: "Submarine Basics", chapterId: 6 }
  ];

  // Filter chapters and lessons based on selections
  const filteredChapters = formData.courseId 
    ? chapters.filter(chapter => chapter.courseId === parseInt(formData.courseId))
    : [];

  const filteredLessons = formData.chapterId 
    ? allLessons.filter(lesson => lesson.chapterId === parseInt(formData.chapterId))
    : [];

  const handleInputChange = (field, value) => {
    // Reset dependent fields when course or chapter changes
    if (field === "courseId") {
      setFormData(prev => ({
        ...prev,
        courseId: value,
        chapterId: "",
        lessonId: ""
      }));
    } else if (field === "chapterId") {
      setFormData(prev => ({
        ...prev,
        chapterId: value,
        lessonId: ""
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const handleVideoChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      video: {
        ...prev.video,
        [field]: value
      }
    }));
  };

  const handleDocumentChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      document: {
        ...prev.document,
        [field]: value
      }
    }));
  };

  const executeCommand = (command, value = null) => {
    document.execCommand(command, false, value);
  };

  const handleFormatClick = (command, value = null) => {
    executeCommand(command, value);
  };

  const extractPDFText = async (file) => {
    // Note: This is a placeholder. For full PDF text extraction, 
    // you'll need to integrate a library like pdf.js or pdf-parse
    // For now, we'll show a message that text extraction is in progress
    handleDocumentChange("extractedText", "Loading PDF content...\n\nNote: PDF text extraction requires a backend service or client-side library like pdf.js. The file has been selected and ready for upload.");
    
    // Example: If using pdf.js, you would do something like:
    // const pdfjsLib = await import('pdfjs-dist');
    // const fileArrayBuffer = await file.arrayBuffer();
    // const pdf = await pdfjsLib.getDocument({ data: fileArrayBuffer }).promise;
    // let fullText = '';
    // for (let i = 1; i <= pdf.numPages; i++) {
    //   const page = await pdf.getPage(i);
    //   const textContent = await page.getTextContent();
    //   fullText += textContent.items.map(item => item.str).join(' ') + '\n';
    // }
    // handleDocumentChange("extractedText", fullText);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.courseId) {
      newErrors.courseId = "Course is required";
    }

    if (!formData.chapterId) {
      newErrors.chapterId = "Chapter is required";
    }

    if (!formData.lessonId) {
      newErrors.lessonId = "Lesson is required";
    }

    if (!formData.title.trim()) {
      newErrors.title = "Content title is required";
    }

    // Video is always required (Step 1)
    if (!formData.video.file && !formData.video.filePath) {
      newErrors.videoFile = "Video file is required";
    }

    // Document is always required (Step 2)
    if (!formData.document.file && !formData.document.filePath) {
      newErrors.documentFile = "Document file is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      console.log("Content submitted:", formData);
      // Handle form submission here
      alert("Content created successfully!");
    }
  };

  return (
    <div className="space-y-6">
      <PageBreadcrumb 
        pageTitle="Add Lesson Content"
        breadcrumbs={[
          { label: "Home", href: "/admin/dashboard" },
          { label: "Lesson Content", href: "/admin/lesson-content" },
          { label: "Add Content", href: "/admin/lesson-content/add" }
        ]}
      />

      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Button variant="outline" className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Content
        </Button>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course *
                </label>
                <select
                  value={formData.courseId}
                  onChange={(e) => handleInputChange("courseId", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.courseId ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select a course</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
                {errors.courseId && <p className="text-red-500 text-sm mt-1">{errors.courseId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chapter *
                </label>
                <select
                  value={formData.chapterId}
                  onChange={(e) => handleInputChange("chapterId", e.target.value)}
                  disabled={!formData.courseId}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.chapterId ? "border-red-500" : "border-gray-300"
                  } ${!formData.courseId ? "bg-gray-100 cursor-not-allowed" : ""}`}
                >
                  <option value="">
                    {formData.courseId ? "Select a chapter" : "Select a course first"}
                  </option>
                  {filteredChapters.map(chapter => (
                    <option key={chapter.id} value={chapter.id}>
                      {chapter.name}
                    </option>
                  ))}
                </select>
                {errors.chapterId && <p className="text-red-500 text-sm mt-1">{errors.chapterId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lesson *
                </label>
                <select
                  value={formData.lessonId}
                  onChange={(e) => handleInputChange("lessonId", e.target.value)}
                  disabled={!formData.chapterId}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.lessonId ? "border-red-500" : "border-gray-300"
                  } ${!formData.chapterId ? "bg-gray-100 cursor-not-allowed" : ""}`}
                >
                  <option value="">
                    {formData.chapterId ? "Select a lesson" : "Select a chapter first"}
                  </option>
                  {filteredLessons.map(lesson => (
                    <option key={lesson.id} value={lesson.id}>
                      {lesson.name}
                    </option>
                  ))}
                </select>
                {errors.lessonId && <p className="text-red-500 text-sm mt-1">{errors.lessonId}</p>}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.title ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter content title"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isRequired"
                    checked={formData.isRequired}
                    onChange={(e) => handleInputChange("isRequired", e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="isRequired" className="text-sm font-medium text-gray-700">
                    Required Content
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange("isActive", e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    Active Content
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* 2-Step Content Wizard */}
          <div className="border border-gray-200 rounded-lg p-6">
            {/* Step Indicators */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className={`flex items-center gap-2 ${currentStep === 1 ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}>
                  1
                </div>
                <span>Video</span>
              </div>
              <div className="w-16 h-0.5 bg-gray-300"></div>
              <div className={`flex items-center gap-2 ${currentStep === 2 ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}>
                  2
                </div>
                <span>Text</span>
              </div>
            </div>

            {/* Step 1: Video Content */}
            {currentStep === 1 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Video className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Video Content</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Video File *
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            handleVideoChange("fileName", file.name);
                            handleVideoChange("filePath", URL.createObjectURL(file));
                            // Store file object for later upload
                            setFormData(prev => ({
                              ...prev,
                              video: {
                                ...prev.video,
                                file: file
                              }
                            }));
                          }
                        }}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${
                          errors.videoFile ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                    </div>
                    {formData.video.fileName && (
                      <p className="text-sm text-gray-600 mt-2">
                        Selected: {formData.video.fileName}
                      </p>
                    )}
                    {errors.videoFile && <p className="text-red-500 text-sm mt-1">{errors.videoFile}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (seconds)
                    </label>
                    <input
                      type="number"
                      value={formData.video.duration}
                      onChange={(e) => handleVideoChange("duration", parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="300"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-6">
                  <Button type="button" variant="outline" onClick={() => setCurrentStep(2)}>
                    Next: Text Content
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Text Content */}
            {currentStep === 2 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Text Content</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload PDF/File *
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          handleDocumentChange("fileName", file.name);
                          handleDocumentChange("filePath", URL.createObjectURL(file));
                          // Store file object for later upload
                          setFormData(prev => ({
                            ...prev,
                            document: {
                              ...prev.document,
                              file: file
                            }
                          }));
                          
                          // Extract text from PDF if it's a PDF file
                          if (file.type === "application/pdf") {
                            extractPDFText(file);
                          } else if (file.type === "text/plain") {
                            // For text files, read directly
                            const reader = new FileReader();
                            reader.onload = (e) => {
                              handleDocumentChange("extractedText", e.target.result);
                            };
                            reader.readAsText(file);
                          }
                        }
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${
                        errors.documentFile ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {formData.document.fileName && (
                      <p className="text-sm text-gray-600 mt-2">
                        Selected: {formData.document.fileName}
                      </p>
                    )}
                    {errors.documentFile && <p className="text-red-500 text-sm mt-1">{errors.documentFile}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Extracted Text Content (Editable)
                    </label>
                    
                    {/* Formatting Toolbar */}
                    <div className="border border-gray-300 rounded-t-lg bg-gray-50 flex items-center gap-2 p-2">
                      <button 
                        type="button" 
                        onClick={() => handleFormatClick('bold')}
                        className="px-2 py-1 text-sm font-bold hover:bg-gray-200 rounded" 
                        title="Bold"
                      >
                        B
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleFormatClick('italic')}
                        className="px-2 py-1 text-sm italic hover:bg-gray-200 rounded" 
                        title="Italic"
                      >
                        I
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleFormatClick('underline')}
                        className="px-2 py-1 text-sm hover:bg-gray-200 rounded" 
                        title="Underline"
                      >
                        U
                      </button>
                      <div className="w-px h-6 bg-gray-300 mx-1"></div>
                      <select 
                        onChange={(e) => handleFormatClick('fontSize', e.target.value)}
                        className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-200"
                        defaultValue="3"
                      >
                        <option value="1">12px</option>
                        <option value="2">14px</option>
                        <option value="3">16px</option>
                        <option value="4">18px</option>
                        <option value="5">20px</option>
                        <option value="6">24px</option>
                      </select>
                    </div>

                    {/* Rich Text Editor Area */}
                    <div
                      contentEditable
                      onBlur={(e) => handleDocumentChange("extractedText", e.target.innerText)}
                      className="w-full min-h-[200px] px-3 py-2 border-x border-b border-gray-300 rounded-b-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white prose max-w-none"
                      style={{ outline: 'none' }}
                      suppressContentEditableWarning
                    >
                      {formData.document.extractedText || (
                        <span className="text-gray-400 italic">
                          Content extracted from PDF will appear here. You can edit with formatting tools above...
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Rich text editor with formatting tools (bold, italic, underline, size, color)
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 mt-6">
                  <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>
                    Back to Video
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Create Content
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
