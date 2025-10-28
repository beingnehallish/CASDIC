// routes/employeeRoutes.js
import express from "express";
import db from "../config/db.js";
import multer from "multer";
import { verifyToken, isEmployee } from "../middleware/auth.js";

const router = express.Router();

// ===== Multer setup for file upload =====
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ===== GET all employees =====
router.get("/", verifyToken, (req, res) => {
  db.query(
    `SELECT employee_id, name, designation, department, email, phone, status, profile_pic FROM employees`,
    (err, rows) => {
      if (err) {
        console.error("Error fetching employees:", err);
        return res.status(500).json({ error: "Server error" });
      }

      const formatted = rows.map((emp) => ({
        ...emp,
        profile_pic: emp.profile_pic ? emp.profile_pic.toString("base64") : null,
      }));

      res.json(formatted);
    }
  );
});

// ===== GET single employee by ID =====
router.get("/:employee_id", verifyToken, (req, res) => {
  const { employee_id } = req.params;
  db.query("SELECT * FROM employees WHERE employee_id = ?", [employee_id], (err, rows) => {
    if (err) {
      console.error("Error fetching employee:", err);
      return res.status(500).json({ error: "Server error" });
    }
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });

    const emp = {
      ...rows[0],
      profile_pic: rows[0].profile_pic ? rows[0].profile_pic.toString("base64") : null,
    };
    res.json(emp);
  });
});

// ===== POST new employee =====
router.post("/", verifyToken, isEmployee, upload.single("profile_pic"), (req, res) => {
  const { name, designation, department, email, phone, status } = req.body;
  const profilePic = req.file ? req.file.buffer : null;

  db.query(
    `INSERT INTO employees (name, designation, department, email, phone, profile_pic, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, designation, department, email, phone, profilePic, status || "Active"],
    (err, result) => {
      if (err) {
        console.error("Error adding employee:", err);
        return res.status(500).json({ error: "Server error" });
      }
      res.json({ message: "Employee added successfully" });
    }
  );
});

// ===== PUT update employee =====
router.put("/:employee_id", verifyToken, isEmployee, upload.single("profile_pic"), (req, res) => {
  const { employee_id } = req.params;
  const { name, designation, department, email, phone, status } = req.body;
  const profilePic = req.file ? req.file.buffer : null;

  let query = `
    UPDATE employees
    SET name=?, designation=?, department=?, email=?, phone=?, status=?
  `;
  const params = [name, designation, department, email, phone, status];

  if (profilePic) {
    query += ", profile_pic=?";
    params.push(profilePic);
  }

  query += " WHERE employee_id=?";
  params.push(employee_id);

  db.query(query, params, (err) => {
    if (err) {
      console.error("Error updating employee:", err);
      return res.status(500).json({ error: "Server error" });
    }
    res.json({ message: "Employee updated successfully" });
  });
});

// ===== DELETE employee =====
router.delete("/:employee_id", verifyToken, isEmployee, (req, res) => {
  const { employee_id } = req.params;
  db.query("DELETE FROM employees WHERE employee_id = ?", [employee_id], (err) => {
    if (err) {
      console.error("Error deleting employee:", err);
      return res.status(500).json({ error: "Server error" });
    }
    res.json({ message: "Employee deleted successfully" });
  });
});

// ===== GET employee contributions =====
router.get("/:id/contributions", (req, res) => {
  const { id } = req.params;
  const contributions = { projects: [], patents: [], publications: [] };

  // Step 1: Get projects
  db.query(
    `SELECT p.project_id, p.name, ep.role
     FROM employee_projects ep
     JOIN projects p ON ep.project_id = p.project_id
     WHERE ep.employee_id = ?`,
    [id],
    (err, projects) => {
      if (err) {
        console.error("Error fetching projects:", err);
        return res.status(500).json({ error: "Error fetching projects" });
      }
      contributions.projects = projects || [];

      // Step 2: Get patents
      db.query(
        `SELECT pa.patent_id, pa.title AS name, pa.patent_number
         FROM employee_patents ep
         JOIN patents pa ON ep.patent_id = pa.patent_id
         WHERE ep.employee_id = ?`,
        [id],
        (err, patents) => {
          if (err) {
            console.error("Error fetching patents:", err);
            return res.status(500).json({ error: "Error fetching patents" });
          }
          contributions.patents = patents || [];

          // Step 3: Get publications
          db.query(
            `SELECT pb.pub_id, pb.title AS name, pb.link
             FROM employee_publications ep
             JOIN publications pb ON ep.pub_id = pb.pub_id
             WHERE ep.employee_id = ?`,
            [id],
            (err, publications) => {
              if (err) {
                console.error("Error fetching publications:", err);
                return res.status(500).json({ error: "Error fetching publications" });
              }
              contributions.publications = publications || [];

              // Send final combined response
              res.json(contributions);
            }
          );
        }
      );
    }
  );
});

export default router;
