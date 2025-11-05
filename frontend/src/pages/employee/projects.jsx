

// import { useEffect, useState } from "react";
// import axios from "axios";
// import "../../styles/employee.projects.css";
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

// // This is the "Link Employee to Project" modal, now as a separate component
// // We pass props to it to avoid it fetching its own data
// const LinkEmployeeModal = ({ show, onClose, projects, employees, token }) => {
//   const [selectedEmployees, setSelectedEmployees] = useState([]);
//   const [selectedProjects, setSelectedProjects] = useState([]);
//   const [role, setRole] = useState("");
//   const [employeeSearch, setEmployeeSearch] = useState("");
//   const [projectSearch, setProjectSearch] = useState("");

//   const filteredEmployees = employees.filter(emp => 
//     emp.name.toLowerCase().includes(employeeSearch.toLowerCase())
//   );
  
//   const filteredProjects = projects.filter(proj => 
//     proj.name.toLowerCase().includes(projectSearch.toLowerCase())
//   );

//   const handleSave = async () => {
//     try {
//       if (selectedEmployees.length === 0 || selectedProjects.length === 0) {
//         alert("Select at least one employee and one project");
//         return;
//       }
//       await Promise.all(
//         selectedEmployees.flatMap(empId =>
//           selectedProjects.map(projId =>
//             axios.post(
//               "http://localhost:5000/api/employee_projects",
//               { employee_id: empId, project_id: projId, role: role },
//               { headers: { Authorization: `Bearer ${token}` } }
//             )
//           )
//         )
//       );
//       alert("Employees linked to projects successfully!");
//       onClose();
//     } catch (err) {
//       console.error(err);
//       alert("Failed to link employees to projects");
//     }
//   };

//   if (!show) return null;

//   return (
//     // Added z-index fix class
//     <div className="modal-overlay link-modal-overlay" onClick={onClose}>
//       <div className="modal-content large link-modal-layout" onClick={(e) => e.stopPropagation()}>
//         <button className="close-btn" onClick={onClose}>✖</button>
//         <h2>Link Employees to Projects</h2>

//         {/* Use <div> with a class instead of <p> */}
//         <div className="link-modal-section"> 
//           <b>Role:</b>
//           <input
//             type="text"
//             value={role}
//             onChange={(e) => setRole(e.target.value)}
//             placeholder="Lead / Researcher / Analyst"
//           />
//         </div>

//         {/* Employees Table */}
//         <div className="link-modal-section">
//           <b>Employees:</b>
//           <input
//             type="text"
//             placeholder="Search employees..."
//             value={employeeSearch}
//             onChange={(e) => setEmployeeSearch(e.target.value)}
//           />
//           <div className="searchable-table" style={{ maxHeight: "200px" }}>
//             <table>
//               <thead><tr><th>Select</th><th>ID</th><th>Name</th><th>Dept</th></tr></thead>
//               <tbody>
//                 {filteredEmployees.map(emp => (
//                   <tr key={emp.employee_id}>
//                     <td>
//                       <input
//                         type="checkbox"
//                         checked={selectedEmployees.includes(emp.employee_id)}
//                         onChange={(e) => {
//                           const id = emp.employee_id;
//                           setSelectedEmployees(prev =>
//                             e.target.checked ? [...prev, id] : prev.filter(i => i !== id)
//                           );
//                         }}
//                       />
//                     </td>
//                     <td>{emp.employee_id}</td><td>{emp.name}</td><td>{emp.department}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Projects Table */}
//         <div className="link-modal-section">
//           <b>Projects:</b>
//           <input
//             type="text"
//             placeholder="Search projects..."
//             value={projectSearch}
//             onChange={(e) => setProjectSearch(e.target.value)}
//           />
//           <div className="searchable-table" style={{ maxHeight: "200px" }}>
//             <table>
//               <thead><tr><th>Select</th><th>ID</th><th>Name</th></tr></thead>
//               <tbody>
//                 {filteredProjects.map(proj => (
//                   <tr key={proj.project_id}>
//                     <td>
//                       <input
//                         type="checkbox"
//                         checked={selectedProjects.includes(proj.project_id)}
//                         onChange={(e) => {
//                           const id = proj.project_id;
//                           setSelectedProjects(prev =>
//                             e.target.checked ? [...prev, id] : prev.filter(i => i !== id)
//                           );
//                         }}
//                       />
//                     </td>
//                     <td>{proj.project_id}</td><td>{proj.name}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         <button className="save-btn" onClick={handleSave}>💾 Link</button>
//       </div>
//     </div>
//   );
// };

// // Main Page Component
// export default function ProjectsPage() {
//   const token = localStorage.getItem("token");

//   // Data State
//   const [projects, setProjects] = useState([]);
//   const [employees, setEmployees] = useState([]);

//   // NEW STATE: To populate linkable lists in the modal
//   const [allTechnologies, setAllTechnologies] = useState([]);
//   const [allCompanies, setAllCompanies] = useState([]); // Assuming collaborators are 'companies'

//   // NEW STATE: For managing the "Team Members" tab
//   const [teamSearch, setTeamSearch] = useState("");
//   const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
//   const [teamRole, setTeamRole] = useState("");
  
//   // --- NEW FOR COLLABORATORS ---
//   const [collaboratorSearch, setCollaboratorSearch] = useState("");
//   const [selectedCollaborators, setSelectedCollaborators] = useState([]);
//   const [collaboratorRole, setCollaboratorRole] = useState("");

//   // Graph State
//   const [hoveredNode, setHoveredNode] = useState(null);
  
//   // Filter State
//   const [filters, setFilters] = useState({
//     keyword: "",
//     status: "",
//     startDate: "",
//     endDate: "",
//   });

//   // New Unified Modal State
//   const [hubModal, setHubModal] = useState({
//     show: false,
//     mode: 'add', // 'add' or 'edit'
//     projectData: {},
//     relatedData: { team: [], collaborators: [], tech: null }
//   });
//   const [modalActiveTab, setModalActiveTab] = useState('overview');
  
//   // Link Employee Modal State
//   const [showLinkModal, setShowLinkModal] = useState(false);

