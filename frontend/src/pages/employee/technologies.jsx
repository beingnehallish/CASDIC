// import { useEffect, useState } from "react";
// import axios from "axios";
// import "../../styles/employee.technologies.css";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import {
//   ResponsiveContainer,
//   BarChart,
//   Bar,
//   LineChart,
//   Line,
//   CartesianGrid,
//   XAxis,
//   YAxis,
//   Tooltip,
// } from "recharts";

// // A stable, custom tooltip for graphs
// const CustomGraphTooltip = ({ active, payload, label }) => {
//   if (active && payload && payload.length) {
//     const data = payload[0].payload;
//     const techs = data.techs || [];

//     return (
//       <div className="custom-graph-tooltip">
//         <p className="tooltip-label">{label || data.name || data.status}</p>
//         <p className="tooltip-intro">Count: {data.count}</p>
//         {techs.length > 0 && (
//           <div className="tooltip-tech-list">
//             <strong>Technologies:</strong>
//             <ul>
//               {techs.slice(0, 5).map((t) => (
//                 <li key={t.tech_id}>{t.name}</li>
//               ))}
//               {techs.length > 5 && <li>...and {techs.length - 5} more</li>}
//             </ul>
//           </div>
//         )}
//       </div>
//     );
//   }
//   return null;
// };

// // --- NEW EDITABLE TAB COMPONENT ---
// // This component handles all the Add/Edit/Save/Delete logic for related data
// const EditableTabPanel = ({ title, data, columns, apiEndpoint, techId, token, onDataChange }) => {
//   const [editRowId, setEditRowId] = useState(null);
//   const [isAdding, setIsAdding] = useState(false);
//   const [formData, setFormData] = useState({});

//   const getEmptyForm = () => columns.reduce((acc, col) => ({ ...acc, [col.key]: "" }), {});

//   const handleAdd = () => {
//     setFormData(getEmptyForm());
//     setIsAdding(true);
//     setEditRowId(null);
//   };

//   const handleEdit = (row) => {
//     setFormData(row);
//     setEditRowId(row[columns.find(c => c.isId).key]); // Assumes one column `isId: true`
//     setIsAdding(false);
//   };

//   const handleCancel = () => {
//     setFormData({});
//     setEditRowId(null);
//     setIsAdding(false);
//   };

//   const handleFormChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleSave = async () => {
//     try {
//       if (isAdding) {
//         // Create new record
//         await axios.post(`http://localhost:5000/api/${apiEndpoint}`, 
//           { ...formData, tech_id: techId },
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//       } else {
//         // Update existing record
//         const idKey = columns.find(c => c.isId).key;
//         await axios.put(`http://localhost:5000/api/${apiEndpoint}/${editRowId}`, 
//           formData, 
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//       }
//       onDataChange(); // Refresh data in parent
//       handleCancel();   // Close form
//     } catch (err) {
//       console.error(`Failed to save ${title}`, err);
//       alert(`Error saving ${title}`);
//     }
//   };

//   const handleDelete = async (row) => {
//     const idKey = columns.find(c => c.isId).key;
//     const id = row[idKey];
//     if (!window.confirm(`Are you sure you want to delete this ${title.slice(0, -1)}?`)) return;
    
//     try {
//       await axios.delete(`http://localhost:5000/api/${apiEndpoint}/${id}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       onDataChange(); // Refresh data in parent
//     } catch (err) {
//       console.error(`Failed to delete ${title}`, err);
//       alert(`Error deleting ${title}`);
//     }
//   };

//   const renderRow = (row) => {
//     const idKey = columns.find(c => c.isId).key;
//     const isEditing = row[idKey] === editRowId;

//     if (isEditing) {
//       // --- Render Editable Form Row ---
//       return (
//         <tr key="edit-row">
//           {columns.filter(c => !c.isId).map(col => (
//             <td key={col.key}>
//               <input
//                 type="text"
//                 name={col.key}
//                 value={formData[col.key] || ""}
//                 onChange={handleFormChange}
//                 className="form-input"
//               />
//             </td>
//           ))}
//           <td className="row-actions">
//             <button className="save-btn-inline" onClick={handleSave}>💾</button>
//             <button className="cancel-btn-inline" onClick={handleCancel}>✖</button>
//           </td>
//         </tr>
//       );
//     }

//     // --- Render Read-Only Data Row ---
//     return (
//       <tr key={row[idKey]}>
//         {columns.filter(c => !c.isId).map(col => <td key={col.key}>{row[col.key]}</td>)}
//         <td className="row-actions">
//           <button className="edit-btn-inline" onClick={() => handleEdit(row)}>✎</button>
//           <button className="delete-btn-inline" onClick={() => handleDelete(row)}>🗑</button>
//         </td>
//       </tr>
//     );
//   };

