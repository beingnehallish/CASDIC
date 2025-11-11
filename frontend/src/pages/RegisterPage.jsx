import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../styles/LoginPage.css"; // same CSS file

function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // 👀 toggle state
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/auth/send-otp", {
        name,
        email,
        password,
      });

      alert(response.data.message || "OTP sent to your email.");
      navigate("/auth", { state: { email } });
      localStorage.setItem("pendingEmail", email.trim().toLowerCase());
    } catch (err) {
      console.error("Send OTP error:", err.response?.data || err);
      alert(err.response?.data?.error || "Failed to send OTP. Try again.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>User Registration</h2>
        <form onSubmit={handleSendOtp} className="login-form">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Password input with eye icon */}
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "❇" : "👁"}
            </span>
          </div>

          <button type="submit">Send OTP</button>
        </form>

        <div className="register-link">
          <p>Already have an account?</p>
          <Link to="/login">Login as User</Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
