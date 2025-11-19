// Test API module
import { apiRequest } from '../api';

/**
 * Get all tests with pagination and filters
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 10)
 * @param {string} params.search - Search term
 * @param {string} params.courseId - Filter by course ID
 * @param {boolean} params.isActive - Filter by active status
 */
export const getAllTests = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.search) queryParams.append('search', params.search);
  if (params.courseId) queryParams.append('courseId', params.courseId);
  if (params.isActive !== undefined) queryParams.append('isActive', params.isActive);

  const queryString = queryParams.toString();
  const endpoint = `/tests/list${queryString ? `?${queryString}` : ''}`;
  
  return await apiRequest(endpoint, {
    method: 'GET',
  });
};

/**
 * Get test by ID
 * @param {string} id - Test ID
 */
export const getTestById = async (id) => {
  return await apiRequest(`/tests/list/${id}`, {
    method: 'GET',
  });
};

/**
 * Get tests by course ID
 * @param {string} courseId - Course ID
 */
export const getTestsByCourse = async (courseId) => {
  return await apiRequest(`/tests/course/${courseId}`, {
    method: 'GET',
  });
};

/**
 * Create new test
 * @param {Object|FormData} testData - Test data (can be FormData for file uploads)
 */
export const createTest = async (testData) => {
  const isFormData = testData instanceof FormData;
  
  return await apiRequest('/tests/create', {
    method: 'POST',
    body: isFormData ? testData : JSON.stringify(testData),
    headers: isFormData ? {} : { 'Content-Type': 'application/json' },
  }, isFormData); // Pass skipJsonParsing flag for FormData
};

/**
 * Update test
 * @param {string} id - Test ID
 * @param {Object|FormData} testData - Updated test data (can be FormData for file uploads)
 */
export const updateTest = async (id, testData) => {
  const isFormData = testData instanceof FormData;
  
  return await apiRequest(`/tests/update/${id}`, {
    method: 'PUT',
    body: isFormData ? testData : JSON.stringify(testData),
    headers: isFormData ? {} : { 'Content-Type': 'application/json' },
  }, isFormData); // Pass skipJsonParsing flag for FormData
};

/**
 * Delete test
 * @param {string} id - Test ID
 */
export const deleteTest = async (id) => {
  return await apiRequest(`/tests/delete/${id}`, {
    method: 'DELETE',
  });
};

/**
 * Get test statistics
 */
export const getTestStats = async () => {
  return await apiRequest('/tests/stats', {
    method: 'GET',
  });
};

/**
 * Search tests
 * @param {string} query - Search query
 */
export const searchTests = async (query) => {
  return await apiRequest(`/tests/search?q=${encodeURIComponent(query)}`, {
    method: 'GET',
  });
};

/**
 * Submit test
 * @param {string} id - Test ID
 * @param {Object} answers - Test answers
 */
export const submitTest = async (id, answers) => {
  return await apiRequest(`/tests/submit/${id}`, {
    method: 'POST',
    body: JSON.stringify(answers),
  });
};

/**
 * Get test results
 * @param {string} id - Test ID
 */
export const getTestResults = async (id) => {
  return await apiRequest(`/tests/results/${id}`, {
    method: 'GET',
  });
};