//   return (
//     <div className="modal-tab-content editable-table-container">
//       <div className="editable-table-header">
//         <h4>{title}</h4>
//         {!isAdding && !editRowId && (
//           <button className="add-btn-inline" onClick={handleAdd}>
//             ➕ Add New
//           </button>
//         )}
//       </div>
      
//       <table>
//         <thead>
//           <tr>
//             {columns.filter(c => !c.isId).map(col => <th key={col.key}>{col.label}</th>)}
//             <th>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {data.map(row => renderRow(row))}
          
//           {/* --- Render "Add New" Form Row --- */}
//           {isAdding && (
//              <tr key="add-row">
//               {columns.filter(c => !c.isId).map(col => (
//                 <td key={col.key}>
//                   <input
//                     type="text"
//                     name={col.key}
//                     value={formData[col.key] || ""}
//                     onChange={handleFormChange}
//                     placeholder={col.label}
//                     className="form-input"
//                   />
//                 </td>
//               ))}
//               <td className="row-actions">
//                 <button className="save-btn-inline" onClick={handleSave}>💾</button>
//                 <button className="cancel-btn-inline" onClick={handleCancel}>✖</button>
//               </td>
//             </tr>
//           )}
//         </tbody>
//       </table>
//       {data.length === 0 && !isAdding && (
//         <p className="no-data-message">No {title.toLowerCase()} data found for this technology.</p>
//       )}
//     </div>
//   );
// };
// // --- END OF EDITABLE TAB COMPONENT ---


// export default function TechnologiesPage() {
//   const token = localStorage.getItem("token");

//   // Graph data
//   const [trlData, setTrlData] = useState([]);
//   const [productionData, setProductionData] = useState([]);
//   const [statusData, setStatusData] = useState([]);

//   // Main technology list
//   const [technologies, setTechnologies] = useState([]);

//   // Modal State
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [modalMode, setModalMode] = useState("add"); // 'add' or 'edit'
//   const [modalTechId, setModalTechId] = useState(null);
//   const [modalFormData, setModalFormData] = useState({});
//   const [modalRelatedData, setModalRelatedData] = useState({});
//   const [modalActiveTab, setModalActiveTab] = useState("overview");

//   // Filters State
//   const [techFilters, setTechFilters] = useState({
//     keyword: "",
//     category: "",
//     status: "",
//     trlMin: "",
//     trlMax: "",
//     budgetMin: "",
//     budgetMax: "",
//     security: "",
//   });
//   const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

//   // Friendly names for table headers
//   const friendlyNames = {
//     name: "Name",
//     category: "Category",
//     status: "Status",
//     trl_achieved: "TRL Achieved",
//     tech_id: "Tech ID",
//     version_number: "Version",
//     release_date: "Release Date",
//     notes: "Notes",
//     parameter_name: "Parameter",
//     parameter_value: "Value",
//     requirement: "Requirement",
//     achieved_status: "Achieved",
//     date_achieved: "Date",
//     spec_id: "Spec ID",
//     version_id: "Version ID",
//     hw_id: "HW ID",
//     sw_id: "SW ID",
//     // ... add any other field names
//   };

//   // --- Data Fetching ---

//   const fetchTechnologies = async () => {
//     try {
//       const res = await axios.get("http://localhost:5000/api/technologies", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setTechnologies(res.data);
//       // Process data for charts
//       processGraphData(res.data);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   useEffect(() => {
//     fetchTechnologies();
//   }, [token]); 

//   const processGraphData = (techData) => {
//     // 1. TRL Chart
//     const trlCounts = Array.from({ length: 10 }, (_, i) => {
//       const trl = i + 1;
//       const techs = techData.filter((t) => t.trl_achieved === trl);
//       return { name: `TRL ${trl}`, count: techs.length, techs };
//     });
//     setTrlData(trlCounts);

//     // 2. Production Year Chart
//     const yearCountsMap = {};
//     techData.forEach((t) => {
//       if (t.production_start_date) {
//         const year = new Date(t.production_start_date).getFullYear();
//         if (!yearCountsMap[year]) yearCountsMap[year] = { count: 0, techs: [] };
//         yearCountsMap[year].count++;
//         yearCountsMap[year].techs.push(t);
//       }
//     });
//     const prodData = Object.entries(yearCountsMap)
//       .map(([year, obj]) => ({ year: +year, count: obj.count, techs: obj.techs }))
//       .sort((a, b) => a.year - b.year);
//     setProductionData(prodData);

