"use client";
import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Trash2, Upload, Plus, Loader2 } from "lucide-react";
import * as testAPI from "@/lib/api/test";
import { Button } from "@/components/ui";

export default function EditQuestionsPage({ params }) {
  const router = useRouter();
  const { id: testId } = use(params);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
          
          // If no questions, add one empty question
          if (questionsData.length === 0) {
            setQuestions([{
              id: Date.now(),
              question: "",
              options: ["", "", "", ""],
              correctAnswer: 0,
              points: 1,
              image: null
            }]);
          } else {
            // Map questions to editable format
            setQuestions(questionsData.map((q, idx) => ({
              id: q._id || q.id || idx,
              question: q.question || "",
              options: q.options || ["", "", "", ""],
              correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : 0,
              points: q.points || 1,
              image: q.image || null
            })));
          }
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

  const handleChange = (qIndex, field, value) => {
    const updated = [...questions];
    updated[qIndex][field] = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex, oIdx, value) => {
    const updated = [...questions];
    if (!updated[qIndex].options) {
      updated[qIndex].options = ["", "", "", ""];
    }
    updated[qIndex].options[oIdx] = value;
    setQuestions(updated);
  };

  const handleImageChange = (qIndex, file) => {
    const updated = [...questions];
    updated[qIndex].image = file;
    setQuestions(updated);
  };

  const removeQuestion = (qIndex) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== qIndex));
    } else {
      alert("At least one question is required");
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, {
      id: Date.now(),
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      points: 1,
      image: null
    }]);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Check if there are any file uploads
      const hasFileUploads = questions.some(q => q.image && q.image instanceof File);
      
      // Prepare questions data for API
      const questionsData = questions.map((q, idx) => {
        const questionData = {
          question: q.question.trim(),
          options: q.options.filter(opt => opt.trim() !== ""),
          correctAnswer: q.correctAnswer,
          points: q.points || 1
        };
        
        // Handle image - if it's a File, it will be handled by FormData
        // If it's a string (existing image URL), include it
        if (q.image && typeof q.image === 'string') {
          questionData.image = q.image;
        } else if (q.image && q.image.url) {
          questionData.image = q.image.url;
        }
        
        return questionData;
      });

      // Validate questions
      for (let i = 0; i < questionsData.length; i++) {
        const q = questionsData[i];
        if (!q.question || q.question.length === 0) {
          alert(`Question ${i + 1} is required`);
          setSaving(false);
          return;
        }
        if (!q.options || q.options.length < 2) {
          alert(`Question ${i + 1} must have at least 2 options`);
          setSaving(false);
          return;
        }
        if (q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
          alert(`Question ${i + 1} must have a valid correct answer`);
          setSaving(false);
          return;
        }
      }

      let response;
      
      if (hasFileUploads) {
        // Use FormData if there are file uploads
        const formData = new FormData();
        formData.append('questions', JSON.stringify(questionsData.map((q, idx) => ({
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          points: q.points,
          image: questions[idx].image instanceof File ? undefined : q.image
        }))));
        
        // Append image files
        questions.forEach((q, idx) => {
          if (q.image && q.image instanceof File) {
            formData.append(`questionImage_${idx}`, q.image);
          }
        });
        
        response = await testAPI.updateTest(testId, formData);
      } else {
        // Use plain object if no file uploads
        response = await testAPI.updateTest(testId, {
          questions: questionsData
        });
      }

      if (response.success) {
        alert("Questions updated successfully!");
        router.back();
      } else {
        alert(response.message || 'Failed to update questions');
      }
    } catch (err) {
      console.error('Error saving questions:', err);
      alert(err.message || 'Failed to save questions');
    } finally {
      setSaving(false);
    }
  };

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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button className="rounded-lg bg-gray-100 hover:bg-gray-200 border border-gray-300 p-2" onClick={() => router.back()} title="Back">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Edit Test Questions</h1>
        </div>
        <Button
          variant="primary"
          onClick={addQuestion}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Question
        </Button>
      </div>
      <div className="space-y-8">
        {questions.map((q, qIndex) => (
          <div key={q.id || qIndex} className="border rounded-xl p-6 bg-white shadow-md relative space-y-4">
            <button 
              onClick={() => removeQuestion(qIndex)} 
              title="Delete question" 
              className="absolute top-3 right-3 bg-red-50 hover:bg-red-200 rounded-full p-1 border border-red-200 text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            {/* Q Text + Attachment */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={q.question}
                  onChange={e => handleChange(qIndex, 'question', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                  required
                  placeholder="Enter your question here"
                />
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Points <span className="text-gray-400 text-xs">(optional)</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={q.points || 1}
                    onChange={e => handleChange(qIndex, 'points', parseInt(e.target.value) || 1)}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex flex-col items-center w-full md:w-48 mt-2 md:mt-0">
                <label className="block text-xs text-gray-600 mb-1">Image <span className="text-gray-400 text-xs">(optional)</span></label>
                {q.image ? (
                  <div className="relative group mt-1 flex flex-col items-center">
                    <img
                      src={typeof q.image === 'string' ? q.image : (q.image.url || URL.createObjectURL(q.image))}
                      alt="Question image"
                      className="rounded-xl border border-gray-200 max-h-32 max-w-[180px] object-contain shadow"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.nextSibling) {
                          e.target.nextSibling.style.display = 'flex';
                        }
                      }}
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
                    <span>Click to upload</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={e => handleImageChange(qIndex, e.target.files?.[0] || null)} 
                      className="hidden" 
                    />
                  </label>
                )}
              </div>
            </div>
            {/* Options */}
            <div className="space-y-3 mt-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Options <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(q.options || ["", "", "", ""]).map((option, oIdx) => (
                  <div key={oIdx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${q.id || qIndex}`}
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
                    {q.correctAnswer === oIdx && (
                      <span className="text-xs text-green-600 font-medium">Correct</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-4 justify-end pt-4 border-t">
        <Button
          variant="outline"
          onClick={() => router.back()}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save All Questions
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
