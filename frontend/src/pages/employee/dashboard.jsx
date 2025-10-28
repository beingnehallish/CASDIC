// pages/employee/dashboard.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/employee.dashboard.css";

export default function DashboardPage() {
  const token = localStorage.getItem("token");

  const [stats, setStats] = useState({
    totalTech: 0,
    active: 0,
    deprecated: 0,
    projects: 0,
    patents: 0,
    publications: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // dashboard.jsx
const res = await axios.get("http://localhost:5000/api/dashboard-stats", {
  headers: { Authorization: `Bearer ${token}` },
});

        // Ensure all required fields exist in response
        setStats({
          totalTech: res.data.totalTech || 0,
          active: res.data.active || 0,
          deprecated: res.data.deprecated || 0,
          projects: res.data.projects || 0,
          patents: res.data.patents || 0,
          publications: res.data.publications || 0,
        });
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
      }
    };

    fetchStats();
  }, [token]);

  return (
    <div className="empdashboard">
      <h2>Employee Dashboard</h2>
      <div className="empstats-grid">
        <div className="empstat-card">
          <h3>Total Technologies</h3>
          <p>{stats.totalTech}</p>
        </div>
        <div className="empstat-card active">
          <h3>Active Technologies</h3>
          <p>{stats.active}</p>
        </div>
        <div className="empstat-card deprecated">
          <h3>Deprecated Technologies</h3>
          <p>{stats.deprecated}</p>
        </div>
        <div className="empstat-card">
          <h3>Total Projects</h3>
          <p>{stats.projects}</p>
        </div>
        <div className="empstat-card">
          <h3>Patents</h3>
          <p>{stats.patents}</p>
        </div>
        <div className="empstat-card">
          <h3>Publications</h3>
          <p>{stats.publications}</p>
        </div>
      </div>
    </div>
  );
}
