"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Upload, Download, Eye, Loader2, CheckCircle2 } from "lucide-react";
import { issueCertificate } from "@/lib/api/certificate";

/**
 * CertificateModal - On-demand certificate generation with "Drag and Fix" + Resizing.
 */
export default function CertificateModal({ isOpen, onClose, student, course }) {
  const [signature1, setSignature1] = useState(null);
  const [sig1Preview, setSig1Preview] = useState(null);
  const [completionDate, setCompletionDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [generating, setGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [issued, setIssued] = useState(false);

  // Default positions (percentages) and sizes
  const defaultPositions = {
    studentName: { x: 50, y: 44, size: 80 },
    courseName: { x: 50, y: 59, size: 32 },
    date: { x: 32, y: 82, size: 18 },
    signature: { x: 68, y: 81, size: 60 }, // height in pixels at 1122 width
  };

  const [positions, setPositions] = useState(defaultPositions);
  const [previewWidth, setPreviewWidth] = useState(1122);

  const previewRef = useRef(null);
  const sig1Ref = useRef(null);

  // Update preview width when container changes
  useEffect(() => {
    if (!showPreview || !previewRef.current) return;
    
    const updateWidth = () => {
      if (previewRef.current) {
        setPreviewWidth(previewRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [showPreview, isOpen]);

  const scale = previewWidth / 1122;


  // Capitalization helper
  const capitalize = (str) => {
    if (!str) return "";
    return str.toLowerCase().split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  };

  const handleFileSelect = (file, setter, previewSetter) => {
    if (!file) return;
    setter(file);
    const reader = new FileReader();
    reader.onload = (e) => previewSetter(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleIssue = async () => {
    if (!signature1) {
      alert("Please upload a signature before issuing.");
      return;
    }

    setGenerating(true);
    try {
      const formData = new FormData();
      formData.append("studentId", student._id || student.id);
      formData.append("courseId", course._id || course.id);
      formData.append("completionDate", completionDate);
      formData.append("signature1", signature1);
      formData.append("positions", JSON.stringify(positions));

      await issueCertificate(formData);
      setIssued(true);
    } catch (error) {
      alert("Failed to issue certificate: " + error.message);
    } finally {
      setGenerating(false);
    }
  };

  const formattedDate = new Date(completionDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Issue Certificate</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Review details and upload your signature to generate the certificate.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls */}
          <div className="lg:col-span-3 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Completion Date</label>
              <input
                type="date"
                value={completionDate}
                onChange={(e) => setCompletionDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Signature</label>
              <div
                onClick={() => sig1Ref.current?.click()}
                className={`flex flex-col items-center justify-center gap-2 px-4 py-5 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                  sig1Preview ? "border-green-300 bg-green-50/50" : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/50"
                }`}
              >
                {sig1Preview ? (
                  <img src={sig1Preview} alt="Signature" className="h-10 object-contain" />
                ) : (
                  <><Upload className="w-5 h-5 text-gray-400" /><span className="text-[10px] text-gray-500">Upload</span></>
                )}
              </div>
              <input ref={sig1Ref} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileSelect(e.target.files[0], setSignature1, setSig1Preview)} />
            </div>
          </div>

          {/* Preview */}
          <div className="lg:col-span-9">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2 text-sm font-medium text-blue-600"
              >
                <Eye className="w-4 h-4" /> {showPreview ? "Hide Preview" : "Show Preview"}
              </button>
            </div>

            {showPreview && (
              issued ? (
                <div className="flex flex-col items-center justify-center h-[500px] bg-green-50 rounded-2xl border-2 border-dashed border-green-200">
                  <CheckCircle2 className="w-16 h-16 text-green-500 mb-4 animate-bounce" />
                  <h3 className="text-xl font-bold text-green-900 mb-2">Certificate Issued!</h3>
                  <p className="text-green-700 text-center max-w-md px-6">
                    The certificate has been securely stored in S3 and emailed to <strong>{student.fullName}</strong> ({student.email}).
                  </p>
                  <button 
                    onClick={onClose}
                    className="mt-8 px-8 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-lg"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <div ref={previewRef} className="relative aspect-[1.414/1] bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100 group">
                  <img src="/certificate_template.png" alt="Template" className="w-full h-full object-contain" />
                  
                  {/* Overlay for realism */}
                  <div className="absolute inset-0 bg-blue-500/5 pointer-events-none" />

                  {/* Elements */}
                  <div
                    className="absolute flex items-center justify-center text-center"
                    style={{
                      left: `${positions.studentName.x}%`,
                      top: `${positions.studentName.y}%`,
                      transform: "translate(-50%, -50%)",
                      width: "80%"
                    }}
                  >
                    <p
                      className="text-gray-900 pointer-events-none"
                      style={{
                        fontFamily: "'Great Vibes', cursive",
                        fontSize: `${positions.studentName.size * scale}px`,
                        lineHeight: "1.2",
                      }}
                    >
                      {capitalize(student?.fullName) || "Student Name"}
                    </p>
                  </div>

                  <div
                    className="absolute flex items-center justify-center"
                    style={{
                      left: `${positions.courseName.x}%`,
                      top: `${positions.courseName.y}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <p
                      className="text-blue-900 pointer-events-none text-center"
                      style={{ 
                        fontFamily: "'Great Vibes', cursive", 
                        fontSize: `${positions.courseName.size * scale}px`,
                        maxWidth: `${720 * scale}px`,
                        lineHeight: "1.15",
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden"
                      }}
                    >
                      {capitalize(course?.title) || "Course Title"}
                    </p>
                  </div>

                  <div
                    className="absolute flex items-center justify-center"
                    style={{
                      left: `${positions.date.x}%`,
                      top: `${positions.date.y}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <p className="text-gray-700 font-serif pointer-events-none" style={{ fontSize: `${positions.date.size * scale}px` }}>
                      {formattedDate}
                    </p>
                  </div>

                  {sig1Preview && (
                    <div
                      className="absolute flex items-center justify-center"
                      style={{
                        left: `${positions.signature.x}%`,
                        top: `${positions.signature.y}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      <img src={sig1Preview} alt="Signature" style={{ height: `${positions.signature.size * scale}px` }} className="pointer-events-none grayscale brightness-125 contrast-125" />
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-100">Cancel</button>
          {!issued && (
            <button
              onClick={handleIssue}
              disabled={generating || !signature1}
              className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25 transition-all"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Issuing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Issue Certificate
                </>
              )}
            </button>
          )}
        </div>
      </div>
      <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap" rel="stylesheet" />
    </div>
  );
}
