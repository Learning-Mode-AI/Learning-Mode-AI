/**
 * getUserId.js
 *
 * @description Provides a function to retrieve the current user ID and email.
 * For demonstration purposes, this function returns default values.
 * Adjust the logic as needed based on your authentication implementation.
 */

/**
 * Retrieves the user's ID and email.
 *
 * @param {function} callback - A callback that receives (userId, userEmail).
 */
export function getUserId(callback) {
    // In a real-world scenario, retrieve these values from your auth system,
    // a background script, or localStorage.
    const userId = window.localStorage.getItem("user_id") || "test_quiz_user";
    const userEmail = window.localStorage.getItem("user_email") || "test@example.com";
    
    // Call the callback with the retrieved (or default) values.
    callback(userId, userEmail);
  }