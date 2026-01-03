// User API module
import { apiRequest } from '../api';

/**
 * Get all users with pagination, search, and filters
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 10)
 * @param {string} params.search - Search query
 * @param {string} params.status - Filter by status (0 or 1)
 * @param {string} params.role - Filter by role ('admin' or 'instructor')
 * @param {string} params.sort_column - Sort column (default: 'createdAt')
 * @param {string} params.sort_direction - Sort direction 'asc' or 'desc' (default: 'asc')
 */
export const getAllUsers = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.search) queryParams.append('search', params.search);
  if (params.status !== undefined) queryParams.append('status', params.status);
  if (params.role) queryParams.append('role', params.role);
  if (params.sort_column) queryParams.append('sort_column', params.sort_column);
  if (params.sort_direction) queryParams.append('sort_direction', params.sort_direction);

  const queryString = queryParams.toString();
  const endpoint = `/users/list${queryString ? `?${queryString}` : ''}`;
  
  return await apiRequest(endpoint, {
    method: 'GET',
  });
};

/**
 * Get user by ID
 * @param {string} id - User ID
 */
export const getUserById = async (id) => {
  return await apiRequest(`/users/list/${id}`, {
    method: 'GET',
  });
};

/**
 * Create new user
 * @param {Object} userData - User data (can be FormData or plain object)
 */
export const createUser = async (userData) => {
  const isFormData = userData instanceof FormData;
  
  return await apiRequest('/users/create', {
    method: 'POST',
    body: isFormData ? userData : JSON.stringify(userData),
    headers: isFormData ? {} : { 'Content-Type': 'application/json' },
  }, isFormData); // Pass skipJsonParsing flag for FormData
};

/**
 * Update user
 * @param {string} id - User ID
 * @param {Object} userData - Updated user data (can be FormData or plain object)
 */
export const updateUser = async (id, userData) => {
  const isFormData = userData instanceof FormData;
  
  return await apiRequest(`/users/update/${id}`, {
    method: 'PUT',
    body: isFormData ? userData : JSON.stringify(userData),
    headers: isFormData ? {} : { 'Content-Type': 'application/json' },
  }, isFormData); // Pass skipJsonParsing flag for FormData
};

/**
 * Delete user
 * @param {string} id - User ID
 */
export const deleteUser = async (id) => {
  return await apiRequest(`/users/delete/${id}`, {
    method: 'DELETE',
  });
};

/**
 * Update user status
 * @param {string} id - User ID
 * @param {number} status - Status (0 or 1)
 */
export const updateUserStatus = async (id, status) => {
  return await apiRequest(`/users/status/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
};

/**
 * Search users
 * @param {string} query - Search query
 */
export const searchUsers = async (query) => {
  return await apiRequest(`/users/search?q=${encodeURIComponent(query)}`, {
    method: 'GET',
  });
};

/**
 * Get user statistics
 */
export const getUserStats = async () => {
  return await apiRequest('/users/stats', {
    method: 'GET',
  });
};

