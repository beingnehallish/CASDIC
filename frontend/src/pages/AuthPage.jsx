import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/LoginPage.css";

function AuthPage() {
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(60);
  const [resending, setResending] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
const emailFromState = location.state?.email;
const email = emailFromState || localStorage.getItem("pendingEmail");
  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(countdown);
  }, []);

 // 1) VERIFY — always send sanitized values
const handleVerifyOtp = async (e) => {
  e.preventDefault();
  const cleanEmail = String(email || "").trim().toLowerCase();
  const cleanOtp = String(otp || "").trim().replace(/\s+/g, "");

  if (!/^\d{6}$/.test(cleanOtp)) {
    alert("Enter a valid 6-digit OTP.");
    return;
  }

  try {
    await axios.post("http://localhost:5000/api/auth/verify-otp", {
      email: cleanEmail,
      otp: cleanOtp, // keep as string
    });
    alert("OTP verified! Registration complete.");
    navigate("/login");
  } catch (err) {
    console.error(err?.response?.data || err);
    alert(err?.response?.data?.error || "Verification failed.");
  }
};

// 2) RESEND — use the correct endpoint and sanitize
const handleResendOtp = async () => {
  setResending(true);
  try {
    const cleanEmail = String(email || "").trim().toLowerCase();
    await axios.post("http://localhost:5000/api/auth/resend-otp", { email: cleanEmail });
    alert("OTP resent.");
    setTimer(60);
  } catch (err) {
    console.error(err?.response?.data || err);
    alert(err?.response?.data?.error || "Failed to resend OTP.");
  }
  setResending(false);
};

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Enter OTP</h2>
        <form onSubmit={handleVerifyOtp} className="login-form">
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <button type="submit">Submit</button>
        </form>

        <div className="register-link">
          {timer > 0 ? (
            <p>Resend OTP in {timer} seconds</p>
          ) : (
            <button onClick={handleResendOtp} disabled={resending}>
              {resending ? "Resending..." : "Resend OTP"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
