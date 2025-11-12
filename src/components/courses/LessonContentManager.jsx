"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui";
import { Plus, Trash2, Upload, FileText, Video, Edit } from "lucide-react";

const LessonContentManager = ({ lessonId }) => {
  const [contents, setContents] = useState([
    {
      id: 1,
      title: "Introduction Video",
      description: "Course introduction video",
      order: 1,
      video: {
        filePath: "/uploads/videos/intro.mp4",
        fileName: "intro.mp4",
        duration: 300
      },
      document: null,
      isRequired: true,
      isActive: true
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingContent, setEditingContent] = useState(null);

  const addContent = () => {
    const newContent = {
      id: contents.length + 1,
      title: "",
      description: "",
      order: contents.length + 1,
      video: null,
      document: null,
      isRequired: true,
      isActive: true
    };
    setContents([...contents, newContent]);
    setEditingContent(newContent.id);
  };

  const updateContent = (contentId, field, value) => {
    setContents(contents.map(content => 
      content.id === contentId 
        ? { ...content, [field]: value }
        : content
    ));
  };

  const updateVideoContent = (contentId, field, value) => {
    setContents(contents.map(content => 
      content.id === contentId 
        ? {
            ...content,
            video: content.video ? { ...content.video, [field]: value } : { [field]: value }
          }
        : content
    ));
  };

  const updateDocumentContent = (contentId, field, value) => {
    setContents(contents.map(content => 
      content.id === contentId 
        ? {
            ...content,
            document: content.document ? { ...content.document, [field]: value } : { [field]: value }
          }
        : content
    ));
  };

  const deleteContent = (contentId) => {
    setContents(contents.filter(content => content.id !== contentId));
  };

  const handleFileUpload = (contentId, type, file) => {
    // Simulate file upload
    const fileData = {
      filePath: `/uploads/${type}s/${file.name}`,
      fileName: file.name,
      fileSize: file.size
    };

    if (type === 'video') {
      updateVideoContent(contentId, 'filePath', fileData.filePath);
      updateVideoContent(contentId, 'fileName', fileData.fileName);
      updateVideoContent(contentId, 'fileSize', fileData.fileSize);
    } else {
      updateDocumentContent(contentId, 'filePath', fileData.filePath);
      updateDocumentContent(contentId, 'fileName', fileData.fileName);
      updateDocumentContent(contentId, 'fileSize', fileData.fileSize);
    }
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Lesson Content</h3>
        <Button
          onClick={addContent}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Content
        </Button>
      </div>

      {contents.map((content, index) => (
        <div key={content.id} className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-500">
                Content {index + 1}
              </span>
              <input
                type="text"
                value={content.title}
                onChange={(e) => updateContent(content.id, 'title', e.target.value)}
                className="text-lg font-semibold text-gray-900 bg-transparent border-none focus:ring-0 p-0"
                placeholder="Content title"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingContent(content.id)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => deleteContent(content.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              value={content.description}
              onChange={(e) => updateContent(content.id, 'description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Content description"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Video Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-blue-600" />
                  <h4 className="font-medium text-gray-700">Video Content</h4>
                </div>
                
                {content.video ? (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-900">
                        {content.video.fileName}
                      </p>
                      {content.video.duration && (
                        <p className="text-sm text-gray-600">
                          Duration: {formatDuration(content.video.duration)}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={content.video.duration || ''}
                          onChange={(e) => updateVideoContent(content.id, 'duration', parseInt(e.target.value))}
                          className="px-3 py-1 border border-gray-300 rounded text-sm"
                          placeholder="Duration (seconds)"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateContent(content.id, 'video', null)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) handleFileUpload(content.id, 'video', file);
                      }}
                      className="hidden"
                      id={`video-upload-${content.id}`}
                    />
                    <label
                      htmlFor={`video-upload-${content.id}`}
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <Upload className="w-8 h-8 text-gray-400" />
                      <span className="text-sm text-gray-600">Upload Video</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Document Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  <h4 className="font-medium text-gray-700">Document Content</h4>
                </div>
                
                {content.document ? (
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-900">
                        {content.document.fileName}
                      </p>
                      {content.document.pageCount && (
                        <p className="text-sm text-gray-600">
                          Pages: {content.document.pageCount}
                        </p>
                      )}
                      <div className="space-y-2">
                        <textarea
                          value={content.document.extractedText || ''}
                          onChange={(e) => updateDocumentContent(content.id, 'extractedText', e.target.value)}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                          placeholder="Extracted text content from PDF"
                        />
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={content.document.pageCount || ''}
                            onChange={(e) => updateDocumentContent(content.id, 'pageCount', parseInt(e.target.value))}
                            className="px-3 py-1 border border-gray-300 rounded text-sm"
                            placeholder="Page count"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateContent(content.id, 'document', null)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) handleFileUpload(content.id, 'document', file);
                      }}
                      className="hidden"
                      id={`document-upload-${content.id}`}
                    />
                    <label
                      htmlFor={`document-upload-${content.id}`}
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <Upload className="w-8 h-8 text-gray-400" />
                      <span className="text-sm text-gray-600">Upload Document</span>
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={content.isRequired}
                  onChange={(e) => updateContent(content.id, 'isRequired', e.target.checked)}
                  className="rounded"
                />
                <label className="text-sm text-gray-700">Required</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={content.isActive}
                  onChange={(e) => updateContent(content.id, 'isActive', e.target.checked)}
                  className="rounded"
                />
                <label className="text-sm text-gray-700">Active</label>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LessonContentManager;
