import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../styles/LoginPage.css";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user"); // default role
  const [showNote, setShowNote] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const res = await axios.post("http://localhost:5000/api/auth/login", {
      email,
      password,
    });

    localStorage.setItem("token", res.data.token);

    const userRole = res.data.role; // ✅ backend role

    if (userRole === "user") {
      navigate("/user");      // redirect to user dashboard
    } else if (userRole === "employee") {
      navigate("/employee");  // redirect to employee dashboard
    } else {
      alert("Invalid role");
    }
  } catch (err) {
    alert(err.response?.data?.error || "Login failed");
  }
};

  return (
    <div className="login-page">
    <div className="login-container">
      <div className="info-wrapper">
  <div className="info-icon" onClick={() => setShowNote(!showNote)}>?</div>
  {showNote && (
    <div className="info-popup">
      Login occurs as per registration email. Ordinary citizens will be redirected to their dashboard and the officials to theirs directly. Enjoy surfing through the information!
    </div>
  )}
</div>


      <h2>User / Official Login</h2>
      <form onSubmit={handleLogin} className="login-form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

       

        <button type="submit">Login</button>
      </form>

      {/* Register link only for users */}
      <div className="register-link">
        <p>Don't have an account?</p>
        <Link to="/register">Register as a User</Link>
      </div>
    </div>
    </div>
  );
}

export default LoginPage;
