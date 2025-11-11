// src/pages/patents.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/employee.patents.css"; // <- uses the pat-* stylesheet
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
// Compact, pin-able tooltip for chart buckets
const PatentsGraphTooltip = ({ active, payload, label, onManage }) => {
  if (!active || !payload || !payload.length) return null;

  const bucket = payload[0]?.payload || {};
  const items = Array.isArray(bucket.patents) ? bucket.patents : [];
  const title = bucket.label ?? label ?? "Details";

  return (
      <div className="pat-cg-tooltip" role="dialog" aria-label="Chart details">
        <div className="pat-cg-tooltip__header">
          <div className="pat-cg-tooltip__title">{title}</div>
          <div className="pat-cg-tooltip__meta">
            <span className="pat-cg-tooltip__badge">{bucket.count ?? items.length}</span>
            <span className="pat-cg-tooltip__label">items</span>
          </div>
        </div>

        {items.length ? (
          <ul className="pat-cg-tooltip__list">
            {items.map((p) => (
              <li key={p.patent_id} className="pat-cg-tooltip__row">
                <span className="pat-cg-tooltip__name" title={p.title}>
                  {p.title}
                </span>
                {p.patent_number && (
                  <span className="pat-cg-tooltip__pill">#{p.patent_number}</span>
                )}
                <button
                  type="button"
                  className="pat-cg-tooltip__manage-btn"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onManage?.(p)}
                  aria-label={`Manage ${p.title}`}
                  title="Manage"
                >
                  Manage
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="pat-cg-tooltip__empty">No patents for this point</div>
        )}
      </div>
  );
};

/* ========== Bulk "Link Employee to Patent" Modal ========== */
const LinkEmployeeModal = ({ show, onClose, patents, employees, token }) => {
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedPatent, setSelectedPatent] = useState(null);
  const [role, setRole] = useState("");
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [patentSearch, setPatentSearch] = useState("");

  if (!show) return null;

  const filteredEmployees = (employees || []).filter((emp) =>
    (emp.name || "").toLowerCase().includes(employeeSearch.toLowerCase())
  );

  const filteredPatents = (patents || []).filter((p) =>
    (p.title || "").toLowerCase().includes(patentSearch.toLowerCase())
  );

  const handleSave = async () => {
    try {
      if (!selectedPatent || selectedEmployees.length === 0) {
        alert("Select at least one employee and a patent.");
        return;
      }
      await Promise.all(
        selectedEmployees.map((empId) =>
          axios.post(
            "http://localhost:5000/api/employee_patents",
            { employee_id: empId, patent_id: selectedPatent, role: role || "Inventor" },
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
// Add with other state hooks (inside PatentsPage)
return (
    <div className="pat-modal-overlay" onClick={onClose}>
      <div className="pat-modal pat-link-modal-layout" onClick={(e) => e.stopPropagation()}>
        <button className="pat-close-btn" onClick={onClose} aria-label="Close">✖</button>
        <h2>Link Employees to Patent</h2>

        {/* Role */}
        <div className="pat-link-section">
          
          <b>Role (e.g., Inventor):</b>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Lead Inventor / Co-Inventor"
          />
        </div>

        {/* Patent Selection */}
        <div className="pat-link-section">
          <b>Select Patent:</b>
          <input
            type="text"
            placeholder="Search patents..."
            value={patentSearch}
            onChange={(e) => setPatentSearch(e.target.value)}
          />
          <div className="pat-searchable-table" style={{ maxHeight: 150 }}>
            <table>
              <thead>
                <tr>
                  <th style={{ width: 70, textAlign: "center" }}>Select</th>
                  <th style={{ width: 90, textAlign: "center" }}>ID</th>
                  <th>Title</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatents.map((p) => (
                  <tr key={p.patent_id} className="pat-row-hover">
                    <td style={{ textAlign: "center" }}>
                      <input
                        type="radio"
                        name="selectedPatent"
                        checked={selectedPatent === p.patent_id}
                        onChange={() => setSelectedPatent(p.patent_id)}
                      />
                    </td>
                    <td style={{ textAlign: "center" }}>{p.patent_id}</td>
                    <td>{p.title}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Employees Selection */}
        <div className="pat-link-section">
          <b>Select Employees:</b>
          <input
            type="text"
            placeholder="Search employees..."
            value={employeeSearch}
            onChange={(e) => setEmployeeSearch(e.target.value)}
          />
          <div className="pat-searchable-table" style={{ maxHeight: 220 }}>
            <table>
              <thead>
                <tr>
                  <th style={{ width: 70, textAlign: "center" }}>Select</th>
                  <th style={{ width: 90, textAlign: "center" }}>ID</th>
                  <th>Name</th>
                  <th>Dept</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => (
                  <tr key={emp.employee_id} className="pat-row-hover">
                    <td style={{ textAlign: "center" }}>
                      <input
                        type="checkbox"
                        checked={selectedEmployees.includes(emp.employee_id)}
                        onChange={(e) => {
                          const id = emp.employee_id;
                          setSelectedEmployees((prev) =>
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

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button className="pat-link-save-btn" onClick={handleSave}>💾 Link</button>
        </div>
      </div>
    </div>
  );
};

/* ========================= Main Page ========================= */
export default function PatentsPage() {
  const token = localStorage.getItem("token");

  // Main Data
  const [patents, setPatents] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [technologies, setTechnologies] = useState([]);

  // Graph Data
  const [filedYearData, setFiledYearData] = useState([]);
  const [grantedYearData, setGrantedYearData] = useState([]);
// one pinned tooltip per chart
const [pinned, setPinned] = useState({
  filed: null,    // { payload, label }
  granted: null,
});

const pinTooltip = (chartKey, payload, label) => {
  setPinned((prev) => ({ ...prev, [chartKey]: { payload, label } }));
};
const unpinTooltip = (chartKey) => {
  setPinned((prev) => ({ ...prev, [chartKey]: null }));
};

// Close pinned with Esc
useEffect(() => {
  const onKey = (e) => {
    if (e.key === "Escape") setPinned({ filed: null, granted: null });
  };
  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}, []);

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
    mode: "add",
    patentData: {},
    relatedData: { inventors: [], tech: null },
  });
  const [modalActiveTab, setModalActiveTab] = useState("overview");

  // Inventors Tab State
  const [inventorSearch, setInventorSearch] = useState("");
  const [selectedInventors, setSelectedInventors] = useState([]);
  const [inventorRole, setInventorRole] = useState("");
  // ✅ Persisted inventors shown in the Inventors tab
const [linkedInventors, setLinkedInventors] = useState([]);

const fetchLinkedInventors = async (patentId) => {
  if (!patentId) return;
  try {
    const res = await axios.get(
      `http://localhost:5000/api/employee_patents/patent/${patentId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    ); 
    setLinkedInventors(res.data || []);
  } catch (err) {
    console.error("Failed to fetch inventors", err);
  }
};

const handleUnlinkInventor = async (linkId) => {
  try {
    await axios.delete(`http://localhost:5000/api/employee_patents/${linkId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setLinkedInventors((prev) => prev.filter((i) => i.id !== linkId));
  } catch (err) {
    console.error("Failed to unlink inventor", err);
    alert("Failed to unlink inventor.");
  }
};
// Ask before unlinking an inventor from this patent
const confirmAndUnlinkInventor = async (link) => {
  const msg = `Are you sure you want to remove inventor "${link.name}" (ID: ${link.employee_id}) from this patent?`;
  const ok = window.confirm(msg);
  if (!ok) return;
  await handleUnlinkInventor(link.id);
};

const handleUpdateInventorRole = async (linkId, newRole) => {
  try {
    await axios.put(
      `http://localhost:5000/api/employee_patents/${linkId}`,
      { role: newRole || null },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setLinkedInventors((prev) =>
      prev.map((i) => (i.id === linkId ? { ...i, role: newRole } : i))
    );
  } catch (err) {
    console.error("Failed to update role", err);
    alert("Failed to update role.");
  }
};

  // Bulk Link Modal
  const [showLinkModal, setShowLinkModal] = useState(false);

  // Fetchers
  const fetchPatents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/patents", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const formatted = (res.data || []).map((p) => ({
        ...p,
        date_filed: p.date_filed ? p.date_filed.split("T")[0] : null,
        date_granted: p.date_granted ? p.date_granted.split("T")[0] : null,
      }));
      setPatents(formatted);
      processGraphData(formatted);
    } catch (err) {
      console.error("Error fetching patents:", err);
    }
  };

  const fetchCoreLists = async () => {
    try {
      const [empRes, techRes] = await Promise.all([
        axios.get("http://localhost:5000/api/employees", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("http://localhost:5000/api/technologies", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setEmployees(empRes.data || []);
      setTechnologies(techRes.data || []);
    } catch (err) {
      console.error("Error fetching employees/technologies:", err);
    }
  };

  useEffect(() => {
    fetchPatents();
    fetchCoreLists();
  }, [token]);

  const processGraphData = (rows) => {
  const filed = {};   // { [yyyy]: { count, patents: [] } }
  const granted = {}; // { [yyyy]: { count, patents: [] } }

  (rows || []).forEach((p) => {
    if (p?.date_filed) {
      const y = p.date_filed.split("-")[0];
      if (!filed[y]) filed[y] = { count: 0, patents: [] };
      filed[y].count++;
      filed[y].patents.push(p);
    }
    if (p?.date_granted) {
      const y = p.date_granted.split("-")[0];
      if (!granted[y]) granted[y] = { count: 0, patents: [] };
      granted[y].count++;
      granted[y].patents.push(p);
    }
  });

  const filedArr = Object.entries(filed)
    .map(([year, obj]) => ({
      year,
      label: `Filed ${year}`,
      count: obj.count,
      patents: obj.patents,
    }))
    .sort((a, b) => a.year.localeCompare(b.year));

  const grantedArr = Object.entries(granted)
    .map(([year, obj]) => ({
      year,
      label: `Granted ${year}`,
      count: obj.count,
      patents: obj.patents,
    }))
    .sort((a, b) => a.year.localeCompare(b.year));

  setFiledYearData(filedArr);
  setGrantedYearData(grantedArr);
};

  // Modal helpers
  const resetHubModal = () => {
    setHubModal({
      show: false,
      mode: "add",
      patentData: {},
      relatedData: { inventors: [], tech: null },
    });
    setModalActiveTab("overview");
    setInventorSearch("");
    setSelectedInventors([]);
    setInventorRole("");
  };

  const handleOpenAddModal = () => {
    resetHubModal();
    setHubModal((prev) => ({
      ...prev,
      show: true,
      mode: "add",
      patentData: {
        title: "",
        patent_number: "",
        date_filed: "",
        date_granted: null,
        tech_id: "",
      },
    }));
  };

  const handleOpenManageModal = async (patent) => {
    resetHubModal();
    setHubModal((prev) => ({
      ...prev,
      show: true,
      mode: "edit",
      patentData: patent,
    }));

    // Optionally fetch linked tech details (if you have such an endpoint)
    try {
  if (patent.tech_id) {
    const techRes = await axios.get(
      `http://localhost:5000/api/technologies/${patent.tech_id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setHubModal((prev) => ({
      ...prev,
      relatedData: { ...prev.relatedData, tech: techRes.data },
    }));
  }
} catch (err) {
  console.error("Failed to fetch linked technology", err);
}
fetchLinkedInventors(patent.patent_id);
  };

  const handleModalFormChange = (e) => {
    const { name, value } = e.target;
    setHubModal((prev) => ({
      ...prev,
      patentData: { ...prev.patentData, [name]: value === "" ? null : value },
    }));
  };

  const handleSavePatent = async () => {
    const { mode, patentData } = hubModal;
    const confirmed = window.confirm(mode === "add" ? "Add new patent?" : "Update this patent?");
    if (!confirmed) return;

    if (!patentData.title || !patentData.patent_number || !patentData.tech_id) {
      alert("Please fill in Title, Patent Number, and select a Technology.");
      return;
    }

    try {
      if (mode === "add") {
        // inside handleSavePatent(), mode === 'add'
const res = await axios.post("http://localhost:5000/api/patents", patentData, {
  headers: { Authorization: `Bearer ${token}` },
});

// Try all common shapes
const newId =
  res?.data?.patent_id ??
  res?.data?.id ??
  res?.data?.insertId ??
  res?.data?.[0]?.patent_id ??
  res?.data?.[0]?.id;

if (!newId) {
  console.error("POST /api/patents returned no id:", res?.data);
  alert("Patent saved, but server did not return a patent_id. Please reopen Manage from the table.");
  return;
}

setHubModal(prev => ({
  ...prev,
  mode: "edit",
  patentData: { ...prev.patentData, patent_id: newId },
}));

setModalActiveTab("inventors");
fetchLinkedInventors(newId);
alert("Patent added. You can now add inventors.");

      } else {
        await axios.put(`http://localhost:5000/api/patents/${patentData.patent_id}`, patentData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Patent updated.");
      }
      fetchPatents();
    } catch (err) {
      console.error(err);
      alert("Failed to save patent.");
    }
  };

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

  // Inventors Tab
  const filteredEmployeesForModal = (employees || []).filter((emp) =>
    (emp.name || "").toLowerCase().includes(inventorSearch.toLowerCase())
  );

  const handleLinkInventors = async () => {
    const { patent_id } = hubModal.patentData || {};
    if (!patent_id) {
      alert("Save the patent first.");
      return;
    }
    if (selectedInventors.length === 0) {
      alert("Please select at least one employee.");
      return;
    }

    try {
      await Promise.all(
        selectedInventors.map((empId) =>
          axios.post(
            "http://localhost:5000/api/employee_patents",
            { employee_id: empId, patent_id, role: inventorRole || "Inventor" },
            { headers: { Authorization: `Bearer ${token}` } }
          )
        )
      );
      alert(`Linked ${selectedInventors.length} inventor(s).`);
      setSelectedInventors([]);
      setInventorRole("");
      fetchLinkedInventors(patent_id);
    } catch (err) {
      console.error(err);
      alert("Failed to link inventors.");
    }
  };

  // Filtering
  const filteredPatents = (patents || []).filter((p) => {
    const kw = (filters.keyword || "").toLowerCase();
    return (
      (!filters.tech_id || Number(filters.tech_id) === Number(p.tech_id)) &&
      (!filters.yearFiled || (p.date_filed?.split("-")[0] === String(filters.yearFiled))) &&
      (!filters.yearGranted || (p.date_granted?.split("-")[0] === String(filters.yearGranted))) &&
      ((p.title || "").toLowerCase().includes(kw) ||
        (p.patent_number || "").toLowerCase().includes(kw))
    );
  });
useEffect(() => {
  if (!hubModal.show) return;
  if (modalActiveTab !== "inventors") return;

  const pid = hubModal?.patentData?.patent_id;
  if (pid) {
    fetchLinkedInventors(pid);
  }
}, [hubModal.show, modalActiveTab, hubModal?.patentData?.patent_id]);

  return (
    <div className="pat-section">
      {/* Actions */}
      <div className="pat-table-actions">
        <button className="pat-add-btn" onClick={handleOpenAddModal}>➕ Add Patent</button>
         </div>

      {/* Header */}
      <div className="pat-section-header">
        <h2>PATENTS</h2>
        <p>Total Patents: {patents.length}</p>
      </div>

      {/* Graphs */}
      <div className="pat-graphs">
  {/* Filed */}
  <div className="pat-graph-card">
    <h3>Patents by Year Filed</h3>
    <div className="pat-chart-with-overlay">
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={filedYearData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis allowDecimals={false} />
          <Tooltip
            content={(p) => (
              <PatentsGraphTooltip {...p} onManage={handleOpenManageModal} />
            )}
          />
          <Bar
            dataKey="count"
            fill="#2980b9"
            onClick={(evt) => {
              const payload = evt?.payload;
              if (!payload) return;
              pinTooltip("filed", payload, payload.label || `Filed ${payload.year}`);
            }}
          />
        </BarChart>
      </ResponsiveContainer>

      {pinned.filed && (
        <div className="pat-cg-tooltip-pinned">
          <button
            className="pat-cg-tooltip-close"
            onClick={() => unpinTooltip("filed")}
            aria-label="Close"
          >
            ✖
          </button>
          <PatentsGraphTooltip
            active
            payload={[{ payload: pinned.filed.payload }]}
            label={pinned.filed.label}
            onManage={handleOpenManageModal}
          />
        </div>
      )}
    </div>
  </div>

  {/* Granted */}
  <div className="pat-graph-card">
    <h3>Patents by Year Granted</h3>
    <div className="pat-chart-with-overlay">
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={grantedYearData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis allowDecimals={false} />
          <Tooltip
            content={(p) => (
              <PatentsGraphTooltip {...p} onManage={handleOpenManageModal} />
            )}
          />
          <Bar
            dataKey="count"
            fill="#27ae60"
            onClick={(evt) => {
              const payload = evt?.payload;
              if (!payload) return;
              pinTooltip("granted", payload, payload.label || `Granted ${payload.year}`);
            }}
          />
        </BarChart>
      </ResponsiveContainer>

      {pinned.granted && (
        <div className="pat-cg-tooltip-pinned">
          <button
            className="pat-cg-tooltip-close"
            onClick={() => unpinTooltip("granted")}
            aria-label="Close"
          >
            ✖
          </button>
          <PatentsGraphTooltip
            active
            payload={[{ payload: pinned.granted.payload }]}
            label={pinned.granted.label}
            onManage={handleOpenManageModal}
          />
        </div>
      )}
    </div>
  </div>
</div>

      {/* Filters */}
      <div className="pat-filters-panel">
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
        <button
          className="pat-reset-btn"
          onClick={() => setFilters({ keyword: "", tech_id: "", yearFiled: "", yearGranted: "" })}
        >
          Reset
        </button>
      </div>

      {/* Table */}
      <div className="pat-results">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Patent Number</th>
         
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatents.map((p) => (
              <tr key={p.patent_id}>
                <td style={{ textAlign: "center" }}>{p.patent_id}</td>
                <td>{p.title}</td>
                <td>{p.patent_number}</td>
            
                <td>
                  <div className="pat-row-actions">
                    <button className="pat-btn-edit" onClick={() => handleOpenManageModal(p)}>✎ Manage</button>
                    <button className="pat-btn-delete" onClick={() => handleDeletePatent(p.patent_id)}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bulk Link Modal */}
      <LinkEmployeeModal
        show={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        patents={patents}
        employees={employees}
        token={token}
      />

      {/* Manage Hub Modal */}
      {hubModal.show && (
        <div className="pat-modal-overlay" onClick={resetHubModal}>
          <div className="pat-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <button className="pat-close-btn" onClick={resetHubModal} aria-label="Close">✖</button>
            <h2>{hubModal.mode === "add" ? "Add New Patent" : `Manage: ${hubModal.patentData.title}`}</h2>

            <div className="pat-modal-tabs">
              <button
                className={`pat-tab-btn ${modalActiveTab === "overview" ? "pat-active" : ""}`}
                onClick={() => setModalActiveTab("overview")}
              >
                Overview
              </button>
              <button
                className={`pat-tab-btn ${modalActiveTab === "inventors" ? "pat-active" : ""}`}
                onClick={() => setModalActiveTab("inventors")}
                disabled={hubModal.mode === "add"}
                title={hubModal.mode === "add" ? "Save Overview first" : "Inventors"}
              >
                Inventors
              </button>
              <button
                className={`pat-tab-btn ${modalActiveTab === "tech" ? "pat-active" : ""}`}
                onClick={() => setModalActiveTab("tech")}
                disabled={hubModal.mode === "add" || !hubModal.patentData.tech_id}
                title={!hubModal.patentData.tech_id ? "No linked technology" : "Linked Tech"}
              >
                Linked Tech
              </button>
            </div>

            <div className="pat-modal-tab-panel">
              {/* Overview */}
              {modalActiveTab === "overview" && (
                <div className="pat-form-grid" onSubmit={(e) => e.preventDefault()}>
                  <label>Patent Title</label>
                  <input
                    name="title"
                    placeholder="Title"
                    value={hubModal.patentData.title || ""}
                    onChange={handleModalFormChange}
                  />

                  <label>Patent Number</label>
                  <input
                    name="patent_number"
                    placeholder="Patent Number"
                    value={hubModal.patentData.patent_number || ""}
                    onChange={handleModalFormChange}
                  />

                  <label>Date Filed</label>
                  <input
                    name="date_filed"
                    type="date"
                    value={hubModal.patentData.date_filed || ""}
                    onChange={handleModalFormChange}
                  />

                  <label>Date Granted (optional)</label>
                  <input
                    name="date_granted"
                    type="date"
                    value={hubModal.patentData.date_granted || ""}
                    onChange={handleModalFormChange}
                  />

                  <label>Linked Technology</label>
                  <select
                    name="tech_id"
                    value={hubModal.patentData.tech_id || ""}
                    onChange={handleModalFormChange}
                  >
                    <option value="">-- Select a Technology --</option>
                    {technologies.map((t) => (
                      <option key={t.tech_id} value={t.tech_id}>
                        {t.name} (ID: {t.tech_id})
                      </option>
                    ))}
                  </select>

                  <div className="pat-form-buttons">
                    <button className="pat-save-btn" onClick={handleSavePatent}>
                      {hubModal.mode === "add" ? "Save and Continue" : "Save Changes"}
                    </button>
                  </div>
                </div>
              )}

              {/* Inventors */}
            {modalActiveTab === "inventors" && (
  <div className="inv-wrap">
    {/* Linked Inventors */}
    <div className="inv-section">
      <div className="inv-section__title">LINKED INVENTORS</div>

      {!linkedInventors || linkedInventors.length === 0 ? (
        <div className="inv-empty">No inventors linked yet.</div>
      ) : (
        <ul className="inv-list" role="list">
          {linkedInventors.map((link) => (
            <li key={link.id} className="inv-item">
              <div className="inv-item__main">
                <div className="inv-item__name">
                  {link.name}
                  <span className="inv-item__meta">
                    ({link.employee_id}) · {link.department || "—"}
                  </span>
                </div>

                {/* Inline role editor */}
                <input
                  className="inv-role"
                  placeholder="Role"
                  defaultValue={link.role || ""}
                  onBlur={(e) => {
                    const v = e.target.value.trim();
                    if (v !== (link.role || "")) {
                      handleUpdateInventorRole(link.id, v);
                    }
                  }}
                  title="Edit role and click outside to save"
                />

                {/* Unlink */}
                <button
                  type="button"
                  className="inv-unlink"
                  aria-label={`Unlink ${link.name}`}
                  onClick={() => confirmAndUnlinkInventor(link)}
                  title="Unlink"
                >
                  ✖
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>

    {/* Role for new links */}
    <div className="inv-section">
      <div className="inv-section__title">ADD NEW INVENTORS</div>

      <label className="inv-label">Role for new inventor(s)</label>
      <input
        type="text"
        className="inv-input"
        value={inventorRole}
        onChange={(e) => setInventorRole(e.target.value)}
        placeholder="Lead Inventor / Co-Inventor"
      />
    </div>

    {/* Available Employees */}
    <div className="inv-section">
      <input
        type="text"
        className="inv-search"
        placeholder="Search employees…"
        value={inventorSearch}
        onChange={(e) => setInventorSearch(e.target.value)}
      />

      <div className="inv-table">
        <table>
          <thead>
            <tr>
              <th style={{ width: 70, textAlign: "center" }}>Select</th>
              <th style={{ width: 90, textAlign: "center" }}>ID</th>
              <th>Name</th>
              <th>Dept</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployeesForModal.map((emp) => (
              <tr key={emp.employee_id} className="inv-row">
                <td style={{ textAlign: "center" }}>
                  <input
                    type="checkbox"
                    checked={selectedInventors.includes(emp.employee_id)}
                    onChange={(e) => {
                      const id = emp.employee_id;
                      setSelectedInventors((prev) =>
                        e.target.checked ? [...prev, id] : prev.filter((i) => i !== id)
                      );
                    }}
                  />
                </td>
                <td style={{ textAlign: "center" }}>{emp.employee_id}</td>
                <td className="inv-td-name">{emp.name}</td>
                <td>{emp.department}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    {/* Selected Preview */}
    {selectedInventors.length > 0 && (
      <div className="inv-section">
        <div className="inv-section__subtitle">Selected (not yet linked)</div>
        <div className="inv-chiplist">
          {selectedInventors.map((id) => {
            const emp = (employees || []).find((e) => e.employee_id === id);
            if (!emp) return null;
            return (
              <div key={id} className="inv-chip">
                <span className="inv-chip__text">
                  {emp.name} ({emp.employee_id})
                </span>
                <button
                  type="button"
                  className="inv-chip__x"
                  aria-label="Remove"
                  onClick={() =>
                    setSelectedInventors((prev) => prev.filter((i) => i !== id))
                  }
                >
                  ✖
                </button>
              </div>
            );
          })}
        </div>
      </div>
    )}

    {/* Actions */}
    <div className="inv-actions">
      <button className="inv-primary" onClick={handleLinkInventors}>
        💾 Link Selected Inventors
      </button>
    </div>
  </div>
)}


              {/* Linked Tech */}
              {modalActiveTab === "tech" && (
                <div className="pat-link-modal-layout">
                  <h4>Linked Technology Details</h4>
                 {hubModal.relatedData?.tech ? (
  <div className="pat-tech-card">
    <h3>{hubModal.relatedData.tech.name}</h3>

    <div className="pat-tech-detail"><b>Category:</b> {hubModal.relatedData.tech.category}</div>
    <div className="pat-tech-detail"><b>Status:</b> {hubModal.relatedData.tech.status}</div>
    <div className="pat-tech-detail"><b>TRL Achieved:</b> {hubModal.relatedData.tech.trl_achieved}</div>
    <div className="pat-tech-detail"><b>Location:</b> {hubModal.relatedData.tech.location}</div>

    <div className="pat-tech-detail">
      <b>Features:</b>
      <div>{hubModal.relatedData.tech.salient_features || "—"}</div>
    </div>
  </div>
) : (
  <p style={{ opacity: 0.6 }}>No linked technology found.</p>
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
