// Lesson Content API module
import { apiRequest } from '../api';

/**
 * Get all lesson contents with pagination and filters
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 10)
 * @param {string} params.courseId - Filter by course ID
 * @param {string} params.chapterId - Filter by chapter ID
 * @param {string} params.lessonId - Filter by lesson ID
 * @param {string} params.search - Search term
 */
export const getAllLessonContents = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.courseId) queryParams.append('courseId', params.courseId);
  if (params.chapterId) queryParams.append('chapterId', params.chapterId);
  if (params.lessonId) queryParams.append('lessonId', params.lessonId);
  if (params.search) queryParams.append('search', params.search);

  const queryString = queryParams.toString();
  const endpoint = `/lesson-contents/list${queryString ? `?${queryString}` : ''}`;
  
  return await apiRequest(endpoint, {
    method: 'GET',
  });
};

/**
 * Get lesson content by ID
 * @param {string} id - Lesson content ID
 */
export const getLessonContentById = async (id) => {
  return await apiRequest(`/lesson-contents/list/${id}`, {
    method: 'GET',
  });
};

/**
 * Get lesson contents by lesson ID
 * @param {string} lessonId - Lesson ID
 */
export const getLessonContentsByLesson = async (lessonId) => {
  return await apiRequest(`/lesson-contents/lesson/${lessonId}`, {
    method: 'GET',
  });
};

/**
 * Get lesson contents by chapter ID
 * @param {string} chapterId - Chapter ID
 */
export const getLessonContentsByChapter = async (chapterId) => {
  return await apiRequest(`/lesson-contents/chapter/${chapterId}`, {
    method: 'GET',
  });
};

/**
 * Get lesson contents by course ID
 * @param {string} courseId - Course ID
 */
export const getLessonContentsByCourse = async (courseId) => {
  return await apiRequest(`/lesson-contents/course/${courseId}`, {
    method: 'GET',
  });
};

/**
 * Create new lesson content
 * @param {Object|FormData} lessonContentData - Lesson content data (can be FormData for file uploads)
 */
export const createLessonContent = async (lessonContentData) => {
  const isFormData = lessonContentData instanceof FormData;
  
  return await apiRequest('/lesson-contents/create', {
    method: 'POST',
    body: isFormData ? lessonContentData : JSON.stringify(lessonContentData),
    headers: isFormData ? {} : { 'Content-Type': 'application/json' },
  }, isFormData); // Pass skipJsonParsing flag for FormData
};

/**
 * Update lesson content
 * @param {string} id - Lesson content ID
 * @param {Object|FormData} lessonContentData - Updated lesson content data (can be FormData for file uploads)
 */
export const updateLessonContent = async (id, lessonContentData) => {
  const isFormData = lessonContentData instanceof FormData;
  
  return await apiRequest(`/lesson-contents/update/${id}`, {
    method: 'PUT',
    body: isFormData ? lessonContentData : JSON.stringify(lessonContentData),
    headers: isFormData ? {} : { 'Content-Type': 'application/json' },
  }, isFormData); // Pass skipJsonParsing flag for FormData
};

/**
 * Delete lesson content
 * @param {string} id - Lesson content ID
 */
export const deleteLessonContent = async (id) => {
  return await apiRequest(`/lesson-contents/delete/${id}`, {
    method: 'DELETE',
  });
};

