// routes/techDetailsRoutes.js
import express from "express";
import db from "../config/db.js";
import { verifyToken, isEmployee } from "../middleware/auth.js";

const mkRouter = ({ table, idCol }) => {
  const r = express.Router();

  // GET all by tech
  r.get("/by-tech/:tech_id", verifyToken, async (req, res) => {
    const { tech_id } = req.params;
    try {
      const [rows] = await db.promise().query(
        `SELECT * FROM ${table} WHERE tech_id=?`,
        [tech_id]
      );
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  // CREATE
  r.post("/", verifyToken, isEmployee, async (req, res) => {
    try {
      const cols = Object.keys(req.body);
      const vals = Object.values(req.body);
      if (!cols.includes("tech_id")) return res.status(400).json({ error: "tech_id required" });
      const placeholders = cols.map(() => "?").join(",");
      await db.promise().query(
        `INSERT INTO ${table} (${cols.join(",")}) VALUES (${placeholders})`,
        vals
      );
      res.json({ message: "Created successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  // UPDATE
  r.put(`/:${idCol}`, verifyToken, isEmployee, async (req, res) => {
    try {
      const id = req.params[idCol];
      const fields = Object.keys(req.body);
      const values = Object.values(req.body);
      if (!fields.length) return res.status(400).json({ error: "No fields" });
      const setStr = fields.map(f => `${f}=?`).join(", ");
      await db.promise().query(
        `UPDATE ${table} SET ${setStr} WHERE ${idCol}=?`,
        [...values, id]
      );
      res.json({ message: "Updated successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  // DELETE
  r.delete(`/:${idCol}`, verifyToken, isEmployee, async (req, res) => {
    try {
      const id = req.params[idCol];
      await db.promise().query(
        `DELETE FROM ${table} WHERE ${idCol}=?`,
        [id]
      );
      res.json({ message: "Deleted successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  return r;
};

// Build the four routers
export const specsRouter   = mkRouter({ table: "technology_specs", idCol: "spec_id" });
export const hwRouter      = mkRouter({ table: "qualification_hw",  idCol: "hw_id"   });
export const swRouter      = mkRouter({ table: "qualification_sw",  idCol: "sw_id"   });
export const versionsRouter= mkRouter({ table: "versions",          idCol: "version_id" });
