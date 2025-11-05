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

// export default function TechnologiesPage() {
//     const token = localStorage.getItem("token");
  
//   // Graph data
//   const [trlData, setTrlData] = useState([]);
//   const [productionData, setProductionData] = useState([]);
//   const [statusData, setStatusData] = useState([]);
//   const [hoveredNode, setHoveredNode] = useState(null);
  
//   // Form & modal states
//   const [formData, setFormData] = useState({});
//   const [editId, setEditId] = useState(null);
//   const [showForm, setShowForm] = useState(false);
  
//   // Technology-specific states
//   const [data, setData] = useState({ technologies: [] });
//   const [relatedData, setRelatedData] = useState({});
// const [techFilters, setTechFilters] = useState({
//   keyword: "",
//   category: "",
//   status: "",
//   startDate: "",
//   endDate: "",
//   trlMin: "",
//   trlMax: "",
//   budgetMin: "",
//   budgetMax: "",
//   security: "",
// });

//   const [techModal, setTechModal] = useState({ show: false, tech: null });
  
//   // Modal states for related data
//   const [modalData, setModalData] = useState([]);
//   const [modalTitle, setModalTitle] = useState("");
//   const [showModal, setShowModal] = useState(false);
//   const [modalSection, setModalSection] = useState("");
//   const [isEditingModal, setIsEditingModal] = useState(false);
//   const [techList, setTechList] = useState([]);
  
//   const friendlyNames = {
//     name: "Name",
//     category: "Category",
//     status: "Status",
//     trl_achieved: "TRL Achieved",
//     budget: "Budget",
//     location: "Location",
//     description: "Description",
//     start_date: "Start Date",
//     end_date: "End Date",
//     role: "Role",
//     country: "Country",
//     tech_id: "Technology ID",
//     title: "Title",
//     patent_number: "Patent Number",
//     date_filed: "Date Filed",
//     date_granted: "Date Granted",
//     authors: "Authors",
//     journal: "Journal",
//     year: "Year",
//     link: "Link",
//     designation: "Designation",
//     department: "Department",
//     email: "Email",
//     production_start_date: "Production Start Date",
//     last_usage_date: "Last Usage Date",
//     trl_start: "TRL Start",
//     trl_description: "TRL Description",
//     security_level: "Security Level",
//     tech_stack: "Tech Stack",
//     salient_features: "Salient Features",
//     achievements: "Achievements",
//     image_path: "Image Path",
//     dev_proj_name: "Dev Project Name",
//     dev_proj_number: "Dev Project No.",
//     dev_proj_code: "Dev Project Code",
//     funding_details: "Funding Details",
//     tech_name:"Tech Name",
//     project_id:"Project ID",
//     pub_id:"Publication ID",
//     employee_id:"Employee ID",
//     patent_id:"Patent ID",
//     company_id:"Company ID",
//     version_id:"Version ID",
//     version_number:"Version Number",
//     release_date:"Release Date",
//     notes:"Notes",
//     spec_id:"Spec ID",
//     parameter_name:"Parameter Name",
//     parameter_value:"Parameter Value",
//     sw_id:"Software ID",
//     hw_id:"Hardware ID",
//     achieved_status:"Achieved Status",
//     date_achieved:"Date Achieved",
//     requirement:"Requirement",
//     sw:"Qualification Software",

//     };
//     const modalFriendlyNames = {
//   versions: "Versions",
//   tech_specs: "Technical Specifications",
//   hardware: "Hardware Qualifications",
//   software: "Software Qualifications",
//   milestones: "Project Milestones",
//   documents: "Supporting Documents",
//   specs:"Specs",
//   hw:"Hardware Qualification",
//   sw:"Software Qualification"
// };
//     const confirmAction = (msg) => window.confirm(msg);

//    const HoverableDot = (props) => {
//   const { cx, cy, payload } = props;
//   return (
//     <circle
//       key={payload.techs?.[0]?.tech_id || payload.year || payload.trl}
//       cx={cx}
//       cy={cy}
//       r={5}
//       fill="#2980b9"
//       stroke="#fff"
//       strokeWidth={1}
//       onMouseEnter={(e) =>
//         setHoveredNode({ ...payload, x: e.clientX, y: e.clientY + window.scrollY })
//       }
//       onMouseLeave={() => setHoveredNode(null)}
//       style={{ cursor: "pointer" }}
//     />
//   );
// };


