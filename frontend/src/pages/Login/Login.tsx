// src/pages/Login/Login.tsx
// import { Link } from 'react-router-dom';
import { useState } from "react";
import axios from "axios";
import './Login.css';
import { Link } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/login", {
        params: { username, password },
      });
      const accessToken = response.data.access_token;
      // Store accessToken in localStorage or session storage
      localStorage.setItem("token", accessToken);
      console.log("Login successful. Access Token:", accessToken);
      // Redirect user to home page
      window.location.href = "/";

    } catch (err) {
      setError("Incorrect username or password");
      console.error("Login error:", err);
    }
  };

  return (
    <div className="login-container">
         <div className="login-logo">
          X
          </div>  
          <div className="login-form">
        <h2>Login</h2>
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
      <button onClick={handleLogin}>Login</button>
      {error && <div>{error}</div>}
      <p>Don't have an account? <Link to="/signup">Signup</Link></p>
      </div> 
    </div>
  );
};

export default Login;
