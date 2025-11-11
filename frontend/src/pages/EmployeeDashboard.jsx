import { useEffect, useState } from "react";
import axios from "axios";
import TechnologiesPage from "../pages/employee/technologies.jsx";
import DashboardPage from "../pages/employee/dashboard.jsx";
import ProjectsPage from "../pages/employee/projects.jsx";
import CompaniesPage from "../pages/employee/companies.jsx";
import PatentsPage from "../pages/employee/patents.jsx";
import PublicationsPage from "../pages/employee/publications.jsx";
import EmployeesPage from "../pages/employee/employees.jsx"; 

import "../styles/EmployeeDashboard.css"; // This CSS file will be updated

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function EmployeeDashboard() {
  const token = localStorage.getItem("token");
  const [activeTab, setActiveTab] = useState("Dashboard");

  // --- State for Profile Settings ---
  const [profile, setProfile] = useState({ name: "", email: "", phone: "", designation: "", department: "" });
  const [newPicFile, setNewPicFile] = useState(null);
  const [picPreview, setPicPreview] = useState(null);
  const [profileMsg, setProfileMsg] = useState("");

  // --- State for Password Settings ---
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");

  // --- Fetch current employee's profile ---
  useEffect(() => {
    const fetchCurrentEmployee = async () => {
      if (activeTab !== 'Settings') return; // Only fetch if settings tab is open
      try {
        // This assumes you have an endpoint to get the logged-in user's profile
        const res = await axios.get("http://localhost:5000/api/employees/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);
        if (res.data.profile_pic) {
          setPicPreview(`data:image/jpeg;base64,${res.data.profile_pic}`);
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
        // setProfileMsg("❌ Could not load profile data.");
      }
    };
    fetchCurrentEmployee();
  }, [token, activeTab]); // Re-fetch if tab is clicked

  // --- Handlers for Profile Update ---
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewPicFile(file);
      setPicPreview(URL.createObjectURL(file));
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", profile.name);
    formData.append("email", profile.email);
    formData.append("phone", profile.phone);
    formData.append("designation", profile.designation);
    formData.append("department", profile.department);
    if (newPicFile) {
      formData.append("profile_pic", newPicFile);
    }

    try {
      // Assumes a PUT request to the same profile endpoint
      await axios.put("http://localhost:5000/api/employees/profile", formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      setProfileMsg("✅ Profile updated successfully!");
      setNewPicFile(null); // Clear file after upload
    } catch (err) {
      console.error(err);
      setProfileMsg("❌ Profile update failed.");
    }
  };


  // --- Handlers for Password Update ---
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        "http://localhost:5000/api/employees/change-password",
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setPasswordMsg("✅ Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
      } else {
        setPasswordMsg("❌ " + (res.data.message || "Password update failed."));
      }
    } catch (err) {
      console.error(err);
      setPasswordMsg("❌ Server error. Try again later.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("token"); // Use 'token' consistent with other files
    window.location.href = "/login";
  };

  // --- Reports Section (unchanged) ---
  const [filters, setFilters] = useState({ category: "technologies", keyword: "", /* ...other filters */ });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/reports", {
        params: filters,
        headers: { Authorization: `Bearer ${token}` },
      });
      setResults(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'Reports') {
      fetchReports();
    }
  }, [filters, activeTab]);

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      page: 1,
    }));
  };

  const handleReset = () => {
    setFilters({ category: "technologies", keyword: "", /* ...other filters */ });
  };

  const exportToExcel = () => {
    if (!results.length) return alert("No data to export!");
    import("xlsx").then((XLSX) => {
      const worksheet = XLSX.utils.json_to_sheet(results);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Reports");
      XLSX.writeFile(workbook, "Reports.xlsx");
    });
  };

  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    doc.setFontSize(16);
    doc.text("Reports Export", 14, 15);
    if (!results || results.length === 0) {
      doc.text("No data available", 14, 25);
    } else {
      const tableColumn = Object.keys(results[0]);
      const tableRows = results.map((obj) => Object.values(obj));
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 25,
        theme: "grid",
        styles: { fontSize: 10 },
        headStyles: { fillColor: [22, 160, 133] },
      });
    }
    doc.save("Reports.pdf");
  };

  return (
    <div className="empdashboard">
      <aside className="empsidebar">
        <h2>Employee Panel</h2>
        <ul>
          {[
            "Dashboard",
            "Technologies",
            "Projects",
            "Companies",
            "Patents",
            "Publications",
            "Employees",
            "Reports",
            "Settings",
          ].map((tab) => (
            <li
              key={tab}
              className={activeTab === tab ? "active" : ""}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </li>
          ))}
        </ul>
      </aside>

      <main className="empmain-content">
        {activeTab === "Dashboard" && <DashboardPage />}
        {activeTab === "Technologies" && <TechnologiesPage />}
        {activeTab === "Projects" && <ProjectsPage />}
        {activeTab === "Companies" && <CompaniesPage />}
        {activeTab === "Patents" && <PatentsPage />}
        {activeTab === "Publications" && <PublicationsPage />}
        {activeTab === "Employees" && <EmployeesPage />}
        
        {/* --- Reports Tab (Unchanged) --- */}
        {activeTab === "Reports" && (
          <div className="reports-section">
            {/* ... reports JSX ... */}
          </div>
        )}

        {/* --- NEW Settings Tab --- */}
        {activeTab === "Settings" && (
          <div className="settings-page">
            <h2>Account Settings</h2>

            <div className="settings-grid">
              
              {/* --- Profile Card --- */}
              <div className="settings-card">
                <h3>Update Profile</h3>
                <form className="settings-form" onSubmit={handleProfileUpdate}>
                  <div className="profile-pic-settings">
                    {picPreview ? (
                      <img src={picPreview} alt="Profile Preview" />
                    ) : (
                      <div className="pic-placeholder">
                        <span>{profile.name ? profile.name[0] : 'U'}</span>
                      </div>
                    )}
                    <label htmlFor="file-upload" className="file-upload-btn">
                      Upload New Photo
                    </label>
                    <input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} />
                  </div>
                  
                  <label>Full Name</label>
                  <input name="name" type="text" value={profile.name || ""} onChange={handleProfileChange} />
                  
                  <label>Email</label>
                  <input name="email" type="email" value={profile.email || ""} onChange={handleProfileChange} />
                  
                  <label>Phone</label>
                  <input name="phone" type="text" value={profile.phone || ""} onChange={handleProfileChange} />
                  
                  <label>Designation</label>
                  <input name="designation" type="text" value={profile.designation || ""} onChange={handleProfileChange} />

                  <label>Department</label>
                  <input name="department" type="text" value={profile.department || ""} onChange={handleProfileChange} />
                  
                  <button type="submit" className="save-btn">Save Profile</button>
                  {profileMsg && <p className="form-message">{profileMsg}</p>}
                </form>
              </div>

              {/* --- Security Card --- */}
              <div className="settings-card">
                <h3>Security</h3>
                <form className="settings-form" onSubmit={handlePasswordChange}>
                  <label>Current Password</label>
                  <input
                    type="password"
                    placeholder="Current Password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                  <label>New Password</label>
                  <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <button type="submit" className="save-btn">Update Password</button>
                  {passwordMsg && <p className="form-message">{passwordMsg}</p>}
                </form>

                <div className="danger-zone">
                  <h3>Danger Zone</h3>
                  <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}