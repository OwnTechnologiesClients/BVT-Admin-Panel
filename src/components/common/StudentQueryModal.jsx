"use client";

import React, { useEffect, useState } from "react";
import { Badge, Button } from "@/components/ui";
import { X, MessageCircle, AlertTriangle, Clock3 } from "lucide-react";

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

  useEffect(() => {
    setReply("");
  }, [query?.id, isOpen]);

  if (!isOpen || !query) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4 py-8">
      <div className="relative flex h-full w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-theme-lg">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Conversation with {query.studentName}
            </h2>
            <p className="text-xs text-gray-500">{query.studentEmail}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 border-b border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-700">
            <span className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-blue-500" />
              {query.subject}
            </span>
            <span className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              {query.course}
            </span>
            <span className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-gray-400" />
              Updated{" "}
              {new Date(query.lastUpdated).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge color={priorityColors[query.priority] || "default"}>
              {query.priority} Priority
            </Badge>
            <Badge color={statusColors[query.status] || "default"}>
              {query.status}
            </Badge>
            {query.assignedInstructor && (
              <Badge color="info">
                Assigned to {query.assignedInstructor}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-6 py-4">
          {query.messages.map((message) => (
            <div
              key={message.id}
              className={`rounded-2xl border p-4 ${
                message.authorRole === "admin"
                  ? "border-blue-200 bg-blue-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-semibold text-gray-900">
                  {message.authorName}
                  <span className="ml-2 text-xs uppercase text-gray-400">
                    {message.authorRole === "admin" ? "Instructor" : "Student"}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(message.timestamp).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-gray-700">
                {message.content}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
          <label
            htmlFor="query-reply"
            className="text-sm font-medium text-gray-700"
          >
            Your Reply
          </label>
          <textarea
            id="query-reply"
            className="mt-2 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm text-gray-800 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
            rows={4}
            placeholder="Type your response..."
            value={reply}
            onChange={(event) => setReply(event.target.value)}
          />
          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Preview only: replying will update the mock timeline but no
              notifications are sent.
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="text-sm"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex items-center gap-2 text-sm"
                onClick={() => {
                  if (reply.trim()) {
                    onSendReply(reply.trim());
                    setReply("");
                  }
                }}
                disabled={!reply.trim()}
              >
                Send Reply
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentQueryModal;

