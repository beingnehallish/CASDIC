// EmployeesPage.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/employee.employees.css";
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
  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#6366f1"];

  // Filter State
  const [filters, setFilters] = useState({
    keyword: "",
    department: "",
    status: "",
  });

  // Hub Modal State
  const [hubModal, setHubModal] = useState({
    show: false,
    mode: "add",
    employeeData: {},
    relatedData: { projects: [], patents: [], publications: [] },
    newProfilePic: null,
    picPreview: null,
  });
  const [modalActiveTab, setModalActiveTab] = useState("overview");

  const fetchEmployees = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/employees", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const formatted = res.data.map((emp) => ({
        ...emp,
        profile_pic: emp.profile_pic ? emp.profile_pic : null,
      }));
      setEmployees(formatted);
      processGraphData(formatted);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // --- Graph Data Processing ---
  const processGraphData = (data) => {
    // By Department
    const deptCounts = data.reduce((acc, e) => {
      const dept = e.department || "Unknown";
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {});
    setDeptData(
      Object.entries(deptCounts).map(([name, count]) => ({ name, count }))
    );

    // By Status
    const statusCounts = data.reduce((acc, e) => {
      const st = e.status || "Unknown";
      acc[st] = (acc[st] || 0) + 1;
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
      mode: "add",
      employeeData: {},
      relatedData: { projects: [], patents: [], publications: [] },
      newProfilePic: null,
      picPreview: null,
    });
    setModalActiveTab("overview");
  };

  const handleOpenAddModal = () => {
    resetHubModal();
    setHubModal((prev) => ({
      ...prev,
      show: true,
      mode: "add",
      employeeData: {
        name: "",
        designation: "",
        department: "",
        email: "",
        phone: "",
        status: "Active",
      },
    }));
  };

  const handleOpenManageModal = async (emp) => {
    resetHubModal();
    setHubModal((prev) => ({
      ...prev,
      show: true,
      mode: "edit",
      employeeData: emp,
      picPreview: emp.profile_pic
        ? `data:image/jpeg;base64,${emp.profile_pic}`
        : null,
    }));

    try {
      const res = await axios.get(
        `http://localhost:5000/api/employees/${emp.employee_id}/contributions`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHubModal((prev) => ({
        ...prev,
        relatedData: res.data,
      }));
    } catch (err) {
      console.error("Failed to fetch contributions", err);
    }
  };

  const handleModalFormChange = (e) => {
    const { name, value } = e.target;
    setHubModal((prev) => ({
      ...prev,
      employeeData: {
        ...prev.employeeData,
        [name]: value,
      },
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setHubModal((prev) => ({
        ...prev,
        newProfilePic: file,
        picPreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleSaveEmployee = async () => {
    const { mode, employeeData, newProfilePic } = hubModal;
    const confirmed = window.confirm(
      mode === "add" ? "Add new employee?" : "Update this employee?"
    );
    if (!confirmed) return;

    const formData = new FormData();
    formData.append("name", employeeData.name || "");
    formData.append("designation", employeeData.designation || "");
    formData.append("department", employeeData.department || "");
    formData.append("email", employeeData.email || "");
    formData.append("phone", employeeData.phone || "");
    formData.append("status", employeeData.status || "Active");
    if (newProfilePic) {
      formData.append("profile_pic", newProfilePic);
    }

    try {
      if (mode === "add") {
        const res = await axios.post(
          "http://localhost:5000/api/employees",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        setHubModal((prev) => ({
          ...prev,
          mode: "edit",
          employeeData: {
            ...prev.employeeData,
            employee_id: res.data.employee_id,
          },
        }));
        setModalActiveTab("projects");
        alert(
          "Employee added. You can now view their contributions (link them from other pages)."
        );
      } else {
        await axios.put(
          `http://localhost:5000/api/employees/${employeeData.employee_id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        alert("Employee updated.");
      }
      fetchEmployees();
    } catch (err) {
      console.error(err);
      alert("Failed to save employee.");
    }
  };

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
      (!filters.department ||
        (e.department || "")
          .toLowerCase()
          .includes(filters.department.toLowerCase())) &&
      (!filters.status || e.status === filters.status) &&
      ((e.name || "").toLowerCase().includes(kw) ||
        (e.email || "").toLowerCase().includes(kw) ||
        (e.designation || "").toLowerCase().includes(kw))
    );
  });

  const statusBadgeClass = (status) => {
    const base = "em-badge";
    if (status === "Active") return `${base} em-badge--success`;
    if (status === "On Leave") return `${base} em-badge--warning`;
    if (status === "Retired") return `${base} em-badge--neutral`;
    return `${base} em-badge--neutral`;
  };

  return (
    <div className="em-page">
      {/* Header / Actions */}
      <div className="em-header">
        <div>
          <h2 className="em-title">EMPLOYEES</h2>
          <p className="em-subtitle">Total Employees: {employees.length}</p>
        </div>
        <div className="em-actions">
          <button className="em-btn em-btn--primary" onClick={handleOpenAddModal}>
            <span aria-hidden="true">➕</span> Add Employee
          </button>
        </div>
      </div>

      {/* Graphs */}
      <section className="em-graphs">
        <article className="em-card">
          <h3 className="em-card__title">Employees by Department</h3>
          <div className="em-card__body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={deptData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="em-card">
          <h3 className="em-card__title">Employees by Status</h3>
          <div className="em-card__body">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="45%"
                  labelLine={false}
                  label={false}
                  outerRadius={85}
                  dataKey="value"
                  nameKey="name"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, name]} />
                <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      {/* Filters */}
      <section className="em-filters" aria-label="Employees filters">
        <input
          className="em-input"
          type="text"
          placeholder="🔎 Search by name/email..."
          value={filters.keyword}
          onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
        />
        <input
          className="em-input"
          type="text"
          placeholder="Department"
          value={filters.department}
          onChange={(e) => setFilters({ ...filters, department: e.target.value })}
        />
        <select
          className="em-select"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="On Leave">On Leave</option>
          <option value="Retired">Retired</option>
        </select>
        <button
          className="em-btn em-btn--ghost"
          onClick={() => setFilters({ keyword: "", department: "", status: "" })}
        >
          Reset
        </button>
      </section>

      {/* Table */}
      <section className="em-table-wrap">
        <table className="em-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Photo</th>
              <th>Name</th>
              <th>Designation</th>
              <th>Status</th>
              <th className="em-col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((emp) => (
              <tr key={emp.employee_id}>
                <td>{emp.employee_id}</td>
                <td>
                  {emp.profile_pic ? (
                    <img
                      className="em-avatar"
                      src={`data:image/jpeg;base64,${emp.profile_pic}`}
                      alt={`${emp.name}'s profile`}
                    />
                  ) : (
                    <div className="em-avatar em-avatar--placeholder" aria-hidden="true">
                      {(emp.name || "?").charAt(0).toUpperCase()}
                    </div>
                  )}
                </td>
                <td className="em-cell-strong">{emp.name}</td>
                <td>{emp.designation}</td>
                <td>
                  <span className={statusBadgeClass(emp.status)}>{emp.status}</span>
                </td>
                <td>
                  <div className="em-row-actions">
                    <button
                      className="em-btn em-btn--secondary"
                      onClick={() => handleOpenManageModal(emp)}
                    >
                      ✎Manage
                    </button>
                    <button
                      className="em-btn em-btn--danger"
                      onClick={() => handleDelete(emp.employee_id)}
                      aria-label={`Delete ${emp.name}`}
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredEmployees.length === 0 && (
              <tr>
                <td colSpan="6" className="em-empty">
                  No employees match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* Modal */}
      {hubModal.show && (
        <div className="em-modal-overlay" onClick={resetHubModal} role="dialog" aria-modal="true">
          <div
            className="em-modal-content em-modal-content--large"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="em-modal-close" onClick={resetHubModal} aria-label="Close modal">
              ✖
            </button>
            <h2 className="em-modal-title">
              {hubModal.mode === "add"
                ? "Add New Employee"
                : `Manage: ${hubModal.employeeData.name}`}
            </h2>

            <div className="em-tabs">
              <button
                className={`em-tab-btn ${
                  modalActiveTab === "overview" ? "em-tab-btn--active" : ""
                }`}
                onClick={() => setModalActiveTab("overview")}
              >
                Overview
              </button>
              <button
                className={`em-tab-btn ${
                  modalActiveTab === "projects" ? "em-tab-btn--active" : ""
                }`}
                onClick={() => setModalActiveTab("projects")}
                disabled={hubModal.mode === "add"}
              >
                Projects
              </button>
              <button
                className={`em-tab-btn ${
                  modalActiveTab === "patents" ? "em-tab-btn--active" : ""
                }`}
                onClick={() => setModalActiveTab("patents")}
                disabled={hubModal.mode === "add"}
              >
                Patents
              </button>
              <button
                className={`em-tab-btn ${
                  modalActiveTab === "publications" ? "em-tab-btn--active" : ""
                }`}
                onClick={() => setModalActiveTab("publications")}
                disabled={hubModal.mode === "add"}
              >
                Publications
              </button>
            </div>

            <div className="em-tab-panel">
              {/* Overview */}
              {modalActiveTab === "overview" && (
                <div className="em-form-grid">
                  <label className="em-label">Name</label>
                  <input
                    className="em-input"
                    name="name"
                    placeholder="Full Name"
                    value={hubModal.employeeData.name || ""}
                    onChange={handleModalFormChange}
                  />

                  <label className="em-label">Designation</label>
                  <input
                    className="em-input"
                    name="designation"
                    placeholder="Designation"
                    value={hubModal.employeeData.designation || ""}
                    onChange={handleModalFormChange}
                  />

                  <label className="em-label">Department</label>
                  <input
                    className="em-input"
                    name="department"
                    placeholder="Department"
                    value={hubModal.employeeData.department || ""}
                    onChange={handleModalFormChange}
                  />

                  <label className="em-label">Email</label>
                  <input
                    className="em-input"
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={hubModal.employeeData.email || ""}
                    onChange={handleModalFormChange}
                  />

                  <label className="em-label">Phone</label>
                  <input
                    className="em-input"
                    name="phone"
                    placeholder="Phone"
                    value={hubModal.employeeData.phone || ""}
                    onChange={handleModalFormChange}
                  />

                  <label className="em-label">Status</label>
                  <select
                    className="em-select"
                    name="status"
                    value={hubModal.employeeData.status || "Active"}
                    onChange={handleModalFormChange}
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Retired">Retired</option>
                  </select>

                  <label className="em-label">Profile Picture</label>
                  <div className="em-file-field">
                    {hubModal.picPreview && (
                      <img
                        className="em-avatar em-avatar--lg"
                        src={hubModal.picPreview}
                        alt="Profile preview"
                      />
                    )}
                    <input
                      className="em-input-file"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>

                  <div className="em-form-actions">
                    <button className="em-btn em-btn--primary" onClick={handleSaveEmployee}>
                      {hubModal.mode === "add" ? "Save" : "Save Changes"}
                    </button>
                  </div>
                </div>
              )}

              {/* Projects */}
              {modalActiveTab === "projects" && (
                <div className="em-tab-content">
                  <h4 className="em-section-title">Linked Projects</h4>
                  <div className="em-table-scroll">
                    <table className="em-table em-table--compact">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Project Name</th>
                          <th>Role</th>
                        </tr>
                      </thead>
                      <tbody>
                        {hubModal.relatedData.projects?.length > 0 ? (
                          hubModal.relatedData.projects.map((p) => (
                            <tr key={p.project_id}>
                              <td>{p.project_id}</td>
                              <td className="em-cell-strong">{p.name}</td>
<td>{p.role}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="3" className="em-empty">
                              No projects found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Patents */}
              {modalActiveTab === "patents" && (
                <div className="em-tab-content">
                  <h4 className="em-section-title">Linked Patents</h4>
                  <div className="em-table-scroll">
                    <table className="em-table em-table--compact">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Patent Title</th>
                          <th>Role</th>
                        </tr>
                      </thead>
                      <tbody>
                        {hubModal.relatedData.patents?.length > 0 ? (
                          hubModal.relatedData.patents.map((p) => (
                            <tr key={p.patent_id}>
                              <td>{p.patent_id}</td>
                              <td className="em-cell-strong">{p.title}</td>
                              <td>{p.role}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="3" className="em-empty">
                              No patents found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Publications */}
              {modalActiveTab === "publications" && (
                <div className="em-tab-content">
                  <h4 className="em-section-title">Linked Publications</h4>
                  <div className="em-table-scroll">
                    <table className="em-table em-table--compact">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Publication Title</th>
                          <th>Role</th>
                        </tr>
                      </thead>
                      <tbody>
                        {hubModal.relatedData.publications?.length > 0 ? (
                          hubModal.relatedData.publications.map((p) => (
                            <tr key={p.pub_id}>
                              <td>{p.pub_id}</td>
                              <td className="em-cell-strong">{p.title}</td>
                              <td>{p.role}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="3" className="em-empty">
                              No publications found.
                            </td>
                          </tr>
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
