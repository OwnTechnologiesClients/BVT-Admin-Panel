"use client";
import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import * as testAPI from "@/lib/api/test";

export default function ViewQuestionsPage({ params }) {
  const router = useRouter();
  const { id: testId } = use(params);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await testAPI.getTestById(testId);
        if (response.success) {
          const test = response.data;
          const questionsData = test.questions || [];
          setQuestions(questionsData);
        } else {
          setError(response.message || 'Failed to fetch questions');
        }
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError(err.message || 'Failed to fetch questions');
      } finally {
        setLoading(false);
      }
    };

    if (testId) {
      fetchQuestions();
    }
  }, [testId]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h1 className="text-xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => router.back()} 
            className="mt-4 text-blue-600 hover:underline"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center gap-4 mb-6">
          <button className="rounded-lg bg-gray-100 hover:bg-gray-200 border border-gray-300 p-2" onClick={() => router.back()} title="Back">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">View Test Questions</h1>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
          <p className="text-gray-600">No questions found for this test.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center gap-4 mb-6">
        <button className="rounded-lg bg-gray-100 hover:bg-gray-200 border border-gray-300 p-2" onClick={() => router.back()} title="Back">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">View Test Questions</h1>
      </div>
      <div className="space-y-8">
        {questions.map((q, qIndex) => (
          <div key={q._id || q.id || qIndex} className="border rounded-xl p-6 bg-white shadow-md space-y-4">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg font-medium text-gray-900">Question {qIndex + 1}</span>
                  <span className="px-2 py-0.5 text-xs rounded bg-blue-50 text-blue-700 font-semibold ml-2">
                    {q.points || 1} point{(q.points || 1) !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="mb-3 text-gray-800 text-base">{q.question || 'No question text'}</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Array.isArray(q.options) && q.options.length > 0 ? (
                    q.options.map((option, oIdx) => (
                      <div key={oIdx} className="flex items-center px-2 py-1 rounded bg-gray-50 border border-gray-200">
                        <span className={`w-6 h-6 inline-flex items-center justify-center rounded-full mr-2 ${
                          q.correctAnswer === oIdx ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {q.correctAnswer === oIdx ? <CheckCircle className="w-4 h-4" /> : String.fromCharCode(65 + oIdx)}
                        </span>
                        <span className={q.correctAnswer === oIdx ? 'font-bold text-green-700' : ''}>{option}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 text-sm">No options available</div>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-center mt-2 md:mt-0 md:w-56 w-full">
                <label className="block text-xs text-gray-600 mb-1">Image</label>
                {q.image || q.imageUrl ? (
                  <img
                    src={typeof (q.image || q.imageUrl) === 'string' 
                      ? (q.image || q.imageUrl) 
                      : ((q.image || q.imageUrl)?.url || '')}
                    alt="Question image"
                    className="rounded-xl border border-gray-200 max-h-36 max-w-[200px] object-contain shadow"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) {
                        e.target.nextSibling.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                {!q.image && !q.imageUrl && (
                  <div className="min-h-[80px] rounded-lg border border-dashed border-gray-200 w-full flex items-center justify-center text-gray-400 text-xs">
                    No image
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
