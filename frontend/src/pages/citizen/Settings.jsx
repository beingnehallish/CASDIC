import { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/Settings.css";

export default function Settings({
  currentPassword,
  newPassword,
  handlePasswordChange, // this already calls PUT /api/auth/change-password in your app
  handleLogout,
  setCurrentPassword,
  setNewPassword,
  msg,
}) {
  const token = localStorage.getItem("token");
  const auth = { headers: { Authorization: `Bearer ${token}` } };

  // ---- Local state for Profile + Prefs ----
  const [name, setName] = useState("");
  const [email, setEmail] = useState(""); // read-only (but backend supports update if you want)
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [inAppNotifs, setInAppNotifs] = useState(true);

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [localMsg, setLocalMsg] = useState("");
  const [localErr, setLocalErr] = useState("");

  // ---- Fetch profile + prefs on mount ----
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingProfile(true);
        // Your backend: GET /api/users/profile
        const me = await axios.get("http://localhost:5000/api/users/profile", auth);
        if (cancelled) return;

        setName(me.data?.name || "");
        setEmail(me.data?.email || "");

        // Preferences (new routes added below)
        try {
          const prefs = await axios.get("http://localhost:5000/api/users/me/preferences", auth);
          if (cancelled) return;
          setEmailNotifs(Boolean(prefs.data?.email_notifications ?? true));
          setInAppNotifs(Boolean(prefs.data?.in_app_notifications ?? true));
        } catch {
          // if table/route not ready yet, keep defaults
        }
      } catch (e) {
        if (!cancelled) setLocalErr(e?.response?.data?.error || "Failed to load profile.");
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Save profile info ----
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLocalMsg("");
    setLocalErr("");
    try {
      setSavingProfile(true);
      // Your backend: PUT /api/users/update-profile  { name, email }
      await axios.put("http://localhost:5000/api/users/update-profile", { name, email }, auth);
      alert("Profile updated successfully.");
    } catch (e) {
      alert(e?.response?.data?.error || "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  // ---- Save notification preferences ----
  const handleSavePrefs = async (e) => {
    e.preventDefault();
    setLocalMsg("");
    setLocalErr("");
    try {
      setSavingPrefs(true);
      await axios.put(
        "http://localhost:5000/api/users/me/preferences",
        { email_notifications: emailNotifs, in_app_notifications: inAppNotifs },
        auth
      );
      setLocalMsg("Notification preferences saved.");
    } catch (e) {
      setLocalErr(e?.response?.data?.error || "Failed to save preferences.");
    } finally {
      setSavingPrefs(false);
    }
  };

  // ---- Delete Account ----
  const handleDeleteAccount = async () => {
    const ok = window.confirm(
      "Are you sure you want to delete your account? This action is permanent and cannot be undone."
    );
    if (!ok) return;

    setLocalMsg("");
    setLocalErr("");
    try {
      // New route we add below: DELETE /api/auth/account
      await axios.delete("http://localhost:5000/api/auth/account", auth);
      handleLogout(); // clear token + navigate away
    } catch (e) {
      setLocalErr(e?.response?.data?.error || "Failed to delete account.");
    }
  };

  return (
    <div className="settings-layout">
      {(localMsg || localErr || msg) && (
        <div className={`settings-banner ${localErr ? "is-error" : "is-ok"}`}>
          {localErr || localMsg || msg}
        </div>
      )}

      {/* Profile */}
      <div className="settings-card">
        <h3>Profile Information</h3>
        <form className="settings-form" onSubmit={handleSaveProfile}>
          <label htmlFor="name">Name</label>
          <input
            id="name" type="text" value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loadingProfile || savingProfile}
            placeholder="Your name"
          />

          <label htmlFor="email">Email</label>
          <input
            id="email" type="email" value={email}
            onChange={(e) => setEmail(e.target.value)} /* enable if you want to allow change */
            disabled={loadingProfile || savingProfile}
            placeholder="email@example.com"
          />

          <button type="submit" disabled={savingProfile || loadingProfile}>
            {savingProfile ? "Saving…" : "Save Changes"}
          </button>
        </form>
      </div>

      {/* Preferences */}
      <div className="settings-card">
        <h3>Notification Preferences</h3>
        <form className="settings-form" onSubmit={handleSavePrefs}>
          <div className="toggle-switch">
            <input
              type="checkbox" id="email-notifs"
              checked={emailNotifs}
              onChange={(e) => setEmailNotifs(e.target.checked)}
              disabled={savingPrefs}
            />
            <label htmlFor="email-notifs">Email Notifications</label>
            <span>Receive email updates for items on your watchlist.</span>
          </div>

          <div className="toggle-switch">
            <input
              type="checkbox" id="in-app-notifs"
              checked={inAppNotifs}
              onChange={() => setInAppNotifs(true)} /* required */
              disabled
            />
            <label htmlFor="in-app-notifs">In-App Notifications</label>
            <span>Show updates in the "Notifications" tab. (Required)</span>
          </div>

          <button type="submit" disabled={savingPrefs}>
            {savingPrefs ? "Saving…" : "Save Preferences"}
          </button>
        </form>
      </div>

      {/* Security (reuses your existing handler/props) */}
      <div className="settings-card">
        <h3>Change Password</h3>
        <form onSubmit={handlePasswordChange} className="settings-form">
          <label htmlFor="current-password">Current Password</label>
          <input
            id="current-password" type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Current Password" required
          />

          <label htmlFor="new-password">New Password</label>
          <input
            id="new-password" type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New Password" required
          />

          <button type="submit">Update Password</button>
          {msg && <p className="form-message">{msg}</p>}
        </form>
      </div>

      {/* Danger zone */}
      <div className="settings-card danger-zone">
        <h3>Account Actions</h3>
        <div className="account-actions">
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
          <button className="delete-btn" onClick={handleDeleteAccount}>Delete Account</button>
        </div>
        <p className="danger-text">Logout of your account or permanently delete it.</p>
      </div>
    </div>
  );
}
