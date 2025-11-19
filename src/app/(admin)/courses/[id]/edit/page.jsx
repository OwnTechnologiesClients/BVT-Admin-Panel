"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import * as courseAPI from "@/lib/api/course";
import * as categoryAPI from "@/lib/api/courseCategory";
import * as instructorAPI from "@/lib/api/instructor";

export default function EditCoursePage() {
  const router = useRouter();
  const { id } = useParams();
  const [course, setCourse] = useState({
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
  const [categories, setCategories] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch course
        const courseResponse = await courseAPI.getCourseById(id);
        if (courseResponse.success) {
          const courseData = courseResponse.data;
          // Format prerequisites and learning objectives
          const prerequisites = Array.isArray(courseData.prerequisites) 
            ? courseData.prerequisites.join('\n')
            : (typeof courseData.prerequisites === 'string' ? courseData.prerequisites : '');
          
          const learningObjectives = Array.isArray(courseData.learningObjectives)
            ? courseData.learningObjectives.join('\n')
            : (typeof courseData.learningObjectives === 'string' ? courseData.learningObjectives : '');

          setCourse({
            title: courseData.title || "",
            slug: courseData.slug || "",
            description: courseData.description || "",
            category: courseData.category?._id || courseData.category || "",
            instructor: courseData.instructor?._id || courseData.instructor || "",
            duration: courseData.duration || "",
            level: courseData.level || "beginner",
            price: courseData.price?.toString() || "",
            originalPrice: courseData.originalPrice?.toString() || "",
            image: courseData.image || "",
            isFeatured: courseData.isFeatured || false,
            isOnline: courseData.isOnline !== undefined ? courseData.isOnline : true,
            maxStudents: courseData.maxStudents || 100,
            status: courseData.status || "draft",
            prerequisites: prerequisites,
            learningObjectives: learningObjectives
          });
        } else {
          setError('Course not found');
        }

        // Fetch categories
        const categoriesResponse = await categoryAPI.getAllCategories({ limit: 100 });
        if (categoriesResponse.success) {
          setCategories(categoriesResponse.data || []);
        }

        // Fetch instructors
        const instructorsResponse = await instructorAPI.getAllInstructors({ limit: 100 });
        if (instructorsResponse.success) {
          setInstructors(instructorsResponse.data || []);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      const formDataObj = new FormData();
      formDataObj.append('title', course.title.trim());
      formDataObj.append('slug', course.slug.trim());
      formDataObj.append('description', course.description.trim());
      formDataObj.append('category', course.category);
      formDataObj.append('instructor', course.instructor);
      formDataObj.append('duration', course.duration.trim());
      formDataObj.append('level', course.level);
      formDataObj.append('price', course.price ? parseFloat(course.price) : 0);
      if (course.originalPrice) {
        formDataObj.append('originalPrice', parseFloat(course.originalPrice));
      }
      if (course.image) {
        formDataObj.append('image', course.image);
      }
      formDataObj.append('isFeatured', course.isFeatured);
      formDataObj.append('isOnline', course.isOnline);
      formDataObj.append('maxStudents', course.maxStudents || 100);
      formDataObj.append('status', course.status);
      if (course.prerequisites?.trim()) {
        formDataObj.append('prerequisites', course.prerequisites.trim());
      }
      if (course.learningObjectives?.trim()) {
        formDataObj.append('learningObjectives', course.learningObjectives.trim());
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

  if (error) {
    return (
      <div className="max-w-xl mx-auto p-8">
        <button 
          onClick={() => router.back()} 
          className="bg-gray-100 rounded-lg p-2 border mb-4 hover:bg-gray-200"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h1 className="text-xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <button 
        onClick={() => router.back()} 
        className="bg-gray-100 rounded-lg p-2 border mb-4 hover:bg-gray-200"
      >
        <ArrowLeft className="w-4 h-4" />
      </button>
      <h1 className="text-2xl font-bold mb-6">Edit Course</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Title <span className="text-red-500">*</span>
              </label>
              <input 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                value={course.title} 
                onChange={e => setCourse({...course, title: e.target.value})}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug <span className="text-red-500">*</span>
              </label>
              <input 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                value={course.slug} 
                onChange={e => setCourse({...course, slug: e.target.value})}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={course.category}
                onChange={e => setCourse({...course, category: e.target.value})}
                required
              >
                <option value="">Select category</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instructor <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={course.instructor}
                onChange={e => setCourse({...course, instructor: e.target.value})}
                required
              >
                <option value="">Select instructor</option>
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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration <span className="text-red-500">*</span>
              </label>
              <input 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                value={course.duration} 
                onChange={e => setCourse({...course, duration: e.target.value})}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input 
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  value={course.price} 
                  onChange={e => setCourse({...course, price: e.target.value})}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Original Price <span className="text-gray-500 text-xs font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input 
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  value={course.originalPrice} 
                  onChange={e => setCourse({...course, originalPrice: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Students <span className="text-gray-500 text-xs font-normal">(Optional)</span>
              </label>
              <input 
                type="number"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                value={course.maxStudents} 
                onChange={e => setCourse({...course, maxStudents: parseInt(e.target.value) || 100})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level <span className="text-gray-500 text-xs font-normal">(Optional)</span>
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={course.level}
                onChange={e => setCourse({...course, level: e.target.value})}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status <span className="text-gray-500 text-xs font-normal">(Optional)</span>
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={course.status}
                onChange={e => setCourse({...course, status: e.target.value})}
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
                Description <span className="text-red-500">*</span>
              </label>
              <textarea 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                rows={6}
                value={course.description} 
                onChange={e => setCourse({...course, description: e.target.value})}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL <span className="text-gray-500 text-xs font-normal">(Optional)</span>
              </label>
              <input 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                value={course.image} 
                onChange={e => setCourse({...course, image: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prerequisites (one per line) <span className="text-gray-500 text-xs font-normal">(Optional)</span>
              </label>
              <textarea
                value={course.prerequisites}
                onChange={e => setCourse({...course, prerequisites: e.target.value})}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="List any prerequisites...&#10;One prerequisite per line"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Learning Objectives (one per line) <span className="text-gray-500 text-xs font-normal">(Optional)</span>
              </label>
              <textarea
                value={course.learningObjectives}
                onChange={e => setCourse({...course, learningObjectives: e.target.value})}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="What will students learn...&#10;One objective per line"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={course.isOnline} 
                  onChange={e => setCourse({...course, isOnline: e.target.checked})}
                  className="rounded"
                />
                <label className="text-sm font-medium text-gray-700">
                  Online Course
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={course.isFeatured} 
                  onChange={e => setCourse({...course, isFeatured: e.target.checked})}
                  className="rounded"
                />
                <label className="text-sm font-medium text-gray-700">
                  Featured Course
                </label>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-4 mt-8">
          <button 
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save
              </>
            )}
          </button>
          <button 
            type="button"
            className="bg-gray-100 px-5 py-2 rounded-lg border hover:bg-gray-200" 
            onClick={() => router.back()}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
