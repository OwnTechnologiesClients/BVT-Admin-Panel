"use client";

import React, { useState } from "react";
import { Button, Switch } from "@/components/ui";
import { Plus, Trash2, Save, ArrowLeft, ArrowRight, Calendar, MapPin, Users, Clock } from "lucide-react";

const MultiStepEventForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    title: "",
    description: "",
    eventType: "",
    category: "",
    maxAttendees: "",
    isOnline: false,
    eventImage: null,
    tags: [],
    
    // Step 2: Event Details
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    location: "",
    onlineLink: "",
    registrationDeadline: "",
    cost: "",
    
    // Step 3: Speakers
    speakers: [
      {
        id: 1,
        name: "",
        bio: "",
        company: "",
        title: "",
        photo: null,
        email: "",
        linkedin: "",
        topics: ""
      }
    ],
    
    // Step 4: Event Schedule
    agenda: [
      {
        id: 1,
        time: "",
        title: "",
        description: "",
        speaker: "",
        duration: ""
      }
    ]
  });

  const totalSteps = 4;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAgendaChange = (index, field, value) => {
    const updatedAgenda = [...formData.agenda];
    updatedAgenda[index][field] = value;
    setFormData(prev => ({
      ...prev,
      agenda: updatedAgenda
    }));
  };

  const addAgendaItem = () => {
    const newItem = {
      id: formData.agenda.length + 1,
      time: "",
      title: "",
      description: "",
      speaker: "",
      duration: ""
    };
    setFormData(prev => ({
      ...prev,
      agenda: [...prev.agenda, newItem]
    }));
  };

  const removeAgendaItem = (index) => {
    if (formData.agenda.length > 1) {
      const updatedAgenda = formData.agenda.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        agenda: updatedAgenda
      }));
    }
  };

  const handleSpeakerChange = (index, field, value) => {
    const updatedSpeakers = [...formData.speakers];
    updatedSpeakers[index][field] = value;
    setFormData(prev => ({
      ...prev,
      speakers: updatedSpeakers
    }));
  };

  const addSpeaker = () => {
    const newSpeaker = {
      id: formData.speakers.length + 1,
      name: "",
      bio: "",
      company: "",
      title: "",
      photo: null,
      email: "",
      linkedin: "",
      topics: ""
    };
    setFormData(prev => ({
      ...prev,
      speakers: [...prev.speakers, newSpeaker]
    }));
  };

  const removeSpeaker = (index) => {
    if (formData.speakers.length > 1) {
      const updatedSpeakers = formData.speakers.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        speakers: updatedSpeakers
      }));
    }
  };

  const addTag = (tag) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
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
    console.log("Event submitted:", formData);
    // Handle form submission here
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
      
      {/* Event Image Upload */}
      <div className="flex flex-col items-center gap-4">
        <label className="block text-sm font-semibold text-gray-700">Event Cover Image <span className="font-normal text-xs text-gray-400">(optional)</span></label>
        {formData.eventImage ? (
          <div className="relative group">
            <img
              src={typeof formData.eventImage === 'string' ? formData.eventImage : URL.createObjectURL(formData.eventImage)}
              alt="Event cover"
              className="rounded-xl border border-gray-200 max-h-48 max-w-md object-cover shadow-md"
            />
            <button
              type="button"
              onClick={() => handleInputChange("eventImage", null)}
              className="absolute top-2 right-2 bg-white hover:bg-red-100 rounded-full p-2 text-red-600 border border-red-200 shadow"
              title="Remove image"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="block cursor-pointer bg-white border border-dashed border-gray-300 rounded-xl px-6 py-8 min-h-[200px] min-w-[300px] flex flex-col items-center justify-center text-center text-gray-500 hover:border-blue-400 transition-all">
            <Plus className="w-12 h-12 mb-2" />
            <span className="font-medium">Click to upload event cover image</span>
            <input
              type="file"
              accept="image/*"
              onChange={e => handleInputChange("eventImage", e.target.files[0])}
              className="hidden"
            />
          </label>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Event Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter event title"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Event Type *
          </label>
          <select
            value={formData.eventType}
            onChange={(e) => handleInputChange("eventType", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select event type</option>
            <option value="conference">Conference</option>
            <option value="workshop">Workshop</option>
            <option value="seminar">Seminar</option>
            <option value="training">Training Session</option>
            <option value="meeting">Meeting</option>
          </select>
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
            Maximum Attendees
          </label>
          <input
            type="number"
            value={formData.maxAttendees}
            onChange={(e) => handleInputChange("maxAttendees", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter max attendees"
          />
        </div>

        <div className="flex items-center space-x-3">
          <Switch
            checked={formData.isOnline}
            onChange={(checked) => handleInputChange("isOnline", checked)}
          />
          <label className="text-sm font-medium text-gray-700">
            Online Event
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter event description"
          required
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags / Topics
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.tags.map((tag, idx) => (
            <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:text-blue-900"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          placeholder="Type a tag and press Enter"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addTag(e.target.value.trim());
              e.target.value = '';
            }
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Event Details</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date *
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
            End Date *
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
            Start Time *
          </label>
          <input
            type="time"
            value={formData.startTime}
            onChange={(e) => handleInputChange("startTime", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Time *
          </label>
          <input
            type="time"
            value={formData.endTime}
            onChange={(e) => handleInputChange("endTime", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {!formData.isOnline && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location *
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter event location"
              required
            />
          </div>
        )}

        {formData.isOnline && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Online Link *
            </label>
            <input
              type="url"
              value={formData.onlineLink}
              onChange={(e) => handleInputChange("onlineLink", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter online meeting link"
              required
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Registration Deadline
          </label>
          <input
            type="datetime-local"
            value={formData.registrationDeadline}
            onChange={(e) => handleInputChange("registrationDeadline", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cost
          </label>
          <input
            type="number"
            value={formData.cost}
            onChange={(e) => handleInputChange("cost", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter event cost"
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Event Speakers</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addSpeaker}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Speaker
        </Button>
      </div>

      {formData.speakers.map((speaker, index) => (
        <div key={speaker.id} className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Speaker {index + 1}</h4>
            {formData.speakers.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeSpeaker(index)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
              <input
                type="text"
                value={speaker.name}
                onChange={(e) => handleSpeakerChange(index, "name", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title/Position</label>
              <input
                type="text"
                value={speaker.title}
                onChange={(e) => handleSpeakerChange(index, "title", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Company/Organization</label>
              <input
                type="text"
                value={speaker.company}
                onChange={(e) => handleSpeakerChange(index, "company", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={speaker.email}
                onChange={(e) => handleSpeakerChange(index, "email", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn URL</label>
              <input
                type="url"
                value={speaker.linkedin}
                onChange={(e) => handleSpeakerChange(index, "linkedin", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Speaker Photo</label>
              {speaker.photo ? (
                <div className="relative inline-block">
                  <img
                    src={typeof speaker.photo === 'string' ? speaker.photo : URL.createObjectURL(speaker.photo)}
                    alt={speaker.name}
                    className="rounded-lg border border-gray-200 max-h-32 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleSpeakerChange(index, "photo", null)}
                    className="absolute top-1 right-1 bg-white hover:bg-red-100 rounded-full p-1 text-red-600 border border-red-200"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="block cursor-pointer bg-white border border-dashed border-gray-300 rounded-lg px-4 py-3 w-fit hover:border-blue-400 transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => handleSpeakerChange(index, "photo", e.target.files[0])}
                    className="hidden"
                  />
                  Click to upload photo
                </label>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio *</label>
              <textarea
                value={speaker.bio}
                onChange={(e) => handleSpeakerChange(index, "bio", e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Speaking Topics</label>
              <input
                type="text"
                value={speaker.topics}
                onChange={(e) => handleSpeakerChange(index, "topics", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Marine Engineering, Navigation Systems, Safety Protocols"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Event Schedule</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addAgendaItem}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Agenda Item
        </Button>
      </div>

      {formData.agenda.map((item, index) => (
        <div key={item.id} className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Agenda Item {index + 1}</h4>
            {formData.agenda.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeAgendaItem(index)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time *
              </label>
              <input
                type="time"
                value={item.time}
                onChange={(e) => handleAgendaChange(index, "time", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration *
              </label>
              <input
                type="text"
                value={item.duration}
                onChange={(e) => handleAgendaChange(index, "duration", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 30 minutes, 1 hour"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Speaker
              </label>
              <input
                type="text"
                value={item.speaker}
                onChange={(e) => handleAgendaChange(index, "speaker", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter speaker name"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={item.title}
              onChange={(e) => handleAgendaChange(index, "title", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter agenda item title"
              required
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={item.description}
              onChange={(e) => handleAgendaChange(index, "description", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter agenda item description"
              required
            />
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
        {currentStep === 4 && renderStep4()}

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
                Create Event
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default MultiStepEventForm;
