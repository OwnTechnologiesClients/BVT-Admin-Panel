"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { PageBreadcrumb } from "@/components/common";
import RichTextEditor from "@/components/common/RichTextEditor";
import { Button } from "@/components/ui";
import { ArrowLeft, Save, Upload, Video, FileText, Loader2, Trash2 } from "lucide-react";
import * as lessonContentAPI from "@/lib/api/lessonContent";
import * as courseAPI from "@/lib/api/course";
import * as chapterAPI from "@/lib/api/chapter";
import * as lessonAPI from "@/lib/api/lesson";
import { extractTextFromPDF, getPDFPageCount } from "@/lib/utils/pdfExtractor";
import { showSuccess, showError } from "@/lib/utils/sweetalert";

export default function EditLessonContentPage({ params }) {
  const router = useRouter();
  const { id } = use(params);
  const [formData, setFormData] = useState({
    courseId: "",
    chapterId: "",
    lessonId: "",
    title: "",
    description: "",
    video: {
      type: "upload",
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
    isRequired: true,
    isActive: true
  });

  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [extractingPDF, setExtractingPDF] = useState(false);
  const [courses, setCourses] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [lessons, setLessons] = useState([]);

  // Fetch lesson content data on mount
  useEffect(() => {
    const fetchLessonContent = async () => {
      if (!id) return;
      try {
        setFetching(true);
        const response = await lessonContentAPI.getLessonContentById(id);
        if (response.success) {
          const content = response.data;
          setFormData({
            courseId: content.courseId?._id || content.courseId || "",
            chapterId: content.chapterId?._id || content.chapterId || "",
            lessonId: content.lessonId?._id || content.lessonId || "",
            title: content.title || "",
            description: content.description || "",
            video: {
              type: content.video?.type || (content.video?.youtubeUrl ? "youtube" : content.video?.vimeoUrl ? "vimeo" : "upload"),
              file: null,
              filePath: content.video?.filePath || "",
              fileName: content.video?.fileName || "",
              duration: content.video?.duration?.toString() || "",
              youtubeUrl: content.video?.youtubeUrl || "",
              vimeoUrl: content.video?.vimeoUrl || ""
            },
            document: {
              file: null,
              filePath: content.document?.filePath || "",
              fileName: content.document?.fileName || "",
              extractedText: content.document?.extractedText || "",
              pageCount: content.document?.pageCount?.toString() || ""
            },
            isRequired: content.isRequired !== undefined ? content.isRequired : true,
            isActive: content.isActive !== undefined ? content.isActive : true
          });
        } else {
          showError('Error', response.message || 'Failed to fetch lesson content');
          setTimeout(() => {
          router.push('/lesson-content');
          }, 2000);
        }
      } catch (err) {
        console.error('Error fetching lesson content:', err);
        showError('Error', err.message || 'Failed to fetch lesson content');
        setTimeout(() => {
        router.push('/lesson-content');
        }, 2000);
      } finally {
        setFetching(false);
      }
    };
    fetchLessonContent();
  }, [id, router]);

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

  const removeVideo = () => {
    setFormData(prev => ({
      ...prev,
      video: {
        file: null,
        filePath: "",
        fileName: "",
        duration: ""
      }
    }));
  };

  const removeDocument = () => {
    setFormData(prev => ({
      ...prev,
      document: {
        file: null,
        filePath: "",
        fileName: "",
        extractedText: "",
        pageCount: ""
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
      const hasExistingVideo = formData.video.type === "upload" && formData.video.filePath && typeof formData.video.filePath === 'string' && !formData.video.filePath.startsWith('blob:');
      const hasYouTubeUrl = formData.video.type === "youtube" && formData.video.youtubeUrl && formData.video.youtubeUrl.trim();
      const hasVimeoUrl = formData.video.type === "vimeo" && formData.video.vimeoUrl && formData.video.vimeoUrl.trim();
      const hasExistingDocument = formData.document.filePath && typeof formData.document.filePath === 'string' && !formData.document.filePath.startsWith('blob:');

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
        contentData.append('isRequired', formData.isRequired);
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
        // Use plain object if no file uploads
        contentData = {
          courseId: formData.courseId,
          chapterId: formData.chapterId,
          lessonId: formData.lessonId,
          title: formData.title.trim(),
          description: formData.description?.trim() || "",
          isRequired: formData.isRequired,
          isActive: formData.isActive,
          video: formData.video.type === "youtube" && hasYouTubeUrl ? {
            type: "youtube",
            youtubeUrl: formData.video.youtubeUrl.trim()
          } : formData.video.type === "vimeo" && hasVimeoUrl ? {
            type: "vimeo",
            vimeoUrl: formData.video.vimeoUrl.trim()
          } : hasExistingVideo ? {
            type: "upload",
            filePath: formData.video.filePath,
            fileName: formData.video.fileName,
            duration: formData.video.duration ? parseInt(formData.video.duration) : undefined
          } : null,
          document: hasExistingDocument ? {
            filePath: formData.document.filePath,
            fileName: formData.document.fileName,
            extractedText: formData.document.extractedText,
            pageCount: formData.document.pageCount ? parseInt(formData.document.pageCount) : undefined
          } : null
        };
      }

      const response = await lessonContentAPI.updateLessonContent(id, contentData);

      if (response.success) {
        showSuccess('Lesson Content Updated!', 'The lesson content has been updated successfully.');
        setTimeout(() => {
        router.push('/lesson-content');
        }, 1500);
      } else {
        showError('Error', response.message || 'Failed to update lesson content');
      }
    } catch (err) {
      console.error('Error updating lesson content:', err);
      showError('Error', err.message || 'Failed to update lesson content');
    } finally {
      setSubmitting(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageBreadcrumb 
        pageTitle="Edit Lesson Content"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Lesson Content", href: "/lesson-content" },
          { label: "Edit Content", href: `/lesson-content/${id}/edit` }
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
                <select
                  value={formData.courseId}
                  onChange={(e) => handleInputChange("courseId", e.target.value)}
                  disabled={loading}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.courseId ? "border-red-500" : "border-gray-300"
                  } ${loading ? "bg-gray-100 cursor-not-allowed" : ""}`}
                >
                  <option value="">Select a course</option>
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>
                      {course.title}
                    </option>
                  ))}
                </select>
                {errors.courseId && <p className="text-red-500 text-sm mt-1">{errors.courseId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chapter <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.chapterId}
                  onChange={(e) => handleInputChange("chapterId", e.target.value)}
                  disabled={!formData.courseId || loading}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.chapterId ? "border-red-500" : "border-gray-300"
                  } ${!formData.courseId || loading ? "bg-gray-100 cursor-not-allowed" : ""}`}
                >
                  <option value="">
                    {formData.courseId ? (loading ? "Loading chapters..." : "Select a chapter") : "Select a course first"}
                  </option>
                  {chapters.map(chapter => (
                    <option key={chapter._id} value={chapter._id}>
                      {chapter.title}
                    </option>
                  ))}
                </select>
                {errors.chapterId && <p className="text-red-500 text-sm mt-1">{errors.chapterId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lesson <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.lessonId}
                  onChange={(e) => handleInputChange("lessonId", e.target.value)}
                  disabled={!formData.chapterId || loading}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.lessonId ? "border-red-500" : "border-gray-300"
                  } ${!formData.chapterId || loading ? "bg-gray-100 cursor-not-allowed" : ""}`}
                >
                  <option value="">
                    {formData.chapterId ? (loading ? "Loading lessons..." : "Select a lesson") : "Select a chapter first"}
                  </option>
                  {lessons.map(lesson => (
                    <option key={lesson._id} value={lesson._id}>
                      {lesson.title}
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

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isRequired"
                    checked={formData.isRequired}
                    onChange={(e) => handleInputChange("isRequired", e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isRequired" className="text-sm font-medium text-gray-700">
                    Required <span className="text-gray-400 text-xs">(optional)</span>
                  </label>
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
          </div>

          {/* Video Upload Section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Video className="w-5 h-5" />
              Video Content
            </h3>
            
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
            <div className="space-y-4">
                {formData.video.filePath && !formData.video.filePath.startsWith('blob:') ? (
                <div className="relative group">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <Video className="w-8 h-8 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{formData.video.fileName || 'Video file'}</p>
                      {formData.video.duration && (
                        <p className="text-xs text-gray-500">Duration: {formData.video.duration} seconds</p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={removeVideo}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : null}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {formData.video.filePath && !formData.video.filePath.startsWith('blob:') ? "Replace Video File" : "Upload Video File"}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
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
                        video.onerror = () => {
                          console.error('Error loading video metadata');
                        };
                        video.src = URL.createObjectURL(file);
                      }
                    }}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border-gray-300"
                  />
                </div>
                {formData.video.fileName && !formData.video.filePath?.startsWith('http') && (
                  <p className="text-sm text-gray-600 mt-2">
                    Selected: {formData.video.fileName}
                  </p>
                )}
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (seconds) <span className="text-gray-400 text-xs">(auto-calculated)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.video.duration || ''}
                    onChange={(e) => handleVideoChange("duration", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                    placeholder="Will be calculated from video"
                    readOnly={!!formData.video.file}
                  />
                  {formData.video.file && (
                    <p className="text-xs text-gray-500 mt-1">
                      Duration is automatically calculated from the video file. To change it, remove and re-upload the video.
                    </p>
                  )}
                </div>
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
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the full YouTube URL (e.g., https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID)
                </p>
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
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the full Vimeo URL (e.g., https://vimeo.com/123456789 or https://player.vimeo.com/video/123456789)
                </p>
              </div>
            )}
          </div>

          {/* Document Upload Section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Document Content
            </h3>
            <div className="space-y-4">
              {formData.document.filePath ? (
                <div className="relative group">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{formData.document.fileName || 'Document file'}</p>
                      {formData.document.pageCount && (
                        <p className="text-xs text-gray-500">Pages: {formData.document.pageCount}</p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={removeDocument}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : null}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.document.filePath ? "Replace PDF/File" : "Upload PDF/File"} <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
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
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border-gray-300"
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
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Extracted Text Content (Editable)
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
                {formData.document.pageCount && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Page Count
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.document.pageCount || ""}
                      onChange={(e) => handleDocumentChange("pageCount", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter page count"
                      readOnly
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Page count is automatically detected from PDF
                    </p>
                  </div>
                )}
              </div>
            </div>
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
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Update Content
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
