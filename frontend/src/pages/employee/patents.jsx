import { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/employee.projects.css"; // Re-uses the same CSS as projects
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

// This is the "Link Employee to Patent" modal, now as a separate component
const LinkEmployeeModal = ({ show, onClose, patents, employees, token }) => {
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedPatent, setSelectedPatent] = useState(null);
  const [role, setRole] = useState("");
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [patentSearch, setPatentSearch] = useState("");

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(employeeSearch.toLowerCase())
  );
  
  const filteredPatents = patents.filter(p => 
    p.title.toLowerCase().includes(patentSearch.toLowerCase())
  );

  const handleSave = async () => {
    try {
      if (selectedEmployees.length === 0 || !selectedPatent) {
        alert("Select at least one employee and one patent");
        return;
      }
      await Promise.all(
        selectedEmployees.map(empId =>
          axios.post(
            "http://localhost:5000/api/employee_patents",
            { employee_id: empId, patent_id: selectedPatent, role: role },
            { headers: { Authorization: `Bearer ${token}` } }
          )
        )
      );
      alert("Employees linked to patent successfully!");
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to link employees to patent");
    }
  };

  if (!show) return null;

  return (
    <div className="modal-overlay link-modal-overlay" onClick={onClose}>
      <div className="modal-content large link-modal-layout" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✖</button>
        <h2>Link Employees to Patent</h2>

        {/* Role */}
        <div className="link-modal-section"> 
          <b>Role (e.g., Inventor):</b>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Lead Inventor / Co-Inventor"
          />
        </div>

        {/* Patent Selection */}
        <div className="link-modal-section">
          <b>Select Patent:</b>
          <input
            type="text"
            placeholder="Search patents..."
            value={patentSearch}
            onChange={(e) => setPatentSearch(e.target.value)}
          />
          <div className="searchable-table" style={{ maxHeight: "150px" }}>
            <table>
              <thead><tr><th>Select</th><th>ID</th><th>Title</th></tr></thead>
              <tbody>
                {filteredPatents.map(p => (
                  <tr key={p.patent_id}>
                    <td>
                      <input
                        type="radio"
                        name="selectedPatent"
                        checked={selectedPatent === p.patent_id}
                        onChange={() => setSelectedPatent(p.patent_id)}
                      />
                    </td>
                    <td>{p.patent_id}</td><td>{p.title}</td>
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
export default function PatentsPage() {
  const token = localStorage.getItem("token");

  // Main Data
  const [patents, setPatents] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [technologies, setTechnologies] = useState([]);

  // Graph Data
  const [filedYearData, setFiledYearData] = useState([]);
  const [grantedYearData, setGrantedYearData] = useState([]);

  // Filters
  const [filters, setFilters] = useState({
    keyword: "",
    tech_id: "",
    yearFiled: "",
    yearGranted: "",
  });

  // Hub Modal State
  const [hubModal, setHubModal] = useState({
    show: false,
    mode: 'add',
    patentData: {},
    relatedData: { inventors: [], tech: null }
  });
  const [modalActiveTab, setModalActiveTab] = useState('overview');
  
  // Inventors Tab State
  const [inventorSearch, setInventorSearch] = useState("");
  const [selectedInventors, setSelectedInventors] = useState([]);
  const [inventorRole, setInventorRole] = useState("");
  
  // Link Employee Modal State
  const [showLinkModal, setShowLinkModal] = useState(false);

  // --- Data Fetching ---

  const fetchPatents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/patents", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const formatted = res.data.map(p => ({
        ...p,
        date_filed: p.date_filed ? p.date_filed.split("T")[0] : null,
        date_granted: p.date_granted ? p.date_granted.split("T")[0] : null,
      }));
      setPatents(formatted);
      processGraphData(formatted); // Process graph data after fetching
    } catch (err)
 {
      console.error("Error fetching patents:", err);
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
    
    fetchPatents();
    fetchPageData();
  }, [token]);

  // --- Graph Data Processing ---
  const processGraphData = (patentData) => {
    const filedCounts = {};
    const grantedCounts = {};
    
    patentData.forEach(p => {
      if (p.date_filed) {
        const year = p.date_filed.split("-")[0];
        filedCounts[year] = (filedCounts[year] || 0) + 1;
      }
      if (p.date_granted) {
        const year = p.date_granted.split("-")[0];
        grantedCounts[year] = (grantedCounts[year] || 0) + 1;
      }
    });
    
    setFiledYearData(Object.entries(filedCounts).map(([year, count]) => ({ year, count })));
    setGrantedYearData(Object.entries(grantedCounts).map(([year, count]) => ({ year, count })));
  };

  // --- Modal Logic ---

  const resetHubModal = () => {
    setHubModal({
      show: false,
      mode: 'add',
      patentData: {},
      relatedData: { inventors: [], tech: null }
    });
    setModalActiveTab('overview');
    setInventorSearch("");
    setSelectedInventors([]);
    setInventorRole("");
  };

  const handleOpenAddModal = () => {
    resetHubModal();
    setHubModal(prev => ({
      ...prev,
      show: true,
      mode: 'add',
      patentData: {
        title: "",
        patent_number: "",
        date_filed: "",
        date_granted: null,
        tech_id: ""
      }
    }));
  };

  const handleOpenManageModal = async (patent) => {
    resetHubModal();
    setHubModal(prev => ({
      ...prev,
      show: true,
      mode: 'edit',
      patentData: patent
    }));

    // Fetch related tech and inventors
    try {
      if (patent.tech_id) {
        const techRes = await axios.get(
          `http://localhost:5000/api/projects/technologies/${patent.tech_id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setHubModal(prev => ({
          ...prev,
          relatedData: { ...prev.relatedData, tech: techRes.data }
        }));
      }
      // You would also fetch linked inventors here, e.g.:
      // const inventorsRes = await axios.get(`/api/patents/${patent.patent_id}/inventors`, ...);
      // setHubModal(prev => ({ ...prev, relatedData: { ...prev.relatedData, inventors: inventorsRes.data } }));
    } catch (err) {
      console.error("Failed to fetch related patent data", err);
    }
  };

  const handleModalFormChange = (e) => {
    const { name, value } = e.target;
    setHubModal(prev => ({
      ...prev,
      patentData: {
        ...prev.patentData,
        [name]: value === "" ? null : value
      }
    }));
  };

  const handleSavePatent = async () => {
    const { mode, patentData } = hubModal;
    const confirmed = window.confirm(mode === 'add' ? "Add new patent?" : "Update this patent?");
    if (!confirmed) return;

    // Basic validation
    if (!patentData.title || !patentData.patent_number || !patentData.tech_id) {
      alert("Please fill in Title, Patent Number, and select a Technology.");
      return;
    }

    try {
      if (mode === 'add') {
        const res = await axios.post("http://localhost:5000/api/patents", patentData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Switch to edit mode
        setHubModal(prev => ({
          ...prev,
          mode: 'edit',
          patentData: { ...prev.patentData, patent_id: res.data.patent_id }
        }));
        setModalActiveTab('inventors');
        alert("Patent added. You can now add inventors.");
      } else {
        await axios.put(`http://localhost:5000/api/patents/${patentData.patent_id}`, patentData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Patent updated.");
      }
      fetchPatents(); // Refresh main list
    } catch (err) {
      console.error(err);
      alert("Failed to save patent.");
    }
  };

  // --- Delete Patent ---
  const handleDeletePatent = async (patentId) => {
    if (!window.confirm("Are you sure you want to delete this patent?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/patents/${patentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Patent deleted.");
      fetchPatents();
    } catch (err) {
      console.error(err);
      alert("Failed to delete patent. It may be linked to employees.");
    }
  };

  // --- Inventors Tab Logic ---
  const handleLinkInventors = async () => {
    const { patent_id } = hubModal.patentData;
    if (selectedInventors.length === 0) {
      alert("Please select at least one employee.");
      return;
    }

    try {
      const linkPromises = selectedInventors.map(empId => 
        axios.post(
          "http://localhost:5000/api/employee_patents",
          { employee_id: empId, patent_id: patent_id, role: inventorRole || "Inventor" },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      );
      await Promise.all(linkPromises);
      alert(`Successfully linked ${selectedInventors.length} inventors.`);
      
      setSelectedInventors([]);
      setInventorRole("");
      // You would refresh the inventors list here
      // await fetchInventors(patent_id);

    } catch (err) {
      console.error(err);
      alert("Failed to link inventors.");
    }
  };

  const filteredEmployeesForModal = employees.filter(emp => 
    emp.name.toLowerCase().includes(inventorSearch.toLowerCase())
  );

  // --- Filtering for main table ---
  const filteredPatents = patents.filter(p => {
    const kw = (filters.keyword || "").toLowerCase();
    return (
      (!filters.tech_id || p.tech_id === Number(filters.tech_id)) &&
      (!filters.yearFiled || (p.date_filed?.split("-")[0] === filters.yearFiled)) &&
      (!filters.yearGranted || (p.date_granted?.split("-")[0] === filters.yearGranted)) &&
      ((p.title || "").toLowerCase().includes(kw) ||
        (p.patent_number || "").toLowerCase().includes(kw))
    );
  });

  // --- Render ---

  return (
    <div className="empsection">
      <div className="tech-table-actions">
        <button className="add-btn" onClick={handleOpenAddModal}>
          ➕ Add Patent
        </button>
        <button
          className="add-btn"
          onClick={() => setShowLinkModal(true)}
        >
          🔗 Link Employee to Patent
        </button>
      </div>

      <div className="empsection-header">
        <h2>Patents</h2>
        <p>Total Patents: {patents.length}</p>
      </div>

      {/* ===== Graph Section (Now 2 Graphs) ===== */}
      <div className="tech-graphs">
        <div className="graph-card">
          <h3>Patents by Year Filed</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={filedYearData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#2980b9" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="graph-card">
          <h3>Patents by Year Granted</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={grantedYearData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#27ae60" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ===== Filters ===== */}
      <div className="filters-panel">
        <input
          type="text"
          placeholder="🔎 Search patents..."
          value={filters.keyword}
          onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
        />
        <input
          type="number"
          placeholder="Tech ID"
          value={filters.tech_id}
          onChange={(e) => setFilters({ ...filters, tech_id: e.target.value })}
        />
        <input
          type="number"
          placeholder="Year Filed"
          value={filters.yearFiled}
          onChange={(e) => setFilters({ ...filters, yearFiled: e.target.value })}
        />
        <input
          type="number"
          placeholder="Year Granted"
          value={filters.yearGranted}
          onChange={(e) => setFilters({ ...filters, yearGranted: e.target.value })}
        />
        <button className="reset-btn" onClick={() => setFilters({ keyword: "", tech_id: "", yearFiled: "", yearGranted: "" })}>
          Reset
        </button>
      </div>

      {/* ===== Patents Table ===== */}
      <div className="reports-results">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Patent Number</th>
              <th>Tech ID</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatents.map(p => (
              <tr key={p.patent_id}>
                <td>{p.patent_id}</td>
                <td>{p.title}</td>
                <td>{p.patent_number}</td>
                <td>{p.tech_id}</td>
                <td>
                  <div className="action-buttons-wrapper">
                    <button
                      className="edit-btn"
                      onClick={() => handleOpenManageModal(p)}
                    >
                      ✎ Manage
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeletePatent(p.patent_id)}
                    >
                      🗑️
                    </button>
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
        patents={patents}
        employees={employees}
        token={token}
      />

      {/* ===== Manage Hub Modal ===== */}
      {hubModal.show && (
        <div className="modal-overlay" onClick={resetHubModal}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={resetHubModal}>✖</button>
            <h2>{hubModal.mode === 'add' ? "Add New Patent" : `Manage: ${hubModal.patentData.title}`}</h2>

            <div className="modal-tabs">
              <button
                className={`tab-btn ${modalActiveTab === 'overview' ? 'active' : ''}`}
                onClick={() => setModalActiveTab('overview')}
              >
                Overview
              </button>
              <button
                className={`tab-btn ${modalActiveTab === 'inventors' ? 'active' : ''}`}
                onClick={() => setModalActiveTab('inventors')}
                disabled={hubModal.mode === 'add'}
              >
                Inventors
              </button>
              <button
                className={`tab-btn ${modalActiveTab === 'tech' ? 'active' : ''}`}
                onClick={() => setModalActiveTab('tech')}
                disabled={hubModal.mode === 'add' || !hubModal.patentData.tech_id}
              >
                Linked Tech
              </button>
            </div>

            <div className="modal-tab-panel">
              {/* --- Overview Tab (Add/Edit Form) --- */}
              {modalActiveTab === 'overview' && (
                <div className="modal-tab-content vertical-form">
                  <label>Patent Title</label>
                  <input name="title" placeholder="Title" value={hubModal.patentData.title || ""} onChange={handleModalFormChange} />
                  <label>Patent Number</label>
                  <input name="patent_number" placeholder="Patent Number" value={hubModal.patentData.patent_number || ""} onChange={handleModalFormChange} />
                  <label>Date Filed</label>
                  <input name="date_filed" type="date" value={hubModal.patentData.date_filed || ""} onChange={handleModalFormChange} />
                  <label>Date Granted (optional)</label>
                  <input name="date_granted" type="date" value={hubModal.patentData.date_granted || ""} onChange={handleModalFormChange} />
                  <label>Linked Technology</label>
                  <select
                    name="tech_id"
                    value={hubModal.patentData.tech_id || ""}
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
                    <button className="save-btn" onClick={handleSavePatent}>
                      {hubModal.mode === 'add' ? "Save and Continue" : "Save Changes"}
                    </button>
                  </div>
                </div>
              )}

              {/* --- Inventors Tab --- */}
              {modalActiveTab === 'inventors' && (
                <div className="modal-tab-content">
                  <h4>Link Inventors</h4>
                  <p>
                    Select employees to link as inventors for this patent.
                  </p>
                  
                  {/* You would also show a list of *current* inventors here */}
                  {/* <div className="current-team-list"> ... </div> */}

                  <div className="link-modal-section">
                    <b>Role for new inventor(s):</b>
                    <input
                      type="text"
                      value={inventorRole}
                      onChange={(e) => setInventorRole(e.target.value)}
                      placeholder="E.g., Lead Inventor, Co-Inventor"
                    />
                  </div>
                  
                  <div className="link-modal-section">
                    <b>Available Employees:</b>
                    <input
                      type="text"
                      placeholder="Search employees..."
                      value={inventorSearch}
                      onChange={(e) => setInventorSearch(e.target.value)}
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
                                  checked={selectedInventors.includes(emp.employee_id)}
                                  onChange={(e) => {
                                    const id = emp.employee_id;
                                    setSelectedInventors(prev =>
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
                    <button className="save-btn" onClick={handleLinkInventors}>
                      💾 Link Selected Inventors
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