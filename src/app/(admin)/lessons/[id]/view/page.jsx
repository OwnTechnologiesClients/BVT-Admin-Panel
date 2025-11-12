"use client";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
const MOCK = { title: "Course Overview", description: "Understanding the course structure and objectives", order: 1, isActive: true };
export default function ViewLessonPage() {
  const router = useRouter();
  return (
    <div className="max-w-xl mx-auto p-8">
      <button onClick={()=>router.back()} className="bg-gray-100 rounded-lg p-2 border mb-4"><ArrowLeft className="w-4 h-4" /></button>
      <h1 className="text-2xl font-bold mb-6">Lesson Details</h1>
      <div className="bg-white border shadow rounded-xl p-6 space-y-4">
        <div className="text-lg font-semibold">{MOCK.title}</div>
        <div className="text-gray-700">{MOCK.description}</div>
        <div className="text-sm">Order: <span className="font-semibold">{MOCK.order}</span></div>
        <div className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium mt-2">{MOCK.isActive ? "Active" : "Inactive"}</div>
      </div>
    </div>
  );
}
