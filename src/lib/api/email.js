// Email API module
import { apiRequest } from '../api';

/**
 * Get all available email templates
 */
export const getEmailTemplates = async () => {
  return await apiRequest('/emails/templates', {
    method: 'GET',
  });
};

/**
 * Preview email template with sample data
 * @param {string} templateType - Template type
 */
export const previewEmailTemplate = async (templateType) => {
  return await apiRequest(`/emails/templates/${templateType}/preview`, {
    method: 'GET',
  });
};

/**
 * Get audience count based on targeting
 * @param {Object} params - Audience parameters
 */
export const getAudienceCount = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.type) queryParams.append('type', params.type);
  if (params.courseId) queryParams.append('courseId', params.courseId);
  if (params.eventId) queryParams.append('eventId', params.eventId);
  if (params.inactiveDays) queryParams.append('inactiveDays', params.inactiveDays);

  const queryString = queryParams.toString();
  const endpoint = `/emails/audience/count${queryString ? `?${queryString}` : ''}`;
  
  return await apiRequest(endpoint, {
    method: 'GET',
  });
};

/**
 * Create and optionally send email campaign
 * @param {Object|FormData} campaignData - Campaign data (can be FormData for file uploads)
 */
export const createCampaign = async (campaignData) => {
  const isFormData = campaignData instanceof FormData;
  
  return await apiRequest('/emails/campaigns', {
    method: 'POST',
    body: isFormData ? campaignData : JSON.stringify(campaignData),
    headers: isFormData ? {} : { 'Content-Type': 'application/json' },
  }, isFormData); // Pass skipJsonParsing flag for FormData
};

/**
 * Get all campaigns with pagination
 * @param {Object} params - Query parameters
 */
export const getCampaigns = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.status) queryParams.append('status', params.status);

  const queryString = queryParams.toString();
  const endpoint = `/emails/campaigns${queryString ? `?${queryString}` : ''}`;
  
  return await apiRequest(endpoint, {
    method: 'GET',
  });
};

/**
 * Get single campaign
 * @param {string} id - Campaign ID
 */
export const getCampaign = async (id) => {
  return await apiRequest(`/emails/campaigns/${id}`, {
    method: 'GET',
  });
};

/**
 * Send a draft campaign
 * @param {string} id - Campaign ID
 */
export const sendCampaign = async (id) => {
  return await apiRequest(`/emails/campaigns/${id}/send`, {
    method: 'POST',
  });
};

/**
 * Delete campaign
 * @param {string} id - Campaign ID
 */
export const deleteCampaign = async (id) => {
  return await apiRequest(`/emails/campaigns/${id}`, {
    method: 'DELETE',
  });
};

/**
 * Send test email
 * @param {Object} data - Test email data
 */
export const sendTestEmail = async (data) => {
  return await apiRequest('/emails/test', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  });
};

/**
 * Get email logs
 * @param {Object} params - Query parameters
 */
export const getEmailLogs = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.campaignId) queryParams.append('campaignId', params.campaignId);
  if (params.status) queryParams.append('status', params.status);

  const queryString = queryParams.toString();
  const endpoint = `/emails/logs${queryString ? `?${queryString}` : ''}`;
  
  return await apiRequest(endpoint, {
    method: 'GET',
  });
};

/**
 * Get email statistics
 */
export const getEmailStats = async () => {
  return await apiRequest('/emails/stats', {
    method: 'GET',
  });
};

