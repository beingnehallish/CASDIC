// pages/employee/settings.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/employee.settings.css";

export default function SettingsPage() {
  const token = localStorage.getItem("token");

  // Read-only profile
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileMsg, setProfileMsg] = useState("");

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [pwSubmitting, setPwSubmitting] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoadingProfile(true);
      setProfileMsg("");
      try {
        const res = await axios.get("http://localhost:5000/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile({
          name: res.data?.name || "",
          email: res.data?.email || "",
        });
      } catch (err) {
        console.error(err);
        setProfileMsg("❌ Could not load profile.");
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, [token]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMsg("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMsg("❌ Please fill all fields.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMsg("❌ New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg("❌ New password and confirm password do not match.");
      return;
    }
    if (newPassword === currentPassword) {
      setPasswordMsg("❌ New password must be different from current password.");
      return;
    }

    try {
      setPwSubmitting(true);
      const res = await axios.put(
        "http://localhost:5000/api/auth/change-password",
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPasswordMsg("✅ " + (res.data?.message || "Password updated successfully."));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const m =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Server error.";
      setPasswordMsg("❌ " + m);
      console.error("Change password error:", err?.response?.data || err);
    } finally {
      setPwSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="settings-page">
      <h2>Account Settings</h2>

      <div className="settings-grid">
        {/* Profile (read-only) */}
        <div className="settings-card">
          <div className="settings-card-header">
            <h3>PROFILE</h3>
          </div>

          {loadingProfile ? (
            <p className="form-message">Loading…</p>
          ) : profileMsg ? (
            <p className="form-message">{profileMsg}</p>
          ) : (
            <div className="settings-readonly">
              <div className="settings-field">
                <label>Name</label>
                <div className="settings-value">{profile.name || "—"}</div>
              </div><br></br>
              <div className="settings-field">
                <label>Email</label>
                <div className="settings-value">{profile.email || "—"}</div>
              </div>
            </div>
          )}
        </div>

        {/* Password update */}
        <div className="settings-card">
          <h3>PASSWORD</h3>
          <form className="settings-form" onSubmit={handlePasswordChange}>
            <label>Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            <label>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
            />

            <label>Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />

            <button className="save-btn" type="submit" disabled={pwSubmitting}>
              {pwSubmitting ? "Updating…" : "Update Password"}
            </button>

            {passwordMsg && <p className="form-message">{passwordMsg}</p>}
          </form>

          <div className="danger-zone">
            <h3>Danger Zone</h3>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
