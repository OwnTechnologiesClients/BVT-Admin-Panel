// Instructor API module
import { apiRequest } from '../api';

/**
 * Get all instructors with pagination, search, and filters
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 10)
 * @param {string} params.search - Search query
 * @param {string} params.department - Filter by department
 * @param {boolean} params.isActive - Filter by active status
 * @param {string} params.sort_column - Sort column (default: 'createdAt')
 * @param {string} params.sort_direction - Sort direction 'asc' or 'desc' (default: 'asc')
 */
export const getAllInstructors = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.search) queryParams.append('search', params.search);
  if (params.department) queryParams.append('department', params.department);
  if (params.isActive !== undefined) queryParams.append('isActive', params.isActive);
  if (params.sort_column) queryParams.append('sort_column', params.sort_column);
  if (params.sort_direction) queryParams.append('sort_direction', params.sort_direction);

  const queryString = queryParams.toString();
  const endpoint = `/instructors/list${queryString ? `?${queryString}` : ''}`;
  
  return await apiRequest(endpoint, {
    method: 'GET',
  });
};

/**
 * Get active instructors (public endpoint)
 */
export const getActiveInstructors = async () => {
  return await apiRequest('/instructors/active', {
    method: 'GET',
  });
};

/**
 * Get instructor by ID
 * @param {string} id - Instructor ID
 */
export const getInstructorById = async (id) => {
  return await apiRequest(`/instructors/list/${id}`, {
    method: 'GET',
  });
};

/**
 * Create new instructor
 * @param {Object} instructorData - Instructor data (can be FormData or plain object)
 */
export const createInstructor = async (instructorData) => {
  const isFormData = instructorData instanceof FormData;
  
  return await apiRequest('/instructors/create', {
    method: 'POST',
    body: isFormData ? instructorData : JSON.stringify(instructorData),
    headers: isFormData ? {} : { 'Content-Type': 'application/json' },
  }, isFormData); // Pass skipJsonParsing flag for FormData
};

/**
 * Update instructor
 * @param {string} id - Instructor ID
 * @param {Object} instructorData - Updated instructor data (can be FormData or plain object)
 */
export const updateInstructor = async (id, instructorData) => {
  const isFormData = instructorData instanceof FormData;
  
  return await apiRequest(`/instructors/update/${id}`, {
    method: 'PUT',
    body: isFormData ? instructorData : JSON.stringify(instructorData),
    headers: isFormData ? {} : { 'Content-Type': 'application/json' },
  }, isFormData); // Pass skipJsonParsing flag for FormData
};

/**
 * Delete instructor
 * @param {string} id - Instructor ID
 */
export const deleteInstructor = async (id) => {
  return await apiRequest(`/instructors/delete/${id}`, {
    method: 'DELETE',
  });
};

/**
 * Get instructor statistics
 */
export const getInstructorStats = async () => {
  return await apiRequest('/instructors/stats', {
    method: 'GET',
  });
};

/**
 * Search instructors
 * @param {string} query - Search query
 */
export const searchInstructors = async (query) => {
  return await apiRequest(`/instructors/search?q=${encodeURIComponent(query)}`, {
    method: 'GET',
  });
};

/**
 * Get instructors by department
 * @param {string} department - Department name
 * @param {boolean} isActive - Filter by active status (default: true)
 */
export const getInstructorsByDepartment = async (department, isActive = true) => {
  return await apiRequest(`/instructors/department/${department}?isActive=${isActive}`, {
    method: 'GET',
  });
};

