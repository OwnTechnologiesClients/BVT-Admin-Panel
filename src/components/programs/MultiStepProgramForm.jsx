"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Switch } from "@/components/ui";
import { Plus, Trash2, Save, ArrowLeft, ArrowRight, GraduationCap, Users, Award, Calendar, Loader2 } from "lucide-react";
import * as programAPI from "@/lib/api/program";
import * as categoryAPI from "@/lib/api/courseCategory";
import { showSuccess, showError } from "@/lib/utils/sweetalert";

const MultiStepProgramForm = ({ initialData = null, isEdit = false }) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    title: "",
    description: "",
    category: "",
    programDirector: "",
    duration: "",
    maxParticipants: "",
    isOnline: false,
    
    // Step 2: Program Details
    startDate: "",
    endDate: "",
    cost: "",
    difficulty: "",
    prerequisites: "",
    graduationRequirements: "",
    
    // Step 3: Program Structure
    modules: [
      {
        id: 1,
        title: "",
        description: "",
        duration: "",
        lessons: [
          {
            id: 1,
            title: "",
            description: "",
            duration: ""
          }
        ]
      }
    ],
    skills: ["Leadership", "Technical Skills"],
    certifications: ""
  });

  const totalSteps = 3;

  // Fetch categories and initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesResponse = await categoryAPI.getAllCategories({ limit: 100 });
        if (categoriesResponse.success) {
          setCategories(categoriesResponse.data || []);
        }

        // If editing, fetch program data
        if (isEdit && initialData?.id) {
          setLoading(true);
          const programResponse = await programAPI.getProgramById(initialData.id);
          if (programResponse.success) {
            const program = programResponse.data;
            setFormData({
              title: program.title || "",
              description: program.description || "",
              category: program.category?._id || program.category || "",
              programDirector: program.programDirector || "",
              duration: program.duration || "",
              maxParticipants: program.maxParticipants?.toString() || "",
              isOnline: program.isOnline || false,
              startDate: program.startDate ? new Date(program.startDate).toISOString().split('T')[0] : "",
              endDate: program.endDate ? new Date(program.endDate).toISOString().split('T')[0] : "",
              cost: program.cost?.toString() || "",
              difficulty: program.difficulty || "",
              prerequisites: program.prerequisites || "",
              graduationRequirements: program.graduationRequirements || "",
              modules: program.modules 
                ? program.modules.map((module, idx) => ({
                    id: module.id || idx + 1,
                    title: module.title || "",
                    description: module.description || "",
                    duration: module.duration || "",
                    lessons: module.lessons 
                      ? module.lessons.map((lesson, lidx) => ({
                          id: lesson.id || lidx + 1,
                          title: lesson.title || "",
                          description: lesson.description || "",
                          duration: lesson.duration || ""
                        }))
                      : [{ id: 1, title: "", description: "", duration: "" }]
                  }))
                : [{ id: 1, title: "", description: "", duration: "", lessons: [{ id: 1, title: "", description: "", duration: "" }] }],
              skills: program.skills || ["Leadership", "Technical Skills"],
              certifications: Array.isArray(program.certifications) ? program.certifications.join(', ') : (program.certifications || "")
            });
          }
        } else if (initialData) {
          // Use provided initial data
          setFormData(prev => ({ ...prev, ...initialData }));
        }
      } catch (err) {
        // Error fetching data
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

  const handleModuleChange = (moduleIndex, field, value) => {
    const updatedModules = [...formData.modules];
    updatedModules[moduleIndex][field] = value;
    setFormData(prev => ({
      ...prev,
      modules: updatedModules
    }));
  };

  const handleLessonChange = (moduleIndex, lessonIndex, field, value) => {
    const updatedModules = [...formData.modules];
    updatedModules[moduleIndex].lessons[lessonIndex][field] = value;
    setFormData(prev => ({
      ...prev,
      modules: updatedModules
    }));
  };

  const addModule = () => {
    const newModule = {
      id: formData.modules.length + 1,
      title: "",
      description: "",
      duration: "",
      lessons: [
        {
          id: 1,
          title: "",
          description: "",
          duration: ""
        }
      ]
    };
    setFormData(prev => ({
      ...prev,
      modules: [...prev.modules, newModule]
    }));
  };

  const removeModule = (index) => {
    if (formData.modules.length > 1) {
      const updatedModules = formData.modules.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        modules: updatedModules
      }));
    }
  };

  const addLesson = (moduleIndex) => {
    const updatedModules = [...formData.modules];
    const newLesson = {
      id: updatedModules[moduleIndex].lessons.length + 1,
      title: "",
      description: "",
      duration: ""
    };
    updatedModules[moduleIndex].lessons.push(newLesson);
    setFormData(prev => ({
      ...prev,
      modules: updatedModules
    }));
  };

  const removeLesson = (moduleIndex, lessonIndex) => {
    const updatedModules = [...formData.modules];
    if (updatedModules[moduleIndex].lessons.length > 1) {
      updatedModules[moduleIndex].lessons = updatedModules[moduleIndex].lessons.filter((_, i) => i !== lessonIndex);
      setFormData(prev => ({
        ...prev,
        modules: updatedModules
      }));
    }
  };

  const addSkill = () => {
    const newSkill = prompt("Enter new skill:");
    if (newSkill && newSkill.trim()) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
    }
  };

  const removeSkill = (index) => {
    const updatedSkills = formData.skills.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      skills: updatedSkills
    }));
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
    
    try {
      setSubmitting(true);
      
      // Prepare program data for API
      // Clean modules: remove id fields and filter out empty lessons
      const cleanModules = formData.modules
        .filter(module => module.title && module.title.trim()) // Only include modules with titles
        .map(module => ({
          title: module.title.trim(),
          description: module.description?.trim() || '',
          duration: module.duration?.trim() || '',
          lessons: (module.lessons || [])
            .filter(lesson => lesson.title && lesson.title.trim()) // Only include lessons with titles
            .map(lesson => ({
              title: lesson.title.trim(),
              description: lesson.description?.trim() || '',
              duration: lesson.duration?.trim() || ''
            }))
        }))
        .filter(module => module.lessons.length > 0); // Only include modules with at least one lesson

      // Validate required fields
      if (!formData.title || !formData.title.trim()) {
        showError('Validation Error', 'Program title is required');
        setSubmitting(false);
        return;
      }
      if (!formData.category) {
        showError('Validation Error', 'Category is required');
        setSubmitting(false);
        return;
      }
      if (!formData.programDirector || !formData.programDirector.trim()) {
        showError('Validation Error', 'Program director is required');
        setSubmitting(false);
        return;
      }
      if (!formData.duration || !formData.duration.trim()) {
        showError('Validation Error', 'Duration is required');
        setSubmitting(false);
        return;
      }
      if (!formData.startDate) {
        showError('Validation Error', 'Start date is required');
        setSubmitting(false);
        return;
      }
      if (!formData.endDate) {
        showError('Validation Error', 'End date is required');
        setSubmitting(false);
        return;
      }
      if (!formData.difficulty) {
        showError('Validation Error', 'Difficulty level is required');
        setSubmitting(false);
        return;
      }
      if (!formData.graduationRequirements || !formData.graduationRequirements.trim()) {
        showError('Validation Error', 'Graduation requirements are required');
        setSubmitting(false);
        return;
      }
      if (cleanModules.length === 0) {
        showError('Validation Error', 'At least one module with lessons is required');
        setSubmitting(false);
        return;
      }

      const programData = {
        title: formData.title.trim(),
        description: formData.description?.trim() || '',
        category: formData.category,
        programDirector: formData.programDirector.trim(),
        duration: formData.duration.trim(),
        maxParticipants: formData.maxParticipants && formData.maxParticipants.trim() 
          ? parseInt(formData.maxParticipants) 
          : undefined,
        isOnline: formData.isOnline || false,
        startDate: formData.startDate,
        endDate: formData.endDate,
        cost: formData.cost && formData.cost.trim() 
          ? parseFloat(formData.cost) 
          : 0,
        difficulty: formData.difficulty,
        prerequisites: formData.prerequisites && formData.prerequisites.trim() 
          ? formData.prerequisites.trim() 
          : undefined,
        graduationRequirements: formData.graduationRequirements.trim(),
        certifications: formData.certifications && formData.certifications.trim()
          ? formData.certifications.split(',').map(c => c.trim()).filter(c => c)
          : [],
        skills: Array.isArray(formData.skills) && formData.skills.length > 0
          ? formData.skills.filter(s => s && s.trim())
          : [],
        modules: cleanModules
      };

      let response;
      if (isEdit && initialData?.id) {
        response = await programAPI.updateProgram(initialData.id, programData);
      } else {
        response = await programAPI.createProgram(programData);
      }
      
      if (response.success) {
        showSuccess(
          isEdit ? 'Program Updated!' : 'Program Created!',
          `The program has been ${isEdit ? 'updated' : 'created'} successfully.`
        );
        setTimeout(() => {
        router.push('/programs');
        }, 1500);
      } else {
        const errorMessage = response.message || response.error || `Failed to ${isEdit ? 'update' : 'create'} program`;
        showError('Error', errorMessage);
      }
    } catch (err) {
      // Program submission error
      const errorMessage = err.message || err.response?.data?.message || 'Failed to save program. Please check the console for details.';
      showError('Error', errorMessage);
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
            Program Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter program title"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.category}
            onChange={(e) => handleInputChange("category", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            Program Director <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.programDirector}
            onChange={(e) => handleInputChange("programDirector", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter program director name"
            required
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
            placeholder="e.g., 6 months, 1 year"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maximum Participants <span className="text-gray-400 text-xs">(optional)</span>
          </label>
          <input
            type="number"
            value={formData.maxParticipants}
            onChange={(e) => handleInputChange("maxParticipants", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter max participants"
          />
        </div>

        <div className="flex items-center space-x-3">
          <Switch
            checked={formData.isOnline}
            onChange={(checked) => handleInputChange("isOnline", checked)}
          />
          <label className="text-sm font-medium text-gray-700">
            Online Program
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter program description"
          required
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Program Details</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => handleInputChange("startDate", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) => handleInputChange("endDate", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Program Cost <span className="text-gray-400 text-xs">(optional)</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              value={formData.cost}
              onChange={(e) => handleInputChange("cost", e.target.value)}
              className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty Level <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.difficulty}
            onChange={(e) => handleInputChange("difficulty", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select difficulty</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Prerequisites <span className="text-gray-400 text-xs">(optional)</span>
        </label>
        <textarea
          value={formData.prerequisites}
          onChange={(e) => handleInputChange("prerequisites", e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter prerequisites"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Graduation Requirements <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.graduationRequirements}
          onChange={(e) => handleInputChange("graduationRequirements", e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter graduation requirements"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Certifications <span className="text-gray-400 text-xs">(optional)</span>
        </label>
        <textarea
          value={formData.certifications}
          onChange={(e) => handleInputChange("certifications", e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter certifications offered"
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Program Structure</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addModule}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Module
        </Button>
      </div>

      {formData.modules.map((module, moduleIndex) => (
        <div key={module.id} className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Module {moduleIndex + 1}</h4>
            {formData.modules.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeModule(moduleIndex)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Module Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={module.title}
                onChange={(e) => handleModuleChange(moduleIndex, "title", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter module title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={module.duration}
                onChange={(e) => handleModuleChange(moduleIndex, "duration", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 2 weeks, 1 month"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Module Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={module.description}
              onChange={(e) => handleModuleChange(moduleIndex, "description", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter module description"
              required
            />
          </div>

          {/* Lessons */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between mb-4">
              <h5 className="font-medium text-gray-800">Lessons</h5>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addLesson(moduleIndex)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Lesson
              </Button>
            </div>

            {module.lessons.map((lesson, lessonIndex) => (
              <div key={lesson.id} className="bg-gray-50 rounded-lg p-4 mb-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">Lesson {lessonIndex + 1}</span>
                  {module.lessons.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeLesson(moduleIndex, lessonIndex)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={lesson.title}
                      onChange={(e) => handleLessonChange(moduleIndex, lessonIndex, "title", e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Lesson title"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Duration <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={lesson.duration}
                      onChange={(e) => handleLessonChange(moduleIndex, lessonIndex, "duration", e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 2 hours"
                      required
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={lesson.description}
                    onChange={(e) => handleLessonChange(moduleIndex, lessonIndex, "description", e.target.value)}
                    rows={2}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Lesson description"
                    required
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Skills */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900">Skills Developed</h4>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addSkill}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Skill
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.skills.map((skill, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
            >
              <span>{skill}</span>
              <button
                type="button"
                onClick={() => removeSkill(index)}
                className="text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
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

      <form 
        onSubmit={(e) => {
          // Only submit on the last step
          if (currentStep === totalSteps) {
            handleSubmit(e);
          } else {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        onKeyDown={(e) => {
          // Prevent Enter key from submitting form unless on last step
          if (e.key === 'Enter' && currentStep < totalSteps) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
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
                    Creating...
                  </>
                ) : (
                  <>
                <Save className="w-4 h-4" />
                {isEdit ? 'Update Program' : 'Create Program'}
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

export default MultiStepProgramForm;
