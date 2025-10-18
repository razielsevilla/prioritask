// File: c:\Users\razie\Desktop\Prioritask_Project\frontend\src\pages\Register.jsx
import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password_confirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState("");
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== password_confirmation) {
      setError("Passwords do not match.");
      return;
    }
    try {
  await register(name, email, password, password_confirmation);
  alert("Registration successful! Please log in to continue.");
  navigate("/");
} catch (err) {
  setError("Registration failed. Try again.");
}

  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow-lg" style={{ width: "400px" }}>
        <h2 className="text-primary fw-bold text-center mb-4">Create Account</h2>
        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="form-floating mb-3">
            <input
              type="text"
              className="form-control bg-secondary text-light border-0"
              id="name"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <label htmlFor="name">Full Name</label>
          </div>
          <div className="form-floating mb-3">
            <input
              type="email"
              className="form-control bg-secondary text-light border-0"
              id="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label htmlFor="email">Email</label>
          </div>
          <div className="form-floating mb-3">
            <input
              type="password"
              className="form-control bg-secondary text-light border-0"
              id="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label htmlFor="password">Password</label>
          </div>
          <div className="form-floating mb-3">
            <input
              type="password"
              className="form-control bg-secondary text-light border-0"
              id="password_confirmation"
              placeholder="Confirm Password"
              value={password_confirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
            />
            <label htmlFor="password_confirmation">Confirm Password</label>
          </div>
          <button className="btn btn-primary w-100 py-2 fw-semibold">Register</button>
        </form>
        <p className="text-center mt-3">
          Already have an account? <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  );
}
