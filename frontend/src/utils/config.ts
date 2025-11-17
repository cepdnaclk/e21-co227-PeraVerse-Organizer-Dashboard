/**
 * Application configuration settings
 * Edit these values to change behavior without modifying code
 */
export const AppConfig = {
  /**
   * Session timeout configuration
   */
  session: {
    /**
     * Session timeout in seconds
     * Examples:
     * - 15 (15 seconds - for demo/testing)
     * - 300 (5 minutes)
     * - 600 (10 minutes)
     * - 900 (15 minutes)
     * - 1800 (30 minutes)
     */
    timeoutSeconds: 10000,
    
    /**
     * Whether to show warning before logout
     */
    showWarning: true,
    
    /**
     * Warning message to display
     */
    warningMessage: "Are You Still There? Your session will expire soon due to inactivity.",
  }
};