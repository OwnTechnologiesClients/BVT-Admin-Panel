"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { PageBreadcrumb } from "@/components/common";
import { Button } from "@/components/ui";
import { ArrowLeft, Save, Loader2, Trash2, Upload } from "lucide-react";
import * as courseAPI from "@/lib/api/course";
import * as categoryAPI from "@/lib/api/courseCategory";
import * as instructorAPI from "@/lib/api/instructor";

export default function UpdateCoursePage({ params }) {
  const router = useRouter();
  const { id } = use(params);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    category: "",
    instructor: "",
    duration: "",
    level: "beginner",
    price: "",
    originalPrice: "",
    image: "",
    isFeatured: false,
    isOnline: true,
    maxStudents: 100,
    status: "draft",
    prerequisites: "",
    learningObjectives: ""
  });

  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // Fetch categories, instructors, and course data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [categoriesResponse, instructorsResponse, courseResponse] = await Promise.all([
          categoryAPI.getAllCategories({ limit: 100 }),
          instructorAPI.getAllInstructors({ limit: 100 }),
          courseAPI.getCourseById(id)
        ]);

        if (categoriesResponse.success) {
          setCategories(categoriesResponse.data || []);
        }

        if (instructorsResponse.success) {
          setInstructors(instructorsResponse.data || []);
        }

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
            status: course.status || "draft",
            prerequisites: course.prerequisites || "",
            learningObjectives: Array.isArray(course.learningObjectives) 
              ? course.learningObjectives.join('\n')
              : course.learningObjectives || ""
          });
          // Set image preview if image exists
          if (course.image) {
            setImagePreview(course.image);
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const difficulties = [
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" },
    { value: "expert", label: "Expert" }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-generate slug from title
    if (field === 'title') {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setFormData(prev => ({
        ...prev,
        slug: slug
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Course title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.instructor) {
      newErrors.instructor = "Instructor is required";
    }

    if (!formData.duration.trim()) {
      newErrors.duration = "Duration is required";
    }

    const priceValue = typeof formData.price === 'string' ? parseFloat(formData.price) : formData.price;
    if (!priceValue || priceValue <= 0 || isNaN(priceValue)) {
      newErrors.price = "Price is required and must be greater than 0";
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
      
      // Create FormData instead of JSON (like OMS pattern)
      const formDataObj = new FormData();
      
      // Append form fields
      formDataObj.append('title', formData.title.trim());
      formDataObj.append('slug', formData.slug.trim() || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
      formDataObj.append('description', formData.description.trim());
      formDataObj.append('category', formData.category);
      formDataObj.append('instructor', formData.instructor);
      formDataObj.append('duration', formData.duration.trim());
      formDataObj.append('level', formData.level);
      formDataObj.append('price', parseFloat(formData.price));
      if (formData.originalPrice) {
        formDataObj.append('originalPrice', parseFloat(formData.originalPrice));
      }
      formDataObj.append('isFeatured', formData.isFeatured);
      formDataObj.append('isOnline', formData.isOnline);
      formDataObj.append('maxStudents', formData.maxStudents || 100);
      formDataObj.append('status', formData.status);
      if (formData.prerequisites?.trim()) {
        formDataObj.append('prerequisites', formData.prerequisites.trim());
      }
      // Send learningObjectives as a newline-separated string (backend will parse it)
      if (formData.learningObjectives) {
        formDataObj.append('learningObjectives', formData.learningObjectives);
      }
      
      // Append image file only if a new one is selected
      // If no new file, backend will keep existing image
      if (imageFile) {
        formDataObj.append('image', imageFile);
      }

      const response = await courseAPI.updateCourse(id, formDataObj);
      
      if (response.success) {
        router.push('/courses');
      } else {
        alert(response.message || 'Failed to update course');
      }
    } catch (err) {
      alert(err.message || 'Failed to update course');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageBreadcrumb 
        pageTitle="Update Course"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Courses", href: "/courses" },
          { label: "Update Course", href: `/courses/update/${id}` }
        ]}
      />

      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={() => router.push('/courses')}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Courses
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
                  Course Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.title ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter course title"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.category ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instructor *
                </label>
                <select
                  value={formData.instructor}
                  onChange={(e) => handleInputChange("instructor", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.instructor ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select an instructor</option>
                  {instructors.map(instructor => {
                    const user = instructor.userId || {};
                    const name = user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName}`
                      : user.username || 'N/A';
                    return (
                      <option key={instructor._id} value={instructor._id}>
                        {name}
                    </option>
                    );
                  })}
                </select>
                {errors.instructor && <p className="text-red-500 text-sm mt-1">{errors.instructor}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration *
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => handleInputChange("duration", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.duration ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g., 4 weeks, 40 hours"
                />
                {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Students
                </label>
                <input
                  type="number"
                  value={formData.maxStudents}
                  onChange={(e) => handleInputChange("maxStudents", e.target.value === "" ? "" : parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="50"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value === "" ? "" : parseFloat(e.target.value))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.price ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="299.99"
                  min="0"
                  step="0.01"
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Original Price
                </label>
                <input
                  type="number"
                  value={formData.originalPrice}
                  onChange={(e) => handleInputChange("originalPrice", e.target.value === "" ? "" : parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="399.99"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => handleInputChange("level", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {difficulties.map(difficulty => (
                    <option key={difficulty.value} value={difficulty.value}>
                      {difficulty.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={6}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter course description"
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Image
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prerequisites
                </label>
                <textarea
                  value={formData.prerequisites}
                  onChange={(e) => handleInputChange("prerequisites", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="List any prerequisites..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Learning Objectives (one per line)
                </label>
                <textarea
                  value={formData.learningObjectives}
                  onChange={(e) => handleInputChange("learningObjectives", e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="What will students learn...&#10;One objective per line"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isOnline"
                    checked={formData.isOnline}
                    onChange={(e) => handleInputChange("isOnline", e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="isOnline" className="text-sm font-medium text-gray-700">
                    Online Course
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onChange={(e) => handleInputChange("isFeatured", e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="isFeatured" className="text-sm font-medium text-gray-700">
                    Featured Course
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => router.push('/courses')}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              className="flex items-center gap-2"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Update Course
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