// // --- Data Fetching (UPDATED) ---
//   useEffect(() => {
//     const fetchPageData = async () => {
//       try {
//         // Fetch all data needed for the page AND the modal
//         const [projRes, empRes, techRes, compRes] = await Promise.all([
//           axios.get("http://localhost:5000/api/projects", {
//             headers: { Authorization: `Bearer ${token}` },
//           }),
//           axios.get("http://localhost:5000/api/employees", {
//             headers: { Authorization: `Bearer ${token}` },
//           }),
//           // Add API calls to get all linkable technologies and companies
//           axios.get("http://localhost:5000/api/technologies", { 
//             headers: { Authorization: `Bearer ${token}` } 
//           }),
//           axios.get("http://localhost:5000/api/companies", { 
//             headers: { Authorization: `Bearer ${token}` } 
//           }),
//         ]);
//         setProjects(projRes.data);
//         setEmployees(empRes.data);
//         setAllTechnologies(techRes.data); // Save technologies
//         setAllCompanies(compRes.data);   // Save companies
//       } catch (err) {
//         console.error("Failed to fetch page data:", err);
//       }
//     };
//     fetchPageData();
//   }, [token]);

//   // --- Modal Logic ---

// const resetHubModal = () => {
//     setHubModal({
//       show: false,
//       mode: 'add',
//       projectData: {},
//       relatedData: { team: [], collaborators: [], tech: null }
//     });
//     setModalActiveTab('overview');
//     // Reset tab-specific state
//     setTeamSearch("");
//     setSelectedTeamMembers([]);
//     setTeamRole("");
//     // --- NEW FOR COLLABORATORS ---
//     setCollaboratorSearch("");
//     setSelectedCollaborators([]);
//     setCollaboratorRole("");
//   };

// const handleOpenAddModal = () => {
//     // resetHubModal is called *first*
//     resetHubModal(); 
//     setHubModal(prev => ({
//       ...prev,
//       show: true,
//       mode: 'add',
//       projectData: {
//         name: "",
//         description: "",
//         start_date: "",
//         end_date: null,
//         budget: "",
//         tech_id: "",
//       }
//     }));
//   };

//   const handleOpenManageModal = async (project) => {
//     resetHubModal();
//     setHubModal(prev => ({
//       ...prev,
//       show: true,
//       mode: 'edit',
//       projectData: {
//         ...project,
//         start_date: project.start_date?.split("T")[0] || "",
//         end_date: project.end_date?.split("T")[0] || null,
//       }
//     }));

//     // Fetch related data
//     try {
//       // NOTE: You would expand these API calls to fetch the *actual*
//       // linked team and collaborators
      
//       // 1. Fetch Linked Tech
//       if (project.tech_id) {
//         const res = await axios.get(
//           `http://localhost:5000/api/projects/technologies/${project.tech_id}`,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         setHubModal(prev => ({
//           ...prev,
//           relatedData: { ...prev.relatedData, tech: res.data }
//         }));
//       }
      
//       // 2. Fetch Linked Team
//       // const teamRes = await axios.get(`/api/projects/${project.project_id}/team`, { headers: { Authorization: `Bearer ${token}` } });
//       // 3. Fetch Linked Collaborators
//       // const collabRes = await axios.get(`/api/projects/${project.project_id}/collaborators`, { headers: { Authorization: `Bearer ${token}` } });
      
//       // setHubModal(prev => ({
//       //   ...prev,
//       //   relatedData: { ...prev.relatedData, team: teamRes.data, collaborators: collabRes.data }
//       // }));
      
//     } catch (err) {
//       console.error("Failed to fetch related project data", err);
//     }
//   };
  
//   const handleModalFormChange = (e) => {
//     const { name, value } = e.target;
//     setHubModal(prev => ({
//       ...prev,
//       projectData: {
//         ...prev.projectData,
//         [name]: value === "" ? null : value
//       }
//     }));
//   };

// // --- handleSaveProject (CRITICAL UPDATE) ---
//   const handleSaveProject = async () => {
//     const { mode, projectData } = hubModal;
    
//     if (mode === 'add') {
//       // --- ADD MODE: Create, then switch to Edit Mode ---
//       const confirmed = window.confirm("Create this new project?");
//       if (!confirmed) return;
      
//       try {
//         // 1. Create the project
//         const res = await axios.post("http://localhost:5000/api/projects", projectData, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
        
//         // Get the new project ID from the server response
//         // Assumes server returns { project_id: 123 } or a full object
//         const newProjectID = res.data.project_id;

//         if (!newProjectID) {
//           alert("Failed to create project: Server did not return a new project ID.");
//           return;
//         }

//         // 2. DON'T CLOSE. Switch modal to 'edit' mode.
//         //    Keep the data the user just typed (prev.projectData)
//         //    and just add the new project_id.
//         setHubModal(prev => ({
//           ...prev,
//           mode: 'edit',
//           projectData: {
//             ...prev.projectData, // <-- This is the key change
//             project_id: newProjectID 
//           }
//         }));
        
//         // 3. Auto-switch to the "Team Members" tab
//         setModalActiveTab('team');
//         alert("Project created. You can now add team members and collaborators.");

//         // 4. Refresh project list in the background
//         const refreshRes = await axios.get("http://localhost:5000/api/projects", { headers: { Authorization: `Bearer ${token}` } });
//         setProjects(refreshRes.data);

//       } catch (err) {
//         // Log the full server response if it exists
//         console.error("Full error from server:", err.response); 
        
//         // Show a more detailed alert
//         alert(`Failed to create project. Check console. (Error: ${err.response?.data?.error || err.message})`);
//       }

//     } else {
//       // --- EDIT MODE: Just update ---
//       const confirmed = window.confirm("Update this project?");
//       if (!confirmed) return;

//       try {
//         await axios.put(`http://localhost:5000/api/projects/${projectData.project_id}`, projectData, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         alert("Project updated!");
        
//         // Refresh project list in the background
//         const res = await axios.get("http://localhost:5000/api/projects", { headers: { Authorization: `Bearer ${token}` } });
//         setProjects(res.data);

//       } catch (err) {
//         console.error(err);
//         alert("Failed to save project.");
//       }
//     }
//   };

//   // --- NEW FUNCTION: To link employees from "Team Members" tab ---
//   const handleLinkTeamMembers = async () => {
//     const { project_id } = hubModal.projectData;
//     if (selectedTeamMembers.length === 0) {
//       alert("Please select at least one employee to link.");
//       return;
//     }
//     if (!teamRole) {
//       alert("Please enter a role for the selected employees.");
//       return;
//     }

//     try {
//       // Create an array of link requests
//       const linkPromises = selectedTeamMembers.map(empId => 
//         axios.post(
//           "http://localhost:5000/api/employee_projects",
//           { employee_id: empId, project_id: project_id, role: teamRole },
//           { headers: { Authorization: `Bearer ${token}` } }
//         )
//       );
      
//       await Promise.all(linkPromises);
//       alert(`Successfully linked ${selectedTeamMembers.length} employees.`);
      