//     // 3. Status Chart
//     const statuses = ["In Development", "In Use", "Deprecated"];
//     const statusCounts = statuses.map((s) => {
//       const techs = techData.filter((t) => t.status === s);
//       return { status: s, count: techs.length, techs };
//     });
//     setStatusData(statusCounts);
//   };

//   // --- Modal Logic ---

//   const resetModalState = () => {
//     setIsModalOpen(false);
//     setModalTechId(null);
//     setModalFormData({});
//     setModalRelatedData({});
//     setModalActiveTab("overview");
//   };

//   const refreshRelatedData = async (techId) => {
//     if (!techId) return;
//     try {
//       const res = await axios.get(`http://localhost:5000/api/technologies/details/${techId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setModalRelatedData(res.data);
//     } catch (err) {
//       console.error("Failed to fetch tech details", err);
//       setModalRelatedData({});
//     }
//   };

//   const handleOpenAddModal = () => {
//     resetModalState();
//     setModalMode("add");
//     setModalFormData({
//       name: "",
//       category: "",
//       status: "In Development",
//       production_start_date: null,
//       last_usage_date: null,
//       budget: "",
//       security_level: "Public",
//     });
//     setIsModalOpen(true);
//   };

//   const handleOpenEditModal = async (tech) => {
//     resetModalState();
//     setModalMode("edit");
//     setModalTechId(tech.tech_id);
//     setModalFormData(tech); // Set core data
//     setIsModalOpen(true);
//     await refreshRelatedData(tech.tech_id); // Fetch related data ON DEMAND
//   };

//   const handleModalSave = async () => {
//     if (!window.confirm(modalMode === "add" ? "Add new technology?" : "Update this technology?")) return;

//     try {
//       let response;
//       if (modalMode === "add") {
//         response = await axios.post("http://localhost:5000/api/technologies", modalFormData, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         // --- This is the new workflow ---
//         // After adding, switch to edit mode for the new item
//         setModalMode("edit");
//         const newTechId = response.data.tech_id; // Get new ID from server response
//         setModalTechId(newTechId);
//         setModalFormData(prev => ({...prev, tech_id: newTechId})); // Update form data with new ID
//         await refreshRelatedData(newTechId); // Load (empty) related data
//         alert("Technology added. You can now add specs, hardware, etc.");
//       } else {
//         await axios.put(`http://localhost:5000/api/technologies/${modalTechId}`, modalFormData, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         alert("Technology updated.");
//       }
//       // Refresh main table and graphs
//       fetchTechnologies();
//     } catch (err) {
//       console.error(err);
//       alert("Failed to save technology.");
//     }
//   };
  
//   // --- Filter Logic ---

//   const handleFilterChange = (e) => {
//     const { name, value } = e.target;
//     setTechFilters(prev => ({ ...prev, [name]: value }));
//   };

//   const filteredTechnologies = technologies.filter((t) => {
//     if (!t) return false; // Added safety check
//     const keyword = techFilters.keyword?.toLowerCase() || "";
//     return (
//       (t?.name?.toLowerCase?.().includes(keyword) || false) &&
//       (!techFilters.category || t?.category === techFilters.category) &&
//       (!techFilters.status || t?.status === techFilters.status) &&
//       (!techFilters.trlMin || Number(t?.trl_start || 0) >= Number(techFilters.trlMin)) &&
//       (!techFilters.trlMax || Number(t?.trl_achieved || 0) <= Number(techFilters.trlMax)) &&
//       (!techFilters.budgetMin || Number(t?.budget || 0) >= Number(techFilters.budgetMin)) &&
//       (!techFilters.budgetMax || Number(t?.budget || 0) <= Number(techFilters.budgetMax)) &&
//       (!techFilters.security || t?.security_level === techFilters.security)
//     );
//   });

//   // --- Render ---

//   return (
//     <div className="empsection">
//       <div className="tech-table-actions">
//         <button className="add-btn" onClick={handleOpenAddModal}>
//           ➕ Add Technology
//         </button>
//       </div>
//       <div className="empsection-header">
//         <h2>Technologies</h2>
//         <p>Total Technologies: {technologies.length}</p>
//       </div>

//       {/* ---------- Graphs ---------- */}
//       <div className="tech-graphs">
//         <div className="graph-card">
//           <h3>TRL Achieved</h3>
//           <ResponsiveContainer width="100%" height={250}>
//             <BarChart data={trlData}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="name" />
//               <YAxis allowDecimals={false} />
//               <Tooltip content={<CustomGraphTooltip />} />
//               <Bar dataKey="count" fill="#22a085" />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>

