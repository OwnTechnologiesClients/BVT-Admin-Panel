// Student API module
import { apiRequest } from '../api';

/**
 * Get all students with pagination and filters
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 10)
 * @param {string} params.search - Search term
 * @param {string} params.rank - Filter by rank
 * @param {string} params.branch - Filter by branch
 */
export const getAllStudents = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.search) queryParams.append('search', params.search);
  if (params.rank) queryParams.append('rank', params.rank);
  if (params.branch) queryParams.append('branch', params.branch);

  const queryString = queryParams.toString();
  const endpoint = `/students/list${queryString ? `?${queryString}` : ''}`;
  
  return await apiRequest(endpoint, {
    method: 'GET',
  });
};

/**
 * Get student by ID (Admin/Instructor endpoint)
 * @param {string} id - Student ID
 */
export const getStudentById = async (id) => {
  return await apiRequest(`/students/list/${id}`, {
    method: 'GET',
  });
};

/**
 * Create new student
 * @param {Object|FormData} studentData - Student data (can be FormData for file uploads)
 */
export const createStudent = async (studentData) => {
  const isFormData = studentData instanceof FormData;
  
  return await apiRequest('/students/create', {
    method: 'POST',
    body: isFormData ? studentData : JSON.stringify(studentData),
    headers: isFormData ? {} : { 'Content-Type': 'application/json' },
  }, isFormData); // Pass skipJsonParsing flag for FormData
};

/**
 * Update student
 * @param {string} id - Student ID
 * @param {Object|FormData} studentData - Updated student data (can be FormData for file uploads)
 */
export const updateStudent = async (id, studentData) => {
  const isFormData = studentData instanceof FormData;
  
  return await apiRequest(`/students/update/${id}`, {
    method: 'PUT',
    body: isFormData ? studentData : JSON.stringify(studentData),
    headers: isFormData ? {} : { 'Content-Type': 'application/json' },
  }, isFormData); // Pass skipJsonParsing flag for FormData
};

/**
 * Delete student
 * @param {string} id - Student ID
 */
export const deleteStudent = async (id) => {
  return await apiRequest(`/students/delete/${id}`, {
    method: 'DELETE',
  });
};

/**
 * Get student's enrolled courses
 * @param {string} studentId - Student ID
 */
export const getStudentCourses = async (studentId) => {
  return await apiRequest(`/students/${studentId}/courses`, {
    method: 'GET',
  });
};

/**
 * Get student's course progress
 * @param {string} studentId - Student ID
 * @param {string} courseSlug - Course slug (instead of ID for security)
 */
export const getStudentCourseProgress = async (studentId, courseSlug) => {
  return await apiRequest(`/students/${studentId}/courses/${courseSlug}`, {
    method: 'GET',
  });
};