//     const fetchRelatedData = async (techList) => {
//   const promises = techList.map((tech) =>
//     axios.get(`http://localhost:5000/api/technologies/details/${tech.tech_id}`, {
//       headers: { Authorization: `Bearer ${token}` },
//     }).then(res => ({ id: tech.tech_id, data: res.data }))
//   );

//   const results = await Promise.all(promises);
//   const newRelatedData = {};
//   results.forEach(r => newRelatedData[r.id] = r.data);
//   setRelatedData(newRelatedData);
// };

// const fetchData = async (section) => {
//   try {
//     const res = await axios.get(`http://localhost:5000/api/${section}`, {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     setData((prev) => ({ ...prev, [section]: res.data }));

//     if (section === "technologies") {
//       setTechList(res.data);
//       await fetchRelatedData(res.data); // ✅ fetch all related data safely
//     }
//   } catch (err) {
//     console.error(err);
//   }
// };

//     const handleAddOrUpdate = async (section, formData, editId) => {
//     const confirmed = confirmAction(editId ? "Update record?" : "Add new?");
//     if (!confirmed) return;

//     try {
//       if (editId) {
//         await axios.put(`http://localhost:5000/api/${section}/${editId}`, formData, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setEditId(null);
//       } else {
//         await axios.post(`http://localhost:5000/api/${section}`, formData, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//       }
//       setFormData({});
//       setShowForm(false);
//       fetchData("technologies");
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const handleDelete = async (section, id) => {
//     if (!confirmAction("Delete this record?")) return;
//     try {
//       await axios.delete(`http://localhost:5000/api/${section}/${id}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       fetchData("technologies");
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const openModal = (title, tech_id, type) => {
//   const rel = relatedData[tech_id] || {};
//   const dataForModal = rel[type] || [];
//   setModalTitle(modalFriendlyNames[title] || title);
//   setModalSection(type);
//   setModalData(dataForModal);
//   setShowModal(true);
// };


// const handleModalAddRow = () => {
//   const emptyRow = {};
//   if (modalData.length > 0) {
//     Object.keys(modalData[0]).forEach((k) => (emptyRow[k] = ""));
//   }
//   if (techModal.tech?.tech_id) emptyRow.tech_id = techModal.tech.tech_id; // ✅
//   setModalData([...modalData, emptyRow]);
//   setIsEditingModal(true);
// };


//   const handleModalSave = async () => {
//     try {
//       for (const row of modalData) {
//   await axios.post(`http://localhost:5000/api/${modalSection}`, row, {
//     headers: { Authorization: `Bearer ${token}` },
//   });
// }

//       alert("Saved successfully!");
//       setIsEditingModal(false);
//       fetchData("technologies");
//     } catch (err) {
//       console.error(err);
//     }
//   };
//   useEffect(() => {
//   if (!data.technologies.length) return;

//   // 1️⃣ TRL Achieved Bar Chart
//   const trlCounts = Array.from({ length: 10 }, (_, i) => {
//     const trlTechs = data.technologies.filter(
//       (t) => t.trl_achieved === i + 1
//     );
//     return { trl: i + 1, count: trlTechs.length, techs: trlTechs };
//   });
//   setTrlData(trlCounts);

//   // 2️⃣ Production Year Line Chart
//   const yearCountsMap = {};
//   data.technologies.forEach((t) => {
//     if (t.production_start_date) {
//       const year = new Date(t.production_start_date).getFullYear();
//       if (!yearCountsMap[year]) yearCountsMap[year] = { count: 0, techs: [] };
//       yearCountsMap[year].count++;
//       yearCountsMap[year].techs.push(t);
//     }
//   });
// const prodData = Object.entries(yearCountsMap)
//   .map(([year, obj]) => ({ year: +year, count: obj.count, techs: obj.techs })) // <-- convert year to number
//   .sort((a, b) => a.year - b.year);
// setProductionData(prodData);


//   // 3️⃣ Status Bar Chart
//   const statuses = ["In Development", "In Use", "Deprecated"];
//   const statusCounts = ["In Development", "In Use", "Deprecated"].map((s) => {
//   const techs = data.technologies.filter((t) => t.status === s);
//   return { status: s, count: techs.length, techs }; // techs must exist
// });
// setStatusData(statusCounts);

// }, [data.technologies]);

//   useEffect(() => {
//     fetchData("technologies");
//   }, []);
// // Custom dot component


//     useEffect(() => {
//   console.log("🔍 techModal state:", techModal);
// }, [techModal]);


// return (
//     <div className="empsection">
//       <div className="tech-table-actions">
//   <button
//     className="add-btn"
//     onClick={() => {
//       setEditId(null);
//       setFormData({});
//       setShowForm(true);
//     }}
//   >
//     ➕ Add Technology
//   </button>
// </div>
//       <div className="empsection-header">
//         <h2>Technologies</h2>
//         <p>Total Technologies: {data.technologies.length}</p>
//       </div>
//             {showModal && (
//         <div className="modal-overlay" onClick={() => setShowModal(false)}>
//           <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//             <div className="modal-header">
//               <h2>{modalTitle} </h2>
//               <div className="modal-actions">
//                 <button className="add-icon"onClick={handleModalAddRow}>＋</button>
//                 <button className="edit-icon"onClick={() => setIsEditingModal(true)}>✎</button>
//               </div>
//             </div>
//             <table>
//               <thead>
//                 <tr>
//                   {modalData.length > 0 &&
//                     Object.keys(modalData[0]).map((key) => <th key={key}>{friendlyNames[key] || key}</th>)}
//                 </tr>
//               </thead>
//               <tbody>
//                 {modalData.map((row, i) => (
//                   <tr key={i}>
//                     {Object.entries(row).map(([k, v]) => (
//                       <td key={k}>
//                         {isEditingModal ? (
//                           <input
//                             value={v || ""}
//                             onChange={(e) => {
//                               const newData = [...modalData];
//                               newData[i][k] = e.target.value;
//                               setModalData(newData);
//                             }}
//                           />
//                         ) : (
//                           v
//                         )}
//                       </td>
//                     ))}
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//             {isEditingModal && (
//               <div className="form-buttons">
//                 <button onClick={handleModalSave}>Save</button>
//                 <button onClick={() => setIsEditingModal(false)}>Cancel</button>
//               </div>
//             )}
//             <button className="close-btn" onClick={() => setShowModal(false)}>
//               x
//             </button>
//           </div>
//         </div>
//       )}
    
// <div className="tech-graphs">

//   {/* 1️⃣ TRL Achieved Bar Chart */}
//   <div className="graph-card">
//     <h3>TRL Achieved</h3>
//     <ResponsiveContainer width="100%" height={250}>
//   <BarChart data={trlData}>
//     <CartesianGrid strokeDasharray="3 3" />
//     <XAxis dataKey="trl" />
//     <YAxis />
//     <Bar
//       dataKey="count"
//       fill="#22a085"
//       onMouseEnter={(data) => setHoveredNode(data)}
//       onMouseLeave={() => setHoveredNode(null)}
//     />
//   </BarChart>
// </ResponsiveContainer>

//   </div>

//   {/* 2️⃣ Production Year Line Chart */}
//   <div className="graph-card">
//     <h3>Production Year</h3>
//    <ResponsiveContainer width="100%" height={250}>
// <LineChart data={productionData}>
//   <CartesianGrid strokeDasharray="3 3" />
//   <XAxis dataKey="year" type="number" domain={['dataMin', 'dataMax']} />
//   <YAxis allowDecimals={false} />
// <Line
//   type="monotone"
//   dataKey="count"
//   stroke="#2980b9"
//   dot={<HoverableDot />}
// />

// </LineChart>
// </ResponsiveContainer>

//   </div>

//   {/* 3️⃣ Status Bar Chart */}
//   <div className="graph-card">
//     <h3>Status</h3>
//     <ResponsiveContainer width="100%" height={250}>
//   <BarChart data={statusData}>
//     <CartesianGrid strokeDasharray="3 3" />
//     <XAxis dataKey="status" />
//     <YAxis />
//     <Bar
//   dataKey="count"
//   fill="#e67e22"
//   onMouseEnter={(data) => setHoveredNode(data)}
//   onMouseLeave={() => setHoveredNode(null)}
// />

//   </BarChart>
// </ResponsiveContainer>

//   </div>

//   {/* ---------- Hover Popup (Shared for all charts) ---------- */}
// {hoveredNode && hoveredNode.techs?.length > 0 && (
//   <div
//     className="graph-popup"
//     style={{
//       top: (() => {
//         const popupHeight = 250; // estimated popup height
//         const offsetY = 20; // gap from cursor
//         if (hoveredNode.y + offsetY + popupHeight > window.scrollY + window.innerHeight) {
//           // If bottom overflows, show above cursor
//           return hoveredNode.y - popupHeight - offsetY;
//         }
//         return hoveredNode.y + offsetY;
//       })(),
//       left: (() => {
//         const popupWidth = window.innerWidth * 0.5; // same as your CSS width:50%
//         const offsetX = 20;
//         if (hoveredNode.x + offsetX + popupWidth > window.innerWidth) {
//           // If right overflows, shift left
//           return window.innerWidth - popupWidth - offsetX;
//         } else if (hoveredNode.x - offsetX - popupWidth / 2 < 0) {
//           // If left overflows, shift right
//           return offsetX;
//         }
//         return hoveredNode.x - popupWidth / 2; // centered horizontally
//       })(),
//     }}
//     onMouseLeave={() => setHoveredNode(null)}
//   >
 
//       <div className="popup-header">
//         <h4>
//           {hoveredNode.trl
//             ? `Technologies with TRL ${hoveredNode.trl}`
//             : hoveredNode.year
//             ? `Technologies produced in ${hoveredNode.year}`
//             : hoveredNode.status
//             ? `Technologies with status "${hoveredNode.status}"`
//             : "Technologies"}
//         </h4>
//         <button className="close-btn" onClick={() => setHoveredNode(null)}>
//           ×
//         </button>
//       </div>
//       <div className="scrollable-table">
//         <table>
//           <thead>
//             <tr>
//               <th>ID</th>
//               <th>Title</th>
//               <th>Category</th>
//               <th>Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {hoveredNode.techs.map((t) => (
//               <tr key={t.tech_id}>
//                 <td>{t.tech_id}</td>
//                 <td>{t.name}</td>
//                 <td>{t.category}</td>
//                 <td>
//                   <button
//                     onClick={() => setTechModal({ show: true, tech: t })}
//                   >
//                     View More
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   )}
// </div>


