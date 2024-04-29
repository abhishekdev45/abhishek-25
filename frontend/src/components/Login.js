// Login.js
import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { url } from "../api";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Implement logic to handle login
    try {
      // Send login request to backend using Axios
      const response = await axios.post(`${url}/api/user/login`, {
        username,
        password,
      });
      const data = response.data;
      if (response.status === 200) {
        localStorage.setItem("token", data.token);
        window.location.href = "/dashboard"; // Redirect to dashboard after successful login
      } else {
        // Handle login error
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="username" className="form-label">
            Username
          </label>
          <input
            type="text"
            className="form-control"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            type="password"
            className="form-control"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Login
        </button>
      </form>
      <p className="mt-3">
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}

export default Login;
