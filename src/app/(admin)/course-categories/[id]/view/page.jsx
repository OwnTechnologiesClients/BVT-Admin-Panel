"use client";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
const MOCK = { name: "Marine Engineering", description: "Courses about marine technology.", isActive: true };
export default function ViewCategoryPage() {
  const router = useRouter();
  return (
    <div className="max-w-xl mx-auto p-8">
      <button onClick={()=>router.back()} className="bg-gray-100 rounded-lg p-2 border mb-4"><ArrowLeft className="w-4 h-4" /></button>
      <h1 className="text-2xl font-bold mb-6">Course Category Details</h1>
      <div className="bg-white border shadow rounded-xl p-6 space-y-4">
        <div className="text-lg font-semibold">{MOCK.name}</div>
        <div className="text-gray-700">{MOCK.description}</div>
        <div className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium mt-2">{MOCK.isActive ? "Active" : "Inactive"}</div>
      </div>
    </div>
  );
}
