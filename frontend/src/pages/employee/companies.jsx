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
} from "recharts";
import "../../styles/employee.projects.css";

export default function CompaniesPage() {
  const token = localStorage.getItem("token");

  const [companies, setCompanies] = useState([]);
  const [barData, setBarData] = useState([]);
  const [filters, setFilters] = useState({ type: "", country: "", role: "" });

  const [showForm, setShowForm] = useState(false);
  const [editCompany, setEditCompany] = useState(null);
  const [formData, setFormData] = useState({
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
  });
const visibleFields = [
  "company_id",
  "name",
  "country",
  "type",
  "role",
  "contact_person",
  "contact_email",
  "contact_phone",
  "website",
  "address",
  "notes",
];

  const [showViewModal, setShowViewModal] = useState(false);
  const [viewCompany, setViewCompany] = useState(null);

  // Fetch companies
  const fetchCompanies = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/companies", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCompanies(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // Prepare bar chart data
  useEffect(() => {
    const types = ["Private", "Government", "Academic", "NGO", "Startup"];
    const data = types.map((t) => ({
      type: t,
      count: companies.filter((c) => c.type === t).length,
    }));
    setBarData(data);
  }, [companies]);

  // Handle Add/Edit Submit
  const handleSubmit = async () => {
  try {
    const payload = { ...formData };

    if (editCompany) {
      // Edit existing company
      await axios.put(
        `http://localhost:5000/api/companies/${editCompany.company_id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update the local state immediately
      setCompanies((prev) =>
        prev.map((c) =>
          c.company_id === editCompany.company_id ? { ...c, ...payload } : c
        )
      );
    } else {
      // Add new company
      const res = await axios.post(
        "http://localhost:5000/api/companies",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Add to local state
      const newCompany = { company_id: res.data.company_id, ...payload };
      setCompanies((prev) => [...prev, newCompany]);
    }

    // Reset modal form
    setShowForm(false);
    setEditCompany(null);
    setFormData({
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
    });
  } catch (err) {
    console.error(err);
  }
};


  // Handle Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this company?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/companies/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCompanies();
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered Companies
  const filteredCompanies = companies.filter((c) => {
    const matchType = filters.type ? c.type === filters.type : true;
    const matchCountry = filters.country
      ? c.country.toLowerCase().includes(filters.country.toLowerCase())
      : true;
    const matchRole = filters.role
      ? c.role.toLowerCase().includes(filters.role.toLowerCase())
      : true;
    return matchType && matchCountry && matchRole;
  });

  const handleEditClick = (company) => {
  setFormData({
    name: company.name || "",
    country: company.country || "",
    type: company.type || "Private",
    role: company.role || "",
    contact_person: company.contact_person || "",
    contact_email: company.contact_email || "",
    contact_phone: company.contact_phone || "",
    website: company.website || "",
    address: company.address || "",
    notes: company.notes || "",
  });
  setEditCompany(company);
  setShowForm(true);
};


  // collaboration

  const [showCollabModal, setShowCollabModal] = useState(false);
const [projectsList, setProjectsList] = useState([]);
const [selectedProjects, setSelectedProjects] = useState([]);
const [selectedCompanies, setSelectedCompanies] = useState([]);
const [collabData, setCollabData] = useState({
  role_in_project: "",
  contribution: "",
  partnership_start_date: "",
  partnership_end_date: "",
});
const [projectSearch, setProjectSearch] = useState("");
const [companySearch, setCompanySearch] = useState("");
const fetchProjects = async () => {
  try {
    const res = await axios.get("http://localhost:5000/api/projects", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setProjectsList(res.data);
  } catch (err) {
    console.error(err);
  }
};
const [companyCollabs, setCompanyCollabs] = useState([]);

const handleViewClick = async (company) => {
  setViewCompany(company);
  setShowViewModal(true);

  // Fetch collaborations
  try {
    const res = await axios.get(
      `http://localhost:5000/api/company/${company.company_id}/collaborations`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setCompanyCollabs(res.data);
  } catch (err) {
    console.error(err);
    setCompanyCollabs([]);
  }
};
useEffect(() => {
  fetchProjects();
}, []);


  return (
    
    <div className="empsection">
             {/* ---------- Action Buttons ---------- */}
      <div className="tech-table-actions">
        <button
          className="add-btn"
          onClick={() => {
            setEditCompany(null);
            setShowForm(true);
            setFormData({
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
            });
          }}
        >
          ➕ Add Company
        </button>
        <button
  className="collab-btn"
  onClick={() => {
    setSelectedProjects([]);
    setSelectedCompanies([]);
    setCollabData({
      role_in_project: "",
      contribution: "",
      partnership_start_date: "",
      partnership_end_date: "",
    });
    setShowCollabModal(true);
  }}
>
  🤝 Collaborate Project
</button>
</div>
      <div className="empsection-header">
        <h2>Companies</h2>
        <p>Total Companies: {companies.length}</p>
      </div>
      

      {/* ---------- Bar Chart ---------- */}
      <div className="graph-card">
        <h3>Companies by Type</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="type" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#2980b9" />
          </BarChart>
        </ResponsiveContainer>
      </div>

 

      {/* ---------- Filters ---------- */}
      <div className="filters-panel">
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
        <input
          type="text"
          placeholder="Filter by role"
          value={filters.role}
          onChange={(e) => setFilters({ ...filters, role: e.target.value })}
        />
      </div>

      {/* ---------- Companies Table ---------- */}
      <div className="reports-results">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Type</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredCompanies.map((c) => (
              <tr key={c.company_id}>
                <td>{c.company_id}</td>
                <td>{c.name}</td>
                <td>{c.type}</td>
                <td>
                  <button className="edit-btn" onClick={() => handleEditClick(c)}>
                    ✎ Edit
                  </button>
                  <button className="view-btn" onClick={() => handleViewClick(c)}>
                    👁 View More
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(c.company_id)}
                  >
                    🗑 Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
{showCollabModal && (
  <div className="modal-overlay" onClick={() => setShowCollabModal(false)}>
    <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
      <button className="close-btn" onClick={() => setShowCollabModal(false)}>✖</button>
      <h2>Collaborate on Project</h2>

      {/* Project Selection */}
      <div className="searchable-table">
        <input
          type="text"
          placeholder="Search Projects..."
          value={projectSearch}
          onChange={(e) => setProjectSearch(e.target.value)}
        />
        <div className="table-scroll">
          <table>
            <thead>
              <tr><th>Select</th><th>ID</th><th>Name</th></tr>
            </thead>
            <tbody>
              {projectsList
                .filter(p => p.name.toLowerCase().includes(projectSearch.toLowerCase()))
                .map(p => (
                  <tr key={p.project_id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedProjects.includes(p.project_id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedProjects([...selectedProjects, p.project_id]);
                          else setSelectedProjects(selectedProjects.filter(id => id !== p.project_id));
                        }}
                      />
                    </td>
                    <td>{p.project_id}</td>
                    <td>{p.name}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Company Selection */}
      <div className="searchable-table">
        <input
          type="text"
          placeholder="Search Companies..."
          value={companySearch}
          onChange={(e) => setCompanySearch(e.target.value)}
        />
        <div className="table-scroll">
          <table>
            <thead>
              <tr><th>Select</th><th>ID</th><th>Name</th></tr>
            </thead>
            <tbody>
              {companies
                .filter(c => c.name.toLowerCase().includes(companySearch.toLowerCase()))
                .map(c => (
                  <tr key={c.company_id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedCompanies.includes(c.company_id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedCompanies([...selectedCompanies, c.company_id]);
                          else setSelectedCompanies(selectedCompanies.filter(id => id !== c.company_id));
                        }}
                      />
                    </td>
                    <td>{c.company_id}</td>
                    <td>{c.name}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role / Contribution / Dates */}
      <input
        placeholder="Role in Project"
        value={collabData.role_in_project}
        onChange={(e) => setCollabData({ ...collabData, role_in_project: e.target.value })}
      />
      <textarea
        placeholder="Contribution"
        value={collabData.contribution}
        onChange={(e) => setCollabData({ ...collabData, contribution: e.target.value })}
      />
      <input
        type="date"
        placeholder="Partnership Start Date"
        value={collabData.partnership_start_date}
        onChange={(e) => setCollabData({ ...collabData, partnership_start_date: e.target.value })}
      />
      <input
        type="date"
        placeholder="Partnership End Date"
        value={collabData.partnership_end_date}
        onChange={(e) => setCollabData({ ...collabData, partnership_end_date: e.target.value })}
      />

      <div className="form-buttons">
        <button
          className="save-btn"
          onClick={async () => {
            try {
              for (let pid of selectedProjects) {
                for (let cid of selectedCompanies) {
                  await axios.post(
                    `http://localhost:5000/api/project_companies`,
                    {
                      project_id: pid,
                      company_id: cid,
                      ...collabData,
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                }
              }
              setShowCollabModal(false);
            } catch (err) {
              console.error(err);
            }
          }}
        >
          Save Collaboration
        </button>
        <button className="cancel-btn" onClick={() => setShowCollabModal(false)}>Cancel</button>
      </div>
    </div>
  </div>
)}

      {/* ---------- Add/Edit Modal ---------- */}
      {showForm && (
        <div className="modal-overlay">
          <div
            className="modal-content large"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-btn"
              onClick={() => setShowForm(false)}
            >
              ✖
            </button>
            <h2>{editCompany ? "Edit Company" : "Add New Company"}</h2>
            <div className="vertical-form">
              <input
                placeholder="Name"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              <input
                placeholder="Country"
                value={formData.country || ""}
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value })
                }
              />
              <select
                value={formData.type || "Private"}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
              >
                <option value="Private">Private</option>
                <option value="Government">Government</option>
                <option value="Academic">Academic</option>
                <option value="NGO">NGO</option>
                <option value="Startup">Startup</option>
              </select>
              <input
                placeholder="Role"
                value={formData.role || ""}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              />
              <input
                placeholder="Contact Person"
                value={formData.contact_person || ""}
                onChange={(e) =>
                  setFormData({ ...formData, contact_person: e.target.value })
                }
              />
              <input
                placeholder="Contact Email"
                value={formData.contact_email || ""}
                onChange={(e) =>
                  setFormData({ ...formData, contact_email: e.target.value })
                }
              />
              <input
                placeholder="Contact Phone"
                value={formData.contact_phone || ""}
                onChange={(e) =>
                  setFormData({ ...formData, contact_phone: e.target.value })
                }
              />
              <input
                placeholder="Website"
                value={formData.website || ""}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
              />
              <textarea
                placeholder="Address"
                value={formData.address || ""}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
              <textarea
                placeholder="Notes"
                value={formData.notes || ""}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
              <div className="form-buttons">
                <button className="save-btn" onClick={handleSubmit}>
                  {editCompany ? "Update" : "Save"}
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------- View Modal ---------- */}
      {showViewModal && viewCompany && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div
            className="modal-content large"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-btn"
              onClick={() => setShowViewModal(false)}
            >
              ✖
            </button>
            <h2>{viewCompany.name} - Details</h2>
            <table className="view-table">
              <tbody>
  {visibleFields.map((key) => (
    <tr key={key}>
      <td><strong>{key.replace("_", " ")}</strong></td>
      <td>{viewCompany[key] || "-"}</td>
    </tr>
  ))}
</tbody>

            </table>
            {/* Collaborations Section */}
{companyCollabs.length > 0 ? (
  <div className="collaborations-section">
    <h3>Collaborations</h3>
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Project ID</th>
            <th>Project Name</th>
            <th>Role in Project</th>
          </tr>
        </thead>
        <tbody>
          {companyCollabs.map((collab) => (
            <tr key={collab.project_id}>
              <td>{collab.project_id}</td>
              <td>{collab.project_name}</td>
              <td>{collab.role_in_project}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
) : (
  <p style={{ marginTop: "15px" }}>No collaborations found for this company.</p>
)}

          </div>
        </div>
      )}
    </div>
  );
}
