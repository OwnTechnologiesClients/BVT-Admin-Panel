"use client";

import React, { useState } from "react";
import { Button, Switch } from "@/components/ui";
import { Plus, Trash2, Save, ArrowLeft, ArrowRight } from "lucide-react";

const MultiStepCourseForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    title: "",
    slug: "",
    description: "",
    category: "",
    instructor: "",
    duration: "",
    level: "Beginner",
    price: "",
    originalPrice: "",
    image: "",
    isFeatured: false,
    isOnline: true,
    maxStudents: 100,
    
    // Step 2: Course Details
    prerequisites: "",
    learningObjectives: [],
    
    // Step 3: Course Structure (Chapters)
    chapters: [
      {
        id: 1,
        title: "",
        description: "",
        order: 1,
        duration: ""
      }
    ]
  });

  const totalSteps = 3;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleChapterChange = (index, field, value) => {
    const updatedChapters = [...formData.chapters];
    updatedChapters[index][field] = value;
    setFormData(prev => ({
      ...prev,
      chapters: updatedChapters
    }));
  };

  const addChapter = () => {
    const newChapter = {
      id: formData.chapters.length + 1,
      title: "",
      description: "",
      order: formData.chapters.length + 1,
      duration: ""
    };
    setFormData(prev => ({
      ...prev,
      chapters: [...prev.chapters, newChapter]
    }));
  };

  const removeChapter = (index) => {
    if (formData.chapters.length > 1) {
      const updatedChapters = formData.chapters.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        chapters: updatedChapters
      }));
    }
  };

  const addLearningObjective = () => {
    setFormData(prev => ({
      ...prev,
      learningObjectives: [...prev.learningObjectives, ""]
    }));
  };

  const removeLearningObjective = (index) => {
    const updatedObjectives = formData.learningObjectives.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      learningObjectives: updatedObjectives
    }));
  };

  const handleObjectiveChange = (index, value) => {
    const updatedObjectives = [...formData.learningObjectives];
    updatedObjectives[index] = value;
    setFormData(prev => ({
      ...prev,
      learningObjectives: updatedObjectives
    }));
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
    console.log("Course submitted:", formData);
    // Handle form submission here
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Course Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter course title"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Course Slug *
          </label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => handleInputChange("slug", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="course-slug"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter course description"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            value={formData.category}
            onChange={(e) => handleInputChange("category", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select category</option>
            <option value="marine-engineering">Marine Engineering</option>
            <option value="navigation">Navigation</option>
            <option value="maritime-safety">Maritime Safety</option>
            <option value="naval-operations">Naval Operations</option>
            <option value="submarine-operations">Submarine Operations</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Instructor *
          </label>
          <select
            value={formData.instructor}
            onChange={(e) => handleInputChange("instructor", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select instructor</option>
            <option value="instructor-1">Commander Sarah Johnson</option>
            <option value="instructor-2">Captain Michael Chen</option>
            <option value="instructor-3">Lieutenant Commander David Rodriguez</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duration *
          </label>
          <input
            type="text"
            value={formData.duration}
            onChange={(e) => handleInputChange("duration", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., 12 weeks, 5 days"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Level *
          </label>
          <select
            value={formData.level}
            onChange={(e) => handleInputChange("level", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price *
          </label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => handleInputChange("price", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter course price"
            min="0"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Original Price
          </label>
          <input
            type="number"
            value={formData.originalPrice}
            onChange={(e) => handleInputChange("originalPrice", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter original price"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Students
          </label>
          <input
            type="number"
            value={formData.maxStudents}
            onChange={(e) => handleInputChange("maxStudents", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Maximum students"
            min="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Course Image
          </label>
          <input
            type="text"
            value={formData.image}
            onChange={(e) => handleInputChange("image", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Image URL"
          />
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-3">
          <Switch
            checked={formData.isOnline}
            onChange={(checked) => handleInputChange("isOnline", checked)}
          />
          <label className="text-sm font-medium text-gray-700">
            Online Course
          </label>
        </div>

        <div className="flex items-center space-x-3">
          <Switch
            checked={formData.isFeatured}
            onChange={(checked) => handleInputChange("isFeatured", checked)}
          />
          <label className="text-sm font-medium text-gray-700">
            Featured Course
          </label>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Course Details</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Prerequisites
        </label>
        <textarea
          value={formData.prerequisites}
          onChange={(e) => handleInputChange("prerequisites", e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter course prerequisites"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Learning Objectives
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addLearningObjective}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Objective
          </Button>
        </div>

        {formData.learningObjectives.map((objective, index) => (
          <div key={index} className="flex items-center gap-3 mb-3">
            <input
              type="text"
              value={objective}
              onChange={(e) => handleObjectiveChange(index, e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter learning objective"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeLearningObjective(index)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Course Structure</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addChapter}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Chapter
        </Button>
      </div>

      {formData.chapters.map((chapter, index) => (
        <div key={chapter.id} className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Chapter {index + 1}</h4>
            {formData.chapters.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeChapter(index)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chapter Title *
              </label>
              <input
                type="text"
                value={chapter.title}
                onChange={(e) => handleChapterChange(index, "title", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter chapter title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration
              </label>
              <input
                type="text"
                value={chapter.duration}
                onChange={(e) => handleChapterChange(index, "duration", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 2 hours"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={chapter.description}
                onChange={(e) => handleChapterChange(index, "description", e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter chapter description"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
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
        {currentStep === 3 && renderStep3()}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
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
                Create Course
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default MultiStepCourseForm;