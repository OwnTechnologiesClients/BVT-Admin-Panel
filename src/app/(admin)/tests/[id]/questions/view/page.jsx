"use client";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle } from "lucide-react";

const MOCK_QUESTIONS = [
  {
    id: 1,
    question: "What does the term 'displacement' refer to in marine engineering?",
    options: ["The weight of the ship", "The speed of the ship", "The cargo capacity", "The length of the ship"],
    correctAnswer: 0,
    points: 2,
    image: null,
  },
  {
    id: 2,
    question: "Which component is responsible for propulsion in a ship?",
    options: ["Anchor", "Rudder", "Propeller", "Bridge"],
    correctAnswer: 2,
    points: 1,
    image: null,
  },
];

export default function ViewQuestionsPage() {
  const router = useRouter();
  const { id: testId } = useParams();
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center gap-4 mb-6">
        <button className="rounded-lg bg-gray-100 hover:bg-gray-200 border border-gray-300 p-2" onClick={() => router.back()} title="Back">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">View Test Questions</h1>
      </div>
      <div className="space-y-8">
        {MOCK_QUESTIONS.map((q, qIndex) => (
          <div key={q.id} className="border rounded-xl p-6 bg-white shadow-md space-y-4">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg font-medium text-gray-900">Question {qIndex + 1}</span>
                  <span className="px-2 py-0.5 text-xs rounded bg-blue-50 text-blue-700 font-semibold ml-2">{q.points} point{q.points !== 1 ? 's' : ''}</span>
                </div>
                <div className="mb-3 text-gray-800 text-base">{q.question}</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((option, oIdx) => (
                    <div key={oIdx} className="flex items-center px-2 py-1 rounded bg-gray-50 border border-gray-200">
                      <span className={`w-6 h-6 inline-flex items-center justify-center rounded-full mr-2 ${q.correctAnswer === oIdx ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-600'}`}>
                        {q.correctAnswer === oIdx ? <CheckCircle className="w-4 h-4" /> : String.fromCharCode(65 + oIdx)}
                      </span>
                      <span className={q.correctAnswer === oIdx ? 'font-bold text-green-700' : ''}>{option}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-center mt-2 md:mt-0 md:w-56 w-full">
                <label className="block text-xs text-gray-600 mb-1">Image</label>
                {q.image ? (
                  <img
                    src={typeof q.image === 'string' ? q.image : URL.createObjectURL(q.image)}
                    alt="Question image"
                    className="rounded-xl border border-gray-200 max-h-36 max-w-[200px] object-contain shadow"
                  />
                ) : (
                  <div className="min-h-[80px] rounded-lg border border-dashed border-gray-200 w-full flex items-center justify-center text-gray-400 text-xs">No image</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
