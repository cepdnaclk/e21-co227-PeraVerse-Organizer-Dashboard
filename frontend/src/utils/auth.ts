// Authentication utility functions

export interface AuthUser {
  email: string;
  organizer_ID?: string;
}

export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

export const getAuthUser = (): AuthUser | null => {
  const userStr = localStorage.getItem('authUser');
  return userStr ? JSON.parse(userStr) : null;
};

export const getOrganizerId = (): string | null => {
  return localStorage.getItem('organizer_ID');
};

export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  const user = getAuthUser();
  return !!(token && user);
};

export const logout = (): void => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('authUser');
  localStorage.removeItem('organizer_ID');
  // Use setTimeout to prevent immediate redirect during component updates
  setTimeout(() => {
    window.location.href = '/login';
  }, 100);
};

export const createAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Utility to handle API requests with authentication
export const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const headers = createAuthHeaders();
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers
      }
    });

    // Handle token expiration
    if (response.status === 401) {
      // Don't immediately redirect, just clear auth and throw error
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      localStorage.removeItem('organizer_ID');
      throw new Error('Session expired. Please login again.');
    }

    return response;
  } catch (error) {
    // If it's a network error or auth error, handle gracefully
    if (error instanceof Error && error.message.includes('Session expired')) {
      // Schedule redirect after current execution completes
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    }
    throw error;
  }
};