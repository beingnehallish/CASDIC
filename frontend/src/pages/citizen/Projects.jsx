import { useEffect, useState } from "react";
import axios from "axios"; // <-- Make sure axios is imported
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement } from "chart.js";
import { Doughnut, Bar, Line } from "react-chartjs-2";
import { FaSearch, FaBolt } from "react-icons/fa";
import "../../styles/Charts.css";

// Register all needed chart components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement);

// --- (All your helper functions remain the same) ---
const isProjectActive = (project) => {
  if (!project.end_date) return true;
  return new Date(project.end_date) > new Date();
};

const processBudgetData = (projects) => {
  const sortedByBudget = [...projects]
    .sort((a, b) => b.budget - a.budget)
    .slice(0, 5);
  return {
    labels: sortedByBudget.map(p => p.name),
    datasets: [{
      label: "Project Budget",
      data: sortedByBudget.map(p => p.budget),
      backgroundColor: ["#005f73", "#0a9396", "#94d2bd", "#e9d8a6", "#ee9b00"],
    }],
  };
};

const processTimelineData = (projects) => {
  const countsByMonth = {};
  projects.forEach((proj) => {
    const date = new Date(proj.start_date);
    const monthYear = date.toISOString().substring(0, 7);
    if (!countsByMonth[monthYear]) countsByMonth[monthYear] = 0;
    countsByMonth[monthYear]++;
  });
  const sortedLabels = Object.keys(countsByMonth).sort();
  return {
    labels: sortedLabels,
    datasets: [{
      label: "New Projects Started",
      data: sortedLabels.map(label => countsByMonth[label]),
      borderColor: "#198754",
      tension: 0.1,
    }],
  };
};

// --- The Main Component ---
export default function Projects({
  filteredData,
  token, // <-- 1. Accept 'token'
  // allProjectsData, // <-- No longer needed
  handleViewDetails,
  handleToggleWatchlist,
  watchlist
}) {
  
  // --- States for Stats and Charts ---
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0 });
  const [statusData, setStatusData] = useState(null);
  const [budgetData, setBudgetData] = useState(null);
  const [timelineData, setTimelineData] = useState(null);
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true); // <-- 2. Add loading state

  // --- 3. This new useEffect fetches its OWN data for stats ---
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    axios.get("http://localhost:5000/api/projects", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      const allProjectsData = res.data; // Data is now local to this component
      if (!allProjectsData || allProjectsData.length === 0) {
        setLoading(false);
        return;
      }

      // 1. Calculate Stats
      let activeCount = 0;
      allProjectsData.forEach(p => {
        if (isProjectActive(p)) activeCount++;
      });
      const completedCount = allProjectsData.length - activeCount;
      setStats({ total: allProjectsData.length, active: activeCount, completed: completedCount });

      // 2. Set Status Chart Data
      setStatusData({
        labels: ["Active Projects", "Completed Projects"],
        datasets: [{
          data: [activeCount, completedCount],
          backgroundColor: ["#0d6efd", "#6c757d"],
        }],
      });

      // 3. Set Budget Chart Data
      setBudgetData(processBudgetData(allProjectsData));

      // 4. Set Timeline Chart Data
      setTimelineData(processTimelineData(allProjectsData));

      // 5. Set Recent Projects List
      const sortedByDate = [...allProjectsData].sort((a, b) => 
        new Date(b.start_date) - new Date(a.start_date)
      );
      setRecentProjects(sortedByDate.slice(0, 5));
      
      setLoading(false); // <-- Set loading to false
    })
    .catch(err => {
      console.error("Error fetching project stats:", err);
      setLoading(false);
    });

  }, [token]); // This now runs when the component loads

  // --- Chart Options ---
  const doughnutOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: "top" } },
  };
  const barOptions = {
    responsive: true, maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: { legend: { display: false }, title: { display: true, text: "Top 5 Projects by Budget" } },
  };
  const lineOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, title: { display: true, text: "New Projects Over Time" } },
  };
  
  // 4. Use the new loading state
  if (loading) {
     return <p className="loading-text">Loading project data...</p>;
  }

  // --- Main Render (This part is exactly the same as before) ---
  return (
    <div className="technologies-dashboard-layout">
      
      {/* --- Section 1: Stat Cards --- */}
      <div className="stats-card-grid">
        <div className="stat-card"><h3>Total Projects</h3><p>{stats.total}</p></div>
        <div className="stat-card"><h3>Active Projects</h3><p>{stats.active}</p></div>
        <div className="stat-card"><h3>Completed</h3><p>{stats.completed}</p></div>
      </div>
      <hr className="divider" />

      {/* --- Section 2: Status & Timeline Charts --- */}
      <div className="charts-container">
        <div className="chart-card">
          <h3>Project Status</h3>
          <div className="chart-wrapper" style={{ height: "300px" }}>
            {statusData && <Doughnut data={statusData} options={doughnutOptions} />}
          </div>
        </div>
        <div className="chart-card">
          <h3>Project Activity</h3>
          <div className="chart-wrapper" style={{ height: "300px" }}>
            {timelineData && <Line data={timelineData} options={lineOptions} />}
          </div>
        </div>
      </div>

      {/* --- Section 3: Budget & Recent List --- */}
      <div className="charts-container" style={{ marginTop: '24px' }}>
        <div className="chart-card">
          <h3>Top 5 Projects by Budget</h3>
          <div className="chart-wrapper" style={{ height: "350px" }}>
            {budgetData && <Bar data={budgetData} options={barOptions} />}
          </div>
        </div>
        <div className="chart-card">
          <h3>Recently Started Projects</h3>
          <div className="recent-tech-list">
            {recentProjects.map((proj) => (
              <div key={proj.project_id} className="recent-tech-item">
                <div className="item-info">
                  <span className="item-name">{proj.name}</span>
                  <span className="item-date">
                    Started: {new Date(proj.start_date).toLocaleDateString()}
                  </span>
                </div>
                <span className="item-actions">
                  <FaSearch className="icon" onClick={() => handleViewDetails(proj, "project")} />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- Section 4: Browse All Projects --- */}
      <hr className="divider" />
      <h2 className="browse-title">Browse All Projects</h2>
      <div className="card-grid">
        {filteredData.length > 0 ? (
          filteredData.map((proj) => (
            <div className="card" key={proj.project_id}>
              <div className="card-icons">
                <FaSearch className="icon search-icon" onClick={() => handleViewDetails(proj, "project")} />
                <FaBolt
                  className="icon"
                  style={{ color: watchlist.has(`project-${proj.project_id}`) ? "#007bff" : "#ccc" }}
                  onClick={() => handleToggleWatchlist("project", proj.project_id, proj.name)}
                />
              </div>
              <h3>{proj.name}</h3>
              <p>{proj.description}</p>
              <p style={{ flexGrow: 0, fontWeight: 500 }}>
                {new Date(proj.start_date).getFullYear()} - {isProjectActive(proj) ? "Ongoing" : new Date(proj.end_date).getFullYear()}
              </p>
            </div>
          ))
        ) : (
          <p>No projects match your search.</p>
        )}
      </div>
    </div>
  );
}