// pages/employee/employees.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/employee.projects.css";

export default function EmployeesPage() {
  const token = localStorage.getItem("token");
const [employees, setEmployees] = useState([]);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [contributions, setContributions] = useState({
    projects: [],
    patents: [],
    publications: [],
  });


const handleViewMore = async (emp) => {
  try {
    const res = await axios.get(`http://localhost:5000/api/employees/${emp.employee_id}/contributions`);
    setContributions(res.data);
    setSelectedEmployee(emp);
    setViewModalOpen(true);
  } catch (err) {
    console.error(err);
  }
};


const [filters, setFilters] = useState({ keyword: "", department: "", status: "" });
  const [modalData, setModalData] = useState({ show: false, employee: null, isEditing: false });
  const [addModal, setAddModal] = useState({
    show: false,
    employee: { name: "", designation: "", department: "", email: "", phone: "", status: "Active", newProfilePic: null },
  });

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/employees", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const formatted = res.data.map(emp => ({
        ...emp,
        profile_pic: emp.profile_pic ? emp.profile_pic : null,
      }));
      setEmployees(formatted);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this employee?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/employees/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchEmployees();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredEmployees = employees.filter((e) => {
    const kw = filters.keyword.toLowerCase();
    return (
      (!filters.department || e.department.toLowerCase().includes(filters.department.toLowerCase())) &&
      (!filters.status || e.status === filters.status) &&
      (e.name.toLowerCase().includes(kw) || e.email.toLowerCase().includes(kw) || e.designation.toLowerCase().includes(kw))
    );
  });

  return (
    <div className="empsection">
      {/* ===== Add Employee Button ===== */}
      <div className="tech-table-actions">
        <button
          className="add-btn"
          onClick={() =>
            setAddModal({
              show: true,
              employee: { name: "", designation: "", department: "", email: "", phone: "", status: "Active", newProfilePic: null },
            })
          }
        >
          ➕ Add Employee
        </button>
      </div>

      {/* ===== Header ===== */}
      <div className="empsection-header">
        <h2>Employees</h2>
        <p>Total Employees: {employees.length}</p>
      </div>

      {/* ===== Filters ===== */}
      <div className="filters-panel">
        <input type="text" placeholder="🔎 Search by name/email..." value={filters.keyword} onChange={(e) => setFilters({ ...filters, keyword: e.target.value })} />
        <input type="text" placeholder="Department" value={filters.department} onChange={(e) => setFilters({ ...filters, department: e.target.value })} />
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="On Leave">On Leave</option>
          <option value="Retired">Retired</option>
        </select>
        <button className="reset-btn" onClick={() => setFilters({ keyword: "", department: "", status: "" })}>
          Reset
        </button>
      </div>

      {/* ===== Employees Table ===== */}
      <div className="reports-results">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Photo</th>
              <th>Name</th>
              <th>Designation</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((emp) => (
              <tr key={emp.employee_id}>
                <td>{emp.employee_id}</td>
                <td>
                  {emp.profile_pic ? (
                    <img src={`data:image/jpeg;base64,${emp.profile_pic}`} alt="Profile" width="40" height="40" style={{ borderRadius: "50%", objectFit: "cover" }} />
                  ) : (
                    "—"
                  )}
                </td>
                <td>{emp.name}</td>
                <td>{emp.designation}</td>
                <td>
                  <span style={{ color: emp.status === "Active" ? "green" : emp.status === "On Leave" ? "orange" : "gray", fontWeight: "bold" }}>
                    {emp.status}
                  </span>
                </td>
                <td>
                  <button className="edit-btn" onClick={() => setModalData({ show: true, employee: emp, isEditing: true })}>✎</button>
                  <button className="delete-btn" onClick={() => handleDelete(emp.employee_id)}>🗑</button>
                  <button onClick={() => handleViewMore(emp)}>View More</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
{viewModalOpen && selectedEmployee && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Employee Details</h2>
            <p><strong>Name:</strong> {selectedEmployee.name}</p>
            <p><strong>Designation:</strong> {selectedEmployee.designation}</p>
            <p><strong>Department:</strong> {selectedEmployee.department}</p>
            <p><strong>Email:</strong> {selectedEmployee.email}</p>
            <p><strong>Phone:</strong> {selectedEmployee.phone}</p>
            <p><strong>Status:</strong> {selectedEmployee.status}</p>

            {selectedEmployee.profile_pic && (
              <img
                src={`data:image/jpeg;base64,${selectedEmployee.profile_pic}`}
                alt="Profile"
                className="profile-pic"
              />
            )}

            {/* Contributions - Projects */}
            {contributions.projects?.length > 0 && (
              <>
                <h3>Contributions - Projects</h3>
                <table className="contrib-table">
                  <thead>
                    <tr>
                      <th>Project ID</th>
                      <th>Name</th>
                      <th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contributions.projects.map((proj) => (
                      <tr key={proj.project_id}>
                        <td>{proj.project_id}</td>
                        <td>{proj.name}</td>
                        <td>{proj.role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {/* Contributions - Patents */}
            {contributions.patents?.length > 0 && (
              <>
                <h3>Contributions - Patents</h3>
                <table className="contrib-table">
                  <thead>
                    <tr>
                      <th>Patent ID</th>
                      <th>Name</th>
                      <th>Patent Number</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contributions.patents.map((pat) => (
                      <tr key={pat.patent_id}>
                        <td>{pat.patent_id}</td>
                        <td>{pat.name}</td>
                        <td>{pat.patent_number}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {/* Contributions - Publications */}
            {contributions.publications?.length > 0 && (
              <>
                <h3>Contributions - Publications</h3>
                <table className="contrib-table">
                  <thead>
                    <tr>
                      <th>Publication ID</th>
                      <th>Title</th>
                      <th>Link</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contributions.publications.map((pub) => (
                      <tr key={pub.pub_id}>
                        <td>{pub.pub_id}</td>
                        <td>{pub.name}</td>
                        <td>
                          <a href={pub.link} target="_blank" rel="noreferrer">
                            {pub.link}
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            <button onClick={() => setViewModalOpen(false)}>Close</button>
          </div>
        </div>
      )}
      {/* ===== Add Employee Modal ===== */}
      {addModal.show && (
        <div className="modal-overlay" onClick={() => setAddModal({ show: false })}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setAddModal({ show: false })}>✖</button>
            <h2>Add Employee</h2>

            {["name", "designation",].map((field) => (
              <p key={field}>
                <b>{field.charAt(0).toUpperCase() + field.slice(1)}:</b>
                <input type="text" value={addModal.employee[field]} onChange={(e) => setAddModal((prev) => ({ ...prev, employee: { ...prev.employee, [field]: e.target.value } }))} />
              </p>
            ))}

            <p>
              <b>Status:</b>
              <select value={addModal.employee.status} onChange={(e) => setAddModal((prev) => ({ ...prev, employee: { ...prev.employee, status: e.target.value } }))}>
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Retired">Retired</option>
              </select>
            </p>

            <p>
              <b>Profile Picture:</b>
              <input type="file" accept="image/*" onChange={(e) => setAddModal((prev) => ({ ...prev, employee: { ...prev.employee, newProfilePic: e.target.files[0] } }))} />
              {addModal.employee.newProfilePic && (
                <img src={URL.createObjectURL(addModal.employee.newProfilePic)} alt="Preview" width="80" height="80" style={{ borderRadius: "10px", marginTop: "10px" }} />
              )}
            </p>

            <button
              className="save-btn"
              onClick={async () => {
                try {
                  const e = addModal.employee;
                  const formData = new FormData();
                  formData.append("name", e.name);
                  formData.append("designation", e.designation);
                  formData.append("department", e.department);
                  formData.append("email", e.email);
                  formData.append("phone", e.phone);
                  formData.append("status", e.status);
                  if (e.newProfilePic) formData.append("profile_pic", e.newProfilePic);

                  await axios.post("http://localhost:5000/api/employees", formData, {
                    headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
                  });

                  setAddModal({ show: false });
                  fetchEmployees();
                } catch (err) {
                  console.error(err);
                  alert("Failed to add employee");
                }
              }}
            >
              💾 Add
            </button>
          </div>
        </div>
      )}

      {/* ===== Edit/View Employee Modal ===== */}
      {modalData.show && modalData.employee && (
        <div className="modal-overlay" onClick={() => setModalData({ show: false, employee: null, isEditing: false })}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setModalData({ show: false, employee: null, isEditing: false })}>✖</button>

            <h2>
              {modalData.isEditing ? (
                <input type="text" value={modalData.employee.name} onChange={(e) => setModalData((prev) => ({ ...prev, employee: { ...prev.employee, name: e.target.value } }))} />
              ) : (
                modalData.employee.name
              )}
            </h2>

            {/* Profile Pic */}
            <div style={{ margin: "1rem 0" }}>
              <b>Profile Picture:</b><br />
              {modalData.employee.profile_pic && !modalData.employee.newProfilePic && (
                <img src={`data:image/jpeg;base64,${modalData.employee.profile_pic}`} alt="Profile" style={{ width: "150px", height: "150px", objectFit: "cover", borderRadius: "50%" }} />
              )}
              {modalData.employee.newProfilePic && (
                <img src={URL.createObjectURL(modalData.employee.newProfilePic)} alt="Preview" style={{ width: "150px", height: "150px", objectFit: "cover", borderRadius: "50%" }} />
              )}
              {modalData.isEditing && (
                <input type="file" accept="image/*" onChange={(e) => setModalData((prev) => ({ ...prev, employee: { ...prev.employee, newProfilePic: e.target.files[0] } }))} />
              )}
            </div>

            {/* Other fields */}
            {["designation", "department", "email", "phone"].map((field) => (
              <p key={field}>
                <b>{field.charAt(0).toUpperCase() + field.slice(1)}:</b>{" "}
                {modalData.isEditing ? (
                  <input type="text" value={modalData.employee[field] || ""} onChange={(e) => setModalData((prev) => ({ ...prev, employee: { ...prev.employee, [field]: e.target.value } }))} />
                ) : (
                  modalData.employee[field]
                )}
              </p>
            ))}

            {/* Status */}
            <p>
              <b>Status:</b>{" "}
              {modalData.isEditing ? (
                <select value={modalData.employee.status} onChange={(e) => setModalData((prev) => ({ ...prev, employee: { ...prev.employee, status: e.target.value } }))}>
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Retired">Retired</option>
                </select>
              ) : (
                modalData.employee.status
              )}
            </p>

            {/* Update button */}
            {modalData.isEditing && (
              <button
                className="save-btn"
                onClick={async () => {
                  try {
                    const e = modalData.employee;
                    const formData = new FormData();
                    formData.append("name", e.name);
                    formData.append("designation", e.designation);
                    formData.append("department", e.department);
                    formData.append("email", e.email);
                    formData.append("phone", e.phone);
                    formData.append("status", e.status);
                    if (e.newProfilePic) formData.append("profile_pic", e.newProfilePic);

                    await axios.put(`http://localhost:5000/api/employees/${e.employee_id}`, formData, {
                      headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
                    });

                    alert("Employee updated successfully!");
                    setModalData({ show: false, employee: null, isEditing: false });
                    fetchEmployees();
                  } catch (err) {
                    console.error(err);
                    alert("Failed to update employee");
                  }
                }}
              >
                💾 Update
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
