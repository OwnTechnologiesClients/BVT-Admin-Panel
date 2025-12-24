// Password Reset API module
import { apiRequest } from '../api';

/**
 * Send forgot password OTP for admin/instructor
 * @param {string} email - User email
 */
export const sendForgotPasswordOTP = async (email) => {
  return await apiRequest('/password/user/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
};

/**
 * Verify password reset OTP for admin/instructor
 * @param {string} email - User email
 * @param {string} otp - OTP code
 */
export const verifyPasswordOTP = async (email, otp) => {
  return await apiRequest('/password/user/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  });
};

/**
 * Reset password for admin/instructor
 * @param {string} email - User email
 * @param {string} newPassword - New password
 */
export const resetPassword = async (email, newPassword) => {
  return await apiRequest('/password/user/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email, newPassword }),
  });
};

