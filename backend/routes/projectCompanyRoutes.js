// routes/projectCompanyRoutes.js
import express from "express";
import pool from "../config/db.js"; // your callback-based pool

const router = express.Router();

// ---------- Get all projects ----------
router.get("/projects", (req, res) => {
  pool.query("SELECT project_id, name FROM projects ORDER BY project_id", (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Server Error" });
    }
    res.json(rows);
  });
});

// routes/projectCompanyRoutes.js
router.get("/companies", (req, res) => {
  pool.query(
    `SELECT company_id, name, country, type, role, contact_person, contact_email, contact_phone, website, address, notes
     FROM companies ORDER BY company_id`,
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Server Error" });
      }
      res.json(rows);
    }
  );
});


// ---------- Add project_company mapping ----------
router.post("/project_companies", (req, res) => {
  const { project_id, company_id, role_in_project, contribution, partnership_start_date, partnership_end_date } = req.body;
  const sql = `
    INSERT INTO project_companies 
    (project_id, company_id, role_in_project, contribution, partnership_start_date, partnership_end_date)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  pool.query(sql, [project_id, company_id, role_in_project, contribution, partnership_start_date, partnership_end_date], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Server Error" });
    }
    res.json({ message: "Collaboration added successfully", id: result.insertId });
  });
});

// ---------- Get all project-company collaborations ----------
router.get("/project_companies", (req, res) => {
  const sql = `
    SELECT pc.id, p.name AS project_name, c.name AS company_name, pc.role_in_project, pc.contribution,
           pc.partnership_start_date, pc.partnership_end_date
    FROM project_companies pc
    JOIN projects p ON pc.project_id = p.project_id
    JOIN companies c ON pc.company_id = c.company_id
    ORDER BY pc.id DESC
  `;
  pool.query(sql, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Server Error" });
    }
    res.json(rows);
  });
});

router.get("/company/:company_id/collaborations", (req, res) => {
  const { company_id } = req.params;
  const sql = `
    SELECT 
      pc.id,                 -- << add this
      pc.project_id, 
      p.name AS project_name, 
      pc.role_in_project
    FROM project_companies pc
    JOIN projects p ON pc.project_id = p.project_id
    WHERE pc.company_id = ?
    ORDER BY pc.id DESC
  `;
  pool.query(sql, [company_id], (err, rows) => {
    if (err) return res.status(500).json({ error: "Server Error" });
    res.json(rows);
  });
});

router.delete("/project_companies/:id", (req, res) => {
  const { id } = req.params;
  pool.query("DELETE FROM project_companies WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Server Error" });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Not found" });
    res.sendStatus(204);
  });
});


export default router;