//     {/* ---------- Filters ---------- */}
//     <div className="filters-panel">
//       <input
//         type="text"
//         placeholder="🔎 Search..."
//         value={techFilters.keyword}
//         onChange={(e) => setTechFilters({ ...techFilters, keyword: e.target.value })}
//       />
//       <select
//         value={techFilters.category}
//         onChange={(e) => setTechFilters({ ...techFilters, category: e.target.value })}
//       >
//         <option value="">All Categories</option>
//         {[...new Set(data.technologies.map((t) => t.category))].map((c) => (
//           <option key={c} value={c}>{c}</option>
//         ))}
//       </select>
//       <select
//         value={techFilters.status}
//         onChange={(e) => setTechFilters({ ...techFilters, status: e.target.value })}
//       >
//         <option value="">All Status</option>
//         <option value="In Development">In Development</option>
//         <option value="In Use">In Use</option>
//         <option value="Deprecated">Deprecated</option>
//       </select>
//       <input
//         type="number"
//         placeholder="TRL min"
//         value={techFilters.trlMin}
//         onChange={(e) => setTechFilters({ ...techFilters, trlMin: e.target.value })}
//       />
//       <input
//         type="number"
//         placeholder="TRL max"
//         value={techFilters.trlMax}
//         onChange={(e) => setTechFilters({ ...techFilters, trlMax: e.target.value })}
//       />
//       <input
//         type="number"
//         placeholder="Budget min"
//         value={techFilters.budgetMin}
//         onChange={(e) => setTechFilters({ ...techFilters, budgetMin: e.target.value })}
//       />
//       <input
//         type="number"
//         placeholder="Budget max"
//         value={techFilters.budgetMax}
//         onChange={(e) => setTechFilters({ ...techFilters, budgetMax: e.target.value })}
//       />
//       <input
//         type="date"
//         value={techFilters.startDate}
//         onChange={(e) => setTechFilters({ ...techFilters, startDate: e.target.value })}
//       />
//       <input
//         type="date"
//         value={techFilters.endDate}
//         onChange={(e) => setTechFilters({ ...techFilters, endDate: e.target.value })}
//       />
//       <select
//         value={techFilters.security}
//         onChange={(e) => setTechFilters({ ...techFilters, security: e.target.value })}
//       >
//         <option value="">All Security Levels</option>
//         <option value="Public">Public</option>
//         <option value="Restricted">Restricted</option>
//         <option value="Confidential">Confidential</option>
//         <option value="Top Secret">Top Secret</option>
//       </select>
//     </div>

