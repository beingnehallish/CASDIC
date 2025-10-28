import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/UserDashboard.css";
import { FaSearch, FaBolt } from "react-icons/fa";

export default function UserDashboard() {
  const [stats, setStats] = useState({
    totalTech: 0,
    active: 0,
    deprecated: 0,
    patents: 0,
    publications: 0,
  });
  const [view, setView] = useState("Technologies");
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [watchlist, setWatchlist] = useState(new Map());
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Fetch technology stats
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/technologies", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setStats({
          totalTech: res.data.length,
          active: res.data.filter((t) => t.status === "In Use").length,
          deprecated: res.data.filter((t) => t.status === "Deprecated").length,
          patents: 12,
          publications: 8,
        });
      })
      .catch(console.error);
  }, [token]);

  // Load user's watchlist
  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/watchlist", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const watchMap = new Map();
        res.data.forEach((item) => watchMap.set(`${item.item_type}-${item.item_id}`, item.item_name));
        setWatchlist(watchMap);
      } catch (err) {
        console.error("Error fetching watchlist:", err);
      }
    };
    fetchWatchlist();
  }, [token]);

  // Fetch data by current view
  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        let res;
        switch (view) {
          case "Technologies":
            res = await axios.get("http://localhost:5000/api/technologies", { headers });
            setData(res.data);
            break;
          case "Projects":
            res = await axios.get("http://localhost:5000/api/projects", { headers });
            setData(res.data);
            break;
          case "Patents":
            res = await axios.get("http://localhost:5000/api/patents", { headers });
            setData(res.data);
            break;
          case "Publications":
            res = await axios.get("http://localhost:5000/api/publications", { headers });
            setData(res.data);
            break;
          default:
            setData([]);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [view, token]);

  // Navigate to details page
  const handleViewDetails = (item, type) => {
    navigate(`/details/${type}/${item[`${type}_id`]}`, { state: { item } });
  };

  // Toggle watchlist
  const handleToggleWatchlist = async (type, item_id, item_name) => {
    try {
      await axios.post(
        "http://localhost:5000/api/watchlist/toggle",
        { type, item_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setWatchlist((prev) => {
        const updated = new Map(prev);
        const key = `${type}-${item_id}`;
        if (updated.has(key)) updated.delete(key);
        else updated.set(key, item_name);
        return updated;
      });
    } catch (err) {
      console.error(err);
      alert("Error updating watchlist");
    }
  };

  // Filter data by search term
  const filteredData = data.filter((item) => {
    const s = searchTerm.toLowerCase();
    if (view === "Projects") return (item.name || "").toLowerCase().includes(s) || (item.description || "").toLowerCase().includes(s);
    if (view === "Patents") return (item.title || "").toLowerCase().includes(s) || (item.patent_number || "").toLowerCase().includes(s);
    if (view === "Publications")
      return (item.title || "").toLowerCase().includes(s) || (item.authors || "").toLowerCase().includes(s) || (item.journal || "").toLowerCase().includes(s);
    return true;
  });

  // Change password
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        "http://localhost:5000/api/auth/change-password",
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMsg(res.data.message);
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setMsg(err.response?.data?.message || "Error changing password");
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="user-dashboard">
      <div className="dashboard">
        {/* Navbar */}
        <nav className="navbar">
          <ul>
            {["Technologies", "Projects", "Patents", "Publications", "Notifications", "Settings"].map((item) => (
              <li key={item} className={view === item ? "active" : ""} onClick={() => setView(item)}>
                {item}
              </li>
            ))}
          </ul>
        </nav>

        {/* Search bar */}
        {["Projects", "Patents", "Publications"].includes(view) && (
          <div className="search-bar1">
            <input type="text" placeholder={`Search ${view}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        )}

        <main className="card-grid">
          {/* Notifications */}
          {view === "Notifications" && (
            <div className="notifications-grid">
              <div className="watchlist-column">
                <h3>Your Watchlist</h3>
                {watchlist.size ? (
                  Array.from(watchlist).map((item_id) => (
                    <div key={item_id} className="watchlist-item">
                      {data.find((d) => d.item_id === item_id)?.name || `Item ${item_id}`}
                    </div>
                  ))
                ) : (
                  <p>No items in watchlist</p>
                )}
              </div>

              <div className="notifications-column">
                <h3>Notifications</h3>
                {data.length ? (
                  data.filter((notif) => watchlist.has(notif.item_id)).map((notif) => (
                    <div key={notif.notification_id} className="notification-item">
                      <p>{notif.message}</p>
                      <p>
                        <small>{new Date(notif.created_at).toLocaleString()}</small>
                      </p>
                    </div>
                  ))
                ) : (
                  <p>No notifications yet</p>
                )}
              </div>
            </div>
          )}

          {/* Technologies */}
          {view === "Technologies" &&
            [
              { id: "totalTech", title: "Total Technologies", value: stats.totalTech, img: "src/assets/c1.jpg" },
              { id: "activeTech", title: "Active Technologies", value: stats.active, img: "src/assets/c3.jpg" },
              { id: "deprecatedTech", title: "Deprecated Technologies", value: stats.deprecated, img: "src/assets/c2.jpg" },
              { id: "patents", title: "Patents", value: stats.patents, img: "src/assets/c4.jpeg" },
              { id: "publications", title: "Publications", value: stats.publications, img: "src/assets/c5.jpeg" },
            ].map((card) => (
              <div className="card" key={card.id}>
                <img src={card.img} alt={card.title} />
                <h3>{card.title}</h3>
                <p>{card.value}</p>
              </div>
            ))}

          {/* Projects */}
          {view === "Projects" &&
            (filteredData.length ? (
              filteredData.map((proj) => (
                <div className="card" key={proj.project_id}>
                  <div className="card-icons">
                    <FaSearch className="icon search-icon" onClick={() => handleViewDetails(proj, "project")} />
                    <FaBolt
                      style={{ color: watchlist.has(`project-${proj.project_id}`) ? "#007bff" : "#ccc" }}
                      onClick={() => handleToggleWatchlist("project", proj.project_id, proj.name)}
                    />
                  </div>
                  <h3>{proj.name}</h3>
                  <p>{proj.description}</p>
                  <p>
                    {proj.start_date} - {proj.end_date || "Ongoing"}
                  </p>
                </div>
              ))
            ) : (
              <p>No projects available</p>
            ))}

          {/* Patents */}
          {view === "Patents" &&
            (filteredData.length ? (
              filteredData.map((pat) => (
                <div className="card" key={pat.patent_id}>
                  <div className="card-icons">
                    <FaSearch className="icon search-icon" onClick={() => handleViewDetails(pat, "patent")} />
                    <FaBolt
                      style={{ color: watchlist.has(`patent-${pat.patent_id}`) ? "#007bff" : "#ccc" }}
                      onClick={() => handleToggleWatchlist("patent", pat.patent_id, pat.title)}
                    />
                  </div>
                  <h3>{pat.title}</h3>
                  <p>Patent No: {pat.patent_number}</p>
                  <p>
                    Filed: {pat.date_filed} | Granted: {pat.date_granted || "Pending"}
                  </p>
                </div>
              ))
            ) : (
              <p>No patents available</p>
            ))}

          {/* Publications */}
          {view === "Publications" &&
            (filteredData.length ? (
              filteredData.map((pub) => (
                <div className="card" key={pub.pub_id}>
                  <div className="card-icons">
                    <FaSearch className="icon search-icon" onClick={() => handleViewDetails(pub, "pub")} />
                    <FaBolt
                      style={{ color: watchlist.has(`pub-${pub.pub_id}`) ? "#007bff" : "#ccc" }}
                      onClick={() => handleToggleWatchlist("pub", pub.pub_id, pub.title)}
                    />
                  </div>
                  <h3>{pub.title}</h3>
                  <p>Authors: {pub.authors}</p>
                  <p>
                    Journal: {pub.journal} ({pub.year})
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
              <p>No publications available</p>
            ))}

          {/* Settings */}
          {view === "Settings" && (
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
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
              {msg && <p>{msg}</p>}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
