// pages/employee/patents.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/employee.projects.css";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export default function PatentsPage() {
  const token = localStorage.getItem("token");

  const [patents, setPatents] = useState([]);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [filters, setFilters] = useState({
    keyword: "",
    tech_id: "",
    yearFiled: "",
    yearGranted: "",
  });
  const [modalData, setModalData] = useState({ show: false, patent: null, isEditing: false });
  const [techModal, setTechModal] = useState({ show: false, techData: null });

  const [addModal, setAddModal] = useState({ show: false, patent: { title: "", patent_number: "", date_filed: "", date_granted: "", tech_ids: [] } });
  const [technologies, setTechnologies] = useState([]);
  const [techSearch, setTechSearch] = useState("");

  // Fetch patents
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
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch technologies
  useEffect(() => {
    const fetchTechnologies = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/technologies", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTechnologies(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTechnologies();
  }, []);

  useEffect(() => {
    fetchPatents();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this patent?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/patents/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPatents();
    } catch (err) {
      console.error(err);
    }
  };

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

  const yearCounts = {};
  patents.forEach(p => {
    if (p.date_filed) {
      const year = p.date_filed.split("-")[0];
      yearCounts[year] = (yearCounts[year] || 0) + 1;
    }
  });
  const yearData = Object.entries(yearCounts).map(([year, count]) => ({ year, count }));

  const [employeeLinkModal, setEmployeeLinkModal] = useState({
  show: false,
  patent_id: null,
  employee_ids: [],
  role: "",
});
const [employees, setEmployees] = useState([]);
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
  fetchEmployees();
}, []);

  return (
    <div className="empsection">
      <div className="tech-table-actions">
        <button className="add-btn" onClick={() => setAddModal({ show: true, patent: { title: "", patent_number: "", date_filed: "", date_granted: "", tech_ids: [] } })}>
          ➕ Add Patent
        </button>
        <button
  className="add-btn"
  onClick={() =>
    setEmployeeLinkModal({
      show: true,
      patent_id: null,
      employee_ids: [],
      role: "",
    })
  }
>
  🔗 Link Employee to Patent
</button>
      </div>

      <div className="empsection-header">
        <h2>Patents</h2>
        <p>Total Patents: {patents.length}</p>
      </div>

      {/* ===== Graph Section ===== */}
      <div className="tech-graphs">
        <div className="graph-card">
          <h3>Patents by Year Filed</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={yearData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar
                dataKey="count"
                fill="#2980b9"
                onMouseEnter={(data, index, e) =>
                  setHoveredNode({ ...data, mouseX: e.clientX, mouseY: e.clientY })
                }
                onMouseLeave={() => setHoveredNode(null)}
              />
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatents.map(p => (
              <tr key={p.patent_id}>
                <td>{p.patent_id}</td>
                <td>{p.title}</td>
                <td>{p.patent_number}</td>
                <td>
                  <button
                    className="edit-btn"
                    onClick={() =>
                      setModalData({ show: true, patent: p, isEditing: true })
                    }
                  >
                    ✎
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(p.patent_id)}>🗑</button>
                  <button className="save-btn" onClick={() => setModalData({ show: true, patent: p, isEditing: false })}>View More</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== Add Patent Modal ===== */}
      {addModal.show && (
        <div className="modal-overlay" onClick={() => setAddModal({ show: false, patent: { title: "", patent_number: "", date_filed: "", date_granted: "", tech_ids: [] } })}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setAddModal({ show: false, patent: { title: "", patent_number: "", date_filed: "", date_granted: "", tech_ids: [] } })}>✖</button>
            <h2>Add Patent</h2>

            <p>
              <b>Title:</b>
              <input
                type="text"
                value={addModal.patent.title}
                onChange={(e) => setAddModal(prev => ({ ...prev, patent: { ...prev.patent, title: e.target.value } }))}
              />
            </p>

            <p>
              <b>Patent Number:</b>
              <input
                type="text"
                value={addModal.patent.patent_number}
                onChange={(e) => setAddModal(prev => ({ ...prev, patent: { ...prev.patent, patent_number: e.target.value } }))}
              />
            </p>

            <p>
              <b>Date Filed:</b>
              <input
                type="date"
                value={addModal.patent.date_filed}
                onChange={(e) => setAddModal(prev => ({ ...prev, patent: { ...prev.patent, date_filed: e.target.value } }))}
              />
            </p>

            <p>
              <b>Date Granted:</b>
              <input
                type="date"
                value={addModal.patent.date_granted}
                onChange={(e) => setAddModal(prev => ({ ...prev, patent: { ...prev.patent, date_granted: e.target.value } }))}
              />
            </p>

<p>
  <b>Technology:</b>
  <input
    type="text"
    placeholder="🔎 Search techs..."
    value={techSearch}
    onChange={(e) => setTechSearch(e.target.value)}
    style={{ marginLeft: "0.5rem", marginBottom: "0.5rem", width: "100%" }}
  />
  <div
    className="searchable-table"
    style={{
      maxHeight: "200px",
      overflowY: "auto",
      border: "1px solid #ccc",
      marginTop: "0.5rem",
    }}
  >
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ background: "#f0f0f0" }}>
          <th style={{ padding: "0.5rem", textAlign: "center" }}>Select</th>
          <th style={{ padding: "0.5rem", textAlign: "center" }}>Tech ID</th>
          <th style={{ padding: "0.5rem", textAlign: "left" }}>Name</th>
        </tr>
      </thead>
      <tbody>
        {technologies
          .filter((t) => t.name.toLowerCase().includes(techSearch.toLowerCase()))
          .map((tech) => (
            <tr key={tech.tech_id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ textAlign: "center", padding: "0.25rem" }}>
                <input
                  type="checkbox"
                  checked={addModal.patent.tech_ids.includes(tech.tech_id)}
                  onChange={(e) => {
                    const selected = addModal.patent.tech_ids;
                    if (e.target.checked) {
                      setAddModal((prev) => ({
                        ...prev,
                        patent: { ...prev.patent, tech_ids: [...selected, tech.tech_id] },
                      }));
                    } else {
                      setAddModal((prev) => ({
                        ...prev,
                        patent: { ...prev.patent, tech_ids: selected.filter((id) => id !== tech.tech_id) },
                      }));
                    }
                  }}
                />
              </td>
              <td style={{ textAlign: "center", padding: "0.25rem" }}>{tech.tech_id}</td>
              <td style={{ padding: "0.25rem" }}>{tech.name}</td>
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
                  const { patent } = addModal;
                  if (!patent.title || !patent.patent_number || patent.tech_ids.length === 0) {
                    alert("Please fill all fields and select at least one technology");
                    return;
                  }
                  await Promise.all(
                    patent.tech_ids.map(tech_id =>
                      axios.post("http://localhost:5000/api/patents", { ...patent, tech_id }, { headers: { Authorization: `Bearer ${token}` } })
                    )
                  );
                  setAddModal({ show: false, patent: { title: "", patent_number: "", date_filed: "", date_granted: "", tech_ids: [] } });
                  fetchPatents();
                } catch (err) {
                  console.error(err);
                  alert("Failed to add patent");
                }
              }}
            >
              💾 Add
            </button>
          </div>
        </div>
      )}