// {/* ---------- Filtered Table ---------- */}
// <div className="reports-results">
//   <table>
//     <thead>
//       <tr>
//         <th>ID</th>
//         <th>Title</th>
//         <th>Category</th>
//         <th>Production Start</th>
//         <th>Last Usage</th>
//         <th>Status</th>
//         <th>Actions</th>
//       </tr>
//     </thead>
//     <tbody>
//       {data.technologies
//         .filter((t) => {
//   const keyword = techFilters.keyword?.toLowerCase() || "";

//   const matchKeyword =
//     (t?.name?.toLowerCase?.().includes(keyword) || false) ||
//     (t?.category?.toLowerCase?.().includes(keyword) || false);

//   const matchCategory = techFilters.category
//     ? t?.category === techFilters.category
//     : true;

//   const matchStatus = techFilters.status
//     ? t?.status === techFilters.status
//     : true;

//   const matchTrlMin = techFilters.trlMin
//     ? Number(t?.trl_start || 0) >= Number(techFilters.trlMin)
//     : true;

//   const matchTrlMax = techFilters.trlMax
//     ? Number(t?.trl_achieved || 0) <= Number(techFilters.trlMax)
//     : true;

//   const matchBudgetMin = techFilters.budgetMin
//     ? Number(t?.budget || 0) >= Number(techFilters.budgetMin)
//     : true;

