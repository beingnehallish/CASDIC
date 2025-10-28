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

export default function PublicationsPage() {
  const token = localStorage.getItem("token");

  const [publications, setPublications] = useState([]);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [filters, setFilters] = useState({ keyword: "", tech_id: "", year: "" });
  const [modalData, setModalData] = useState({ show: false, publication: null, isEditing: false });
  const [techModal, setTechModal] = useState({ show: false, techData: null });

  const [addModal, setAddModal] = useState({ show: false, publication: { title: "", authors: "", journal: "", year: "", link: "", tech_ids: [] } });
  const [technologies, setTechnologies] = useState([]);
  const [techSearch, setTechSearch] = useState("");

  // Fetch publications
  const fetchPublications = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/publications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPublications(res.data);
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
    fetchPublications();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this publication?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/publications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPublications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewTech = async (tech_id) => {
    if (!tech_id) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/projects/technologies/${tech_id}`, { headers: { Authorization: `Bearer ${token}` } });
      setTechModal({ show: true, techData: res.data });
    } catch (err) {
      console.error(err);
    }
  };

  const filteredPublications = publications.filter((p) => {
    const kw = (filters.keyword || "").toLowerCase();
    return (
      (!filters.tech_id || p.tech_id === Number(filters.tech_id)) &&
      (!filters.year || String(p.year) === filters.year) &&
      ((p.title || "").toLowerCase().includes(kw) ||
        (p.authors || "").toLowerCase().includes(kw) ||
        (p.journal || "").toLowerCase().includes(kw))
    );
  });

  // Data for year graph
  const yearCounts = {};
  publications.forEach(p => {
    if (p.year) yearCounts[p.year] = (yearCounts[p.year] || 0) + 1;
  });
  const yearData = Object.entries(yearCounts).map(([year, count]) => ({ year, count }));

  const [employeeLinkModal, setEmployeeLinkModal] = useState({
  show: false,
  pub_id: null,
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
        <button className="add-btn" onClick={() => setAddModal({ show: true, publication: { title: "", authors: "", journal: "", year: "", link: "", tech_ids: [] } })}>
          ➕ Add Publication
        </button>
        <button
  className="add-btn"
  onClick={() =>
    setEmployeeLinkModal({
      show: true,
      pub_id: null,
      employee_ids: [],
      role: "",
    })
  }
>
  🔗 Link Employee to Publication
</button>
      </div>

      <div className="empsection-header">
        <h2>Publications</h2>
        <p>Total Publications: {publications.length}</p>
      </div>

      {/* ===== Graph Section ===== */}
      <div className="tech-graphs">
        <div className="graph-card">
          <h3>Publications by Year</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={yearData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar
                dataKey="count"
                fill="#2980b9"
                onMouseEnter={(data, index, e) => setHoveredNode({ ...data, mouseX: e.clientX, mouseY: e.clientY })}
                onMouseLeave={() => setHoveredNode(null)}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ===== Filters ===== */}
      <div className="filters-panel">
        <input type="text" placeholder="🔎 Search publications..." value={filters.keyword} onChange={(e) => setFilters({ ...filters, keyword: e.target.value })} />
        <input type="number" placeholder="Tech ID" value={filters.tech_id} onChange={(e) => setFilters({ ...filters, tech_id: e.target.value })} />
        <input type="number" placeholder="Year" value={filters.year} onChange={(e) => setFilters({ ...filters, year: e.target.value })} />
        <button className="reset-btn" onClick={() => setFilters({ keyword: "", tech_id: "", year: "" })}>Reset</button>
      </div>

      {/* ===== Publications Table ===== */}
      <div className="reports-results">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Authors</th>
              <th>Journal</th>
              <th>Year</th>
              <th>Link</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPublications.map((p) => (
              <tr key={p.pub_id}>
                <td>{p.pub_id}</td>
                <td>{p.title}</td>
                <td>{p.authors}</td>
                <td>{p.journal}</td>
                <td>{p.year}</td>
                <td>{p.link ? <a href={p.link} target="_blank" rel="noreferrer">🔗</a> : "—"}</td>
                <td>
                  <button className="edit-btn" onClick={() => setModalData({ show: true, publication: p, isEditing: true })}>✎</button>
                  <button className="delete-btn" onClick={() => handleDelete(p.pub_id)}>🗑</button>
                  <button className="save-btn" onClick={() => setModalData({ show: true, publication: p, isEditing: false })}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== Add/Edit Publication Modal ===== */}
      {addModal.show && (
        <div className="modal-overlay" onClick={() => setAddModal({ show: false, publication: { title: "", authors: "", journal: "", year: "", link: "", tech_ids: [] } })}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setAddModal({ show: false, publication: { title: "", authors: "", journal: "", year: "", link: "", tech_ids: [] } })}>✖</button>
            <h2>Add Publication</h2>

            <p><b>Title:</b> <input type="text" value={addModal.publication.title} onChange={(e) => setAddModal(prev => ({ ...prev, publication: { ...prev.publication, title: e.target.value } }))} /></p>
            <p><b>Authors:</b> <input type="text" value={addModal.publication.authors} onChange={(e) => setAddModal(prev => ({ ...prev, publication: { ...prev.publication, authors: e.target.value } }))} /></p>
            <p><b>Journal:</b> <input type="text" value={addModal.publication.journal} onChange={(e) => setAddModal(prev => ({ ...prev, publication: { ...prev.publication, journal: e.target.value } }))} /></p>
            <p><b>Year:</b> <input type="number" value={addModal.publication.year} onChange={(e) => setAddModal(prev => ({ ...prev, publication: { ...prev.publication, year: e.target.value } }))} /></p>
            <p><b>Link:</b> <input type="text" value={addModal.publication.link} onChange={(e) => setAddModal(prev => ({ ...prev, publication: { ...prev.publication, link: e.target.value } }))} /></p>

            <p>
              <b>Technology:</b>
              <input type="text" placeholder="🔎 Search techs..." value={techSearch} onChange={(e) => setTechSearch(e.target.value)} style={{ marginBottom: "0.5rem", width: "100%" }} />
              <div className="searchable-table" style={{ maxHeight: "200px", overflowY: "auto", border: "1px solid #ccc", marginTop: "0.5rem" }}>
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
                      .filter(t => t.name.toLowerCase().includes(techSearch.toLowerCase()))
                      .map(t => (
                        <tr key={t.tech_id} style={{ borderBottom: "1px solid #eee" }}>
                          <td style={{ textAlign: "center", padding: "0.25rem" }}>
                            <input
                              type="checkbox"
                              checked={addModal.publication.tech_ids.includes(t.tech_id)}
                              onChange={(e) => {
                                const selected = addModal.publication.tech_ids;
                                if (e.target.checked) {
                                  setAddModal(prev => ({ ...prev, publication: { ...prev.publication, tech_ids: [...selected, t.tech_id] } }));
                                } else {
                                  setAddModal(prev => ({ ...prev, publication: { ...prev.publication, tech_ids: selected.filter(id => id !== t.tech_id) } }));
                                }
                              }}
                            />
                          </td>
                          <td style={{ textAlign: "center", padding: "0.25rem" }}>{t.tech_id}</td>
                          <td style={{ padding: "0.25rem" }}>{t.name}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </p>

            <button className="save-btn" onClick={async () => {
              try {
                const { publication } = addModal;
                if (!publication.title || !publication.authors || !publication.journal || !publication.year || publication.tech_ids.length === 0) {
                  alert("Please fill all fields and select at least one technology");
                  return;
                }
                await Promise.all(
                  publication.tech_ids.map(tech_id =>
                    axios.post("http://localhost:5000/api/publications", { ...publication, tech_id }, { headers: { Authorization: `Bearer ${token}` } })
                  )
                );
                setAddModal({ show: false, publication: { title: "", authors: "", journal: "", year: "", link: "", tech_ids: [] } });
                fetchPublications();
              } catch (err) {
                console.error(err);
                alert("Failed to add publication");
              }
            }}>💾 Add</button>
          </div>
        </div>
      )}
{employeeLinkModal.show && (
  <div className="modal-overlay" onClick={() => setEmployeeLinkModal({ show: false, pub_id: null, employee_ids: [], role: "", searchEmployees: "", searchpublications: "" })}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <button className="close-btn" onClick={() => setEmployeeLinkModal({ show: false, pub_id: null, employee_ids: [], role: "", searchEmployees: "", searchpublications: "" })}>✖</button>
      <h2>Link Employee(s) to publication</h2>

      {/* ===== Select publication Table ===== */}
      <p>
        <b>Select publication:</b>
        <input
          type="text"
          placeholder="Search publications..."
          value={employeeLinkModal.searchpublications || ""}
          onChange={(e) => setEmployeeLinkModal(prev => ({ ...prev, searchpublications: e.target.value }))}
        />
        <div style={{ maxHeight: "200px", overflowY: "auto", border: "1px solid #ccc" }}>
          <table style={{ width: "100%" }}>
            <thead>
              <tr><th>Select</th><th>ID</th><th>Title</th></tr>
            </thead>
            <tbody>
              {publications
                .filter(p => !employeeLinkModal.searchpublications || p.title.toLowerCase().includes(employeeLinkModal.searchpublications.toLowerCase()))
                .map(p => (
                  <tr key={p.pub_id}>
                    <td>
                      <input
                        type="radio"
                        name="selectedpublication"
                        checked={employeeLinkModal.pub_id === p.pub_id}
                        onChange={() => setEmployeeLinkModal(prev => ({ ...prev, pub_id: p.pub_id }))}
                      />
                    </td>
                    <td>{p.pub_id}</td>
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
  <tr><th>Select</th><th>ID</th><th>Title</th></tr>
</thead>
<tbody>
  {publications
    .filter(pub => !employeeLinkModal.searchPublications || pub.title.toLowerCase().includes(employeeLinkModal.searchPublications.toLowerCase()))
    .map(pub => (
      <tr key={pub.pub_id}>
        <td>
          <input
            type="radio"
            name="selectedPublication"
            checked={employeeLinkModal.pub_id === pub.pub_id}
            onChange={() => setEmployeeLinkModal(prev => ({ ...prev, pub_id: pub.pub_id }))}
          />
        </td>
        <td>{pub.pub_id}</td>
        <td>{pub.title}</td>
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
          if (!employeeLinkModal.pub_id || employeeLinkModal.employee_ids.length === 0) {
            alert("Select a publication and at least one employee");
            return;
          }
          try {
            await Promise.all(
              employeeLinkModal.employee_ids.map(emp_id =>
                axios.post(
                  "http://localhost:5000/api/employee_publications",
                  { pub_id: employeeLinkModal.pub_id, employee_id: emp_id, role: employeeLinkModal.role },
                  { headers: { Authorization: `Bearer ${token}` } }
                )
              )
            );
            alert("Employees linked to publication!");
            setEmployeeLinkModal({ show: false, pub_id: null, employee_ids: [], role: "", searchEmployees: "", searchpublications: "" });
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


      {/* Edit/View Modal */}
      {modalData.show && modalData.publication && (
        <div className="modal-overlay" onClick={() => setModalData({ show: false, publication: null, isEditing: false })}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setModalData({ show: false, publication: null, isEditing: false })}>✖</button>

            <h2>{modalData.isEditing ? <input type="text" value={modalData.publication.title} onChange={e => setModalData(prev => ({ ...prev, publication: { ...prev.publication, title: e.target.value } }))} /> : modalData.publication.title}</h2>

            <p><b>Authors:</b> {modalData.isEditing ? <input type="text" value={modalData.publication.authors} onChange={e => setModalData(prev => ({ ...prev, publication: { ...prev.publication, authors: e.target.value } }))} /> : modalData.publication.authors}</p>
            <p><b>Journal:</b> {modalData.isEditing ? <input type="text" value={modalData.publication.journal} onChange={e => setModalData(prev => ({ ...prev, publication: { ...prev.publication, journal: e.target.value } }))} /> : modalData.publication.journal}</p>
            <p><b>Year:</b> {modalData.isEditing ? <input type="number" value={modalData.publication.year} onChange={e => setModalData(prev => ({ ...prev, publication: { ...prev.publication, year: e.target.value } }))} /> : modalData.publication.year}</p>
            <p><b>Link:</b> {modalData.isEditing ? <input type="text" value={modalData.publication.link} onChange={e => setModalData(prev => ({ ...prev, publication: { ...prev.publication, link: e.target.value } }))} /> : (modalData.publication.link ? <a href={modalData.publication.link} target="_blank" rel="noreferrer">🔗</a> : "—")}</p>

            <p><b>Tech ID:</b> {modalData.isEditing ? <input type="number" value={modalData.publication.tech_id || ""} onChange={e => setModalData(prev => ({ ...prev, publication: { ...prev.publication, tech_id: e.target.value } }))} /> : modalData.publication.tech_id}
              {!modalData.isEditing && modalData.publication.tech_id && <button className="view-tech-btn-inline" onClick={() => handleViewTech(modalData.publication.tech_id)}>🔍 View Tech</button>}
            </p>

            {modalData.isEditing && (
              <button className="save-btn" onClick={async () => {
                try {
                  const p = modalData.publication;
                  if (!p.title || !p.authors || !p.journal || !p.year || !p.tech_id) { alert("Fill all fields"); return; }
                  await axios.put(`http://localhost:5000/api/publications/${p.pub_id}`, {
                    title: p.title, authors: p.authors, journal: p.journal, year: p.year, link: p.link, tech_id: p.tech_id
                  }, { headers: { Authorization: `Bearer ${token}` }});
                  setModalData({ show: false, publication: null, isEditing: false });
                  fetchPublications();
                } catch (err) { console.error(err); alert("Failed to update publication"); }
              }}>💾 Update</button>
            )}
          </div>
        </div>
      )}

      {/* Tech Modal */}
      {techModal.show && techModal.techData && (
        <div className="modal-overlay" onClick={() => setTechModal({ show: false, techData: null })}>
          <div className="modal-content large" onClick={e => e.stopPropagation()}>
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
