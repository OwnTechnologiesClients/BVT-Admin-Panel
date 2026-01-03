"use client";
import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Trash2, Upload, Plus, Loader2, X } from "lucide-react";
import * as testAPI from "@/lib/api/test";
import { Button } from "@/components/ui";
import { showSuccess, showError } from "@/lib/utils/sweetalert";

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
          
          // Process options - handle both old format (strings) and new format (objects)
          const processOptions = (options) => {
            if (!Array.isArray(options)) return [
              { type: "text", value: "" },
              { type: "text", value: "" },
              { type: "text", value: "" },
              { type: "text", value: "" }
            ];
            
            // If it's old format (strings), convert to new format
            if (options.length > 0 && typeof options[0] === 'string') {
              return options.map(opt => ({ type: "text", value: opt || "" }));
            }
            
            // If it's new format, ensure all have type and value
            return options.map(opt => {
              if (typeof opt === 'object' && opt !== null && opt.type && opt.value !== undefined) {
                return opt;
              }
              return { type: "text", value: opt || "" };
            });
          };

          // If no questions, add one empty question
          if (questionsData.length === 0) {
            setQuestions([{
              id: Date.now(),
              question: "",
              options: [
                { type: "text", value: "" },
                { type: "text", value: "" },
                { type: "text", value: "" },
                { type: "text", value: "" }
              ],
              correctAnswer: 0,
              points: 1,
              image: null
            }]);
          } else {
            // Map questions to editable format
            setQuestions(questionsData.map((q, idx) => {
              const processedOptions = processOptions(q.options);
              // Ensure we have at least 4 options
              while (processedOptions.length < 4) {
                processedOptions.push({ type: "text", value: "" });
              }
              return {
                id: q._id || q.id || idx,
                question: q.question || "",
                options: processedOptions,
                correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : 0,
                points: q.points || 1,
                image: q.image || null
              };
            }));
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

  const handleOptionChange = (qIndex, oIdx, field, value) => {
    const updated = [...questions];
    if (!updated[qIndex].options) {
      updated[qIndex].options = [
        { type: "text", value: "" },
        { type: "text", value: "" },
        { type: "text", value: "" },
        { type: "text", value: "" }
      ];
    }
    if (field === 'type' || field === 'value') {
      if (!updated[qIndex].options[oIdx] || typeof updated[qIndex].options[oIdx] !== 'object') {
        updated[qIndex].options[oIdx] = { type: 'text', value: '' };
      }
      updated[qIndex].options[oIdx][field] = value;
      // When changing type, reset value if needed
      if (field === 'type') {
        if (value === 'text') {
          updated[qIndex].options[oIdx].value = '';
        } else if (value === 'image') {
          updated[qIndex].options[oIdx].value = null;
        }
      }
    } else {
      // Backward compatibility - if value is passed directly
      updated[qIndex].options[oIdx] = value;
    }
    setQuestions(updated);
  };

  const handleOptionImageChange = (qIndex, oIdx, file) => {
    const updated = [...questions];
    if (!updated[qIndex].options[oIdx] || typeof updated[qIndex].options[oIdx] !== 'object') {
      updated[qIndex].options[oIdx] = { type: 'image', value: null };
    }
    updated[qIndex].options[oIdx] = {
      type: "image",
      value: file || null
    };
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
      showError('Validation Error', 'At least one question is required');
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, {
      id: Date.now(),
      question: "",
      options: [
        { type: "text", value: "" },
        { type: "text", value: "" },
        { type: "text", value: "" },
        { type: "text", value: "" }
      ],
      correctAnswer: 0,
      points: 1,
      image: null
    }]);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Check if there are any file uploads (question images or option images)
      const hasFileUploads = questions.some(q => 
        (q.image && q.image instanceof File) ||
        q.options.some(opt => opt && typeof opt === 'object' && opt.type === 'image' && opt.value instanceof File)
      );
      
      // Prepare questions data for API
      const questionsData = questions.map((q, idx) => {
        // Process options - filter out empty ones and convert to proper format
        const processedOptions = q.options
          .filter(opt => {
            if (typeof opt === 'object' && opt !== null && opt.type) {
              if (opt.type === 'image') {
                return opt.value !== null && opt.value !== undefined && opt.value !== '' && 
                       (opt.value instanceof File || (typeof opt.value === 'string' && opt.value.trim() !== ''));
              }
              if (opt.type === 'text') {
                return opt.value !== null && opt.value !== undefined && opt.value !== '' && 
                       typeof opt.value === 'string' && opt.value.trim() !== '';
              }
            }
            return false;
          })
          .map(opt => {
            if (typeof opt === 'object' && opt !== null && opt.type) {
              if (opt.type === 'image' && opt.value instanceof File) {
                return { type: 'image', value: '' }; // Placeholder, file will be in FormData
              }
              return opt;
            }
            return { type: 'text', value: opt };
          });

        // Adjust correctAnswer index based on filtered options
        let adjustedCorrectAnswer = q.correctAnswer;
        if (q.correctAnswer !== null && q.correctAnswer !== undefined) {
          let validBeforeCorrect = 0;
          for (let i = 0; i < q.correctAnswer && i < q.options.length; i++) {
            const opt = q.options[i];
            if (typeof opt === 'object' && opt !== null && opt.type) {
              if (opt.type === 'image') {
                if (opt.value !== null && opt.value !== undefined && opt.value !== '' && 
                    (opt.value instanceof File || (typeof opt.value === 'string' && opt.value.trim() !== ''))) {
                  validBeforeCorrect++;
                }
              } else if (opt.type === 'text') {
                if (opt.value !== null && opt.value !== undefined && opt.value !== '' && 
                    typeof opt.value === 'string' && opt.value.trim() !== '') {
                  validBeforeCorrect++;
                }
              }
            }
          }
          adjustedCorrectAnswer = validBeforeCorrect;
        }

        const questionData = {
          question: q.question.trim(),
          options: processedOptions,
          correctAnswer: adjustedCorrectAnswer,
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
          showError('Validation Error', `Question ${i + 1} is required`);
          setSaving(false);
          return;
        }
        if (!q.options || q.options.length < 2) {
          showError('Validation Error', `Question ${i + 1} must have at least 2 options`);
          setSaving(false);
          return;
        }
        if (q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
          showError('Validation Error', `Question ${i + 1} must have a valid correct answer`);
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
        
        // Append question image files
        questions.forEach((q, qIndex) => {
          if (q.image && q.image instanceof File) {
            formData.append(`questionImage[${qIndex}]`, q.image);
          }
          
          // Append option image files - need to map to processed option indices
          q.options.forEach((opt, optIndex) => {
            if (opt && typeof opt === 'object' && opt.type === 'image' && opt.value instanceof File) {
              // Calculate the processed index
              let processedIndex = 0;
              for (let i = 0; i < optIndex; i++) {
                const prevOpt = q.options[i];
                if (typeof prevOpt === 'object' && prevOpt !== null && prevOpt.type) {
                  if (prevOpt.type === 'image') {
                    if (prevOpt.value !== null && prevOpt.value !== undefined && prevOpt.value !== '' && 
                        (prevOpt.value instanceof File || (typeof prevOpt.value === 'string' && prevOpt.value.trim() !== ''))) {
                      processedIndex++;
                    }
                  } else if (prevOpt.type === 'text') {
                    if (prevOpt.value !== null && prevOpt.value !== undefined && prevOpt.value !== '' && 
                        typeof prevOpt.value === 'string' && prevOpt.value.trim() !== '') {
                      processedIndex++;
                    }
                  }
                }
              }
              formData.append(`optionImage[${qIndex}][${processedIndex}]`, opt.value);
            }
          });
        });
        
        response = await testAPI.updateTest(testId, formData);
      } else {
        // Use plain object if no file uploads
        response = await testAPI.updateTest(testId, {
          questions: questionsData
        });
      }

      if (response.success) {
        showSuccess('Questions Updated!', 'The test questions have been updated successfully.');
        setTimeout(() => {
          router.back();
        }, 1500);
      } else {
        showError('Error', response.message || 'Failed to update questions');
      }
    } catch (err) {
      console.error('Error saving questions:', err);
      showError('Error', err.message || 'Failed to save questions');
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
                {(q.options || [
                  { type: "text", value: "" },
                  { type: "text", value: "" },
                  { type: "text", value: "" },
                  { type: "text", value: "" }
                ]).map((option, oIdx) => {
                  const optionValue = typeof option === 'object' && option !== null ? option.value : option;
                  const optionType = typeof option === 'object' && option !== null ? option.type : 'text';
                  const isImageOption = optionType === 'image';
                  const isImageFile = isImageOption && optionValue instanceof File;
                  const isImageUrl = isImageOption && typeof optionValue === 'string' && optionValue !== '';
                  
                  return (
                    <div key={oIdx} className="flex items-start gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50">
                      <input
                        type="radio"
                        name={`correct-${q.id || qIndex}`}
                        checked={q.correctAnswer === oIdx}
                        onChange={() => handleChange(qIndex, 'correctAnswer', oIdx)}
                        className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-medium text-gray-700">
                            Option {String.fromCharCode(65 + oIdx)}
                          </label>
                          <select
                            value={optionType}
                            onChange={(e) => {
                              const newType = e.target.value;
                              if (newType === 'text') {
                                handleOptionChange(qIndex, oIdx, 'type', 'text');
                                handleOptionChange(qIndex, oIdx, 'value', '');
                              } else {
                                handleOptionChange(qIndex, oIdx, 'type', 'image');
                                handleOptionChange(qIndex, oIdx, 'value', null);
                              }
                            }}
                            className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="text">Text</option>
                            <option value="image">Image</option>
                          </select>
                        </div>
                        
                        {optionType === 'text' ? (
                          <input
                            type="text"
                            value={optionValue || ''}
                            onChange={(e) => handleOptionChange(qIndex, oIdx, 'value', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder={`Enter option ${String.fromCharCode(65 + oIdx)}`}
                          />
                        ) : (
                          <div className="space-y-2">
                            {isImageUrl || isImageFile ? (
                              <div className="relative group">
                                <img
                                  src={isImageFile ? URL.createObjectURL(optionValue) : optionValue}
                                  alt={`Option ${String.fromCharCode(65 + oIdx)}`}
                                  className="w-full max-h-32 object-contain rounded-lg border border-gray-300 bg-white"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleOptionImageChange(qIndex, oIdx, null)}
                                  className="absolute top-2 right-2 bg-white bg-opacity-90 hover:bg-red-100 rounded-full p-1 text-red-600 border border-red-200 shadow opacity-85 hover:opacity-100 transition-all"
                                  title="Remove image"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <label className="block w-full cursor-pointer bg-white border border-dashed border-gray-300 rounded-lg px-4 py-4 flex flex-col items-center justify-center text-center text-gray-500 hover:border-blue-400 transition-all">
                                <Upload className="w-5 h-5 mb-1" />
                                <span className="text-xs">Click to upload image</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files && e.target.files[0];
                                    if (file) {
                                      handleOptionImageChange(qIndex, oIdx, file);
                                    }
                                  }}
                                  className="hidden"
                                />
                              </label>
                            )}
                          </div>
                        )}
                        {q.correctAnswer === oIdx && (
                          <span className="text-xs text-green-600 font-medium">✓ Correct Answer</span>
                        )}
                      </div>
                    </div>
                  );
                })}
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
