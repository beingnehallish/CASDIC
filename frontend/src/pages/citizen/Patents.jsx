import { useEffect, useState } from "react";
import axios from "axios";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement, PieController } from "chart.js";
import { Doughnut, Pie, Line } from "react-chartjs-2";
import { FaSearch, FaBolt } from "react-icons/fa";
import "../../styles/Charts.css"; // Use the same chart styles

// Register all needed chart components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement, PieController);

// --- Helper Functions ---
const isPatentGranted = (patent) => {
  return patent.date_granted !== null && patent.date_granted !== undefined;
};

// --- Helper to process Timeline data (by filed date) ---
const processTimelineData = (patents) => {
  const countsByMonth = {};
  patents.forEach((patent) => {
    const date = new Date(patent.date_filed);
    const monthYear = date.toISOString().substring(0, 7);
    if (!countsByMonth[monthYear]) countsByMonth[monthYear] = 0;
    countsByMonth[monthYear]++;
  });
  const sortedLabels = Object.keys(countsByMonth).sort();
  return {
    labels: sortedLabels,
    datasets: [{
      label: "Patents Filed",
      data: sortedLabels.map(label => countsByMonth[label]),
      borderColor: "#ca6702",
      tension: 0.1,
    }],
  };
};

// --- Helper to process Patent Origin data ---
const processOriginData = (patents) => {
  let linked = 0;
  let standalone = 0;
  patents.forEach(p => {
    if (p.tech_id) linked++;
    else standalone++;
  });
  return {
    labels: ["Linked to Technology", "Standalone Innovation"],
    datasets: [{
      data: [linked, standalone],
      backgroundColor: ["#005f73", "#94d2bd"],
    }],
  };
};


// --- The Main Component ---
export default function Patents({
  filteredData,
  token,
  handleViewDetails,
  handleToggleWatchlist,
  watchlist
}) {
  
  // --- States for Stats and Charts ---
  const [stats, setStats] = useState({ total: 0, granted: 0, pending: 0 });
  const [statusData, setStatusData] = useState(null);
  const [originData, setOriginData] = useState(null);
  const [timelineData, setTimelineData] = useState(null);
  const [recentPatents, setRecentPatents] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- This useEffect fetches its OWN data for stats ---
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    axios.get("http://localhost:5000/api/patents", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      const allPatents = res.data;
      if (!allPatents || allPatents.length === 0) {
        setLoading(false);
        return;
      }

      // 1. Calculate Stats
      let grantedCount = 0;
      allPatents.forEach(p => {
        if (isPatentGranted(p)) grantedCount++;
      });
      const pendingCount = allPatents.length - grantedCount;
      setStats({ total: allPatents.length, granted: grantedCount, pending: pendingCount });

      // 2. Set Status Chart Data
      setStatusData({
        labels: ["Granted Patents", "Pending Patents"],
        datasets: [{
          data: [grantedCount, pendingCount],
          backgroundColor: ["#28a745", "#ffc107"],
        }],
      });

      // 3. Set Origin Chart Data
      setOriginData(processOriginData(allPatents));

      // 4. Set Timeline Chart Data
      setTimelineData(processTimelineData(allPatents));

      // 5. Set Recent Patents List (by filed date)
      const sortedByDate = [...allPatents].sort((a, b) => 
        new Date(b.date_filed) - new Date(a.date_filed)
      );
      setRecentPatents(sortedByDate.slice(0, 5));
      
      setLoading(false);
    })
    .catch(err => {
      console.error("Error fetching patent stats:", err);
      setLoading(false);
    });

  }, [token]);

  // --- Chart Options ---
  const doughnutOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: "top" } },
  };
  const pieOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: "right" } },
  };
  const lineOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, title: { display: true, text: "Patents Filed Over Time" } },
  };
  
  if (loading) {
     return <p className="loading-text">Loading patent data...</p>;
  }

  // --- Main Render ---
  return (
    <div className="technologies-dashboard-layout"> {/* Re-using layout style */}
      
      {/* --- Section 1: Stat Cards --- */}
      <div className="stats-card-grid">
        <div className="stat-card"><h3>Total Patents</h3><p>{stats.total}</p></div>
        <div className="stat-card"><h3>Patents Granted</h3><p>{stats.granted}</p></div>
        <div className="stat-card"><h3>Patents Pending</h3><p>{stats.pending}</p></div>
      </div>
      <hr className="divider" />

      {/* --- Section 2: Status & Timeline Charts --- */}
      <div className="charts-container">
        <div className="chart-card">
          <h3>Patent Status</h3>
          <div className="chart-wrapper" style={{ height: "300px" }}>
            {statusData && <Doughnut data={statusData} options={doughnutOptions} />}
          </div>
        </div>
        <div className="chart-card">
          <h3>Patent Filing Activity</h3>
          <div className="chart-wrapper" style={{ height: "300px" }}>
            {timelineData && <Line data={timelineData} options={lineOptions} />}
          </div>
        </div>
      </div>

      {/* --- Section 3: Origin & Recent List --- */}
      <div className="charts-container" style={{ marginTop: '24px' }}>
        <div className="chart-card">
          <h3>Innovation Origin</h3>
          <div className="chart-wrapper" style={{ height: "350px" }}>
            {originData && <Pie data={originData} options={pieOptions} />}
          </div>
        </div>
        <div className="chart-card">
          <h3>Recently Filed Patents</h3>
          <div className="recent-tech-list">
            {recentPatents.map((pat) => (
              <div key={pat.patent_id} className="recent-tech-item">
                <div className="item-info">
                  <span className="item-name">{pat.title}</span>
                  <span className="item-date">
                    Filed: {new Date(pat.date_filed).toLocaleDateString()}
                  </span>
                </div>
                <span className="item-actions">
                  <FaSearch className="icon" onClick={() => handleViewDetails(pat, "patent")} />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- Section 4: Browse All Patents --- */}
      <hr className="divider" />
      <h2 className="browse-title">Browse All Patents</h2>
      <div className="card-grid">
        {filteredData.length > 0 ? (
          filteredData.map((pat) => (
            <div className="card" key={pat.patent_id}>
              <div className="card-icons">
                <FaSearch className="icon search-icon" onClick={() => handleViewDetails(pat, "patent")} />
                <FaBolt
                  className="icon"
                  style={{ color: watchlist.has(`patent-${pat.patent_id}`) ? "#007bff" : "#ccc" }}
                  onClick={() => handleToggleWatchlist("patent", pat.patent_id, pat.title)}
                />
              </div>
              <h3>{pat.title}</h3>
              <p><strong>Number:</strong> {pat.patent_number}</p>
              <p><strong>Filed:</strong> {new Date(pat.date_filed).toLocaleDateString()}</p>
              <p style={{ flexGrow: 0, fontWeight: 500 }}>
                <strong>Status:</strong> {isPatentGranted(pat) ? `Granted on ${new Date(pat.date_granted).toLocaleDateString()}` : "Pending"}
              </p>
            </div>
          ))
        ) : (
          <p>No patents match your search.</p>
        )}
      </div>
    </div>
  );
}