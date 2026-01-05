/**
 * URL Helper Functions for S3 Integration
 * Handles both S3 URLs (full URLs) and local file paths
 */

/**
 * Get file URL - handles both S3 URLs and local paths
 * @param {string} filePath - S3 URL or local file path
 * @returns {string} Full URL
 */
export const getFileUrl = (filePath) => {
  if (!filePath) return null;
  
  // If it's already a full URL (S3 or other), return as is
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }
  
  // If it's a data URL (base64), return as is
  if (filePath.startsWith('data:')) {
    return filePath;
  }
  
  // If it's an S3 key (starts with images/, videos/, documents/, etc.)
  // This shouldn't happen if backend is working correctly, but handle it anyway
  if (filePath.startsWith('images/') || 
      filePath.startsWith('videos/') || 
      filePath.startsWith('documents/') ||
      filePath.startsWith('uploads/') ||
      filePath.startsWith('others/')) {
    // Backend should have converted this to full URL, but if not, construct it
    const bucketName = process.env.NEXT_PUBLIC_S3_BUCKET_NAME;
    const region = process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1';
    const cloudFrontUrl = process.env.NEXT_PUBLIC_CLOUDFRONT_URL;
    
    if (bucketName) {
      if (cloudFrontUrl) {
        return `${cloudFrontUrl}/${filePath}`;
      } else {
        return `https://${bucketName}.s3.${region}.amazonaws.com/${filePath}`;
      }
    }
  }
  
  // Otherwise, it's a local file path - construct URL using API base URL
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
  return `${apiBaseUrl}${filePath.startsWith('/') ? filePath : '/' + filePath}`;
};

/**
 * Get image URL - same as getFileUrl but with fallback
 * @param {string} imagePath - S3 URL or local file path
 * @param {string} fallback - Fallback image URL
 * @returns {string} Full URL
 */
export const getImageUrl = (imagePath, fallback = null) => {
  const url = getFileUrl(imagePath);
  return url || fallback;
};

