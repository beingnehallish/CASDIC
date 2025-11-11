import express from "express";
import db from "../config/db.js";
import { verifyToken, isEmployee } from "../middleware/auth.js";

const router = express.Router();

// POST link employee to project
router.post("/", verifyToken, isEmployee, async (req, res) => {
  const { employee_id, project_id, role } = req.body;
  try {
    await db.promise().query(
      `INSERT INTO employee_projects (employee_id, project_id, role) VALUES (?, ?, ?)`,
      [employee_id, project_id, role || null]
    );
    res.json({ message: "Employee linked to project successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * GET  /api/employee_projects/project/:project_id/team
 * -> [{ id, employee_id, employee_name, department, role }]
 */
router.get("/project/:project_id/team", /*auth,*/ async (req, res) => {
  const { project_id } = req.params;
  if (!project_id) return res.status(400).json({ error: "project_id is required" });

  try {
    const [rows] = await db.execute(
      `
      SELECT
        ep.id,
        ep.employee_id,
        e.name AS employee_name,
        e.department,
        ep.role
      FROM employee_projects ep
      JOIN employees e ON e.employee_id = ep.employee_id
      WHERE ep.project_id = ?
      ORDER BY e.name
      `,
      [project_id]
    );
    res.json(rows);
  } catch (err) {
    console.error("GET /project/:project_id/team error:", err);
    res.status(500).json({ error: "Failed to fetch project team" });
  }
});

/**
 * POST /api/employee_projects
 * body: { employee_id, project_id, role }
 */
router.post("/", /*auth,*/ async (req, res) => {
  const { employee_id, project_id, role } = req.body || {};
  if (!employee_id || !project_id) {
    return res.status(400).json({ error: "employee_id and project_id are required" });
  }

  try {
    // dedupe if existing
    const [existing] = await db.execute(
      "SELECT id, role FROM employee_projects WHERE employee_id=? AND project_id=? LIMIT 1",
      [employee_id, project_id]
    );

    if (existing.length) {
      if (role != null && role !== existing[0].role) {
        await db.execute("UPDATE employee_projects SET role=? WHERE id=?", [role, existing[0].id]);
        return res.status(200).json({
          id: existing[0].id,
          employee_id,
          project_id,
          role,
          updated: true,
          existed: true,
        });
      }
      return res.status(200).json({
        id: existing[0].id,
        employee_id,
        project_id,
        role: existing[0].role,
        existed: true,
      });
    }

    const [result] = await db.execute(
      "INSERT INTO employee_projects (employee_id, project_id, role) VALUES (?,?,?)",
      [employee_id, project_id, role ?? null]
    );

    res.status(201).json({
      id: result.insertId,
      employee_id,
      project_id,
      role: role ?? null,
      created: true,
    });
  } catch (err) {
    console.error("POST /employee_projects error:", err);
    res.status(500).json({ error: "Failed to link employee to project" });
  }
});

/**
 * PUT /api/employee_projects/:id   (update role)
 */
router.put("/:id", /*auth,*/ async (req, res) => {
  const { id } = req.params;
  const { role } = req.body || {};
  if (!id) return res.status(400).json({ error: "id is required" });

  try {
    const [result] = await db.execute(
      "UPDATE employee_projects SET role=? WHERE id=?",
      [role ?? null, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: "Link not found" });
    res.json({ id: Number(id), role: role ?? null });
  } catch (err) {
    console.error("PUT /employee_projects/:id error:", err);
    res.status(500).json({ error: "Failed to update role" });
  }
});

/**
 * DELETE /api/employee_projects/:id
 */
router.delete("/:id", /*auth,*/ async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: "id is required" });

  try {
    const [result] = await db.execute("DELETE FROM employee_projects WHERE id=?", [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Link not found" });
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /employee_projects/:id error:", err);
    res.status(500).json({ error: "Failed to unlink employee from project" });
  }
});

/**
 * OPTIONAL:
 * GET /api/employee_projects/employee/:employee_id/projects
 */
router.get("/employee/:employee_id/projects", /*auth,*/ async (req, res) => {
  const { employee_id } = req.params;
  if (!employee_id) return res.status(400).json({ error: "employee_id is required" });

  try {
    const [rows] = await db.execute(
      `
      SELECT
        p.project_id,
        p.name,
        p.start_date,
        p.end_date,
        p.budget,
        ep.id   AS link_id,
        ep.role AS role
      FROM employee_projects ep
      JOIN projects p ON p.project_id = ep.project_id
      WHERE ep.employee_id = ?
      ORDER BY p.start_date DESC
      `,
      [employee_id]
    );
    res.json(rows);
  } catch (err) {
    console.error("GET /employee/:employee_id/projects error:", err);
    res.status(500).json({ error: "Failed to fetch employee projects" });
  }
});

export default router;
