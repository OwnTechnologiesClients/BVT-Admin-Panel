// Course API module
import { apiRequest } from '../api';

/**
 * Get all courses with pagination, search, and filters
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 10)
 * @param {string} params.search - Search query
 * @param {string} params.category - Filter by category ID
 * @param {string} params.instructor - Filter by instructor ID
 * @param {string} params.status - Filter by status
 * @param {string} params.sort_column - Sort column (default: 'createdAt')
 * @param {string} params.sort_direction - Sort direction 'asc' or 'desc' (default: 'asc')
 */
export const getAllCourses = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.search) queryParams.append('search', params.search);
  if (params.category) queryParams.append('category', params.category);
  if (params.instructor) queryParams.append('instructor', params.instructor);
  if (params.status) queryParams.append('status', params.status);
  if (params.sort_column) queryParams.append('sort_column', params.sort_column);
  if (params.sort_direction) queryParams.append('sort_direction', params.sort_direction);

  const queryString = queryParams.toString();
  const endpoint = `/courses/list${queryString ? `?${queryString}` : ''}`;
  
  return await apiRequest(endpoint, {
    method: 'GET',
  });
};

/**
 * Get course by ID
 * @param {string} id - Course ID
 */
export const getCourseById = async (id) => {
  return await apiRequest(`/courses/list/${id}`, {
    method: 'GET',
  });
};

/**
 * Get course with full structure (chapters, lessons)
 * @param {string} id - Course ID
 */
export const getCourseWithStructure = async (id) => {
  return await apiRequest(`/courses/structure/${id}`, {
    method: 'GET',
  });
};

/**
 * Create new course
 * @param {Object} courseData - Course data (can be FormData or plain object)
 */
export const createCourse = async (courseData) => {
  const isFormData = courseData instanceof FormData;
  
  return await apiRequest('/courses/create', {
    method: 'POST',
    body: isFormData ? courseData : JSON.stringify(courseData),
    headers: isFormData ? {} : { 'Content-Type': 'application/json' },
  }, isFormData); // Pass skipJsonParsing flag for FormData
};

/**
 * Update course
 * @param {string} id - Course ID
 * @param {Object} courseData - Updated course data (can be FormData or plain object)
 */
export const updateCourse = async (id, courseData) => {
  const isFormData = courseData instanceof FormData;
  
  return await apiRequest(`/courses/update/${id}`, {
    method: 'PUT',
    body: isFormData ? courseData : JSON.stringify(courseData),
    headers: isFormData ? {} : { 'Content-Type': 'application/json' },
  }, isFormData); // Pass skipJsonParsing flag for FormData
};

/**
 * Delete course
 * @param {string} id - Course ID
 */
export const deleteCourse = async (id) => {
  return await apiRequest(`/courses/delete/${id}`, {
    method: 'DELETE',
  });
};

/**
 * Get course statistics
 */
export const getCourseStats = async () => {
  return await apiRequest('/courses/stats', {
    method: 'GET',
  });
};

/**
 * Search courses
 * @param {string} query - Search query
 */
export const searchCourses = async (query) => {
  return await apiRequest(`/courses/search?q=${encodeURIComponent(query)}`, {
    method: 'GET',
  });
};

/**
 * Get featured courses
 */
export const getFeaturedCourses = async () => {
  return await apiRequest('/courses/featured', {
    method: 'GET',
  });
};

/**
 * Get courses by category
 * @param {string} categoryId - Category ID
 */
export const getCoursesByCategory = async (categoryId) => {
  return await apiRequest(`/courses/category/${categoryId}`, {
    method: 'GET',
  });
};

/**
 * Get courses by instructor
 * @param {string} instructorId - Instructor ID
 */
export const getCoursesByInstructor = async (instructorId) => {
  return await apiRequest(`/courses/instructor/${instructorId}`, {
    method: 'GET',
  });
};

