// Inquiry API module for admin panel
import { apiRequest } from '../api';

/**
 * Get all inquiries with filters and pagination
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 10)
 * @param {string} params.search - Search query
 * @param {string} params.status - Filter by status (new, in-progress, resolved, closed)
 * @param {string} params.inquiryType - Filter by inquiry type
 * @param {string} params.sort_column - Sort column (default: createdAt)
 * @param {string} params.sort_direction - Sort direction (asc/desc, default: desc)
 */
export const getAllInquiries = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.search) queryParams.append('search', params.search);
  if (params.status) queryParams.append('status', params.status);
  if (params.inquiryType) queryParams.append('inquiryType', params.inquiryType);
  if (params.sort_column) queryParams.append('sort_column', params.sort_column);
  if (params.sort_direction) queryParams.append('sort_direction', params.sort_direction);

  const queryString = queryParams.toString();
  const endpoint = `/inquiries/list${queryString ? `?${queryString}` : ''}`;
  
  return await apiRequest(endpoint, {
    method: 'GET',
  });
};

/**
 * Get inquiry by ID
 * @param {string} id - Inquiry ID
 */
export const getInquiryById = async (id) => {
  return await apiRequest(`/inquiries/list/${id}`, {
    method: 'GET',
  });
};

/**
 * Update inquiry status
 * @param {string} id - Inquiry ID
 * @param {string} status - New status (new, in-progress, resolved, closed)
 */
export const updateInquiryStatus = async (id, status) => {
  return await apiRequest(`/inquiries/update-status/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
};

/**
 * Update inquiry (full update)
 * @param {string} id - Inquiry ID
 * @param {Object} updateData - Update data
 */
export const updateInquiry = async (id, updateData) => {
  return await apiRequest(`/inquiries/update/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updateData),
  });
};

/**
 * Delete inquiry
 * @param {string} id - Inquiry ID
 */
export const deleteInquiry = async (id) => {
  return await apiRequest(`/inquiries/delete/${id}`, {
    method: 'DELETE',
  });
};

/**
 * Get inquiry statistics
 */
export const getInquiryStats = async () => {
  return await apiRequest('/inquiries/stats', {
    method: 'GET',
  });
};