//   const matchBudgetMax = techFilters.budgetMax
//     ? Number(t?.budget || 0) <= Number(techFilters.budgetMax)
//     : true;

//   const matchDateStart = techFilters.startDate
//     ? new Date(t?.production_start_date || "1970-01-01") >=
//       new Date(techFilters.startDate)
//     : true;

//   const matchDateEnd = techFilters.endDate
//     ? new Date(t?.last_usage_date || "9999-12-31") <=
//       new Date(techFilters.endDate)
//     : true;

//   const matchSecurity = techFilters.security
//     ? t?.security_level === techFilters.security
//     : true;

//   return (
//     matchKeyword &&
//     matchCategory &&
//     matchStatus &&
//     matchTrlMin &&
//     matchTrlMax &&
//     matchBudgetMin &&
//     matchBudgetMax &&
//     matchDateStart &&
//     matchDateEnd &&
//     matchSecurity
//   );
// })

//         .map((t) => (
//           <tr key={t.tech_id}>
//             <td>{t.tech_id}</td>
//             <td>{t.name}</td>
//             <td>{t.category}</td>
//             <td>{t.production_start_date}</td>
//             <td>{t.last_usage_date}</td>
//             <td>{t.status}</td>
//             <td>
//               <button
//                 className="edit-btn"
//                 onClick={() => {
//                   setFormData(t);
//                   setEditId(t.tech_id);
//                   setShowForm(true);
//                 }}
//               >
//                 ✎ Edit
//               </button>
//               <button
//                 className="export-btn pdf"
//                 onClick={() => setTechModal({ show: true, tech: t })}
//               >
//                 View More
//               </button>
//             </td>
//           </tr>
//         ))}
//     </tbody>
//   </table>
// </div>
// {/* ---------- Add/Edit Form Modal ---------- */}
// {showForm && (
//   <div className="modal-overlay" onClick={() => setShowForm(false)}>
//     <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
//       <button className="close-btn" onClick={() => setShowForm(false)}>✖</button>
//       <h2>{editId ? "Edit Technology" : "Add New Technology"}</h2>
//       <div className="vertical-form">
//         <input
//           placeholder="Technology Name"
//           value={formData.name || ""}
//           onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//         />
//         <input
//           placeholder="Category"
//           value={formData.category || ""}
//           onChange={(e) => setFormData({ ...formData, category: e.target.value })}
//         />
//         <select
//           value={formData.status || ""}
//           onChange={(e) => setFormData({ ...formData, status: e.target.value })}
//         >
//           <option value="">Select Status</option>
//           <option value="In Development">In Development</option>
//           <option value="In Use">In Use</option>
//           <option value="Deprecated">Deprecated</option>
//         </select>