{employeeLinkModal.show && (
  <div className="modal-overlay" onClick={() => setEmployeeLinkModal({ show: false, patent_id: null, employee_ids: [], role: "", searchEmployees: "", searchPatents: "" })}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <button className="close-btn" onClick={() => setEmployeeLinkModal({ show: false, patent_id: null, employee_ids: [], role: "", searchEmployees: "", searchPatents: "" })}>✖</button>
      <h2>Link Employee(s) to Patent</h2>

      {/* ===== Select Patent Table ===== */}
      <p>
        <b>Select Patent:</b>
        <input
          type="text"
          placeholder="Search patents..."
          value={employeeLinkModal.searchPatents || ""}
          onChange={(e) => setEmployeeLinkModal(prev => ({ ...prev, searchPatents: e.target.value }))}
        />
        <div style={{ maxHeight: "200px", overflowY: "auto", border: "1px solid #ccc" }}>
          <table style={{ width: "100%" }}>
            <thead>
              <tr><th>Select</th><th>ID</th><th>Title</th></tr>
            </thead>
            <tbody>
              {patents
                .filter(p => !employeeLinkModal.searchPatents || p.title.toLowerCase().includes(employeeLinkModal.searchPatents.toLowerCase()))
                .map(p => (
                  <tr key={p.patent_id}>
                    <td>
                      <input
                        type="radio"
                        name="selectedPatent"
                        checked={employeeLinkModal.patent_id === p.patent_id}
                        onChange={() => setEmployeeLinkModal(prev => ({ ...prev, patent_id: p.patent_id }))}
                      />
                    </td>
                    <td>{p.patent_id}</td>
                    <td>{p.title}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </p>

      {/* ===== Select Employees Table ===== */}
      <p>
        <b>Select Employees:</b>
        <input
          type="text"
          placeholder="Search employees..."
          value={employeeLinkModal.searchEmployees || ""}
          onChange={(e) => setEmployeeLinkModal(prev => ({ ...prev, searchEmployees: e.target.value }))}
        />
        <div style={{ maxHeight: "200px", overflowY: "auto", border: "1px solid #ccc" }}>
          <table style={{ width: "100%" }}>
            <thead>
              <tr><th>Select</th><th>ID</th><th>Name</th><th>Department</th></tr>
            </thead>
            <tbody>
              {employees
                .filter(emp => !employeeLinkModal.searchEmployees || emp.name.toLowerCase().includes(employeeLinkModal.searchEmployees.toLowerCase()))
                .map(emp => (
                  <tr key={emp.employee_id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={employeeLinkModal.employee_ids.includes(emp.employee_id)}
                        onChange={(e) => {
                          const selected = employeeLinkModal.employee_ids;
                          if (e.target.checked) {
                            setEmployeeLinkModal(prev => ({ ...prev, employee_ids: [...selected, emp.employee_id] }));
                          } else {
                            setEmployeeLinkModal(prev => ({ ...prev, employee_ids: selected.filter(id => id !== emp.employee_id) }));
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

      {/* ===== Role Field ===== */}
      <p>
        <b>Role:</b>
        <input
          type="text"
          value={employeeLinkModal.role || ""}
          onChange={(e) => setEmployeeLinkModal(prev => ({ ...prev, role: e.target.value }))}
        />
      </p>

      {/* ===== Submit Button ===== */}
      <button
        className="save-btn"
        onClick={async () => {
          if (!employeeLinkModal.patent_id || employeeLinkModal.employee_ids.length === 0) {
            alert("Select a patent and at least one employee");
            return;
          }
          try {
            await Promise.all(
              employeeLinkModal.employee_ids.map(emp_id =>
                axios.post(
                  "http://localhost:5000/api/employee_patents",
                  { patent_id: employeeLinkModal.patent_id, employee_id: emp_id, role: employeeLinkModal.role },
                  { headers: { Authorization: `Bearer ${token}` } }
                )
              )
            );
            alert("Employees linked to patent!");
            setEmployeeLinkModal({ show: false, patent_id: null, employee_ids: [], role: "", searchEmployees: "", searchPatents: "" });
          } catch (err) {
            console.error(err);
            alert("Failed to link employees");
          }
        }}
      >
        💾 Link
      </button>
    </div>
  </div>
)}

      {/* ===== Edit/View Patent Modal ===== */}
      {modalData.show && modalData.patent && (
        <div className="modal-overlay" onClick={() => setModalData({ show: false, patent: null, isEditing: false })}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setModalData({ show: false, patent: null, isEditing: false })}>✖</button>

            <h2>
              {modalData.isEditing ? (
                <input
                  type="text"
                  value={modalData.patent.title}
                  onChange={(e) => setModalData(prev => ({ ...prev, patent: { ...prev.patent, title: e.target.value } }))}
                />
              ) : (
                modalData.patent.title
              )}
            </h2>

            <p>
              <b>Patent Number:</b>{" "}
              {modalData.isEditing ? (
                <input
                  type="text"
                  value={modalData.patent.patent_number}
                  onChange={(e) => setModalData(prev => ({ ...prev, patent: { ...prev.patent, patent_number: e.target.value } }))}
                />
              ) : (
                modalData.patent.patent_number
              )}
            </p>

            <p>
              <b>Technology ID:</b>{" "}
              {modalData.isEditing ? (
                <input
                  type="number"
                  value={modalData.patent.tech_id || ""}
                  onChange={(e) => setModalData(prev => ({ ...prev, patent: { ...prev.patent, tech_id: e.target.value } }))}
                />
              ) : (
                modalData.patent.tech_id
              )}
              {modalData.patent.tech_id && !modalData.isEditing && (
                <button className="view-tech-btn-inline" onClick={() => handleViewTech(modalData.patent.tech_id)}>🔍 View Tech</button>
              )}
            </p>

            <p>
              <b>Date Filed:</b>{" "}
              {modalData.isEditing ? (
                <input
                  type="date"
                  value={modalData.patent.date_filed || ""}
                  onChange={(e) => setModalData(prev => ({ ...prev, patent: { ...prev.patent, date_filed: e.target.value } }))}
                />
              ) : (
                modalData.patent.date_filed
              )}
            </p>

            <p>
              <b>Date Granted:</b>{" "}
              {modalData.isEditing ? (
                <input
                  type="date"
                  value={modalData.patent.date_granted || ""}
                  onChange={(e) => setModalData(prev => ({ ...prev, patent: { ...prev.patent, date_granted: e.target.value } }))}
                />
              ) : (
                modalData.patent.date_granted || "—"
              )}
            </p>

            {/* Update button */}
            {modalData.isEditing && (
              <button
                className="save-btn"
                onClick={async () => {
                  try {
                    const p = modalData.patent;
                    if (!p.title || !p.patent_number || !p.tech_id) {
                      alert("Fill all fields before updating");
                      return;
                    }
                    await axios.put(
                      `http://localhost:5000/api/patents/${p.patent_id}`,
                      {
                        title: p.title,
                        patent_number: p.patent_number,
                        date_filed: p.date_filed || null,
                        date_granted: p.date_granted || null,
                        tech_id: p.tech_id,
                      },
                      { headers: { Authorization: `Bearer ${token}` } }
                    );
                    setModalData({ show: false, patent: null, isEditing: false });
                    fetchPatents();
                  } catch (err) {
                    console.error(err);
                    alert("Failed to update patent");
                  }
                }}
              >
                💾 Update
              </button>
            )}
          </div>
        </div>
      )}

      {/* ===== Tech Modal ===== */}
      {techModal.show && techModal.techData && (
        <div className="modal-overlay" onClick={() => setTechModal({ show: false, techData: null })}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setTechModal({ show: false, techData: null })}>✖</button>
            <h2>{techModal.techData.name}</h2>
            <p><b>Category:</b> {techModal.techData.category}</p>
            <p><b>Status:</b> {techModal.techData.status}</p>
            <p><b>TRL:</b> {techModal.techData.trl_start} → {techModal.techData.trl_achieved}</p>
            <p><b>Description:</b> {techModal.techData.trl_description}</p>
            <p><b>Budget:</b> ₹{Number(techModal.techData.budget).toLocaleString()}</p>
            <p><b>Security Level:</b> {techModal.techData.security_level}</p>
            <p><b>Location:</b> {techModal.techData.location}</p>
            <p><b>Tech Stack:</b> {techModal.techData.tech_stack}</p>
          </div>
        </div>
      )}
    </div>
  );
}
