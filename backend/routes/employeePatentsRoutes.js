import express from "express";
import db from "../config/db.js";
import { verifyToken, isEmployee } from "../middleware/auth.js";

const router = express.Router();

// POST link employee to patent
router.post("/", verifyToken, isEmployee, async (req, res) => {
  const { employee_id, patent_id, role } = req.body;
  try {
    await db.promise().query(
      `INSERT INTO employee_patents (employee_id, patent_id, role) VALUES (?, ?, ?)`,
      [employee_id, patent_id, role || null]
    );
    res.json({ message: "Employee linked to patent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
