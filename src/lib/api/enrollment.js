// Enrollment API module
import { apiRequest } from '../api';

/**
 * Create enrollment (enroll student in course)
 * @param {Object} enrollmentData - Enrollment data
 * @param {string} enrollmentData.studentId - Student ID
 * @param {string} enrollmentData.courseId - Course ID
 * @param {string} enrollmentData.status - Enrollment status (default: 'active')
 * @param {string} enrollmentData.notes - Optional notes
 */
export const createEnrollment = async (enrollmentData) => {
  return await apiRequest('/enrollments', {
    method: 'POST',
    body: JSON.stringify(enrollmentData),
    headers: { 'Content-Type': 'application/json' },
  });
};

/**
 * Get all enrollments with filters
 * @param {Object} params - Query parameters
 * @param {string} params.studentId - Filter by student ID
 * @param {string} params.courseId - Filter by course ID
 * @param {string} params.status - Filter by status
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 */
export const getAllEnrollments = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.studentId) queryParams.append('studentId', params.studentId);
  if (params.courseId) queryParams.append('courseId', params.courseId);
  if (params.status) queryParams.append('status', params.status);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);

  const queryString = queryParams.toString();
  const endpoint = `/enrollments${queryString ? `?${queryString}` : ''}`;
  
  return await apiRequest(endpoint, {
    method: 'GET',
  });
};

/**
 * Get student's enrollments
 * @param {string} studentId - Student ID
 */
export const getStudentEnrollments = async (studentId) => {
  return await apiRequest(`/enrollments/student/${studentId}`, {
    method: 'GET',
  });
};

/**
 * Get course enrollments (all students in a course)
 * @param {string} courseId - Course ID
 */
export const getCourseEnrollments = async (courseId) => {
  return await apiRequest(`/enrollments/course/${courseId}`, {
    method: 'GET',
  });
};

/**
 * Get enrollment by ID
 * @param {string} id - Enrollment ID
 */
export const getEnrollmentById = async (id) => {
  return await apiRequest(`/enrollments/${id}`, {
    method: 'GET',
  });
};

/**
 * Update enrollment
 * @param {string} id - Enrollment ID
 * @param {Object} enrollmentData - Updated enrollment data
 * @param {string} enrollmentData.status - Enrollment status
 * @param {number} enrollmentData.progress - Progress percentage (0-100)
 * @param {string} enrollmentData.notes - Notes
 */
export const updateEnrollment = async (id, enrollmentData) => {
  return await apiRequest(`/enrollments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(enrollmentData),
    headers: { 'Content-Type': 'application/json' },
  });
};

/**
 * Delete enrollment (unenroll student)
 * @param {string} id - Enrollment ID
 */
export const deleteEnrollment = async (id) => {
  return await apiRequest(`/enrollments/${id}`, {
    method: 'DELETE',
  });
};