//       // Clear selection
//       setSelectedTeamMembers([]);
//       setTeamRole("");
      
//       // Here you would ideally refresh the 'relatedData.team' list
//       // For simplicity, we'll just alert the user.

//     } catch (err) {
//       console.error(err);
//       alert("Failed to link team members.");
//     }
//   };

//   // --- NEW FOR COLLABORATORS: Link companies ---
//   const handleLinkCollaborators = async () => {
//     const { project_id } = hubModal.projectData;
//     if (selectedCollaborators.length === 0) {
//       alert("Please select at least one company to link.");
//       return;
//     }

//     try {
//       const linkPromises = selectedCollaborators.map(compId =>
//         axios.post(
//           "http://localhost:5000/api/project_companies", // Uses the API from companies.jsx
//           { 
//             company_id: compId, 
//             project_id: project_id, 
//             role_in_project: collaboratorRole || 'Collaborator' // Use state or default
//           },
//           { headers: { Authorization: `Bearer ${token}` } }
//         )
//       );

//       await Promise.all(linkPromises);
//       alert(`Successfully linked ${selectedCollaborators.length} companies.`);

//       // Clear selection
//       setSelectedCollaborators([]);
//       setCollaboratorRole("");
      
//       // You would refresh the collaborators list here

//     } catch (err) {
//       console.error(err);
//       alert("Failed to link companies.");
//     }
//   };

//   // Filter for the "Team Members" tab list
//   const filteredEmployeesForModal = employees.filter(emp => 
//     emp.name.toLowerCase().includes(teamSearch.toLowerCase())
//   );
  
//   // --- NEW FOR COLLABORATORS: Filter for collaborators tab ---
//   const filteredCompaniesForModal = allCompanies.filter(comp =>
//     comp.name.toLowerCase().includes(collaboratorSearch.toLowerCase())
//   );

//   // --- Filtering and Graph Data ---

//   const handleReset = () =>
//     setFilters({ keyword: "", status: "", startDate: "", endDate: "" });

//   const filteredProjects = projects.filter((p) => {
//     if (!p) return false;
//     const kw = (filters.keyword || "").toLowerCase();
//     return (
//       (!filters.status ||
//         (filters.status === "completed" && p.end_date) ||
//         (filters.status === "ongoing" && !p.end_date)) &&
//       (!filters.startDate || new Date(p.start_date) >= new Date(filters.startDate)) &&
//       (!filters.endDate || new Date(p.start_date) <= new Date(filters.endDate)) &&
//       ((p.name || "").toLowerCase().includes(kw) ||
//         (p.description || "").toLowerCase().includes(kw))
//     );
//   });

//   // Data preparation for graphs
//   const statusData = [
//     { status: "Ongoing", count: projects.filter((p) => !p.end_date).length, projects: projects.filter((p) => !p.end_date) },
//     { status: "Completed", count: projects.filter((p) => p.end_date).length, projects: projects.filter((p) => p.end_date) },
//   ];
//   const budgetData = [
//     { range: "< 10L", count: projects.filter((p) => p.budget < 10000000).length, projects: projects.filter((p) => p.budget < 10000000) },
//     { range: "10–50L", count: projects.filter((p) => p.budget >= 10000000 && p.budget < 50000000).length, projects: projects.filter((p) => p.budget >= 10000000 && p.budget < 50000000) },
//     { range: "≥ 50L", count: projects.filter((p) => p.budget >= 50000000).length, projects: projects.filter((p) => p.budget >= 50000000) },
//   ];
//   const timelineData = Object.entries(
//     projects.reduce((acc, p) => {
//       const year = new Date(p.start_date).getFullYear();
//       if (!year) return acc;
//       acc[year] = acc[year] || { year, count: 0, projects: [] };
//       acc[year].count++;
//       acc[year].projects.push(p);
//       return acc;
//     }, {})
//   ).map(([_, obj]) => obj).sort((a, b) => a.year - b.year);


//   // --- Render ---

//   return (
//     <div className="empsection">
//       <div className="tech-table-actions">
//         <button className="add-btn" onClick={handleOpenAddModal}>
//           ➕ Add Project
//         </button>
//         <button className="add-btn" onClick={() => setShowLinkModal(true)}>
//           🔗 Link Employees to Projects
//         </button>
//       </div>
      
//       <div className="empsection-header">
//         <h2>Projects</h2>
//         <p>Total Projects: {projects.length}</p>
//       </div>

//       {/* ===== Graphs Section ===== */}
//       <div className="tech-graphs">
//         {/* Status */}
//         <div className="graph-card">
//           <h3>Project Status</h3>
//           <ResponsiveContainer width="100%" height={250}>
//             <BarChart data={statusData}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="status" />
//               <YAxis allowDecimals={false} />
//               <Tooltip />
//               <Bar dataKey="count" fill="#22a085" onMouseEnter={(d, i, e) => setHoveredNode({ ...d, mouseX: e.clientX, mouseY: e.clientY })} onMouseLeave={() => setHoveredNode(null)} />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>
//         {/* Timeline */}
//         <div className="graph-card">
//           <h3>Projects Over Time</h3>
//           <ResponsiveContainer width="100%" height={250}>
//             <LineChart data={timelineData}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="year" />
//               <YAxis allowDecimals={false} />
//               <Tooltip />
//               <Line type="monotone" dataKey="count" stroke="#2980b9" />
//             </LineChart>
//           </ResponsiveContainer>
//         </div>
//         {/* Budget */}
//         <div className="graph-card">
//           <h3>Budget Range</h3>
//           <ResponsiveContainer width="100%" height={250}>
//             <BarChart data={budgetData}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="range" />
//               <YAxis allowDecimals={false} />
//               <Tooltip />
//               <Bar dataKey="count" fill="#e67e22" onMouseEnter={(d, i, e) => setHoveredNode({ ...d, mouseX: e.clientX, mouseY: e.clientY })} onMouseLeave={() => setHoveredNode(null)} />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>
//       </div>
      
//       {/* Graph hover popup */}
//       {hoveredNode && (
//         <div className="graph-popup" style={{ position: 'fixed', top: hoveredNode.mouseY + 20, left: hoveredNode.mouseX + 20 }}>
//           {/* ... popup content (unchanged) ... */}
//         </div>  
//       )}
      
