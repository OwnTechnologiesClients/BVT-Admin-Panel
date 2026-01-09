// API service utility for backend communication
import axios from 'axios';

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

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Don't set Content-Type for FormData (browser will set it with boundary)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Handle network errors
    if (!error.response) {
      throw new Error(
        `Network error: Unable to connect to backend server at ${API_BASE_URL}. ` +
        `Please ensure:\n` +
        `1. The backend server is running\n` +
        `2. The API URL is correct (currently: ${API_BASE_URL})\n` +
        `3. CORS is properly configured on the backend`
      );
    }

    const response = error.response;
    const data = response.data || {};
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
);

// Base axios function with error handling (maintains backward compatibility)
const apiRequest = async (endpoint, options = {}, skipJsonParsing = false) => {
  try {
    const method = options.method || 'GET';
    const config = {
      method: method,
      url: endpoint,
      ...options,
    };

    // Handle body - convert to data for axios
    if (options.body) {
      if (options.body instanceof FormData) {
        config.data = options.body;
      } else if (typeof options.body === 'string') {
        // If body is already a string, parse it if it's JSON, otherwise use as-is
        try {
          config.data = JSON.parse(options.body);
        } catch {
          config.data = options.body;
        }
      } else {
        config.data = options.body;
      }
      delete config.body;
    }

    // Remove method from config as it's already set
    delete config.method;

    const response = await axiosInstance.request(config);
    
    // If skipJsonParsing, return as-is (axios already parses JSON by default)
    if (skipJsonParsing) {
      return response;
    }

    return response;
  } catch (error) {
    // Re-throw error (interceptor already handles formatting)
    throw error;
  }
};

// Auth API methods
export const authAPI = {
  login: async (email, password) => {
    const response = await axiosInstance.post('/auth/login', { email, password });
    
    if (response.success && response.data) {
      setToken(response.data.token);
      setUser(response.data.user);
      return response;
    }
    throw new Error(response.message || 'Login failed');
  },

  logout: async () => {
    try {
      await axiosInstance.post('/auth/logout');
    } catch (error) {
      // Even if logout fails on server, clear local storage
      console.error('Logout error:', error);
    } finally {
      removeToken();
    }
  },

  getProfile: async () => {
    return await axiosInstance.get('/auth/profile');
  },
};

// Export token management functions
export { getToken, setToken, removeToken, getUser, setUser, apiRequest };

