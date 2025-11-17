import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios"; // Import axios for HTTP requests
import "./LoginPage.css"; // Ensure your CSS is correct

interface LoginPageProps {
  onLogin: () => void;  // This will be called when the user logs in successfully
  goToRegister: () => void;  // This will be used for navigation to the Register page
}



export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, goToRegister }) => {
  const [email,setEmail] = useState("");  // Email state
  const [password, setPassword] = useState("");  // Password state
  const [loading, setLoading] = useState(false);  // Loading state for the button
  const [errorMessage, setErrorMessage] = useState("");  // Error message state 
  const navigate = useNavigate();


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();  // Prevent form submission from reloading the page
    setLoading(true);  // Show loading state when trying to log in
    setErrorMessage("");  // Clear previous error messages

    // Make POST request to login endpoint
    try {
      const response = await axios.post("http://localhost:5000/auths/login", {
        email,
        password,
      });

      console.log("Status received:", response.status);

      const token = response.data.token;

      const payloadBase64 = token.split('.')[1]; // get the payload part
      const payloadJson = atob(payloadBase64);  // decode from Base64
      const payload = JSON.parse(payloadJson);  // convert JSON string to object

      const organizerId = payload.id;
      localStorage.setItem("organizerId", organizerId);


      if (response.status === 200) {
        // On successful login, store the JWT token in localStorage
        localStorage.setItem("authToken", response.data.token);
        console.log("JWT Token received from backend:", response.data.token);

        localStorage.setItem("authUser", JSON.stringify({ email }));

        // Notify the parent component that login was successful
        // This will trigger the conditional rendering in AppDash.tsx
        onLogin();


        // Also navigate to the dashboard overview route
        // (Using an absolute path to avoid path stacking)
        navigate('/dashboard/overview');
        console.log("Navigated to /dashboard/overview");

      }
    } catch (err: any) {
      setLoading(false);  // Reset loading state after response
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 400) {
          setErrorMessage("Email and Password are required.");
        } else if (err.response?.status === 401) {
          setErrorMessage("Invalid email or password.");
        } else {
          setErrorMessage("An error occurred, please try again later.");
        }
      } else {
        setErrorMessage("An error occurred, please try again later.");
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Login</h2>
        <p className="login-subtitle">Welcome back! Please login to continue.</p>

        {/* Display error message if any */}
        {errorMessage && <div className="error-message">{errorMessage}</div>}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className={`login-button ${loading ? "loading" : ""}`}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
          
          {/* Forgot Password Link */}
          <div className="forgot-password">
            <button 
              type="button" 
              className="forgot-password-link"
              onClick={() => alert("Password reset functionality will be implemented soon!")}
            >
              Forgot Password?
            </button>
          </div>
        </form>

        {/* Register Button */}
        <div className="register-section">
          <p>Don't have an account?</p>
          <button
            className="register-button"
            onClick={goToRegister} // This triggers the goToRegister function passed from the parent component
            type="button"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
