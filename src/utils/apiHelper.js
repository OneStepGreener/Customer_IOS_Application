/**
 * API Helper Utility
 * Provides fetch with extended timeout for slow network connections
 */

// Default timeout for API calls (60 seconds)
const DEFAULT_TIMEOUT = 60000; // 60 seconds

/**
 * Fetch with timeout wrapper
 * @param {string} url - API endpoint URL
 * @param {object} options - Fetch options (method, headers, body, etc.)
 * @param {number} timeout - Timeout in milliseconds (default: 60 seconds)
 * @returns {Promise} - Fetch promise with timeout
 */
export const fetchWithTimeout = async (url, options = {}, timeout = DEFAULT_TIMEOUT) => {
  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout / 1000} seconds`);
    }
    throw error;
  }
};

/**
 * Fetch with timeout and JSON parsing
 * @param {string} url - API endpoint URL
 * @param {object} options - Fetch options
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<object>} - Parsed JSON response
 */
export const fetchJSON = async (url, options = {}, timeout = DEFAULT_TIMEOUT) => {
  const response = await fetchWithTimeout(url, options, timeout);
  const data = await response.json();
  return { response, data };
};

// Export default timeout value for reference
export { DEFAULT_TIMEOUT };

