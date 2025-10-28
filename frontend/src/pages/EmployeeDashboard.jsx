import { useEffect, useState } from "react";
import axios from "axios";
import TechnologiesPage from "../pages/employee/technologies.jsx";
import DashboardPage from "../pages/employee/dashboard.jsx";
import ProjectsPage from "../pages/employee/projects.jsx";
import CompaniesPage from "../pages/employee/companies.jsx";
import PatentsPage from "../pages/employee/patents.jsx";
import PublicationsPage from "../pages/employee/publications.jsx";
import EmployeesPage from "../pages/employee/employees.jsx"; // added missing import

import "../styles/EmployeeDashboard.css";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function EmployeeDashboard() {
  const token = localStorage.getItem("token");
  const [activeTab, setActiveTab] = useState("Dashboard");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        "http://localhost:5000/api/employees/change-password",
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setMsg("✅ Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
      } else {
        setMsg("❌ " + (res.data.message || "Password update failed."));
      }
    } catch (err) {
      console.error(err);
      setMsg("❌ Server error. Try again later.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("authToken");
    window.location.href = "/login";
  };

  const [data, setData] = useState({
    technologies: [],
    projects: [],
    companies: [],
    employees: [],
    patents: [],
    publications: [],
  });

  const [filters, setFilters] = useState({
    category: "technologies",
    status: "",
    trl_min: "",
    trl_max: "",
    budget_min: "",
    budget_max: "",
    tech_stack: "",
    start_date: "",
    end_date: "",
    country: "",
    keyword: "",
    sort_by: "",
    sort_order: "ASC",
    page: 1,
    limit: 10,
    watchlist_only: false,
  });

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
    fetchReports();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      page: 1,
    }));
  };

  const handleReset = () => {
    setFilters({
      category: "technologies",
      status: "",
      trl_min: "",
      trl_max: "",
      budget_min: "",
      budget_max: "",
      tech_stack: "",
      start_date: "",
      end_date: "",
      country: "",
      keyword: "",
      sort_by: "",
      sort_order: "ASC",
      page: 1,
      limit: 10,
      watchlist_only: false,
    });
  };

  const exportToExcel = () => {
    if (!results.length) {
      alert("No data to export!");
      return;
    }
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
        {activeTab === "Reports" && (
          <div className="reports-section">
            <h2>Reports</h2>
            <p>Generate or download analytics and performance reports here.</p>
            <div className="filters-panel">
              {/* Filters simplified for brevity */}
              <select name="category" value={filters.category} onChange={handleFilterChange}>
                <option value="technologies">Technologies</option>
                <option value="projects">Projects</option>
                <option value="patents">Patents</option>
                <option value="publications">Publications</option>
                <option value="versions">Versions</option>
              </select>
              <input type="text" name="keyword" placeholder="Search keyword..." value={filters.keyword} onChange={handleFilterChange} />
              <div className="filter-buttons">
                <button onClick={fetchReports}>Apply</button>
                <button onClick={handleReset}>Reset</button>
              </div>
            </div>

            <div className="reports-results">
              {loading ? (
                <p>Loading...</p>
              ) : (
                <>
                  <div className="export-buttons">
                    <button onClick={exportToExcel}>Export Excel</button>
                    <button onClick={exportToPDF}>Export PDF</button>
                  </div>
                  <table>
                    <thead>
                      <tr>
                        {results.length > 0 &&
                          Object.keys(results[0]).map((key) => <th key={key}>{key}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((row, idx) => (
                        <tr key={idx}>
                          {Object.values(row).map((v, i) => (
                            <td key={i}>{v?.toString()}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === "Settings" && (
          <div className="settings">
            <h2>Change Password</h2>
            <form onSubmit={handlePasswordChange}>
              <input
                type="password"
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button type="submit">Update Password</button>
            </form>

            <button onClick={handleLogout}>Logout</button>
            {msg && <p>{msg}</p>}
          </div>
        )}
      </main>
    </div>
  );
}
