import express from "express";
import db from "../config/db.js";
import { verifyToken, isEmployee } from "../middleware/auth.js";

const router = express.Router();

// POST link employee to publication
router.post("/", verifyToken, isEmployee, async (req, res) => {
  const { employee_id, pub_id, role } = req.body;
  try {
    await db.promise().query(
      `INSERT INTO employee_publications (employee_id, pub_id, role) VALUES (?, ?, ?)`,
      [employee_id, pub_id, role || null]
    );
    res.json({ message: "Employee linked to publication successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
