"use client";

import React, { useState, useEffect } from "react";
import { Button, Switch } from "@/components/ui";
import { Plus, Trash2, Save, ArrowLeft, ArrowRight, ArrowUp, ChevronUp } from "lucide-react";

const MultiStepTestForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedQuestion, setExpandedQuestion] = useState(0); // Track which question is expanded
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1: Test Details
    title: "",
    description: "",
    courseId: "",
    courseName: "",
    duration: "",
    passingScore: "",
    maxAttempts: "",
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
      }
    ]
  });

  const totalSteps = 2;

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

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Test submitted:", formData);
    // Handle form submission here
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Test Details</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test Title *
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
            Related Course *
          </label>
          <select
            value={formData.courseId}
            onChange={(e) => {
              handleInputChange("courseId", e.target.value);
              const courseName = e.target.options[e.target.selectedIndex].text;
              handleInputChange("courseName", courseName);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select a course</option>
            <option value="1">Marine Engineering Fundamentals</option>
            <option value="2">Advanced Navigation Techniques</option>
            <option value="3">Maritime Safety Protocols</option>
            <option value="4">Naval Operations Management</option>
            <option value="5">Submarine Systems Operation</option>
            <option value="6">Ship Stability and Construction</option>
            <option value="7">Electronic Navigation Systems</option>
            <option value="8">Emergency Response Procedures</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duration (minutes) *
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
            Passing Score (%) *
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maximum Attempts
          </label>
          <input
            type="number"
            value={formData.maxAttempts}
            onChange={(e) => handleInputChange("maxAttempts", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., 3 (0 for unlimited)"
            min="0"
          />
        </div>
      </div>

       <div>
         <label className="block text-sm font-medium text-gray-700 mb-2">
           Description
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

        <div className="flex items-center space-x-3">
          <Switch
            checked={formData.isActive}
            onChange={(checked) => handleInputChange("isActive", checked)}
          />
          <label className="text-sm font-medium text-gray-700">
            Activate test (make available to students)
          </label>
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
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1.5">
                       Question Text *
                     </label>
                     <textarea
                       value={question.question}
                       onChange={(e) => handleQuestionChange(actualIndex, "question", e.target.value)}
                       rows={2}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                       placeholder="Enter your question here"
                       required
                     />
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
            onClick={prevStep}
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
                onClick={nextStep}
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
              >
                <Save className="w-4 h-4" />
                Create Test
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


