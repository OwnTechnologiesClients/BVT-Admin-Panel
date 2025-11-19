// Lesson API module
import { apiRequest } from '../api';

/**
 * Get all lessons with pagination and filters
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 10)
 * @param {string} params.chapterId - Filter by chapter ID
 * @param {string} params.courseId - Filter by course ID
 * @param {string} params.sort_column - Sort column (default: 'createdAt')
 * @param {string} params.sort_direction - Sort direction 'asc' or 'desc' (default: 'asc')
 */
export const getAllLessons = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.chapterId) queryParams.append('chapterId', params.chapterId);
  if (params.courseId) queryParams.append('courseId', params.courseId);
  if (params.sort_column) queryParams.append('sort_column', params.sort_column);
  if (params.sort_direction) queryParams.append('sort_direction', params.sort_direction);

  const queryString = queryParams.toString();
  const endpoint = `/lessons/list${queryString ? `?${queryString}` : ''}`;
  
  return await apiRequest(endpoint, {
    method: 'GET',
  });
};

/**
 * Get lesson by ID
 * @param {string} id - Lesson ID
 */
export const getLessonById = async (id) => {
  return await apiRequest(`/lessons/list/${id}`, {
    method: 'GET',
  });
};

/**
 * Get lessons by chapter ID
 * @param {string} chapterId - Chapter ID
 */
export const getLessonsByChapter = async (chapterId) => {
  return await apiRequest(`/lessons/chapter/${chapterId}`, {
    method: 'GET',
  });
};

/**
 * Get lessons by course ID
 * @param {string} courseId - Course ID
 */
export const getLessonsByCourse = async (courseId) => {
  return await apiRequest(`/lessons/course/${courseId}`, {
    method: 'GET',
  });
};

/**
 * Create new lesson
 * @param {Object} lessonData - Lesson data
 */
export const createLesson = async (lessonData) => {
  return await apiRequest('/lessons/create', {
    method: 'POST',
    body: JSON.stringify(lessonData),
  });
};

/**
 * Update lesson
 * @param {string} id - Lesson ID
 * @param {Object} lessonData - Updated lesson data
 */
export const updateLesson = async (id, lessonData) => {
  return await apiRequest(`/lessons/update/${id}`, {
    method: 'PUT',
    body: JSON.stringify(lessonData),
  });
};

/**
 * Delete lesson
 * @param {string} id - Lesson ID
 */
export const deleteLesson = async (id) => {
  return await apiRequest(`/lessons/delete/${id}`, {
    method: 'DELETE',
  });
};