//         <div className="graph-card">
//           <h3>Production Year</h3>
//           <ResponsiveContainer width="100%" height={250}>
//             <LineChart data={productionData}>
//               <CartesianGrid strokeDasharray="3 3" />
              
//               {/* --- THIS IS THE FIX --- */}
//               <XAxis 
//                 dataKey="year" 
//                 type="number" 
//                 domain={productionData.length > 0 ? ['dataMin', 'dataMax'] : undefined} 
//                 allowDecimals={false}
//               />
              
//               <YAxis allowDecimals={false} />
//               <Tooltip content={<CustomGraphTooltip />} />
//               <Line type="monotone" dataKey="count" stroke="#2980b9" />
//             </LineChart>
//           </ResponsiveContainer>
//         </div>

//         <div className="graph-card">
//           <h3>Status</h3>
//           <ResponsiveContainer width="100%" height={250}>
//             <BarChart data={statusData}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="status" />
//               <YAxis allowDecimals={false} />
//               <Tooltip content={<CustomGraphTooltip />} />
//               <Bar dataKey="count" fill="#e67e22" />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>
//       </div>

//       {/* ---------- Filters ---------- */}
//       <div className="filters-panel-wrapper">
//         <div className="filters-panel">
//           <input
//             type="text"
//             name="keyword"
//             placeholder="🔎 Search..."
//             value={techFilters.keyword}
//             onChange={handleFilterChange}
//           />
//           <select name="category" value={techFilters.category} onChange={handleFilterChange}>
//             <option value="">All Categories</option>
//             {[...new Set(technologies.map((t) => t.category))].map((c) => (
//               <option key={c} value={c}>{c}</option>
//             ))}
//           </select>
//           <select name="status" value={techFilters.status} onChange={handleFilterChange}>
//             <option value="">All Status</option>
//             <option value="In Development">In Development</option>
//             <option value="In Use">In Use</option>
//             <option value="Deprecated">Deprecated</option>
//           </select>
//           <button className="advanced-filter-btn" onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>
//             {showAdvancedFilters ? "Hide" : "Show"} Advanced Filters
//           </button>
//         </div>

//         {showAdvancedFilters && (
//           <div className="filters-panel advanced-filters">
//             <input
//               type="number"
//               name="trlMin"
//               placeholder="TRL min"
//               value={techFilters.trlMin}
//               onChange={handleFilterChange}
//             />
//             <input
//               type="number"
//               name="trlMax"
//               placeholder="TRL max"
//               value={techFilters.trlMax}
//               onChange={handleFilterChange}
//             />
//             <input
//               type="number"
//               name="budgetMin"
//               placeholder="Budget min"
//               value={techFilters.budgetMin}
//               onChange={handleFilterChange}
//             />
//             <input
//               type="number"
//               name="budgetMax"
//               placeholder="Budget max"
//               value={techFilters.budgetMax}
//               onChange={handleFilterChange}
//             />
//             <select name="security" value={techFilters.security} onChange={handleFilterChange}>
//               <option value="">All Security</option>
//               <option value="Public">Public</option>
//               <option value="Restricted">Restricted</option>
//               <option value="Confidential">Confidential</option>
//             </select>
//           </div>
//         )}
//       </div>


//       {/* ---------- Filtered Table ---------- */}
//       <div className="reports-results">
//         <table>
//           <thead>
//             <tr>
//               <th>ID</th>
//               <th>Title</th>
//               <th>Category</th>
//               <th>Status</th>
//               <th>TRL</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredTechnologies.map((t) => (
//               <tr key={t.tech_id}>
//                 <td>{t.tech_id}</td>
//                 <td>{t.name}</td>
//                 <td>{t.category}</td>
//                 <td>{t.status}</td>
//                 <td>{t.trl_achieved}</td>
//                 <td>
//                   <button
//                     className="edit-btn"
//                     onClick={() => handleOpenEditModal(t)}
//                   >
//                     ✎ Manage
//                   </button>
//                   {/* Add Delete button here if needed */}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* ---------- Add/Edit Tabbed Modal ---------- */}
//       {isModalOpen && (
//         <div className="modal-overlay" onClick={resetModalState}>
//           <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
//             <button className="close-btn" onClick={resetModalState}>✖</button>
            
//             <h2>{modalMode === 'add' ? "Add New Technology" : `Manage: ${modalFormData.name}`}</h2>

