"use client";
import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
const MOCK = { name: "Marine Engineering", description: "Courses about marine technology.", isActive: true };
export default function EditCategoryPage() {
  const router = useRouter(); const { id } = useParams(); const [cat, setCat] = useState(MOCK);
  return (
    <div className="max-w-xl mx-auto p-8">
      <button onClick={()=>router.back()} className="bg-gray-100 rounded-lg p-2 border mb-4"><ArrowLeft className="w-4 h-4" /></button>
      <h1 className="text-2xl font-bold mb-6">Edit Course Category</h1>
      <label className="block mb-3 text-sm font-medium">Name
        <input className="w-full border rounded px-3 py-2 mt-1" value={cat.name} onChange={e=>setCat({...cat, name: e.target.value})} /></label>
      <label className="block mb-3 text-sm font-medium">Description
        <textarea className="w-full border rounded px-3 py-2 mt-1" value={cat.description} onChange={e=>setCat({...cat, description: e.target.value})} /></label>
      <label className="inline-flex items-center gap-2 mb-6">
        <input type="checkbox" checked={cat.isActive} onChange={e=>setCat({...cat, isActive:e.target.checked})} />Active
      </label>
      <div className="flex gap-4 mt-8">
        <button className="bg-blue-600 text-white px-5 py-2 rounded-lg flex items-center gap-2"><Save className="w-4 h-4" />Save</button>
        <button className="bg-gray-100 px-5 py-2 rounded-lg border" onClick={()=>router.back()}>Cancel</button>
      </div>
    </div>
  );
}
