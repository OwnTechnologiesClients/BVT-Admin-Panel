// SweetAlert2 utility functions for consistent alerts across the admin panel
import Swal from 'sweetalert2';

/**
 * Show success alert
 * @param {string} title - Alert title
 * @param {string} message - Alert message
 * @param {string} confirmButtonText - Confirm button text (default: "OK")
 */
export const showSuccess = (title, message, confirmButtonText = 'OK') => {
  return Swal.fire({
    icon: 'success',
    title: title || 'Success!',
    text: message,
    confirmButtonText,
    confirmButtonColor: '#10b981',
    timer: 3000,
    timerProgressBar: true,
    zIndex: 100000,
  });
};

/**
 * Show error alert
 * @param {string} title - Alert title
 * @param {string} message - Alert message
 * @param {string} confirmButtonText - Confirm button text (default: "OK")
 */
export const showError = (title, message, confirmButtonText = 'OK') => {
  return Swal.fire({
    icon: 'error',
    title: title || 'Error!',
    text: message,
    confirmButtonText,
    confirmButtonColor: '#ef4444',
    zIndex: 100000,
  });
};

/**
 * Show warning alert
 * @param {string} title - Alert title
 * @param {string} message - Alert message
 * @param {string} confirmButtonText - Confirm button text (default: "OK")
 */
export const showWarning = (title, message, confirmButtonText = 'OK') => {
  return Swal.fire({
    icon: 'warning',
    title: title || 'Warning!',
    text: message,
    confirmButtonText,
    confirmButtonColor: '#f59e0b',
    zIndex: 100000,
  });
};

/**
 * Show info alert
 * @param {string} title - Alert title
 * @param {string} message - Alert message
 * @param {string} confirmButtonText - Confirm button text (default: "OK")
 */
export const showInfo = (title, message, confirmButtonText = 'OK') => {
  return Swal.fire({
    icon: 'info',
    title: title || 'Info',
    text: message,
    confirmButtonText,
    confirmButtonColor: '#3b82f6',
    zIndex: 100000,
  });
};

/**
 * Show confirmation dialog
 * @param {string} title - Dialog title
 * @param {string} message - Dialog message
 * @param {string} confirmButtonText - Confirm button text (default: "Yes")
 * @param {string} cancelButtonText - Cancel button text (default: "Cancel")
 * @param {string} confirmButtonColor - Confirm button color (default: "#10b981")
 */
export const showConfirm = (
  title,
  message,
  confirmButtonText = 'Yes',
  cancelButtonText = 'Cancel',
  confirmButtonColor = '#10b981'
) => {
  return Swal.fire({
    icon: 'question',
    title: title || 'Are you sure?',
    text: message,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    confirmButtonColor,
    cancelButtonColor: '#6b7280',
    reverseButtons: true,
    zIndex: 100000,
  });
};

/**
 * Show delete confirmation dialog
 * @param {string} title - Item title/name to delete
 * @param {string} message - Additional message
 */
export const showDeleteConfirm = (title, message = 'This action cannot be undone!') => {
  return Swal.fire({
    icon: 'warning',
    title: 'Are you sure?',
    html: `<strong>${title}</strong><br/>${message}`,
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    reverseButtons: true,
    zIndex: 100000,
  });
};

/**
 * Show loading alert
 * @param {string} title - Loading title
 * @param {string} message - Loading message
 */
export const showLoading = (title = 'Loading...', message = 'Please wait') => {
  Swal.fire({
    title,
    text: message,
    allowOutsideClick: false,
    allowEscapeKey: false,
    allowEnterKey: false,
    zIndex: 100000,
    didOpen: () => {
      Swal.showLoading();
    },
  });
};

/**
 * Close current alert
 */
export const closeAlert = () => {
  Swal.close();
};

/**
 * Show toast notification (small, non-blocking)
 * @param {string} icon - Icon type: 'success', 'error', 'warning', 'info'
 * @param {string} title - Toast title
 * @param {number} timer - Auto-close timer in ms (default: 3000)
 */
export const showToast = (icon, title, timer = 3000) => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer,
    timerProgressBar: true,
    zIndex: 100000,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    },
  });

  return Toast.fire({
    icon,
    title,
  });
};

