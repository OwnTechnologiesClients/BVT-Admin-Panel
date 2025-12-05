"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Switch } from "@/components/ui";
import { Plus, Trash2, Save, ArrowLeft, ArrowRight, ArrowUp, ChevronUp, Loader2 } from "lucide-react";
import * as testAPI from "@/lib/api/test";
import * as courseAPI from "@/lib/api/course";
import { showSuccess, showError } from "@/lib/utils/sweetalert";

const MultiStepTestForm = ({ initialData = null, isEdit = false }) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedQuestion, setExpandedQuestion] = useState(0); // Track which question is expanded
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [courses, setCourses] = useState([]);
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
    
    // Step 2: Questions
    questions: [
      {
        id: 1,
        question: "",
        options: ["", "", "", ""],
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
            setFormData({
              title: test.title || "",
              description: test.description || "",
              courseId: test.courseId?._id || test.courseId || "",
              courseName: test.courseId?.title || test.courseName || "",
              duration: test.duration?.toString() || "",
              passingScore: test.passingScore?.toString() || "",
              randomizeQuestions: test.randomizeQuestions || false,
              showResults: test.showResults !== undefined ? test.showResults : true,
              isActive: test.isActive !== undefined ? test.isActive : true,
              questions: test.questions && test.questions.length > 0
                ? test.questions.map((q, idx) => ({
                    id: idx + 1,
                    question: q.question || "",
                    options: q.options || ["", "", "", ""],
                    correctAnswer: q.correctAnswer || 0,
                    points: q.points || 1,
                    image: q.image || null
                  }))
                : [{
                    id: 1,
                    question: "",
                    options: ["", "", "", ""],
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

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setFormData(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };

  const addQuestion = () => {
    const newQuestion = {
      id: formData.questions.length + 1,
      question: "",
      options: ["", "", "", ""],
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
      
      // Check if any question has an image file
      const hasImageUploads = formData.questions.some(q => q.image && q.image instanceof File);
      
      // Prepare questions data (excluding File objects, they'll be added separately)
      const questionsData = formData.questions.map(q => ({
        question: q.question.trim(),
        options: q.options.filter(opt => opt.trim() !== ''),
        correctAnswer: q.correctAnswer,
        points: parseInt(q.points) || 1,
        image: q.image && typeof q.image === 'string' ? q.image : null // Keep existing image URL if not a File
      }));
      
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
        
        // Append question images with proper fieldnames
        formData.questions.forEach((q, index) => {
          if (q.image && q.image instanceof File) {
            testData.append(`questionImage[${index}]`, q.image);
          }
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
          questions: questionsData
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
          <select
            value={formData.courseId}
            onChange={(e) => {
              const selectedCourseId = e.target.value;
              handleInputChange("courseId", selectedCourseId);
              const selectedCourse = courses.find(c => c._id === selectedCourseId);
              handleInputChange("courseName", selectedCourse ? selectedCourse.title : "");
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select a course</option>
            {courses.map(course => (
              <option key={course._id} value={course._id}>
                {course.title}
              </option>
            ))}
          </select>
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

                   <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Options (Select the correct answer) *
                    </label>
                    {question.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex items-start gap-3">
                        <input
                          type="radio"
                          name={`question-${actualIndex}-answer`}
                          checked={question.correctAnswer === oIndex}
                          onChange={() => handleQuestionChange(actualIndex, "correctAnswer", oIndex)}
                          className="mt-3 w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <label className="block text-xs text-gray-600 mb-1">
                            Option {String.fromCharCode(65 + oIndex)}
                          </label>
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => handleOptionChange(actualIndex, oIndex, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder={`Enter option ${String.fromCharCode(65 + oIndex)}`}
                            required
                          />
                        </div>
                      </div>
                    ))}
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


