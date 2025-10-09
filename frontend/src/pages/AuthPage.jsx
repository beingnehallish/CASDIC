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
  const email = location.state?.email;

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(countdown);
  }, []);

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/verify-otp", {
        email,
        otp,
      });
      alert("OTP verified! Registration complete.");
      navigate("/login");
    } catch (err) {
      alert("Invalid OTP. Try again.");
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    try {
      await axios.post("http://localhost:5000/api/auth/send-otp", { email });
      alert("OTP resent.");
      setTimer(60);
    } catch (err) {
      alert("Failed to resend OTP.");
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
