"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Switch, SearchableSelect } from "@/components/ui";
import { Plus, Trash2, Save, ArrowLeft, ArrowRight, ArrowUp, ChevronUp, Loader2 } from "lucide-react";
import * as testAPI from "@/lib/api/test";
import * as courseAPI from "@/lib/api/course";
import * as chapterAPI from "@/lib/api/chapter";
import * as lessonAPI from "@/lib/api/lesson";
import { showSuccess, showError } from "@/lib/utils/sweetalert";

const MultiStepTestForm = ({ initialData = null, isEdit = false }) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedQuestion, setExpandedQuestion] = useState(0); // Track which question is expanded
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [courses, setCourses] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1: Test Details
    title: "",
    description: "",
    courseId: "",
    courseName: "",
    duration: "",
    passingScore: "",
    randomizeQuestions: false,
    showResults: true,
    isActive: true,
    // Availability fields
    availabilityType: "",
    chapterId: "",
    lessonId: "",
    
    // Step 2: Questions
    questions: [
      {
        id: 1,
        question: "",
        options: [
          { type: "text", value: "" },
          { type: "text", value: "" },
          { type: "text", value: "" },
          { type: "text", value: "" }
        ],
        correctAnswer: 0,
        points: 1,
        image: null, // Add image field to each question
      }
    ]
  });

  const totalSteps = 2;

  // Fetch courses and initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch courses
        const coursesResponse = await courseAPI.getAllCourses({ limit: 100 });
        if (coursesResponse.success) {
          setCourses(coursesResponse.data || []);
        }

        // If editing, fetch test data
        if (isEdit && initialData?.id) {
          setLoading(true);
          const testResponse = await testAPI.getTestById(initialData.id);
          if (testResponse.success) {
            const test = testResponse.data;
            const courseId = test.courseId?._id || test.courseId || "";
            
            // Fetch chapters and lessons if courseId is available
            if (courseId) {
              const [chaptersRes, lessonsRes] = await Promise.all([
                chapterAPI.getChaptersByCourse(courseId),
                lessonAPI.getLessonsByCourse(courseId)
              ]);
              if (chaptersRes.success) setChapters(chaptersRes.data || []);
              if (lessonsRes.success) setLessons(lessonsRes.data || []);
            }
            
            // Process options - handle both old format (strings) and new format (objects)
            const processOptions = (options) => {
              if (!Array.isArray(options)) return [
                { type: "text", value: "" },
                { type: "text", value: "" },
                { type: "text", value: "" },
                { type: "text", value: "" }
              ];
              
              // If it's old format (strings), convert to new format
              if (options.length > 0 && typeof options[0] === 'string') {
                return options.map(opt => ({ type: "text", value: opt || "" }));
              }
              
              // If it's new format, ensure all have type and value
              return options.map(opt => {
                if (typeof opt === 'object' && opt !== null && opt.type && opt.value !== undefined) {
                  return opt;
                }
                return { type: "text", value: opt || "" };
              });
            };
            
            setFormData({
              title: test.title || "",
              description: test.description || "",
              courseId: courseId,
              courseName: test.courseId?.title || test.courseName || "",
              duration: test.duration?.toString() || "",
              passingScore: test.passingScore?.toString() || "",
              randomizeQuestions: test.randomizeQuestions || false,
              showResults: test.showResults !== undefined ? test.showResults : true,
              isActive: test.isActive !== undefined ? test.isActive : true,
              availabilityType: test.availabilityType || "end-of-course",
              chapterId: test.chapterId?._id || test.chapterId || "",
              lessonId: test.lessonId?._id || test.lessonId || "",
              questions: test.questions && test.questions.length > 0
                ? test.questions.map((q, idx) => {
                    const processedOptions = processOptions(q.options);
                    // Ensure we have at least 4 options
                    while (processedOptions.length < 4) {
                      processedOptions.push({ type: "text", value: "" });
                    }
                    return {
                    id: idx + 1,
                    question: q.question || "",
                      options: processedOptions,
                    correctAnswer: q.correctAnswer || 0,
                    points: q.points || 1,
                    image: q.image || null
                    };
                  })
                : [{
                    id: 1,
                    question: "",
                    options: [
                      { type: "text", value: "" },
                      { type: "text", value: "" },
                      { type: "text", value: "" },
                      { type: "text", value: "" }
                    ],
                    correctAnswer: 0,
                    points: 1,
                    image: null
                  }]
            });
          }
        } else if (initialData) {
          // Use provided initial data
          setFormData(prev => ({ ...prev, ...initialData }));
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isEdit, initialData]);

  // Handle scroll to show/hide scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index][field] = value;
    setFormData(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };

  const handleOptionChange = (questionIndex, optionIndex, field, value) => {
    const updatedQuestions = [...formData.questions];
    const currentOption = updatedQuestions[questionIndex].options[optionIndex];
    
    // Ensure option is in object format
    let optionObj;
    if (typeof currentOption === 'object' && currentOption !== null && currentOption.type) {
      // Already in object format
      optionObj = { ...currentOption };
    } else {
      // Convert from old format (string) to new format
      optionObj = {
        type: 'text',
        value: typeof currentOption === 'string' ? currentOption : ''
      };
    }
    
    if (field === 'type' || field === 'value') {
      optionObj[field] = value;
      // When changing type, reset value if needed
      if (field === 'type') {
        if (value === 'text') {
          optionObj.value = '';
        } else if (value === 'image') {
          optionObj.value = null;
        }
      }
    } else {
      // For backward compatibility - if value is passed directly
      optionObj = value;
    }
    
    updatedQuestions[questionIndex].options[optionIndex] = optionObj;
    setFormData(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };

  const handleOptionImageChange = (questionIndex, optionIndex, file) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[questionIndex].options[optionIndex] = {
      type: "image",
      value: file || null
    };
    setFormData(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };

  // Fetch chapters when course changes
  useEffect(() => {
    const fetchChapters = async () => {
      if (formData.courseId) {
        try {
          const response = await chapterAPI.getChaptersByCourse(formData.courseId);
          if (response.success) {
            setChapters(response.data || []);
          }
        } catch (err) {
          console.error('Error fetching chapters:', err);
        }
      } else {
        setChapters([]);
        setLessons([]);
        setFormData(prev => ({ ...prev, chapterId: "", lessonId: "" }));
      }
    };
    fetchChapters();
  }, [formData.courseId]);

  // Fetch lessons when chapter changes
  useEffect(() => {
    const fetchLessons = async () => {
      if (formData.chapterId) {
        try {
          const response = await lessonAPI.getLessonsByChapter(formData.chapterId);
          if (response.success) {
            setLessons(response.data || []);
          }
        } catch (err) {
          console.error('Error fetching lessons:', err);
        }
      } else {
        setLessons([]);
        setFormData(prev => ({ ...prev, lessonId: "" }));
      }
    };
    fetchLessons();
  }, [formData.chapterId]);

  const addQuestion = () => {
    const newQuestion = {
      id: formData.questions.length + 1,
      question: "",
      options: [
        { type: "text", value: "" },
        { type: "text", value: "" },
        { type: "text", value: "" },
        { type: "text", value: "" }
      ],
      correctAnswer: 0,
      points: 1,
      image: null, // Add image field to each question
    };
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
    // Expand the newly added question
    setExpandedQuestion(formData.questions.length);
  };

  const removeQuestion = (index) => {
    if (formData.questions.length > 1) {
      const updatedQuestions = formData.questions.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        questions: updatedQuestions
      }));
    }
  };

  const nextStep = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only submit if we're on the final step
    if (currentStep !== totalSteps) {
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Check if any question has an image file or any option has an image file
      const hasImageUploads = formData.questions.some(q => 
        (q.image && q.image instanceof File) ||
        q.options.some(opt => opt && typeof opt === 'object' && opt.type === 'image' && opt.value instanceof File)
      );
      
      // Prepare questions data (excluding File objects, they'll be added separately)
      const questionsData = formData.questions.map(q => {
        // Filter and map options properly
        const processedOptions = q.options
          .filter(opt => {
            // Filter out empty options
            if (typeof opt === 'object' && opt !== null && opt.type) {
              // For image options, only keep if there's a valid file or URL
              if (opt.type === 'image') {
                return opt.value !== null && opt.value !== undefined && opt.value !== '' && 
                       (opt.value instanceof File || (typeof opt.value === 'string' && opt.value.trim() !== ''));
              }
              // For text options, filter out empty values
              if (opt.type === 'text') {
                return opt.value !== null && opt.value !== undefined && opt.value !== '' && 
                       typeof opt.value === 'string' && opt.value.trim() !== '';
              }
              // Unknown type, filter out if value is empty
              return opt.value !== null && opt.value !== undefined && opt.value !== '';
            }
            // Old format (string) - filter out empty strings
            return opt !== null && opt !== undefined && opt !== '' && 
                   typeof opt === 'string' && opt.trim() !== '';
          })
          .map(opt => {
            // Convert to new format if needed
            if (typeof opt === 'object' && opt !== null && opt.type && opt.value !== undefined) {
              // If it's an image file, we'll handle it separately in FormData
              if (opt.type === 'image' && opt.value instanceof File) {
                return { type: 'image', value: '' }; // Placeholder, actual file will be in FormData
              }
              // If it's an image URL (string), keep it
              if (opt.type === 'image' && typeof opt.value === 'string' && opt.value.trim() !== '') {
                return { type: 'image', value: opt.value };
              }
              // If it's text, return the text value
              if (opt.type === 'text' && typeof opt.value === 'string') {
                return { type: 'text', value: opt.value };
              }
            }
            // Old format (string) - convert to new format
            if (typeof opt === 'string' && opt.trim() !== '') {
              return { type: 'text', value: opt };
            }
            // Should not reach here due to filter, but return null as fallback
            return null;
          })
          .filter(opt => opt !== null); // Remove any null values from mapping
        
        // Adjust correctAnswer index if options were filtered
        let adjustedCorrectAnswer = q.correctAnswer;
        if (q.correctAnswer !== null && q.correctAnswer !== undefined) {
          // Count how many options before the correct answer were filtered out
          const originalOptions = q.options;
          let validBeforeCorrect = 0;
          for (let i = 0; i < q.correctAnswer && i < originalOptions.length; i++) {
            const opt = originalOptions[i];
            if (typeof opt === 'object' && opt !== null && opt.type) {
              if (opt.type === 'image') {
                if (opt.value !== null && opt.value !== undefined && opt.value !== '' && 
                    (opt.value instanceof File || (typeof opt.value === 'string' && opt.value.trim() !== ''))) {
                  validBeforeCorrect++;
                }
              } else if (opt.type === 'text') {
                if (opt.value !== null && opt.value !== undefined && opt.value !== '' && 
                    typeof opt.value === 'string' && opt.value.trim() !== '') {
                  validBeforeCorrect++;
                }
              }
            } else if (typeof opt === 'string' && opt.trim() !== '') {
              validBeforeCorrect++;
            }
          }
          adjustedCorrectAnswer = validBeforeCorrect;
        }
        
        return {
        question: q.question.trim(),
          options: processedOptions,
          correctAnswer: adjustedCorrectAnswer,
        points: parseInt(q.points) || 1,
        image: q.image && typeof q.image === 'string' ? q.image : null // Keep existing image URL if not a File
        };
      });
      
      let testData;
      
      if (hasImageUploads) {
        // Use FormData if there are image uploads
        testData = new FormData();
        testData.append('title', formData.title.trim());
        testData.append('description', formData.description?.trim() || "");
        testData.append('courseId', formData.courseId);
        testData.append('duration', parseInt(formData.duration) || 60);
        testData.append('passingScore', parseInt(formData.passingScore) || 70);
        testData.append('randomizeQuestions', formData.randomizeQuestions);
        testData.append('showResults', formData.showResults);
        testData.append('isActive', formData.isActive);
        testData.append('questions', JSON.stringify(questionsData));
        
        // Append availability fields (required)
        testData.append('availabilityType', formData.availabilityType || 'end-of-course');
        if (formData.chapterId) testData.append('chapterId', formData.chapterId);
        if (formData.lessonId) testData.append('lessonId', formData.lessonId);
        
        // Append question images with proper fieldnames
        formData.questions.forEach((q, qIndex) => {
          if (q.image && q.image instanceof File) {
            testData.append(`questionImage[${qIndex}]`, q.image);
          }
          
          // Append option images - need to map to processed option indices
          // Count how many valid options come before each option with an image file
          q.options.forEach((opt, optIndex) => {
            if (opt && typeof opt === 'object' && opt.type === 'image' && opt.value instanceof File) {
              // Calculate the processed index by counting valid options before this one
              let processedIndex = 0;
              for (let i = 0; i < optIndex; i++) {
                const prevOpt = q.options[i];
                if (typeof prevOpt === 'object' && prevOpt !== null && prevOpt.type) {
                  if (prevOpt.type === 'image') {
                    if (prevOpt.value !== null && prevOpt.value !== undefined && prevOpt.value !== '' && 
                        (prevOpt.value instanceof File || (typeof prevOpt.value === 'string' && prevOpt.value.trim() !== ''))) {
                      processedIndex++;
                    }
                  } else if (prevOpt.type === 'text') {
                    if (prevOpt.value !== null && prevOpt.value !== undefined && prevOpt.value !== '' && 
                        typeof prevOpt.value === 'string' && prevOpt.value.trim() !== '') {
                      processedIndex++;
                    }
                  }
                } else if (typeof prevOpt === 'string' && prevOpt.trim() !== '') {
                  processedIndex++;
                }
              }
              testData.append(`optionImage[${qIndex}][${processedIndex}]`, opt.value);
            }
          });
        });
      } else {
        // Use plain object if no image uploads
        testData = {
          title: formData.title.trim(),
          description: formData.description?.trim() || "",
          courseId: formData.courseId,
          duration: parseInt(formData.duration) || 60,
          passingScore: parseInt(formData.passingScore) || 70,
          randomizeQuestions: formData.randomizeQuestions,
          showResults: formData.showResults,
          isActive: formData.isActive,
          questions: questionsData,
          availabilityType: formData.availabilityType || 'end-of-course',
          chapterId: formData.chapterId || null,
          lessonId: formData.lessonId || null
        };
      }

      let response;
      if (isEdit && initialData?.id) {
        response = await testAPI.updateTest(initialData.id, testData);
      } else {
        response = await testAPI.createTest(testData);
      }
      
      if (response.success) {
        showSuccess(
          isEdit ? 'Test Updated!' : 'Test Created!',
          `The test has been ${isEdit ? 'updated' : 'created'} successfully.`
        );
        setTimeout(() => {
        router.push(`/tests`);
        }, 1500);
      } else {
        showError('Error', response.message || `Failed to ${isEdit ? 'update' : 'create'} test`);
      }
    } catch (err) {
      showError('Error', err.message || `Failed to ${isEdit ? 'update' : 'create'} test`);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Test Details</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter test title"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Related Course <span className="text-red-500">*</span>
          </label>
          <SearchableSelect
            value={formData.courseId}
            onChange={(value) => {
              handleInputChange("courseId", value);
              const selectedCourse = courses.find(c => c._id === value);
              handleInputChange("courseName", selectedCourse ? selectedCourse.title : "");
            }}
            options={courses}
            placeholder="Select a course"
            displayKey="title"
            valueKey="_id"
            required={true}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duration (minutes) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.duration}
            onChange={(e) => handleInputChange("duration", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., 60"
            required
            min="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Passing Score (%) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.passingScore}
            onChange={(e) => handleInputChange("passingScore", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., 70"
            required
            min="0"
            max="100"
          />
        </div>
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
           placeholder="Enter test description and instructions"
         />
       </div>

       <div className="space-y-2 border-t pt-3">
        <h4 className="text-sm font-semibold text-gray-900">Test Settings</h4>
        
        <div className="flex items-center space-x-3">
          <Switch
            checked={formData.randomizeQuestions}
            onChange={(checked) => handleInputChange("randomizeQuestions", checked)}
          />
          <label className="text-sm font-medium text-gray-700">
            Randomize question order
          </label>
        </div>

        <div className="flex items-center space-x-3">
          <Switch
            checked={formData.showResults}
            onChange={(checked) => handleInputChange("showResults", checked)}
          />
          <label className="text-sm font-medium text-gray-700">
            Show results immediately after completion
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status <span className="text-gray-400 text-xs">(optional)</span>
          </label>
          <select
            value={formData.isActive ? "active" : "inactive"}
            onChange={(e) => handleInputChange("isActive", e.target.value === "active")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Test Availability Configuration */}
      <div className="space-y-3 border-t pt-4 mt-4">
        <h4 className="text-sm font-semibold text-gray-900">Test Availability</h4>
        <p className="text-xs text-gray-500 mb-3">
          Configure when this test becomes available to students
        </p>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Availability Type <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.availabilityType}
            onChange={(e) => {
              handleInputChange("availabilityType", e.target.value);
              if (e.target.value !== "after-lesson" && e.target.value !== "after-chapter") {
                handleInputChange("chapterId", "");
                handleInputChange("lessonId", "");
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select availability type</option>
            <option value="after-lesson">After a specific lesson</option>
            <option value="after-chapter">After a specific chapter</option>
            <option value="end-of-course">At the end of course</option>
          </select>
        </div>

        {formData.availabilityType === "after-lesson" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chapter <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.chapterId}
                onChange={(e) => handleInputChange("chapterId", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required={formData.availabilityType === "after-lesson"}
              >
                <option value="">Select a chapter</option>
                {chapters.map((chapter) => (
                  <option key={chapter._id} value={chapter._id}>
                    {chapter.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lesson <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.lessonId}
                onChange={(e) => handleInputChange("lessonId", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required={formData.availabilityType === "after-lesson"}
                disabled={!formData.chapterId || lessons.length === 0}
              >
                <option value="">Select a lesson</option>
                {lessons.map((lesson) => (
                  <option key={lesson._id} value={lesson._id}>
                    {lesson.title}
                  </option>
                ))}
              </select>
              {!formData.chapterId && (
                <p className="text-xs text-gray-500 mt-1">Please select a chapter first</p>
              )}
            </div>
          </>
        )}

        {formData.availabilityType === "after-chapter" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chapter <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.chapterId}
              onChange={(e) => handleInputChange("chapterId", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required={formData.availabilityType === "after-chapter"}
            >
              <option value="">Select a chapter</option>
              {chapters.map((chapter) => (
                <option key={chapter._id} value={chapter._id}>
                  {chapter.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {formData.availabilityType === "end-of-course" && (
          <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded-lg">
            This test will be available only after the student completes the entire course.
          </div>
        )}
      </div>
    </div>
  );

  // Filter questions based on search
  const filteredQuestions = formData.questions.filter((question, index) => {
    if (!searchQuery) return true;
    const questionNumber = index + 1;
    return questionNumber.toString().includes(searchQuery);
  });

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Test Questions</h3>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search question number..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {searchQuery && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setSearchQuery("")}
          >
            Clear
          </Button>
        )}
      </div>

      {filteredQuestions.map((question, qIndex) => {
        const actualIndex = formData.questions.findIndex(q => q.id === question.id);
        const isExpanded = expandedQuestion === actualIndex;

        return (
          <div key={question.id} className="border border-gray-200 rounded-lg">
            {/* Collapsed View */}
            {!isExpanded && (
              <div 
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedQuestion(actualIndex)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">Question {actualIndex + 1}</h4>
                    <p className="text-sm text-gray-600 mt-1 truncate">
                      {question.question || "No question text yet..."}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">{question.points} point{question.points !== 1 ? 's' : ''}</span>
                    {formData.questions.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeQuestion(actualIndex);
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

             {/* Expanded View */}
             {isExpanded && (
               <div className="p-4">
                 <div 
                   className="flex items-center justify-between mb-3 cursor-pointer hover:bg-gray-50 -mx-4 -mt-4 px-4 pt-4 pb-3 rounded-t-lg transition-colors"
                   onClick={() => setExpandedQuestion(null)}
                 >
                  <h4 className="font-medium text-gray-900">Question {actualIndex + 1}</h4>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600">Points:</label>
                      <input
                        type="number"
                        value={question.points}
                        onChange={(e) => handleQuestionChange(actualIndex, "points", e.target.value)}
                        className="w-16 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="1"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedQuestion(null)}
                      className="text-gray-600 hover:text-gray-700"
                      title="Collapse"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                    {formData.questions.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQuestion(actualIndex)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                 <div className="space-y-3">
                   {/* Question and Image Row */}
                   <div className="flex flex-col md:flex-row gap-6 items-start">
                     {/* Question Text */}
                     <div className="flex-1 w-full">
                       <label className="block text-sm font-medium text-gray-700 mb-1.5">Question Text *</label>
                       <textarea
                         value={question.question}
                         onChange={(e) => handleQuestionChange(actualIndex, "question", e.target.value)}
                         rows={2}
                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                         placeholder="Enter your question here"
                         required
                       />
                     </div>
                     {/* Image Upload Section */}
                     <div className="flex flex-col items-center gap-2 w-full md:w-[240px] max-w-xs min-w-[180px]">
                       <label className="block text-sm font-semibold text-gray-700 mb-1 mt-1 md:mt-0">Question Image <span className="font-normal text-xs text-gray-400">(optional)</span></label>
                       {question.image ? (
                         <div className="relative group mt-1 flex flex-col items-center">
                           <img
                             src={typeof question.image === 'string' ? question.image : URL.createObjectURL(question.image)}
                             alt="Question img"
                             className="rounded-xl border border-gray-200 max-h-40 min-h-[120px] max-w-[220px] object-contain shadow-md transition-all"
                             style={{ background: '#f5f6fa' }}
                           />
                           <button
                             type="button"
                             onClick={() => handleQuestionChange(actualIndex, "image", null)}
                             className="absolute top-1 right-1 bg-white bg-opacity-90 hover:bg-red-100 rounded-full p-1 text-red-600 border border-red-200 shadow opacity-85 hover:opacity-100 transition-all"
                             title="Remove image"
                           >
                             <Trash2 className="w-4 h-4" />
                           </button>
                         </div>
                       ) : (
                         <label className="block w-full cursor-pointer mt-2 bg-white border border-dashed border-gray-300 rounded-xl px-3 py-6 min-h-[140px] flex flex-col items-center justify-center text-base text-center text-gray-500 hover:border-blue-400 transition-all group">
                           <span className="block text-base font-medium">Click or drag to upload</span>
                           <input
                             type="file"
                             accept="image/*"
                             onChange={e => {
                               const file = e.target.files && e.target.files[0];
                               handleQuestionChange(actualIndex, "image", file || null);
                             }}
                             className="hidden"
                           />
                         </label>
                       )}
                     </div>
                   </div>

                   <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Options (Select the correct answer) *
                    </label>
                    {question.options.map((option, oIndex) => {
                      const optionValue = typeof option === 'object' && option !== null ? option.value : option;
                      const optionType = typeof option === 'object' && option !== null ? option.type : 'text';
                      const isImageOption = optionType === 'image';
                      const isImageFile = isImageOption && optionValue instanceof File;
                      const isImageUrl = isImageOption && typeof optionValue === 'string' && optionValue !== '';
                      
                      return (
                        <div key={oIndex} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                        <input
                          type="radio"
                          name={`question-${actualIndex}-answer`}
                          checked={question.correctAnswer === oIndex}
                          onChange={() => handleQuestionChange(actualIndex, "correctAnswer", oIndex)}
                          className="mt-3 w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="block text-xs font-medium text-gray-700">
                            Option {String.fromCharCode(65 + oIndex)}
                          </label>
                              <select
                                value={optionType}
                                onChange={(e) => {
                                  const newType = e.target.value;
                                  if (newType === 'text') {
                                    handleOptionChange(actualIndex, oIndex, 'type', 'text');
                                    handleOptionChange(actualIndex, oIndex, 'value', '');
                                  } else {
                                    handleOptionChange(actualIndex, oIndex, 'type', 'image');
                                    handleOptionChange(actualIndex, oIndex, 'value', null);
                                  }
                                }}
                                className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="text">Text</option>
                                <option value="image">Image</option>
                              </select>
                            </div>
                            
                            {optionType === 'text' ? (
                          <input
                            type="text"
                                value={optionValue || ''}
                                onChange={(e) => handleOptionChange(actualIndex, oIndex, 'value', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder={`Enter option ${String.fromCharCode(65 + oIndex)}`}
                            required
                          />
                            ) : (
                              <div className="space-y-2">
                                {isImageUrl || isImageFile ? (
                                  <div className="relative group">
                                    <img
                                      src={isImageFile ? URL.createObjectURL(optionValue) : optionValue}
                                      alt={`Option ${String.fromCharCode(65 + oIndex)}`}
                                      className="w-full max-h-48 object-contain rounded-lg border border-gray-300 bg-white"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleOptionImageChange(actualIndex, oIndex, null)}
                                      className="absolute top-2 right-2 bg-white bg-opacity-90 hover:bg-red-100 rounded-full p-1 text-red-600 border border-red-200 shadow opacity-85 hover:opacity-100 transition-all"
                                      title="Remove image"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                        </div>
                                ) : (
                                  <label className="block w-full cursor-pointer bg-white border border-dashed border-gray-300 rounded-lg px-4 py-6 flex flex-col items-center justify-center text-center text-gray-500 hover:border-blue-400 transition-all">
                                    <span className="block text-sm font-medium mb-1">Click to upload image</span>
                                    <span className="block text-xs">PNG, JPG, GIF up to 10MB</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => {
                                        const file = e.target.files && e.target.files[0];
                                        if (file) {
                                          handleOptionImageChange(actualIndex, oIndex, file);
                                        }
                                      }}
                                      className="hidden"
                                    />
                                  </label>
                                )}
                      </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                   <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded-lg">
                     <strong>Tip:</strong> Select the radio button next to the correct answer.
                   </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

       {formData.questions.length === 0 && (
         <div className="text-center py-8 bg-gray-50 rounded-lg">
           <p className="text-gray-600">No questions added yet</p>
         </div>
       )}

       <div className="flex justify-center pb-2">
        <Button
          type="button"
          variant="primary"
          onClick={addQuestion}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Question
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {[...Array(totalSteps)].map((_, index) => (
            <div key={index} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index + 1 <= currentStep
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {index + 1}
              </div>
              {index < totalSteps - 1 && (
                <div
                  className={`w-16 h-1 mx-2 ${
                    index + 1 < currentStep ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <span className="text-sm text-gray-600">
          Step {currentStep} of {totalSteps}
        </span>
      </div>

      <form onSubmit={handleSubmit}>
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={(e) => prevStep(e)}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex items-center gap-3">
            {currentStep < totalSteps ? (
              <Button
                type="button"
                variant="primary"
                onClick={(e) => nextStep(e)}
                className="flex items-center gap-2"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                variant="primary"
                className="flex items-center gap-2"
                disabled={submitting || loading}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isEdit ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {isEdit ? 'Update Test' : 'Create Test'}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </form>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default MultiStepTestForm;


