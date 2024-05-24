import { useState, useEffect } from "react";
import axios from "axios";
import './Login.css';
import { Link } from "react-router-dom";
import User from "../../UserModel";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [allowedUsernames, setAllowedUsernames] = useState<string[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://10.0.0.55:8000/users');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        const usernames = data.map((user: User) => user.username);
        setAllowedUsernames(usernames);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setUsername(input);

    if (input) {
      const filtered = allowedUsernames.filter(allowedUsername =>
        allowedUsername.toLowerCase().startsWith(input.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions(allowedUsernames);
    }
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setUsername(suggestion);
    setPassword("password");  // Autofill the password field
    setShowSuggestions(false);
  };

  const handleLogin = async () => {
    // Check if entered credentials are allowed
    const isValid = allowedUsernames.includes(username) && password === "password";

    if (!isValid) {
      setError("Invalid username or password");
      return;
    }

    try {
      const response = await axios.get("http://10.0.0.55:8000/login", {
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
      <div className="login-top-text">React, TypeScript, FastAPI, Python, and MySQL are used in a Twitter clone to create a comprehensive web application that combines frontend and backend technologies. Complete with features like interactions, tweet management, and user authentication.
      </div>
      <div className="login-top-text-2">
      The Twitter clone's security and dependability are increased by input constraints, which protect against abuse and guarantee data integrity.
      </div>
      <div className="login-logo">
        X
      </div>
      <div className="login-form">
        <h2>Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={handleUsernameChange}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
          onFocus={() => {
            setFilteredSuggestions(username ? filteredSuggestions : allowedUsernames);
            setShowSuggestions(true);
          }}
        />
        {showSuggestions && (
          <div className="suggestions-box">
            {filteredSuggestions.length ? (
              filteredSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="suggestion-item"
                  onMouseDown={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </div>
              ))
            ) : (
              <div className="suggestion-item">No suggestions</div>
            )}
          </div>
        )}
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
