import { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/employee.publications.css";
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
  Legend,
} from "recharts";


/* ====================== Main Page ====================== */
export default function PublicationsPage() {
  const token = localStorage.getItem("token");

  // Main Data
  const [publications, setPublications] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [technologies, setTechnologies] = useState([]);

  // Graph Data
  const [yearData, setYearData] = useState([]);
  const [journalData, setJournalData] = useState([]);
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"];

  // Filters
  const [filters, setFilters] = useState({ keyword: "", tech_id: "", year: "" });

  // Hub Modal State
  const [hubModal, setHubModal] = useState({
    show: false,
    mode: "add",
    publicationData: {},
    relatedData: { authors: [], tech: null },
  });
  const [modalActiveTab, setModalActiveTab] = useState("overview");

  // Authors Tab State
  const [authorSearch, setAuthorSearch] = useState("");
  const [selectedAuthors, setSelectedAuthors] = useState([]);
  const [authorRole, setAuthorRole] = useState("");
  const [linkedAuthors, setLinkedAuthors] = useState([]);
  // Link Modal
  const [showLinkModal, setShowLinkModal] = useState(false);

  // --- Data Fetching ---
  const fetchPublications = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/publications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPublications(res.data || []);
      processGraphData(res.data || []);
    } catch (err) {
      console.error("Error fetching publications:", err);
    }
  };

  useEffect(() => {
    const fetchCore = async () => {
      try {
        const [empRes, techRes] = await Promise.all([
          axios.get("http://localhost:5000/api/employees", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:5000/api/technologies", { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setEmployees(empRes.data || []);
        setTechnologies(techRes.data || []);
      } catch (err) {
        console.error("Error fetching employees/tech:", err);
      }
    };
    fetchPublications();
    fetchCore();
  }, [token]);

  // --- Graph Data Processing ---
  const processGraphData = (pubData) => {
    // 1) by Year
    const yearCounts = {};
    pubData.forEach((p) => {
      if (p.year) {
        const y = String(p.year);
        yearCounts[y] = (yearCounts[y] || 0) + 1;
      }
    });
    const yearArr = Object.entries(yearCounts)
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => a.year.localeCompare(b.year));
    setYearData(yearArr);

    // 2) Top Journals
    const journalCounts = pubData.reduce((acc, p) => {
      const j = p.journal || "Unknown";
      acc[j] = (acc[j] || 0) + 1;
      return acc;
    }, {});
    const topJ = Object.entries(journalCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
    setJournalData(topJ);
  };

  // --- Modal Helpers ---
  const resetHubModal = () => {
    setHubModal({
      show: false,
      mode: "add",
      publicationData: {},
      relatedData: { authors: [], tech: null },
    });
    setModalActiveTab("overview");
    setAuthorSearch("");
    setSelectedAuthors([]);
    setAuthorRole("");
  };

  const handleOpenAddModal = () => {
    resetHubModal();
    setHubModal((prev) => ({
      ...prev,
      show: true,
      mode: "add",
      publicationData: {
        title: "",
        authors: "",
        journal: "",
        year: new Date().getFullYear(),
        link: "",
        tech_id: "",
      },
    }));
  };
const fetchLinkedAuthors = async (pubId) => {
  if (!pubId) return;
  try {
    const res = await axios.get(
      `http://localhost:5000/api/employee_publications/publication/${pubId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setLinkedAuthors(res.data || []);
  } catch (err) {
    console.error("Failed to fetch authors", err);
  }
};

  const handleOpenManageModal = async (publication) => {
    resetHubModal();
    setHubModal((prev) => ({
      ...prev,
      show: true,
      mode: "edit",
      publicationData: publication,
    }));
    try {
 if (publication.tech_id) {
       const techRes = await axios.get(
          `http://localhost:5000/api/technologies/${publication.tech_id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setHubModal((prev) => ({
          ...prev,
          relatedData: { ...prev.relatedData, tech: techRes.data },
        }));
      }
      // Load already linked authors
     fetchLinkedAuthors(publication.pub_id);    }
      catch (err) {
      console.error("Failed to fetch linked tech", err);
    }
  };

  const handleModalFormChange = (e) => {
    const { name, value } = e.target;
    setHubModal((prev) => ({
      ...prev,
      publicationData: { ...prev.publicationData, [name]: value === "" ? null : value },
    }));
  };

  const handleSavePublication = async () => {
    const { mode, publicationData } = hubModal;
    const ok = window.confirm(mode === "add" ? "Add new publication?" : "Update this publication?");
    if (!ok) return;

    if (
      !publicationData.title ||
      !publicationData.journal ||
      !publicationData.year ||
      !publicationData.tech_id
    ) {
      alert("Please fill Title, Journal, Year, and select a Technology.");
      return;
    }

    try {
      if (mode === "add") {
        const res = await axios.post("http://localhost:5000/api/publications", publicationData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const newId =
          res?.data?.pub_id ?? res?.data?.id ?? res?.data?.insertId ?? res?.data?.[0]?.pub_id ?? res?.data?.[0]?.id;
        if (!newId) {
          alert("Saved, but server did not return pub_id. Reopen from table to manage authors.");
        }
        setHubModal((prev) => ({
          ...prev,
          mode: "edit",
          publicationData: { ...prev.publicationData, pub_id: newId || prev.publicationData.pub_id },
        }));
        setModalActiveTab("authors");
         fetchLinkedAuthors(newId);
        alert("Publication added. You can now add authors.");
      } else {
        await axios.put(
          `http://localhost:5000/api/publications/${publicationData.pub_id}`,
          publicationData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Publication updated.");
      }
      fetchPublications();
    } catch (err) {
      console.error(err);
      alert("Failed to save publication.");
    }
  };

  // --- Delete ---
  const handleDeletePublication = async (pubId) => {
    if (!window.confirm("Are you sure you want to delete this publication?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/publications/${pubId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Publication deleted.");
      fetchPublications();
    } catch (err) {
      console.error(err);
      alert("Failed to delete publication. It may be linked to employees.");
    }
  };

  // --- Authors Tab Logic ---
  const filteredEmployeesForModal = (employees || []).filter((emp) =>
    (emp.name || "").toLowerCase().includes(authorSearch.toLowerCase())
  );

  const handleLinkAuthors = async () => {
    const { pub_id } = hubModal.publicationData || {};
    if (!pub_id) {
      alert("Save the publication first.");
      return;
    }
    if (selectedAuthors.length === 0) {
      alert("Please select at least one employee.");
      return;
    }
    try {
      await Promise.all(
        selectedAuthors.map((empId) =>
          axios.post(
            "http://localhost:5000/api/employee_publications",
            { employee_id: empId, pub_id, role: authorRole || "Author" },
            { headers: { Authorization: `Bearer ${token}` } }
          )
        )
      );
      alert(`Linked ${selectedAuthors.length} author(s).`);
      setSelectedAuthors([]);
      setAuthorRole("");
       // Refresh linked authors
    fetchLinkedAuthors(pub_id);
    } catch (err) {
      console.error(err);
      alert("Failed to link authors.");
    }
  };
const handleUnlinkAuthor = async (linkId, name) => {
  const ok = window.confirm(`Remove author "${name}" from this publication?`);
  if (!ok) return;

  try {
    await axios.delete(
      `http://localhost:5000/api/employee_publications/${linkId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setLinkedAuthors((prev) => prev.filter((a) => a.id !== linkId));
  } catch (err) {
    console.error("Failed to unlink author", err);
    alert("Failed to remove author.");
  }
};

  // --- Filters for table ---
  const filteredPublications = (publications || []).filter((p) => {
    const kw = (filters.keyword || "").toLowerCase();
    return (
      (!filters.tech_id || Number(filters.tech_id) === Number(p.tech_id)) &&
      (!filters.year || String(p.year) === String(filters.year)) &&
      ((p.title || "").toLowerCase().includes(kw) ||
        (p.authors || "").toLowerCase().includes(kw) ||
        (p.journal || "").toLowerCase().includes(kw))
    );
  });
useEffect(() => {
  const tid = hubModal?.publicationData?.tech_id;
  if (!hubModal.show || !tid) return;
  (async () => {
    try {
      const techRes = await axios.get(
        `http://localhost:5000/api/technologies/${tid}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHubModal((prev) => ({
        ...prev,
        relatedData: { ...prev.relatedData, tech: techRes.data },
      }));
    } catch (err) {
      console.error("Failed to fetch tech for selected tech_id", err);
    }
  })();
}, [hubModal.show, hubModal?.publicationData?.tech_id, token]);
useEffect(() => {
  if (!hubModal.show) return;
  if (modalActiveTab !== "authors") return;
  const pid = hubModal?.publicationData?.pub_id;
  if (pid) fetchLinkedAuthors(pid);
}, [hubModal.show, modalActiveTab, hubModal?.publicationData?.pub_id]);

  return (
    <div className="pub-section">
      {/* Actions */}
      <div className="pub-table-actions">
        <button className="pub-add-btn" onClick={handleOpenAddModal}>➕ Add Publication</button>
         </div>

      {/* Header */}
      <div className="pub-section-header">
        <h2>PUBLICATIONS</h2>
        <p>Total Publications: {publications.length}</p>
      </div>

      {/* Graphs */}
      <div className="pub-graphs">
        <div className="pub-graph-card">
          <h3>Publications by Year</h3>
          <div className="pub-chart">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={yearData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#2980b9" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="pub-graph-card">
          <h3>Top 5 Journals</h3>
          <div className="pub-chart">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={journalData}
                  cx="50%"
                  cy="45%"
                  labelLine={false}
                  label={false}
                  outerRadius={90}
                  dataKey="value"
                  nameKey="name"
                >
                  {journalData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, name]} />
                <Legend verticalAlign="bottom" align="center" layout="horizontal" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="pub-filters-panel">
        <input
          type="text"
          className="pub-input"
          placeholder="🔎 Search publications..."
          value={filters.keyword}
          onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
        />
        <input
          type="number"
          className="pub-input"
          placeholder="Tech ID"
          value={filters.tech_id}
          onChange={(e) => setFilters({ ...filters, tech_id: e.target.value })}
        />
        <input
          type="number"
          className="pub-input"
          placeholder="Year"
          value={filters.year}
          onChange={(e) => setFilters({ ...filters, year: e.target.value })}
        />
        <button className="pub-reset-btn" onClick={() => setFilters({ keyword: "", tech_id: "", year: "" })}>
          Reset
        </button>
      </div>

      {/* Table */}
      <div className="pub-results">
        <table className="pub-table">
          <thead>
            <tr>
              <th style={{ width: 90 }}>ID</th>
              <th>Title</th>
              <th>Journal</th>
              <th style={{ width: 100 }}>Year</th>
              <th style={{ width: 160 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPublications.map((p) => (
              <tr key={p.pub_id}>
                <td>{p.pub_id}</td>
                <td className="pub-cell-title">{p.title}</td>
                <td>{p.journal}</td>
                <td>{p.year}</td>
                <td>
                  <div className="pub-row-actions">
                    <button className="pub-btn-edit" onClick={() => handleOpenManageModal(p)}>✎Manage</button>
                    <button className="pub-btn-delete" onClick={() => handleDeletePublication(p.pub_id)}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredPublications.length === 0 && (
              <tr>
                <td colSpan={5} className="pub-empty">No publications found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      
      {/* Manage Modal */}
      {hubModal.show && (
        <div className="pub-modal-overlay" onClick={resetHubModal}>
          <div
            className="pub-modal pub-large"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button className="pub-close-btn" onClick={resetHubModal} aria-label="Close">✖</button>
            <h2>{hubModal.mode === "add" ? "Add New Publication" : `Manage: ${hubModal.publicationData.title}`}</h2>

            <div className="pub-modal-tabs" role="tablist" aria-label="Publication sections">
              <button
                className={`pub-tab-btn ${modalActiveTab === "overview" ? "pub-active" : ""}`}
                onClick={() => setModalActiveTab("overview")}
                role="tab"
                aria-selected={modalActiveTab === "overview"}
              >
                Overview
              </button>
              <button
                className={`pub-tab-btn ${modalActiveTab === "authors" ? "pub-active" : ""}`}
                onClick={() => setModalActiveTab("authors")}
                role="tab"
                aria-selected={modalActiveTab === "authors"}
                disabled={hubModal.mode === "add"}
                title={hubModal.mode === "add" ? "Save Overview first" : "Authors"}
              >
                Authors
              </button>
              <button
                className={`pub-tab-btn ${modalActiveTab === "tech" ? "pub-active" : ""}`}
                onClick={() => setModalActiveTab("tech")}
                role="tab"
                aria-selected={modalActiveTab === "tech"}
                disabled={hubModal.mode === "add" || !hubModal.publicationData.tech_id}
                title={!hubModal.publicationData.tech_id ? "No linked technology" : "Linked Tech"}
              >
                Linked Tech
              </button>
            </div>

            <div className="pub-modal-tab-panel">
              {/* Overview */}
              {modalActiveTab === "overview" && (
                <div className="pub-modal-tab-content pub-vertical-form">
                  <label className="pub-label">Title</label>
                  <input
                    className="pub-input"
                    name="title"
                    placeholder="Publication Title"
                    value={hubModal.publicationData.title || ""}
                    onChange={handleModalFormChange}
                  />

                  <label className="pub-label">Journal</label>
                  <input
                    className="pub-input"
                    name="journal"
                    placeholder="Journal Name"
                    value={hubModal.publicationData.journal || ""}
                    onChange={handleModalFormChange}
                  />

                  <label className="pub-label">Year</label>
                  <input
                    className="pub-input"
                    name="year"
                    type="number"
                    placeholder="Year (e.g., 2025)"
                    value={hubModal.publicationData.year || ""}
                    onChange={handleModalFormChange}
                  />

                  <label className="pub-label">Link (optional)</label>
                  <input
                    className="pub-input"
                    name="link"
                    placeholder="https://..."
                    value={hubModal.publicationData.link || ""}
                    onChange={handleModalFormChange}
                  />

                  <label className="pub-label">Linked Technology</label>
                  <select
                    className="pub-input"
                    name="tech_id"
                    value={hubModal.publicationData.tech_id || ""}
                    onChange={handleModalFormChange}
                  >
                    <option value="">-- Select a Technology --</option>
                    {technologies.map((tech) => (
                      <option key={tech.tech_id} value={tech.tech_id}>
                        {tech.name} (ID: {tech.tech_id})
                      </option>
                    ))}
                  </select>

                  <div className="pub-form-buttons">
                    <button className="pub-save-btn" onClick={handleSavePublication}>
                      {hubModal.mode === "add" ? "Save and Continue" : "Save Changes"}
                    </button>
                  </div>
                </div>
              )}

              {/* Authors */}
              {modalActiveTab === "authors" && (
                <div className="pub-modal-tab-content">
                  <h4>LINKED AUTHORS</h4>
                  
    {/* ✅ Already linked authors */}
    <div className="pub-linked-authors" style={{ marginBottom: 12 }}>

      {(!linkedAuthors || linkedAuthors.length === 0) ? (
        <div className="pub-empty">No authors linked yet.</div>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
          {linkedAuthors.map((a) => (
  <li
    key={a.id}
    style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      background: "#f0f2f5",
      padding: "6px 10px",
      borderRadius: 6
    }}
  >
    <span style={{ fontWeight: 600 }}>{a.name}</span>
    <span style={{ opacity: 0.7 }}>
      ({a.employee_id}) · {a.department || "—"}
    </span>

    {a.role && (
      <span
        style={{
          fontSize: 12,
          padding: "2px 8px",
          borderRadius: 999,
          border: "1px solid #ccc"
        }}
      >
        {a.role}
      </span>
    )}

    {/* ❌ REMOVE BUTTON */}
    <button
      onClick={() => handleUnlinkAuthor(a.id, a.name)}
      style={{
        marginLeft: "auto",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        color: "#d11a2a",
        fontSize: 16,
        fontWeight: "bold"
      }}
      title="Remove author"
    >
      ✖
    </button>
  </li>
))}

        </ul>
      )}
    </div><hr></hr>
                  <div className="pub-link-section">
                    <b>ADD NEW AUTHOR(S):</b>
                    <input
                      type="text"
                      className="pub-input"
                      value={authorRole}
                      onChange={(e) => setAuthorRole(e.target.value)}
                      placeholder="E.g., Lead Author, Co-Author"
                    />

                    <input
                      type="text"
                      className="pub-input"
                      placeholder="Search employees..."
                      value={authorSearch}
                      onChange={(e) => setAuthorSearch(e.target.value)}
                    />
                    <div className="pub-searchable-table">
                      <table className="pub-table">
                        <thead>
                          <tr>
                            <th style={{ width: 80, textAlign: "center" }}>Select</th>
                            <th style={{ width: 100 }}>ID</th>
                            <th>Name</th>
                            <th>Dept</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredEmployeesForModal.map((emp) => (
                            <tr key={emp.employee_id} className="pub-row-hover">
                              <td style={{ textAlign: "center" }}>
                                <input
                                  type="checkbox"
                                  checked={selectedAuthors.includes(emp.employee_id)}
                                  onChange={(e) => {
                                    const id = emp.employee_id;
                                    setSelectedAuthors((prev) =>
                                      e.target.checked ? [...prev, id] : prev.filter((i) => i !== id)
                                    );
                                  }}
                                />
                              </td>
                              <td>{emp.employee_id}</td>
                              <td>{emp.name}</td>
                              <td>{emp.department}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="pub-form-buttons">
                    <button className="pub-save-btn" onClick={handleLinkAuthors}>
                      💾 Link Selected Authors
                    </button>
                  </div>
                </div>
              )}

              {/* Linked Tech */}
              {modalActiveTab === "tech" && (
                <div className="pub-modal-tab-content">
                  <h4>Linked Technology Details</h4>
                  {hubModal.relatedData?.tech ? (
                    <div className="pub-tech-card">
                      <h3>{hubModal.relatedData.tech.name}</h3>
                      <div className="pub-tech-detail"><b>Category:</b> {hubModal.relatedData.tech.category}</div>
                      <div className="pub-tech-detail"><b>Status:</b> {hubModal.relatedData.tech.status}</div>
                      <div className="pub-tech-detail"><b>TRL:</b> {hubModal.relatedData.tech.trl_achieved}</div>
                        {hubModal.relatedData.tech.location && (
        <div className="pub-tech-detail"><b>Location:</b> {hubModal.relatedData.tech.location}</div>
      )}
      {hubModal.relatedData.tech.salient_features && (
        <div className="pub-tech-detail"><b>Features:</b> {hubModal.relatedData.tech.salient_features}</div>
      )}
                    </div>
                  ) : (
                    <p className="pub-empty">No technology linked or details not found.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
