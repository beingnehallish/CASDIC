import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/UserDashboard.css";
import { FaSearch, FaBolt } from "react-icons/fa";

// import modularized citizen components
import Technologies from "./citizen/Technologies";
import Projects from "./citizen/Projects";
import Patents from "./citizen/Patents";
import Publications from "./citizen/Publications";
import Notifications from "./citizen/Notifications";
import Settings from "./citizen/Settings";

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
  const [userEmail, setUserEmail] = useState("");

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (email) {
      setUserEmail(email);
    }
  }, []);

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
        res.data.forEach((item) =>
          watchMap.set(`${item.item_type}-${item.item_id}`, item.item_name)
        );
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
          case "Notifications":
            res = await axios.get("http://localhost:5000/api/notifications", { headers });
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
    if (view === "Technologies") // <-- 1. ADD THIS BLOCK
      return (
        (item.name || "").toLowerCase().includes(s) ||
        (item.description || "").toLowerCase().includes(s)
      );
    if (view === "Projects")
      return (
        (item.name || "").toLowerCase().includes(s) ||
        (item.description || "").toLowerCase().includes(s)
      );
    if (view === "Patents")
      return (
        (item.title || "").toLowerCase().includes(s) ||
        (item.patent_number || "").toLowerCase().includes(s)
      );
    if (view === "Publications")
      return (
        (item.title || "").toLowerCase().includes(s) ||
        (item.authors || "").toLowerCase().includes(s) ||
        (item.journal || "").toLowerCase().includes(s)
      );
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
            {[
              "Technologies",
              "Projects",
              "Patents",
              "Publications",
              "Notifications",
              "Settings",
            ].map((item) => (
              <li
                key={item}
                className={view === item ? "active" : ""}
                onClick={() => setView(item)}
              >
                {item}
              </li>
            ))}
          </ul>
        </nav>

        {/* Search bar */}
        {["Technologies","Projects", "Patents", "Publications"].includes(view) && (
          <div className="search-bar1">
            <input
              type="text"
              placeholder={`Search ${view}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}

        <main className="card-grid">
          {/* {view === "Technologies" && <Technologies token={token} />} */}
          {view === "Technologies" && (
            <Technologies
              token={token} 
              handleViewDetails={handleViewDetails} 
              handleToggleWatchlist={handleToggleWatchlist} 
              watchlist={watchlist} 
              filteredData={filteredData} // <-- 3. PASS ALL THESE NEW PROPS
            />
          )}
          {view === "Projects" && (
            <Projects
              filteredData={filteredData}
              // allProjectsData={data}          // <-- 1. REMOVE this line
              token={token}                     // <-- 2. ADD this line
              handleViewDetails={handleViewDetails}
              handleToggleWatchlist={handleToggleWatchlist}
              watchlist={watchlist}
            />
          )}
          {view === "Patents" && (
            <Patents
              filteredData={filteredData}
              token={token} // <-- ADD THIS LINE
              handleViewDetails={handleViewDetails}
              handleToggleWatchlist={handleToggleWatchlist}
              watchlist={watchlist}
            />
          )}
          {view === "Publications" && (
            <Publications
              filteredData={filteredData}
              token={token} // <-- ADD THIS LINE
              handleViewDetails={handleViewDetails}
              handleToggleWatchlist={handleToggleWatchlist}
              watchlist={watchlist}
            />
          )}
          
          {view === "Notifications" && (
            <Notifications
              data={data}
              watchlist={watchlist}
              handleViewDetails={handleViewDetails}
              handleToggleWatchlist={handleToggleWatchlist}
            />
          )}

          {view === "Settings" && (
            <Settings
              currentPassword={currentPassword}
              newPassword={newPassword}
              handlePasswordChange={handlePasswordChange}
              handleLogout={handleLogout}
              setCurrentPassword={setCurrentPassword}
              setNewPassword={setNewPassword}
              msg={msg}
              userEmail={userEmail}
            />
          )}
        </main>
      </div>
    </div>
  );
}
