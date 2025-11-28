"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Switch } from "@/components/ui";
import { Plus, Trash2, Save, ArrowLeft, ArrowRight, Users, Award, Star, MapPin, Loader2, X } from "lucide-react";
import * as userAPI from "@/lib/api/user";
import * as instructorAPI from "@/lib/api/instructor";

const MultiStepMentorForm = ({ initialData = null, isEdit = false }) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [instructorUsers, setInstructorUsers] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [formData, setFormData] = useState({
    // Step 1: Select User and Basic Information
    userId: "",
    department: "",
    bio: "",
    isActive: true,
    
    // Step 2: Professional Details
    experience: "",
    specializations: "",
    achievements: [
      {
        id: 1,
        title: "",
        description: "",
        date: "",
        organization: ""
      }
    ],
    certifications: [
      {
        id: 1,
        name: "",
        issuer: "",
        date: "",
        expiryDate: ""
      }
    ],
    rating: 5,
    
    // Step 3: Teaching & Availability
    locations: [
      {
        id: 1,
        name: "",
        address: "",
        type: "onsite"
      }
    ],
    teachingMethods: [
      {
        id: 1,
        method: "",
        description: ""
      }
    ],
    languages: [
      {
        id: 1,
        language: "",
        proficiency: "native"
      }
    ],
    availability: {
      monday: { start: "09:00", end: "17:00", available: true },
      tuesday: { start: "09:00", end: "17:00", available: true },
      wednesday: { start: "09:00", end: "17:00", available: true },
      thursday: { start: "09:00", end: "17:00", available: true },
      friday: { start: "09:00", end: "17:00", available: true },
      saturday: { start: "09:00", end: "13:00", available: false },
      sunday: { start: "09:00", end: "13:00", available: false }
    }
  });

  const totalSteps = 3;

  // Fetch users with instructor role
  useEffect(() => {
    const fetchInstructorUsers = async () => {
      try {
        setLoading(true);
        const response = await userAPI.getAllUsers({ 
          role: 'instructor',
          status: 1,
          limit: 100 
        });
        if (response.success) {
          setInstructorUsers(response.data || []);
        }

        // If editing, fetch instructor data
        if (isEdit && initialData?.id) {
          const instructorResponse = await instructorAPI.getInstructorById(initialData.id);
          if (instructorResponse.success) {
            // Handle different response structures
            const instructor = instructorResponse.data?.instructor || instructorResponse.data?.data || instructorResponse.data;
            setFormData({
              userId: instructor.userId?._id || instructor.userId || "",
              department: instructor.department || "",
              bio: instructor.bio || "",
              isActive: instructor.isActive !== undefined ? instructor.isActive : true,
              experience: instructor.experience?.toString() || "",
              specializations: instructor.specializations || "",
              achievements: instructor.achievements && instructor.achievements.length > 0 
                ? instructor.achievements.map((ach, idx) => ({
                    id: idx + 1,
                    title: ach.title || "",
                    description: ach.description || "",
                    date: ach.date ? new Date(ach.date).toISOString().split('T')[0] : "",
                    organization: ach.organization || ""
                  }))
                : [{ id: 1, title: "", description: "", date: "", organization: "" }],
              certifications: instructor.certifications && instructor.certifications.length > 0
                ? instructor.certifications.map((cert, idx) => ({
                    id: idx + 1,
                    name: cert.name || "",
                    issuer: cert.issuer || "",
                    date: cert.date ? new Date(cert.date).toISOString().split('T')[0] : "",
                    expiryDate: cert.expiryDate ? new Date(cert.expiryDate).toISOString().split('T')[0] : ""
                  }))
                : [{ id: 1, name: "", issuer: "", date: "", expiryDate: "" }],
              rating: instructor.rating || 5,
              locations: instructor.locations && instructor.locations.length > 0
                ? instructor.locations.map((loc, idx) => ({
                    id: idx + 1,
                    name: loc.name || "",
                    address: loc.address || "",
                    type: loc.type || "onsite"
                  }))
                : [{ id: 1, name: "", address: "", type: "onsite" }],
              teachingMethods: instructor.teachingMethods && instructor.teachingMethods.length > 0
                ? instructor.teachingMethods.map((tm, idx) => ({
                    id: idx + 1,
                    method: tm.method || "",
                    description: tm.description || ""
                  }))
                : [{ id: 1, method: "", description: "" }],
              languages: instructor.languages && instructor.languages.length > 0
                ? instructor.languages.map((lang, idx) => ({
                    id: idx + 1,
                    language: lang.language || "",
                    proficiency: lang.proficiency || "native"
                  }))
                : [{ id: 1, language: "", proficiency: "native" }],
              availability: instructor.availability || {
                monday: { start: "09:00", end: "17:00", available: true },
                tuesday: { start: "09:00", end: "17:00", available: true },
                wednesday: { start: "09:00", end: "17:00", available: true },
                thursday: { start: "09:00", end: "17:00", available: true },
                friday: { start: "09:00", end: "17:00", available: true },
                saturday: { start: "09:00", end: "13:00", available: false },
                sunday: { start: "09:00", end: "13:00", available: false }
              }
            });
            
            // Set profile picture preview if available
            if (instructor.profilePic) {
              // Helper to convert image path to full URL if needed
              const getImageUrl = (imagePath) => {
                if (!imagePath) return '';
                if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
                  return imagePath;
                }
                if (imagePath.startsWith('data:image')) {
                  return imagePath;
                }
                // Convert relative path to full backend URL
                const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
                return `${backendUrl}${imagePath.startsWith('/') ? imagePath : '/' + imagePath}`;
              };
              setImagePreview(getImageUrl(instructor.profilePic));
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
    fetchInstructorUsers();
  }, [isEdit, initialData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
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
  };

  const handleAvailabilityChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: {
          ...prev.availability[day],
          [field]: value
        }
      }
    }));
  };

  const addAchievement = () => {
    const newAchievement = {
      id: formData.achievements.length + 1,
      title: "",
      description: "",
      date: "",
      organization: ""
    };
    setFormData(prev => ({
      ...prev,
      achievements: [...prev.achievements, newAchievement]
    }));
  };

  const removeAchievement = (index) => {
    const updatedAchievements = formData.achievements.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      achievements: updatedAchievements
    }));
  };

  const addCertification = () => {
    const newCertification = {
      id: formData.certifications.length + 1,
      name: "",
      issuer: "",
      date: "",
      expiryDate: ""
    };
    setFormData(prev => ({
      ...prev,
      certifications: [...prev.certifications, newCertification]
    }));
  };

  const removeCertification = (index) => {
    const updatedCertifications = formData.certifications.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      certifications: updatedCertifications
    }));
  };

  const addLocation = () => {
    const newLocation = {
      id: formData.locations.length + 1,
      name: "",
      address: "",
      type: "onsite"
    };
    setFormData(prev => ({
      ...prev,
      locations: [...prev.locations, newLocation]
    }));
  };

  const removeLocation = (index) => {
    const updatedLocations = formData.locations.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      locations: updatedLocations
    }));
  };

  const addTeachingMethod = () => {
    const newMethod = {
      id: formData.teachingMethods.length + 1,
      method: "",
      description: ""
    };
    setFormData(prev => ({
      ...prev,
      teachingMethods: [...prev.teachingMethods, newMethod]
    }));
  };

  const removeTeachingMethod = (index) => {
    const updatedMethods = formData.teachingMethods.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      teachingMethods: updatedMethods
    }));
  };

  const addLanguage = () => {
    const newLanguage = {
      id: formData.languages.length + 1,
      language: "",
      proficiency: "native"
    };
    setFormData(prev => ({
      ...prev,
      languages: [...prev.languages, newLanguage]
    }));
  };

  const removeLanguage = (index) => {
    const updatedLanguages = formData.languages.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      languages: updatedLanguages
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
    e.stopPropagation();
    
    // Only submit if we're on the last step
    if (currentStep !== totalSteps) {
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Validate required fields
      if (!formData.userId || !formData.department) {
        alert('Please select a user and department');
        setSubmitting(false);
        return;
      }

      // Create FormData if image is uploaded, otherwise use plain object
      const hasImageUpload = imageFile !== null && imageFile instanceof File;
      let instructorData;
      
      if (hasImageUpload) {
        // Use FormData for file upload (like OMS pattern)
        instructorData = new FormData();
        instructorData.append('department', formData.department);
        instructorData.append('isActive', formData.isActive);
        if (formData.bio?.trim()) {
          instructorData.append('bio', formData.bio.trim());
        }
        if (formData.experience) {
          instructorData.append('experience', parseInt(formData.experience));
        }
        if (formData.specializations?.trim()) {
          instructorData.append('specializations', formData.specializations.trim());
        }
        if (formData.rating) {
          instructorData.append('rating', formData.rating);
        }
        
        // Stringify complex objects as JSON (backend will parse them)
        const achievements = formData.achievements
          .filter(ach => ach.title && ach.title.trim())
          .map(ach => ({
            title: ach.title.trim(),
            description: ach.description?.trim() || undefined,
            date: ach.date || undefined,
            organization: ach.organization?.trim() || undefined
          }));
        if (achievements.length > 0) {
          instructorData.append('achievements', JSON.stringify(achievements));
        }
        
        const certifications = formData.certifications
          .filter(cert => cert.name && cert.name.trim())
          .map(cert => ({
            name: cert.name.trim(),
            issuer: cert.issuer?.trim() || undefined,
            date: cert.date || undefined,
            expiryDate: cert.expiryDate || undefined
          }));
        if (certifications.length > 0) {
          instructorData.append('certifications', JSON.stringify(certifications));
        }
        
        const locations = formData.locations
          .filter(loc => loc.name && loc.name.trim())
          .map(loc => ({
            name: loc.name.trim(),
            address: loc.address?.trim() || undefined,
            type: loc.type || 'onsite'
          }));
        if (locations.length > 0) {
          instructorData.append('locations', JSON.stringify(locations));
        }
        
        const teachingMethods = formData.teachingMethods
          .filter(tm => tm.method && tm.method.trim())
          .map(tm => ({
            method: tm.method.trim(),
            description: tm.description?.trim() || undefined
          }));
        if (teachingMethods.length > 0) {
          instructorData.append('teachingMethods', JSON.stringify(teachingMethods));
        }
        
        const languages = formData.languages
          .filter(lang => lang.language && lang.language.trim())
          .map(lang => ({
            language: lang.language.trim(),
            proficiency: lang.proficiency || 'native'
          }));
        if (languages.length > 0) {
          instructorData.append('languages', JSON.stringify(languages));
        }
        
        // Append availability as JSON
        instructorData.append('availability', JSON.stringify(formData.availability));
        
        // Append profile picture file only if it's a new file
        if (imageFile instanceof File) {
          instructorData.append('profilePic', imageFile);
        }
        
        // Append userId for create (not for update)
        if (!isEdit) {
          instructorData.append('userId', formData.userId);
        }
      } else {
        // Use plain object if no image upload
        instructorData = {
          department: formData.department,
          isActive: formData.isActive,
          bio: formData.bio?.trim() || undefined,
          experience: formData.experience ? parseInt(formData.experience) : undefined,
          specializations: formData.specializations?.trim() || undefined,
          achievements: formData.achievements
            .filter(ach => ach.title && ach.title.trim())
            .map(ach => ({
              title: ach.title.trim(),
              description: ach.description?.trim() || undefined,
              date: ach.date || undefined,
              organization: ach.organization?.trim() || undefined
            })),
          certifications: formData.certifications
            .filter(cert => cert.name && cert.name.trim())
            .map(cert => ({
              name: cert.name.trim(),
              issuer: cert.issuer?.trim() || undefined,
              date: cert.date || undefined,
              expiryDate: cert.expiryDate || undefined
            })),
          rating: formData.rating || 5,
          locations: formData.locations
            .filter(loc => loc.name && loc.name.trim())
            .map(loc => ({
              name: loc.name.trim(),
              address: loc.address?.trim() || undefined,
              type: loc.type || 'onsite'
            })),
          teachingMethods: formData.teachingMethods
            .filter(tm => tm.method && tm.method.trim())
            .map(tm => ({
              method: tm.method.trim(),
              description: tm.description?.trim() || undefined
            })),
          languages: formData.languages
            .filter(lang => lang.language && lang.language.trim())
            .map(lang => ({
              language: lang.language.trim(),
              proficiency: lang.proficiency || 'native'
            })),
          availability: formData.availability
        };
        
        // Add userId for create (not for update)
        if (!isEdit) {
          instructorData.userId = formData.userId;
        }
      }

      let response;
      if (isEdit && initialData?.id) {
        // Update existing instructor
        response = await instructorAPI.updateInstructor(initialData.id, instructorData);
      } else {
        // Create new instructor with selected userId
        response = await instructorAPI.createInstructor(instructorData);
      }
      
      if (response.success) {
        router.push('/instructors');
      } else {
        alert(response.message || `Failed to ${isEdit ? 'update' : 'create'} instructor`);
      }
    } catch (err) {
      alert(err.message || `Failed to ${isEdit ? 'update' : 'create'} instructor`);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep1 = () => {
    // Get image preview (from instructor profilePic or uploaded file)
    const currentProfilePic = imagePreview || "";
    
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select User (Instructor Role) <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.userId}
              onChange={(e) => {
                handleInputChange("userId", e.target.value);
                // Clear image preview when user is changed (unless there's a file)
                if (!e.target.value && !imageFile) {
                  setImagePreview("");
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading || isEdit}
            >
              <option value="">{loading ? "Loading users..." : "Select a user with instructor role"}</option>
              {instructorUsers.map(user => {
                const name = user.firstName && user.lastName 
                  ? `${user.firstName} ${user.lastName} (${user.username})`
                  : user.username;
                return (
                  <option key={user._id} value={user._id}>
                    {name} - {user.email}
                  </option>
                );
              })}
            </select>
            {instructorUsers.length === 0 && !loading && (
              <p className="text-sm text-gray-500 mt-1">
                No users with instructor role found. <Link href="/users/add" className="text-blue-600 hover:underline">Create a user with instructor role</Link> first.
              </p>
            )}
          </div>

          {/* Profile Picture Upload */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Picture <span className="text-gray-400 text-xs">(optional)</span>
            </label>
            <div className="space-y-4">
              {(imagePreview || currentProfilePic) && (
                <div className="relative inline-block">
                  <img
                    src={imagePreview || currentProfilePic}
                    alt="Profile preview"
                    className="w-32 h-32 rounded-full object-cover border-2 border-gray-300"
                    onError={(e) => {
                      e.target.src = '/images/user-placeholder.jpg';
                    }}
                  />
                  {imageFile && (
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Upload a profile picture (JPG, PNG, GIF). Max size: 5MB
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.department}
              onChange={(e) => handleInputChange("department", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select department</option>
              <option value="marine-engineering">Marine Engineering</option>
              <option value="navigation">Navigation</option>
              <option value="maritime-safety">Maritime Safety</option>
              <option value="naval-operations">Naval Operations</option>
              <option value="submarine-operations">Submarine Operations</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio <span className="text-gray-400 text-xs">(optional)</span>
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter instructor biography"
            />
            <p className="text-xs text-gray-500 mt-1">
              A brief description about the instructor's background and expertise
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Switch
              checked={formData.isActive}
              onChange={(checked) => handleInputChange("isActive", checked)}
            />
            <label className="text-sm font-medium text-gray-700">
              Active Instructor <span className="text-gray-400 text-xs">(optional)</span>
            </label>
          </div>
        </div>
      </div>
    );
  };

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Professional Details</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Years of Experience <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.experience}
            onChange={(e) => handleInputChange("experience", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter years of experience"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating <span className="text-gray-400 text-xs">(optional)</span>
          </label>
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleInputChange("rating", star)}
                className={`w-6 h-6 ${
                  star <= formData.rating ? "text-yellow-400" : "text-gray-300"
                }`}
              >
                <Star className="w-full h-full fill-current" />
              </button>
            ))}
            <span className="text-sm text-gray-600">({formData.rating}/5)</span>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Specializations <span className="text-gray-400 text-xs">(optional)</span>
        </label>
        <textarea
          value={formData.specializations}
          onChange={(e) => handleInputChange("specializations", e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter specializations"
        />
      </div>

      {/* Achievements */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900">Achievements</h4>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addAchievement}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Achievement
          </Button>
        </div>

        {formData.achievements.map((achievement, index) => (
          <div key={achievement.id} className="border border-gray-200 rounded-lg p-4 mb-3">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-gray-800">Achievement {index + 1}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeAchievement(index)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={achievement.title}
                  onChange={(e) => {
                    const updatedAchievements = [...formData.achievements];
                    updatedAchievements[index].title = e.target.value;
                    setFormData(prev => ({ ...prev, achievements: updatedAchievements }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Achievement title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={achievement.date}
                  onChange={(e) => {
                    const updatedAchievements = [...formData.achievements];
                    updatedAchievements[index].date = e.target.value;
                    setFormData(prev => ({ ...prev, achievements: updatedAchievements }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization
                </label>
                <input
                  type="text"
                  value={achievement.organization}
                  onChange={(e) => {
                    const updatedAchievements = [...formData.achievements];
                    updatedAchievements[index].organization = e.target.value;
                    setFormData(prev => ({ ...prev, achievements: updatedAchievements }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Organization name"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={achievement.description}
                onChange={(e) => {
                  const updatedAchievements = [...formData.achievements];
                  updatedAchievements[index].description = e.target.value;
                  setFormData(prev => ({ ...prev, achievements: updatedAchievements }));
                }}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Achievement description"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Certifications */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900">Certifications</h4>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addCertification}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Certification
          </Button>
        </div>

        {formData.certifications.map((certification, index) => (
          <div key={certification.id} className="border border-gray-200 rounded-lg p-4 mb-3">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-gray-800">Certification {index + 1}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeCertification(index)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Certification Name *
                </label>
                <input
                  type="text"
                  value={certification.name}
                  onChange={(e) => {
                    const updatedCertifications = [...formData.certifications];
                    updatedCertifications[index].name = e.target.value;
                    setFormData(prev => ({ ...prev, certifications: updatedCertifications }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Certification name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Issuing Organization *
                </label>
                <input
                  type="text"
                  value={certification.issuer}
                  onChange={(e) => {
                    const updatedCertifications = [...formData.certifications];
                    updatedCertifications[index].issuer = e.target.value;
                    setFormData(prev => ({ ...prev, certifications: updatedCertifications }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Issuing organization"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Issue Date
                </label>
                <input
                  type="date"
                  value={certification.date}
                  onChange={(e) => {
                    const updatedCertifications = [...formData.certifications];
                    updatedCertifications[index].date = e.target.value;
                    setFormData(prev => ({ ...prev, certifications: updatedCertifications }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={certification.expiryDate}
                  onChange={(e) => {
                    const updatedCertifications = [...formData.certifications];
                    updatedCertifications[index].expiryDate = e.target.value;
                    setFormData(prev => ({ ...prev, certifications: updatedCertifications }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Teaching & Availability</h3>
      
      {/* Locations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900">Teaching Locations</h4>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addLocation}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Location
          </Button>
        </div>

        {formData.locations.map((location, index) => (
          <div key={location.id} className="border border-gray-200 rounded-lg p-4 mb-3">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-gray-800">Location {index + 1}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeLocation(index)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location Name *
                </label>
                <input
                  type="text"
                  value={location.name}
                  onChange={(e) => {
                    const updatedLocations = [...formData.locations];
                    updatedLocations[index].name = e.target.value;
                    setFormData(prev => ({ ...prev, locations: updatedLocations }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Location name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <input
                  type="text"
                  value={location.address}
                  onChange={(e) => {
                    const updatedLocations = [...formData.locations];
                    updatedLocations[index].address = e.target.value;
                    setFormData(prev => ({ ...prev, locations: updatedLocations }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Full address"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type *
                </label>
                <select
                  value={location.type}
                  onChange={(e) => {
                    const updatedLocations = [...formData.locations];
                    updatedLocations[index].type = e.target.value;
                    setFormData(prev => ({ ...prev, locations: updatedLocations }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="onsite">On-site</option>
                  <option value="online">Online</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Languages */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900">Languages</h4>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addLanguage}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Language
          </Button>
        </div>

        {formData.languages.map((language, index) => (
          <div key={language.id} className="border border-gray-200 rounded-lg p-4 mb-3">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-gray-800">Language {index + 1}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeLanguage(index)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Language *
                </label>
                <input
                  type="text"
                  value={language.language}
                  onChange={(e) => {
                    const updatedLanguages = [...formData.languages];
                    updatedLanguages[index].language = e.target.value;
                    setFormData(prev => ({ ...prev, languages: updatedLanguages }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Language name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Proficiency Level *
                </label>
                <select
                  value={language.proficiency}
                  onChange={(e) => {
                    const updatedLanguages = [...formData.languages];
                    updatedLanguages[index].proficiency = e.target.value;
                    setFormData(prev => ({ ...prev, languages: updatedLanguages }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="native">Native</option>
                  <option value="fluent">Fluent</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="basic">Basic</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Weekly Availability */}
      <div>
        <h4 className="font-medium text-gray-900 mb-4">Weekly Availability</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(formData.availability).map(([day, schedule]) => (
            <div key={day} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-medium text-gray-800 capitalize">{day}</h5>
                <Switch
                  checked={schedule.available}
                  onChange={(checked) => handleAvailabilityChange(day, "available", checked)}
                />
              </div>
              
              {schedule.available && (
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={schedule.start}
                      onChange={(e) => handleAvailabilityChange(day, "start", e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={schedule.end}
                      onChange={(e) => handleAvailabilityChange(day, "end", e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              )}
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

      <form onSubmit={handleSubmit} noValidate>
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
                    {isEdit ? 'Update Instructor' : 'Create Instructor'}
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

export default MultiStepMentorForm;
