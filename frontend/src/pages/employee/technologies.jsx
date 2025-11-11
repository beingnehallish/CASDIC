
import { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/employee.technologies.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
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

const CustomGraphTooltip = ({ active, payload, label, onManage }) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload || {};
  const title = label || data.name || data.status || "Details";
  const techs = Array.isArray(data.techs) ? data.techs : [];

  const handleManageClick = (e, tech) => {
    e.preventDefault();
    e.stopPropagation();
    if (onManage) onManage(tech);
  };

  return (
    <div className="cg-tooltip" role="dialog" aria-label="Chart details">
      <div className="cg-tooltip__header">
        <div className="cg-tooltip__title">{title}</div>
        <div className="cg-tooltip__meta">
          <span className="cg-tooltip__badge">{data.count ?? techs.length}</span>
          <span className="cg-tooltip__label">items</span>
        </div>
      </div>

      {techs.length > 0 ? (
        <ul className="cg-tooltip__list">
          {techs.map((t) => (
            <li key={t.tech_id} className="cg-tooltip__row">
              <span className="cg-tooltip__name" title={t.name}>{t.name}</span>
              {t.trl_achieved != null && (
                <span className="cg-tooltip__pill">TRL {t.trl_achieved}</span>
              )}
              <button
                type="button"
                className="cg-tooltip__manage-btn"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => handleManageClick(e, t)}
                aria-label={`Manage ${t.name}`}
                title="Manage"
              >
                Manage
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="cg-tooltip__empty">No technologies for this point</div>
      )}
    </div>
  );
};
/* === UI helpers (lightweight, no deps) === */
const StatusPill = ({ value }) => {
  const color =
    value === "In Use" ? "pill--success" :
    value === "Deprecated" ? "pill--danger" :
    "pill--warn";
  return <span className={`pill ${color}`}>{value}</span>;
};

const TRLPill = ({ level }) => (
  <span className="pill pill--trl">TRL {level ?? "-"}</span>
);

const IconButton = ({ title, onClick, icon, variant="ghost", ariaLabel }) => (
  <button
    className={`icon-btn icon-btn--${variant}`}
    onClick={onClick}
    type="button"
    aria-label={ariaLabel || title}
    title={title}
  >
    {icon}
  </button>
);

const SectionTitle = ({ children }) => (
  <h4 className="section-title">{children}</h4>
);

const Label = ({ children }) => (
  <label className="ov-label">{children}</label>
);

// --- NEW EDITABLE TAB COMPONENT ---
// --- EDITABLE TAB COMPONENT (fixed) ---
const toISODate = (date) =>
  date instanceof Date && !isNaN(date) ? date.toISOString().split("T")[0] : "";

const fromISODate = (value) => (value ? new Date(value) : null);
const isDateField = (col) => col?.type === "date" || /date/i.test(col?.key || "");
const isBoolField = (col) => col?.type === "bool" || col?.key === "configurable";

const EditableTabPanel = ({ title, data, columns, apiEndpoint, techId, token, onDataChange }) => {
  const [editRowId, setEditRowId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({});

  const getEmptyForm = () =>
    columns.reduce((acc, col) => ({ ...acc, [col.key]: "" }), {});

  const handleAdd = () => {
    setFormData(getEmptyForm());
    setIsAdding(true);
    setEditRowId(null);
  };

  const handleEdit = (row) => {
    setFormData(row);
    setEditRowId(row[columns.find((c) => c.isId).key]);
    setIsAdding(false);
  };

  const handleCancel = () => {
    setFormData({});
    setEditRowId(null);
    setIsAdding(false);
  };

  const handleColValueChange = (key, v) => {
    setFormData((prev) => ({ ...prev, [key]: v }));
  };

  const renderInputForCol = (col, value, onChange) => {
    if (isDateField(col)) {
      return (
        <DatePicker
          selected={fromISODate(value)}
          onChange={(d) => onChange(col.key, d ? toISODate(d) : null)}
          placeholderText={col.label}
          className="date-input"
          isClearable
        />
      );
    }
    if (isBoolField(col)) {
      return (
        <input
          type="checkbox"
          checked={!!value}
          onChange={(e) => onChange(col.key, e.target.checked ? 1 : 0)}
        />
      );
    }
    return (
      <input
        type="text"
        name={col.key}
        value={value ?? ""}
        onChange={(e) => onChange(col.key, e.target.value)}
        placeholder={col.label}
        className="form-input"
      />
    );
  };

 const handleSave = async () => {
  try {
    // 1) Build body from formData
    let body = { ...formData };

    // 2) Inject parent tech id on create
    if (isAdding) body.tech_id = techId;

    // 3) Normalize values: trim strings, map "" -> null, empty dates -> null
    Object.keys(body).forEach((k) => {
      const v = body[k];
      if (typeof v === "string") {
        const trimmed = v.trim();
        body[k] = trimmed === "" ? null : trimmed;
      }
      if (/date/i.test(k) && (v === "" || v === undefined)) {
        body[k] = null;
      }
    });

    // 4) Simple per-tab validation (now uses body, not payload)
    if (apiEndpoint === "specs") {
      const name = (body.parameter_name ?? "").toString().trim();
      const value = (body.parameter_value ?? "").toString().trim();
      if (!name || !value) {
        alert("Please fill both Parameter and Value for the specification.");
        return;
      }
    }

    // 5) Optionally drop nulls your backend doesn’t want (keep tech_id)
    Object.keys(body).forEach((k) => {
      if (body[k] === null && k !== "tech_id") delete body[k];
    });

    if (isAdding) {
      if (!body.tech_id) {
        alert("Please save the technology overview first so we have a tech_id.");
        return;
      }
      await axios.post(`http://localhost:5000/api/${apiEndpoint}`, body, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } else {
      const idKeyObj = columns.find((c) => c.isId);
      if (!idKeyObj) {
        alert("No id column configured for this tab.");
        return;
      }
      await axios.put(
        `http://localhost:5000/api/${apiEndpoint}/${editRowId}`,
        body,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }

    onDataChange();
    handleCancel();
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.response?.data ||
      err?.message ||
      "Unknown error";
    console.error(`Failed to save ${title}`, err);
    alert(`Error saving ${title}: ${msg}`);
  }
};

  const handleDelete = async (row) => {
    const idKey = columns.find((c) => c.isId).key;
    const id = row[idKey];
    if (!window.confirm(`Delete this ${title.slice(0, -1)}?`)) return;
    try {
      await axios.delete(`http://localhost:5000/api/${apiEndpoint}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onDataChange();
    } catch (err) {
      console.error(`Failed to delete ${title}`, err);
      alert(`Error deleting ${title}`);
    }
  };

  const renderRow = (row) => {
    const idKey = columns.find((c) => c.isId).key;
    const isEditing = row[idKey] === editRowId;

    if (isEditing) {
      return (
        <tr key={`edit-${row[idKey]}`}>
          {columns
            .filter((c) => !c.isId)
            .map((col) => (
              <td key={col.key}>
                {renderInputForCol(col, formData[col.key], handleColValueChange)}
              </td>
            ))}
          <td className="row-actions">
            <button className="save-btn-inline" onClick={handleSave}>💾</button>
            <button className="cancel-btn-inline" onClick={handleCancel}>✖</button>
          </td>
        </tr>
      );
    }

    // read-only row
    return (
      <tr key={row[idKey]}>
        {columns.filter((c) => !c.isId).map((col) => {
          const val = row[col.key];
          const display =
            isDateField(col) && val ? toISODate(new Date(val)) : val?.toString?.();
          return <td key={col.key}>{display ?? ""}</td>;
        })}
        <td className="row-actions">
          <button className="edit-btn-inline" onClick={() => handleEdit(row)}>✎</button>
          <button className="delete-btn-inline" onClick={() => handleDelete(row)}>🗑</button>
        </td>
      </tr>
    );
  };

  return (
    <div className="modal-tab-content editable-table-container">
      <div className="editable-table-header">
        <h4>{title}</h4>
        {!isAdding && !editRowId && (
          <button className="add-btn" onClick={handleAdd}>➕ Add New</button>
        )}
      </div>

      <table>
        <thead>
          <tr>
            {columns.filter((c) => !c.isId).map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
  {data.map((row) => renderRow(row))}

  {isAdding && (
    <tr key="add-row">
      {columns.filter((c) => !c.isId).map((col) => (
        <td key={col.key}>
          {renderInputForCol(col, formData[col.key], handleColValueChange)}
        </td>
      ))}
      <td className="row-actions">
        <button className="save-btn-inline" onClick={handleSave}>💾</button>
        <button className="cancel-btn-inline" onClick={handleCancel}>✖</button>
      </td>
    </tr>
  )}
</tbody>


      </table>

      {data.length === 0 && !isAdding && (
        <p className="no-data-message">
          No {title.toLowerCase()} data found for this technology.
        </p>
      )}
    </div>
  );
};
// --- END EDITABLE TAB COMPONENT ---


export default function TechnologiesPage() {
  const token = localStorage.getItem("token");

  // Graph data
  const [trlData, setTrlData] = useState([]);
  const [productionData, setProductionData] = useState([]);
  const [statusData, setStatusData] = useState([]);

  // Main technology list
  const [technologies, setTechnologies] = useState([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add' or 'edit'
  const [modalTechId, setModalTechId] = useState(null);
  const [modalFormData, setModalFormData] = useState({});
  const [modalRelatedData, setModalRelatedData] = useState({});
  const [modalActiveTab, setModalActiveTab] = useState("overview");
// NEW: inner tabs for Overview
const [overviewSubTab, setOverviewSubTab] = useState("core"); 
  // Filters State
  const [techFilters, setTechFilters] = useState({
    keyword: "",
    category: "",
    status: "",
    trlMin: "",
    trlMax: "",
    budgetMin: "",
    budgetMax: "",
    security: "",
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Friendly names for table headers
  const friendlyNames = {
    name: "Name",
    category: "Category",
    status: "Status",
    trl_achieved: "TRL Achieved",
    tech_id: "Tech ID",
    version_number: "Version",
    release_date: "Release Date",
    notes: "Notes",
    parameter_name: "Parameter",
    parameter_value: "Value",
    requirement: "Requirement",
    achieved_status: "Achieved",
    date_achieved: "Date",
    spec_id: "Spec ID",
    version_id: "Version ID",
    hw_id: "HW ID",
    sw_id: "SW ID",
    // ... add any other field names
  };

  // --- Data Fetching ---

  const fetchTechnologies = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/technologies", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTechnologies(res.data);
      // Process data for charts
      processGraphData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTechnologies();
  }, [token]); 

  const processGraphData = (techData) => {
    // 1. TRL Chart
    const trlCounts = Array.from({ length: 10 }, (_, i) => {
      const trl = i + 1;
      const techs = techData.filter((t) => t.trl_achieved === trl);
      return { name: `TRL ${trl}`, count: techs.length, techs };
    });
    setTrlData(trlCounts);

    // 2. Production Year Chart
    const yearCountsMap = {};
    techData.forEach((t) => {
      if (t.production_start_date) {
        const year = new Date(t.production_start_date).getFullYear();
        if (!yearCountsMap[year]) yearCountsMap[year] = { count: 0, techs: [] };
        yearCountsMap[year].count++;
        yearCountsMap[year].techs.push(t);
      }
    });
    const prodData = Object.entries(yearCountsMap)
      .map(([year, obj]) => ({ year: +year, count: obj.count, techs: obj.techs }))
      .sort((a, b) => a.year - b.year);
    setProductionData(prodData);

    // 3. Status Chart
    const statuses = ["In Development", "In Use", "Deprecated"];
    const statusCounts = statuses.map((s) => {
      const techs = techData.filter((t) => t.status === s);
      return { status: s, count: techs.length, techs };
    });
    setStatusData(statusCounts);
  };

  // --- Modal Logic ---

  const resetModalState = () => {
    setIsModalOpen(false);
    setModalTechId(null);
    setModalFormData({});
    setModalRelatedData({});
    setModalActiveTab("overview");
  };

  const refreshRelatedData = async (techId) => {
    if (!techId) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/technologies/details/${techId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setModalRelatedData(res.data);
    } catch (err) {
      console.error("Failed to fetch tech details", err);
      setModalRelatedData({});
    }
  };

  const handleOpenAddModal = () => {
    resetModalState();
    setModalMode("add");
    setModalFormData({
  // Core
  name: "",
  category: "",
  status: "In Development",

  // Dates
  production_start_date: null,
  last_usage_date: null,

  // TRL
  trl_start: "",
  trl_achieved: "",
  trl_description: "",

  // Money & Security
  budget: "",
  security_level: "Public",

  // Location & Tech
  location: "",
  tech_stack: "",

  // Highlights
  salient_features: "",
  achievements: "",

  // Image
  image_path: "",

  // Project & Funding
  dev_proj_name: "",
  dev_proj_number: "",
  dev_proj_code: "",
  funding_details: "",
});

    setIsModalOpen(true);
  };

  const handleOpenEditModal = async (tech) => {
    resetModalState();
    setModalMode("edit");
    setModalTechId(tech.tech_id);
    setModalFormData({
  ...tech,
  production_start_date: tech.production_start_date ? tech.production_start_date : null,
  last_usage_date: tech.last_usage_date ? tech.last_usage_date : null,
});
    setIsModalOpen(true);
    await refreshRelatedData(tech.tech_id); // Fetch related data ON DEMAND
  };

  const handleModalSave = async (e) => {
    e?.preventDefault();
    if (!window.confirm(modalMode === "add" ? "Add new technology?" : "Update this technology?")) return;

    try {
      let response;
      if (modalMode === "add") {
        response = await axios.post("http://localhost:5000/api/technologies", modalFormData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // --- This is the new workflow ---
        // After adding, switch to edit mode for the new item
        setModalMode("edit");
        const newTechId = response.data.tech_id; // Get new ID from server response
        setModalTechId(newTechId);
        setModalFormData(prev => ({...prev, tech_id: newTechId})); // Update form data with new ID
        await refreshRelatedData(newTechId); // Load (empty) related data
        alert("Technology added. You can now add specs, hardware, etc.");
      } else {
        await axios.put(`http://localhost:5000/api/technologies/${modalTechId}`, modalFormData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Technology updated.");
      }
      // Refresh main table and graphs
      fetchTechnologies();
    } catch (err) {
      console.error(err);
      alert("Failed to save technology.");
    }
  };

  // *** NEW DELETE FUNCTION ***
  const handleDeleteTechnology = async (techId) => {
    if (!window.confirm("Are you sure you want to delete this technology? This action cannot be undone.")) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/technologies/${techId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Technology deleted successfully.");
      fetchTechnologies(); // Refresh the list
    } catch (err) {
      console.error("Failed to delete technology:", err);
      alert("Error: Failed to delete technology. It may be linked to other items (projects, patents, etc).");
    }
  };
  // one pinned tooltip per chart type
const [pinned, setPinned] = useState({
  trl: null,       // { payload, label }
  production: null,
  status: null,
});

const pinTooltip = (chartKey, payload, label) => {
  setPinned(prev => ({ ...prev, [chartKey]: { payload, label } }));
};

const unpinTooltip = (chartKey) => {
  setPinned(prev => ({ ...prev, [chartKey]: null }));
};
// --- Sort State ---
const [sort, setSort] = useState({ field: "", order: "asc" }); // field: 'production_start_date' | 'trl_achieved' | 'budget' | ''

const toggleSortOrder = () =>
  setSort((s) => ({ ...s, order: s.order === "asc" ? "desc" : "asc" }));

const handleSortFieldChange = (e) => {
  const field = e.target.value;
  setSort((s) => ({
    field,
    // when user picks a new field, default to asc
    order: field ? "asc" : s.order,
  }));
};

// normalize for safe comparisons (dates/numbers/strings)
const norm = (val, field) => {
  if (val == null || val === "" || Number.isNaN(val)) return null;

  if (field === "production_start_date") {
    // expect 'YYYY-MM-DD' from your DatePicker; fallback to Date parse if needed
    return typeof val === "string" ? new Date(val) : new Date(val);
  }
  if (field === "trl_achieved" || field === "trl_start" || field === "budget") {
    const n = Number(val);
    return Number.isFinite(n) ? n : null;
  }
  return val;
};

// stable, null-safe comparator
const cmpBy = (a, b, field, order) => {
  const av = norm(a?.[field], field);
  const bv = norm(b?.[field], field);

  // nulls always pushed to the end, regardless of order
  const aNull = av === null;
  const bNull = bv === null;
  if (aNull && bNull) return 0;
  if (aNull) return 1;
  if (bNull) return -1;

  let base = 0;
  if (av instanceof Date && bv instanceof Date) {
    base = av - bv;
  } else if (typeof av === "number" && typeof bv === "number") {
    base = av - bv;
  } else {
    base = String(av).localeCompare(String(bv));
  }

  const dir = order === "asc" ? 1 : -1;
  if (base !== 0) return base * dir;

  // tie-breaker: name asc to keep UX stable
  return String(a?.name ?? "").localeCompare(String(b?.name ?? ""));
};

// close pinned tooltip with Esc
useEffect(() => {
  const onKey = (e) => {
    if (e.key === "Escape") setPinned({ trl: null, production: null, status: null });
  };
  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}, []);

  // --- Filter Logic ---

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setTechFilters(prev => ({ ...prev, [name]: value }));
  };

  const filteredTechnologies = technologies.filter((t) => {
    if (!t) return false; // Added safety check
    const keyword = techFilters.keyword?.toLowerCase() || "";
    return (
      (t?.name?.toLowerCase?.().includes(keyword) || false) &&
      (!techFilters.category || t?.category === techFilters.category) &&
      (!techFilters.status || t?.status === techFilters.status) &&
      (!techFilters.trlMin || Number(t?.trl_start || 0) >= Number(techFilters.trlMin)) &&
      (!techFilters.trlMax || Number(t?.trl_achieved || 0) <= Number(techFilters.trlMax)) &&
      (!techFilters.budgetMin || Number(t?.budget || 0) >= Number(techFilters.budgetMin)) &&
      (!techFilters.budgetMax || Number(t?.budget || 0) <= Number(techFilters.budgetMax)) &&
      (!techFilters.security || t?.security_level === techFilters.security)
    );
  });
const sortedTechnologies = (() => {
  if (!sort.field) return filteredTechnologies;
  // slice() to avoid mutating the filtered array
  return filteredTechnologies.slice().sort((a, b) => cmpBy(a, b, sort.field, sort.order));
})();

  // --- Render ---

  return (
    <div className="empsection">
      <div className="tech-table-actions">
        <button className="add-btn" onClick={handleOpenAddModal}>
          ➕ Add Technology
        </button>
      </div>
      <div className="empsection-header">
        <h2>TECHNOLOGIES</h2>
        <p>Total Technologies: {technologies.length}</p>
      </div>

      {/* ---------- Graphs ---------- */}
      <div className="tech-graphs">
        <div className="graph-card">
  <h3>TRL Achieved</h3>

  <div className="chart-with-overlay">
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={trlData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis allowDecimals={false} />
        <Tooltip content={(p) => <CustomGraphTooltip {...p} onManage={handleOpenEditModal} />} />
        <Bar
          dataKey="count"
          fill="#22a085"
          onClick={(barData) => {
            pinTooltip("trl", barData?.payload, barData?.payload?.name || "TRL");
          }}
        />
      </BarChart>
    </ResponsiveContainer>

    {pinned.trl && (
      <div className="cg-tooltip-pinned">
        <button className="cg-tooltip-close" onClick={() => unpinTooltip("trl")} aria-label="Close">✖</button>
        <CustomGraphTooltip
          active
          payload={[{ payload: pinned.trl.payload }]}
          label={pinned.trl.label}
          onManage={handleOpenEditModal}
        />
      </div>
    )}
  </div>
</div>

     <div className="graph-card">
  <h3>Production Year</h3>

  <div className="chart-with-overlay">
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={productionData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" type="number" domain={productionData.length ? ['dataMin','dataMax'] : undefined} allowDecimals={false} />
        <YAxis allowDecimals={false} />
        <Tooltip content={(p) => <CustomGraphTooltip {...p} onManage={handleOpenEditModal} />} />
        <Line
          type="monotone"
          dataKey="count"
          stroke="#2980b9"
          activeDot={{
            r: 6,
            onClick: (e) => {
              const payload = e?.payload; // safer
              pinTooltip("production", payload, `Year ${payload?.year}`);
            }
          }}
        />
      </LineChart>
    </ResponsiveContainer>

    {pinned.production && (
      <div className="cg-tooltip-pinned">
        <button className="cg-tooltip-close" onClick={() => unpinTooltip("production")} aria-label="Close">✖</button>
        <CustomGraphTooltip
          active
          payload={[{ payload: pinned.production.payload }]}
          label={pinned.production.label}
          onManage={handleOpenEditModal}
        />
      </div>
    )}
  </div>
</div>

       <div className="graph-card">
  <h3>Status</h3>

  <div className="chart-with-overlay">
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={statusData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="status" />
        <YAxis allowDecimals={false} />
        <Tooltip content={(p) => <CustomGraphTooltip {...p} onManage={handleOpenEditModal} />} />
        <Bar
          dataKey="count"
          fill="#e67e22"
          onClick={(barData) => {
            pinTooltip("status", barData?.payload, barData?.payload?.status || "Status");
          }}
        />
      </BarChart>
    </ResponsiveContainer>

    {pinned.status && (
      <div className="cg-tooltip-pinned">
        <button className="cg-tooltip-close" onClick={() => unpinTooltip("status")} aria-label="Close">✖</button>
        <CustomGraphTooltip
          active
          payload={[{ payload: pinned.status.payload }]}
          label={pinned.status.label}
          onManage={handleOpenEditModal}
        />
      </div>
    )}
  </div>
</div>

      </div>

      {/* ---------- Filters ---------- */}
      <div className="filters-panel-wrapper">
        <div className="filters-panel">
          <input
            type="text"
            name="keyword"
            placeholder="🔎 Search..."
            value={techFilters.keyword}
            onChange={handleFilterChange}
          />
          <select name="category" value={techFilters.category} onChange={handleFilterChange}>
            <option value="">All Categories</option>
            {[...new Set(technologies.map((t) => t.category))].filter(Boolean).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select name="status" value={techFilters.status} onChange={handleFilterChange}>
            <option value="">All Status</option>
            <option value="In Development">In Development</option>
            <option value="In Use">In Use</option>
            <option value="Deprecated">Deprecated</option>
          </select>
          <button className="advanced-filter-btn" onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>
            {showAdvancedFilters ? "Hide" : "Show"} Advanced Filters
          </button>
        </div>

        {showAdvancedFilters && (
          <div className="filters-panel advanced-filters">
            <input
              type="number"
              name="trlMin"
              placeholder="TRL min"
              value={techFilters.trlMin}
              onChange={handleFilterChange}
            />
            <input
              type="number"
              name="trlMax"
              placeholder="TRL max"
              value={techFilters.trlMax}
              onChange={handleFilterChange}
            />
            <input
              type="number"
              name="budgetMin"
              placeholder="Budget min"
              value={techFilters.budgetMin}
              onChange={handleFilterChange}
            />
            <input
              type="number"
              name="budgetMax"
              placeholder="Budget max"
              value={techFilters.budgetMax}
              onChange={handleFilterChange}
            />
            <select name="security" value={techFilters.security} onChange={handleFilterChange}>
              <option value="">All Security</option>
              <option value="Public">Public</option>
              <option value="Restricted">Restricted</option>
              <option value="Confidential">Confidential</option>
            </select>
          </div>
        )}
      </div>
{/* ---------- Sort Controls ---------- */}
<div className="filters-panel" role="group" aria-label="Sort technologies">
  <div className="sort-left">
    <label htmlFor="sortField" className="sort-label">Sort by</label>
    <select
      id="sortField"
      value={sort.field}
      onChange={handleSortFieldChange}
    >
      <option value="">None</option>
      <option value="production_start_date">Start Date</option>
      <option value="trl_achieved">TRL Achieved</option>
      <option value="budget">Budget</option>
    </select>
  </div>

  <button
    type="button"
    className="advanced-filter-btn"
    onClick={toggleSortOrder}
    disabled={!sort.field}
    aria-pressed={sort.order === "desc"}
    aria-label={`Sort order: ${sort.order === "asc" ? "Ascending" : "Descending"}`}
    title={sort.field ? `Toggle to ${sort.order === "asc" ? "Descending" : "Ascending"}` : "Select a sort field first"}
  >
    <span className="sort-order-icon" aria-hidden="true">
      {sort.order === "asc" ? " ▲ " : " ▼ "}
    </span>
    <span className="sort-order-text">{sort.order === "asc" ? "Ascending" : "Descending"}</span>
  </button>
</div>


      {/* ---------- Filtered Table ---------- */}
      <div className="reports-results">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Category</th>
              <th>Status</th>
              
              <th style={{width: "150px"}}>Actions</th>
            </tr>
          </thead>
          <tbody>
  {sortedTechnologies.map((t) => (
    <tr key={t.tech_id}>
      <td>{t.tech_id}</td>
      <td>
        <div className="cell-title">
          <span className="cell-title__name">{t.name}</span>
          {Number.isFinite(t.trl_achieved) && <TRLPill level={t.trl_achieved} />}
        </div>
      </td>
      <td>
        <span className="chip">{t.category || "—"}</span>
      </td>
      <td><StatusPill value={t.status} /></td>
      <td>
        <div className="row-actions tight">
          <IconButton
            title="Manage"
            ariaLabel={`Manage ${t.name}`}
            variant="primary"
            icon={"✎"}
            onClick={() => handleOpenEditModal(t)}
          />
          <IconButton
            title="Delete"
            ariaLabel={`Delete ${t.name}`}
            variant="danger"
            icon={"🗑"}
            onClick={() => handleDeleteTechnology(t.tech_id)}
          />
        </div>
      </td>
    </tr>
  ))}
</tbody>

        </table>
      </div>

      {/* ---------- Add/Edit Tabbed Modal ---------- */}
      {isModalOpen && (
  <div className="modal-overlay" onClick={resetModalState}>
    <div
      className="modal-content large"
      onClick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="techModalTitle"
    >
      {/* Header */}
      <div className="modal-header">
        <h2 id="techModalTitle">
          {modalMode === "add" ? "Add New Technology" : `Manage: ${modalFormData.name}`}
        </h2>
        <div className="modal-header__actions">
          <IconButton title="Close" icon="✖" onClick={resetModalState} ariaLabel="Close modal" />
        </div>
      </div>

      {/* Top Tabs */}
      <div className="modal-tabs" role="tablist" aria-label="Technology sections">
        {["overview","specs","hardware","software","versions"].map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={modalActiveTab === tab}
            className={`tab-btn ${modalActiveTab === tab ? "active" : ""}`}
            onClick={() => setModalActiveTab(tab)}
            disabled={modalMode === "add" && tab !== "overview"}
          >
            {tab === "overview" ? "Overview" :
             tab === "specs" ? "Specifications" :
             tab === "hardware" ? "Hardware" :
             tab === "software" ? "Software" : "Versions"}
          </button>
        ))}
      </div>

      {/* Panel */}
      <div className="modal-tab-panel">
        {modalActiveTab === "overview" && (
          <div className="modal-tab-content">
            {/* Sub-tabs */}
            
            <div className="subtabs" role="tablist" aria-label="Overview sub sections">
              {[
                ["core","Core"],
                ["trl","TRL Info"],
                ["dates","Dates"],
                ["security","Security & Location"],
                ["project","Project & Funding"],
                ["tech","Tech Stack & Highlights"],
                ["image","Image"]
              ].map(([key,label]) => (
                <button
                  key={key}
                  role="tab"
                  aria-selected={overviewSubTab === key}
                  type="button"
                  className={`subtab-btn ${overviewSubTab === key ? "active" : ""}`}
                  onClick={() => setOverviewSubTab(key)}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Form */}
            <form className="overview-grid" onSubmit={handleModalSave}>
              {overviewSubTab === "core" && (
                <>
                  <SectionTitle>Core</SectionTitle>
                  <Label>Technology Name</Label>
                  <input
                    placeholder="Technology Name"
                    value={modalFormData.name || ""}
                    onChange={(e) => setModalFormData({ ...modalFormData, name: e.target.value })}
                  />

                  <Label>Category</Label>
                  <input
                    placeholder="Category"
                    value={modalFormData.category || ""}
                    onChange={(e) => setModalFormData({ ...modalFormData, category: e.target.value })}
                  />

                  <Label>Status</Label>
                  <select
                    value={modalFormData.status || "In Development"}
                    onChange={(e) => setModalFormData({ ...modalFormData, status: e.target.value })}
                  >
                    <option value="In Development">In Development</option>
                    <option value="In Use">In Use</option>
                    <option value="Deprecated">Deprecated</option>
                  </select>
                </>
              )}

              {overviewSubTab === "trl" && (
                <>
                  <SectionTitle>Technology Readiness Level</SectionTitle>
                  <Label>TRL Start</Label>
                  <input
                    type="number" min="1" max="9"
                    placeholder="1-9"
                    value={modalFormData.trl_start ?? ""}
                    onChange={(e) => setModalFormData({ ...modalFormData, trl_start: e.target.value })}
                  />
                  <Label>TRL Achieved</Label>
                  <input
                    type="number" min="1" max="9"
                    placeholder="1-9"
                    value={modalFormData.trl_achieved ?? ""}
                    onChange={(e) => setModalFormData({ ...modalFormData, trl_achieved: e.target.value })}
                  />
                  <Label>TRL Description</Label>
                  <textarea
                    rows={3}
                    placeholder="Brief description of TRL progress"
                    value={modalFormData.trl_description || ""}
                    onChange={(e) => setModalFormData({ ...modalFormData, trl_description: e.target.value })}
                  />
                </>
              )}

              {overviewSubTab === "dates" && (
                <>
                  <SectionTitle>Dates</SectionTitle>
                  <Label>Production Start Date</Label>
                  <DatePicker
                    className="date-input"
                    selected={modalFormData.production_start_date ? new Date(modalFormData.production_start_date) : null}
                    onChange={(date) =>
                      setModalFormData({
                        ...modalFormData,
                        production_start_date: date ? date.toISOString().split("T")[0] : null,
                      })
                    }
                    placeholderText="Select start date"
                    isClearable
                  />
                  <Label>Last Usage Date</Label>
                  <DatePicker
                    className="date-input"
                    selected={modalFormData.last_usage_date ? new Date(modalFormData.last_usage_date) : null}
                    onChange={(date) =>
                      setModalFormData({
                        ...modalFormData,
                        last_usage_date: date ? date.toISOString().split("T")[0] : null,
                      })
                    }
                    placeholderText="Select last usage date (optional)"
                    isClearable
                  />
                </>
              )}

              {overviewSubTab === "security" && (
                <>
                  <SectionTitle>Security & Location</SectionTitle>
                  <Label>Security Level</Label>
                  <select
                    value={modalFormData.security_level || "Public"}
                    onChange={(e) => setModalFormData({ ...modalFormData, security_level: e.target.value })}
                  >
                    <option value="Public">Public</option>
                    <option value="Restricted">Restricted</option>
                    <option value="Confidential">Confidential</option>
                    <option value="Top Secret">Top Secret</option>
                  </select>
                  <Label>Location</Label>
                  <input
                    placeholder="Lab / City / Site"
                    value={modalFormData.location || ""}
                    onChange={(e) => setModalFormData({ ...modalFormData, location: e.target.value })}
                  />
                </>
              )}

              {overviewSubTab === "project" && (
                <>
                  <SectionTitle>Project & Funding</SectionTitle>
                  <Label>Development Project Name</Label>
                  <input
                    placeholder="Project name"
                    value={modalFormData.dev_proj_name || ""}
                    onChange={(e) => setModalFormData({ ...modalFormData, dev_proj_name: e.target.value })}
                  />
                  <Label>Project Number</Label>
                  <input
                    placeholder="e.g., PRJ-2025-001"
                    value={modalFormData.dev_proj_number || ""}
                    onChange={(e) => setModalFormData({ ...modalFormData, dev_proj_number: e.target.value })}
                  />
                  <Label>Project Code</Label>
                  <input
                    placeholder="e.g., FALCON-X"
                    value={modalFormData.dev_proj_code || ""}
                    onChange={(e) => setModalFormData({ ...modalFormData, dev_proj_code: e.target.value })}
                  />
                  <Label>Budget</Label>
                  <input
                    type="number" step="0.01" min="0"
                    placeholder="Budget in currency"
                    value={modalFormData.budget || ""}
                    onChange={(e) => setModalFormData({ ...modalFormData, budget: e.target.value })}
                  />
                  <Label>Funding Details</Label>
                  <textarea
                    rows={3}
                    placeholder="Grant, investor, cost center, etc."
                    value={modalFormData.funding_details || ""}
                    onChange={(e) => setModalFormData({ ...modalFormData, funding_details: e.target.value })}
                  />
                </>
              )}

              {overviewSubTab === "tech" && (
                <>
                  <SectionTitle>Tech Stack & Highlights</SectionTitle>
                  <Label>Tech Stack</Label>
                  <textarea
                    rows={2}
                    placeholder="Comma-separated (e.g., React, Node.js, PostgreSQL)"
                    value={modalFormData.tech_stack || ""}
                    onChange={(e) => setModalFormData({ ...modalFormData, tech_stack: e.target.value })}
                  />
                  <Label>Salient Features</Label>
                  <textarea
                    rows={3}
                    placeholder="Bullets or short lines"
                    value={modalFormData.salient_features || ""}
                    onChange={(e) => setModalFormData({ ...modalFormData, salient_features: e.target.value })}
                  />
                  <Label>Achievements</Label>
                  <textarea
                    rows={3}
                    placeholder="Awards, milestones, publications"
                    value={modalFormData.achievements || ""}
                    onChange={(e) => setModalFormData({ ...modalFormData, achievements: e.target.value })}
                  />
                </>
              )}

              {overviewSubTab === "image" && (
                <>
                  <SectionTitle>Image</SectionTitle>
                  <Label>Image Path / URL</Label>
                  <input
                    placeholder="/uploads/tech123.png or https://..."
                    value={modalFormData.image_path || ""}
                    onChange={(e) => setModalFormData({ ...modalFormData, image_path: e.target.value })}
                  />
                </>
              )}

              {/* Sticky footer */}
              <div className="form-buttons">
                <button className="add-btn" type="submit">
                  {modalMode === "add" ? "Save and Continue" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        )}

        {modalActiveTab === "specs" && (
          <EditableTabPanel
            key="specs"
            title="Specifications"
            apiEndpoint="specs"
            data={modalRelatedData.specs || []}
            columns={[
              { key: 'spec_id', label: 'ID', isId: true },
              { key: 'parameter_name', label: 'Parameter' },
              { key: 'parameter_value', label: 'Value' },
              { key: 'unit', label: 'Unit' },
            ]}
            techId={modalTechId}
            token={token}
            onDataChange={() => refreshRelatedData(modalTechId)}
          />
        )}

        {modalActiveTab === "hardware" && (
          <EditableTabPanel
            key="hardware"
            title="Hardware Qualifications"
            apiEndpoint="hw"
            data={modalRelatedData.hw || []}
            columns={[
              { key: 'hw_id', label: 'ID', isId: true },
              { key: 'requirement', label: 'Requirement' },
              { key: 'achieved_status', label: 'Status' },
              { key: 'date_achieved', label: 'Date', type: 'date' }
            ]}
            techId={modalTechId}
            token={token}
            onDataChange={() => refreshRelatedData(modalTechId)}
          />
        )}

        {modalActiveTab === "software" && (
          <EditableTabPanel
            key="software"
            title="Software Qualifications"
            apiEndpoint="sw"
            data={modalRelatedData.sw || []}
            columns={[
              { key: 'sw_id', label: 'ID', isId: true },
              { key: 'requirement', label: 'Requirement' },
              { key: 'achieved_status', label: 'Status' },
              { key: 'date_achieved', label: 'Date', type: 'date' }
            ]}
            techId={modalTechId}
            token={token}
            onDataChange={() => refreshRelatedData(modalTechId)}
          />
        )}

        {modalActiveTab === "versions" && (
          <EditableTabPanel
            key="versions"
            title="Versions"
            apiEndpoint="versions"
            data={modalRelatedData.versions || []}
            columns={[
              { key: 'version_id', label: 'ID', isId: true },
              { key: 'version_number', label: 'Version' },
              { key: 'release_date', label: 'Release Date', type: 'date' },
              { key: 'notes', label: 'Notes' }
            ]}
            techId={modalTechId}
            token={token}
            onDataChange={() => refreshRelatedData(modalTechId)}
          />
        )}
      </div>
    </div>
  </div>
)}
   </div>
  );
}