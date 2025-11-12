"use client";

import React, { useState } from "react";
import { ComponentCard } from "@/components/common/ComponentCard";
import { Button } from "@/components/ui";

const initialFormState = {
  fullName: "",
  email: "",
  phone: "",
  age: "",
  gender: "",
  rank: "",
  branch: "",
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

const StudentForm = () => {
  const [formData, setFormData] = useState(initialFormState);
  const [profileImage, setProfileImage] = useState(null);
  const [documents, setDocuments] = useState([]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfileImage(file);
    }
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
    setFormData(initialFormState);
    setProfileImage(null);
    setDocuments([]);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.table(formData);
    console.log("Profile Image:", profileImage);
    console.log("Documents:", documents.map((doc) => doc.file.name));
    alert("Mock submission captured in console. No data has been saved.");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ComponentCard title="Basic Information">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              placeholder="e.g. Lieutenant Marcus Allen"
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="student@navy.mil"
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Phone</label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 757-555-0112"
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Age</label>
              <input
                type="number"
                min="17"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">DOB</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Rank</label>
            <input
              name="rank"
              value={formData.rank}
              onChange={handleChange}
              placeholder="e.g. Lieutenant"
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              Branch / Division
            </label>
            <input
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              placeholder="e.g. Navigation Division"
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="text-sm font-medium text-gray-700">
            Profile Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="mt-2 block text-sm text-gray-600 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-blue-600 hover:file:bg-blue-100"
          />
          <p className="mt-2 text-xs text-gray-400">
            Uploading is optional in preview mode; file names are logged only.
          </p>
        </div>
      </ComponentCard>

      <ComponentCard title="Contact & Address">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700">
              Street Address
            </label>
            <input
              name="street"
              value={formData.street}
              onChange={handleChange}
              placeholder="102 Harbor Lane"
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">City</label>
            <input
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Norfolk"
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">State</label>
            <input
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="VA"
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              Postal Code
            </label>
            <input
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              placeholder="23510"
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Country</label>
            <input
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="USA"
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>
      </ComponentCard>

      <ComponentCard title="Emergency Contact">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Contact Name
            </label>
            <input
              name="emergencyName"
              value={formData.emergencyName}
              onChange={handleChange}
              placeholder="Elena Allen"
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              Relationship
            </label>
            <input
              name="emergencyRelation"
              value={formData.emergencyRelation}
              onChange={handleChange}
              placeholder="Spouse"
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              Contact Phone
            </label>
            <input
              name="emergencyPhone"
              value={formData.emergencyPhone}
              onChange={handleChange}
              placeholder="+1 757-555-0138"
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>
      </ComponentCard>

      <ComponentCard title="Identity Documents">
        <div>
          <label className="text-sm font-medium text-gray-700">
            Upload Proof of Identity
          </label>
          <input
            type="file"
            multiple
            onChange={handleDocumentsChange}
            className="mt-2 block text-sm text-gray-600 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-blue-600 hover:file:bg-blue-100"
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
        />
      </ComponentCard>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className="sm:w-auto"
          onClick={handleReset}
        >
          Reset
        </Button>
        <Button type="submit" variant="primary" className="sm:w-auto">
          Save Student (Preview)
        </Button>
      </div>
    </form>
  );
};

export default StudentForm;

