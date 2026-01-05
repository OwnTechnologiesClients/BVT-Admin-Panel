"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Mail, 
  ArrowLeft, 
  Send, 
  Save, 
  Users, 
  Eye,
  RefreshCw,
  CheckCircle,
  ChevronDown,
  Calendar,
  BookOpen,
  Info
} from "lucide-react";
import { 
  getEmailTemplates, 
  previewEmailTemplate, 
  getAudienceCount, 
  createCampaign,
  sendTestEmail 
} from "@/lib/api/email";
import { getAllCourses, getCourseById } from "@/lib/api/course";
import { getAllEvents, getEventById } from "@/lib/api/event";

export default function CreateCampaignPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [courses, setCourses] = useState([]);
  const [events, setEvents] = useState([]);
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [audienceCount, setAudienceCount] = useState(0);
  const [audienceLoading, setAudienceLoading] = useState(false);
  const [testEmailSending, setTestEmailSending] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [bannerImage, setBannerImage] = useState(null);
  const [bannerImagePreview, setBannerImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    templateType: '',
    subject: '',
    audience: {
      type: 'all_students',
      courseId: '',
      eventId: '',
      inactiveDays: 30
    },
    variables: {},
    // For linking to actual event/course
    eventId: '',
    courseId: ''
  });

  // Templates that require event selection
  const eventTemplates = ['event_announcement', 'event_reminder', 'event_update', 'event_cancelled'];
  
  // Templates that require course selection
  const courseTemplates = ['course_announcement', 'course_new_content'];
  
  // Automatic templates (sent by system, not manually)
  const automaticTemplates = ['welcome', 'course_enrollment_confirmation', 'course_completion', 'query_response'];
  
  // Marketing templates (custom content)
  const marketingTemplates = ['promotional', 're_engagement'];

  // Only show templates available for manual campaigns
  const availableTemplateTypes = [...eventTemplates, ...courseTemplates, ...marketingTemplates];

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (formData.templateType) {
      fetchPreview();
    }
  }, [formData.templateType]);

  useEffect(() => {
    // Only fetch count if all required fields are present for the selected audience type
    if (formData.audience.type) {
      const needsCourseId = formData.audience.type === 'course_enrolled';
      const needsEventId = formData.audience.type === 'event_registered';
      
      // Reset count if required field is missing
      if ((needsCourseId && !formData.audience.courseId) || (needsEventId && !formData.audience.eventId)) {
        setAudienceCount(0);
        return;
      }
      
      fetchAudienceCount();
    }
  }, [formData.audience]);

  // Auto-populate event details when event is selected
  useEffect(() => {
    if (formData.eventId && eventTemplates.includes(formData.templateType)) {
      fetchEventDetails(formData.eventId);
    }
  }, [formData.eventId]);

  // Auto-populate course details when course is selected
  useEffect(() => {
    if (formData.courseId && courseTemplates.includes(formData.templateType)) {
      fetchCourseDetails(formData.courseId);
    }
  }, [formData.courseId]);

  // Auto-sync courseId to audience.courseId when course_enrolled is selected
  useEffect(() => {
    if (formData.audience.type === 'course_enrolled' && formData.courseId && !formData.audience.courseId) {
      setFormData(prev => ({
        ...prev,
        audience: { ...prev.audience, courseId: prev.courseId }
      }));
    }
  }, [formData.audience.type, formData.courseId]);

  const fetchInitialData = async () => {
    try {
      const [templatesRes, coursesRes, eventsRes] = await Promise.all([
        getEmailTemplates(),
        getAllCourses({ limit: 100 }),
        getAllEvents({ limit: 100, status: 'ongoing' })
      ]);

      if (templatesRes.success) {
        // Filter out automatic templates
        const manualTemplates = templatesRes.data.filter(t => availableTemplateTypes.includes(t.type));
        setTemplates(manualTemplates);
      }
      if (coursesRes.success) setCourses(coursesRes.data?.courses || coursesRes.data || []);
      if (eventsRes.success) setEvents(eventsRes.data?.events || eventsRes.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const fetchEventDetails = async (eventId) => {
    try {
      const res = await getEventById(eventId, true);
      if (res.success && res.data) {
        const event = res.data;
        setSelectedEvent(event);
        
        // Format date and time
        const startDate = new Date(event.startDate);
        const formattedDate = startDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        // Get template name for campaign name
        const templateName = formData.templateType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        // Auto-populate variables - ALWAYS update name/subject when event changes
        setFormData(prev => ({
          ...prev,
          name: `${event.title} - ${templateName}`,
          subject: `🎯 ${event.title} - Don't Miss Out!`,
          variables: {
            eventTitle: event.title,
            eventDate: formattedDate,
            eventTime: event.startTime || 'TBA',
            eventLocation: event.isOnline ? 'Online' : (event.location || 'TBA'),
            eventDescription: event.description?.substring(0, 200) || '',
            eventCost: event.cost?.toString() || '0',
            eventLink: `${process.env.NEXT_PUBLIC_FRONTEND_URL || ''}/events/${event.slug || event._id}`,
            eventImage: event.eventImage || '',
            imageUrl: event.eventImage || '', // Also set imageUrl as fallback
            timeUntil: '24 Hours' // Default for reminder
          },
          // Also set audience to event registered if it's a reminder
          audience: formData.templateType === 'event_reminder' 
            ? { ...prev.audience, type: 'event_registered', eventId: eventId }
            : prev.audience
        }));
      }
    } catch (error) {
      console.error('Failed to fetch event details:', error);
    }
  };

  const fetchCourseDetails = async (courseId) => {
    try {
      const res = await getCourseById(courseId);
      if (res.success && res.data) {
        const course = res.data;
        setSelectedCourse(course);

        // Get template name for campaign name
        const templateName = formData.templateType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        // Auto-populate variables - ALWAYS update name/subject when course changes
        setFormData(prev => ({
          ...prev,
          name: `${course.title} - ${templateName}`,
          subject: `📚 ${course.title} - Check It Out!`,
          variables: {
            courseTitle: course.title,
            courseDescription: course.description?.substring(0, 200) || '',
            courseDuration: course.duration || '',
            courseLevel: course.level || '',
            courseLink: `${process.env.NEXT_PUBLIC_FRONTEND_URL || ''}/courses/${course.slug || course._id}`,
            courseImage: course.image || course.thumbnail || '',
            imageUrl: course.image || course.thumbnail || '' // Also set imageUrl as fallback
          }
        }));
      }
    } catch (error) {
      console.error('Failed to fetch course details:', error);
    }
  };

  const fetchPreview = async () => {
    setPreviewLoading(true);
    try {
      const res = await previewEmailTemplate(formData.templateType);
      if (res.success) {
        setPreviewHtml(res.data.html);
      }
    } catch (error) {
      console.error('Failed to fetch preview:', error);
    } finally {
      setPreviewLoading(false);
    }
  };

  const fetchAudienceCount = async () => {
    // Don't fetch if required fields are missing
    if (formData.audience.type === 'course_enrolled' && !formData.audience.courseId) {
      setAudienceCount(0);
      return;
    }
    if (formData.audience.type === 'event_registered' && !formData.audience.eventId) {
      setAudienceCount(0);
      return;
    }

    setAudienceLoading(true);
    try {
      const res = await getAudienceCount(formData.audience);
      if (res.success) {
        setAudienceCount(res.count || 0);
      } else {
        console.error('Failed to fetch audience count:', res.message);
        setAudienceCount(0);
      }
    } catch (error) {
      console.error('Failed to fetch audience count:', error);
      setAudienceCount(0);
    } finally {
      setAudienceLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('audience.')) {
      const field = name.replace('audience.', '');
      setFormData(prev => {
        const newAudience = { ...prev.audience, [field]: value };
        // Clear dependent fields when audience type changes
        if (field === 'type') {
          if (value !== 'course_enrolled') {
            newAudience.courseId = '';
          }
          if (value !== 'event_registered') {
            newAudience.eventId = '';
          }
        }
        return {
          ...prev,
          audience: newAudience
        };
      });
    } else if (name.startsWith('variables.')) {
      const field = name.replace('variables.', '');
      setFormData(prev => ({
        ...prev,
        variables: { ...prev.variables, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleTemplateSelect = (templateType) => {
    setFormData(prev => ({ 
      ...prev, 
      templateType,
      eventId: '',
      courseId: '',
      variables: {}
    }));
    setSelectedEvent(null);
    setSelectedCourse(null);
  };

  const handleSendTest = async () => {
    if (!testEmail) {
      alert('Please enter a test email address');
      return;
    }

    setTestEmailSending(true);
    try {
      const res = await sendTestEmail({
        templateType: formData.templateType,
        email: testEmail,
        variables: formData.variables
      });
      
      if (res.success) {
        alert('Test email sent successfully!');
      } else {
        alert(res.message || 'Failed to send test email');
      }
    } catch (error) {
      alert('Failed to send test email');
    } finally {
      setTestEmailSending(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerImage(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (sendNow = false) => {
    if (!formData.name || !formData.templateType || !formData.subject) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate event/course selection for relevant templates
    if (eventTemplates.includes(formData.templateType) && !formData.eventId) {
      alert('Please select an event');
      return;
    }
    if (courseTemplates.includes(formData.templateType) && !formData.courseId) {
      alert('Please select a course');
      return;
    }

    setLoading(true);
    try {
      // Use FormData if there's an image, otherwise use JSON
      let campaignData;
      
      if (bannerImage) {
        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name);
        formDataToSend.append('templateType', formData.templateType);
        formDataToSend.append('subject', formData.subject);
        formDataToSend.append('variables', JSON.stringify(formData.variables));
        formDataToSend.append('audience', JSON.stringify(formData.audience));
        formDataToSend.append('sendNow', sendNow);
        formDataToSend.append('eventId', formData.eventId || '');
        formDataToSend.append('courseId', formData.courseId || '');
        formDataToSend.append('bannerImage', bannerImage);
        campaignData = formDataToSend;
      } else {
        campaignData = {
          ...formData,
          sendNow
        };
      }

      const res = await createCampaign(campaignData);

      if (res.success) {
        if (sendNow) {
          alert(res.message || 'Campaign sent successfully!');
        } else {
          alert('Campaign saved as draft');
        }
        router.push('/email-campaigns');
      } else {
        alert(res.message || 'Failed to create campaign');
      }
    } catch (error) {
      alert('Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  const isEventTemplate = eventTemplates.includes(formData.templateType);
  const isCourseTemplate = courseTemplates.includes(formData.templateType);
  const isMarketingTemplate = marketingTemplates.includes(formData.templateType);

  // Group templates by category
  const groupedTemplates = {
    event: templates.filter(t => eventTemplates.includes(t.type)),
    course: templates.filter(t => courseTemplates.includes(t.type)),
    marketing: templates.filter(t => marketingTemplates.includes(t.type))
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/email-campaigns"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Mail className="w-7 h-7 text-blue-600" />
            Create Campaign
          </h1>
          <p className="text-gray-500 mt-1">Compose and send emails to your students</p>
        </div>
      </div>

      {/* Info Box for Automatic Emails */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">Automatic Emails</p>
            <p className="text-sm text-blue-700 mt-1">
              Some emails are sent automatically: <strong>Welcome</strong> (on registration), 
              <strong> Enrollment Confirmation</strong> (on course enrollment), 
              <strong> Query Response</strong> (when you reply to a query).
            </p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div className="flex items-center gap-2">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    step >= s 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                </div>
                <span className={`text-sm font-medium hidden sm:inline ${step >= s ? 'text-gray-900' : 'text-gray-400'}`}>
                  {s === 1 && 'Template'}
                  {s === 2 && 'Content'}
                  {s === 3 && 'Audience'}
                </span>
              </div>
              {s < 3 && (
                <div className={`flex-1 h-0.5 mx-4 ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Form */}
        <div className="space-y-6">
          {/* Step 1: Template Selection */}
          {step === 1 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Choose a Template</h2>
              
              <div className="space-y-6">
                {/* Event Templates */}
                {groupedTemplates.event.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Event Templates
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {groupedTemplates.event.map((template) => (
                        <button
                          key={template.type}
                          onClick={() => handleTemplateSelect(template.type)}
                          className={`p-4 rounded-lg border-2 text-left transition-all ${
                            formData.templateType === template.type
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <span className="font-medium text-gray-900">{template.name}</span>
                            {formData.templateType === template.type && (
                              <CheckCircle className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Select an event to auto-fill details</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Course Templates */}
                {groupedTemplates.course.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Course Templates
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {groupedTemplates.course.map((template) => (
                        <button
                          key={template.type}
                          onClick={() => handleTemplateSelect(template.type)}
                          className={`p-4 rounded-lg border-2 text-left transition-all ${
                            formData.templateType === template.type
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <span className="font-medium text-gray-900">{template.name}</span>
                            {formData.templateType === template.type && (
                              <CheckCircle className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Select a course to auto-fill details</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Marketing Templates */}
                {groupedTemplates.marketing.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Marketing Templates
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {groupedTemplates.marketing.map((template) => (
                        <button
                          key={template.type}
                          onClick={() => handleTemplateSelect(template.type)}
                          className={`p-4 rounded-lg border-2 text-left transition-all ${
                            formData.templateType === template.type
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <span className="font-medium text-gray-900">{template.name}</span>
                            {formData.templateType === template.type && (
                              <CheckCircle className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Create custom promotional content</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  disabled={!formData.templateType}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Content */}
          {step === 2 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Campaign Content</h2>
              
              <div className="space-y-4">
                {/* Event Selection */}
                {isEventTemplate && (
                  <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Event *
                    </label>
                    <div className="relative">
                      <select
                        name="eventId"
                        value={formData.eventId}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                      >
                        <option value="">Choose an event...</option>
                        {events.map((event) => (
                          <option key={event._id} value={event._id}>
                            {event.title} - {new Date(event.startDate).toLocaleDateString()}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                    {selectedEvent && (
                      <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Event details auto-filled!
                      </p>
                    )}
                  </div>
                )}

                {/* Course Selection */}
                {isCourseTemplate && (
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Course *
                    </label>
                    <div className="relative">
                      <select
                        name="courseId"
                        value={formData.courseId}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                      >
                        <option value="">Choose a course...</option>
                        {courses.map((course) => (
                          <option key={course._id} value={course._id}>
                            {course.title}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                    {selectedCourse && (
                      <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Course details auto-filled!
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Campaign Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., January Event Announcement"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="e.g., 🎉 Exciting New Event - Register Now!"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Banner Image Upload - Available for all templates */}
                <div className="pt-4 border-t">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Banner Image (Optional)
                  </label>
                  <div className="space-y-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {bannerImagePreview && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-2">Preview:</p>
                        <img 
                          src={bannerImagePreview} 
                          alt="Banner preview" 
                          className="max-w-full h-48 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setBannerImage(null);
                            setBannerImagePreview(null);
                          }}
                          className="mt-2 text-sm text-red-600 hover:text-red-700"
                        >
                          Remove Image
                        </button>
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      This image will appear at the top of your email. Recommended size: 800x400px
                    </p>
                  </div>
                </div>

                {/* Marketing Template Variables */}
                {isMarketingTemplate && (
                  <div className="pt-4 border-t">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Content Details</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Title *</label>
                        <input
                          type="text"
                          name="variables.title"
                          value={formData.variables.title || ''}
                          onChange={handleInputChange}
                          placeholder="e.g., Special Offer Just for You!"
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Message *</label>
                        <textarea
                          name="variables.message"
                          value={formData.variables.message || ''}
                          onChange={handleInputChange}
                          placeholder="Write your promotional message..."
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Banner Image URL</label>
                        <input
                          type="text"
                          name="variables.imageUrl"
                          value={formData.variables.imageUrl || ''}
                          onChange={handleInputChange}
                          placeholder="https://example.com/email-banner.jpg"
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          This image will appear at the top of the email.
                        </p>
                      </div>
                      {formData.templateType === 'promotional' && (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-600 mb-1">Offer Details</label>
                              <input
                                type="text"
                                name="variables.offerDetails"
                                value={formData.variables.offerDetails || ''}
                                onChange={handleInputChange}
                                placeholder="e.g., 50% OFF"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-600 mb-1">Expiry Date</label>
                              <input
                                type="text"
                                name="variables.offerExpiry"
                                value={formData.variables.offerExpiry || ''}
                                onChange={handleInputChange}
                                placeholder="e.g., December 31, 2025"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </div>
                        </>
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Button Text</label>
                          <input
                            type="text"
                            name="variables.ctaText"
                            value={formData.variables.ctaText || ''}
                            onChange={handleInputChange}
                            placeholder="e.g., Learn More"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Button Link</label>
                          <input
                            type="text"
                            name="variables.ctaLink"
                            value={formData.variables.ctaLink || ''}
                            onChange={handleInputChange}
                            placeholder="https://..."
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Event Template - Editable Variables */}
                {isEventTemplate && selectedEvent && (
                  <div className="pt-4 border-t">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Event Details (Auto-filled, editable)</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Event Title</label>
                        <input
                          type="text"
                          name="variables.eventTitle"
                          value={formData.variables.eventTitle || ''}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Date</label>
                        <input
                          type="text"
                          name="variables.eventDate"
                          value={formData.variables.eventDate || ''}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Time</label>
                        <input
                          type="text"
                          name="variables.eventTime"
                          value={formData.variables.eventTime || ''}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Location</label>
                        <input
                          type="text"
                          name="variables.eventLocation"
                          value={formData.variables.eventLocation || ''}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50"
                        />
                      </div>
                      {formData.templateType === 'event_reminder' && (
                        <div className="col-span-2">
                          <label className="block text-sm text-gray-600 mb-1">Time Until Event</label>
                          <input
                            type="text"
                            name="variables.timeUntil"
                            value={formData.variables.timeUntil || ''}
                            onChange={handleInputChange}
                            placeholder="e.g., 24 Hours, Tomorrow"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Course Template - Editable Variables */}
                {isCourseTemplate && selectedCourse && (
                  <div className="pt-4 border-t">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Course Details (Auto-filled, editable)</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-sm text-gray-600 mb-1">Course Title</label>
                        <input
                          type="text"
                          name="variables.courseTitle"
                          value={formData.variables.courseTitle || ''}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Duration</label>
                        <input
                          type="text"
                          name="variables.courseDuration"
                          value={formData.variables.courseDuration || ''}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Level</label>
                        <input
                          type="text"
                          name="variables.courseLevel"
                          value={formData.variables.courseLevel || ''}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!formData.name || !formData.subject || (isEventTemplate && !formData.eventId) || (isCourseTemplate && !formData.courseId)}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Audience */}
          {step === 3 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Audience</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Audience
                  </label>
                  <div className="relative">
                    <select
                      name="audience.type"
                      value={formData.audience.type}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                    >
                      <option value="all_students">All Students</option>
                      <option value="course_enrolled">Students Enrolled in a Course</option>
                      {isEventTemplate && formData.eventId && (
                        <option value="event_registered">Students Registered for This Event</option>
                      )}
                      <option value="inactive_students">Inactive Students</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {formData.audience.type === 'course_enrolled' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Course
                    </label>
                    <select
                      name="audience.courseId"
                      value={formData.audience.courseId}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a course...</option>
                      {courses.map((course) => (
                        <option key={course._id} value={course._id}>
                          {course.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {formData.audience.type === 'inactive_students' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Inactive for (days)
                    </label>
                    <input
                      type="number"
                      name="audience.inactiveDays"
                      value={formData.audience.inactiveDays}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}

                {/* Audience Count */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {audienceLoading ? (
                          <span className="flex items-center gap-2">
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Counting...
                          </span>
                        ) : (
                          `${audienceCount} recipients will receive this email`
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap justify-between gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Back
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleSubmit(false)}
                    disabled={loading || audienceCount === 0}
                    className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    Save Draft
                  </button>
                  <button
                    onClick={() => handleSubmit(true)}
                    disabled={loading || audienceCount === 0}
                    className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Send Now
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Preview */}
        <div className="space-y-6">
          {/* Email Preview */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-medium text-gray-900 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Email Preview
              </h3>
            </div>
            <div className="p-4 bg-gray-50">
              {previewLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
                </div>
              ) : previewHtml ? (
                <div 
                  className="bg-white rounded-lg shadow-sm overflow-auto"
                  style={{ 
                    height: 'calc(100vh - 300px)', 
                    maxHeight: '800px',
                    minHeight: '500px'
                  }}
                >
                  <div 
                    style={{
                      transform: 'scale(0.8)',
                      transformOrigin: 'top left',
                      width: '125%',
                      height: '125%'
                    }}
                  >
                    <iframe
                      srcDoc={previewHtml.replace('<body', '<body style="overflow: hidden; margin: 0; padding: 0;"')}
                      className="w-full border-0"
                      style={{ 
                        height: '750px',
                        width: '100%',
                        display: 'block',
                        border: 'none'
                      }}
                      title="Email Preview"
                      scrolling="no"
                      frameBorder="0"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Mail className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Select a template to preview</p>
                </div>
              )}
            </div>
          </div>

          {/* Send Test Email */}
          {formData.templateType && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-medium text-gray-900 mb-3">Send Test Email</h3>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={handleSendTest}
                  disabled={testEmailSending || !testEmail}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {testEmailSending ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    'Send'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
