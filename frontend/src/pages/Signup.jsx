
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import Header from "../components/Header";
import Footer from "../components/Footer";
import { loginStart, signupSuccess, authFailure } from "../redux/authSlice";
import api from "../services/api";

function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
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

    if (!formData.name.trim() || !formData.email || !formData.password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    dispatch(loginStart());
    try {
      const response = await api.post("/auth/register", {
        name: formData.name.trim(),
        email: formData.email,
        password: formData.password,
      });
      const payload = response.data?.data || response.data;
      const token = payload.token || payload.accessToken;
      const user = payload.user || payload;
      if (!token) throw new Error("Signup response did not include an authentication token.");

      dispatch(signupSuccess({ user, token }));
      navigate("/");
    } catch (requestError) {
      const message = requestError.response?.data?.message || requestError.message || "Unable to create your account. Please try again.";
      dispatch(authFailure(message));
      setError(message);
    }
  };

  return (
    <>
      <Header />

      <main className="auth-page">
        <div className="auth-card">
          <h1>Create Account</h1>
          <p>Join RYTHM and discover your sound.</p>

          <form onSubmit={handleSubmit}>
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              required
            />

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
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />

            {error && <p className="form-error">{error}</p>}

            <button type="submit" className="auth-submit-button">
              Create Account
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default Signup;