//         <label>Production Start Date</label>
//         <DatePicker
//           selected={formData.production_start_date ? new Date(formData.production_start_date) : null}
//           onChange={(date) =>
//             setFormData({ ...formData, production_start_date: date.toISOString().split("T")[0] })
//           }
//           placeholderText="Select production start date"
//         />

//         <label>Last Usage Date</label>
//         <DatePicker
//           selected={formData.last_usage_date ? new Date(formData.last_usage_date) : null}
//           onChange={(date) =>
//             setFormData({ ...formData, last_usage_date: date.toISOString().split("T")[0] })
//           }
//           placeholderText="Select last usage date"
//         />

//         <input
//           type="number"
//           placeholder="Budget"
//           value={formData.budget || ""}
//           onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
//         />

//         <input
//           placeholder="Security Level"
//           value={formData.security_level || ""}
//           onChange={(e) => setFormData({ ...formData, security_level: e.target.value })}
//         />

//         <div className="form-buttons">
//           <button
//             className="save-btn"
//             onClick={() =>
//               handleAddOrUpdate(
//                 "technologies",
//                 formData,
//                 editId,
//               )
//             }
//           >
//             {editId ? "Update" : "Save"}
//           </button>
//           <button className="cancel-btn" onClick={() => setShowForm(false)}>
//             Cancel
//           </button>
//         </div>
//       </div>
//     </div>
//   </div>
// )}

//     {/* ---------- Full-Screen Modal ---------- */}
//     {techModal.show && (
//       <div className="modal-overlay techmodal-overlay" onClick={() => setTechModal({ show: false })}>
//         <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//           <button className="close-btn" onClick={() => setTechModal({ show: false })}>✖</button>
//           <h2>{techModal.tech.name}</h2>
//           <div className="tech-buttons">

//   <button onClick={() => openModal("specs", techModal.tech.tech_id, "specs")}>
//     View Specs
//   </button>
//   <button onClick={() => openModal("sw", techModal.tech.tech_id, "sw")}>
//     View Software Qualification
//   </button>
//   <button onClick={() => openModal("hw", techModal.tech.tech_id, "hw")}>
//     View Hardware Qualification
//   </button>
//   <button onClick={() => openModal("versions", techModal.tech.tech_id, "versions")}>
//     View Versions
//   </button>
// <button onClick={() =>{
//       setModalData([{ salient_features: techModal.tech.salient_features }]);
//       setModalTitle("Salient Features") ;
//       setModalSection("technologies"); 
//       setShowModal(true);
//     }}>
//     View Salient Features
//   </button>

//   <button onClick={() =>{
//       setModalData([{ achievements: techModal.tech.achievements }]);
//       setModalTitle("Achievements");
//       setModalSection("technologies"); 
//       setShowModal(true);
//     }}>
//     View Achievements
//   </button>

//   <button onClick={() =>{
//       setModalData([{
//         trl_start: techModal.tech.trl_start,
//         trl_achieved: techModal.tech.trl_achieved
//       }]) ;
//       setModalTitle("TRL Details");
//       setModalSection("technologies"); 
//       setShowModal(true);
//     }}>
//     View TRL
//   </button>

//   <button onClick={() =>{
//       setModalData([{
//         budget: techModal.tech.budget,
//         funding_details: techModal.tech.funding_details
//       }]) ;
//       setModalTitle("Budget & Funding") ;
//       setModalSection("technologies"); 
//       setShowModal(true);
//     }}>
//     View Budget & Funding
//   </button>

//   <button onClick={() =>{
//       setModalData([{ security_level: techModal.tech.security_level }]) ;
//       setModalTitle("Security Level") ;
//       setModalSection("technologies"); 
//       setShowModal(true);
//     }}>
//     View Security Level
//   </button>

//   <button onClick={() =>{
//       setModalData([{ location: techModal.tech.location }]) ;
//       setModalTitle("Location") ;
//       setModalSection("technologies"); 
//       setShowModal(true);
//     }}>
//     View Location
//   </button>

