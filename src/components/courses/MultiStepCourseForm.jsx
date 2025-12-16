"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Switch, SearchableSelect } from "@/components/ui";
import { Plus, Trash2, Save, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import * as courseAPI from "@/lib/api/course";
import * as categoryAPI from "@/lib/api/courseCategory";
import * as instructorAPI from "@/lib/api/instructor";
import { showSuccess, showError } from "@/lib/utils/sweetalert";

const MultiStepCourseForm = ({ initialData = null, isEdit = false }) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
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
        duration: ""
      }
    ]
  });

  const totalSteps = 3;
  const [categories, setCategories] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch categories and instructors
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [categoriesResponse, instructorsResponse] = await Promise.all([
          categoryAPI.getAllCategories({ limit: 100 }),
          instructorAPI.getAllInstructors({ limit: 100 })
        ]);

        if (categoriesResponse.success) {
          setCategories(categoriesResponse.data || []);
        }

        if (instructorsResponse.success) {
          setInstructors(instructorsResponse.data || []);
        }

        // If editing, fetch course data
        if (isEdit && initialData?.id) {
          const courseResponse = await courseAPI.getCourseById(initialData.id);
          if (courseResponse.success) {
            const course = courseResponse.data;
            setFormData({
              title: course.title || "",
              slug: course.slug || "",
              description: course.description || "",
              category: course.category?._id || course.category || "",
              instructor: course.instructor?._id || course.instructor || "",
              duration: course.duration || "",
              level: course.level || "beginner",
              price: course.price?.toString() || "",
              originalPrice: course.originalPrice?.toString() || "",
              image: course.image || "",
              isFeatured: course.isFeatured || false,
              isOnline: course.isOnline !== undefined ? course.isOnline : true,
              maxStudents: course.maxStudents || 100,
              prerequisites: course.prerequisites || "",
              learningObjectives: course.learningObjectives || [],
              chapters: course.chapters || [{ id: 1, title: "", description: "", duration: "" }]
            });
            // Set image preview if image exists
            if (course.image) {
              setImagePreview(course.image);
            }
          }
        } else if (initialData) {
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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showError('Invalid File Type', 'Please select an image file.');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showError('File Too Large', 'Image size should be less than 5MB.');
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    setFormData(prev => ({
      ...prev,
      image: ""
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
      // Handle image upload - convert to base64 if file is selected
      let imageUrl = formData.image;
      if (imageFile) {
        // Convert file to base64
        const reader = new FileReader();
        const base64Promise = new Promise((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
        });
        reader.readAsDataURL(imageFile);
        imageUrl = await base64Promise;
      }
      
      const courseData = {
        title: formData.title.trim(),
        slug: formData.slug.trim() || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: formData.description.trim(),
        category: formData.category,
        instructor: formData.instructor,
        duration: formData.duration.trim(),
        level: formData.level.toLowerCase(),
        price: parseFloat(formData.price) || 0,
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        image: imageUrl || undefined,
        isFeatured: formData.isFeatured,
        isOnline: formData.isOnline,
        maxStudents: formData.maxStudents || 100,
        prerequisites: formData.prerequisites?.trim() || undefined,
        learningObjectives: Array.isArray(formData.learningObjectives) 
          ? formData.learningObjectives.filter(obj => obj.trim())
          : undefined
      };

      let response;
      if (isEdit && initialData?.id) {
        response = await courseAPI.updateCourse(initialData.id, courseData);
      } else {
        response = await courseAPI.createCourse(courseData);
      }
      
      if (response.success) {
        showSuccess(
          isEdit ? 'Course Updated!' : 'Course Created!',
          `The course has been ${isEdit ? 'updated' : 'created'} successfully.`
        );
        setTimeout(() => {
          router.push('/courses');
        }, 1500);
      } else {
        showError('Error', response.message || `Failed to ${isEdit ? 'update' : 'create'} course`);
      }
    } catch (err) {
      showError('Error', err.message || `Failed to ${isEdit ? 'update' : 'create'} course`);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Course Title <span className="text-red-500">*</span>
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
            Course Slug <span className="text-red-500">*</span>
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
            Description <span className="text-red-500">*</span>
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
            Category <span className="text-red-500">*</span>
          </label>
          <SearchableSelect
            value={formData.category}
            onChange={(value) => handleInputChange("category", value)}
            options={categories}
            placeholder="Select category"
            displayKey="name"
            valueKey="_id"
            loading={loading}
            disabled={loading}
            required={true}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Instructor <span className="text-red-500">*</span>
          </label>
          <SearchableSelect
            value={formData.instructor}
            onChange={(value) => handleInputChange("instructor", value)}
            options={instructors}
            placeholder="Select instructor"
            displayKey={(instructor) => {
              const user = instructor.userId || {};
              return user.firstName && user.lastName 
                ? `${user.firstName} ${user.lastName}`
                : user.username || 'N/A';
            }}
            valueKey="_id"
            loading={loading}
            disabled={loading}
            required={true}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duration <span className="text-red-500">*</span>
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
            Level <span className="text-red-500">*</span>
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
            Price <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => handleInputChange("price", e.target.value)}
              className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Original Price <span className="text-gray-400 text-xs">(optional)</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              value={formData.originalPrice}
              onChange={(e) => handleInputChange("originalPrice", e.target.value)}
              className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Students <span className="text-gray-400 text-xs">(optional)</span>
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

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Course Image <span className="text-gray-400 text-xs">(optional)</span>
          </label>
          <div className="space-y-4">
            {imagePreview && (
              <div className="relative w-full max-w-md">
                <img
                  src={imagePreview}
                  alt="Course preview"
                  className="w-full h-48 object-cover rounded-lg border border-gray-300"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2 hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: JPG, PNG, GIF. Max size: 5MB
              </p>
            </div>
          </div>
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
          Prerequisites <span className="text-gray-400 text-xs">(optional)</span>
        </label>
        <textarea
          value={formData.prerequisites}
          onChange={(e) => handleInputChange("prerequisites", e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter prerequisites, one per line or separated by commas"
        />
        <p className="text-xs text-gray-500 mt-1">
          Enter each prerequisite on a new line or separate with commas. They will be displayed as bullet points.
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Learning Objectives <span className="text-gray-400 text-xs">(optional)</span>
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
                Chapter Title <span className="text-red-500">*</span>
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
                Duration <span className="text-gray-400 text-xs">(optional)</span>
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
                Description <span className="text-gray-400 text-xs">(optional)</span>
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
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isEdit ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {isEdit ? 'Update Course' : 'Create Course'}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default MultiStepCourseForm;