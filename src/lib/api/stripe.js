import { apiRequest } from '../api';

/**
 * Get all transactions (for admin)
 * @param {Object} params - Query parameters (e.g., studentId)
 */
export const getAllTransactions = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.studentId) queryParams.append('studentId', params.studentId);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);

  const queryString = queryParams.toString();
  const endpoint = `/stripe/transactions${queryString ? `?${queryString}` : ''}`;
  
  return await apiRequest(endpoint, {
    method: 'GET',
  });
};

export const getTransactionStats = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.studentId) queryParams.append('studentId', params.studentId);
  const queryString = queryParams.toString();
  const endpoint = `/stripe/transactions/stats${queryString ? `?${queryString}` : ''}`;
  return await apiRequest(endpoint, { method: 'GET' });
};
