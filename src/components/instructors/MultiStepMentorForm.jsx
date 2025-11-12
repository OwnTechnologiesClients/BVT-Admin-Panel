"use client";

import React, { useState } from "react";
import { Button, Switch } from "@/components/ui";
import { Plus, Trash2, Save, ArrowLeft, ArrowRight, Users, Award, Star, MapPin } from "lucide-react";

const MultiStepMentorForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "mentor",
    department: "",
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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
    console.log("Mentor submitted:", formData);
    // Handle form submission here
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name *
          </label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => handleInputChange("firstName", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter first name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Name *
          </label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => handleInputChange("lastName", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter last name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter email address"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter phone number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Department *
          </label>
          <select
            value={formData.department}
            onChange={(e) => handleInputChange("department", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select department</option>
            <option value="marine-engineering">Marine Engineering</option>
            <option value="navigation">Navigation</option>
            <option value="maritime-safety">Maritime Safety</option>
            <option value="naval-operations">Naval Operations</option>
            <option value="submarine-operations">Submarine Operations</option>
          </select>
        </div>

        <div className="flex items-center space-x-3">
          <Switch
            checked={formData.isActive}
            onChange={(checked) => handleInputChange("isActive", checked)}
          />
          <label className="text-sm font-medium text-gray-700">
            Active Mentor
          </label>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Professional Details</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Years of Experience *
          </label>
          <input
            type="number"
            value={formData.experience}
            onChange={(e) => handleInputChange("experience", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter years of experience"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating
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
          Specializations
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
                Create Mentor
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default MultiStepMentorForm;
