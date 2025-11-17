import { useEffect } from 'react';
import { setupSessionTimeout } from './sessionTimeout';

// Module-level flag to avoid handling token expiration multiple times
let tokenExpirationHandled = false;


/**
 * Custom hook to check authentication status
 * This provides functions to handle token expiration and logout
 */
export function useAuthCheck(onLogout?: () => void) {
  //const navigate = useNavigate();
  
  // Function to handle token expiration - just notifies user without logging out
  const handleTokenExpiration = () => {
    // Prevent duplicate handling (multiple API calls causing repeated 401s)
    if (tokenExpirationHandled) return false;
    tokenExpirationHandled = true;
    // Alert the user that their token is expired
    alert("Your backend session (JWT Token) has expired. Please log in again when ready.");
    // Perform a full logout so app state is cleared and the login page is shown
    handleLogout();
    return false;
  };
  
  // Function to handle logout
  const handleLogout = () => {
    // Mark as handled to avoid re-entrancy from concurrent calls
    tokenExpirationHandled = true;
    // Remove auth items from localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    
    // Call the provided logout function if it exists
    if (onLogout) {
      onLogout();
    }
    
    // Redirect to login page and reload the app so top-level auth state is re-evaluated
    // Use a full-page navigation to ensure components that didn't receive the
    // parent onLogout callback still return to the login screen.
    window.location.href = '/dashboard';
  };
  
  // Set up session timeout
  useEffect(() => {
    // Only set up the timeout if the user is logged in
    const token = localStorage.getItem('authToken');
    if (token) {
      // Using the timeout value from config (no need to pass it explicitly)
      const cleanup = setupSessionTimeout(handleLogout);
      return cleanup;
    }
  }, []);
  
  // Return functions so components can use them
  return { handleLogout, handleTokenExpiration };
}