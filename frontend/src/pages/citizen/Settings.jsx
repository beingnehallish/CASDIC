import "../../styles/Settings.css"; 

export default function Settings({
  currentPassword,
  newPassword,
  handlePasswordChange,
  handleLogout,
  setCurrentPassword,
  setNewPassword,
  msg,
  userEmail,
}) {
  
  // Placeholder function for the new "Delete Account" button
  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account? This action is permanent and cannot be undone.")) {
      // You would add your API call here, e.g.:
      // axios.delete("/api/auth/account", ...).then(() => handleLogout());
      alert("This would delete your account. (Functionality not yet connected)");
    }
  };

  return (
    <div className="settings-layout">
      
      {/* --- Section 1: Profile Information (Visual Mock-up) --- */}
      <div className="settings-card">
        <h3>Profile Information</h3>
        <form className="settings-form">
          <label htmlFor="name">Name</label>
          {/* 2. This is still a placeholder. See note below. */}
          <input type="text" id="name" defaultValue="User" disabled />   

          <label htmlFor="email">Email</label>
          {/* 3. Use the dynamic userEmail prop */}
          <input 
            type="email" 
            id="email" 
            value={userEmail} // <-- Use value instead of defaultValue
            disabled 
          />
                    
          <button type="submit" disabled>Save Changes</button>
        </form>
      </div>

      {/* --- Section 2: Notification Preferences (Visual Mock-up) --- */}
      <div className="settings-card">
        <h3>Notification Preferences</h3>
        <form className="settings-form">
          <div className="toggle-switch">
            <input type="checkbox" id="email-notifs" defaultChecked />
            <label htmlFor="email-notifs">Email Notifications</label>
            <span>Receive email updates for items on your watchlist.</span>
          </div>
          <div className="toggle-switch">
            <input type="checkbox" id="in-app-notifs" defaultChecked disabled />
            <label htmlFor="in-app-notifs">In-App Notifications</label>
            <span>Show updates in the "Notifications" tab. (Required)</span>
          </div>
        </form>
      </div>

      {/* --- Section 3: Security (This one is functional) --- */}
      <div className="settings-card">
        <h3>Change Password</h3>
        <form onSubmit={handlePasswordChange} className="settings-form">
          <label htmlFor="current-password">Current Password</label>
          <input
            type="password"
            id="current-password"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          
          <label htmlFor="new-password">New Password</label>
          <input
            type="password"
            id="new-password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          
          <button type="submit">Update Password</button>
          {msg && <p className="form-message">{msg}</p>}
        </form>
      </div>
      
      {/* --- Section 4: Account Actions --- */}
      <div className="settings-card danger-zone">
        <h3>Account Actions</h3>
        <div className="account-actions">
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
          <button className="delete-btn" onClick={handleDeleteAccount}>
            Delete Account
          </button>
        </div>
        <p className="danger-text">
          Logout of your account or permanently delete it.
        </p>
      </div>

    </div>
  );
}