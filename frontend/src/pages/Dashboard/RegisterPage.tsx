import React, { useState } from "react";
import axios from "axios";
import "./LoginPage.css"; //import CSS file

interface RegisterPageProps {
  onRegister: () => void; // Callback to handle successful registration
  goToLogin: () => void; // Callback to navigate to login page
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onRegister, goToLogin }) => {
  const [fname, setFname] = useState(""); // First name state
  const [lname, setLname] = useState(""); // Last name state
  const [email, setEmail] = useState(""); // Email state
  const [contactNo, setContactNo] = useState(""); // Contact number state
  const [password, setPassword] = useState(""); // Password state
  const [errorMessage, setErrorMessage] = useState(""); // Error message state
  const [loading, setLoading] = useState(false); // Loading state for form submission

  // Handle registration submission
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default(Normally, 
                        // when you submit a form in HTML, the page reloads.) form submission
    setErrorMessage(""); // Clear previous error messages
    setLoading(true); // Set loading state

    // Validate the form fields
    if (!fname || !lname || !email || !contactNo || !password) {
      setErrorMessage("Fname, Lname, Email, Contact No, and Password are required.");
      setLoading(false);
      return;
    }

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); //return if a valid email
    if (!isValidEmail) {
      setErrorMessage("Please enter a valid email address.");
      setLoading(false); // Stop loading state so the submit button becomes clickable again
      return; // Exit the function if email is invalid 
    }

    // prepare data to send to backend API for registration 
    const userData = {
      fname,
      lname,
      email,
      contact_no: contactNo,
      password,
    };

    console.log("Sending registration data:", userData); // Log the data being sent

    try {
      // Send registration request to backend
      const response = await axios.post("http://localhost:5000/auths/register", userData);

      if (response.status === 201) {
        // On success, call onRegister to navigate to login page
        onRegister();
      }
    } catch (err) {
        // Stop loading state so the submit button becomes clickable again
        setLoading(false);

        // Check if the error is an Axios error AND the server sent a response
        if (axios.isAxiosError(err) && err.response) {

          // 400 Bad Request: usually invalid input (e.g., email already exists)
          if (err.response.status === 400) {
            // Show server-provided message if available, otherwise a generic message
            setErrorMessage(err.response.data.message || "Registration failed. Try again.");

          // 500 Internal Server Error: server-side problem
          } else if (err.response.status === 500) {
            setErrorMessage("Internal server error. Please try again later.");

          // Any other HTTP status code
          } else {
            setErrorMessage("Registration failed. Please try again.");
          }

        // Error is not from Axios or there is no response (network issues, server unreachable, etc.)
        } else {
          setErrorMessage("An unexpected error occurred. Please check your network and try again.");
        }
      }
  };

  return (
    <>
      {/* The main box that covers the whole register page */}
      <div className="login-container">
        
        {/* The small card in the center that holds everything */}
        <div className="login-card">
          <h2 className="login-title">Register</h2>
          <p className="login-subtitle">Create your account to get started.</p>

          {/* If there is any error message, show it here in red */}
          {errorMessage && <div className="error-message">{errorMessage}</div>}

          {/* The main registration form */}
          <form onSubmit={handleRegister} className="login-form">

            {/* First name input box */}
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input
                type="text"
                value={fname} // shows what the user types
                onChange={(e) => setFname(e.target.value)} // saves it in the fname variable
                className="form-input"
                placeholder="Enter your first name"
                required
              />
            </div>

            {/* Last name input box */}
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input
                type="text"
                value={lname}
                onChange={(e) => setLname(e.target.value)} // saves last name
                className="form-input"
                placeholder="Enter your last name"
                required
              />
            </div>

            {/* Email input box */}
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)} // saves email
                className="form-input"
                placeholder="Enter your email"
                required
              />
            </div>

            {/* Contact number input box */}
            <div className="form-group">
              <label className="form-label">Contact Number</label>
              <input
                type="text"
                value={contactNo}
                onChange={(e) => setContactNo(e.target.value)} // saves contact number
                className="form-input"
                placeholder="Enter your contact number"
                required
              />
            </div>

            {/* Password input box */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)} // saves password
                className="form-input"
                placeholder="Enter your password"
                required
              />
            </div>

            {/* Register button */}
            {/* When clicked, it calls handleRegister function */}
            {/* If loading, the text changes to “Registering...” and button gets disabled */}
            <button
              type="submit"
              className={`login-button ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>

          {/* Button to go back to Login page */}
          {/* Calls goToLogin function when clicked */}
          <button className="switch-button" onClick={goToLogin}>
            Already have an account? Login
          </button>
        </div>
      </div>
    </>
  );

};

export default RegisterPage;
