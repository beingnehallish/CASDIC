import express from "express";
import db from "../config/db.js";
import { verifyToken, isEmployee } from "../middleware/auth.js";

const router = express.Router();

// GET all publications
router.get("/", verifyToken, async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      `SELECT pub_id, tech_id, title, authors, journal, year, link
       FROM publications`
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching publications:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST new publication (employee only)
router.post("/", verifyToken, isEmployee, async (req, res) => {
  const { tech_id, title, authors, journal, year, link } = req.body;
  try {
    await db.promise().query(
      `INSERT INTO publications (tech_id, title, authors, journal, year, link)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [tech_id || null, title, authors, journal, year, link || null]
    );
    res.json({ message: "Publication added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT update publication
router.put("/:pub_id", verifyToken, isEmployee, async (req, res) => {
  const { pub_id } = req.params;
  const { tech_id, title, authors, journal, year, link } = req.body;
  try {
    await db.promise().query(
      `UPDATE publications 
       SET tech_id=?, title=?, authors=?, journal=?, year=?, link=?
       WHERE pub_id=?`,
      [tech_id || null, title, authors, journal, year, link || null, pub_id]
    );
    res.json({ message: "Publication updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE publication
router.delete("/:pub_id", verifyToken, isEmployee, async (req, res) => {
  const { pub_id } = req.params;
  try {
    await db.promise().query(
      `DELETE FROM publications WHERE pub_id=?`,
      [pub_id]
    );
    res.json({ message: "Publication deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET publications by tech
router.get("/by-tech/:tech_id", verifyToken, async (req, res) => {
  const { tech_id } = req.params;
  try {
    const [rows] = await db.promise().query(
      `SELECT pub_id, tech_id, title, authors, journal, year, link
       FROM publications
       WHERE tech_id = ?`,
      [tech_id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET single technology
router.get("/technologies/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.promise().query(
      "SELECT * FROM technologies WHERE tech_id = ?",
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching technology:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
