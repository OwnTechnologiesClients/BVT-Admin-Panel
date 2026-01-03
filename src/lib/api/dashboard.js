// Dashboard API module
import { apiRequest } from '../api';

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async () => {
  return await apiRequest('/dashboard/stats', {
    method: 'GET',
  });
};

