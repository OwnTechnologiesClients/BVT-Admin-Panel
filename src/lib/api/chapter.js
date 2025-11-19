// Chapter API module
import { apiRequest } from '../api';

/**
 * Get all chapters with pagination and filters
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 10)
 * @param {string} params.courseId - Filter by course ID
 * @param {string} params.sort_column - Sort column (default: 'createdAt')
 * @param {string} params.sort_direction - Sort direction 'asc' or 'desc' (default: 'asc')
 */
export const getAllChapters = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.courseId) queryParams.append('courseId', params.courseId);
  if (params.sort_column) queryParams.append('sort_column', params.sort_column);
  if (params.sort_direction) queryParams.append('sort_direction', params.sort_direction);

  const queryString = queryParams.toString();
  const endpoint = `/chapters/list${queryString ? `?${queryString}` : ''}`;
  
  return await apiRequest(endpoint, {
    method: 'GET',
  });
};

/**
 * Get chapter by ID
 * @param {string} id - Chapter ID
 */
export const getChapterById = async (id) => {
  return await apiRequest(`/chapters/list/${id}`, {
    method: 'GET',
  });
};

/**
 * Get chapters by course ID
 * @param {string} courseId - Course ID
 */
export const getChaptersByCourse = async (courseId) => {
  return await apiRequest(`/chapters/course/${courseId}`, {
    method: 'GET',
  });
};

/**
 * Create new chapter
 * @param {Object} chapterData - Chapter data
 */
export const createChapter = async (chapterData) => {
  return await apiRequest('/chapters/create', {
    method: 'POST',
    body: JSON.stringify(chapterData),
  });
};

/**
 * Update chapter
 * @param {string} id - Chapter ID
 * @param {Object} chapterData - Updated chapter data
 */
export const updateChapter = async (id, chapterData) => {
  return await apiRequest(`/chapters/update/${id}`, {
    method: 'PUT',
    body: JSON.stringify(chapterData),
  });
};

/**
 * Delete chapter
 * @param {string} id - Chapter ID
 */
export const deleteChapter = async (id) => {
  return await apiRequest(`/chapters/delete/${id}`, {
    method: 'DELETE',
  });
};

