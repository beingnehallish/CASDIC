// // pages/employee/dashboard.jsx
// import { useEffect, useState } from "react";
// import axios from "axios";
// import "../../styles/employee.dashboard.css";

// export default function DashboardPage() {
//   const token = localStorage.getItem("token");

//   const [stats, setStats] = useState({
//     totalTech: 0,
//     active: 0,
//     deprecated: 0,
//     projects: 0,
//     patents: 0,
//     publications: 0,
//   });

//   useEffect(() => {
//     const fetchStats = async () => {
//       try {
//         // dashboard.jsx
// const res = await axios.get("http://localhost:5000/api/dashboard-stats", {
//   headers: { Authorization: `Bearer ${token}` },
// });

//         // Ensure all required fields exist in response
//         setStats({
//           totalTech: res.data.totalTech || 0,
//           active: res.data.active || 0,
//           deprecated: res.data.deprecated || 0,
//           projects: res.data.projects || 0,
//           patents: res.data.patents || 0,
//           publications: res.data.publications || 0,
//         });
//       } catch (err) {
//         console.error("Failed to fetch dashboard stats:", err);
//       }
//     };

//     fetchStats();
//   }, [token]);

//   return (
//     <div className="empdashboard">
//       <h2>Employee Dashboard</h2>
//       <div className="empstats-grid">
//         <div className="empstat-card">
//           <h3>Total Technologies</h3>
//           <p>{stats.totalTech}</p>
//         </div>
//         <div className="empstat-card active">
//           <h3>Active Technologies</h3>
//           <p>{stats.active}</p>
//         </div>
//         <div className="empstat-card deprecated">
//           <h3>Deprecated Technologies</h3>
//           <p>{stats.deprecated}</p>
//         </div>
//         <div className="empstat-card">
//           <h3>Total Projects</h3>
//           <p>{stats.projects}</p>
//         </div>
//         <div className="empstat-card">
//           <h3>Patents</h3>
//           <p>{stats.patents}</p>
//         </div>
//         <div className="empstat-card">
//           <h3>Publications</h3>
//           <p>{stats.publications}</p>
//         </div>
//       </div>
//     </div>
//   );
// }

// pages/employee/dashboard.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import "../../styles/employee.dashboard.css"; // We will update this file

export default function DashboardPage() {
  const token = localStorage.getItem("token");

  // 1. Original stats
  const [stats, setStats] = useState({
    totalTech: 0,
    active: 0,
    deprecated: 0,
    projects: 0,
    patents: 0,
    publications: 0,
  });

  // 2. New state for charts
  const [trlData, setTrlData] = useState([]);
  const [projectStatusData, setProjectStatusData] = useState([]);

  // 3. New state for recent activity
  const [recentTech, setRecentTech] = useState([]);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  useEffect(() => {
    const fetchAllDashboardData = async () => {
      try {
        // --- 1. Fetch Original Stats ---
        const statsRes = await axios.get("http://localhost:5000/api/dashboard-stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats({
          totalTech: statsRes.data.totalTech || 0,
          active: statsRes.data.active || 0,
          deprecated: statsRes.data.deprecated || 0,
          projects: statsRes.data.projects || 0,
          patents: statsRes.data.patents || 0,
          publications: statsRes.data.publications || 0,
        });

        // --- 2. Fetch Data for Charts ---
        // We'll fetch technologies and projects to build the charts
        const techRes = await axios.get("http://localhost:5000/api/technologies", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Process TRL data (logic from technologies.jsx)
        const trlCounts = Array.from({ length: 9 }, (_, i) => {
          const trl = i + 1;
          return {
            name: `TRL ${trl}`,
            count: techRes.data.filter((t) => t.trl_achieved === trl).length,
          };
        });
        setTrlData(trlCounts);

        // Set recent technologies
        setRecentTech(techRes.data.slice(0, 5)); // Just gets the first 5

        const projectRes = await axios.get("http://localhost:5000/api/projects", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Process Project data (logic from projects.jsx)
        setProjectStatusData([
          {
            name: "Ongoing",
            value: projectRes.data.filter((p) => !p.end_date).length,
          },
          {
            name: "Completed",
            value: projectRes.data.filter((p) => p.end_date).length,
          },
        ]);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      }
    };

    fetchAllDashboardData();
  }, [token]);

  return (
    <div className="emp-dashboard-page">
      <div className="emp-dashboard-header">
        <h2>Employee Dashboard</h2>
        <p>Welcome back! Here's an overview of the system.</p>
      </div>

      {/* --- Quick Stats Grid --- */}
      <div className="empstats-grid">
        <div className="empstat-card">
          <h3>Total Technologies</h3>
          <p>{stats.totalTech}</p>
        </div>
        <div className="empstat-card">
          <h3>Total Projects</h3>
          <p>{stats.projects}</p>
        </div>
        <div className="empstat-card">
          <h3>Total Patents</h3>
          <p>{stats.patents}</p>
        </div>
        <div className="empstat-card">
          <h3>Publications</h3>
          <p>{stats.publications}</p>
        </div>
        <div className="empstat-card active">
          <h3>Active Tech</h3>
          <p>{stats.active}</p>
        </div>
        <div className="empstat-card deprecated">
          <h3>Deprecated Tech</h3>
          <p>{stats.deprecated}</p>
        </div>
      </div>

      {/* --- Charts Grid --- */}
      <div className="emp-charts-grid">
        <div className="emp-chart-card">
          <h3>Technologies by TRL</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trlData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#2980b9" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="emp-chart-card">
          <h3>Project Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={projectStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={110}
                fill="#8884d8"
                dataKey="value"
                label={(entry) => `${entry.name}: ${entry.value}`}
              >
                {projectStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* --- Recent Activity --- */}
      <div className="emp-recent-activity">
        <h3>Recent Technologies</h3>
        <div className="emp-activity-list">
          {recentTech.length > 0 ? (
            recentTech.map((tech) => (
              <div key={tech.tech_id} className="emp-activity-item">
                <div className="item-info">
                  <span className="item-name">{tech.name}</span>
                  <span className="item-category">{tech.category}</span>
                </div>
                <span className="item-status" data-status={tech.status}>
                  {tech.status}
                </span>
              </div>
            ))
          ) : (
            <p>No recent activity found.</p>
          )}
        </div>
      </div>
    </div>
  );
}