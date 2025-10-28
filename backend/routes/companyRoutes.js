import express from "express";
import db from "../config/db.js";

const router = express.Router();

// GET all companies
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.promise().query("SELECT * FROM companies");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch companies" });
  }
});

// GET single company
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      "SELECT * FROM companies WHERE company_id = ?",
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Company not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch company" });
  }
});

// POST new company
router.post("/", async (req, res) => {
  const {
    name, country, type, role, contact_person,
    contact_email, contact_phone, website, address, notes
  } = req.body;

  try {
    const [result] = await db.promise().query(
      `INSERT INTO companies
      (name,country,type,role,contact_person,contact_email,contact_phone,website,address,notes)
      VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [name, country, type, role, contact_person, contact_email, contact_phone, website, address, notes]
    );
    res.json({ success: true, company_id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add company" });
  }
});

// PUT update company
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    name, country, type, role, contact_person,
    contact_email, contact_phone, website, address, notes
  } = req.body;

  try {
    await db.promise().query(
      `UPDATE companies SET
      name=?, country=?, type=?, role=?, 
      contact_person=?, contact_email=?, contact_phone=?,
      website=?, address=?, notes=?, updated_at=NOW()
      WHERE company_id=?`,
      [name, country, type, role, contact_person, contact_email, contact_phone, website, address, notes, id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update company" });
  }
});

// DELETE company
router.delete("/:id", async (req, res) => {
  try {
    await db.promise().query("DELETE FROM companies WHERE company_id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete company" });
  }
});

export default router;
