import express from "express";
import db from "../config/db.js";
import { verifyToken, isEmployee } from "../middleware/auth.js";

const router = express.Router();

// GET all patents
router.get("/", verifyToken, async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      "SELECT * FROM patents"
    );

    const formatted = rows.map(p => ({
      ...p,
      date_filed: p.date_filed ? p.date_filed.toISOString().split("T")[0] : null,
      date_granted: p.date_granted ? p.date_granted.toISOString().split("T")[0] : null,
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET single patent by ID
router.get("/:patent_id", verifyToken, async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      "SELECT * FROM patents WHERE patent_id = ?",
      [req.params.patent_id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST new patent (employee only)
router.post("/", verifyToken, isEmployee, async (req, res) => {
  const { tech_id, title, patent_number, date_filed, date_granted } = req.body;
  try {
    await db.promise().query(
      "INSERT INTO patents (tech_id, title, patent_number, date_filed, date_granted) VALUES (?, ?, ?, ?, ?)",
      [tech_id, title, patent_number, date_filed || null, date_granted || null]
    );
    res.json({ message: "Patent added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT update patent (employee only)
router.put("/:patent_id", verifyToken, isEmployee, async (req, res) => {
  const { tech_id, title, patent_number, date_filed, date_granted } = req.body;
  try {
    await db.promise().query(
      "UPDATE patents SET tech_id=?, title=?, patent_number=?, date_filed=?, date_granted=? WHERE patent_id=?",
      [tech_id, title, patent_number, date_filed || null, date_granted || null, req.params.patent_id]
    );
    res.json({ message: "Patent updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE patent (employee only)
router.delete("/:patent_id", verifyToken, isEmployee, async (req, res) => {
  try {
    await db.promise().query(
      "DELETE FROM patents WHERE patent_id=?",
      [req.params.patent_id]
    );
    res.json({ message: "Patent deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
