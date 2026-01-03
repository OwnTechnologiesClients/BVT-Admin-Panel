// Student Query API module
import { apiRequest } from '../api';

/**
 * Get all queries with filters and pagination
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 10)
 * @param {string} params.search - Search query
 * @param {string} params.status - Filter by status (open, resolved, closed)
 * @param {string} params.courseId - Filter by course ID
 * @param {string} params.studentId - Filter by student ID
 */
export const getAllQueries = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.search) queryParams.append('search', params.search);
  if (params.status) queryParams.append('status', params.status);
  if (params.courseId) queryParams.append('courseId', params.courseId);
  if (params.studentId) queryParams.append('studentId', params.studentId);

  const queryString = queryParams.toString();
  const endpoint = `/queries${queryString ? `?${queryString}` : ''}`;
  
  return await apiRequest(endpoint, {
    method: 'GET',
  });
};

/**
 * Get query by ID
 * @param {string} id - Query ID
 */
export const getQueryById = async (id) => {
  return await apiRequest(`/queries/${id}`, {
    method: 'GET',
  });
};

/**
 * Add a message to an existing query with optional file attachments
 * @param {string} queryId - Query ID
 * @param {string} content - Message content
 * @param {File[]} attachments - Array of files to attach
 */
export const addMessage = async (queryId, content, attachments = []) => {
  const formData = new FormData();
  
  formData.append('content', content);
  
  // Append attachments
  attachments.forEach((file) => {
    formData.append('attachments', file);
  });
  
  return await apiRequest(`/queries/${queryId}/messages`, {
    method: 'POST',
    body: formData,
  }, true); // Skip JSON parsing for FormData
};

/**
 * Update query status
 * @param {string} queryId - Query ID
 * @param {string} status - New status (open, resolved, closed)
 */
export const updateQueryStatus = async (queryId, status) => {
  return await apiRequest(`/queries/${queryId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
};

/**
 * Assign query to instructor
 * @param {string} queryId - Query ID
 * @param {string} instructorId - Instructor ID
 */
export const assignQuery = async (queryId, instructorId) => {
  return await apiRequest(`/queries/${queryId}/assign`, {
    method: 'PUT',
    body: JSON.stringify({ instructorId }),
  });
};

