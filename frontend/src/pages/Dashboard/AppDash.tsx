// AppDash.tsx
// Main app component that handles authentication flow and routing between pages

import { useEffect, useState } from "react";
import OrganizerDashBoard from "./OrganizerDashBoard";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";

function App() {
  // Track if the user is logged in
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Track if the user wants to see the registration page
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    // Check if user info is stored in localStorage (auto-login)
    const storedUser = localStorage.getItem("authUser");
    if (storedUser) {
      setIsAuthenticated(true);
    }
  }, []);

  // Called when user successfully logs in
  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  // Called when user logs out
  const handleLogout = () => {
    localStorage.removeItem("authUser"); // clear user data
    setIsAuthenticated(false);
  };

  // Switch to registration page
  const handleGoToRegister = () => {
    setShowRegister(true);
  };

  // Switch back to login page
  const handleGoToLogin = () => {
    setShowRegister(false);
  };

  // Called after successful registration
  const handleRegister = () => {
    // Go to login page after registering
    setShowRegister(false);
  };

  return (
    <>
      {isAuthenticated ? (
        // Show organizer dashboard if logged in
        <OrganizerDashBoard onLogout={handleLogout} />
      ) : showRegister ? (
        // Show registration page if requested
        <RegisterPage onRegister={handleRegister} goToLogin={handleGoToLogin} />
      ) : (
        // Otherwise, show login page
        <LoginPage onLogin={handleLogin} goToRegister={handleGoToRegister} />
      )}
    </>
  );
}

export default App;
// End of AppDash.tsx
