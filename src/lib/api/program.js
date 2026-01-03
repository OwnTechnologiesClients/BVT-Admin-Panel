// Program API module
import { apiRequest } from '../api';

/**
 * Get all programs with pagination and filters
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 10)
 * @param {string} params.search - Search term
 * @param {string} params.category - Filter by category ID
 * @param {string} params.status - Filter by status
 */
export const getAllPrograms = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.search) queryParams.append('search', params.search);
  if (params.category) queryParams.append('category', params.category);
  if (params.status) queryParams.append('status', params.status);

  const queryString = queryParams.toString();
  const endpoint = `/programs/list${queryString ? `?${queryString}` : ''}`;
  
  return await apiRequest(endpoint, {
    method: 'GET',
  });
};

/**
 * Get program by ID
 * @param {string} id - Program ID
 */
export const getProgramById = async (id) => {
  return await apiRequest(`/programs/list/${id}`, {
    method: 'GET',
  });
};

/**
 * Create new program
 * @param {Object} programData - Program data
 */
export const createProgram = async (programData) => {
  return await apiRequest('/programs/create', {
    method: 'POST',
    body: JSON.stringify(programData),
  });
};

/**
 * Update program
 * @param {string} id - Program ID
 * @param {Object} programData - Updated program data
 */
export const updateProgram = async (id, programData) => {
  return await apiRequest(`/programs/update/${id}`, {
    method: 'PUT',
    body: JSON.stringify(programData),
  });
};

/**
 * Delete program
 * @param {string} id - Program ID
 */
export const deleteProgram = async (id) => {
  return await apiRequest(`/programs/delete/${id}`, {
    method: 'DELETE',
  });
};

/**
 * Get program statistics
 */
export const getProgramStats = async () => {
  return await apiRequest('/programs/stats', {
    method: 'GET',
  });
};

/**
 * Search programs
 * @param {string} query - Search query
 */
export const searchPrograms = async (query) => {
  return await apiRequest(`/programs/search?q=${encodeURIComponent(query)}`, {
    method: 'GET',
  });
};

/**
 * Get featured programs
 * @param {number} limit - Number of programs to return
 */
export const getFeaturedPrograms = async (limit = 10) => {
  return await apiRequest(`/programs/featured?limit=${limit}`, {
    method: 'GET',
  });
};

