import { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/employee.projects.css"; // Re-uses the same CSS!
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
  Legend, // <-- This import is correct
} from "recharts";

// This is the "Link Employee to Publication" modal, now as a separate component
const LinkEmployeeModal = ({ show, onClose, publications, employees, token }) => {
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedPublication, setSelectedPublication] = useState(null);
  const [role, setRole] = useState("");
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [publicationSearch, setPublicationSearch] = useState("");

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(employeeSearch.toLowerCase())
  );
  
  const filteredPublications = publications.filter(p => 
    p.title.toLowerCase().includes(publicationSearch.toLowerCase())
  );

  const handleSave = async () => {
    try {
      if (selectedEmployees.length === 0 || !selectedPublication) {
        alert("Select at least one employee and one publication");
        return;
      }
      await Promise.all(
        selectedEmployees.map(empId =>
          axios.post(
            "http://localhost:5000/api/employee_publications",
            { employee_id: empId, pub_id: selectedPublication, role: role },
            { headers: { Authorization: `Bearer ${token}` } }
          )
        )
      );
      alert("Employees linked to publication successfully!");
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to link employees to publication");
    }
  };

  if (!show) return null;

  return (
    <div className="modal-overlay link-modal-overlay" onClick={onClose}>
      <div className="modal-content large link-modal-layout" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✖</button>
        <h2>Link Employees to Publication</h2>

        {/* Role */}
        <div className="link-modal-section"> 
          <b>Role (e.g., Author):</b>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Lead Author / Co-Author"
          />
        </div>

        {/* Publication Selection */}
        <div className="link-modal-section">
          <b>Select Publication:</b>
          <input
            type="text"
            placeholder="Search publications..."
            value={publicationSearch}
            onChange={(e) => setPublicationSearch(e.target.value)}
          />
          <div className="searchable-table" style={{ maxHeight: "150px" }}>
            <table>
              <thead><tr><th>Select</th><th>ID</th><th>Title</th></tr></thead>
              <tbody>
                {filteredPublications.map(p => (
                  <tr key={p.pub_id}>
                    <td>
                      <input
                        type="radio"
                        name="selectedPublication"
                        checked={selectedPublication === p.pub_id}
                        onChange={() => setSelectedPublication(p.pub_id)}
                      />
                    </td>
                    <td>{p.pub_id}</td><td>{p.title}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Employees Selection */}
        <div className="link-modal-section">
          <b>Select Employees:</b>
          <input
            type="text"
            placeholder="Search employees..."
            value={employeeSearch}
            onChange={(e) => setEmployeeSearch(e.target.value)}
          />
          <div className="searchable-table" style={{ maxHeight: "200px" }}>
            <table>
              <thead><tr><th>Select</th><th>ID</th><th>Name</th><th>Dept</th></tr></thead>
              <tbody>
                {filteredEmployees.map(emp => (
                  <tr key={emp.employee_id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedEmployees.includes(emp.employee_id)}
                        onChange={(e) => {
                          const id = emp.employee_id;
                          setSelectedEmployees(prev =>
                            e.target.checked ? [...prev, id] : prev.filter(i => i !== id)
                          );
                        }}
                      />
                    </td>
                    <td>{emp.employee_id}</td><td>{emp.name}</td><td>{emp.department}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <button className="save-btn" onClick={handleSave}>💾 Link</button>
      </div>
    </div>
  );
};

// Main Page Component
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
    mode: 'add',
    publicationData: {},
    relatedData: { authors: [], tech: null }
  });
  const [modalActiveTab, setModalActiveTab] = useState('overview');
  
  // Authors Tab State
  const [authorSearch, setAuthorSearch] = useState("");
  const [selectedAuthors, setSelectedAuthors] = useState([]);
  const [authorRole, setAuthorRole] = useState("");
  
  // Link Employee Modal State
  const [showLinkModal, setShowLinkModal] = useState(false);

  // --- Data Fetching ---

  const fetchPublications = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/publications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPublications(res.data);
      processGraphData(res.data); // Process graph data after fetching
    } catch (err) {
      console.error("Error fetching publications:", err);
    }
  };

  useEffect(() => {
    // Fetch all required data on load
    const fetchPageData = async () => {
      try {
        const [empRes, techRes] = await Promise.all([
          axios.get("http://localhost:5000/api/employees", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:5000/api/technologies", { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setEmployees(empRes.data);
        setTechnologies(techRes.data);
      } catch (err) {
        console.error("Error fetching employees/tech:", err);
      }
    };
    
    fetchPublications();
    fetchPageData();
  }, [token]);

  // --- Graph Data Processing ---
  const processGraphData = (pubData) => {
    // 1. By Year
    const yearCounts = {};
    pubData.forEach(p => {
      if (p.year) yearCounts[p.year] = (yearCounts[p.year] || 0) + 1;
    });
    setYearData(Object.entries(yearCounts).map(([year, count]) => ({ year: String(year), count })));

    // 2. By Journal
    const journalCounts = pubData.reduce((acc, p) => {
      const journal = p.journal || "Unknown";
      acc[journal] = (acc[journal] || 0) + 1;
      return acc;
    }, {});
    
    // Get top 5
    const sortedJournals = Object.entries(journalCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
    setJournalData(sortedJournals);
  };

  // --- Modal Logic ---

  const resetHubModal = () => {
    setHubModal({
      show: false,
      mode: 'add',
      publicationData: {},
      relatedData: { authors: [], tech: null }
    });
    setModalActiveTab('overview');
    setAuthorSearch("");
    setSelectedAuthors([]);
    setAuthorRole("");
  };

  const handleOpenAddModal = () => {
    resetHubModal();
    setHubModal(prev => ({
      ...prev,
      show: true,
      mode: 'add',
      publicationData: {
        title: "",
        authors: "",
        journal: "",
        year: new Date().getFullYear(),
        link: "",
        tech_id: ""
      }
    }));
  };

  const handleOpenManageModal = async (publication) => {
    resetHubModal();
    setHubModal(prev => ({
      ...prev,
      show: true,
      mode: 'edit',
      publicationData: publication
    }));

    // Fetch related tech and authors
    try {
      if (publication.tech_id) {
        const techRes = await axios.get(
          `http://localhost:5000/api/projects/technologies/${publication.tech_id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setHubModal(prev => ({
          ...prev,
          relatedData: { ...prev.relatedData, tech: techRes.data }
        }));
      }
      // You would also fetch linked authors here, e.g.:
      // const authorsRes = await axios.get(`/api/publications/${publication.pub_id}/authors`, ...);
      // setHubModal(prev => ({ ...prev, relatedData: { ...prev.relatedData, authors: authorsRes.data } }));
    } catch (err) {
      console.error("Failed to fetch related publication data", err);
    }
  };

  const handleModalFormChange = (e) => {
    const { name, value } = e.target;
    setHubModal(prev => ({
      ...prev,
      publicationData: {
        ...prev.publicationData,
        [name]: value === "" ? null : value
      }
    }));
  };

  const handleSavePublication = async () => {
    const { mode, publicationData } = hubModal;
    const confirmed = window.confirm(mode === 'add' ? "Add new publication?" : "Update this publication?");
    if (!confirmed) return;

    // Basic validation
    if (!publicationData.title || !publicationData.authors || !publicationData.journal || !publicationData.year || !publicationData.tech_id) {
      alert("Please fill all required fields: Title, Authors, Journal, Year, and select a Technology.");
      return;
    }

    try {
      if (mode === 'add') {
        const res = await axios.post("http://localhost:5000/api/publications", publicationData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Switch to edit mode
        setHubModal(prev => ({
          ...prev,
          mode: 'edit',
          publicationData: { ...prev.publicationData, pub_id: res.data.pub_id }
        }));
        setModalActiveTab('authors');
        alert("Publication added. You can now add authors.");
      } else {
        await axios.put(`http://localhost:5000/api/publications/${publicationData.pub_id}`, publicationData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Publication updated.");
      }
      fetchPublications(); // Refresh main list
    } catch (err) {
      console.error(err);
      alert("Failed to save publication.");
    }
  };

  // --- Delete Publication ---
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
  const handleLinkAuthors = async () => {
    const { pub_id } = hubModal.publicationData;
    if (selectedAuthors.length === 0) {
      alert("Please select at least one employee.");
      return;
    }

    try {
      const linkPromises = selectedAuthors.map(empId => 
        axios.post(
          "http://localhost:5000/api/employee_publications",
          { employee_id: empId, pub_id: pub_id, role: authorRole || "Author" },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      );
      await Promise.all(linkPromises);
      alert(`Successfully linked ${selectedAuthors.length} authors.`);
      
      setSelectedAuthors([]);
      setAuthorRole("");
      // You would refresh the authors list here
      // await fetchAuthors(pub_id);

    } catch (err) {
      console.error(err);
      alert("Failed to link authors.");
    }
  };

  const filteredEmployeesForModal = employees.filter(emp => 
    emp.name.toLowerCase().includes(authorSearch.toLowerCase())
  );

  // --- Filtering for main table ---
  const filteredPublications = publications.filter((p) => {
    const kw = (filters.keyword || "").toLowerCase();
    return (
      (!filters.tech_id || p.tech_id === Number(filters.tech_id)) &&
      (!filters.year || String(p.year) === filters.year) &&
      ((p.title || "").toLowerCase().includes(kw) ||
        (p.authors || "").toLowerCase().includes(kw) ||
        (p.journal || "").toLowerCase().includes(kw))
    );
  });

  // --- Render ---

  return (
    <div className="empsection">
      <div className="tech-table-actions">
        <button className="add-btn" onClick={handleOpenAddModal}>
          ➕ Add Publication
        </button>
        <button
          className="add-btn"
          onClick={() => setShowLinkModal(true)}
        >
          🔗 Link Employee to Publication
        </button>
      </div>

      <div className="empsection-header">
        <h2>Publications</h2>
        <p>Total Publications: {publications.length}</p>
      </div>

      {/* ===== Graph Section (Now 2 Graphs) ===== */}
      <div className="tech-graphs">
        <div className="graph-card">
          <h3>Publications by Year</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={yearData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#2980b9" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* --- THIS IS THE FIX --- */}
        <div className="graph-card">
          <h3>Top 5 Journals</h3>
          {/* Increased height to 300 to give legend space */}
          <ResponsiveContainer width="100%" height={300}> 
            <PieChart>
              <Pie
                data={journalData}
                cx="50%"
                cy="45%" /* Nudged pie up to make space */
                labelLine={false}
                label={false} /* Hide overlapping labels */
                outerRadius={80} /* Made pie smaller */
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
              >
                {journalData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [value, name]} />
              {/* Configure Legend to sit at the bottom */}
              <Legend 
                verticalAlign="bottom" 
                align="center" 
                layout="horizontal" 
                wrapperStyle={{ paddingTop: "10px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ===== Filters ===== */}
      <div className="filters-panel">
        <input type="text" placeholder="🔎 Search publications..." value={filters.keyword} onChange={(e) => setFilters({ ...filters, keyword: e.target.value })} />
        <input type="number" placeholder="Tech ID" value={filters.tech_id} onChange={(e) => setFilters({ ...filters, tech_id: e.target.value })} />
        <input type="number" placeholder="Year" value={filters.year} onChange={(e) => setFilters({ ...filters, year: e.target.value })} />
        <button className="reset-btn" onClick={() => setFilters({ keyword: "", tech_id: "", year: "" })}>Reset</button>
      </div>

      {/* ===== Publications Table ===== */}
      <div className="reports-results">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Journal</th>
              <th>Year</th>
              <th>Tech ID</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPublications.map((p) => (
              <tr key={p.pub_id}>
                <td>{p.pub_id}</td>
                <td>{p.title}</td>
                <td>{p.journal}</td>
                <td>{p.year}</td>
                <td>{p.tech_id}</td>
                <td>
                  <div className="action-buttons-wrapper">
                    <button className="edit-btn" onClick={() => handleOpenManageModal(p)}>✎ Manage</button>
                    <button className="delete-btn" onClick={() => handleDeletePublication(p.pub_id)}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== Bulk Link Employee Modal ===== */}
      <LinkEmployeeModal
        show={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        publications={publications}
        employees={employees}
        token={token}
      />

      {/* ===== Manage Hub Modal ===== */}
      {hubModal.show && (
        <div className="modal-overlay" onClick={resetHubModal}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={resetHubModal}>✖</button>
            <h2>{hubModal.mode === 'add' ? "Add New Publication" : `Manage: ${hubModal.publicationData.title}`}</h2>

            <div className="modal-tabs">
              <button
                className={`tab-btn ${modalActiveTab === 'overview' ? 'active' : ''}`}
                onClick={() => setModalActiveTab('overview')}
              >
                Overview
              </button>
              <button
                className={`tab-btn ${modalActiveTab === 'authors' ? 'active' : ''}`}
                onClick={() => setModalActiveTab('authors')}
                disabled={hubModal.mode === 'add'}
              >
                Authors
              </button>
              <button
                className={`tab-btn ${modalActiveTab === 'tech' ? 'active' : ''}`}
                onClick={() => setModalActiveTab('tech')}
                disabled={hubModal.mode === 'add' || !hubModal.publicationData.tech_id}
              >
                Linked Tech
              </button>
            </div>

            <div className="modal-tab-panel">
              {/* --- Overview Tab (Add/Edit Form) --- */}
              {modalActiveTab === 'overview' && (
                <div className="modal-tab-content vertical-form">
                  <label>Title</label>
                  <input name="title" placeholder="Publication Title" value={hubModal.publicationData.title || ""} onChange={handleModalFormChange} />
                  <label>Authors</label>
                  <input name="authors" placeholder="Authors (e.g., A. Singh, B. Rao)" value={hubModal.publicationData.authors || ""} onChange={handleModalFormChange} />
                  <label>Journal</label>
                  <input name="journal" placeholder="Journal Name" value={hubModal.publicationData.journal || ""} onChange={handleModalFormChange} />
                  <label>Year</label>
                  <input name="year" type="number" placeholder="Year (e.g., 2024)" value={hubModal.publicationData.year || ""} onChange={handleModalFormChange} />
                  <label>Link (optional)</label>
                  <input name="link" placeholder="https://..." value={hubModal.publicationData.link || ""} onChange={handleModalFormChange} />
                  <label>Linked Technology</label>
                  <select
                    name="tech_id"
                    value={hubModal.publicationData.tech_id || ""}
                    onChange={handleModalFormChange}
                  >
                    <option value="">-- Select a Technology --</option>
                    {technologies.map(tech => (
                      <option key={tech.tech_id} value={tech.tech_id}>
                        {tech.name} (ID: {tech.tech_id})
                      </option>
                    ))}
                  </select>
                  
                  <div className="form-buttons">
                    <button className="save-btn" onClick={handleSavePublication}>
                      {hubModal.mode === 'add' ? "Save and Continue" : "Save Changes"}
                    </button>
                  </div>
                </div>
              )}

              {/* --- Authors Tab --- */}
              {modalActiveTab === 'authors' && (
                <div className="modal-tab-content">
                  <h4>Link Authors</h4>
                  <p>
                    Select employees to link as authors for this publication.
                  </p>
                  
                  {/* You would also show a list of *current* authors here */}
                  {/* <div className="current-team-list"> ... </div> */}

                  <div className="link-modal-section">
                    <b>Role for new author(s):</b>
                    <input
                      type="text"
                      value={authorRole}
                      onChange={(e) => setAuthorRole(e.g.target.value)}
                      placeholder="E.g., Lead Author, Co-Author"
                    />
                  </div>
                  
                  <div className="link-modal-section">
                    <b>Available Employees:</b>
                    <input
                      type="text"
                      placeholder="Search employees..."
                      value={authorSearch}
                      onChange={(e) => setAuthorSearch(e.target.value)}
                    />
                    <div className="searchable-table" style={{ maxHeight: "200px" }}>
                      <table>
                        <thead><tr><th>Select</th><th>ID</th><th>Name</th><th>Dept</th></tr></thead>
                        <tbody>
                          {filteredEmployeesForModal.map(emp => (
                            <tr key={emp.employee_id}>
                              <td>
                                <input
                                  type="checkbox"
                                  checked={selectedAuthors.includes(emp.employee_id)}
                                  onChange={(e) => {
                                    const id = emp.employee_id;
                                    setSelectedAuthors(prev =>
                                      e.target.checked ? [...prev, id] : prev.filter(i => i !== id)
                                    );
                                  }}
                                />
                              </td>
                              <td>{emp.employee_id}</td><td>{emp.name}</td><td>{emp.department}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="form-buttons">
                    <button className="save-btn" onClick={handleLinkAuthors}>
                      💾 Link Selected Authors
                    </button>
                  </div>
                </div>
              )}

              {/* --- Linked Tech Tab --- */}
              {modalActiveTab === 'tech' && (
                <div className="modal-tab-content">
                  <h4>Linked Technology Details</h4>
                  {hubModal.relatedData.tech ? (
                    <div>
                      <h3>{hubModal.relatedData.tech.name}</h3>
                      <p><b>Category:</b> {hubModal.relatedData.tech.category}</p>
                      <p><b>Status:</b> {hubModal.relatedData.tech.status}</p>
                      <p><b>TRL:</b> {hubModal.relatedData.tech.trl_achieved}</p>
                    </div>
                  ) : (
                    <p>No technology linked or details not found.</p>
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