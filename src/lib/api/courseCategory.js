// Course Category API module
import { apiRequest } from '../api';

/**
 * Get all course categories with pagination, search, and filters
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 10)
 * @param {string} params.search - Search query
 * @param {boolean} params.isActive - Filter by active status
 * @param {string} params.sort_column - Sort column (default: 'createdAt')
 * @param {string} params.sort_direction - Sort direction 'asc' or 'desc' (default: 'asc')
 */
export const getAllCategories = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.search) queryParams.append('search', params.search);
  if (params.isActive !== undefined) queryParams.append('isActive', params.isActive);
  if (params.sort_column) queryParams.append('sort_column', params.sort_column);
  if (params.sort_direction) queryParams.append('sort_direction', params.sort_direction);

  const queryString = queryParams.toString();
  const endpoint = `/course-categories/list${queryString ? `?${queryString}` : ''}`;
  
  return await apiRequest(endpoint, {
    method: 'GET',
  });
};

/**
 * Get active categories (public endpoint)
 */
export const getActiveCategories = async () => {
  return await apiRequest('/course-categories/active', {
    method: 'GET',
  });
};

/**
 * Get category by ID
 * @param {string} id - Category ID
 */
export const getCategoryById = async (id) => {
  return await apiRequest(`/course-categories/list/${id}`, {
    method: 'GET',
  });
};

/**
 * Get category by slug
 * @param {string} slug - Category slug
 */
export const getCategoryBySlug = async (slug) => {
  return await apiRequest(`/course-categories/slug/${slug}`, {
    method: 'GET',
  });
};

/**
 * Create new category
 * @param {Object} categoryData - Category data
 */
export const createCategory = async (categoryData) => {
  return await apiRequest('/course-categories/create', {
    method: 'POST',
    body: JSON.stringify(categoryData),
  });
};

/**
 * Update category
 * @param {string} id - Category ID
 * @param {Object} categoryData - Updated category data
 */
export const updateCategory = async (id, categoryData) => {
  return await apiRequest(`/course-categories/update/${id}`, {
    method: 'PUT',
    body: JSON.stringify(categoryData),
  });
};

/**
 * Delete category
 * @param {string} id - Category ID
 */
export const deleteCategory = async (id) => {
  return await apiRequest(`/course-categories/delete/${id}`, {
    method: 'DELETE',
  });
};

/**
 * Get category statistics
 */
export const getCategoryStats = async () => {
  return await apiRequest('/course-categories/stats', {
    method: 'GET',
  });
};

/**
 * Search categories
 * @param {string} query - Search query
 */
export const searchCategories = async (query) => {
  return await apiRequest(`/course-categories/search?q=${encodeURIComponent(query)}`, {
    method: 'GET',
  });
};