//       {/* ===== Filters Section ===== */}
//       <div className="filters-panel">
//         <input type="text" placeholder="🔎 Search projects..." value={filters.keyword} onChange={(e) => setFilters({ ...filters, keyword: e.target.value })} />
//         <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
//           <option value="">All Status</option>
//           <option value="ongoing">Ongoing</option>
//           <option value="completed">Completed</option>
//         </select>
//         <input type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} />
//         <input type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} />
//         <button className="reset-btn" onClick={handleReset}>Reset</button>
//       </div>

//       {/* ===== Projects Table ===== */}
//       <div className="reports-results">
//         <table>
//           <thead>
//             <tr>
//               <th>ID</th>
//               <th>Title</th>
//               <th>Status</th>
//               <th>Start Date</th>
//               <th>Tech ID</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredProjects.map((p) => (
//               <tr key={p.project_id}>
//                 <td>{p.project_id}</td>
//                 <td>{p.name}</td>
//                 <td>{p.end_date ? "Completed" : "Ongoing"}</td>
//                 <td>{p.start_date?.split("T")[0]}</td>
//                 <td>{p.tech_id || "—"}</td>
//                 <td>
//                   <button className="edit-btn" onClick={() => handleOpenManageModal(p)}>
//                     ✎ Manage
//                   </button>
//                   {/* Delete button can be added here */}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* ===== Link Employee Modal (this is the component *call*) ===== */}
//       <LinkEmployeeModal
//         show={showLinkModal}
//         onClose={() => setShowLinkModal(false)}
//         projects={projects}
//         employees={employees}
//         token={token}
//       />

//       {/* ===== New Project Hub Modal ===== */}
//       {hubModal.show && (
//         <div className="modal-overlay" onClick={resetHubModal}>
//           <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
//             <button className="close-btn" onClick={resetHubModal}>✖</button>
//             <h2>{hubModal.mode === 'add' ? "Add New Project" : `Manage: ${hubModal.projectData.name}`}</h2>

//             <div className="modal-tabs">
//               <button
//                 className={`tab-btn ${modalActiveTab === 'overview' ? 'active' : ''}`}
//                 onClick={() => setModalActiveTab('overview')}
//               >
//                 Overview
//               </button>
//               <button
//                 className={`tab-btn ${modalActiveTab === 'team' ? 'active' : ''}`}
//                 onClick={() => setModalActiveTab('team')}
//                 disabled={hubModal.mode === 'add'}
//               >
//                 Team Members
//               </button>
//               <button
//                 className={`tab-btn ${modalActiveTab === 'companies' ? 'active' : ''}`}
//                 onClick={() => setModalActiveTab('companies')}
//                 disabled={hubModal.mode === 'add'}
//               >
//                 Collaborators
//               </button>
//               <button
//                 className={`tab-btn ${modalActiveTab === 'tech' ? 'active' : ''}`}
//                 onClick={() => setModalActiveTab('tech')}
//                 disabled={hubModal.mode === 'add' || !hubModal.projectData.tech_id}
//               >
//                 Linked Tech
//               </button>
//             </div>

//             <div className="modal-tab-panel">
//               {/* --- Overview Tab (Add/Edit Form) --- */}
//               {modalActiveTab === 'overview' && (
//                 <div className="modal-tab-content vertical-form">
//                   <label>Project Name</label>
//                   <input name="name" placeholder="Name" value={hubModal.projectData.name || ""} onChange={handleModalFormChange} />
//                   <label>Description</label>
//                   <textarea name="description" placeholder="Description" value={hubModal.projectData.description || ""} onChange={handleModalFormChange} />
//                   <label>Start Date</label>
//                   <input name="start_date" type="date" value={hubModal.projectData.start_date || ""} onChange={handleModalFormChange} />
//                   <label>End Date (optional)</label>
//                   <input name="end_date" type="date" value={hubModal.projectData.end_date || ""} onChange={handleModalFormChange} />
//                   <label>Budget</label>
//                   <input name="budget" type="number" placeholder="Budget" value={hubModal.projectData.budget || ""} onChange={handleModalFormChange} />
//                   <label>Linked Technology (optional)</label>
//                   <select
//                     name="tech_id"
//                     value={hubModal.projectData.tech_id || ""}
//                     onChange={handleModalFormChange}
//                   >
//                     <option value="">-- Select a Technology --</option>
//                     {allTechnologies.map(tech => (
//                       <option key={tech.tech_id} value={tech.tech_id}>
//                         {tech.name} (ID: {tech.tech_id})
//                       </option>
//                     ))}
//                   </select>
//                   <div className="form-buttons">
//                     <button className="save-btn" onClick={handleSaveProject}>
//                       {hubModal.mode === 'add' ? "Save and Continue" : "Save Changes"}
//                     </button>
//                   </div>
//                 </div>
//               )}

//             {/* // --- Team Members Tab (NEW UI) --- */}
//               {modalActiveTab === 'team' && (
//                 <div className="modal-tab-content">
//                   <h4>Link Team Members</h4>
//                   <p>
//                     Select employees to link to <strong>{hubModal.projectData.name}</strong>.
//                   </p>
                  
//                   {/* You would also show a list of *current* team members here */}
//                   {/* <div className="current-team-list"> ... </div> */}

//                   <div className="link-modal-section">
//                     <b>Role for new members:</b>
//                     <input
//                       type="text"
//                       value={teamRole}
//                       onChange={(e) => setTeamRole(e.target.value)}
//                       placeholder="E.g., Lead, Developer, Analyst"
//                     />
//                   </div>
                  
//                   <div className="link-modal-section">
//                     <b>Available Employees:</b>
//                     <input
//                       type="text"
//                       placeholder="Search employees..."
//                       value={teamSearch}
//                       onChange={(e) => setTeamSearch(e.target.value)}
//                     />
//                     {/* Re-using the searchable-table style from your CSS */}
//                     <div className="searchable-table" style={{ maxHeight: "200px" }}>
//                       <table>
//                         <thead><tr><th>Select</th><th>ID</th><th>Name</th><th>Dept</th></tr></thead>
//                         <tbody>
//                           {filteredEmployeesForModal.map(emp => (
//                             <tr key={emp.employee_id}>
//                               <td>
//                                 <input
//                                   type="checkbox"
//                                   checked={selectedTeamMembers.includes(emp.employee_id)}
//                                   onChange={(e) => {
//                                     const id = emp.employee_id;
//                                     setSelectedTeamMembers(prev =>
//                                       e.target.checked ? [...prev, id] : prev.filter(i => i !== id)
//                                     );
//                                   }}
//                                 />
//                               </td>
//                               <td>{emp.employee_id}</td><td>{emp.name}</td><td>{emp.department}</td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>
//                   </div>
//                   <div className="team-button-container">
//                     <button className="save-btn" onClick={handleLinkTeamMembers}>
//                       💾 Link Selected Employees
//                     </button>
//                   </div>
//                 </div>
//               )}

