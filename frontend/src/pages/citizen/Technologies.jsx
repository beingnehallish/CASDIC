
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale,
  LinearScale, BarElement, Title, PointElement, LineElement, PieController,
} from "chart.js";
import { Doughnut, Bar, Line, Pie } from "react-chartjs-2";
import { FaSearch, FaBolt } from "react-icons/fa";
import "../../styles/Charts.css"; // Make sure this path is correct

// Register all needed chart components
ChartJS.register(
  ArcElement, Tooltip, Legend, CategoryScale, LinearScale,
  BarElement, Title, PointElement, LineElement, PieController
);

// --- 1. Helper for TRL Chart ---
const processTrlData = (technologies) => {
  const trlBuckets = {
    "TRL 1-3: Research": 0,
    "TRL 4-6: Development": 0,
    "TRL 7-9: Operational": 0,
  };

  technologies.forEach((tech) => {
    const trl = tech.trl_achieved; // Using your 'trl_achieved' column
    if (trl >= 1 && trl <= 3) trlBuckets["TRL 1-3: Research"]++;
    else if (trl >= 4 && trl <= 6) trlBuckets["TRL 4-6: Development"]++;
    else if (trl >= 7 && trl <= 9) trlBuckets["TRL 7-9: Operational"]++;
  });

  return {
    labels: Object.keys(trlBuckets),
    datasets: [{
      label: "Technology Count",
      data: Object.values(trlBuckets),
      backgroundColor: ["#0d6efd", "#ffc107", "#198754"],
    }],
  };
};

// --- 2. Helper for Category Chart ---
const processCategoryData = (technologies) => {
  const counts = {};
  technologies.forEach((tech) => {
    const category = tech.category || "Uncategorized"; // Using your 'category' column
    counts[category] = (counts[category] || 0) + 1;
  });
  return {
    labels: Object.keys(counts),
    datasets: [{
      data: Object.values(counts),
      backgroundColor: ["#005f73", "#0a9396", "#94d2bd", "#e9d8a6", "#ee9b00", "#ca6702"],
    }],
  };
};

// --- 3. Helper for Location Chart ---
const processLocationData = (technologies) => {
  const counts = {};
  technologies.forEach((tech) => {
    const location = tech.location || "Unknown"; // Using your 'location' column
    counts[location] = (counts[location] || 0) + 1;
  });
  return {
    labels: Object.keys(counts),
    datasets: [{
      data: Object.values(counts),
      backgroundColor: ["#6f1d1b", "#bb9457", "#432534", "#BF8B85", "#C8B090"],
    }],
  };
};

// --- 4. Helper for Timeline Chart ---
const processTimelineData = (technologies) => {
  const countsByMonth = {};
  technologies.forEach((tech) => {
    const date = new Date(tech.production_start_date); // Using your 'production_start_date' column
    const monthYear = date.toISOString().substring(0, 7);
    if (!countsByMonth[monthYear]) countsByMonth[monthYear] = 0;
    countsByMonth[monthYear]++;
  });
  const sortedLabels = Object.keys(countsByMonth).sort();
  const sortedData = sortedLabels.map(label => countsByMonth[label]);
  return {
    labels: sortedLabels,
    datasets: [{
      label: "New Technologies",
      data: sortedData,
      borderColor: "#007bff",
      tension: 0.1,
    }],
  };
};

