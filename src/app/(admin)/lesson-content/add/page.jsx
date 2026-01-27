"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageBreadcrumb } from "@/components/common";
import RichTextEditor from "@/components/common/RichTextEditor";
import { Button, SearchableSelect } from "@/components/ui";
import { ArrowLeft, Save, Upload, Video, FileText, Loader2 } from "lucide-react";
import * as lessonContentAPI from "@/lib/api/lessonContent";
import * as courseAPI from "@/lib/api/course";
import * as chapterAPI from "@/lib/api/chapter";
import * as lessonAPI from "@/lib/api/lesson";
import { extractTextFromPDF, getPDFPageCount } from "@/lib/utils/pdfExtractor";
import { showSuccess, showError } from "@/lib/utils/sweetalert";

export default function AddLessonContentPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    courseId: "",
    chapterId: "",
    lessonId: "",
    title: "",
    description: "",
    video: {
      type: "upload", // "upload", "youtube", or "vimeo"
      file: null,
      filePath: "",
      fileName: "",
      duration: "",
      youtubeUrl: "",
      vimeoUrl: ""
    },
    document: {
      file: null,
      filePath: "",
      fileName: "",
      extractedText: "",
      pageCount: ""
    },
    isActive: true
  });

  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [extractingPDF, setExtractingPDF] = useState(false);
  const [courses, setCourses] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [lessons, setLessons] = useState([]);

  // Fetch courses on mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await courseAPI.getAllCourses({ limit: 100 });
        if (response.success) {
          setCourses(response.data || []);
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Fetch chapters when course is selected
  useEffect(() => {
    const fetchChapters = async () => {
      if (!formData.courseId) {
        setChapters([]);
        return;
      }
      try {
        setLoading(true);
        const response = await chapterAPI.getChaptersByCourse(formData.courseId);
        if (response.success) {
          setChapters(response.data || []);
        }
      } catch (err) {
        console.error('Error fetching chapters:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchChapters();
  }, [formData.courseId]);

  // Fetch lessons when chapter is selected
  useEffect(() => {
    const fetchLessons = async () => {
      if (!formData.chapterId) {
        setLessons([]);
        return;
      }
      try {
        setLoading(true);
        const response = await lessonAPI.getLessonsByChapter(formData.chapterId);
        if (response.success) {
          setLessons(response.data || []);
        }
      } catch (err) {
        console.error('Error fetching lessons:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLessons();
  }, [formData.chapterId]);

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

  // Convert plain text to HTML format for Tiptap editor
  // Preserves the original structure better
  const convertTextToHTML = (text) => {
    if (!text) return "";
    
    // Split into lines
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    if (lines.length === 0) return "";
    
    let html = '';
    let inList = false;
    let currentParagraph = [];
    
    lines.forEach((line, index) => {
      const nextLine = lines[index + 1];
      const prevLine = lines[index - 1];
      
      // Detect if this is a list item (bullet or numbered)
      const isListItem = /^[\u2022\u2023\u25E6\u2043\u2219\-\*\•]\s+/.test(line) || /^\d+[\.\)]\s+/.test(line);
      
      // Detect if this is likely a heading (short line, maybe all caps, followed by longer text)
      const isLikelyHeading = line.length < 80 && 
                             (line.toUpperCase() === line || /^[A-Z]/.test(line)) &&
                             nextLine && nextLine.length > line.length * 2;
      
      if (isListItem) {
        // Close previous paragraph if exists
        if (currentParagraph.length > 0) {
          html += `<p>${currentParagraph.join(' ')}</p>`;
          currentParagraph = [];
        }
        
        // Start or continue list
        if (!inList) {
          html += '<ul>';
          inList = true;
        }
        
        // Extract list item text (remove bullet/number)
        const itemText = line.replace(/^[\u2022\u2023\u25E6\u2043\u2219\-\*\•\d+\.\)]\s+/, '').trim();
        html += `<li>${itemText}</li>`;
        
        // Close list only if next line is not a list item and we're moving to a different section
        const nextIsListItem = nextLine && (/^[\u2022\u2023\u25E6\u2043\u2219\-\*\•]\s+/.test(nextLine) || /^\d+[\.\)]\s+/.test(nextLine));
        if (!nextLine || (!nextIsListItem && nextLine.trim().length > 0)) {
          html += '</ul>';
          inList = false;
        }
      } else if (isLikelyHeading) {
        // Close previous paragraph
        if (currentParagraph.length > 0) {
          html += `<p>${currentParagraph.join(' ')}</p>`;
          currentParagraph = [];
        }
        html += `<h2>${line}</h2>`;
      } else {
        // Regular text line
        // Close list if we were in one
        if (inList) {
          html += '</ul>';
          inList = false;
        }
        
        // Add to current paragraph
        currentParagraph.push(line);
        
        // Check if we should close paragraph:
        // - Next line is empty or very different in length (might be new section)
        // - Current line ends with punctuation and next line starts with capital
        const shouldCloseParagraph = 
          !nextLine || 
          (line.match(/[.!?:;]$/) && nextLine && /^[A-Z]/.test(nextLine)) ||
          (currentParagraph.length > 0 && (!nextLine || nextLine.length < 50));
        
        if (shouldCloseParagraph && currentParagraph.length > 0) {
          html += `<p>${currentParagraph.join(' ')}</p>`;
          currentParagraph = [];
        }
      }
    });
    
    // Close any remaining paragraph
    if (currentParagraph.length > 0) {
      html += `<p>${currentParagraph.join(' ')}</p>`;
    }
    
    // Close any remaining list
    if (inList) {
      html += '</ul>';
    }
    
    return html || `<p>${text.replace(/\n/g, ' ')}</p>`;
  };

  const extractPDFText = async (file) => {
    if (!file || file.type !== "application/pdf") {
      return;
    }

    try {
      setExtractingPDF(true);
      
      // Extract text and page count in parallel
      const [extractedText, pageCount] = await Promise.all([
        extractTextFromPDF(file),
        getPDFPageCount(file)
      ]);
    
      // Convert plain text to HTML format for Tiptap editor
      const htmlContent = convertTextToHTML(extractedText);

      // Update form data with extracted text (as HTML) and page count
      handleDocumentChange("extractedText", htmlContent);
      handleDocumentChange("pageCount", pageCount.toString());
    } catch (error) {
      console.error("Error extracting PDF:", error);
      showError('PDF Extraction Error', `Failed to extract text from PDF: ${error.message}`);
      // Set a placeholder message
      handleDocumentChange("extractedText", `<p>Error: Could not extract text from PDF. ${error.message}</p>`);
    } finally {
      setExtractingPDF(false);
    }
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
    // Validate video based on type
    if (formData.video.type === "upload") {
    if (!formData.video.file && !formData.video.filePath) {
      newErrors.videoFile = "Video file is required";
      }
    } else if (formData.video.type === "youtube") {
      if (!formData.video.youtubeUrl || !formData.video.youtubeUrl.trim()) {
        newErrors.youtubeUrl = "YouTube URL is required";
      } else {
        // Validate YouTube URL format
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
        if (!youtubeRegex.test(formData.video.youtubeUrl.trim())) {
          newErrors.youtubeUrl = "Please enter a valid YouTube URL";
        }
      }
    } else if (formData.video.type === "vimeo") {
      if (!formData.video.vimeoUrl || !formData.video.vimeoUrl.trim()) {
        newErrors.vimeoUrl = "Vimeo URL is required";
      } else {
        // Validate Vimeo URL format
        const vimeoRegex = /^(https?:\/\/)?(www\.)?(vimeo\.com|player\.vimeo\.com)\/.+/;
        if (!vimeoRegex.test(formData.video.vimeoUrl.trim())) {
          newErrors.vimeoUrl = "Please enter a valid Vimeo URL";
        }
      }
    }

    // Document is always required (Step 2)
    if (!formData.document.file && !formData.document.filePath) {
      newErrors.documentFile = "Document file is required";
    }
    
    // Remove isRequired validation - it's no longer a field

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      // Check if there are file uploads
      const hasVideoFile = formData.video.type === "upload" && formData.video.file && formData.video.file instanceof File;
      const hasDocumentFile = formData.document.file && formData.document.file instanceof File;
      const hasFileUploads = hasVideoFile || hasDocumentFile;

      let contentData;

      if (hasFileUploads) {
        // Use FormData if there are file uploads
        contentData = new FormData();
        contentData.append('courseId', formData.courseId);
        contentData.append('chapterId', formData.chapterId);
        contentData.append('lessonId', formData.lessonId);
        contentData.append('title', formData.title.trim());
        if (formData.description) {
          contentData.append('description', formData.description.trim());
        }
        contentData.append('isActive', formData.isActive);

        // Append video data
        contentData.append('videoType', formData.video.type);
        if (formData.video.type === "upload" && hasVideoFile) {
          contentData.append('video', formData.video.file);
          if (formData.video.duration) {
            contentData.append('videoDuration', parseInt(formData.video.duration));
          }
        } else if (formData.video.type === "youtube" && formData.video.youtubeUrl) {
          contentData.append('youtubeUrl', formData.video.youtubeUrl.trim());
        } else if (formData.video.type === "vimeo" && formData.video.vimeoUrl) {
          contentData.append('vimeoUrl', formData.video.vimeoUrl.trim());
        }

        // Append document file if it's a File
        if (hasDocumentFile) {
          contentData.append('document', formData.document.file);
          if (formData.document.extractedText) {
            contentData.append('extractedText', formData.document.extractedText);
          }
          if (formData.document.pageCount) {
            contentData.append('pageCount', parseInt(formData.document.pageCount));
          }
        }
      } else {
        // Use plain object if no file uploads (shouldn't happen for add page, but handle it)
        contentData = {
          courseId: formData.courseId,
          chapterId: formData.chapterId,
          lessonId: formData.lessonId,
          title: formData.title.trim(),
          description: formData.description?.trim() || "",
          isActive: formData.isActive,
          video: {
            type: formData.video.type,
            ...(formData.video.type === "youtube" && formData.video.youtubeUrl ? { youtubeUrl: formData.video.youtubeUrl.trim() } : {}),
            ...(formData.video.type === "vimeo" && formData.video.vimeoUrl ? { vimeoUrl: formData.video.vimeoUrl.trim() } : {}),
            ...(formData.video.type === "upload" && formData.video.filePath ? { filePath: formData.video.filePath } : {})
          },
          document: null
        };
      }

      const response = await lessonContentAPI.createLessonContent(contentData);

      if (response.success) {
        showSuccess('Lesson Content Created!', 'The lesson content has been created successfully.');
        setTimeout(() => {
        router.push('/lesson-content');
        }, 1500);
      } else {
        showError('Error', response.message || 'Failed to create lesson content');
      }
    } catch (err) {
      console.error('Error creating lesson content:', err);
      showError('Error', err.message || 'Failed to create lesson content');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageBreadcrumb 
        pageTitle="Add Lesson Content"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Lesson Content", href: "/lesson-content" },
          { label: "Add Content", href: "/lesson-content/add" }
        ]}
      />

      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Button variant="outline" className="flex items-center gap-2" onClick={() => router.push('/lesson-content')}>
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
                  Course <span className="text-red-500">*</span>
                </label>
                <SearchableSelect
                  value={formData.courseId}
                  onChange={(value) => handleInputChange("courseId", value)}
                  options={courses}
                  placeholder="Select a course"
                  displayKey="title"
                  valueKey="_id"
                  required={true}
                  loading={loading}
                  disabled={loading}
                  error={errors.courseId}
                />
                {errors.courseId && <p className="text-red-500 text-sm mt-1">{errors.courseId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chapter <span className="text-red-500">*</span>
                </label>
                <SearchableSelect
                  value={formData.chapterId}
                  onChange={(value) => handleInputChange("chapterId", value)}
                  options={chapters}
                  placeholder={formData.courseId ? (loading ? "Loading chapters..." : "Select a chapter") : "Select a course first"}
                  displayKey="title"
                  valueKey="_id"
                  required={true}
                  loading={loading}
                  disabled={!formData.courseId || loading}
                  error={errors.chapterId}
                  emptyMessage={formData.courseId && chapters.length === 0 ? "No chapters available for this course" : "No options found"}
                />
                {errors.chapterId && <p className="text-red-500 text-sm mt-1">{errors.chapterId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lesson <span className="text-red-500">*</span>
                </label>
                <SearchableSelect
                  value={formData.lessonId}
                  onChange={(value) => handleInputChange("lessonId", value)}
                  options={lessons}
                  placeholder={formData.chapterId ? (loading ? "Loading lessons..." : "Select a lesson") : "Select a chapter first"}
                  displayKey="title"
                  valueKey="_id"
                  required={true}
                  loading={loading}
                  disabled={!formData.chapterId || loading}
                  error={errors.lessonId}
                  emptyMessage={formData.chapterId && lessons.length === 0 ? "No lessons available for this chapter" : "No options found"}
                />
                {errors.lessonId && <p className="text-red-500 text-sm mt-1">{errors.lessonId}</p>}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content Title <span className="text-red-500">*</span>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-gray-400 text-xs">(optional)</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter content description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Active Status <span className="text-gray-400 text-xs">(optional)</span>
                  </label>
                <select
                  value={formData.isActive ? "true" : "false"}
                  onChange={(e) => handleInputChange("isActive", e.target.value === "true")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
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
                
                {/* Video Type Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video Source <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.video.type || "upload"}
                    onChange={(e) => {
                      handleVideoChange("type", e.target.value);
                      // Clear the other type's data
                      if (e.target.value === "upload") {
                        handleVideoChange("youtubeUrl", "");
                        handleVideoChange("vimeoUrl", "");
                      } else {
                        handleVideoChange("file", null);
                        handleVideoChange("fileName", "");
                        handleVideoChange("filePath", "");
                        handleVideoChange("duration", "");
                        // Clear the other URL type
                        if (e.target.value === "youtube") {
                          handleVideoChange("vimeoUrl", "");
                        } else if (e.target.value === "vimeo") {
                          handleVideoChange("youtubeUrl", "");
                        }
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="upload">Upload Video File</option>
                    <option value="youtube">YouTube URL</option>
                    <option value="vimeo">Vimeo URL</option>
                  </select>
                </div>

                {formData.video.type === "upload" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Video File <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            // Store file object for upload
                            setFormData(prev => ({
                              ...prev,
                              video: {
                                ...prev.video,
                                file: file,
                                fileName: file.name,
                                filePath: URL.createObjectURL(file) // For preview
                              }
                            }));
                            
                            // Auto-calculate video duration
                            const video = document.createElement('video');
                            video.preload = 'metadata';
                            video.onloadedmetadata = () => {
                              window.URL.revokeObjectURL(video.src);
                              const duration = Math.round(video.duration);
                              handleVideoChange("duration", duration);
                            };
                            video.src = URL.createObjectURL(file);
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
                      Duration (seconds) <span className="text-gray-400 text-xs">(auto-calculated)</span>
                    </label>
                    <input
                      type="number"
                        value={formData.video.duration || ""}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                      placeholder="Will be calculated from video"
                    />
                  </div>
                </div>
                ) : formData.video.type === "youtube" ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      YouTube URL <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.video.youtubeUrl || ""}
                      onChange={(e) => handleVideoChange("youtubeUrl", e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.youtubeUrl ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter the full YouTube URL (e.g., https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID)
                    </p>
                    {errors.youtubeUrl && <p className="text-red-500 text-sm mt-1">{errors.youtubeUrl}</p>}
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vimeo URL <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.video.vimeoUrl || ""}
                      onChange={(e) => handleVideoChange("vimeoUrl", e.target.value)}
                      placeholder="https://vimeo.com/... or https://player.vimeo.com/video/..."
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.vimeoUrl ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter the full Vimeo URL (e.g., https://vimeo.com/123456789 or https://player.vimeo.com/video/123456789)
                    </p>
                    {errors.vimeoUrl && <p className="text-red-500 text-sm mt-1">{errors.vimeoUrl}</p>}
                  </div>
                )}

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
                      Upload PDF/File <span className="text-red-500">*</span>
                    </label>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (file) {
                            // Store file object for upload
                            setFormData(prev => ({
                              ...prev,
                              document: {
                                ...prev.document,
                                file: file,
                                fileName: file.name,
                                filePath: URL.createObjectURL(file) // For preview
                              }
                            }));
                            
                            // Extract text from PDF if it's a PDF file
                            if (file.type === "application/pdf") {
                              await extractPDFText(file);
                            } else if (file.type === "text/plain") {
                              // For text files, read directly
                              const reader = new FileReader();
                              reader.onload = (e) => {
                                handleDocumentChange("extractedText", e.target.result);
                              };
                              reader.readAsText(file);
                            } else {
                              // For other file types, clear extracted text
                              handleDocumentChange("extractedText", "");
                            }
                          }
                        }}
                        disabled={extractingPDF}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${
                          errors.documentFile ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                    {formData.document.fileName && (
                      <p className="text-sm text-gray-600 mt-2">
                        Selected: {formData.document.fileName}
                        {extractingPDF && (
                          <span className="ml-2 text-blue-600 flex items-center gap-1">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Extracting text...
                          </span>
                        )}
                        {formData.document.pageCount && !extractingPDF && (
                          <span className="ml-2 text-gray-500">
                            ({formData.document.pageCount} pages)
                          </span>
                        )}
                      </p>
                    )}
                    {errors.documentFile && <p className="text-red-500 text-sm mt-1">{errors.documentFile}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Extracted Text Content (Editable) *
                    </label>
                    
                    {extractingPDF ? (
                      <div className="border border-gray-300 rounded-lg p-8 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Extracting text from PDF...</p>
                        <p className="text-xs text-gray-500 mt-1">This may take a moment for large PDFs</p>
                    </div>
                    ) : (
                      <RichTextEditor
                        value={formData.document.extractedText || ""}
                        onChange={(data) => handleDocumentChange("extractedText", data)}
                        placeholder="Upload a PDF file to extract text content, or type your content here..."
                        disabled={submitting}
                        height="400px"
                        className="border border-gray-300 rounded-lg"
                      />
                      )}
                    <p className="text-xs text-gray-500 mt-1">
                      Content extracted from PDF will appear above. You can edit it using the rich text editor.
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
            <Button type="button" variant="outline" onClick={() => router.push('/lesson-content')}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex items-center gap-2" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Create Content
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
