import { apiRequest } from '../api';

/**
 * Get all transactions (for admin)
 * @param {Object} params - Query parameters (e.g., studentId)
 */
export const getAllTransactions = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.studentId) queryParams.append('studentId', params.studentId);

  const queryString = queryParams.toString();
  const endpoint = `/stripe/transactions${queryString ? `?${queryString}` : ''}`;
  
  return await apiRequest(endpoint, {
    method: 'GET',
  });
};
