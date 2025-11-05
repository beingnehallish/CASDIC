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
import "../../styles/employee.projects.css"; // We will create this new CSS file

export default function CompaniesPage() {
  const token = localStorage.getItem("token");

  // Main Data
  const [companies, setCompanies] = useState([]);
  const [projectsList, setProjectsList] = useState([]); // For linking

  // Graph Data
  const [typeData, setTypeData] = useState([]);
  const [countryData, setCountryData] = useState([]);
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"];

  // Filters
  const [filters, setFilters] = useState({ type: "", country: "", keyword: "" });

  // Hub Modal State
  const [hubModal, setHubModal] = useState({
    show: false,
    mode: 'add',
    companyData: {},
    relatedData: { collaborations: [] }
  });
  const [modalActiveTab, setModalActiveTab] = useState('overview');

  // Collaborations Tab State
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [collabRole, setCollabRole] = useState("");
  const [projectSearch, setProjectSearch] = useState("");

  // --- Data Fetching ---

  const fetchCompanies = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/companies", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCompanies(res.data);
      processGraphData(res.data);
    } catch (err) {
      console.error("Failed to fetch companies:", err);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/projects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjectsList(res.data);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    }
  };

  useEffect(() => {
    fetchCompanies();
    fetchProjects(); // Fetch projects for the linking tab
  }, [token]);

  // --- Graph Data Processing ---
  const processGraphData = (data) => {
    // 1. By Type
    const types = ["Private", "Government", "Academic", "NGO", "Startup"];
    const typeCounts = types.map((t) => ({
      name: t,
      value: data.filter((c) => c.type === t).length,
    }));
    setTypeData(typeCounts.filter(t => t.value > 0));

    // 2. By Country
    const countryCounts = data.reduce((acc, c) => {
      const country = c.country || "Unknown";
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {});
    setCountryData(
      Object.entries(countryCounts).map(([name, count]) => ({ name, count }))
    );
  };

  // --- Modal Logic ---

  const resetHubModal = () => {
    setHubModal({
      show: false,
      mode: 'add',
      companyData: {},
      relatedData: { collaborations: [] }
    });
    setModalActiveTab('overview');
    setSelectedProjects([]);
    setCollabRole("");
    setProjectSearch("");
  };

  const handleOpenAddModal = () => {
    resetHubModal();
    setHubModal(prev => ({
      ...prev,
      show: true,
      mode: 'add',
      companyData: {
        name: "",
        country: "",
        type: "Private",
        role: "",
        contact_person: "",
        contact_email: "",
        contact_phone: "",
        website: "",
        address: "",
        notes: "",
      }
    }));
  };

  const handleOpenManageModal = async (company) => {
    resetHubModal();
    setHubModal(prev => ({
      ...prev,
      show: true,
      mode: 'edit',
      companyData: company
    }));

    // Fetch this company's collaborations
    try {
      const res = await axios.get(
        `http://localhost:5000/api/company/${company.company_id}/collaborations`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHubModal(prev => ({
        ...prev,
        relatedData: { collaborations: res.data }
      }));
    } catch (err) {
      console.error("Failed to fetch collaborations:", err);
    }
  };

  const handleModalFormChange = (e) => {
    const { name, value } = e.target;
    setHubModal(prev => ({
      ...prev,
      companyData: {
        ...prev.companyData,
        [name]: value
      }
    }));
  };

  const handleSaveCompany = async () => {
    const { mode, companyData } = hubModal;
    const confirmed = window.confirm(mode === 'add' ? "Add new company?" : "Update this company?");
    if (!confirmed) return;

    try {
      if (mode === 'add') {
        const res = await axios.post("http://localhost:5000/api/companies", companyData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Switch to edit mode
        setHubModal(prev => ({
          ...prev,
          mode: 'edit',
          companyData: { ...prev.companyData, company_id: res.data.company_id }
        }));
        setModalActiveTab('collaborations');
        alert("Company added. You can now add collaborations.");
      } else {
        await axios.put(`http://localhost:5000/api/companies/${companyData.company_id}`, companyData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Company updated.");
      }
      fetchCompanies(); // Refresh main list
    } catch (err) {
      console.error(err);
      alert("Failed to save company.");
    }
  };

  // --- Delete Company ---
  const handleDeleteCompany = async (companyId) => {
    if (!window.confirm("Are you sure you want to delete this company?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/companies/${companyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Company deleted.");
      fetchCompanies();
    } catch (err) {
      console.error(err);
      alert("Failed to delete company. It may be linked to projects.");
    }
  };

  // --- Collaboration Tab Logic ---
  const handleLinkProjects = async () => {
    const { company_id } = hubModal.companyData;
    if (selectedProjects.length === 0) {
      alert("Please select at least one project to link.");
      return;
    }

    try {
      const linkPromises = selectedProjects.map(projId =>
        axios.post(
          "http://localhost:5000/api/project_companies",
          {
            project_id: projId,
            company_id: company_id,
            role_in_project: collabRole || "Collaborator",
          },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      );
      await Promise.all(linkPromises);
      alert(`Successfully linked ${selectedProjects.length} projects.`);
      
      // Refresh collaboration list
      const res = await axios.get(
        `http://localhost:5000/api/company/${company_id}/collaborations`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHubModal(prev => ({
        ...prev,
        relatedData: { collaborations: res.data }
      }));
      
      // Clear selections
      setSelectedProjects([]);
      setCollabRole("");
      setProjectSearch("");

    } catch (err) {
      console.error("Failed to link projects:", err);
      alert("Failed to link projects.");
    }
  };

  const filteredProjectsForModal = projectsList.filter(p => 
    p.name.toLowerCase().includes(projectSearch.toLowerCase())
  );

  // Filtered Companies for main table
  const filteredCompanies = companies.filter((c) => {
    const kw = filters.keyword.toLowerCase();
    return (
      (!filters.type || c.type === filters.type) &&
      (!filters.country || c.country.toLowerCase().includes(filters.country.toLowerCase())) &&
      (!filters.keyword || c.name.toLowerCase().includes(kw) || (c.role || "").toLowerCase().includes(kw))
    );
  });


  // --- Render ---

  return (
    <div className="empsection">
      <div className="tech-table-actions">
        <button className="add-btn" onClick={handleOpenAddModal}>
          ➕ Add Company
        </button>
      </div>
      
      <div className="empsection-header">
        <h2>Companies</h2>
        <p>Total Companies: {companies.length}</p>
      </div>

      {/* ===== Graphs Section ===== */}
      <div className="tech-graphs">
        <div className="graph-card">
          <h3>Companies by Type</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={typeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {typeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="graph-card">
          <h3>Companies by Country</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={countryData} layout="vertical" margin={{ left: 25 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis dataKey="name" type="category" width={80} />
              <Tooltip />
              <Bar dataKey="count" fill="#2980b9" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ---------- Filters ---------- */}
      <div className="filters-panel">
        <input
          type="text"
          placeholder="🔎 Search by name or role..."
          value={filters.keyword}
          onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
        />
        <select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
        >
          <option value="">All Types</option>
          <option value="Private">Private</option>
          <option value="Government">Government</option>
          <option value="Academic">Academic</option>
          <option value="NGO">NGO</option>
          <option value="Startup">Startup</option>
        </select>
        <input
          type="text"
          placeholder="Filter by country"
          value={filters.country}
          onChange={(e) => setFilters({ ...filters, country: e.target.value })}
        />
      </div>

      {/* ---------- Companies Table ---------- */}
      <div className="reports-results">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Type</th>
              <th>Country</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCompanies.map((c) => (
              <tr key={c.company_id}>
                <td>{c.company_id}</td>
                <td>{c.name}</td>
                <td>{c.type}</td>
                <td>{c.country}</td>
                <td>{c.role}</td>
                <td>
                  <div className="action-buttons-wrapper">
                    <button className="edit-btn" onClick={() => handleOpenManageModal(c)}>
                      ✎ Manage
                    </button>
                    <button className="delete-btn" onClick={() => handleDeleteCompany(c.company_id)}>
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---------- Manage Hub Modal ---------- */}
      {hubModal.show && (
        <div className="modal-overlay" onClick={resetHubModal}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={resetHubModal}>✖</button>
            <h2>{hubModal.mode === 'add' ? "Add New Company" : `Manage: ${hubModal.companyData.name}`}</h2>

            <div className="modal-tabs">
              <button
                className={`tab-btn ${modalActiveTab === 'overview' ? 'active' : ''}`}
                onClick={() => setModalActiveTab('overview')}
              >
                Overview
              </button>
              <button
                className={`tab-btn ${modalActiveTab === 'collaborations' ? 'active' : ''}`}
                onClick={() => setModalActiveTab('collaborations')}
                disabled={hubModal.mode === 'add'}
              >
                Collaborations
              </button>
            </div>

            <div className="modal-tab-panel">
              {/* --- Overview Tab (Add/Edit Form) --- */}
              {modalActiveTab === 'overview' && (
                <div className="modal-tab-content vertical-form">
                  <label>Company Name</label>
                  <input name="name" placeholder="Name" value={hubModal.companyData.name || ""} onChange={handleModalFormChange} />
                  <label>Country</label>
                  <input name="country" placeholder="Country" value={hubModal.companyData.country || ""} onChange={handleModalFormChange} />
                  <label>Company Type</label>
                  <select name="type" value={hubModal.companyData.type || "Private"} onChange={handleModalFormChange}>
                    <option value="Private">Private</option>
                    <option value="Government">Government</option>
                    <option value="Academic">Academic</option>
                    <option value="NGO">NGO</option>
                    <option value="Startup">Startup</option>
                  </select>
                  <label>Role</label>
                  <input name="role" placeholder="Role (e.g. Partner, Vendor)" value={hubModal.companyData.role || ""} onChange={handleModalFormChange} />
                  <label>Contact Person</label>
                  <input name="contact_person" placeholder="Contact Person" value={hubModal.companyData.contact_person || ""} onChange={handleModalFormChange} />
                  <label>Contact Email</label>
                  <input name="contact_email" placeholder="Contact Email" value={hubModal.companyData.contact_email || ""} onChange={handleModalFormChange} />
                  <label>Contact Phone</label>
                  <input name="contact_phone" placeholder="Contact Phone" value={hubModal.companyData.contact_phone || ""} onChange={handleModalFormChange} />
                  <label>Website</label>
                  <input name="website" placeholder="Website" value={hubModal.companyData.website || ""} onChange={handleModalFormChange} />
                  <label>Address</label>
                  <textarea name="address" placeholder="Address" value={hubModal.companyData.address || ""} onChange={handleModalFormChange} />
                  <label>Notes</label>
                  <textarea name="notes" placeholder="Notes" value={hubModal.companyData.notes || ""} onChange={handleModalFormChange} />
                  
                  <div className="form-buttons">
                    <button className="save-btn" onClick={handleSaveCompany}>
                      {hubModal.mode === 'add' ? "Save and Continue" : "Save Changes"}
                    </button>
                  </div>
                </div>
              )}

              {/* --- Collaborations Tab --- */}
              {modalActiveTab === 'collaborations' && (
                <div className="modal-tab-content">
                  {/* --- 1. List Current Collaborations --- */}
                  <h4>Current Collaborations</h4>
                  <div className="searchable-table" style={{ maxHeight: "150px", marginBottom: "1rem" }}>
                    <table>
                      <thead><tr><th>Project Name</th><th>Role</th></tr></thead>
                      <tbody>
                        {hubModal.relatedData.collaborations.length > 0 ? (
                          hubModal.relatedData.collaborations.map(collab => (
                            <tr key={collab.project_id}>
                              <td>{collab.project_name}</td>
                              <td>{collab.role_in_project}</td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan="2" style={{textAlign: "center"}}>No collaborations found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* --- 2. Add New Collaboration --- */}
                  <h4 style={{borderTop: "1px solid #eee", paddingTop: "1rem"}}>Link to New Project</h4>
                  <div className="link-modal-section">
                    <b>Role in project:</b>
                    <input
                      type="text"
                      value={collabRole}
                      onChange={(e) => setCollabRole(e.target.value)}
                      placeholder="E.g., Partner, Supplier, Consultant"
                    />
                  </div>
                  <div className="link-modal-section">
                    <b>Available Projects:</b>
                    <input
                      type="text"
                      placeholder="Search projects..."
                      value={projectSearch}
                      onChange={(e) => setProjectSearch(e.target.value)}
                    />
                    <div className="searchable-table" style={{ maxHeight: "150px" }}>
                      <table>
                        <thead><tr><th>Select</th><th>ID</th><th>Name</th></tr></thead>
                        <tbody>
                          {filteredProjectsForModal.map(p => (
                            <tr key={p.project_id}>
                              <td>
                                <input
                                  type="checkbox"
                                  checked={selectedProjects.includes(p.project_id)}
                                  onChange={(e) => {
                                    const id = p.project_id;
                                    setSelectedProjects(prev =>
                                      e.target.checked ? [...prev, id] : prev.filter(i => i !== id)
                                    );
                                  }}
                                />
                              </td>
                              <td>{p.project_id}</td>
                              <td>{p.name}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="form-buttons">
                    <button className="save-btn" onClick={handleLinkProjects}>
                      💾 Link Selected Projects
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}