// --- The Main Component ---
export default function Technologies({
  token, handleViewDetails, handleToggleWatchlist, watchlist, filteredData
}) {
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalTech: 0, active: 0, deprecated: 0, patents: 12, publications: 8 });
  
  // States for all our charts
  const [statusData, setStatusData] = useState(null);
  const [trlData, setTrlData] = useState(null);
  const [categoryData, setCategoryData] = useState(null);
  const [locationData, setLocationData] = useState(null);
  const [timelineData, setTimelineData] = useState(null);
  const [recentTechs, setRecentTechs] = useState([]);

  useEffect(() => {
    // This is the *only* data fetch we need for this component.
    // It is used to calculate all stats and charts.
    // The `filteredData` prop (from UserDashboard) is used for the browse list.
    axios
      .get("http://localhost:5000/api/technologies", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const technologies = res.data;

        // --- 1. Process Stats ---
        setStats({
          totalTech: technologies.length,
          active: technologies.filter((t) => t.status === "In Use").length,
          deprecated: technologies.filter((t) => t.status === "Deprecated").length,
          patents: 12, // You can update this later
          publications: 8, // You can update this later
        });

        // --- 2. Process Data for All Charts ---
        setStatusData({
          labels: ["Active", "Deprecated"],
          datasets: [{
            data: [
              technologies.filter((t) => t.status === "In Use").length,
              technologies.filter((t) => t.status === "Deprecated").length
            ],
            backgroundColor: ["#007bff", "#6c757d"],
          }],
        });
        
        setTrlData(processTrlData(technologies));
        setCategoryData(processCategoryData(technologies));
        setLocationData(processLocationData(technologies));
        setTimelineData(processTimelineData(technologies));

        // --- 3. Process Recent List ---
        const sortedTechs = [...technologies].sort((a, b) => 
          new Date(b.production_start_date) - new Date(a.production_start_date)
        );
        setRecentTechs(sortedTechs.slice(0, 5));

        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [token]);

  // --- Chart Options ---
  const doughnutOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: "top" } },
  };
  const barOptions = {
    responsive: true, maintainAspectRatio: false,
    indexAxis: 'y', // Makes it a horizontal bar chart
    plugins: { legend: { display: false } },
  };
  const lineOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
  };
  const pieOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: "right" } },
  };

  if (loading) {
    return <p className="loading-text">Loading insightful data...</p>;
  }

  // --- Main Render ---
  return (
    <div className="technologies-dashboard-layout">
      
      {/* --- Section 1: Stat Cards --- */}
      <div className="stats-card-grid">
        <div className="stat-card"><h3>Total Technologies</h3><p>{stats.totalTech}</p></div>
        <div className="stat-card"><h3>Active Technologies</h3><p>{stats.active}</p></div>
        <div className="stat-card"><h3>Deprecated</h3><p>{stats.deprecated}</p></div>
        <div className="stat-card"><h3>Patents</h3><p>{stats.patents}</p></div>
        <div className="stat-card"><h3>Publications</h3><p>{stats.publications}</p></div>
      </div>
      <hr className="divider" />

      {/* --- Section 2: Status & TRL Charts --- */}
      <div className="charts-container">
        <div className="chart-card">
          <h3>Technology Status</h3>
          <div className="chart-wrapper" style={{ height: "300px" }}>
            {statusData && <Doughnut data={statusData} options={doughnutOptions} />}
          </div>
        </div>
        <div className="chart-card">
          <h3>Technology Readiness Level (TRL)</h3>
          <div className="chart-wrapper" style={{ height: "300px" }}>
            {trlData && <Bar data={trlData} options={barOptions} />}
          </div>
        </div>
      </div>

      {/* --- Section 3: Category & Location Charts --- */}
      <div className="charts-container" style={{ marginTop: '24px' }}>
        <div className="chart-card">
          <h3>Technologies by Category</h3>
          <div className="chart-wrapper" style={{ height: "350px" }}>
            {categoryData && <Doughnut data={categoryData} options={doughnutOptions} />}
          </div>
        </div>
        <div className="chart-card">
          <h3>Technologies by Location</h3>
          <div className="chart-wrapper" style={{ height: "350px" }}>
            {locationData && <Pie data={locationData} options={pieOptions} />}
          </div>
        </div>
      </div>

      {/* --- Section 4: Timeline & Recent List --- */}
      <div className="charts-container" style={{ marginTop: '24px' }}>
        <div className="chart-card">
          <h3>Technology Growth (by Start Date)</h3>
          <div className="chart-wrapper" style={{ height: "300px" }}>
            {timelineData && <Line data={timelineData} options={lineOptions} />}
          </div>
        </div>
        <div className="chart-card">
          <h3>Recently Started</h3>
          <div className="recent-tech-list">
            {recentTechs.map((tech) => (
              <div key={tech.tech_id} className="recent-tech-item">
                
                {/* --- This new div groups the name and date --- */}
                <div className="item-info">
                  <span className="item-name">{tech.name}</span>
                  <span className="item-date">
                    Started: {new Date(tech.production_start_date).toLocaleDateString()}
                  </span>
                </div>

                {/* --- The actions are separate --- */}
                <span className="item-actions">
                  <FaSearch 
                    className="icon" 
                    onClick={() => handleViewDetails(tech, "tech")} 
                  />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- Section 5: Browse All Technologies --- */}
      <hr className="divider" />
      <h2 className="browse-title">Browse All Technologies</h2>
      <div className="card-grid">
        {filteredData.length > 0 ? (
          filteredData.map((tech) => (
            <div className="card" key={tech.tech_id}>
              <div className="card-icons">
                <FaSearch className="icon search-icon" onClick={() => handleViewDetails(tech, "tech")} />
                <FaBolt
                  className="icon"
                  style={{ color: watchlist.has(`tech-${tech.tech_id}`) ? "#007bff" : "#ccc" }}
                  onClick={() => handleToggleWatchlist("tech", tech.tech_id, tech.name)}
                />
              </div>
              <h3>{tech.name}</h3>
              <p><strong>Category:</strong> {tech.category}</p>
              <p><strong>Status:</strong> {tech.status}</p>
              <p><strong>TRL Achieved:</strong> {tech.trl_achieved || "N/A"}</p>
              <p style={{ flexGrow: 0 }}><strong>Location:</strong> {tech.location}</p>
            </div>
          ))
        ) : (
          <p>No technologies match your search.</p>
        )}
      </div>

    </div>
  );
}