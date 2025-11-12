"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Trash2, Upload } from "lucide-react";

const MOCK_QUESTIONS = [
  {
    id: 1,
    question: "What does the term 'displacement' refer to in marine engineering?",
    options: ["The weight of the ship", "The speed of the ship", "The cargo capacity", "The length of the ship"],
    correctAnswer: 0,
    points: 2,
    image: null
  },
  {
    id: 2,
    question: "Which component is responsible for propulsion in a ship?",
    options: ["Anchor", "Rudder", "Propeller", "Bridge"],
    correctAnswer: 2,
    points: 1,
    image: null
  }
];

export default function EditQuestionsPage() {
  const router = useRouter();
  const { id: testId } = useParams();
  const [questions, setQuestions] = useState(MOCK_QUESTIONS);

  const handleChange = (qIndex, field, value) => {
    const updated = [...questions];
    updated[qIndex][field] = value;
    setQuestions(updated);
  };
  const handleOptionChange = (qIndex, oIdx, value) => {
    const updated = [...questions];
    updated[qIndex].options[oIdx] = value;
    setQuestions(updated);
  };
  const handleImageChange = (qIndex, file) => {
    const updated = [...questions];
    updated[qIndex].image = file;
    setQuestions(updated);
  };
  const removeQuestion = (qIndex) => {
    setQuestions(questions.filter((_, i) => i !== qIndex));
  };
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center gap-4 mb-6">
        <button className="rounded-lg bg-gray-100 hover:bg-gray-200 border border-gray-300 p-2" onClick={() => router.back()} title="Back">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Edit Test Questions</h1>
      </div>
      <div className="space-y-8">
        {questions.map((q, qIndex) => (
          <div key={q.id} className="border rounded-xl p-6 bg-white shadow-md relative space-y-4">
            <button onClick={() => removeQuestion(qIndex)} title="Delete question" className="absolute top-3 right-3 bg-red-50 hover:bg-red-200 rounded-full p-1 border border-red-200 text-red-600">
              <Trash2 className="w-4 h-4" />
            </button>
            {/* Q Text + Attachment */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Question *</label>
                <textarea
                  value={q.question}
                  onChange={e => handleChange(qIndex, 'question', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                  required
                />
              </div>
              <div className="flex flex-col items-center w-full md:w-48 mt-2 md:mt-0">
                <label className="block text-xs text-gray-600 mb-1">Image (optional)</label>
                {q.image ? (
                  <div className="relative group mt-1 flex flex-col items-center">
                    <img
                      src={typeof q.image === 'string' ? q.image : URL.createObjectURL(q.image)}
                      alt="Question image"
                      className="rounded-xl border border-gray-200 max-h-32 max-w-[180px] object-contain shadow"
                    />
                    <button
                      type="button"
                      onClick={() => handleImageChange(qIndex, null)}
                      className="absolute top-1 right-1 bg-white hover:bg-red-100 rounded-full p-1 text-red-500 border border-red-200"
                      title="Remove image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="block cursor-pointer bg-white border border-dashed border-gray-300 rounded-lg px-2 py-4 min-h-[80px] w-full text-xs text-center text-gray-500 hover:border-blue-400 transition-all group">
                    <Upload className="mx-auto mb-1 w-6 h-6" />
                    <span>Click or drag/replace</span>
                    <input type="file" accept="image/*" onChange={e => handleImageChange(qIndex, e.target.files[0])} className="hidden" />
                  </label>
                )}
              </div>
            </div>
            {/* Options */}
            <div className="space-y-3 mt-3">
              <label className="block text-xs text-gray-700 mb-1">Options *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {q.options.map((option, oIdx) => (
                  <div key={oIdx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${q.id}`}
                      checked={q.correctAnswer === oIdx}
                      onChange={() => handleChange(qIndex, 'correctAnswer', oIdx)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <input
                      className="flex-1 px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500"
                      value={option}
                      onChange={e => handleOptionChange(qIndex, oIdx, e.target.value)}
                      required
                      placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-4 mt-4">
              <button className="bg-blue-600 text-white rounded-lg px-4 py-2 font-semibold hover:bg-blue-700 flex items-center gap-2">
                <Save className="w-4 h-4" /> Save
              </button>
              <button className="bg-gray-100 hover:bg-gray-200 rounded-lg px-4 py-2 text-gray-700 border font-semibold">Cancel</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
