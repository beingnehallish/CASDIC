import { useEffect, useState } from "react";
import axios from "axios";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement, PieController } from "chart.js";
import { Doughnut, Pie, Line, Bar } from "react-chartjs-2";
import { FaSearch, FaBolt } from "react-icons/fa";
import "../../styles/Charts.css"; // Use the same chart styles

// Register all needed chart components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement, PieController);

// --- Helper to process Timeline data (by year) ---
const processTimelineData = (publications) => {
  const countsByYear = {};
  publications.forEach((pub) => {
    const year = pub.year || "Unknown";
    countsByYear[year] = (countsByYear[year] || 0) + 1;
  });
  const sortedLabels = Object.keys(countsByYear).sort();
  return {
    labels: sortedLabels,
    datasets: [{
      label: "Publications per Year",
      data: sortedLabels.map(label => countsByYear[label]),
      borderColor: "#0a9396",
      tension: 0.1,
    }],
  };
};

// --- Helper to process Publication Origin data ---
const processOriginData = (publications) => {
  let linked = 0;
  let standalone = 0;
  publications.forEach(p => {
    if (p.tech_id) linked++;
    else standalone++;
  });
  return {
    labels: ["Linked to Technology", "Standalone Research"],
    datasets: [{
      data: [linked, standalone],
      backgroundColor: ["#005f73", "#94d2bd"],
    }],
  };
};

// --- Helper to process Top Journals data ---
const processJournalData = (publications) => {
  const journalCounts = {};
  publications.forEach(pub => {
    const journal = pub.journal || "Unknown";
    journalCounts[journal] = (journalCounts[journal] || 0) + 1;
  });
  
  // Sort, take top 5
  const sortedJournals = Object.entries(journalCounts)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 5);

  return {
    labels: sortedJournals.map(entry => entry[0]), // Journal names
    datasets: [{
      label: "Number of Publications",
      data: sortedJournals.map(entry => entry[1]), // Counts
      backgroundColor: ["#ee9b00", "#ca6702", "#bb3e03", "#ae2012", "#9b2226"],
    }],
  };
};


// --- The Main Component ---
export default function Publications({
  filteredData,
  token,
  handleViewDetails,
  handleToggleWatchlist,
  watchlist
}) {
  
  // --- States for Stats and Charts ---
  const [stats, setStats] = useState({ total: 0, linked: 0, standalone: 0 });
  const [originData, setOriginData] = useState(null);
  const [journalData, setJournalData] = useState(null);
  const [timelineData, setTimelineData] = useState(null);
  const [recentPubs, setRecentPubs] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- This useEffect fetches its OWN data for stats ---
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    axios.get("http://localhost:5000/api/publications", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      const allPublications = res.data;
      if (!allPublications || allPublications.length === 0) {
        setLoading(false);
        return;
      }

      // 1. Calculate Stats
      let linkedCount = 0;
      allPublications.forEach(p => {
        if (p.tech_id) linkedCount++;
      });
      const standaloneCount = allPublications.length - linkedCount;
      setStats({ total: allPublications.length, linked: linkedCount, standalone: standaloneCount });

      // 2. Set Origin Chart Data
      setOriginData(processOriginData(allPublications));

      // 3. Set Top Journal Chart Data
      setJournalData(processJournalData(allPublications));

      // 4. Set Timeline Chart Data
      setTimelineData(processTimelineData(allPublications));

      // 5. Set Recent Publications List (by year)
      const sortedByDate = [...allPublications].sort((a, b) => b.year - a.year);
      setRecentPubs(sortedByDate.slice(0, 5));
      
      setLoading(false);
    })
    .catch(err => {
      console.error("Error fetching publication stats:", err);
      setLoading(false);
    });

  }, [token]);

  // --- Chart Options ---
  const pieOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: "right" } },
  };
  const lineOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, title: { display: true, text: "Publications Over Time" } },
  };
  const barOptions = {
    responsive: true, maintainAspectRatio: false,
    indexAxis: 'y', // Horizontal bar chart
    plugins: { legend: { display: false }, title: { display: true, text: "Top 5 Journals" } },
  };
  
  if (loading) {
     return <p className="loading-text">Loading publication data...</p>;
  }

  // --- Main Render ---
  return (
    <div className="technologies-dashboard-layout"> {/* Re-using layout style */}
      
      {/* --- Section 1: Stat Cards --- */}
      <div className="stats-card-grid">
        <div className="stat-card"><h3>Total Publications</h3><p>{stats.total}</p></div>
        <div className="stat-card"><h3>Internal Papers</h3><p>{stats.linked}</p></div>
        <div className="stat-card"><h3>External Papers</h3><p>{stats.standalone}</p></div>
      </div>
      <hr className="divider" />

      {/* --- Section 2: Origin & Timeline Charts --- */}
      <div className="charts-container">
        <div className="chart-card">
          <h3>Research Origin</h3>
          <div className="chart-wrapper" style={{ height: "300px" }}>
            {originData && <Pie data={originData} options={pieOptions} />}
          </div>
        </div>
        <div className="chart-card">
          <h3>Publication Activity</h3>
          <div className="chart-wrapper" style={{ height: "300px" }}>
            {timelineData && <Line data={timelineData} options={lineOptions} />}
          </div>
        </div>
      </div>

      {/* --- Section 3: Top Journals & Recent List --- */}
      <div className="charts-container" style={{ marginTop: '24px' }}>
        <div className="chart-card">
          <h3>Top 5 Journals</h3>
          <div className="chart-wrapper" style={{ height: "350px" }}>
            {journalData && <Bar data={journalData} options={barOptions} />}
          </div>
        </div>
        <div className="chart-card">
          <h3>Recently Published</h3>
          <div className="recent-tech-list">
            {recentPubs.map((pub) => (
              <div key={pub.pub_id} className="recent-tech-item">
                <div className="item-info">
                  <span className="item-name">{pub.title}</span>
                  <span className="item-date">
                    Published: {pub.year}
                  </span>
                </div>
                <span className="item-actions">
                  <FaSearch className="icon" onClick={() => handleViewDetails(pub, "pub")} />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- Section 4: Browse All Publications --- */}
      <hr className="divider" />
      <h2 className="browse-title">Browse All Publications</h2>
      <div className="card-grid">
        {filteredData.length > 0 ? (
          filteredData.map((pub) => (
            <div className="card" key={pub.pub_id}>
              <div className="card-icons">
                <FaSearch className="icon search-icon" onClick={() => handleViewDetails(pub, "pub")} />
                <FaBolt
                  className="icon"
                  style={{ color: watchlist.has(`pub-${pub.pub_id}`) ? "#007bff" : "#ccc" }}
                  onClick={() => handleToggleWatchlist("pub", pub.pub_id, pub.title)}
                />
              </div>
              <h3>{pub.title}</h3>
              <p><strong>Authors:</strong> {pub.authors}</p>
              <p style={{ flexGrow: 0, fontWeight: 500 }}>
                {pub.journal} ({pub.year})
              </p>
              {pub.link && (
                <p>
                  <a href={pub.link} target="_blank" rel="noreferrer">
                    Read More
                  </a>
                </p>
              )}
            </div>
          ))
        ) : (
          <p>No publications match your search.</p>
        )}
      </div>
    </div>
  );
}