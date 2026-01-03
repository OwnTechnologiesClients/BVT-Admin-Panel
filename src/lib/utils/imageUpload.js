/**
 * Image Upload Utility
 * Handles uploading images to the server and returns the image URL
 */

import { apiRequest } from '../api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Upload an image file to the server
 * @param {File} file - The image file to upload
 * @param {string} folder - Optional folder path (e.g., 'lesson-content', 'courses')
 * @returns {Promise<string>} - The URL of the uploaded image
 */
export const uploadImage = async (file, folder = 'images') => {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Image size must be less than 5MB');
    }

    // Create FormData
    const formData = new FormData();
    formData.append('image', file);
    if (folder) {
      formData.append('folder', folder);
    }

    // Upload to server
    // Note: You'll need to create an image upload endpoint in your backend
    // For now, this is a placeholder that you can customize
    const response = await apiRequest('/upload/image', {
      method: 'POST',
      body: formData,
    }, true);

    if (response.success && response.data?.url) {
      return response.data.url;
    } else if (response.url) {
      // If response directly contains URL
      return response.url;
    } else {
      throw new Error(response.message || 'Failed to upload image');
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

/**
 * Convert image file to base64 data URL
 * Useful for immediate preview before server upload
 * @param {File} file - The image file
 * @returns {Promise<string>} - Base64 data URL
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};






