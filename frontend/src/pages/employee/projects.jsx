import { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/employee.projects.css";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export default function ProjectsPage() {
  const token = localStorage.getItem("token");

  const [data, setData] = useState({ projects: [] });
  const [hoveredNode, setHoveredNode] = useState(null);
  const [filters, setFilters] = useState({
    keyword: "",
    status: "",
    startDate: "",
    endDate: "",
  });
  const [modalData, setModalData] = useState({ show: false, project: null });
  const [formData, setFormData] = useState({});
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [techModal, setTechModal] = useState({ show: false, techData: null });

  // Fetch projects
  const fetchProjects = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/projects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData({ projects: res.data });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleAddOrUpdate = async () => {
    if (!window.confirm(editId ? "Update this project?" : "Add new project?")) return;

    try {
      if (editId) {
        await axios.put(`http://localhost:5000/api/projects/${editId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post("http://localhost:5000/api/projects", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setShowForm(false);
      setFormData({});
      setEditId(null);
      fetchProjects();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProjects();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReset = () =>
    setFilters({ keyword: "", status: "", startDate: "", endDate: "" });

  const handleViewTech = async (tech_id) => {
    if (!tech_id) return;
    try {
      const res = await axios.get(
        `http://localhost:5000/api/projects/technologies/${tech_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTechModal({ show: true, techData: res.data });
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProjects = data.projects.filter((p) => {
    if (!p) return false;
    const kw = (filters.keyword || "").toLowerCase();
    return (
      (!filters.status ||
        (filters.status === "completed" && p.end_date) ||
        (filters.status === "ongoing" && !p.end_date)) &&
      (!filters.startDate || new Date(p.start_date) >= new Date(filters.startDate)) &&
      (!filters.endDate || new Date(p.start_date) <= new Date(filters.endDate)) &&
      ((p.name || "").toLowerCase().includes(kw) ||
        (p.description || "").toLowerCase().includes(kw))
    );
  });

  // Helper for popup positioning
  const getPopupPosition = (mouseX, mouseY, width = 320, height = 250, offset = 20) => {
    let left = mouseX + offset;
    let top = mouseY + offset;

    if (left + width > window.innerWidth) left = window.innerWidth - width - offset;
    if (top + height > window.innerHeight) top = window.innerHeight - height - offset;

    return { left, top };
  };

  // Data preparation for graphs
  const statusData = [
    {
      status: "Ongoing",
      count: data.projects.filter((p) => !p.end_date).length,
      projects: data.projects.filter((p) => !p.end_date),
    },
    {
      status: "Completed",
      count: data.projects.filter((p) => p.end_date).length,
      projects: data.projects.filter((p) => p.end_date),
    },
  ];

  const budgetData = [
    {
      range: "< 10L",
      count: data.projects.filter((p) => p.budget < 10000000).length,
      projects: data.projects.filter((p) => p.budget < 10000000),
    },
    {
      range: "10–50L",
      count: data.projects.filter((p) => p.budget >= 10000000 && p.budget < 50000000).length,
      projects: data.projects.filter((p) => p.budget >= 10000000 && p.budget < 50000000),
    },
    {
      range: "≥ 50L",
      count: data.projects.filter((p) => p.budget >= 50000000).length,
      projects: data.projects.filter((p) => p.budget >= 50000000),
    },
  ];

  const timelineData = Object.entries(
    data.projects.reduce((acc, p) => {
      const year = new Date(p.start_date).getFullYear();
      acc[year] = acc[year] || { year, count: 0, projects: [] };
      acc[year].count++;
      acc[year].projects.push(p);
      return acc;
    }, {})
  )
    .map(([_, obj]) => obj)
    .sort((a, b) => a.year - b.year);
// Inside ProjectsPage component
const [linkModal, setLinkModal] = useState({
  show: false,
  selectedEmployees: [], // array of employee_ids
  selectedProjects: [],  // array of project_ids
  role: "",
});

const [employees, setEmployees] = useState([]);
const [projects, setProjects] = useState([]);
const [employeeSearch, setEmployeeSearch] = useState("");
const [projectSearch, setProjectSearch] = useState("");
useEffect(() => {
  const fetchEmployees = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/employees", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/projects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  fetchEmployees();
  fetchProjects();
}, []);

  return (
    <div className="empsection">
        <div className="tech-table-actions">
        <button
          className="add-btn"
          onClick={() => {
            setEditId(null);
            setFormData({});
            setShowForm(true);
          }}
        >
          ➕ Add Project
        </button>
        <button
    className="add-btn"
    onClick={() =>
      setLinkModal({ show: true, selectedEmployees: [], selectedProjects: [], role: "" })
    }
  >
    🔗 Link Employees to Projects
  </button>
      </div>
      {/* ===== Header ===== */}
      <div className="empsection-header">
        <h2>Projects</h2>
        <p>Total Projects: {data.projects.length}</p>
      </div>

      {/* ===== Add Project Button ===== */}
    

      {/* ===== Graphs Section ===== */}
      <div className="tech-graphs">
        {/* Status */}
        <div className="graph-card">
          <h3>Project Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar
                dataKey="count"
                fill="#22a085"
                onMouseEnter={(d, i, e) =>
                  setHoveredNode({ ...d, mouseX: e.clientX, mouseY: e.clientY })
                }
                onMouseLeave={() => setHoveredNode(null)}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Timeline */}
        <div className="graph-card">
          <h3>Projects Over Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#2980b9"
                dot={(props) => (
                  <circle
                    cx={props.cx}
                    cy={props.cy}
                    r={5}
                    fill="#2980b9"
                    stroke="#fff"
                    strokeWidth={1}
                    onMouseEnter={(e) =>
                      setHoveredNode({
                        ...props.payload,
                        mouseX: e.clientX,
                        mouseY: e.clientY,
                      })
                    }
                    onMouseLeave={() => setHoveredNode(null)}
                    style={{ cursor: "pointer" }}
                  />
                )}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Budget */}
        <div className="graph-card">
          <h3>Budget Range</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={budgetData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar
                dataKey="count"
                fill="#e67e22"
                onMouseEnter={(d, i, e) =>
                  setHoveredNode({ ...d, mouseX: e.clientX, mouseY: e.clientY })
                }
                onMouseLeave={() => setHoveredNode(null)}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ===== Hover Popup ===== */}
      {hoveredNode && hoveredNode.projects?.length > 0 && (
        <div
          className="graph-popup"
          style={{
            position: "absolute",
            ...getPopupPosition(hoveredNode.mouseX, hoveredNode.mouseY),
          }}
        >
          <div className="popup-header">
            <h4>
              {hoveredNode.status
                ? `Projects with status "${hoveredNode.status}"`
                : hoveredNode.year
                ? `Projects started in ${hoveredNode.year}`
                : hoveredNode.range
                ? `Projects with budget ${hoveredNode.range}`
                : "Projects"}
            </h4>
            <button className="close-btn" onClick={() => setHoveredNode(null)}>
              ×
            </button>
          </div>
          <div className="scrollable-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Tech ID</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {hoveredNode.projects.map((p) => (
                  <tr key={`hover-${p.project_id}`}>
                    <td>{p.project_id}</td>
                    <td>{p.name}</td>
                    <td>
                      {p.tech_id ? (
                        <button onClick={() => handleViewTech(p.tech_id)}>
                          🔍 {p.tech_id}
                        </button>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>{p.end_date ? "Completed" : "Ongoing"}</td>
                    <td>
                      <button onClick={() => setModalData({ show: true, project: p })}>
                        👁 View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

{linkModal.show && (
  <div className="modal-overlay1" onClick={() => setLinkModal({ show: false })}>
    <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
      <button className="close-btn" onClick={() => setLinkModal({ show: false })}>✖</button>
      <h2>Link Employees to Projects</h2>

      {/* Role */}
      <p>
        <b>Role:</b>
        <input
          type="text"
          value={linkModal.role}
          onChange={(e) => setLinkModal(prev => ({ ...prev, role: e.target.value }))}
          placeholder="Lead / Researcher / Analyst"
        />
      </p>

      {/* Employees Table */}
      <p>
        <b>Employees:</b>
        <input
          type="text"
          placeholder="Search employees..."
          value={employeeSearch}
          onChange={(e) => setEmployeeSearch(e.target.value)}
          style={{ width: "100%", marginBottom: "0.5rem" }}
        />
        <div className="searchable-table" style={{ maxHeight: "200px", overflowY: "auto", border: "1px solid #ccc" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Select</th>
                <th>ID</th>
                <th>Name</th>
                <th>Department</th>
              </tr>
            </thead>
            <tbody>
              {employees
                .filter(emp => emp.name.toLowerCase().includes(employeeSearch.toLowerCase()))
                .map(emp => (
                  <tr key={emp.employee_id}>
                    <td style={{ textAlign: "center" }}>
                      <input
                        type="checkbox"
                        checked={linkModal.selectedEmployees.includes(emp.employee_id)}
                        onChange={(e) => {
                          const selected = linkModal.selectedEmployees;
                          if (e.target.checked) {
                            setLinkModal(prev => ({
                              ...prev,
                              selectedEmployees: [...selected, emp.employee_id]
                            }));
                          } else {
                            setLinkModal(prev => ({
                              ...prev,
                              selectedEmployees: selected.filter(id => id !== emp.employee_id)
                            }));
                          }
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
      </p>

      {/* Projects Table */}
      <p>
        <b>Projects:</b>
        <input
          type="text"
          placeholder="Search projects..."
          value={projectSearch}
          onChange={(e) => setProjectSearch(e.target.value)}
          style={{ width: "100%", marginBottom: "0.5rem" }}
        />
        <div className="searchable-table" style={{ maxHeight: "200px", overflowY: "auto", border: "1px solid #ccc" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Select</th>
                <th>ID</th>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              {projects
                .filter(proj => proj.name.toLowerCase().includes(projectSearch.toLowerCase()))
                .map(proj => (
                  <tr key={proj.project_id}>
                    <td style={{ textAlign: "center" }}>
                      <input
                        type="checkbox"
                        checked={linkModal.selectedProjects.includes(proj.project_id)}
                        onChange={(e) => {
                          const selected = linkModal.selectedProjects;
                          if (e.target.checked) {
                            setLinkModal(prev => ({
                              ...prev,
                              selectedProjects: [...selected, proj.project_id]
                            }));
                          } else {
                            setLinkModal(prev => ({
                              ...prev,
                              selectedProjects: selected.filter(id => id !== proj.project_id)
                            }));
                          }
                        }}
                      />
                    </td>
                    <td>{proj.project_id}</td>
                    <td>{proj.name}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </p>

      <button
        className="save-btn"
        onClick={async () => {
          try {
            if (linkModal.selectedEmployees.length === 0 || linkModal.selectedProjects.length === 0) {
              alert("Select at least one employee and one project");
              return;
            }

            // Create links for each combination
            await Promise.all(
              linkModal.selectedEmployees.flatMap(empId =>
                linkModal.selectedProjects.map(projId =>
                  axios.post(
                    "http://localhost:5000/api/employee_projects",
                    { employee_id: empId, project_id: projId, role: linkModal.role },
                    { headers: { Authorization: `Bearer ${token}` } }
                  )
                )
              )
            );

            alert("Employees linked to projects successfully!");
            setLinkModal({ show: false, selectedEmployees: [], selectedProjects: [], role: "" });
          } catch (err) {
            console.error(err);
            alert("Failed to link employees to projects");
          }
        }}
      >
        💾 Save
      </button>
    </div>
  </div>
)}

      {/* ===== Tech Modal ===== */}
      {techModal.show && techModal.techData && (
        <div
          className="modal-overlay1"
          onClick={() => setTechModal({ show: false, techData: null })}
        >
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-btn"
              onClick={() => setTechModal({ show: false, techData: null })}
            >
              ✖
            </button>

            <h2>{techModal.techData.name}</h2>
            <p><b>Category:</b> {techModal.techData.category}</p>
            <p><b>Status:</b> {techModal.techData.status}</p>
            <p><b>TRL:</b> {techModal.techData.trl_start} → {techModal.techData.trl_achieved}</p>
            <p><b>Description:</b> {techModal.techData.trl_description}</p>
            <p><b>Budget:</b> ₹{Number(techModal.techData.budget).toLocaleString()}</p>
            <p><b>Security Level:</b> {techModal.techData.security_level}</p>
            <p><b>Location:</b> {techModal.techData.location}</p>
            <p><b>Tech Stack:</b> {techModal.techData.tech_stack}</p>
            <p><b>Salient Features:</b> {techModal.techData.salient_features}</p>
            <p><b>Achievements:</b> {techModal.techData.achievements}</p>
            <hr />
            <h3>Development Project Info</h3>
            <p><b>Project Name:</b> {techModal.techData.dev_proj_name}</p>
            <p><b>Project Number:</b> {techModal.techData.dev_proj_number}</p>
            <p><b>Project Code:</b> {techModal.techData.dev_proj_code}</p>
            <p><b>Funding Details:</b> {techModal.techData.funding_details}</p>
            {techModal.techData.image_path && (
              <img
                src={`http://localhost:5000${techModal.techData.image_path}`}
                alt={techModal.techData.name}
                style={{ width: "100%", borderRadius: "8px", marginTop: "10px", objectFit: "cover" }}
              />
            )}
          </div>
        </div>
      )}

      {/* ===== Filters Section ===== */}
      <div className="filters-panel">
        <input
          type="text"
          placeholder="🔎 Search projects..."
          value={filters.keyword}
          onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
        />
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Status</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
        </select>
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
        />
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
        />
        <button className="apply-btn">Apply</button>
        <button className="reset-btn" onClick={handleReset}>
          Reset
        </button>
      </div>

      {/* ===== Projects Table ===== */}
      <div className="reports-results">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Tech ID</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              <th>Budget</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.map((p) => (
              <tr key={p.project_id}>
                <td>{p.project_id}</td>
                <td>{p.name}</td>
                <td>
                  {p.tech_id ? (
                    <span>
                      {p.tech_id}{" "}
                      <button
                        className="view-tech-btn"
                        onClick={() => handleViewTech(p.tech_id)}
                      >
                        🔍 View Tech
                      </button>
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td>{p.start_date}</td>
                <td>{p.end_date || "—"}</td>
                <td>{p.end_date ? "Completed" : "Ongoing"}</td>
                <td>{p.budget || "—"}</td>
                <td>
                  <button
                    className="edit-btn"
                    onClick={() => {
                      setFormData({
                        name: p.name || "",
                        description: p.description || "",
                        start_date: p.start_date?.split("T")[0] || "",
                        end_date: p.end_date?.split("T")[0] || "",
                        budget: p.budget || "",
                        tech_id: p.tech_id || "",
                      });
                      setEditId(p.project_id);
                      setTimeout(() => setShowForm(true), 0);
                    }}
                  >
                    ✎
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(p.project_id)}
                  >
                    🗑
                  </button>
                  <button
                    className="save-btn"
                    onClick={() => setModalData({ show: true, project: p })}
                  >
                    View More
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== Project Modal ===== */}
      {modalData.show && (
        <div className="modal-overlay1" onClick={() => setModalData({ show: false })}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setModalData({ show: false })}>
              ✖
            </button>
            <h2>{modalData.project.name}</h2>
            <p><b>Description:</b> {modalData.project.description}</p>
            <p><b>Start:</b> {modalData.project.start_date}</p>
            <p><b>End:</b> {modalData.project.end_date || "Ongoing"}</p>
            <p><b>Budget:</b> {modalData.project.budget}</p>
            {modalData.project.tech_id && (
              <p>
                <b>Linked Technology ID:</b> {modalData.project.tech_id}{" "}
                <button
                  className="view-tech-btn-inline"
                  onClick={() => handleViewTech(modalData.project.tech_id)}
                >
                  🔍 View Tech Details
                </button>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
    {showForm && (
        <div className="modal-overlay1" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowForm(false)}>
              ✖
            </button>
            <h3>{editId ? "Edit Project" : "Add Project"}</h3>
            <input
              placeholder="Name"
              value={formData.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            <input
              placeholder="Description"
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
            <input
              type="date"
              value={formData.start_date || ""}
              onChange={(e) =>
                setFormData({ ...formData, start_date: e.target.value })
              }
            />
            <input
  type="date"
  value={formData.end_date || ""}
  onChange={(e) =>
    setFormData({
      ...formData,
      end_date: e.target.value === "" ? null : e.target.value,
    })
  }
/>

            <input
              type="number"
              placeholder="Budget"
              value={formData.budget || ""}
              onChange={(e) =>
                setFormData({ ...formData, budget: e.target.value })
              }
            />
            <input
              placeholder="Tech ID"
              value={formData.tech_id || ""}
              onChange={(e) =>
                setFormData({ ...formData, tech_id: e.target.value })
              }
            />
            <button onClick={handleAddOrUpdate}>
              {editId ? "Update Project" : "Add Project"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
