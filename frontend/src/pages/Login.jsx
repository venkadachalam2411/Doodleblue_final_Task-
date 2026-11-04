
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import Header from "../components/Header";
import Footer from "../components/Footer";
import { loginStart, loginSuccess, authFailure } from "../redux/authSlice";
import api from "../services/api";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields.");
      return;
    }

    dispatch(loginStart());
    try {
      const response = await api.post("/auth/login", formData);
      const payload = response.data?.data || response.data;
      const token = payload.token || payload.accessToken;
      const user = payload.user || payload;
      if (!token) throw new Error("Login response did not include an authentication token.");

      dispatch(loginSuccess({ user, token }));
      navigate(user.role === "admin" ? "/admin" : "/");
    } catch (requestError) {
      const message = requestError.response?.data?.message || requestError.message || "Unable to log in. Please try again.";
      dispatch(authFailure(message));
      setError(message);
    }
  };

  return (
    <>
      <Header />

      <main className="auth-page">
        <div className="auth-card">
          <h1>Welcome Back</h1>
          <p>Login to your RYTHM account.</p>

          <form onSubmit={handleSubmit}>
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            {error && <p className="form-error">{error}</p>}

            <button type="submit" className="auth-submit-button">
              Login
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </p>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default Login;
