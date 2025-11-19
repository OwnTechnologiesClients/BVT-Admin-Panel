"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui";
import * as userAPI from "@/lib/api/user";

export default function EditUserPage() {
  const router = useRouter();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "instructor",
    status: 1
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await userAPI.getUserById(id);
        if (response.success) {
          const user = response.data;
          setFormData({
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            email: user.email || "",
            phone: user.phone || "",
            role: user.role || "instructor",
            status: user.status !== undefined ? user.status : 1
          });
          
          // Set profile picture preview if available
          if (user.profilePic) {
            setImagePreview(user.profilePic);
          }
        } else {
          setError('User not found');
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        setError(err.message || 'Failed to fetch user');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUser();
    }
  }, [id]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

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
    // Keep the existing image preview from the user's profilePic
    // Don't clear imagePreview here, as we want to show the current profile pic
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.role) {
      newErrors.role = "Role is required";
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
      
      // Create FormData if image is uploaded, otherwise use plain object
      const hasImageUpload = imageFile !== null;
      let userData;
      
      if (hasImageUpload) {
        // Use FormData for file upload (like OMS pattern)
        userData = new FormData();
        userData.append('firstName', formData.firstName.trim());
        userData.append('lastName', formData.lastName.trim());
        userData.append('email', formData.email.trim());
        if (formData.phone?.trim()) {
          userData.append('phone', formData.phone.trim());
        }
        userData.append('role', formData.role);
        userData.append('status', formData.status);
        userData.append('profilePic', imageFile);
      } else {
        // Use plain object if no image upload
        userData = {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          phone: formData.phone?.trim() || undefined,
          role: formData.role,
          status: formData.status
        };
      }
      
      const response = await userAPI.updateUser(id, userData);

      if (response.success) {
        router.push('/users');
      } else {
        alert(response.message || 'Failed to update user');
      }
    } catch (err) {
      alert(err.message || 'Failed to update user');
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
      <div className="max-w-2xl mx-auto p-8">
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
      <h1 className="text-2xl font-bold mb-6">Edit User</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block text-sm font-medium">
            First Name <span className="text-red-500">*</span>
            <input 
              className={`w-full border rounded px-3 py-2 mt-1 ${
                errors.firstName ? "border-red-500" : "border-gray-300"
              }`}
              value={formData.firstName} 
              onChange={e => handleInputChange("firstName", e.target.value)}
              required
            />
            {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
          </label>
          <label className="block text-sm font-medium">
            Last Name <span className="text-red-500">*</span>
            <input 
              className={`w-full border rounded px-3 py-2 mt-1 ${
                errors.lastName ? "border-red-500" : "border-gray-300"
              }`}
              value={formData.lastName} 
              onChange={e => handleInputChange("lastName", e.target.value)}
              required
            />
            {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
          </label>
        </div>
        <label className="block text-sm font-medium">
          Email <span className="text-red-500">*</span>
          <input 
            type="email"
            className={`w-full border rounded px-3 py-2 mt-1 ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
            value={formData.email} 
            onChange={e => handleInputChange("email", e.target.value)}
            required
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </label>
        <label className="block text-sm font-medium">
          Phone <span className="text-gray-400 text-xs">(optional)</span>
          <input 
            type="tel"
            className="w-full border rounded px-3 py-2 mt-1" 
            value={formData.phone} 
            onChange={e => handleInputChange("phone", e.target.value)}
          />
        </label>
        
        {/* Profile Picture Upload */}
        <label className="block text-sm font-medium">
          Profile Picture <span className="text-gray-400 text-xs">(optional)</span>
          <div className="space-y-4 mt-2">
            {imagePreview && (
              <div className="relative inline-block">
                <img
                  src={imagePreview}
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
                className="w-full border rounded px-3 py-2 mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Upload a profile picture (JPG, PNG, GIF). Max size: 5MB
              </p>
            </div>
          </div>
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block text-sm font-medium">
            Role <span className="text-red-500">*</span>
            <select
              className={`w-full border rounded px-3 py-2 mt-1 ${
                errors.role ? "border-red-500" : "border-gray-300"
              }`}
              value={formData.role}
              onChange={e => handleInputChange("role", e.target.value)}
              required
            >
              <option value="instructor">Instructor</option>
              <option value="admin">Admin</option>
            </select>
            {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
          </label>
          <label className="block text-sm font-medium">
            Status <span className="text-gray-400 text-xs">(optional)</span>
            <select
              className="w-full border rounded px-3 py-2 mt-1"
              value={formData.status}
              onChange={e => handleInputChange("status", parseInt(e.target.value))}
            >
              <option value={1}>Active</option>
              <option value={0}>Inactive</option>
            </select>
          </label>
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