//               {/* --- Collaborators Tab (NEW UI) --- */}
//               {modalActiveTab === 'companies' && (
//                 <div className="modal-tab-content">
//                   <h4>Link Collaborators</h4>
//                   <p>
//                     Select companies to link to <strong>{hubModal.projectData.name}</strong>.
//                   </p>
                  
//                   {/* You would also show a list of *current* collaborators here */}
//                   {/* <div className="current-team-list"> ... </div> */}
                  
//                   <div className="link-modal-section">
//                     <b>Role in project:</b>
//                     <input
//                       type="text"
//                       value={collaboratorRole}
//                       onChange={(e) => setCollaboratorRole(e.target.value)}
//                       placeholder="E.g., Partner, Supplier, Consultant"
//                     />
//                   </div>

//                   <div className="link-modal-section">
//                     <b>Available Companies:</b>
//                     <input
//                       type="text"
//                       placeholder="Search companies..."
//                       value={collaboratorSearch}
//                       onChange={(e) => setCollaboratorSearch(e.target.value)}
//                     />
//                     <div className="searchable-table" style={{ maxHeight: "200px" }}>
//                       <table>
//                         <thead><tr><th>Select</th><th>ID</th><th>Name</th><th>Type</th></tr></thead>
//                         <tbody>
//                           {filteredCompaniesForModal.map(comp => (
//                             <tr key={comp.company_id}>
//                               <td>
//                                 <input
//                                   type="checkbox"
//                                   checked={selectedCollaborators.includes(comp.company_id)}
//                                   onChange={(e) => {
//                                     const id = comp.company_id;
//                                     setSelectedCollaborators(prev =>
//                                       e.target.checked ? [...prev, id] : prev.filter(i => i !== id)
//                                     );
//                                   }}
//                                 />
//                               </td>
//                               <td>{comp.company_id}</td><td>{comp.name}</td><td>{comp.type}</td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>
//                   </div>
//                   <div className="team-button-container">
//                     <button className="save-btn" onClick={handleLinkCollaborators}>
//                       💾 Link Selected Companies
//                     </button>
//                   </div>
//                 </div>
//               )}

//               {/* --- Linked Tech Tab --- */}
//               {modalActiveTab === 'tech' && (
//                 <div className="modal-tab-content">
//                   <h4>Linked Technology Details</h4>
//                   {hubModal.relatedData.tech ? (
//                     <div>
//                       <h3>{hubModal.relatedData.tech.name}</h3>
//                       <p><b>Category:</b> {hubModal.relatedData.tech.category}</p>
//                       <p><b>Status:</b> {hubModal.relatedData.tech.status}</p>
//                       <p><b>TRL:</b> {hubModal.relatedData.tech.trl_achieved}</p>
//                     </div>
//                   ) : (
//                     <p>No technology linked or details not found.</p>
//                   )}
//                 </div>
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

