import express from "express";
import db from "../config/db.js";
import { verifyToken, isEmployee } from "../middleware/auth.js";

const router = express.Router();

/* -------------------- PUBLICATIONS CRUD -------------------- */
// POST /api/publications  -> { pub_id }
// routes/publicationsAndEmployeeLinks.js

router.post("/publications", verifyToken, isEmployee, async (req, res) => {
  try {
    let { title, authors, journal, year, link, tech_id } = req.body || {};
    if (!title || !journal || !year || !tech_id) {
      return res.status(400).json({
        error: "title, journal, year and tech_id are required",
      });
    }
    if (authors == null) authors = ""; // make optional

    const [result] = await db.promise().query(
      `INSERT INTO publications (title, authors, journal, year, link, tech_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, authors, journal, Number(year), link || null, Number(tech_id)]
    );

    console.log("HIT POST /api/publications -> pub_id:", result.insertId);
    return res.status(201).json({ pub_id: result.insertId });
  } catch (err) {
    console.error("POST /api/publications", err?.sqlMessage || err);
    return res.status(500).json({ error: err?.sqlMessage || "Failed to create publication" });
  }
});

// GET /api/publications
router.get("/publications", verifyToken, async (_req, res) => {
  try {
    const [rows] = await db.promise().query(
      `SELECT pub_id, tech_id, title, authors, journal, year, link
         FROM publications
       ORDER BY pub_id DESC`
    );
    return res.json(rows);
  } catch (err) {
    console.error("GET /api/publications", err?.sqlMessage || err);
    return res.status(500).json({ error: "Failed to fetch publications" });
  }
});

// PUT /api/publications/:id
router.put("/publications/:id", verifyToken, isEmployee, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, authors, journal, year, link, tech_id } = req.body || {};

    const [r] = await db.promise().query(
      `UPDATE publications
          SET title=?, authors=?, journal=?, year=?, link=?, tech_id=?
        WHERE pub_id=?`,
      [
        title || null,
        authors || null,
        journal || null,
        year ? Number(year) : null,
        link || null,
        tech_id ? Number(tech_id) : null,
        id,
      ]
    );

    if (r.affectedRows === 0) return res.status(404).json({ error: "Publication not found" });
    return res.json({ success: true });
  } catch (err) {
    console.error("PUT /api/publications/:id", err?.sqlMessage || err);
    return res.status(500).json({ error: err?.sqlMessage || "Failed to update publication" });
  }
});

// DELETE /api/publications/:id
router.delete("/publications/:id", verifyToken, isEmployee, async (req, res) => {
  try {
    const { id } = req.params;
    const [r] = await db.promise().query(`DELETE FROM publications WHERE pub_id=?`, [id]);
    if (r.affectedRows === 0) return res.status(404).json({ error: "Publication not found" });
    return res.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/publications/:id", err?.sqlMessage || err);
    return res.status(500).json({ error: "Failed to delete publication" });
  }
});

/* -------- EMPLOYEE ↔ PUBLICATION LINKS (M2M) -------- */
// POST /api/employee_publications -> { id, employee_id, pub_id, role, created:true }
router.post("/employee_publications", verifyToken, isEmployee, async (req, res) => {
  try {
    const { employee_id, pub_id, role } = req.body || {};
    if (!employee_id || !pub_id) {
      return res.status(400).json({ error: "employee_id and pub_id are required" });
    }

    const [r] = await db.promise().query(
      `INSERT INTO employee_publications (employee_id, pub_id, role) VALUES (?, ?, ?)`,
      [Number(employee_id), Number(pub_id), role || null]
    );

    return res.status(201).json({
      id: r.insertId,
      employee_id: Number(employee_id),
      pub_id: Number(pub_id),
      role: role || null,
      created: true,
    });
  } catch (err) {
    console.error("POST /api/employee_publications", err?.sqlMessage || err);
    return res.status(500).json({ error: err?.sqlMessage || "Failed to link employee to publication" });
  }
});

// GET /api/employee_publications/publication/:pub_id  -> linked authors
router.get("/employee_publications/publication/:pub_id", verifyToken, async (req, res) => {
  try {
    const { pub_id } = req.params;
    const [rows] = await db.promise().query(
      `SELECT ep.id, e.employee_id, e.name, e.department, ep.role
         FROM employee_publications ep
         JOIN employees e ON e.employee_id = ep.employee_id
        WHERE ep.pub_id = ?
        ORDER BY e.name`,
      [pub_id]
    );
    return res.json(rows);
  } catch (err) {
    console.error("GET authors", err?.sqlMessage || err);
    return res.status(500).json({ error: "Failed to fetch authors" });
  }
});

// PUT /api/employee_publications/:id  -> update role
router.put("/employee_publications/:id", verifyToken, isEmployee, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body || {};
    const [r] = await db.promise().query(
      `UPDATE employee_publications SET role=? WHERE id=?`,
      [role || null, id]
    );
    if (r.affectedRows === 0) return res.status(404).json({ error: "Link not found" });
    return res.json({ id: Number(id), role: role || null });
  } catch (err) {
    console.error("PUT /api/employee_publications/:id", err?.sqlMessage || err);
    return res.status(500).json({ error: "Failed to update role" });
  }
});

// DELETE /api/employee_publications/:id
router.delete("/employee_publications/:id", verifyToken, isEmployee, async (req, res) => {
  try {
    const { id } = req.params;
    const [r] = await db.promise().query(`DELETE FROM employee_publications WHERE id=?`, [id]);
    if (r.affectedRows === 0) return res.status(404).json({ error: "Link not found" });
    return res.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/employee_publications/:id", err?.sqlMessage || err);
    return res.status(500).json({ error: "Failed to unlink employee from publication" });
  }
});

export default router;
