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

/* ===== Small UI helpers ===== */
const PrjStatusPill = ({ completed }) => (
  <span
    className={`prj-pill ${completed ? "prj-pill--success" : "prj-pill--warn"}`}
    title={completed ? "Completed" : "Ongoing"}
  >
    {completed ? "Completed" : "Ongoing"}
  </span>
);

const PrjIconButton = ({ title, onClick, icon, variant = "ghost", ariaLabel }) => (
  <button
    className={`prj-icon-btn prj-icon-btn--${variant}`}
    onClick={onClick}
    type="button"
    aria-label={ariaLabel || title}
    title={title}
  >
    {icon}
  </button>
);

/* ===== Chart Tooltip ===== */
const PrjGraphTooltip = ({ active, payload, label, onManage }) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload || {};
  const title = label || data.status || data.range || data.name || "Details";
  const list = data.projects || [];

  const handleManageClick = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    onManage?.(item);
  };

  return (
    <div className="prj-cg-tooltip" role="dialog" aria-label="Chart details">
      <div className="prj-cg-tooltip__header">
        <div className="prj-cg-tooltip__title">{title}</div>
        <div className="prj-cg-tooltip__meta">
          <span className="prj-cg-tooltip__badge">{data.count ?? list.length}</span>
          <span className="prj-cg-tooltip__label">items</span>
        </div>
      </div>

      {Array.isArray(list) && list.length > 0 ? (
        <ul className="prj-cg-tooltip__list">
          {list.map((p) => (
            <li key={p.project_id} className="prj-cg-tooltip__row">
              <span className="cell-title__name" title={p.name}>
                {p.name}
              </span>
              {p.budget != null && (
                <span className="prj-cg-tooltip__pill">
                  ₹ {Number(p.budget).toLocaleString()}
                </span>
              )}
              <button
                type="button"
                className="prj-cg-tooltip__manage-btn"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => handleManageClick(e, p)}
                aria-label={`Manage ${p.name}`}
                title="Manage"
              >
                Manage
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="prj-cg-tooltip__empty">No items for this point</div>
      )}
    </div>
  );
};

/* ================== Main Page ================== */
export default function ProjectsPage() {
  const token = localStorage.getItem("token");

  // Data
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [allTechnologies, setAllTechnologies] = useState([]);
  const [allCompanies, setAllCompanies] = useState([]); // if needed elsewhere

  // Filters
  const [filters, setFilters] = useState({
    keyword: "",
    status: "",
    startDate: "",
    endDate: "",
  });

  // Sort
  const [sort, setSort] = useState({ field: "", order: "asc" });

  // Modal (Add/Manage)
const [hubModal, setHubModal] = useState({
  show: false,
  mode: "add",
  projectData: {},
  relatedData: { team: [] }, // ⬅️ added
});

  // Modal Tabs
  const [modalActiveTab, setModalActiveTab] = useState("overview"); // 'overview' | 'team'

  // Tooltip pins
  const [pinned, setPinned] = useState({ status: null, timeline: null, budget: null });
  const pinTooltip = (key, payload, label) => setPinned((p) => ({ ...p, [key]: { payload, label } }));
  const unpinTooltip = (key) => setPinned((p) => ({ ...p, [key]: null }));

  // ===== TEAM LINKING STATE (inside modal) =====
  const [teamRole, setTeamRole] = useState("");
  const [teamSearch, setTeamSearch] = useState("");
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);

  // Fetch
  const fetchProjects = async () => {
    try {
      const projRes = await axios.get("http://localhost:5000/api/projects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(projRes.data || []);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const [projRes, empRes, techRes, compRes] = await Promise.all([
          axios.get("http://localhost:5000/api/projects", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/employees", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/technologies", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/companies", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setProjects(projRes.data || []);
        setEmployees(empRes.data || []);
        setAllTechnologies(techRes.data || []);
        setAllCompanies(compRes.data || []);
      } catch (err) {
        console.error("Failed to fetch page data:", err);
      }
    })();

    const onKey = (e) => {
      if (e.key === "Escape") setPinned({ status: null, timeline: null, budget: null });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [token]);

  // Modal helpers
const resetHubModal = () => {
  setHubModal({ show: false, mode: "add", projectData: {}, relatedData: { team: [] } });
  setTeamRole("");
  setTeamSearch("");
  setSelectedTeamMembers([]);
};
// helper
const fetchProjectTeam = async (projectId) => {
  try {
    const res = await axios.get(`http://localhost:5000/api/employee_projects/${projectId}/team`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setHubModal(prev => ({ ...prev, relatedData: { ...(prev.relatedData||{}), team: res.data || [] } }));
  } catch (err) {
    console.error("Failed to fetch project team:", err);
  }
};

  const handleOpenAddModal = () => {
    resetHubModal();
    setHubModal({
      show: true,
      mode: "add",
      projectData: {
        name: "",
        description: "",
        start_date: "",
        end_date: null,
        budget: "",
        tech_id: "",
      },
    });
  };

  const handleOpenManageModal = (project) => {
  resetHubModal();
  setHubModal({
    show: true,
    mode: "edit",
    projectData: {
      ...project,
      start_date: project.start_date?.split("T")[0] || "",
      end_date: project.end_date?.split("T")[0] || "",
    },
    relatedData: { team: [] },
  });
  fetchProjectTeam(project.project_id); // ⬅️ load links
};

  const handleModalFormChange = (e) => {
    const { name, value } = e.target;
    setHubModal((prev) => ({
      ...prev,
      projectData: { ...prev.projectData, [name]: value === "" ? null : value },
    }));
  };

  const handleSaveProject = async () => {
    const { mode, projectData } = hubModal;
    if (mode === "add") {
      if (!window.confirm("Create this new project?")) return;
      try {
        const res = await axios.post("http://localhost:5000/api/projects", projectData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const newId =
          res?.data?.project_id ?? res?.data?.id ?? res?.data?.insertId ?? res?.data?.[0]?.project_id;
        if (!newId) {
          alert("Project saved, but server didn't return an ID.");
          return;
        }
        setHubModal((prev) => ({
          ...prev,
          mode: "edit",
          projectData: { ...prev.projectData, project_id: newId },
        }));
        await fetchProjectTeam(newId);
        // jump to Team & Roles after first save
        setModalActiveTab("team");
        alert("Project created. You can now link employees in Team & Roles.");
        fetchProjects();
      } catch (err) {
        console.error(err);
        alert("Failed to create project.");
      }
    } else {
      if (!window.confirm("Update this project?")) return;
      try {
        await axios.put(
          `http://localhost:5000/api/projects/${projectData.project_id}`,
          projectData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Project updated!");
        fetchProjects();
      } catch (err) {
        console.error(err);
        alert("Failed to save project.");
      }
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm("Delete this project? This cannot be undone.")) return;
    try {
      await axios.delete(`http://localhost:5000/api/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Project deleted.");
      fetchProjects();
    } catch (err) {
      console.error("Failed to delete project:", err);
      alert("Failed to delete project. It may be linked to other items.");
    }
  };

  // TEAM LINK: link employees -> current project (inside modal)
  const filteredEmployees = (employees || []).filter((emp) =>
    (emp?.name || "").toLowerCase().includes((teamSearch || "").toLowerCase())
  );

  const handleLinkTeamMembers = async () => {
    const { project_id } = hubModal.projectData || {};
    if (!project_id) {
      alert("Please save the project first so it gets an ID, then link employees.");
      return;
    }
    if (!selectedTeamMembers.length) {
      alert("Select at least one employee.");
      return;
    }
    if (!teamRole.trim()) {
      alert("Enter a role for the selected employees.");
      return;
    }
    try {
      const linkPromises = selectedTeamMembers.map((empId) =>
        axios.post(
          "http://localhost:5000/api/employee_projects",
          { employee_id: empId, project_id, role: teamRole.trim() },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      );
      await Promise.all(linkPromises);
      await fetchProjectTeam(project_id);
      alert(`Linked ${selectedTeamMembers.length} employee(s).`);
      setSelectedTeamMembers([]);
      setTeamRole("");
      setTeamSearch("");
    } catch (err) {
      console.error(err);
      alert("Failed to link team members.");
    }
  };
const handleUnlinkTeam = async (linkId) => {
  const { project_id } = hubModal.projectData || {};
  if (!project_id) return;
  if (!window.confirm("Remove this team member from the project?")) return;
  try {
    await axios.delete(`http://localhost:5000/api/employee_projects/${linkId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    await fetchProjectTeam(project_id); // refresh list
  } catch (err) {
    console.error("Unlink team member failed:", err);
    alert("Failed to unlink team member.");
  }
};

  // Filtering
  const handleReset = () =>
    setFilters({ keyword: "", status: "", startDate: "", endDate: "" });

  const filteredProjects = projects.filter((p) => {
    if (!p) return false;
    const kw = (filters.keyword || "").toLowerCase();
    const matchesStatus =
      !filters.status ||
      (filters.status === "completed" && p.end_date) ||
      (filters.status === "ongoing" && !p.end_date);
    const matchesStart =
      !filters.startDate || new Date(p.start_date) >= new Date(filters.startDate);
    const matchesEnd =
      !filters.endDate || new Date(p.start_date) <= new Date(filters.endDate);
    const matchesKW =
      (p.name || "").toLowerCase().includes(kw) ||
      (p.description || "").toLowerCase().includes(kw);
    return matchesStatus && matchesStart && matchesEnd && matchesKW;
  });

  // Sorting
  const norm = (val, field) => {
    if (val == null || val === "" || Number.isNaN(val)) return null;
    if (field === "start_date" || field === "end_date") return new Date(val);
    if (field === "budget") {
      const n = Number(val);
      return Number.isFinite(n) ? n : null;
    }
    return val;
  };

  const cmpBy = (a, b, field, order) => {
    const av = norm(a?.[field], field);
    const bv = norm(b?.[field], field);
    const aNull = av === null;
    const bNull = bv === null;
    if (aNull && bNull) return 0;
    if (aNull) return 1;
    if (bNull) return -1;

    let base = 0;
    if (av instanceof Date && bv instanceof Date) base = av - bv;
    else if (typeof av === "number" && typeof bv === "number") base = av - bv;
    else base = String(av).localeCompare(String(bv));

    const dir = order === "asc" ? 1 : -1;
    if (base !== 0) return base * dir;
    return String(a?.name ?? "").localeCompare(String(b?.name ?? ""));
  };

  const sortedProjects =
    !sort.field
      ? filteredProjects
      : filteredProjects.slice().sort((a, b) => cmpBy(a, b, sort.field, sort.order));

  // Graph data
  const statusData = [
    {
      status: "Ongoing",
      count: projects.filter((p) => !p.end_date).length,
      projects: projects.filter((p) => !p.end_date),
    },
    {
      status: "Completed",
      count: projects.filter((p) => p.end_date).length,
      projects: projects.filter((p) => p.end_date),
    },
  ];

  const budgetData = [
    {
      range: "< 10L",
      count: projects.filter((p) => p.budget < 10000000).length,
      projects: projects.filter((p) => p.budget < 10000000),
    },
    {
      range: "10–50L",
      count: projects.filter((p) => p.budget >= 10000000 && p.budget < 50000000).length,
      projects: projects.filter((p) => p.budget >= 10000000 && p.budget < 50000000),
    },
    {
      range: "≥ 50L",
      count: projects.filter((p) => p.budget >= 50000000).length,
      projects: projects.filter((p) => p.budget >= 50000000),
    },
  ];

  const timelineData = Object.entries(
    projects.reduce((acc, p) => {
      const year = new Date(p.start_date).getFullYear();
      if (!year) return acc;
      acc[year] = acc[year] || { year, count: 0, projects: [] };
      acc[year].count++;
      acc[year].projects.push(p);
      return acc;
    }, {})
  )
    .map(([_, obj]) => obj)
    .sort((a, b) => a.year - b.year);
    
useEffect(() => {
  if (hubModal.show && modalActiveTab === "team" && hubModal.projectData?.project_id) {
    fetchProjectTeam(hubModal.projectData.project_id);
  }
}, [hubModal.show, modalActiveTab, hubModal.projectData?.project_id]);

  // Render
  return (
    <div className="prj-section">
      <div className="prj-table-actions">
        <button className="prj-add-btn" onClick={handleOpenAddModal}>
          ➕ Add Project
        </button>
      </div>

      <div className="prj-section-header">
        <h2>PROJECTS</h2>
        <p>Total Projects: {projects.length}</p>
      </div>

      {/* Graphs */}
      <div className="prj-graphs">
        <div className="prj-graph-card">
          <h3>Project Status</h3>
          <div className="prj-chart-with-overlay">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis allowDecimals={false} />
                <Tooltip content={(p) => <PrjGraphTooltip {...p} onManage={handleOpenManageModal} />} />
                <Bar
                  dataKey="count"
                  fill="#22a085"
                  onClick={(barData) => {
                    const payload = barData?.payload;
                    pinTooltip("status", payload, payload?.status || "Status");
                  }}
                />
              </BarChart>
            </ResponsiveContainer>

            {pinned.status && (
              <div className="prj-cg-tooltip-pinned">
                <button className="prj-cg-tooltip-close" onClick={() => unpinTooltip("status")} aria-label="Close">
                  ✖
                </button>
                <PrjGraphTooltip
                  active
                  payload={[{ payload: pinned.status.payload }]}
                  label={pinned.status.label}
                  onManage={handleOpenManageModal}
                />
              </div>
            )}
          </div>
        </div>

        <div className="prj-graph-card">
          <h3>Projects Over Time</h3>
          <div className="prj-chart-with-overlay">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis allowDecimals={false} />
                <Tooltip content={(p) => <PrjGraphTooltip {...p} onManage={handleOpenManageModal} />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#2980b9"
                  activeDot={{
                    r: 6,
                    onClick: (e) => {
                      const payload = e?.payload;
                      pinTooltip("timeline", payload, `Year ${payload?.year}`);
                    },
                  }}
                />
              </LineChart>
            </ResponsiveContainer>

            {pinned.timeline && (
              <div className="prj-cg-tooltip-pinned">
                <button className="prj-cg-tooltip-close" onClick={() => unpinTooltip("timeline")} aria-label="Close">
                  ✖
                </button>
                <PrjGraphTooltip
                  active
                  payload={[{ payload: pinned.timeline.payload }]}
                  label={pinned.timeline.label}
                  onManage={handleOpenManageModal}
                />
              </div>
            )}
          </div>
        </div>

        <div className="prj-graph-card">
          <h3>Budget Range</h3>
          <div className="prj-chart-with-overlay">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={budgetData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis allowDecimals={false} />
                <Tooltip content={(p) => <PrjGraphTooltip {...p} onManage={handleOpenManageModal} />} />
                <Bar
                  dataKey="count"
                  fill="#e67e22"
                  onClick={(barData) => {
                    const payload = barData?.payload;
                    pinTooltip("budget", payload, payload?.range || "Budget");
                  }}
                />
              </BarChart>
            </ResponsiveContainer>

            {pinned.budget && (
              <div className="prj-cg-tooltip-pinned">
                <button className="prj-cg-tooltip-close" onClick={() => unpinTooltip("budget")} aria-label="Close">
                  ✖
                </button>
                <PrjGraphTooltip
                  active
                  payload={[{ payload: pinned.budget.payload }]}
                  label={pinned.budget.label}
                  onManage={handleOpenManageModal}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="prj-filters-panel">
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
        <button className="prj-adv-filter-btn" onClick={handleReset}>
          Reset
        </button>
      </div>

      {/* Sort */}
      <div className="prj-sort-panel" role="group" aria-label="Sort projects">
        <div className="prj-sort-left">
          <label htmlFor="prjSortField" className="prj-sort-label">
            Sort by
          </label>
          <select
            id="prjSortField"
            value={sort.field}
            onChange={(e) =>
              setSort((s) => ({ field: e.target.value, order: e.target.value ? "asc" : s.order }))
            }
          >
            <option value="">None</option>
            <option value="start_date">Start Date</option>
            <option value="end_date">End Date</option>
            <option value="budget">Budget</option>
          </select>
        </div>
        <button
          type="button"
          className="prj-adv-filter-btn"
          onClick={() => setSort((s) => ({ ...s, order: s.order === "asc" ? "desc" : "asc" }))}
          disabled={!sort.field}
          aria-pressed={sort.order === "desc"}
          aria-label={`Sort order: ${sort.order === "asc" ? "Ascending" : "Descending"}`}
          title={sort.field ? `Toggle to ${sort.order === "asc" ? "Descending" : "Ascending"}` : "Select a sort field first"}
        >
          <span className="prj-sort-order-icon" aria-hidden="true">
            {sort.order === "asc" ? " ▲ " : " ▼ "}
          </span>
          <span className="prj-sort-order-text">
            {sort.order === "asc" ? "Ascending" : "Descending"}
          </span>
        </button>
      </div>

      {/* Table */}
      <div className="prj-results">
        <table>
          <thead>
            <tr>
              <th className="prj-th-id">ID</th>
              <th>Title</th>
              <th>Status</th>
              <th>Start</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedProjects.map((p) => (
              <tr key={p.project_id}>
                <td className="prj-td-center">{p.project_id}</td>
                <td>
                  <div className="prj-cell-title">
                    <span className="prj-cell-title__name">{p.name}</span>
                    {typeof p.budget === "number" && (
                      <span className="prj-chip" title="Budget">
                        ₹ {Number(p.budget).toLocaleString()}
                      </span>
                    )}
                  </div>
                </td>
                <td>
                  <PrjStatusPill completed={!!p.end_date} />
                </td>
                <td>{p.start_date?.split("T")[0]}</td>
                <td>
                  <div className="prj-row-actions prj-row-actions--tight">
                    <PrjIconButton
                      title="Manage"
                      ariaLabel={`Manage ${p.name}`}
                      variant="primary"
                      icon={"✎"}
                      onClick={() => handleOpenManageModal(p)}
                    />
                    <PrjIconButton
                      title="Delete"
                      ariaLabel={`Delete ${p.name}`}
                      variant="danger"
                      icon={"🗑"}
                      onClick={() => handleDeleteProject(p.project_id)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== Add/Manage Project Modal ===== */}
      {hubModal.show && (
        <div className="prj-modal-overlay" onClick={resetHubModal}>
          <div
            className="prj-modal prj-modal--large"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="prjModalTitle"
          >
            <div className="prj-modal-header">
              <h2 id="prjModalTitle">
                {hubModal.mode === "add" ? "Add New Project" : `Manage: ${hubModal.projectData.name}`}
              </h2>
              <div className="prj-modal-header__actions">
                <PrjIconButton title="Close" icon="✖" onClick={resetHubModal} ariaLabel="Close modal" />
              </div>
            </div>

            {/* ===== Modal Tabs (Overview | Team & Roles) ===== */}
            <div className="prj-modal-tabs">
              <button
                type="button"
                className={`prj-tab-btn ${modalActiveTab === "overview" ? "prj-active" : ""}`}
                onClick={() => setModalActiveTab("overview")}
              >
                Overview
              </button>
              <button
                type="button"
                className={`prj-tab-btn ${modalActiveTab === "team" ? "prj-active" : ""}`}
                onClick={() => setModalActiveTab("team")}
                disabled={!hubModal.projectData?.project_id}
                title={!hubModal.projectData?.project_id ? "Save Overview first" : "Team & Roles"}
              >
                Team & Roles
              </button>
            </div>

            {/* ===== Tab Panel ===== */}
            <div className="prj-modal-tab-panel">
              {/* --- Overview --- */}
              {modalActiveTab === "overview" && (
                <form className="prj-overview-grid" onSubmit={(e) => e.preventDefault()}>
                  <label>Project Name</label>
                  <input
                    name="name"
                    placeholder="Name"
                    value={hubModal.projectData.name || ""}
                    onChange={handleModalFormChange}
                  />

                  <label>Description</label>
                  <textarea
                    name="description"
                    placeholder="Description"
                    value={hubModal.projectData.description || ""}
                    onChange={handleModalFormChange}
                  />

                  <label>Start Date</label>
                  <input
                    name="start_date"
                    type="date"
                    value={hubModal.projectData.start_date || ""}
                    onChange={handleModalFormChange}
                  />

                  <label>End Date (optional)</label>
                  <input
                    name="end_date"
                    type="date"
                    value={hubModal.projectData.end_date || ""}
                    onChange={handleModalFormChange}
                  />

                  <label>Budget</label>
                  <input
                    name="budget"
                    type="number"
                    placeholder="Budget"
                    value={hubModal.projectData.budget || ""}
                    onChange={handleModalFormChange}
                  />

                  <label>Linked Technology (optional)</label>
                  <select
                    name="tech_id"
                    value={hubModal.projectData.tech_id || ""}
                    onChange={handleModalFormChange}
                  >
                    <option value="">-- Select a Technology --</option>
                    {allTechnologies.map((tech) => (
                      <option key={tech.tech_id} value={tech.tech_id}>
                        {tech.name} (ID: {tech.tech_id})
                      </option>
                    ))}
                  </select>

                  <div className="prj-form-buttons">
                    <button className="prj-save-btn" onClick={handleSaveProject}>
                      {hubModal.mode === "add" ? "Save and Continue" : "Save Changes"}
                    </button>
                  </div>
                </form>
              )}

              {/* --- Team & Roles --- */}
              {modalActiveTab === "team" && (
                <>
                  <div className="prj-divider" />
                  <h3 className="prj-subtitle">Team & Roles</h3>
{/* ===== Current Team ===== */}
<div className="prj-searchable-table" style={{ marginBottom: "1rem" }}>
  <table>
    <thead>
      <tr>
        <th>Employee</th>
        <th>Role</th>
        <th style={{ width: 100, textAlign: "center" }}>Actions</th>
      </tr>
    </thead>
    <tbody>
      {(hubModal.relatedData?.team || []).length > 0 ? (
        hubModal.relatedData.team.map((m) => (
          <tr key={m.id ?? `${m.employee_id}-${hubModal.projectData.project_id}`}>
            <td>{m.employee_name ?? m.name}</td>
            <td>{m.role}</td>
            <td style={{ textAlign: "center" }}>
              <button
                className="prj-icon-btn prj-icon-btn--danger"
                title="Unlink"
                onClick={() => handleUnlinkTeam(m.id)}
              >
                🗑
              </button>
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="3" style={{ textAlign: "center" }}>No team linked yet.</td>
        </tr>
      )}
    </tbody>
  </table>
</div>

                  <div className="prj-collab-grid">
                    {/* LEFT: filters + searchable employees */}
                    <div className="prj-collab-left">
                      <div className="prj-field">
                        <label className="prj-field__label">Role for selected</label>
                        <input
                          type="text"
                          className="prj-field__input"
                          placeholder="Lead / Researcher / Analyst"
                          value={teamRole}
                          onChange={(e) => setTeamRole(e.target.value)}
                        />
                      </div>

                      <div className="prj-field">
                        <label className="prj-field__label">Available Employees</label>
                        <input
                          type="text"
                          className="prj-field__input"
                          placeholder="Search employees..."
                          value={teamSearch}
                          onChange={(e) => setTeamSearch(e.target.value)}
                        />
                      </div>

                      <div className="prj-searchable-table prj-searchable-table--lg">
                        <table>
                          <thead>
                            <tr>
                              <th style={{ width: 60, textAlign: "center" }}>Select</th>
                              <th style={{ width: 90, textAlign: "center" }}>ID</th>
                              <th>Name</th>
                              <th>Dept</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredEmployees.map((emp) => (
                              <tr key={emp.employee_id} className="prj-row-hover">
                                <td style={{ textAlign: "center" }}>
                                  <input
                                    type="checkbox"
                                    checked={selectedTeamMembers.includes(emp.employee_id)}
                                    onChange={(e) => {
                                      const id = emp.employee_id;
                                      setSelectedTeamMembers((prev) =>
                                        e.target.checked ? [...prev, id] : prev.filter((i) => i !== id)
                                      );
                                    }}
                                  />
                                </td>
                                <td style={{ textAlign: "center" }}>{emp.employee_id}</td>
                                <td>{emp.name}</td>
                                <td>{emp.department}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* RIGHT: selected summary + action */}
                    <aside className="prj-collab-right">
                      <div className="prj-selected-header">
                        <h5>Selected ({selectedTeamMembers.length})</h5>
                        <button
                          className="prj-text-btn"
                          onClick={() => setSelectedTeamMembers([])}
                          disabled={selectedTeamMembers.length === 0}
                        >
                          Clear
                        </button>
                      </div>

                      <div className="prj-chiplist">
                        {selectedTeamMembers.length === 0 ? (
                          <div className="prj-empty-hint">No employees selected yet.</div>
                        ) : (
                          selectedTeamMembers
                            .map((id) => employees.find((e) => e.employee_id === id))
                            .filter(Boolean)
                            .map((e) => (
                              <span key={e.employee_id} className="prj-chip">
                                <span className="prj-chip__text">{e.name}</span>
                                <button
                                  className="prj-chip__remove"
                                  onClick={() =>
                                    setSelectedTeamMembers((prev) => prev.filter((i) => i !== e.employee_id))
                                  }
                                  aria-label="Remove"
                                >
                                  ✕
                                </button>
                              </span>
                            ))
                        )}
                      </div>

                      <div className="prj-sticky-actions">
                        <button
                          className="prj-primary-btn"
                          onClick={handleLinkTeamMembers}
                          disabled={
                            !hubModal.projectData?.project_id ||
                            selectedTeamMembers.length === 0 ||
                            !teamRole.trim()
                          }
                          title={
                            !hubModal.projectData?.project_id
                              ? "Save the project first"
                              : selectedTeamMembers.length === 0
                              ? "Select employees"
                              : !teamRole.trim()
                              ? "Enter a role"
                              : "Link employees"
                          }
                        >
                          🔗 Link Selected Employees
                        </button>
                      </div>
                    </aside>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
