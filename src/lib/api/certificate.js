import { apiRequest, getToken } from '../api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Generate a certificate PDF (returns a blob for download)
 * @param {FormData} formData - Contains studentId, courseId, completionDate, signature1, signature2, template
 */
export const generateCertificate = async (formData) => {
  const token = getToken();
  
  const response = await fetch(`${API_BASE_URL}/certificates/generate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to generate certificate');
  }

  return await response.blob();
};

/**
 * Get students eligible for certificates
 * @param {Object} params - Query parameters (e.g., courseId)
 */
export const getEligibleStudents = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.courseId) queryParams.append('courseId', params.courseId);

  const queryString = queryParams.toString();
  const endpoint = `/certificates/eligible${queryString ? `?${queryString}` : ''}`;

  return await apiRequest(endpoint, { method: 'GET' });
};

/**
 * Issue a certificate (Generates on server, saves to S3, records in DB, emails student)
 * @param {FormData} formData - Contains studentId, courseId, completionDate, signature1, positions
 */
export const issueCertificate = async (formData) => {
  const token = getToken();
  
  const response = await fetch(`${API_BASE_URL}/certificates/issue`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to issue certificate');
  }

  return await response.json();
};
