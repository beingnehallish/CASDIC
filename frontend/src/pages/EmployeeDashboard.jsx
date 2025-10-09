import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/EmployeeDashboard.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function EmployeeDashboard() {
  const token = localStorage.getItem("token");
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [stats, setStats] = useState({
    totalTech: 0,
    active: 0,
    deprecated: 0,
    patents: 0,
    publications: 0,
  });

  // State for password change
const [currentPassword, setCurrentPassword] = useState("");
const [newPassword, setNewPassword] = useState("");
const [msg, setMsg] = useState("");

// Function to handle password update
const handlePasswordChange = async (e) => {
  e.preventDefault();

  try {
    const res = await axios.put("http://localhost:5000/api/employees/change-password", {
  currentPassword,
  newPassword
}, {
  headers: { Authorization: `Bearer ${token}` }
});


    if (res.data.success) {
      setMsg("✅ Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
    } else {
      setMsg("❌ " + (res.data.message || "Password update failed."));
    }
  } catch (err) {
    console.error(err);
    setMsg("❌ Server error. Try again later.");
  }
};
  // Logout function
const handleLogout = () => {
  // Clear session/local storage if any
  localStorage.removeItem("userEmail");
  localStorage.removeItem("authToken");

  // Redirect to login page
  window.location.href = "/login";
};

const [data, setData] = useState({
    technologies: [],
    projects: [],
    companies: [],
    employees: [],
    patents: [],
    publications: [],
  });
const modalFriendlyNames = {
  versions: "Versions",
  tech_specs: "Technical Specifications",
  hardware: "Hardware Qualifications",
  software: "Software Qualifications",
  milestones: "Project Milestones",
  documents: "Supporting Documents",
  specs:"Specs",
  hw:"Hardware Qualification",
  sw:"Software Qualification"
};

  const [formData, setFormData] = useState({});
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [relatedData, setRelatedData] = useState({});
  const [modalData, setModalData] = useState([]);
  const [modalTitle, setModalTitle] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalSection, setModalSection] = useState("");
  const [modalFormData, setModalFormData] = useState({});
  const [isEditingModal, setIsEditingModal] = useState(false);
  const [techList, setTechList] = useState([]);

  const confirmAction = (msg) => window.confirm(msg);

  const friendlyNames = {
    name: "Name",
    category: "Category",
    status: "Status",
    trl_achieved: "TRL Achieved",
    budget: "Budget",
    location: "Location",
    description: "Description",
    start_date: "Start Date",
    end_date: "End Date",
    role: "Role",
    country: "Country",
    tech_id: "Technology ID",
    title: "Title",
    patent_number: "Patent Number",
    date_filed: "Date Filed",
    date_granted: "Date Granted",
    authors: "Authors",
    journal: "Journal",
    year: "Year",
    link: "Link",
    designation: "Designation",
    department: "Department",
    email: "Email",
    production_start_date: "Production Start Date",
    last_usage_date: "Last Usage Date",
    trl_start: "TRL Start",
    trl_description: "TRL Description",
    security_level: "Security Level",
    tech_stack: "Tech Stack",
    salient_features: "Salient Features",
    achievements: "Achievements",
    image_path: "Image Path",
    dev_proj_name: "Dev Project Name",
    dev_proj_number: "Dev Project No.",
    dev_proj_code: "Dev Project Code",
    funding_details: "Funding Details",
    tech_name:"Tech Name",
    project_id:"Project ID",
    pub_id:"Publication ID",
    employee_id:"Employee ID",
    patent_id:"Patent ID",
    company_id:"Company ID",
    version_id:"Version ID",
    version_number:"Version Number",
    release_date:"Release Date",
    notes:"Notes",
    spec_id:"Spec ID",
    parameter_name:"Parameter Name",
    parameter_value:"Parameter Value",
    sw_id:"Software ID",
    hw_id:"Hardware ID",
    achieved_status:"Achieved Status",
    date_achieved:"Date Achieved",
    requirement:"Requirement",
    sw:"Qualification Software",

    };
const [filters, setFilters] = useState({
    category: "technologies",
    status: "",
    trl_min: "",
    trl_max: "",
    budget_min: "",
    budget_max: "",
    tech_stack: "",
    start_date: "",
    end_date: "",
    country: "",
    keyword: "",
    sort_by: "",
    sort_order: "ASC",
    page: 1,
    limit: 10,
    watchlist_only: false,
  });

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/reports", {
        params: filters,
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setResults(res.data.data);
      setLoading(false);
      setTotalCount(res.data.data.length);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      page: 1, // reset page on filter change
    }));
  };

  const handleReset = () => {
    setFilters({
      category: "technologies",
      status: "",
      trl_min: "",
      trl_max: "",
      budget_min: "",
      budget_max: "",
      tech_stack: "",
      start_date: "",
      end_date: "",
      country: "",
      keyword: "",
      sort_by: "",
      sort_order: "ASC",
      page: 1,
      limit: 10,
      watchlist_only: false,
    });
  };

  // 📦 Export to Excel