//             {/* --- Modal Tabs --- */}
//             <div className="modal-tabs">
//               <button
//                 className={`tab-btn ${modalActiveTab === 'overview' ? 'active' : ''}`}
//                 onClick={() => setModalActiveTab('overview')}
//               >
//                 Overview
//               </button>
//               <button
//                 className={`tab-btn ${modalActiveTab === 'specs' ? 'active' : ''}`}
//                 onClick={() => setModalActiveTab('specs')}
//                 disabled={modalMode === 'add'}
//               >
//                 Specifications
//               </button>
//               <button
//                 className={`tab-btn ${modalActiveTab === 'hardware' ? 'active' : ''}`}
//                 onClick={() => setModalActiveTab('hardware')}
//                 disabled={modalMode === 'add'}
//               >
//                 Hardware
//               </button>
//               <button
//                 className={`tab-btn ${modalActiveTab === 'software' ? 'active' : ''}`}
//                 onClick={() => setModalActiveTab('software')}
//                 disabled={modalMode === 'add'}
//               >
//                 Software
//               </button>
//               <button
//                 className={`tab-btn ${modalActiveTab === 'versions' ? 'active' : ''}`}
//                 onClick={() => setModalActiveTab('versions')}
//                 disabled={modalMode === 'add'}
//               >
//                 Versions
//               </button>
//             </div>

//             {/* --- Tab Content --- */}
//             <div className="modal-tab-panel">
//               {modalActiveTab === 'overview' && (
//                 <div className="modal-tab-content vertical-form">
//                   <label>Technology Name</label>
//                   <input
//                     placeholder="Technology Name"
//                     value={modalFormData.name || ""}
//                     onChange={(e) => setModalFormData({ ...modalFormData, name: e.target.value })}
//                   />
//                   <label>Category</label>
//                   <input
//                     placeholder="Category"
//                     value={modalFormData.category || ""}
//                     onChange={(e) => setModalFormData({ ...modalFormData, category: e.taget.value })}
//                   />
//                   <label>Status</label>
//                   <select
//                     value={modalFormData.status || ""}
//                     onChange={(e) => setModalFormData({ ...modalFormData, status: e.target.value })}
//                   >
//                     <option value="In Development">In Development</option>
//                     <option value="In Use">In Use</option>
//                     <option value="Deprecated">Deprecated</option>
//                   </select>

//                   <label>Production Start Date</label>
//                   <DatePicker
//                     selected={modalFormData.production_start_date ? new Date(modalFormData.production_start_date) : null}
//                     onChange={(date) => setModalFormData({ ...modalFormData, production_start_date: date?.toISOString().split("T")[0] })}
//                     placeholderText="Select start date"
//                   />
                  
//                   <label>Budget</label>
//                   <input
//                     type="number"
//                     placeholder="Budget"
//                     value={modalFormData.budget || ""}
//                     onChange={(e) => setModalFormData({ ...modalFormData, budget: e.target.value })}
//                   />
//                   <label>Security Level</label>
//                   <select
//                     value={modalFormData.security_level || "Public"}
//                     onChange={(e) => setModalFormData({ ...modalFormData, security_level: e.target.value })}
//                   >
//                     <option value="Public">Public</option>
//                     <option value="Restricted">Restricted</option>
//                     <option value="Confidential">Confidential</option>
//                   </select>

//                   <div className="form-buttons">
//                     <button className="save-btn" onClick={handleModalSave}>
//                       {modalMode === 'add' ? "Save and Continue" : "Save Changes"}
//                     </button>
//                   </div>
//                 </div>
//               )}

//               {modalActiveTab === 'specs' && (
//                 <EditableTabPanel
//                   key="specs"
//                   title="Specifications"
//                   apiEndpoint="specs"
//                   data={modalRelatedData.specs || []}
//                   columns={[
//                     { key: 'spec_id', label: 'ID', isId: true },
//                     { key: 'parameter_name', label: 'Parameter' },
//                     { key: 'parameter_value', label: 'Value' }
//                   ]}
//                   techId={modalTechId}
//                   token={token}
//                   onDataChange={() => refreshRelatedData(modalTechId)}
//                 />
//               )}
//               {modalActiveTab === 'hardware' && (
//                 <EditableTabPanel
//                   key="hardware"
//                   title="Hardware Qualifications"
//                   apiEndpoint="hw" // Assuming API is /api/hw
//                   data={modalRelatedData.hw || []}
//                   columns={[
//                     { key: 'hw_id', label: 'ID', isId: true },
//                     { key: 'requirement', label: 'Requirement' },
//                     { key: 'achieved_status', label: 'Status' },
//                     { key: 'date_achieved', label: 'Date' }
//                   ]}
//                   techId={modalTechId}
//                   token={token}
//                   onDataChange={() => refreshRelatedData(modalTechId)}
//                 />
//               )}
//               {modalActiveTab === 'software' && (
//                  <EditableTabPanel
//                   key="software"
//                   title="Software Qualifications"
//                   apiEndpoint="sw" // Assuming API is /api/sw
//                   data={modalRelatedData.sw || []}
//                   columns={[
//                     { key: 'sw_id', label: 'ID', isId: true },
//                     { key: 'requirement', label: 'Requirement' },
//                     { key: 'achieved_status', label: 'Status' },
//                     { key: 'date_achieved', label: 'Date' }
//                   ]}
//                   techId={modalTechId}
//                   token={token}
//                   onDataChange={() => refreshRelatedData(modalTechId)}
//                 />
//               )}
//               {modalActiveTab === 'versions' && (
//                 <EditableTabPanel
//                   key="versions"
//                   title="Versions"
//                   apiEndpoint="versions"
//                   data={modalRelatedData.versions || []}
//                   columns={[
//                     { key: 'version_id', label: 'ID', isId: true },
//                     { key: 'version_number', label: 'Version' },
//                     { key: 'release_date', label: 'Release Date' },
//                     { key: 'notes', label: 'Notes' }
//                   ]}
//                   techId={modalTechId}
//                   token={token}
//                   onDataChange={() => refreshRelatedData(modalTechId)}
//                 />
//               )}
//             </div>
            
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

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