//   <button onClick={() =>{
//       setModalData([{ tech_stack: techModal.tech.tech_stack }]) ;
//       setModalTitle("Tech Stack") ;
//       setModalSection("technologies"); 
//       setShowModal(true);
//     }}>
//     View Tech Stack
//   </button>

//   <button onClick={() =>{
//       setModalData([{ image_path: techModal.tech.image_path }]) ;
//       setModalTitle("Image Path") ;
//       setModalSection("technologies"); 
//       setShowModal(true);
//     }}>
//     View Image Path
//   </button>

//   <button onClick={() =>{
//       setModalData([{
//         dev_proj_name: techModal.tech.dev_proj_name,
//         dev_proj_number: techModal.tech.dev_proj_number,
//         dev_proj_code: techModal.tech.dev_proj_code
//       }]) ;
//       setModalTitle("Development Details");
//       setModalSection("technologies"); 
//       setShowModal(true);
//     }}>
//     View Dev Details
//   </button>

//   <button
//   onClick={async () => {
//     try {
//       const res = await axios.get(
//         `http://localhost:5000/api/projects/by-tech/${techModal.tech.tech_id}`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setModalData(res.data);
//       setModalTitle("Projects Using This Technology");
//       setShowModal(true);
//     } catch (err) {
//       console.error(err);
//     }
//   }}
// >
//   View Projects Using This Tech
// </button>


// </div>
//         </div>
//       </div>
//     )}
//   </div>
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

// Re-usable table component for the modal tabs
const RelatedDataTable = ({ data, title, friendlyNames }) => (
  <div className="modal-tab-content">
    <h4>{title}</h4>
    {data && data.length > 0 ? (
      <table>
        <thead>
          <tr>
            {Object.keys(data[0]).map((key) => (
              <th key={key}>{friendlyNames[key] || key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              {Object.entries(row).map(([k, v]) => (
                <td key={k}>{v}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <p>No {title.toLowerCase()} data found for this technology.</p>
    )}
  </div>
);


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
  }, []);

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

    // Fetch related data ON DEMAND
    try {
      const res = await axios.get(`http://localhost:5000/api/technologies/details/${tech.tech_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setModalRelatedData(res.data);
    } catch (err) {
      console.error("Failed to fetch tech details", err);
      // Still show the modal, just with empty related data
      setModalRelatedData({});
    }
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
        setModalTechId(response.data.tech_id); // Get new ID from server response
        alert("Technology added. You can now add specs, hardware, etc.");
      } else {
        await axios.put(`http://localhost:5000/api/technologies/${modalTechId}`, modalFormData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Technology updated.");
      }
      // Refresh main table and graphs
      fetchTechnologies();
      // Note: We don't close the modal, allowing further edits
    } catch (err) {
      console.error(err);
      alert("Failed to save technology.");
    }
  };
  
  // Note: This logic for adding/editing related data (specs, hw, sw)
  // would be built out in each respective tab component, calling APIs like:
  // POST /api/specs (with { tech_id, parameter_name, ... })
  // PUT /api/specs/123 (with new data)
  // DELETE /api/specs/123

  // --- Filter Logic ---

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setTechFilters(prev => ({ ...prev, [name]: value }));
  };

  const filteredTechnologies = technologies.filter((t) => {
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
              <XAxis dataKey="year" type="number" domain={['dataMin', 'dataMax']} />
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
            {[...new Set(technologies.map((t) => t.category))].map((c) => (
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
              <th>Actions</th>
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
                  <button
                    className="edit-btn"
                    onClick={() => handleOpenEditModal(t)}
                  >
                    ✎ Manage
                  </button>
                  {/* Add Delete button here if needed */}
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
                <RelatedDataTable data={modalRelatedData.specs} title="Specifications" friendlyNames={friendlyNames} />
              )}
              {modalActiveTab === 'hardware' && (
                <RelatedDataTable data={modalRelatedData.hw} title="Hardware Qualifications" friendlyNames={friendlyNames} />
              )}
              {modalActiveTab === 'software' && (
                <RelatedDataTable data={modalRelatedData.sw} title="Software Qualifications" friendlyNames={friendlyNames} />
              )}
              {modalActiveTab === 'versions' && (
                <RelatedDataTable data={modalRelatedData.versions} title="Versions" friendlyNames={friendlyNames} />
              )}
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}