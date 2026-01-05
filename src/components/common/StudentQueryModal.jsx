"use client";

import React, { useEffect, useState } from "react";
import { Badge, Button } from "@/components/ui";
import { X, MessageCircle, AlertTriangle, Clock3, Paperclip, File, XCircle, Download } from "lucide-react";
import * as queryAPI from "@/lib/api/studentQuery";
import { showSuccess, showError } from "@/lib/utils/sweetalert";

const priorityColors = {
  Critical: "error",
  High: "warning",
  Medium: "info",
  Low: "default",
};

const statusColors = {
  Open: "info",
  "In Progress": "warning",
  "Waiting on Student": "default",
  Resolved: "success",
};

const StudentQueryModal = ({ isOpen, onClose, query, onSendReply }) => {
  const [reply, setReply] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [sending, setSending] = useState(false);
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
    setReply("");
    setAttachments([]);
  }, [query?.id, isOpen]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments((prev) => [...prev, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
      return "🖼️";
    } else if (["pdf"].includes(ext)) {
      return "📄";
    } else if (["doc", "docx"].includes(ext)) {
      return "📝";
    } else if (["mp4", "avi", "mov", "mkv"].includes(ext)) {
      return "🎥";
    }
    return "📎";
  };

  const handleSendReply = async () => {
    if (!reply.trim() && attachments.length === 0) return;
    
    try {
      setSending(true);
      const response = await queryAPI.addMessage(query._id || query.id, reply.trim(), attachments);
      if (response.success) {
        showSuccess('Reply Sent!', 'Your reply has been sent successfully.');
        onSendReply(reply.trim());
        setReply("");
        setAttachments([]);
      } else {
        showError('Failed to Send Reply', response.message || 'Unknown error');
      }
    } catch (error) {
      console.error("Error sending reply:", error);
      showError('Error', "Failed to send reply: " + (error.message || "Unknown error"));
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!query || updatingStatus) return;
    
    try {
      setUpdatingStatus(true);
      const response = await queryAPI.updateQueryStatus(query._id || query.id, newStatus);
      if (response.success) {
        showSuccess('Status Updated!', `Query status has been updated to ${newStatus}.`);
        // Refresh the query data by calling onSendReply which will trigger parent refresh
        onSendReply(""); // This will trigger a refresh in the parent component
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

  if (!isOpen || !query) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4"
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0,
        zIndex: 99999
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        {/* Compact Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3 bg-white">
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-gray-900 truncate">
              {query.studentName}
            </h2>
            <p className="text-xs text-gray-500 truncate">{query.studentEmail}</p>
          </div>
          <div className="flex items-center gap-2 ml-3">
            <Badge color={statusColors[query.status] || "default"} className="text-xs">
              {query.status}
            </Badge>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Compact Info Bar */}
        <div className="border-b border-gray-200 bg-gray-50 px-5 py-2">
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <span className="truncate flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              {query.subject}
            </span>
            <span className="truncate flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {query.course}
            </span>
          </div>
        </div>

        {/* Messages - Compact Design */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-gray-50 min-h-0" style={{ minHeight: 0 }}>
          {query.messages && query.messages.length > 0 ? (
            query.messages.map((message, idx) => (
              <div
                key={message.id || message._id || idx}
              className={`rounded-lg p-3 ${
                message.authorRole === "admin" || message.sender === "admin" || message.sender === "instructor"
                  ? "bg-blue-50 border border-blue-100 ml-8"
                  : "bg-white border border-gray-200 mr-8"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-gray-700">
                  {message.authorName || message.senderName}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(message.timestamp).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                {message.content}
              </p>
              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-2 space-y-1">
                  {message.attachments.map((attachment, idx) => {
                    // Use attachment.filePath directly - backend already converts to full S3 URL
                    const fileUrl = attachment.filePath?.startsWith('http://') || attachment.filePath?.startsWith('https://')
                      ? attachment.filePath
                      : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${attachment.filePath}`;
                    
                    return (
                    <a
                      key={idx}
                        href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 p-1.5 bg-white rounded text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                    >
                      <File className="w-3 h-3" />
                      <span className="truncate flex-1">{attachment.fileName}</span>
                    </a>
                    );
                  })}
                </div>
              )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm">
              No messages yet
            </div>
          )}
        </div>

        {/* Reply Section - Compact */}
        <div className="border-t border-gray-200 bg-white px-4 py-3">
          <textarea
            id="query-reply"
            className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
            rows={3}
            placeholder="Type your response..."
            value={reply}
            onChange={(event) => setReply(event.target.value)}
          />
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 px-2 py-1.5 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors text-xs text-gray-600">
                <Paperclip className="w-3 h-3" />
                <span>Add Files</span>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mov,.mkv"
                />
              </label>
              {attachments.length > 0 && (
                <span className="text-xs text-gray-500">
                  {attachments.length} file(s)
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="text-xs px-3 py-1.5"
                onClick={onClose}
                disabled={sending}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="text-xs px-3 py-1.5"
                onClick={handleSendReply}
                disabled={(!reply.trim() && attachments.length === 0) || sending}
              >
                {sending ? "Sending..." : "Send"}
              </Button>
            </div>
          </div>
          {attachments.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded text-xs"
                >
                  <span>{getFileIcon(file.name)}</span>
                  <span className="max-w-[120px] truncate text-gray-700">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    className="ml-1 hover:text-red-500 transition-colors"
                  >
                    <XCircle className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentQueryModal;