const exportToExcel = () => {
  if (!results.length) {
    alert("No data to export!");
    return;
  }

  import("xlsx").then((XLSX) => {
    const worksheet = XLSX.utils.json_to_sheet(results);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reports");
    XLSX.writeFile(workbook, "Reports.xlsx");
  });
};

// 📜 Export to PDF
const exportToPDF = () => {
  const doc = new jsPDF({
  orientation: "landscape",  // 👈 makes the PDF horizontal
  unit: "mm",                // millimeters (default)
  format: "a4",              // A4 size (you can change if needed)
});


  // Title
  doc.setFontSize(16);
  doc.text("Reports Export", 14, 15);

  if (!results || results.length === 0) {
    doc.text("No data available", 14, 25);
  } else {
    const tableColumn = Object.keys(results[0]);
    const tableRows = results.map(obj => Object.values(obj));

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 25,
      theme: "grid",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [22, 160, 133] },
    });
  }

  doc.save("Reports.pdf");
};


  // Fetch data for each section
  const fetchData = async (section) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/${section}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData((prev) => ({ ...prev, [section]: res.data }));

      if (section === "technologies") {
        setTechList(res.data);
        const total = res.data.length;
        const active = res.data.filter((t) => t.status === "In Use").length;
        const deprecated = res.data.filter((t) => t.status === "Deprecated").length;
        setStats((prev) => ({ ...prev, totalTech: total, active, deprecated }));

        res.data.forEach(async (tech) => {
          const related = await axios.get(
            `http://localhost:5000/api/technologies/details/${tech.tech_id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setRelatedData((prev) => ({ ...prev, [tech.tech_id]: related.data }));
        });
      }

      if (section === "patents")
        setStats((prev) => ({ ...prev, patents: res.data.length }));
      if (section === "publications")
        setStats((prev) => ({ ...prev, publications: res.data.length }));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    ["technologies", "projects", "companies", "employees", "patents", "publications"].forEach(
      (s) => fetchData(s)
    );
  }, []);

  // Add / Update main record
  const handleAddOrUpdate = async (section, formData, editId, setEditId, setShowForm, setFormData) => {
  const confirmed = confirmAction(editId ? "Update record?" : "Add new?");
  if (!confirmed) return;

  try {
    if (editId) {
      await axios.put(`http://localhost:5000/api/${section}/${editId}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditId(null);
    } else {
      await axios.post(`http://localhost:5000/api/${section}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    setFormData({});
    setShowForm(false);
    fetchData(section);
  } catch (err) {
    console.error(err);
  }
};

  // Delete record
  const handleDelete = async (section, id) => {
    if (!confirmAction("Delete this record?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/${section}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData(section);
    } catch (err) {
      console.error(err);
    }
  };

  // Start edit
  const startEdit = (item, section) => {
    const idKeyMap = {
      technologies: "tech_id",
      projects: "project_id",
      companies: "company_id",
      employees: "employee_id",
      patents: "patent_id",
      publications: "pub_id",
    };
    const idKey = idKeyMap[section];
    setEditId(item[idKey]);
    setFormData(item);
    setShowForm(true);
  };

  // Modal handling
  const openModal = (title, tech_id, type) => {
    const rel = relatedData[tech_id];
    if (!rel || !rel[type]) return;
    setModalTitle(modalFriendlyNames[title] || title);
    setModalSection(type);
    setModalData(rel[type]);
    setShowModal(true);
  };

  const handleModalAddRow = () => {
    const emptyRow = {};
    if (modalData.length > 0) {
      Object.keys(modalData[0]).forEach((k) => (emptyRow[k] = ""));
    }
    setModalData([...modalData, emptyRow]);
    setIsEditingModal(true);
  };

  const handleModalSave = async () => {
    try {
      await axios.post(`http://localhost:5000/api/${modalSection}`, modalData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Saved successfully!");
      setIsEditingModal(false);
      fetchData("technologies");
    } catch (err) {
      console.error(err);
    }
  };
const Section = ({ title, section, fields }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [localFormData, setLocalFormData] = useState({});
  const [showLocalForm, setShowLocalForm] = useState(false);
  const [editIdLocal, setEditIdLocal] = useState(null);

  const filteredData = data[section].filter((item) =>
    Object.values(item).join(" ").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartEdit = (item) => {
    const idKeyMap = {
      technologies: "tech_id",
      projects: "project_id",
      companies: "company_id",
      employees: "employee_id",
      patents: "patent_id",
      publications: "pub_id",
    };
    const idKey = idKeyMap[section];
    setEditIdLocal(item[idKey]);
    setLocalFormData(item);
    setShowLocalForm(true);
  };

  return (
    <div className="empsection">
      <div className="empsection-header">
        <h2>{title}</h2>
        <input
          type="text"
          className="search-bar"
          placeholder={`🔎 Search ${title}`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        
        <button
          className="add-btn"
          onClick={() => {
            setLocalFormData({});
            setEditIdLocal(null);
            setShowLocalForm(true);
          }}
        >
          + Add {title.slice(0, -1)}
        </button>
      </div>

      {/* Form */}
      {showLocalForm && (
        <div className="empform vertical-form">
          {fields.map((f) => {
  const isDateField = [
    "start_date",
    "end_date",
    "production_start_date",
    "last_usage_date",
    "date_filed",
    "date_granted",
    "date_achieved",
    "release_date"
  ].includes(f);

  const isTextArea = [
    "description",
    "salient_features",
    "achievements",
    "trl_description"
  ].includes(f);

  if (f === "tech_id") {
    return (
      <select
        key={f}
        
        value={localFormData.tech_id || ""}
        onChange={(e) =>
          setLocalFormData({ ...localFormData, tech_id: e.target.value })
        }
      >
        <option value="">Select Technology</option>
        {techList.map((t) => (
          <option key={t.tech_id} value={t.tech_id}>
            {t.name}
          </option>
        ))}
      </select>
    );
  }

  if (isDateField) {
    return (
      <DatePicker
  selected={localFormData[f] ? new Date(localFormData[f]) : null}
  onChange={(date) =>
    setLocalFormData({
      ...localFormData,
      [f]: date.toISOString().split("T")[0],
    })
  }
  placeholderText={"📅 "+friendlyNames[f] }
/>
    );
  }

  if (isTextArea) {
    return (
      <div className="textarea-wrapper" key={f}>
        <textarea
          placeholder={friendlyNames[f] || f}
          value={localFormData[f] || ""}
          maxLength={200} // set word/char limit
          onChange={(e) =>
            setLocalFormData({ ...localFormData, [f]: e.target.value })
          }
        />
        <div className="word-count">{(localFormData[f] || "").length}/200</div>
      </div>
      
    );
  }

  return (
    <input
      key={f}
      placeholder={friendlyNames[f] || f}
      value={localFormData[f] || ""}
      onChange={(e) =>
        setLocalFormData({ ...localFormData, [f]: e.target.value })
      }
    />
  );
})}

          <div className="form-buttons">
            <button
              className="save-btn"
              onClick={() =>
                handleAddOrUpdate(
                  section,
                  localFormData,
                  editIdLocal,
                  setEditIdLocal,
                  setShowLocalForm,
                  setLocalFormData
                )
              }
            >
              {editIdLocal ? "Update" : "Save"}
            </button>
            <button
              className="cancel-btn"
              onClick={() => setShowLocalForm(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Cards */}
      <div className="empcard-grid">
        {filteredData.length ? (
          filteredData.map((item) => (
            <div
              key={
                item.tech_id ||
                item.project_id ||
                item.company_id ||
                item.employee_id ||
                item.patent_id ||
                item.pub_id
              }
              className="empcard"
            >
              <div className="empcard-icons">
                <button className="update-btn" onClick={() => handleStartEdit(item)}>
                  ✎
                </button>
                <button
                  className="delete-btn"
                  onClick={() =>
                    handleDelete(
                      section,
                      item.tech_id ||
                        item.project_id ||
                        item.company_id ||
                        item.employee_id ||
                        item.patent_id ||
                        item.pub_id
                    )
                  }
                >
                  🗑
                </button>
              </div>
              {Object.entries(item).map(([k, v]) => (
                <p key={k} className="card-info">
                  <b>{friendlyNames[k] || k}:</b> {v?.toString()}
                </p>
              ))}

              {section === "technologies" && relatedData[item.tech_id] && (
                <div className="tech-buttons">
                  {Object.entries(relatedData[item.tech_id]).map(([key, value]) =>
                    value?.length ? (
                      <button
                        key={key}
                        onClick={() => openModal(key, item.tech_id, key)}
                      >
                        View {modalFriendlyNames[key] || key}
                      </button>
                    ) : null
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No {title.toLowerCase()} found.</p>
        )}
      </div>
    </div>
  );
};

  return (
    <div className="empdashboard">
      <aside className="empsidebar">
        <h2>Employee Panel</h2>
       <ul>
        
  {[
    "Dashboard",
    "Technologies",
    "Projects",
    "Companies",
    "Patents",
    "Publications",
    "Employees",
    "Reports",
    "Settings",
  ].map((tab) => (

            <li
              key={tab}
              className={activeTab === tab ? "active" : ""}
              onClick={() => {
                setActiveTab(tab);
                setShowForm(false);
              }}
            >
              {tab}
            </li>
          ))}
        </ul>
      </aside>

      <main className="empmain-content">
        {activeTab === "Dashboard" && (
          <div className="empstats-grid">
            <div className="empstat-card">
              <h3>Total Technologies</h3>
              <p>{stats.totalTech}</p>
            </div>
            <div className="empstat-card active">
              <h3>Active</h3>
              <p>{stats.active}</p>
            </div>
            <div className="empstat-card deprecated">
              <h3>Deprecated</h3>
              <p>{stats.deprecated}</p>
            </div>
            <div className="empstat-card">
              <h3>Patents</h3>
              <p>{stats.patents}</p>
            </div>
            <div className="empstat-card">
              <h3>Publications</h3>
              <p>{stats.publications}</p>
            </div>
          </div>
        )}

        {activeTab === "Technologies" && (
          <Section
            title="Technologies"
            section="technologies"
            fields={[
              "name",
              "category",
              "production_start_date",
              "last_usage_date",
              "status",
              "trl_start",
              "trl_achieved",
              "trl_description",
              "budget",
              "security_level",
              "location",
              "tech_stack",
              "salient_features",
              "achievements",
            ]}
          />
        )}
        {activeTab === "Projects" && (
          <Section title="Projects" section="projects" fields={["name", "description", "start_date", "end_date"]} />
        )}
        {activeTab === "Companies" && (
          <Section title="Companies" section="companies" fields={["name", "country", "role"]} />
        )}
        {activeTab === "Patents" && (
          <Section
            title="Patents"
            section="patents"
            fields={["tech_id", "title", "patent_number", "date_filed", "date_granted"]}
          />
        )}
        {activeTab === "Publications" && (
          <Section
            title="Publications"
            section="publications"
            fields={["tech_id", "title", "authors", "journal", "year", "link"]}
          />
        )}
        {activeTab === "Employees" && (
          <Section title="Employees" section="employees" fields={["name", "designation", "department", "email"]} />
        )}
     {activeTab === "Reports" && (
  <div className="reports-section">
    <h2>Reports</h2>
    <p>Generate or download analytics and performance reports here.</p>

    {/* 🔍 Horizontal Filter Bar */}
    <div className="filters-panel">
      <select name="category" value={filters.category} onChange={handleFilterChange}>
        <option value="technologies">Technologies</option>
        <option value="projects">Projects</option>
        <option value="patents">Patents</option>
        <option value="publications">Publications</option>
        <option value="versions">Versions</option>
      </select>

      <input
        type="text"
        name="keyword"
        placeholder="Search keyword..."
        value={filters.keyword}
        onChange={handleFilterChange}
      />

      <select name="status" value={filters.status} onChange={handleFilterChange}>
        <option value="">All Status</option>
        <option value="In Development">In Development</option>
        <option value="In Use">In Use</option>
        <option value="Deprecated">Deprecated</option>
        <option value="Achieved">Achieved</option>
        <option value="Pending">Pending</option>
      </select>

      <input
        type="number"
        name="trl_min"
        placeholder="TRL Min"
        value={filters.trl_min}
        onChange={handleFilterChange}
      />
      <input
        type="number"
        name="trl_max"
        placeholder="TRL Max"
        value={filters.trl_max}
        onChange={handleFilterChange}
      />

      <input
        type="number"
        name="budget_min"
        placeholder="Budget Min"
        value={filters.budget_min}
        onChange={handleFilterChange}
      />
      <input
        type="number"
        name="budget_max"
        placeholder="Budget Max"
        value={filters.budget_max}
        onChange={handleFilterChange}
      />

      <input
        type="text"
        name="tech_stack"
        placeholder="Tech Stack"
        value={filters.tech_stack}
        onChange={handleFilterChange}
      />

      <input
        type="text"
        name="country"
        placeholder="Country"
        value={filters.country}
        onChange={handleFilterChange}
      />

      <input
        type="date"
        name="start_date"
        value={filters.start_date}
        onChange={handleFilterChange}
      />
      <input
        type="date"
        name="end_date"
        value={filters.end_date}
        onChange={handleFilterChange}
      />

      <label className="watchlist-checkbox">
        <input
          type="checkbox"
          name="watchlist_only"
          checked={filters.watchlist_only}
          onChange={handleFilterChange}
        />
        Watchlist
      </label>

      <div className="filter-buttons">
        <button className="apply-btn" onClick={fetchReports}>Apply</button>
        <button className="reset-btn" onClick={handleReset}>Reset</button>
      </div>
    </div>

    {/* 📊 Reports Table */}
    <div className="reports-results">
  {loading ? (
    <p>Loading...</p>
  ) : (
    <>
      <div className="export-buttons">
        <button className="export-btn excel" onClick={exportToExcel}>Export Excel</button>
        <button className="export-btn pdf" onClick={exportToPDF}>Export PDF</button>
      </div>

      <table>
        <thead>
          <tr>
            {results.length > 0 &&
              Object.keys(results[0]).map((key) => <th key={key}>{key}</th>)}
          </tr>
        </thead>
        <tbody>
          {results.map((row, idx) => (
            <tr key={idx}>
              {Object.values(row).map((v, i) => (
                <td key={i}>{v?.toString()}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )}
</div>

  </div>
)}

{activeTab === "Settings" && (
        <div className="settings">
          <h2>Change Password</h2>
          <form onSubmit={handlePasswordChange}>
            <input
              type="password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button type="submit">Update Password</button>
          </form>

          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>

          {msg && <p>{msg}</p>}
        </div>
      )}


      </main>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modalTitle} </h2>
              <div className="modal-actions">
                <button className="add-icon"onClick={handleModalAddRow}>＋</button>
                <button className="edit-icon"onClick={() => setIsEditingModal(true)}>✎</button>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  {modalData.length > 0 &&
                    Object.keys(modalData[0]).map((key) => <th key={key}>{friendlyNames[key] || key}</th>)}
                </tr>
              </thead>
              <tbody>
                {modalData.map((row, i) => (
                  <tr key={i}>
                    {Object.entries(row).map(([k, v]) => (
                      <td key={k}>
                        {isEditingModal ? (
                          <input
                            value={v || ""}
                            onChange={(e) => {
                              const newData = [...modalData];
                              newData[i][k] = e.target.value;
                              setModalData(newData);
                            }}
                          />
                        ) : (
                          v
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {isEditingModal && (
              <div className="form-buttons">
                <button onClick={handleModalSave}>Save</button>
                <button onClick={() => setIsEditingModal(false)}>Cancel</button>
              </div>
            )}
            <button className="close-btn" onClick={() => setShowModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