// This is the "Link Employee to Project" modal, now as a separate component
// We pass props to it to avoid it fetching its own data
const LinkEmployeeModal = ({ show, onClose, projects, employees, token }) => {
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [role, setRole] = useState("");
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [projectSearch, setProjectSearch] = useState("");

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(employeeSearch.toLowerCase())
  );
  
  const filteredProjects = projects.filter(proj => 
    proj.name.toLowerCase().includes(projectSearch.toLowerCase())
  );

  const handleSave = async () => {
    try {
      if (selectedEmployees.length === 0 || selectedProjects.length === 0) {
        alert("Select at least one employee and one project");
        return;
      }
      await Promise.all(
        selectedEmployees.flatMap(empId =>
          selectedProjects.map(projId =>
            axios.post(
              "http://localhost:5000/api/employee_projects",
              { employee_id: empId, project_id: projId, role: role },
              { headers: { Authorization: `Bearer ${token}` } }
            )
          )
        )
      );
      alert("Employees linked to projects successfully!");
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to link employees to projects");
    }
  };

  if (!show) return null;

  return (
    // Added z-index fix class
    <div className="modal-overlay link-modal-overlay" onClick={onClose}>
      <div className="modal-content large link-modal-layout" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✖</button>
        <h2>Link Employees to Projects</h2>

        {/* Use <div> with a class instead of <p> */}
        <div className="link-modal-section"> 
          <b>Role:</b>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Lead / Researcher / Analyst"
          />
        </div>

        {/* Employees Table */}
        <div className="link-modal-section">
          <b>Employees:</b>
          <input
            type="text"
            placeholder="Search employees..."
            value={employeeSearch}
            onChange={(e) => setEmployeeSearch(e.target.value)}
          />
          <div className="searchable-table" style={{ maxHeight: "200px" }}>
            <table>
              <thead><tr><th>Select</th><th>ID</th><th>Name</th><th>Dept</th></tr></thead>
              <tbody>
                {filteredEmployees.map(emp => (
                  <tr key={emp.employee_id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedEmployees.includes(emp.employee_id)}
                        onChange={(e) => {
                          const id = emp.employee_id;
                          setSelectedEmployees(prev =>
                            e.target.checked ? [...prev, id] : prev.filter(i => i !== id)
                          );
                        }}
                      />
                    </td>
                    <td>{emp.employee_id}</td><td>{emp.name}</td><td>{emp.department}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Projects Table */}
        <div className="link-modal-section">
          <b>Projects:</b>
          <input
            type="text"
            placeholder="Search projects..."
            value={projectSearch}
            onChange={(e) => setProjectSearch(e.target.value)}
          />
          <div className="searchable-table" style={{ maxHeight: "200px" }}>
            <table>
              <thead><tr><th>Select</th><th>ID</th><th>Name</th></tr></thead>
              <tbody>
                {filteredProjects.map(proj => (
                  <tr key={proj.project_id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedProjects.includes(proj.project_id)}
                        onChange={(e) => {
                          const id = proj.project_id;
                          setSelectedProjects(prev =>
                            e.target.checked ? [...prev, id] : prev.filter(i => i !== id)
                          );
                        }}
                      />
                    </td>
                    <td>{proj.project_id}</td><td>{proj.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <button className="save-btn" onClick={handleSave}>💾 Link</button>
      </div>
    </div>
  );
};

// Main Page Component
export default function ProjectsPage() {
  const token = localStorage.getItem("token");

  // Data State
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);

  // NEW STATE: To populate linkable lists in the modal
  const [allTechnologies, setAllTechnologies] = useState([]);
  const [allCompanies, setAllCompanies] = useState([]); // Assuming collaborators are 'companies'

  // NEW STATE: For managing the "Team Members" tab
  const [teamSearch, setTeamSearch] = useState("");
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
  const [teamRole, setTeamRole] = useState("");
  
  // --- NEW FOR COLLABORATORS ---
  const [collaboratorSearch, setCollaboratorSearch] = useState("");
  const [selectedCollaborators, setSelectedCollaborators] = useState([]);
  const [collaboratorRole, setCollaboratorRole] = useState("");

  // Graph State (BUG FIX: Removed hoveredNode state)
  
  // Filter State
  const [filters, setFilters] = useState({
    keyword: "",
    status: "",
    startDate: "",
    endDate: "",
  });

  // New Unified Modal State
  const [hubModal, setHubModal] = useState({
    show: false,
    mode: 'add', // 'add' or 'edit'
    projectData: {},
    relatedData: { team: [], collaborators: [], tech: null }
  });
  const [modalActiveTab, setModalActiveTab] = useState('overview');
  
  // Link Employee Modal State
  const [showLinkModal, setShowLinkModal] = useState(false);

  // --- Data Fetching (UPDATED) ---

  // NEW: Function to fetch *only* projects
  const fetchProjects = async () => {
    try {
      const projRes = await axios.get("http://localhost:5000/api/projects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(projRes.data);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    }
  };

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        // Fetch all data needed for the page AND the modal
        const [projRes, empRes, techRes, compRes] = await Promise.all([
          axios.get("http://localhost:5000/api/projects", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/employees", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/technologies", { 
            headers: { Authorization: `Bearer ${token}` } 
          }),
          axios.get("http://localhost:5000/api/companies", { 
            headers: { Authorization: `Bearer ${token}` } 
          }),
        ]);
        setProjects(projRes.data);
        setEmployees(empRes.data);
        setAllTechnologies(techRes.data); // Save technologies
        setAllCompanies(compRes.data);   // Save companies
      } catch (err) {
        console.error("Failed to fetch page data:", err);
      }
    };
    fetchPageData();
  }, [token]);

  // --- Modal Logic ---

  const resetHubModal = () => {
    setHubModal({
      show: false,
      mode: 'add',
      projectData: {},
      relatedData: { team: [], collaborators: [], tech: null }
    });
    setModalActiveTab('overview');
    // Reset tab-specific state
    setTeamSearch("");
    setSelectedTeamMembers([]);
    setTeamRole("");
    // --- NEW FOR COLLABORATORS ---
    setCollaboratorSearch("");
    setSelectedCollaborators([]);
    setCollaboratorRole("");
  };

  const handleOpenAddModal = () => {
    // resetHubModal is called *first*
    resetHubModal(); 
    setHubModal(prev => ({
      ...prev,
      show: true,
      mode: 'add',
      projectData: {
        name: "",
        description: "",
        start_date: "",
        end_date: null,
        budget: "",
        tech_id: "",
      }
    }));
  };

  const handleOpenManageModal = async (project) => {
    resetHubModal();
    setHubModal(prev => ({
      ...prev,
      show: true,
      mode: 'edit',
      projectData: {
        ...project,
        start_date: project.start_date?.split("T")[0] || "",
        end_date: project.end_date?.split("T")[0] || null,
      }
    }));

    // Fetch related data
    try {
      // NOTE: You would expand these API calls to fetch the *actual*
      // linked team and collaborators
      
      // 1. Fetch Linked Tech
      if (project.tech_id) {
        const res = await axios.get(
          `http://localhost:5000/api/projects/technologies/${project.tech_id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setHubModal(prev => ({
          ...prev,
          relatedData: { ...prev.relatedData, tech: res.data }
        }));
      }
      
      // 2. Fetch Linked Team
      // const teamRes = await axios.get(`/api/projects/${project.project_id}/team`, { headers: { Authorization: `Bearer ${token}` } });
      // 3. Fetch Linked Collaborators
      // const collabRes = await axios.get(`/api/projects/${project.project_id}/collaborators`, { headers: { Authorization: `Bearer ${token}` } });
      
      // setHubModal(prev => ({
      //   ...prev,
      //   relatedData: { ...prev.relatedData, team: teamRes.data, collaborators: collabRes.data }
      // }));
      
    } catch (err) {
      console.error("Failed to fetch related project data", err);
    }
  };
  
  const handleModalFormChange = (e) => {
    const { name, value } = e.target;
    setHubModal(prev => ({
      ...prev,
      projectData: {
        ...prev.projectData,
        [name]: value === "" ? null : value
      }
    }));
  };

  const handleSaveProject = async () => {
    const { mode, projectData } = hubModal;
    
    if (mode === 'add') {
      // --- ADD MODE: Create, then switch to Edit Mode ---
      const confirmed = window.confirm("Create this new project?");
      if (!confirmed) return;
      
      try {
        // 1. Create the project
        const res = await axios.post("http://localhost:5000/api/projects", projectData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const newProjectID = res.data.project_id; 

        if (!newProjectID) {
          alert("Failed to create project: Server did not return a new project ID.");
          return;
        }

        // 2. DON'T CLOSE. Switch modal to 'edit' mode.
        setHubModal(prev => ({
          ...prev,
          mode: 'edit',
          projectData: {
            ...prev.projectData,
            project_id: newProjectID 
          }
        }));
        
        // 3. Auto-switch to the "Team Members" tab
        setModalActiveTab('team');
        alert("Project created. You can now add team members and collaborators.");

        // 4. Refresh project list in the background
        fetchProjects();

      } catch (err) {
        console.error("Full error from server:", err.response); 
        alert(`Failed to create project. Check console. (Error: ${err.response?.data?.error || err.message})`);
      }

    } else {
      // --- EDIT MODE: Just update ---
      const confirmed = window.confirm("Update this project?");
      if (!confirmed) return;

      try {
        await axios.put(`http://localhost:5000/api/projects/${projectData.project_id}`, projectData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Project updated!");
        
        // Refresh project list in the background
        fetchProjects();

      } catch (err) {
        console.error(err);
        alert("Failed to save project.");
      }
    }
  };

  // --- NEW FUNCTION: Delete Project ---
  const handleDeleteProject = async (projectId) => {
    if (!window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      return;
    }
    
    try {
      await axios.delete(`http://localhost:5000/api/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Project deleted successfully.");
      fetchProjects(); // Refresh the list
    } catch (err) {
      console.error("Failed to delete project:", err);
      alert("Error: Failed to delete project. It may be linked to other items.");
    }
  };

  // --- NEW FUNCTION: To link employees from "Team Members" tab ---
  const handleLinkTeamMembers = async () => {
    const { project_id } = hubModal.projectData;
    if (selectedTeamMembers.length === 0) {
      alert("Please select at least one employee to link.");
      return;
    }
    if (!teamRole) {
      alert("Please enter a role for the selected employees.");
      return;
    }

    try {
      // Create an array of link requests
      const linkPromises = selectedTeamMembers.map(empId => 
        axios.post(
          "http://localhost:5000/api/employee_projects",
          { employee_id: empId, project_id: project_id, role: teamRole },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      );
      
      await Promise.all(linkPromises);
      alert(`Successfully linked ${selectedTeamMembers.length} employees.`);
      
      // Clear selection
      setSelectedTeamMembers([]);
      setTeamRole("");
      
      // Here you would ideally refresh the 'relatedData.team' list
      // For simplicity, we'll just alert the user.

    } catch (err) {
      console.error(err);
      alert("Failed to link team members.");
    }
  };

  // --- NEW FOR COLLABORATORS: Link companies ---
  const handleLinkCollaborators = async () => {
    const { project_id } = hubModal.projectData;
    if (selectedCollaborators.length === 0) {
      alert("Please select at least one company to link.");
      return;
    }

    try {
      const linkPromises = selectedCollaborators.map(compId =>
        axios.post(
          "http://localhost:5000/api/project_companies", // Uses the API from companies.jsx
          { 
            company_id: compId, 
            project_id: project_id, 
            role_in_project: collaboratorRole || 'Collaborator' // Use state or default
          },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      );

      await Promise.all(linkPromises);
      alert(`Successfully linked ${selectedCollaborators.length} companies.`);

      // Clear selection
      setSelectedCollaborators([]);
      setCollaboratorRole("");
      
      // You would refresh the collaborators list here

    } catch (err) {
      console.error(err);
      alert("Failed to link companies.");
    }
  };

  // Filter for the "Team Members" tab list
  const filteredEmployeesForModal = employees.filter(emp => 
    emp.name.toLowerCase().includes(teamSearch.toLowerCase())
  );
  
  // --- NEW FOR COLLABORATORS: Filter for collaborators tab ---
  const filteredCompaniesForModal = allCompanies.filter(comp =>
    comp.name.toLowerCase().includes(collaboratorSearch.toLowerCase())
  );

  // --- Filtering and Graph Data ---

  const handleReset = () =>
    setFilters({ keyword: "", status: "", startDate: "", endDate: "" });

  const filteredProjects = projects.filter((p) => {
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

  // Data preparation for graphs
  const statusData = [
    { status: "Ongoing", count: projects.filter((p) => !p.end_date).length, projects: projects.filter((p) => !p.end_date) },
    { status: "Completed", count: projects.filter((p) => p.end_date).length, projects: projects.filter((p) => p.end_date) },
  ];
  const budgetData = [
    { range: "< 10L", count: projects.filter((p) => p.budget < 10000000).length, projects: projects.filter((p) => p.budget < 10000000) },
    { range: "10–50L", count: projects.filter((p) => p.budget >= 10000000 && p.budget < 50000000).length, projects: projects.filter((p) => p.budget >= 10000000 && p.budget < 50000000) },
    { range: "≥ 50L", count: projects.filter((p) => p.budget >= 50000000).length, projects: projects.filter((p) => p.budget >= 50000000) },
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
  ).map(([_, obj]) => obj).sort((a, b) => a.year - b.year);


  // --- Render ---

  return (
    <div className="empsection">
      <div className="tech-table-actions">
        <button className="add-btn" onClick={handleOpenAddModal}>
          ➕ Add Project
        </button>
        <button className="add-btn" onClick={() => setShowLinkModal(true)}>
          🔗 Link Employees to Projects
        </button>
      </div>
      
      <div className="empsection-header">
        <h2>Projects</h2>
        <p>Total Projects: {projects.length}</p>
      </div>

      {/* ===== Graphs Section (BUG FIX: Removed onMouseEnter/Leave) ===== */}
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
              <Bar dataKey="count" fill="#22a085" />
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
              <Line type="monotone" dataKey="count" stroke="#2980b9" />
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
              <Bar dataKey="count" fill="#e67e22" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* BUG FIX: Removed the {hoveredNode && ...} div */}
      
      {/* ===== Filters Section ===== */}
      <div className="filters-panel">
        <input type="text" placeholder="🔎 Search projects..." value={filters.keyword} onChange={(e) => setFilters({ ...filters, keyword: e.target.value })} />
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All Status</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
        </select>
        <input type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} />
        <input type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} />
        <button className="reset-btn" onClick={handleReset}>Reset</button>
      </div>

      {/* ===== Projects Table (NEW: Added Delete Button) ===== */}
      <div className="reports-results">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Status</th>
              <th>Start Date</th>
              <th>Tech ID</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.map((p) => (
              <tr key={p.project_id}>
                <td>{p.project_id}</td>
                <td>{p.name}</td>
                <td>{p.end_date ? "Completed" : "Ongoing"}</td>
                <td>{p.start_date?.split("T")[0]}</td>
                <td>{p.tech_id || "—"}</td>
                <td>
                  {/* --- NEW: Action Buttons Wrapper --- */}
                  <div className="action-buttons-wrapper">
                    <button className="edit-btn" onClick={() => handleOpenManageModal(p)}>
                      ✎ Manage
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteProject(p.project_id)}
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

      {/* ===== Link Employee Modal (this is the component *call*) ===== */}
      <LinkEmployeeModal
        show={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        projects={projects}
        employees={employees}
        token={token}
      />

      {/* ===== New Project Hub Modal ===== */}
      {hubModal.show && (
        <div className="modal-overlay" onClick={resetHubModal}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={resetHubModal}>✖</button>
            <h2>{hubModal.mode === 'add' ? "Add New Project" : `Manage: ${hubModal.projectData.name}`}</h2>

            <div className="modal-tabs">
              <button
                className={`tab-btn ${modalActiveTab === 'overview' ? 'active' : ''}`}
                onClick={() => setModalActiveTab('overview')}
              >
                Overview
              </button>
              <button
                className={`tab-btn ${modalActiveTab === 'team' ? 'active' : ''}`}
                onClick={() => setModalActiveTab('team')}
                disabled={hubModal.mode === 'add'}
              >
                Team Members
              </button>
              <button
                className={`tab-btn ${modalActiveTab === 'companies' ? 'active' : ''}`}
                onClick={() => setModalActiveTab('companies')}
                disabled={hubModal.mode === 'add'}
              >
                Collaborators
              </button>
              <button
                className={`tab-btn ${modalActiveTab === 'tech' ? 'active' : ''}`}
                onClick={() => setModalActiveTab('tech')}
                disabled={hubModal.mode === 'add' || !hubModal.projectData.tech_id}
              >
                Linked Tech
              </button>
            </div>

            <div className="modal-tab-panel">
              {/* --- Overview Tab (Add/Edit Form) --- */}
              {modalActiveTab === 'overview' && (
                <div className="modal-tab-content vertical-form">
                  <label>Project Name</label>
                  <input name="name" placeholder="Name" value={hubModal.projectData.name || ""} onChange={handleModalFormChange} />
                  <label>Description</label>
                  <textarea name="description" placeholder="Description" value={hubModal.projectData.description || ""} onChange={handleModalFormChange} />
                  <label>Start Date</label>
                  <input name="start_date" type="date" value={hubModal.projectData.start_date || ""} onChange={handleModalFormChange} />
                  <label>End Date (optional)</label>
                  <input name="end_date" type="date" value={hubModal.projectData.end_date || ""} onChange={handleModalFormChange} />
                  <label>Budget</label>
                  <input name="budget" type="number" placeholder="Budget" value={hubModal.projectData.budget || ""} onChange={handleModalFormChange} />
                  <label>Linked Technology (optional)</label>
                  <select
                    name="tech_id"
                    value={hubModal.projectData.tech_id || ""}
                    onChange={handleModalFormChange}
                  >
                    <option value="">-- Select a Technology --</option>
                    {allTechnologies.map(tech => (
                      <option key={tech.tech_id} value={tech.tech_id}>
                        {tech.name} (ID: {tech.tech_id})
                      </option>
                    ))}
                  </select>
                  <div className="form-buttons">
                    <button className="save-btn" onClick={handleSaveProject}>
                      {hubModal.mode === 'add' ? "Save and Continue" : "Save Changes"}
                    </button>
                  </div>
                </div>
              )}

            {/* // --- Team Members Tab (NEW UI) --- */}
              {modalActiveTab === 'team' && (
                <div className="modal-tab-content">
                  <h4>Link Team Members</h4>
                  <p>
                    Select employees to link to <strong>{hubModal.projectData.name}</strong>.
                  </p>
                  
                  {/* You would also show a list of *current* team members here */}
                  {/* <div className="current-team-list"> ... </div> */}

                  <div className="link-modal-section">
                    <b>Role for new members:</b>
                    <input
                      type="text"
                      value={teamRole}
                      onChange={(e) => setTeamRole(e.target.value)}
                      placeholder="E.g., Lead, Developer, Analyst"
                    />
                  </div>
                  
                  <div className="link-modal-section">
                    <b>Available Employees:</b>
                    <input
                      type="text"
                      placeholder="Search employees..."
                      value={teamSearch}
                      onChange={(e) => setTeamSearch(e.g.target.value)}
                    />
                    {/* Re-using the searchable-table style from your CSS */}
                    <div className="searchable-table" style={{ maxHeight: "200px" }}>
                      <table>
                        <thead><tr><th>Select</th><th>ID</th><th>Name</th><th>Dept</th></tr></thead>
                        <tbody>
                          {filteredEmployeesForModal.map(emp => (
                            <tr key={emp.employee_id}>
                              <td>
                                <input
                                  type="checkbox"
                                  checked={selectedTeamMembers.includes(emp.employee_id)}
                                  onChange={(e) => {
                                    const id = emp.employee_id;
                                    setSelectedTeamMembers(prev =>
                                      e.target.checked ? [...prev, id] : prev.filter(i => i !== id)
                                    );
                                  }}
                                />
                              </td>
                              <td>{emp.employee_id}</td><td>{emp.name}</td><td>{emp.department}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="team-button-container">
                    <button className="save-btn" onClick={handleLinkTeamMembers}>
                      💾 Link Selected Employees
                    </button>
                  </div>
                </div>
              )}

              {/* --- Collaborators Tab (NEW UI) --- */}
              {modalActiveTab === 'companies' && (
                <div className="modal-tab-content">
                  <h4>Link Collaborators</h4>
                  <p>
                    Select companies to link to <strong>{hubModal.projectData.name}</strong>.
                  </p>
                  
                  {/* You would also show a list of *current* collaborators here */}
                  {/* <div className="current-team-list"> ... </div> */}
                  
                  <div className="link-modal-section">
                    <b>Role in project:</b>
                    <input
                      type="text"
                      value={collaboratorRole}
                      onChange={(e) => setCollaboratorRole(e.target.value)}
                      placeholder="E.g., Partner, Supplier, Consultant"
                    />
                  </div>

                  <div className="link-modal-section">
                    <b>Available Companies:</b>
                    <input
                      type="text"
                      placeholder="Search companies..."
                      value={collaboratorSearch}
                      onChange={(e) => setCollaboratorSearch(e.target.value)}
                    />
                    <div className="searchable-table" style={{ maxHeight: "200px" }}>
                      <table>
                        <thead><tr><th>Select</th><th>ID</th><th>Name</th><th>Type</th></tr></thead>
                        <tbody>
                          {filteredCompaniesForModal.map(comp => (
                            <tr key={comp.company_id}>
                              <td>
                                <input
                                  type="checkbox"
                                  checked={selectedCollaborators.includes(comp.company_id)}
                                  onChange={(e) => {
                                    const id = comp.company_id;
                                    setSelectedCollaborators(prev =>
                                      e.target.checked ? [...prev, id] : prev.filter(i => i !== id)
                                    );
                                  }}
                                />
                              </td>
                              <td>{comp.company_id}</td><td>{comp.name}</td><td>{comp.type}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="team-button-container">
                    <button className="save-btn" onClick={handleLinkCollaborators}>
                      💾 Link Selected Companies
                    </button>
                  </div>
                </div>
              )}

              {/* --- Linked Tech Tab --- */}
              {modalActiveTab === 'tech' && (
                <div className="modal-tab-content">
                  <h4>Linked Technology Details</h4>
                  {hubModal.relatedData.tech ? (
                    <div>
                      <h3>{hubModal.relatedData.tech.name}</h3>
                      <p><b>Category:</b> {hubModal.relatedData.tech.category}</p>
                      <p><b>Status:</b> {hubModal.relatedData.tech.status}</p>
                      <p><b>TRL:</b> {hubModal.relatedData.tech.trl_achieved}</p>
                    </div>
                  ) : (
                    <p>No technology linked or details not found.</p>
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