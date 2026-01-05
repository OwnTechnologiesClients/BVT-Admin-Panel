"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ComponentCard } from "@/components/common/ComponentCard";
import { Button } from "@/components/ui";
import { createStudent, updateStudent, getStudentById } from "@/lib/api/student";
import { showSuccess, showError } from "@/lib/utils/sweetalert";
import { Eye, EyeOff, X } from "lucide-react";

const initialFormState = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  phone: "",
  age: "",
  gender: "",
  dob: "",
  street: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  emergencyName: "",
  emergencyRelation: "",
  emergencyPhone: "",
  notes: "",
};

const StudentForm = ({ studentId, initialData, onSuccess }) => {
  const router = useRouter();
  const [formData, setFormData] = useState(initialData || initialFormState);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [documents, setDocuments] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Set initial image preview if editing and image exists
  useEffect(() => {
    if (studentId && initialData && !imagePreview) {
      // If student has an existing image, set preview
      if (initialData.image || initialData.profilePic) {
        const imageUrl = initialData.image || initialData.profilePic;
        // If it's a full URL (S3 or other), use it directly
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
          setImagePreview(imageUrl);
        } else if (imageUrl.startsWith('data:image')) {
          // Base64 image
          setImagePreview(imageUrl);
        } else {
          // Local file path - construct URL
          const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
          setImagePreview(`${apiBaseUrl}${imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl}`);
        }
      }
    }
  }, [studentId, initialData, imagePreview]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfileImage(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setProfileImage(null);
    setImagePreview("");
  };

  const handleDocumentsChange = (event) => {
    const files = event.target.files;
    if (!files) return;
    const nextDocs = Array.from(files).map((file) => ({
      id: `doc-${file.name}-${Date.now()}`,
      file,
    }));
    setDocuments(nextDocs);
  };

  const handleReset = () => {
    setFormData(initialData || initialFormState);
    setProfileImage(null);
    setDocuments([]);
    setError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Password validation only for new students or when password is being changed
    if (!studentId) {
      // Creating new student - password is required
      if (!formData.password || formData.password.length < 6) {
        const errorMsg = "Password must be at least 6 characters long";
        setError(errorMsg);
        showError('Validation Error', errorMsg);
        setIsSubmitting(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        const errorMsg = "Passwords do not match";
        setError(errorMsg);
        showError('Validation Error', errorMsg);
        setIsSubmitting(false);
        return;
      }
    } else {
      // Editing existing student - password is optional
      if (formData.password && formData.password.length < 6) {
        const errorMsg = "Password must be at least 6 characters long";
        setError(errorMsg);
        showError('Validation Error', errorMsg);
        setIsSubmitting(false);
        return;
      }

      if (formData.password && formData.password !== formData.confirmPassword) {
        const errorMsg = "Passwords do not match";
        setError(errorMsg);
        showError('Validation Error', errorMsg);
        setIsSubmitting(false);
        return;
      }
    }

    try {
      // Prepare student data according to backend model structure
      const studentData = {
        email: formData.email.trim().toLowerCase(),
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim() || undefined,
        age: formData.age ? parseInt(formData.age) : undefined,
        gender: formData.gender || undefined,
        dob: formData.dob || undefined,
        address: {
          street: formData.street.trim() || undefined,
          city: formData.city.trim() || undefined,
          state: formData.state.trim() || undefined,
          postalCode: formData.postalCode.trim() || undefined,
          country: formData.country.trim() || undefined,
        },
        emergencyContact: {
          name: formData.emergencyName.trim() || undefined,
          relation: formData.emergencyRelation.trim() || undefined,
          phone: formData.emergencyPhone.trim() || undefined,
        },
        notes: formData.notes.trim() || undefined,
      };

      // Only include password if it's being changed (for edit) or required (for create)
      if (!studentId || (studentId && formData.password)) {
        studentData.password = formData.password;
      }

      // Handle file uploads (profileImage, documents)
      const hasImageUpload = profileImage !== null && profileImage instanceof File;
      let finalStudentData;

      if (hasImageUpload) {
        // Use FormData for file upload
        finalStudentData = new FormData();
        finalStudentData.append('email', studentData.email.trim().toLowerCase());
        if (studentData.password) {
          finalStudentData.append('password', studentData.password);
        }
        finalStudentData.append('fullName', studentData.fullName.trim());
        if (studentData.phone) finalStudentData.append('phone', studentData.phone);
        if (studentData.age) finalStudentData.append('age', studentData.age);
        if (studentData.gender) finalStudentData.append('gender', studentData.gender);
        if (studentData.dob) finalStudentData.append('dob', studentData.dob);
        
        if (studentData.address?.street) finalStudentData.append('address[street]', studentData.address.street);
        if (studentData.address?.city) finalStudentData.append('address[city]', studentData.address.city);
        if (studentData.address?.state) finalStudentData.append('address[state]', studentData.address.state);
        if (studentData.address?.postalCode) finalStudentData.append('address[postalCode]', studentData.address.postalCode);
        if (studentData.address?.country) finalStudentData.append('address[country]', studentData.address.country);
        
        if (studentData.emergencyContact?.name) finalStudentData.append('emergencyContact[name]', studentData.emergencyContact.name);
        if (studentData.emergencyContact?.relation) finalStudentData.append('emergencyContact[relation]', studentData.emergencyContact.relation);
        if (studentData.emergencyContact?.phone) finalStudentData.append('emergencyContact[phone]', studentData.emergencyContact.phone);
        
        if (studentData.notes) finalStudentData.append('notes', studentData.notes);
        
        // Append profile picture file only if it's a File
        if (profileImage instanceof File) {
          finalStudentData.append('image', profileImage);
        }
        
        // Note: Documents upload will be handled separately later if needed
      } else {
        // Use plain object if no image upload
        finalStudentData = studentData;
      }

      let response;
      if (studentId) {
        // Update existing student
        response = await updateStudent(studentId, finalStudentData);
      } else {
        // Create new student
        response = await createStudent(finalStudentData);
      }

      if (response.success) {
        showSuccess(
          studentId ? 'Student Updated!' : 'Student Created!',
          `The student has been ${studentId ? 'updated' : 'created'} successfully.`
        );
        if (onSuccess) {
          onSuccess(response.data?.student);
        } else {
          // Default: redirect to students list or student detail page
          setTimeout(() => {
          if (studentId) {
            router.push(`/students/${studentId}`);
          } else {
            router.push("/students");
          }
          }, 1500);
        }
      } else {
        const errorMsg = response.message || `Failed to ${studentId ? 'update' : 'create'} student`;
        setError(errorMsg);
        showError('Error', errorMsg);
      }
    } catch (err) {
      const errorMsg = err.message || `An error occurred while ${studentId ? 'updating' : 'creating'} the student`;
      setError(errorMsg);
      console.error(`Error ${studentId ? 'updating' : 'creating'} student:`, err);
      showError('Error', errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <ComponentCard title="Authentication & Basic Information">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              placeholder="e.g. Lieutenant Marcus Allen"
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="student@navy.mil"
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
              disabled={isSubmitting}
            />
          </div>
          {!studentId && (
            <>
              <div className="relative">
                <label className="text-sm font-medium text-gray-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    placeholder="Minimum 6 characters"
                    className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 pr-10 text-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[1.625rem] text-gray-500 hover:text-gray-700"
                    disabled={isSubmitting}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Student will use this to log in on the frontend
                </p>
              </div>
              <div className="relative">
                <label className="text-sm font-medium text-gray-700">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    minLength={6}
                    placeholder="Re-enter password"
                    className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 pr-10 text-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-[1.625rem] text-gray-500 hover:text-gray-700"
                    disabled={isSubmitting}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
          {studentId && (
            <>
              <div className="relative">
                <label className="text-sm font-medium text-gray-700">
                  Change Password (Optional)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    minLength={6}
                    placeholder="Leave empty to keep current password"
                    className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 pr-10 text-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[1.625rem] text-gray-500 hover:text-gray-700"
                    disabled={isSubmitting}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Only fill if you want to change the password
                </p>
              </div>
              {formData.password && (
                <div className="relative">
                  <label className="text-sm font-medium text-gray-700">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      minLength={6}
                      placeholder="Re-enter new password"
                      className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 pr-10 text-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-[1.625rem] text-gray-500 hover:text-gray-700"
                      disabled={isSubmitting}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
          <div>
            <label className="text-sm font-medium text-gray-700">Phone <span className="text-gray-400 text-xs">(optional)</span></label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 757-555-0112"
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
              disabled={isSubmitting}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Age <span className="text-gray-400 text-xs">(optional)</span></label>
              <input
                type="number"
                min="17"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Gender <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                disabled={isSubmitting}
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">DOB <span className="text-gray-400 text-xs">(optional)</span></label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <label className="text-sm font-medium text-gray-700">
            Profile Image <span className="text-gray-400 text-xs">(optional)</span>
          </label>
          <div className="mt-2 space-y-4">
            {(imagePreview || (studentId && initialData?.image)) && (
              <div className="relative inline-block">
                <img
                  src={imagePreview || (() => {
                    const imageUrl = initialData?.image;
                    if (!imageUrl) return null;
                    // If it's already a full URL (S3 or other), use it directly
                    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
                      return imageUrl;
                    }
                    // If it's a data URL (base64), use it directly
                    if (imageUrl.startsWith('data:image')) {
                      return imageUrl;
                    }
                    // Otherwise, construct URL using API base URL (for local files)
                    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
                    return `${apiBaseUrl}${imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl}`;
                  })()}
                  alt="Profile preview"
                  className="w-32 h-32 rounded-full object-cover border-2 border-gray-300"
                  onError={(e) => {
                    e.target.src = '/images/user-placeholder.jpg';
                  }}
                />
                {profileImage && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    disabled={isSubmitting}
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
            onChange={handleFileChange}
                className="block text-sm text-gray-600 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-blue-600 hover:file:bg-blue-100"
                disabled={isSubmitting}
          />
          <p className="mt-2 text-xs text-gray-400">
                {studentId ? "Select a new image to update the profile picture." : "Upload a profile picture (JPG, PNG, GIF). Max size: 5MB"}
              </p>
              {profileImage && (
                <p className="mt-1 text-xs text-green-600">
                  Image selected: {profileImage.name} ({(profileImage.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
          </div>
        </div>
      </ComponentCard>

      <ComponentCard title="Contact & Address">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700">
              Street Address <span className="text-gray-400 text-xs">(optional)</span>
            </label>
            <input
              name="street"
              value={formData.street}
              onChange={handleChange}
              placeholder="102 Harbor Lane"
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">City <span className="text-gray-400 text-xs">(optional)</span></label>
            <input
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Norfolk"
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">State <span className="text-gray-400 text-xs">(optional)</span></label>
            <input
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="VA"
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              Postal Code <span className="text-gray-400 text-xs">(optional)</span>
            </label>
            <input
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              placeholder="23510"
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Country <span className="text-gray-400 text-xs">(optional)</span></label>
            <input
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="USA"
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
              disabled={isSubmitting}
            />
          </div>
        </div>
      </ComponentCard>

      <ComponentCard title="Emergency Contact">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Contact Name <span className="text-gray-400 text-xs">(optional)</span>
            </label>
            <input
              name="emergencyName"
              value={formData.emergencyName}
              onChange={handleChange}
              placeholder="Elena Allen"
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              Relationship <span className="text-gray-400 text-xs">(optional)</span>
            </label>
            <input
              name="emergencyRelation"
              value={formData.emergencyRelation}
              onChange={handleChange}
              placeholder="Spouse"
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              Contact Phone <span className="text-gray-400 text-xs">(optional)</span>
            </label>
            <input
              name="emergencyPhone"
              value={formData.emergencyPhone}
              onChange={handleChange}
              placeholder="+1 757-555-0138"
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
              disabled={isSubmitting}
            />
          </div>
        </div>
      </ComponentCard>

      <ComponentCard title="Identity Documents">
        <div>
          <label className="text-sm font-medium text-gray-700">
            Upload Proof of Identity <span className="text-gray-400 text-xs">(optional)</span>
          </label>
          <input
            type="file"
            multiple
            onChange={handleDocumentsChange}
            className="mt-2 block text-sm text-gray-600 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-blue-600 hover:file:bg-blue-100"
            disabled={isSubmitting}
          />
          <p className="mt-2 text-xs text-gray-400">
            Multiple files allowed. Filenames are stored locally for preview.
          </p>
          {documents.length > 0 && (
            <ul className="mt-4 space-y-1 text-sm text-gray-700">
              {documents.map((doc) => (
                <li key={doc.id} className="rounded-lg bg-blue-50 px-3 py-2">
                  {doc.file.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </ComponentCard>

      <ComponentCard title="Additional Notes">
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={4}
          placeholder="Training requirements, deployment info, or accommodation needs."
          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
          disabled={isSubmitting}
        />
      </ComponentCard>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className="sm:w-auto"
          onClick={handleReset}
          disabled={isSubmitting}
        >
          Reset
        </Button>
        <Button 
          type="submit" 
          variant="primary" 
          className="sm:w-auto"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating..." : studentId ? "Update Student" : "Create Student"}
        </Button>
      </div>
    </form>
  );
};

export default StudentForm;

