import express from "express";
import db from "../config/db.js";
import { verifyToken, isEmployee } from "../middleware/auth.js";

const router = express.Router();

// GET all projects
router.get("/", verifyToken, async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      `SELECT project_id, name, tech_id, start_date, end_date, budget, description FROM projects`
    );

    const formatted = rows.map(p => ({
      ...p,
      start_date: p.start_date ? p.start_date.toISOString().split("T")[0] : null,
      end_date: p.end_date ? p.end_date.toISOString().split("T")[0] : null,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Error fetching projects:", err);
    res.status(500).json({ error: "Server error", sqlMessage: err.sqlMessage });
  }
});

// POST new project (employee only)
router.post("/", verifyToken, isEmployee, async (req, res) => {
  const { name, description, start_date, end_date, budget, tech_id } = req.body;
  try {
    // This is the fix from our previous conversation
    const [result] = await db.promise().query(
      `INSERT INTO projects (name, description, start_date, end_date, budget, tech_id) VALUES (?, ?, ?, ?, ?, ?)`,
      [name, description, start_date, end_date || null, budget, tech_id || null]
    );
    
    const newProjectID = result.insertId;

    res.status(201).json({ 
        message: "Project added successfully",
        project_id: newProjectID 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", sqlMessage: err.sqlMessage });
  }
});

// PUT update project
router.put("/:project_id", verifyToken, isEmployee, async (req, res) => {
  const { project_id } = req.params;
  const { name, description, start_date, end_date, budget, tech_id } = req.body;
  try {
    await db.promise().query(
      `UPDATE projects SET name=?, description=?, start_date=?, end_date=?, budget=?, tech_id=? WHERE project_id=?`,
      [name, description, start_date, end_date || null, budget, tech_id || null, project_id]
    );
    res.json({ message: "Project updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", sqlMessage: err.sqlMessage });
  }
});

// DELETE project
router.delete("/:project_id", verifyToken, isEmployee, async (req, res) => {
  const { project_id } = req.params;
  try {
    await db.promise().query(
      `DELETE FROM projects WHERE project_id=?`,
      [project_id]
    );
    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", sqlMessage: err.sqlMessage });
  }
});

// GET projects by tech
router.get("/by-tech/:tech_id", verifyToken, async (req, res) => {
  const { tech_id } = req.params;
  try {
    const [rows] = await db.promise().query(
      `SELECT project_id, name, tech_id, start_date, end_date, budget, description FROM projects WHERE tech_id = ?`,
      [tech_id]
    );

    const formatted = rows.map(p => ({
      ...p,
      start_date: p.start_date ? p.start_date.toISOString().split("T")[0] : null,
      end_date: p.end_date ? p.end_date.toISOString().split("T")[0] : null,
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    // This is where the typo was. It is now fixed.
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET single technology
router.get("/technologies/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.promise().query(
      `SELECT * FROM technologies WHERE tech_id = ?`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching technology:", err);
    res.status(500).json({ error: "Server error", sqlMessage: err.sqlMessage });
  }
});

export default router;