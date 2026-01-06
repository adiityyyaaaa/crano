// API configuration utility
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Get the full API URL for a given endpoint
 * @param endpoint - The API endpoint (e.g., '/api/auth/login')
 * @returns Full URL (e.g., 'https://crano-backend.onrender.com/api/auth/login')
 */
export const getApiUrl = (endpoint: string): string => {
    // Remove leading slash if present to avoid double slashes
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;

    // If API_BASE_URL is empty (development), return the endpoint as-is (relative path)
    if (!API_BASE_URL) {
        return `/${cleanEndpoint}`;
    }

    // Return full URL for production
    return `${API_BASE_URL}/${cleanEndpoint}`;
};

/**
 * Fetch wrapper that automatically prepends API base URL
 */
export const apiFetch = (endpoint: string, options?: RequestInit): Promise<Response> => {
    return fetch(getApiUrl(endpoint), options);
};

export default {
    getApiUrl,
    apiFetch,
    baseUrl: API_BASE_URL
};
