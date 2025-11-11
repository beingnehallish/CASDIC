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
import "../../styles/employee.companies.css";

export default function CompaniesPage() {
  const token = localStorage.getItem("token");

  // ===== State =====
  const [companies, setCompanies] = useState([]);
  const [projectsList, setProjectsList] = useState([]);

  const [typeData, setTypeData] = useState([]);
  const [countryData, setCountryData] = useState([]);
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"];

  const [filters, setFilters] = useState({ type: "", country: "", keyword: "" });

  const [hubModal, setHubModal] = useState({
    show: false,
    mode: "add",
    companyData: {},
    relatedData: { collaborations: [] },
  });
  const [modalActiveTab, setModalActiveTab] = useState("overview");

  // Collaborations tab state
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [collabRole, setCollabRole] = useState("");
  const [projectSearch, setProjectSearch] = useState("");

  // ===== Data fetching =====
  const fetchCompanies = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/companies", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCompanies(res.data || []);
      processGraphData(res.data || []);
    } catch (err) {
      console.error("Failed to fetch companies:", err);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/projects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjectsList(res.data || []);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    }
  };

  useEffect(() => {
    fetchCompanies();
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ===== Graph prep =====
  const processGraphData = (data) => {
    const types = ["Private", "Government", "Academic", "NGO", "Startup"];
    const typeCounts = types.map((t) => ({
      name: t,
      value: data.filter((c) => c.type === t).length,
    }));
    setTypeData(typeCounts.filter((t) => t.value > 0));

    const countryCounts = data.reduce((acc, c) => {
      const country = c.country || "Unknown";
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {});
    setCountryData(
      Object.entries(countryCounts).map(([name, count]) => ({ name, count }))
    );
  };

  // ===== Modal helpers =====
  const resetHubModal = () => {
    setHubModal({
      show: false,
      mode: "add",
      companyData: {},
      relatedData: { collaborations: [] },
    });
    setModalActiveTab("overview");
    setSelectedProjects([]);
    setCollabRole("");
    setProjectSearch("");
  };

  const handleOpenAddModal = () => {
    resetHubModal();
    setHubModal((prev) => ({
      ...prev,
      show: true,
      mode: "add",
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
      },
    }));
  };

  const handleOpenManageModal = async (company) => {
    resetHubModal();
    setHubModal((prev) => ({
      ...prev,
      show: true,
      mode: "edit",
      companyData: company,
    }));

    try {
      const res = await axios.get(
        `http://localhost:5000/api/company/${company.company_id}/collaborations`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHubModal((prev) => ({
        ...prev,
        relatedData: { collaborations: res.data || [] },
      }));
    } catch (err) {
      console.error("Failed to fetch collaborations:", err);
    }
  };

  const handleModalFormChange = (e) => {
    const { name, value } = e.target;
    setHubModal((prev) => ({
      ...prev,
      companyData: {
        ...prev.companyData,
        [name]: value,
      },
    }));
  };

  const handleSaveCompany = async () => {
    const { mode, companyData } = hubModal;
    const confirmed = window.confirm(
      mode === "add" ? "Add new company?" : "Update this company?"
    );
    if (!confirmed) return;

    try {
      if (mode === "add") {
        const res = await axios.post(
          "http://localhost:5000/api/companies",
          companyData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const newId =
          res?.data?.company_id ??
          res?.data?.id ??
          res?.data?.insertId ??
          res?.data?.[0]?.company_id ??
          res?.data?.[0]?.id;

        if (!newId) {
          console.error(
            "No company_id returned from POST /api/companies:",
            res?.data
          );
          alert(
            "Company saved, but no ID was returned by the server. Please reopen Manage and try again."
          );
          return;
        }

        setHubModal((prev) => ({
          ...prev,
          mode: "edit",
          companyData: { ...prev.companyData, company_id: newId },
        }));

        setModalActiveTab("collaborations");

        try {
          const collabRes = await axios.get(
            `http://localhost:5000/api/company/${newId}/collaborations`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setHubModal((prev) => ({
            ...prev,
            relatedData: { collaborations: collabRes.data || [] },
          }));
        } catch (e) {
          console.warn("Could not preload collaborations for new company:", e);
        }

        alert("Company added. You can now add collaborations.");
      } else {
        await axios.put(
          `http://localhost:5000/api/companies/${companyData.company_id}`,
          companyData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Company updated.");
      }
      fetchCompanies();
    } catch (err) {
      console.error(err);
      alert("Failed to save company.");
    }
  };

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

  // ===== Collaboration logic =====
  const handleLinkProjects = async () => {
    const { company_id } = hubModal.companyData || {};
    if (!company_id) {
      alert(
        "Please save the Overview first so the company gets an ID, then link projects."
      );
      return;
    }
    if (selectedProjects.length === 0) {
      alert("Please select at least one project to link.");
      return;
    }

    try {
      const linkPromises = selectedProjects.map((projId) =>
        axios.post(
          "http://localhost:5000/api/project_companies",
          {
            project_id: projId,
            company_id,
            role_in_project: collabRole || "Collaborator",
          },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      );
      await Promise.all(linkPromises);

      const res = await axios.get(
        `http://localhost:5000/api/company/${company_id}/collaborations`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHubModal((prev) => ({
        ...prev,
        relatedData: { collaborations: res.data || [] },
      }));

      setSelectedProjects([]);
      setCollabRole("");
      setProjectSearch("");

      alert(`Successfully linked ${selectedProjects.length} project(s).`);
    } catch (err) {
      console.error("Failed to link projects:", err);
      alert("Failed to link projects.");
    }
  };

  const handleUnlinkProject = async (collabId) => {
    const { company_id } = hubModal.companyData || {};
    if (!company_id)
      return alert("Save the Overview first so the company gets an ID.");
    if (!window.confirm("Remove this collaboration?")) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/project_companies/${collabId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const res = await axios.get(
        `http://localhost:5000/api/company/${company_id}/collaborations`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHubModal((prev) => ({
        ...prev,
        relatedData: { collaborations: res.data || [] },
      }));
    } catch (err) {
      console.error("Unlink failed:", err);
      alert("Failed to unlink project. Check the DELETE /project_companies/:id route.");
    }
  };

  // ===== Derived lists =====
  const filteredCompanies = companies.filter((c) => {
    const kw = filters.keyword.toLowerCase();
    return (
      (!filters.type || c.type === filters.type) &&
      (!filters.country ||
        (c.country || "").toLowerCase().includes(filters.country.toLowerCase())) &&
      (!filters.keyword ||
        (c.name || "").toLowerCase().includes(kw) ||
        (c.role || "").toLowerCase().includes(kw))
    );
  });

  const filteredProjectsForModal = (projectsList || []).filter((p) =>
    (p.name || "").toLowerCase().includes((projectSearch || "").toLowerCase())
  );

  // ===== Render =====
  return (
    <div className="comp-empsection">
      <div className="comp-tech-table-actions">
        <button className="comp-add-btn" onClick={handleOpenAddModal}>
          ➕ Add Company
        </button>
      </div>

      <div className="comp-empsection-header">
        <h2>COMPANIES</h2>
        <p>Total Companies: {companies.length}</p>
      </div>

      {/* ===== Graphs ===== */}
      <div className="comp-tech-graphs">
        <div className="comp-graph-card">
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
                label={({ name, percent }) =>
                  `${name} (${(percent * 100).toFixed(0)}%)`
                }
              >
                {typeData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="comp-graph-card">
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

      {/* ===== Filters ===== */}
      <div className="comp-filters-panel">
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

      {/* ===== Companies Table ===== */}
      <div className="comp-reports-results">
        <table className="comp-table">
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
                <td>
                  <span className="comp-pill comp-pill--type">{c.type}</span>
                </td>
                <td>
                  <span
                    className={`comp-pill comp-pill--country ${
                      /india/i.test(c.country || "") ? "comp-pill--india" : ""
                    }`}
                  >
                    {c.country}
                  </span>
                </td>
                <td>{c.role}</td>
                <td>
                  <div className="comp-action-buttons-wrapper">
                    <button
                      className="comp-edit-btn"
                      onClick={() => handleOpenManageModal(c)}
                    >
                      ✎ Manage
                    </button>
                    <button
                      className="comp-delete-btn"
                      onClick={() => handleDeleteCompany(c.company_id)}
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

      {/* ===== Manage Hub Modal ===== */}
      {hubModal.show && (
        <div className="comp-modal-overlay" onClick={resetHubModal}>
          <div
            className="comp-modal-content comp-large"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="comp-close-btn" onClick={resetHubModal}>
              ✖
            </button>
            <h2>
              {hubModal.mode === "add"
                ? "Add New Company"
                : `Manage: ${hubModal.companyData.name}`}
            </h2>

            <div className="comp-modal-tabs">
              <button
                className={`comp-tab-btn ${
                  modalActiveTab === "overview" ? "comp-active" : ""
                }`}
                onClick={() => setModalActiveTab("overview")}
              >
                Overview
              </button>
              <button
                className={`comp-tab-btn ${
                  modalActiveTab === "collaborations" ? "comp-active" : ""
                }`}
                onClick={() => setModalActiveTab("collaborations")}
                disabled={!hubModal.companyData?.company_id}
              >
                Collaborations
              </button>
            </div>

            <div className="comp-modal-tab-panel">
              {/* --- Overview --- */}
              {modalActiveTab === "overview" && (
                <div className="comp-modal-tab-content comp-vertical-form">
                  <label>Company Name</label>
                  <input
                    name="name"
                    placeholder="Name"
                    value={hubModal.companyData.name || ""}
                    onChange={handleModalFormChange}
                  />

                  <label>Country</label>
                  <input
                    name="country"
                    placeholder="Country"
                    value={hubModal.companyData.country || ""}
                    onChange={handleModalFormChange}
                  />

                  <label>Company Type</label>
                  <select
                    name="type"
                    value={hubModal.companyData.type || "Private"}
                    onChange={handleModalFormChange}
                  >
                    <option value="Private">Private</option>
                    <option value="Government">Government</option>
                    <option value="Academic">Academic</option>
                    <option value="NGO">NGO</option>
                    <option value="Startup">Startup</option>
                  </select>

                  <label>Role</label>
                  <input
                    name="role"
                    placeholder="Role"
                    value={hubModal.companyData.role || ""}
                    onChange={handleModalFormChange}
                  />

                  <label>Contact Person</label>
                  <input
                    name="contact_person"
                    placeholder="Contact Person"
                    value={hubModal.companyData.contact_person || ""}
                    onChange={handleModalFormChange}
                  />

                  <label>Contact Email</label>
                  <input
                    name="contact_email"
                    placeholder="Contact Email"
                    value={hubModal.companyData.contact_email || ""}
                    onChange={handleModalFormChange}
                  />

                  <label>Contact Phone</label>
                  <input
                    name="contact_phone"
                    placeholder="Contact Phone"
                    value={hubModal.companyData.contact_phone || ""}
                    onChange={handleModalFormChange}
                  />

                  <label>Website</label>
                  <input
                    name="website"
                    placeholder="Website"
                    value={hubModal.companyData.website || ""}
                    onChange={handleModalFormChange}
                  />

                  <label>Address</label>
                  <textarea
                    name="address"
                    placeholder="Address"
                    value={hubModal.companyData.address || ""}
                    onChange={handleModalFormChange}
                  />

                  <label>Notes</label>
                  <textarea
                    name="notes"
                    placeholder="Notes"
                    value={hubModal.companyData.notes || ""}
                    onChange={handleModalFormChange}
                  />

                  <div className="comp-form-buttons">
                    <button className="comp-add-btn" onClick={handleSaveCompany}>
                      {hubModal.mode === "add"
                        ? "Save and Continue"
                        : "Save Changes"}
                    </button>
                  </div>
                </div>
              )}

              {/* --- Collaborations --- */}
              {modalActiveTab === "collaborations" && (
                <div className="comp-modal-tab-content">
                  <h4>Current Collaborations</h4>
                  <div className="comp-searchable-table" style={{ marginBottom: "1rem" }}>
                    <table className="comp-table">
                      <thead>
                        <tr>
                          <th>Project Name</th>
                          <th>Role</th>
                          <th className="comp-col-actions">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {hubModal.relatedData.collaborations.length > 0 ? (
                          hubModal.relatedData.collaborations.map((collab) => (
                            <tr
                              key={
                                collab.id ??
                                `${collab.project_id}-${hubModal.companyData.company_id}`
                              }
                            >
                              <td>{collab.project_name}</td>
                              <td>{collab.role_in_project}</td>
                              <td className="comp-row-actions">
                                <button
                                  title="Remove collaboration"
                                  className="comp-icon-btn comp-icon-btn--danger"
                                  onClick={() => handleUnlinkProject(collab.id)}
                                >
                                  🗑️
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="3" style={{ textAlign: "center" }}>
                              No collaborations found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <h4 style={{ borderTop: "1px solid #eee", paddingTop: "1rem" }}>
                    Link to New Project
                  </h4>

                  <div className="comp-collab-grid">
                    {/* LEFT: filters + searchable list */}
                    <div className="comp-collab-left">
                      <div className="comp-field">
                        <label className="comp-field__label">Role in project</label>
                        <input
                          type="text"
                          value={collabRole}
                          onChange={(e) => setCollabRole(e.target.value)}
                          placeholder="E.g., Partner, Supplier, Consultant"
                          className="comp-field__input"
                        />
                      </div>

                      <div className="comp-field">
                        <input
                          type="text"
                          placeholder="Search projects..."
                          value={projectSearch}
                          onChange={(e) => setProjectSearch(e.target.value)}
                          className="comp-field__input"
                        />
                      </div>

                      <div className="comp-searchable-table comp-searchable-table--lg">
                        <table className="comp-table">
                          <thead>
                            <tr>
                              <th style={{ width: 60, textAlign: "center" }}>Select</th>
                              <th style={{ width: 90, textAlign: "center" }}>ID</th>
                              <th>Name</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredProjectsForModal.map((p) => (
                              <tr key={p.project_id} className="comp-row-hover">
                                <td style={{ textAlign: "center" }}>
                                  <input
                                    type="checkbox"
                                    checked={selectedProjects.includes(p.project_id)}
                                    onChange={(e) => {
                                      const id = p.project_id;
                                      setSelectedProjects((prev) =>
                                        e.target.checked
                                          ? [...prev, id]
                                          : prev.filter((i) => i !== id)
                                      );
                                    }}
                                  />
                                </td>
                                <td style={{ textAlign: "center" }}>{p.project_id}</td>
                                <td>{p.name}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* RIGHT: selected summary + sticky action */}
                    <aside className="comp-collab-right">
                      <div className="comp-selected-header">
                        <h5>Selected ({selectedProjects.length})</h5>
                        <button
                          className="comp-text-btn"
                          onClick={() => setSelectedProjects([])}
                          disabled={selectedProjects.length === 0}
                        >
                          Clear
                        </button>
                      </div>

                      <div className="comp-chiplist">
                        {selectedProjects.length === 0 ? (
                          <div className="comp-empty-hint">No projects selected yet.</div>
                        ) : (
                          selectedProjects
                            .map((id) => projectsList.find((p) => p.project_id === id))
                            .filter(Boolean)
                            .map((p) => (
                              <span key={p.project_id} className="comp-chip">
                                <span className="comp-chip__text">{p.name}</span>
                                <button
                                  className="comp-chip__remove"
                                  onClick={() =>
                                    setSelectedProjects((prev) =>
                                      prev.filter((i) => i !== p.project_id)
                                    )
                                  }
                                  aria-label="Remove"
                                >
                                  ✕
                                </button>
                              </span>
                            ))
                        )}
                      </div>

                      <div className="comp-sticky-actions">
                        <button
                          className="comp-primary-btn"
                          onClick={handleLinkProjects}
                          disabled={selectedProjects.length === 0}
                        >
                          💾 Link Selected Projects
                        </button>
                      </div>
                    </aside>
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