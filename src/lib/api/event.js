// Event API module
import { apiRequest } from '../api';

/**
 * Get all events with pagination and filters
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 10)
 * @param {string} params.search - Search term
 * @param {string} params.type - Filter by event type
 * @param {string} params.status - Filter by status
 * @param {string} params.category - Filter by category ID
 */
export const getAllEvents = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.search) queryParams.append('search', params.search);
  if (params.type) queryParams.append('type', params.type);
  if (params.status) queryParams.append('status', params.status);
  if (params.category) queryParams.append('category', params.category);

  const queryString = queryParams.toString();
  const endpoint = `/events/list${queryString ? `?${queryString}` : ''}`;
  
  return await apiRequest(endpoint, {
    method: 'GET',
  });
};

/**
 * Get event by ID
 * @param {string} id - Event ID
 * @param {boolean} populateNames - If true, returns populated category and eventType names (for details view)
 */
export const getEventById = async (id, populateNames = false) => {
  const queryParams = new URLSearchParams();
  if (populateNames) {
    queryParams.append('populate', 'true');
  }
  const queryString = queryParams.toString();
  const endpoint = `/events/list/${id}${queryString ? `?${queryString}` : ''}`;
  
  return await apiRequest(endpoint, {
    method: 'GET',
  });
};

/**
 * Create new event
 * @param {Object|FormData} eventData - Event data (can be FormData for file uploads)
 */
export const createEvent = async (eventData) => {
  const isFormData = eventData instanceof FormData;
  
  return await apiRequest('/events/create', {
    method: 'POST',
    body: isFormData ? eventData : JSON.stringify(eventData),
    headers: isFormData ? {} : { 'Content-Type': 'application/json' },
  }, isFormData); // Pass skipJsonParsing flag for FormData
};

/**
 * Update event
 * @param {string} id - Event ID
 * @param {Object|FormData} eventData - Updated event data (can be FormData for file uploads)
 */
export const updateEvent = async (id, eventData) => {
  const isFormData = eventData instanceof FormData;
  
  return await apiRequest(`/events/update/${id}`, {
    method: 'PUT',
    body: isFormData ? eventData : JSON.stringify(eventData),
    headers: isFormData ? {} : { 'Content-Type': 'application/json' },
  }, isFormData); // Pass skipJsonParsing flag for FormData
};

/**
 * Delete event
 * @param {string} id - Event ID
 */
export const deleteEvent = async (id) => {
  return await apiRequest(`/events/delete/${id}`, {
    method: 'DELETE',
  });
};

/**
 * Get event statistics
 */
export const getEventStats = async () => {
  return await apiRequest('/events/stats', {
    method: 'GET',
  });
};

/**
 * Search events
 * @param {string} query - Search query
 */
export const searchEvents = async (query) => {
  return await apiRequest(`/events/search?q=${encodeURIComponent(query)}`, {
    method: 'GET',
  });
};

/**
 * Get upcoming events
 * @param {number} limit - Number of events to return
 */
export const getUpcomingEvents = async (limit = 10) => {
  return await apiRequest(`/events/upcoming?limit=${limit}`, {
    method: 'GET',
  });
};

/**
 * Get events by category
 * @param {string} categoryId - Category ID
 */
export const getEventsByCategory = async (categoryId) => {
  return await apiRequest(`/events/category/${categoryId}`, {
    method: 'GET',
  });
};

/**
 * Get event attendees/registrations
 * @param {string} id - Event ID
 */
export const getEventAttendees = async (id) => {
  return await apiRequest(`/events/attendees/${id}`, {
    method: 'GET',
  });
};