// A stable, custom tooltip for graphs
const CustomGraphTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const techs = data.techs || [];

    return (
      <div className="custom-graph-tooltip">
        <p className="tooltip-label">{label || data.name || data.status}</p>
        <p className="tooltip-intro">Count: {data.count}</p>
        {techs.length > 0 && (
          <div className="tooltip-tech-list">
            <strong>Technologies:</strong>
            <ul>
              {techs.slice(0, 5).map((t) => (
                <li key={t.tech_id}>{t.name}</li>
              ))}
              {techs.length > 5 && <li>...and {techs.length - 5} more</li>}
            </ul>
          </div>
        )}
      </div>
    );
  }
  return null;
};

// --- NEW EDITABLE TAB COMPONENT ---
// This component handles all the Add/Edit/Save/Delete logic for related data
const EditableTabPanel = ({ title, data, columns, apiEndpoint, techId, token, onDataChange }) => {
  const [editRowId, setEditRowId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({});

  const getEmptyForm = () => columns.reduce((acc, col) => ({ ...acc, [col.key]: "" }), {});

  const handleAdd = () => {
    setFormData(getEmptyForm());
    setIsAdding(true);
    setEditRowId(null);
  };

  const handleEdit = (row) => {
    setFormData(row);
    setEditRowId(row[columns.find(c => c.isId).key]); // Assumes one column `isId: true`
    setIsAdding(false);
  };

  const handleCancel = () => {
    setFormData({});
    setEditRowId(null);
    setIsAdding(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      if (isAdding) {
        // Create new record
        await axios.post(`http://localhost:5000/api/${apiEndpoint}`, 
          { ...formData, tech_id: techId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Update existing record
        const idKey = columns.find(c => c.isId).key;
        await axios.put(`http://localhost:5000/api/${apiEndpoint}/${editRowId}`, 
          formData, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      onDataChange(); // Refresh data in parent
      handleCancel();   // Close form
    } catch (err) {
      console.error(`Failed to save ${title}`, err);
      alert(`Error saving ${title}`);
    }
  };

  const handleDelete = async (row) => {
    const idKey = columns.find(c => c.isId).key;
    const id = row[idKey];
    if (!window.confirm(`Are you sure you want to delete this ${title.slice(0, -1)}?`)) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/${apiEndpoint}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onDataChange(); // Refresh data in parent
    } catch (err) {
      console.error(`Failed to delete ${title}`, err);
      alert(`Error deleting ${title}`);
    }
  };

  const renderRow = (row) => {
    const idKey = columns.find(c => c.isId).key;
    const isEditing = row[idKey] === editRowId;

    if (isEditing) {
      // --- Render Editable Form Row ---
      return (
        <tr key="edit-row">
          {columns.filter(c => !c.isId).map(col => (
            <td key={col.key}>
              <input
                type="text"
                name={col.key}
                value={formData[col.key] || ""}
                onChange={handleFormChange}
                className="form-input"
              />
            </td>
          ))}
          <td className="row-actions">
            <button className="save-btn-inline" onClick={handleSave}>💾</button>
            <button className="cancel-btn-inline" onClick={handleCancel}>✖</button>
          </td>
        </tr>
      );
    }

    // --- Render Read-Only Data Row ---
    return (
      <tr key={row[idKey]}>
        {columns.filter(c => !c.isId).map(col => <td key={col.key}>{row[col.key]}</td>)}
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
          <button className="add-btn-inline" onClick={handleAdd}>
            ➕ Add New
          </button>
        )}
      </div>
      
      <table>
        <thead>
          <tr>
            {columns.filter(c => !c.isId).map(col => <th key={col.key}>{col.label}</th>)}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map(row => renderRow(row))}
          
          {/* --- Render "Add New" Form Row --- */}
          {isAdding && (
             <tr key="add-row">
              {columns.filter(c => !c.isId).map(col => (
                <td key={col.key}>
                  <input
                    type="text"
                    name={col.key}
                    value={formData[col.key] || ""}
                    onChange={handleFormChange}
                    placeholder={col.label}
                    className="form-input"
                  />
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
        <p className="no-data-message">No {title.toLowerCase()} data found for this technology.</p>
      )}
    </div>
  );
};
// --- END OF EDITABLE TAB COMPONENT ---


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
      name: "",
      category: "",
      status: "In Development",
      production_start_date: null,
      last_usage_date: null,
      budget: "",
      security_level: "Public",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = async (tech) => {
    resetModalState();
    setModalMode("edit");
    setModalTechId(tech.tech_id);
    setModalFormData(tech); // Set core data
    setIsModalOpen(true);
    await refreshRelatedData(tech.tech_id); // Fetch related data ON DEMAND
  };

  const handleModalSave = async () => {
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

  // --- Render ---

  return (
    <div className="empsection">
      <div className="tech-table-actions">
        <button className="add-btn" onClick={handleOpenAddModal}>
          ➕ Add Technology
        </button>
      </div>
      <div className="empsection-header">
        <h2>Technologies</h2>
        <p>Total Technologies: {technologies.length}</p>
      </div>

      {/* ---------- Graphs ---------- */}
      <div className="tech-graphs">
        <div className="graph-card">
          <h3>TRL Achieved</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={trlData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip content={<CustomGraphTooltip />} />
              <Bar dataKey="count" fill="#22a085" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="graph-card">
          <h3>Production Year</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={productionData}>
              <CartesianGrid strokeDasharray="3 3" />
              
              {/* --- THIS IS THE FIX --- */}
              <XAxis 
                dataKey="year" 
                type="number" 
                domain={productionData.length > 0 ? ['dataMin', 'dataMax'] : undefined} 
                allowDecimals={false}
              />
              
              <YAxis allowDecimals={false} />
              <Tooltip content={<CustomGraphTooltip />} />
              <Line type="monotone" dataKey="count" stroke="#2980b9" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="graph-card">
          <h3>Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis allowDecimals={false} />
              <Tooltip content={<CustomGraphTooltip />} />
              <Bar dataKey="count" fill="#e67e22" />
            </BarChart>
          </ResponsiveContainer>
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


      {/* ---------- Filtered Table ---------- */}
      <div className="reports-results">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Category</th>
              <th>Status</th>
              <th>TRL</th>
              <th style={{width: "150px"}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTechnologies.map((t) => (
              <tr key={t.tech_id}>
                <td>{t.tech_id}</td>
                <td>{t.name}</td>
                <td>{t.category}</td>
                <td>{t.status}</td>
                <td>{t.trl_achieved}</td>
                <td>
                  {/* *** ACTION BUTTONS WRAPPER *** */}
                  <div className="action-buttons-wrapper">
                    <button
                      className="edit-btn"
                      onClick={() => handleOpenEditModal(t)}
                    >
                      ✎ Manage
                    </button>
                    {/* *** NEW DELETE BUTTON *** */}
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteTechnology(t.tech_id)}
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

      {/* ---------- Add/Edit Tabbed Modal ---------- */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={resetModalState}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={resetModalState}>✖</button>
            
            <h2>{modalMode === 'add' ? "Add New Technology" : `Manage: ${modalFormData.name}`}</h2>

            {/* --- Modal Tabs --- */}
            <div className="modal-tabs">
              <button
                className={`tab-btn ${modalActiveTab === 'overview' ? 'active' : ''}`}
                onClick={() => setModalActiveTab('overview')}
              >
                Overview
              </button>
              <button
                className={`tab-btn ${modalActiveTab === 'specs' ? 'active' : ''}`}
                onClick={() => setModalActiveTab('specs')}
                disabled={modalMode === 'add'}
              >
                Specifications
              </button>
              <button
                className={`tab-btn ${modalActiveTab === 'hardware' ? 'active' : ''}`}
                onClick={() => setModalActiveTab('hardware')}
                disabled={modalMode === 'add'}
              >
                Hardware
              </button>
              <button
                className={`tab-btn ${modalActiveTab === 'software' ? 'active' : ''}`}
                onClick={() => setModalActiveTab('software')}
                disabled={modalMode === 'add'}
              >
                Software
              </button>
              <button
                className={`tab-btn ${modalActiveTab === 'versions' ? 'active' : ''}`}
                onClick={() => setModalActiveTab('versions')}
                disabled={modalMode === 'add'}
              >
                Versions
              </button>
            </div>

            {/* --- Tab Content --- */}
            <div className="modal-tab-panel">
              {modalActiveTab === 'overview' && (
                <div className="modal-tab-content vertical-form">
                  <label>Technology Name</label>
                  <input
                    placeholder="Technology Name"
                    value={modalFormData.name || ""}
                    onChange={(e) => setModalFormData({ ...modalFormData, name: e.target.value })}
                  />
                  <label>Category</label>
                  <input
                    placeholder="Category"
                    value={modalFormData.category || ""}
                    onChange={(e) => setModalFormData({ ...modalFormData, category: e.target.value })}
                  />
                  <label>Status</label>
                  <select
                    value={modalFormData.status || ""}
                    onChange={(e) => setModalFormData({ ...modalFormData, status: e.target.value })}
                  >
                    <option value="In Development">In Development</option>
                    <option value="In Use">In Use</option>
                    <option value="Deprecated">Deprecated</option>
                  </select>

                  <label>Production Start Date</label>
                  <DatePicker
                    selected={modalFormData.production_start_date ? new Date(modalFormData.production_start_date) : null}
                    onChange={(date) => setModalFormData({ ...modalFormData, production_start_date: date?.toISOString().split("T")[0] })}
                    placeholderText="Select start date"
                  />
                  
                  <label>Budget</label>
                  <input
                    type="number"
                    placeholder="Budget"
                    value={modalFormData.budget || ""}
                    onChange={(e) => setModalFormData({ ...modalFormData, budget: e.target.value })}
                  />
                  <label>Security Level</label>
                  <select
                    value={modalFormData.security_level || "Public"}
                    onChange={(e) => setModalFormData({ ...modalFormData, security_level: e.target.value })}
                  >
                    <option value="Public">Public</option>
                    <option value="Restricted">Restricted</option>
                    <option value="Confidential">Confidential</option>
                  </select>

                  <div className="form-buttons">
                    <button className="save-btn" onClick={handleModalSave}>
                      {modalMode === 'add' ? "Save and Continue" : "Save Changes"}
                    </button>
                  </div>
                </div>
              )}

              {modalActiveTab === 'specs' && (
                <EditableTabPanel
                  key="specs"
                  title="Specifications"
                  apiEndpoint="specs"
                  data={modalRelatedData.specs || []}
                  columns={[
                    { key: 'spec_id', label: 'ID', isId: true },
                    { key: 'parameter_name', label: 'Parameter' },
                    { key: 'parameter_value', label: 'Value' }
                  ]}
                  techId={modalTechId}
                  token={token}
                  onDataChange={() => refreshRelatedData(modalTechId)}
                />
              )}
              {modalActiveTab === 'hardware' && (
                <EditableTabPanel
                  key="hardware"
                  title="Hardware Qualifications"
                  apiEndpoint="hw" // Assuming API is /api/hw
                  data={modalRelatedData.hw || []}
                  columns={[
                    { key: 'hw_id', label: 'ID', isId: true },
                    { key: 'requirement', label: 'Requirement' },
                    { key: 'achieved_status', label: 'Status' },
                    { key: 'date_achieved', label: 'Date' }
                  ]}
                  techId={modalTechId}
                  token={token}
                  onDataChange={() => refreshRelatedData(modalTechId)}
                />
              )}
              {modalActiveTab === 'software' && (
                 <EditableTabPanel
                  key="software"
                  title="Software Qualifications"
                  apiEndpoint="sw" // Assuming API is /api/sw
                  data={modalRelatedData.sw || []}
                  columns={[
                    { key: 'sw_id', label: 'ID', isId: true },
                    { key: 'requirement', label: 'Requirement' },
                    { key: 'achieved_status', label: 'Status' },
                    { key: 'date_achieved', label: 'Date' }
                  ]}
                  techId={modalTechId}
                  token={token}
                  onDataChange={() => refreshRelatedData(modalTechId)}
                />
              )}
              {modalActiveTab === 'versions' && (
                <EditableTabPanel
                  key="versions"
                  title="Versions"
                  apiEndpoint="versions"
                  data={modalRelatedData.versions || []}
                  columns={[
                    { key: 'version_id', label: 'ID', isId: true },
                    { key: 'version_number', label: 'Version' },
                    { key: 'release_date', label: 'Release Date' },
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