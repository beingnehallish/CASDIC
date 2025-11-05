import { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/employee.projects.css"; // Re-uses the same CSS
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

export default function EmployeesPage() {
  const token = localStorage.getItem("token");
  const [employees, setEmployees] = useState([]);
  
  // Graph State
  const [deptData, setDeptData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

  // Filter State
  const [filters, setFilters] = useState({ keyword: "", department: "", status: "" });
  
  // Hub Modal State
  const [hubModal, setHubModal] = useState({
    show: false,
    mode: 'add',
    employeeData: {},
    relatedData: { projects: [], patents: [], publications: [] },
    newProfilePic: null, // For file upload
    picPreview: null // For file preview
  });
  const [modalActiveTab, setModalActiveTab] = useState('overview');

  // --- Data Fetching ---

  const fetchEmployees = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/employees", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const formatted = res.data.map(emp => ({
        ...emp,
        profile_pic: emp.profile_pic ? emp.profile_pic : null,
      }));
      setEmployees(formatted);
      processGraphData(formatted); // Process graph data
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [token]);

  // --- Graph Data Processing ---
  const processGraphData = (data) => {
    // 1. By Department
    const deptCounts = data.reduce((acc, e) => {
      const dept = e.department || "Unknown";
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {});
    setDeptData(
      Object.entries(deptCounts).map(([name, count]) => ({ name, count }))
    );
    
    // 2. By Status
    const statusCounts = data.reduce((acc, e) => {
      acc[e.status] = (acc[e.status] || 0) + 1;
      return acc;
    }, {});
    setStatusData(
      Object.entries(statusCounts).map(([name, value]) => ({ name, value }))
    );
  };

  // --- Modal Logic ---

  const resetHubModal = () => {
    setHubModal({
      show: false,
      mode: 'add',
      employeeData: {},
      relatedData: { projects: [], patents: [], publications: [] },
      newProfilePic: null,
      picPreview: null
    });
    setModalActiveTab('overview');
  };

  const handleOpenAddModal = () => {
    resetHubModal();
    setHubModal(prev => ({
      ...prev,
      show: true,
      mode: 'add',
      employeeData: { name: "", designation: "", department: "", email: "", phone: "", status: "Active" }
    }));
  };

  const handleOpenManageModal = async (emp) => {
    resetHubModal();
    setHubModal(prev => ({
      ...prev,
      show: true,
      mode: 'edit',
      employeeData: emp,
      // Set preview from existing pic
      picPreview: emp.profile_pic ? `data:image/jpeg;base64,${emp.profile_pic}` : null
    }));

    // Fetch contributions
    try {
      const res = await axios.get(`http://localhost:5000/api/employees/${emp.employee_id}/contributions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHubModal(prev => ({
        ...prev,
        relatedData: res.data
      }));
    } catch (err) {
      console.error("Failed to fetch contributions", err);
    }
  };

  const handleModalFormChange = (e) => {
    const { name, value } = e.target;
    setHubModal(prev => ({
      ...prev,
      employeeData: {
        ...prev.employeeData,
        [name]: value
      }
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setHubModal(prev => ({
        ...prev,
        newProfilePic: file,
        picPreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleSaveEmployee = async () => {
    const { mode, employeeData, newProfilePic } = hubModal;
    const confirmed = window.confirm(mode === 'add' ? "Add new employee?" : "Update this employee?");
    if (!confirmed) return;

    const formData = new FormData();
    formData.append("name", employeeData.name);
    formData.append("designation", employeeData.designation);
    formData.append("department", employeeData.department);
    formData.append("email", employeeData.email);
    formData.append("phone", employeeData.phone);
    formData.append("status", employeeData.status);
    if (newProfilePic) {
      formData.append("profile_pic", newProfilePic);
    }

    try {
      if (mode === 'add') {
        const res = await axios.post("http://localhost:5000/api/employees", formData, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        });
        // Switch to edit mode
        setHubModal(prev => ({
          ...prev,
          mode: 'edit',
          employeeData: { ...prev.employeeData, employee_id: res.data.employee_id }
        }));
        setModalActiveTab('projects'); // Go to next tab
        alert("Employee added. You can now view their contributions (link them from other pages).");
      } else {
        await axios.put(`http://localhost:5000/api/employees/${employeeData.employee_id}`, formData, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        });
        alert("Employee updated.");
      }
      fetchEmployees(); // Refresh main list
    } catch (err) {
      console.error(err);
      alert("Failed to save employee.");
    }
  };

  // --- Delete Employee ---
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this employee?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/employees/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchEmployees();
    } catch (err) {
      console.error(err);
      alert("Failed to delete employee. They may be linked to projects or patents.");
    }
  };

  const filteredEmployees = employees.filter((e) => {
    const kw = filters.keyword.toLowerCase();
    return (
      (!filters.department || (e.department || "").toLowerCase().includes(filters.department.toLowerCase())) &&
      (!filters.status || e.status === filters.status) &&
      (e.name.toLowerCase().includes(kw) || e.email.toLowerCase().includes(kw) || (e.designation || "").toLowerCase().includes(kw))
    );
  });

  // --- Render ---

  return (
    <div className="empsection">
      <div className="tech-table-actions">
        <button className="add-btn" onClick={handleOpenAddModal}>
          ➕ Add Employee
        </button>
      </div>

      <div className="empsection-header">
        <h2>Employees</h2>
        <p>Total Employees: {employees.length}</p>
      </div>

      {/* ===== Graphs Section ===== */}
      <div className="tech-graphs">
        <div className="graph-card">
          <h3>Employees by Department</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={deptData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#2980b9" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="graph-card">
          <h3>Employees by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="45%"
                labelLine={false}
                label={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [value, name]} />
              <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: "10px" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ===== Filters ===== */}
      <div className="filters-panel">
        <input type="text" placeholder="🔎 Search by name/email..." value={filters.keyword} onChange={(e) => setFilters({ ...filters, keyword: e.target.value })} />
        <input type="text" placeholder="Department" value={filters.department} onChange={(e) => setFilters({ ...filters, department: e.target.value })} />
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="On Leave">On Leave</option>
          <option value="Retired">Retired</option>
        </select>
        <button className="reset-btn" onClick={() => setFilters({ keyword: "", department: "", status: "" })}>
          Reset
        </button>
      </div>

      {/* ===== Employees Table ===== */}
      <div className="reports-results">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Photo</th>
              <th>Name</th>
              <th>Designation</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((emp) => (
              <tr key={emp.employee_id}>
                <td>{emp.employee_id}</td>
                <td>
                  {emp.profile_pic ? (
                    <img src={`data:image/jpeg;base64,${emp.profile_pic}`} alt="Profile" width="40" height="40" style={{ borderRadius: "50%", objectFit: "cover" }} />
                  ) : (
                    <div style={{width: 40, height: 40, borderRadius: "50%", background: "#eee", textAlign: "center", lineHeight: "40px", fontWeight: "bold"}}>
                      {emp.name[0]}
                    </div>
                  )}
                </td>
                <td>{emp.name}</td>
                <td>{emp.designation}</td>
                <td>
                  <span style={{ 
                    color: emp.status === "Active" ? "green" : emp.status === "On Leave" ? "orange" : "gray", 
                    fontWeight: "bold" 
                  }}>
                    {emp.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons-wrapper">
                    <button className="edit-btn" onClick={() => handleOpenManageModal(emp)}>✎ Manage</button>
                    <button className="delete-btn" onClick={() => handleDelete(emp.employee_id)}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== Manage Hub Modal ===== */}
      {hubModal.show && (
        <div className="modal-overlay" onClick={resetHubModal}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={resetHubModal}>✖</button>
            <h2>{hubModal.mode === 'add' ? "Add New Employee" : `Manage: ${hubModal.employeeData.name}`}</h2>

            <div className="modal-tabs">
              <button
                className={`tab-btn ${modalActiveTab === 'overview' ? 'active' : ''}`}
                onClick={() => setModalActiveTab('overview')}
              >
                Overview
              </button>
              <button
                className={`tab-btn ${modalActiveTab === 'projects' ? 'active' : ''}`}
                onClick={() => setModalActiveTab('projects')}
                disabled={hubModal.mode === 'add'}
              >
                Projects
              </button>
              <button
                className={`tab-btn ${modalActiveTab === 'patents' ? 'active' : ''}`}
                onClick={() => setModalActiveTab('patents')}
                disabled={hubModal.mode === 'add'}
              >
                Patents
              </button>
              <button
                className={`tab-btn ${modalActiveTab === 'publications' ? 'active' : ''}`}
                onClick={() => setModalActiveTab('publications')}
                disabled={hubModal.mode === 'add'}
              >
                Publications
              </button>
            </div>

            <div className="modal-tab-panel">
              {/* --- Overview Tab (Add/Edit Form) --- */}
              {modalActiveTab === 'overview' && (
                <div className="modal-tab-content vertical-form">
                  <label>Name</label>
                  <input name="name" placeholder="Full Name" value={hubModal.employeeData.name || ""} onChange={handleModalFormChange} />
                  <label>Designation</label>
                  <input name="designation" placeholder="Designation" value={hubModal.employeeData.designation || ""} onChange={handleModalFormChange} />
                  <label>Department</label>
                  <input name="department" placeholder="Department" value={hubModal.employeeData.department || ""} onChange={handleModalFormChange} />
                  <label>Email</label>
                  <input name="email" type="email" placeholder="Email" value={hubModal.employeeData.email || ""} onChange={handleModalFormChange} />
                  <label>Phone</label>
                  <input name="phone" placeholder="Phone" value={hubModal.employeeData.phone || ""} onChange={handleModalFormChange} />
                  <label>Status</label>
                  <select name="status" value={hubModal.employeeData.status || "Active"} onChange={handleModalFormChange}>
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Retired">Retired</option>
                  </select>
                  
                  <label>Profile Picture</label>
                  <div style={{ gridColumn: "1 / -1" }}>
                    {hubModal.picPreview && (
                      <img src={hubModal.picPreview} alt="Profile Preview" style={{ width: "120px", height: "120px", objectFit: "cover", borderRadius: "50%", marginBottom: "10px" }} />
                    )}
                    <input type="file" accept="image/*" onChange={handleFileChange} />
                  </div>
                  
                  <div className="form-buttons">
                    <button className="save-btn" onClick={handleSaveEmployee}>
                      {hubModal.mode === 'add' ? "Save" : "Save Changes"}
                    </button>
                  </div>
                </div>
              )}

              {/* --- Contributions Tabs --- */}
              {modalActiveTab === 'projects' && (
                <div className="modal-tab-content">
                  <h4>Linked Projects</h4>
                  <div className="searchable-table" style={{ maxHeight: "400px" }}>
                    <table>
                      <thead><tr><th>ID</th><th>Project Name</th><th>Role</th></tr></thead>
                      <tbody>
                        {hubModal.relatedData.projects?.length > 0 ? (
                          hubModal.relatedData.projects.map(p => (
                            <tr key={p.project_id}><td>{p.project_id}</td><td>{p.name}</td><td>{p.role}</td></tr>
                          ))
                        ) : (
                          <tr><td colSpan="3" style={{textAlign: 'center'}}>No projects found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {modalActiveTab === 'patents' && (
                <div className="modal-tab-content">
                  <h4>Linked Patents</h4>
                  <div className="searchable-table" style={{ maxHeight: "400px" }}>
                    <table>
                      <thead><tr><th>ID</th><th>Patent Title</th><th>Role</th></tr></thead>
                      <tbody>
                        {hubModal.relatedData.patents?.length > 0 ? (
                          hubModal.relatedData.patents.map(p => (
                            <tr key={p.patent_id}><td>{p.patent_id}</td><td>{p.title}</td><td>{p.role}</td></tr>
                          ))
                        ) : (
                          <tr><td colSpan="3" style={{textAlign: 'center'}}>No patents found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {modalActiveTab === 'publications' && (
                <div className="modal-tab-content">
                  <h4>Linked Publications</h4>
                  <div className="searchable-table" style={{ maxHeight: "400px" }}>
                    <table>
                      <thead><tr><th>ID</th><th>Publication Title</th><th>Role</th></tr></thead>
                      <tbody>
                        {hubModal.relatedData.publications?.length > 0 ? (
                          hubModal.relatedData.publications.map(p => (
                            <tr key={p.pub_id}><td>{p.pub_id}</td><td>{p.title}</td><td>{p.role}</td></tr>
                          ))
                        ) : (
                          <tr><td colSpan="3" style={{textAlign: 'center'}}>No publications found.</td></tr>
                        )}
                      </tbody>
                    </table>
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