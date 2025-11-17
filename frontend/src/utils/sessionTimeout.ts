import { AppConfig } from './config';

/**
 * Session timeout utility
 * Sets up inactivity detection and automatic logout
 * @param logoutCallback Function to call when timeout occurs
 * @param timeoutSeconds Optional override for timeout in seconds
 */
export const setupSessionTimeout = (logoutCallback: () => void, timeoutSeconds?: number) => {
  // Use provided timeout or get from config
  const timeout = timeoutSeconds !== undefined ? timeoutSeconds : AppConfig.session.timeoutSeconds;
  let inactivityTimer: NodeJS.Timeout | null = null;
  const timeoutMS = timeout * 1000; // Convert to milliseconds
  
  // Function to reset the timer
  const resetTimer = () => {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      // Show warning before logging out
      if (AppConfig.session.showWarning) {
        alert(AppConfig.session.warningMessage);
      }
      // Log out after inactivity
      logoutCallback();
    }, timeoutMS);
  };
  
  // Setup event listeners for user activity
  const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
  activityEvents.forEach(event => {
    document.addEventListener(event, resetTimer, { passive: true });
  });
  
  // Initial setup
  resetTimer();
  
  // Cleanup function
  return () => {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    activityEvents.forEach(event => {
      document.removeEventListener(event, resetTimer);
    });
  };
};