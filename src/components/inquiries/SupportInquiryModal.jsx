"use client";

import React, { useEffect, useState } from "react";
import { Badge, Button } from "@/components/ui";
import { X, Mail, Phone, MessageSquare, Calendar, User, AlertCircle } from "lucide-react";
import * as inquiryAPI from "@/lib/api/inquiry";
import { showSuccess, showError } from "@/lib/utils/sweetalert";

const statusColors = {
  new: "info",
  "in-progress": "warning",
  resolved: "success",
  closed: "default",
};

const inquiryTypeLabels = {
  general: "General Inquiry",
  courses: "Course Information",
  enrollment: "Enrollment Support",
  technical: "Technical Support",
  certification: "Certification",
  events: "Events & Workshops",
};

const SupportInquiryModal = ({ isOpen, onClose, inquiry, onStatusUpdate }) => {
  const [status, setStatus] = useState(inquiry?.status || "new");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (inquiry) {
      setStatus(inquiry.status || "new");
    }
  }, [inquiry]);

  const handleStatusChange = async (newStatus) => {
    if (!inquiry || updatingStatus) return;

    try {
      setUpdatingStatus(true);
      const response = await inquiryAPI.updateInquiryStatus(inquiry.id || inquiry._id, newStatus);
      
      if (response.success) {
        showSuccess('Status Updated!', `Inquiry status has been updated to ${newStatus}.`);
        setStatus(newStatus);
        if (onStatusUpdate) {
          onStatusUpdate();
        }
      } else {
        showError('Failed to Update Status', response.message || "Unknown error");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      showError('Error', "Failed to update status: " + (error.message || "Unknown error"));
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (!isOpen || !inquiry) return null;

  const formattedDate = new Date(inquiry.createdAt).toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const statusOptions = [
    { value: "new", label: "New" },
    { value: "in-progress", label: "In Progress" },
    { value: "resolved", label: "Resolved" },
    { value: "closed", label: "Closed" },
  ];

  return (
    <div 
      className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">Support Inquiry Details</h2>
            <p className="text-sm text-gray-600 mt-1">Submitted on {formattedDate}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Contact Information */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Full Name</p>
                  <p className="text-sm font-medium text-gray-900">{inquiry.fullName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-900">{inquiry.email}</p>
                </div>
              </div>
              {inquiry.phone && inquiry.phone !== "N/A" && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium text-gray-900">{inquiry.phone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Inquiry Details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                Inquiry Details
              </h3>
              <div className="flex items-center gap-3">
                <Badge color={statusColors[inquiry.inquiryType] || "default"}>
                  {inquiryTypeLabels[inquiry.inquiryType] || inquiry.inquiryType}
                </Badge>
                <Badge color={statusColors[status] || "default"}>
                  {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                </Badge>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {inquiry.message}
              </p>
            </div>
          </div>

          {/* Status Update */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              Update Status
            </h3>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleStatusChange(option.value)}
                  disabled={updatingStatus || status === option.value}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    status === option.value
                      ? "bg-blue-600 text-white cursor-default"
                      : updatingStatus
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-blue-400"
                  }`}
                >
                  {updatingStatus && status === option.value ? "Updating..." : option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={updatingStatus}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SupportInquiryModal;

