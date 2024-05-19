// src/pages/Signup/Signup.tsx
// import { Link } from 'react-router-dom';
import { useState } from "react";
import axios from "axios";
import './Signup.css';
import { Link } from "react-router-dom";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().slice(0, 19).replace('T', ' '); // Trim milliseconds and remove 'T' separator

  const handleSignup = async () => {
    try {
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      const response = await axios.post("http://127.0.0.1:8000/signup", {
        username,
        email,
        password,
        date_joined: formattedDate,
      });

      // Optionally handle successful signup response here
      console.log("Signup successful:", response.data);
      // Redirect user to login page or perform any other action
      window.location.href = "/login";
    } catch (err) {
      setError("Error signing up");
      console.error("Signup error:", err);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-logo">
        X
      </div>
      <div className="signup-form">
        <h2>Signup</h2>
        <input
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button onClick={handleSignup}>Signup</button>
        {error && <div>{error}</div>}
        <p>Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
};

export default Signup;
