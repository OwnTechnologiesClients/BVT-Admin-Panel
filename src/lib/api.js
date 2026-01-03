// API service utility for backend communication

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Log API URL in development for debugging
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('API Base URL:', API_BASE_URL);
}

// Helper function to get auth token from localStorage
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Helper function to set auth token in localStorage
const setToken = (token) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
};

// Helper function to remove auth token from localStorage
const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// Helper function to get user from localStorage
const getUser = () => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
  return null;
};

// Helper function to set user in localStorage
const setUser = (user) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user));
  }
};

// Base fetch function with error handling
const apiRequest = async (endpoint, options = {}, skipJsonParsing = false) => {
  const token = getToken();
  const isFormData = options.body instanceof FormData;
  
  const config = {
    ...options,
    headers: {
      // Don't set Content-Type for FormData (browser will set it with boundary)
      ...(!isFormData && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, config);

    // Handle network errors (no response from server)
    if (!response) {
      throw new Error(`Unable to connect to server. Please ensure the backend is running at ${API_BASE_URL}`);
    }

    // Try to parse JSON, but handle cases where response might not be JSON
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else if (skipJsonParsing) {
      // If skipJsonParsing is true, return response as-is
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }
    } else {
      const text = await response.text();
      throw new Error(`Server returned non-JSON response: ${text}`);
    }

    if (!response.ok) {
      const errorMessage = data.message || `Server error: ${response.status} ${response.statusText}`;
      
      // Check for authentication/authorization errors
      const isAuthError = 
        response.status === 401 || // Unauthorized
        response.status === 403 || // Forbidden
        errorMessage.toLowerCase().includes('access denied') ||
        errorMessage.toLowerCase().includes('required role') ||
        errorMessage.toLowerCase().includes('invalid token') ||
        errorMessage.toLowerCase().includes('token expired') ||
        errorMessage.toLowerCase().includes('no token provided') ||
        errorMessage.toLowerCase().includes('please login');
      
      if (isAuthError) {
        removeToken();
        // Redirect to login if we're not already there
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
      
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    // Handle network errors (fetch failed)
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(
        `Network error: Unable to connect to backend server at ${API_BASE_URL}. ` +
        `Please ensure:\n` +
        `1. The backend server is running\n` +
        `2. The API URL is correct (currently: ${API_BASE_URL})\n` +
        `3. CORS is properly configured on the backend`
      );
    }
    // Re-throw other errors
    throw error;
  }
};

// Auth API methods
export const authAPI = {
  login: async (email, password) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.success && response.data) {
      setToken(response.data.token);
      setUser(response.data.user);
      return response;
    }
    throw new Error(response.message || 'Login failed');
  },

  logout: async () => {
    try {
      await apiRequest('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      // Even if logout fails on server, clear local storage
      console.error('Logout error:', error);
    } finally {
      removeToken();
    }
  },

  getProfile: async () => {
    return await apiRequest('/auth/profile', {
      method: 'GET',
    });
  },
};

// Export token management functions
export { getToken, setToken, removeToken, getUser, setUser, apiRequest };

