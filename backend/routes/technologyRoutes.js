/* // routes/technologyRoutes.js
import express from "express";
import db from "../config/db.js";
import { verifyToken, isEmployee } from "../middleware/auth.js";
const router = express.Router();

// ✅ Get technology details (versions, specs, hw, sw)
router.get("/details/:tech_id", verifyToken, async (req, res) => {
  const { tech_id } = req.params;

  const queries = {
    versions: "SELECT * FROM versions WHERE tech_id=?",
    specs: "SELECT * FROM technology_specs WHERE tech_id=?",
    hw: "SELECT * FROM qualification_hw WHERE tech_id=?",
    sw: "SELECT * FROM qualification_sw WHERE tech_id=?",
  };

  const results = {};
  try {
    for (const key in queries) {
      const [rows] = await db.promise().query(queries[key], [tech_id]);
      results[key] = rows;
    }
    // Also fetch the main technology row
    const [techRows] = await db.promise().query("SELECT * FROM technologies WHERE tech_id=?", [tech_id]);
    if (techRows.length === 0) return res.status(404).json({ message: "Technology not found" });
    results.tech = techRows[0];
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


// Get single technology by ID
router.get("/:tech_id", async (req, res) => {
  const { tech_id } = req.params;
  
  console.log("Fetching technology with ID:", tech_id); // Debug log
  
  try {
    // Use promise() to properly await the query
    const [rows] = await db.promise().query(
      "SELECT * FROM technologies WHERE tech_id = ?", 
      [tech_id]
    );
    
    if (rows.length === 0) {
      console.log("Technology not found:", tech_id);
      return res.status(404).json({ 
        success: false,
        message: "Technology not found" 
      });
    }
    
    console.log("Technology found:", rows[0]);
    res.json({
      success: true,
      data: rows[0]
    });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: err.message 
    });
  }
});


// ✅ Get all technologies
router.get("/", verifyToken, (req, res) => {
  db.query("SELECT * FROM technologies", (err, rows) => {
    if (err) return res.status(500).json({ error: "Server error" });
    res.json(rows);
  });
});
// ✅ Add new technology (Employee only)
router.post("/", verifyToken, isEmployee, async (req, res) => {
  try {
    const {
      name, category, status, production_start_date, last_usage_date,
      budget, security_level, location, trl_start, trl_achieved,
      salient_features, achievements, tech_stack, image_path,
      dev_proj_name, dev_proj_number, dev_proj_code, funding_details
    } = req.body;

    const [result] = await db.promise().query(
      `INSERT INTO technologies (
        name, category, status, production_start_date, last_usage_date,
        budget, security_level, location, trl_start, trl_achieved,
        salient_features, achievements, tech_stack, image_path,
        dev_proj_name, dev_proj_number, dev_proj_code, funding_details
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, category, status, production_start_date || null, last_usage_date || null,
        budget || null, security_level || null, location || null, trl_start || null, trl_achieved || null,
        salient_features || null, achievements || null, tech_stack || null, image_path || null,
        dev_proj_name || null, dev_proj_number || null, dev_proj_code || null, funding_details || null
      ]
    );

    // 👇 send back the new id
    res.json({ message: "Technology added successfully", tech_id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Update technology (Employee only)
router.put("/:tech_id", verifyToken, isEmployee, async (req, res) => {
  const { tech_id } = req.params;
  const fields = Object.keys(req.body);
  const values = Object.values(req.body);
  const setStr = fields.map(f => `${f}=?`).join(", ");
  try {
    await db.promise().query(`UPDATE technologies SET ${setStr} WHERE tech_id=?`, [...values, tech_id]);
    res.json({ message: "Technology updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Delete technology (Employee only)
router.delete("/:tech_id", verifyToken, isEmployee, async (req, res) => {
  const { tech_id } = req.params;
  try {
    await db.promise().query("DELETE FROM technologies WHERE tech_id=?", [tech_id]);
    res.json({ message: "Technology deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
*/

// routes/technologyRoutes.js
import express from "express";
import db from "../config/db.js";
import { verifyToken, isEmployee } from "../middleware/auth.js";

const router = express.Router();

/**
 * GET /api/technologies/details/:tech_id
 * Returns main tech row + child tables (versions/specs/hw/sw)
 */
router.get("/details/:tech_id", verifyToken, async (req, res) => {
  const { tech_id } = req.params;

  const queries = {
    versions: "SELECT * FROM versions WHERE tech_id=?",
    specs: "SELECT * FROM technology_specs WHERE tech_id=?",
    hw: "SELECT * FROM qualification_hw WHERE tech_id=?",
    sw: "SELECT * FROM qualification_sw WHERE tech_id=?",
  };

  try {
    const results = {};
    for (const key of Object.keys(queries)) {
      const [rows] = await db.promise().query(queries[key], [tech_id]);
      results[key] = rows;
    }
    const [techRows] = await db.promise().query(
      "SELECT * FROM technologies WHERE tech_id=?",
      [tech_id]
    );
    if (techRows.length === 0) {
      return res.status(404).json({ error: "Technology not found" });
    }
    results.tech = techRows[0];
    return res.json(results);
  } catch (err) {
    console.error("GET /details/:tech_id", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * GET /api/technologies/:tech_id
 * Returns a single technology row (object directly)
 */
router.get("/:tech_id", verifyToken, async (req, res) => {
  const { tech_id } = req.params;
  try {
    const [rows] = await db.promise().query(
      "SELECT * FROM technologies WHERE tech_id=?",
      [tech_id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Technology not found" });
    }
    // Return the object directly to match frontend usage: techRes.data
    return res.json(rows[0]);
  } catch (err) {
    console.error("GET /:tech_id", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * GET /api/technologies
 * Returns all technologies
 */
router.get("/", verifyToken, async (_req, res) => {
  try {
    const [rows] = await db.promise().query("SELECT * FROM technologies");
    return res.json(rows);
  } catch (err) {
    console.error("GET /", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * POST /api/technologies
 */
router.post("/", verifyToken, isEmployee, async (req, res) => {
  try {
    const {
      name, category, status, production_start_date, last_usage_date,
      budget, security_level, location, trl_start, trl_achieved,
      salient_features, achievements, tech_stack, image_path,
      dev_proj_name, dev_proj_number, dev_proj_code, funding_details
    } = req.body;

    const [result] = await db.promise().query(
      `INSERT INTO technologies (
        name, category, status, production_start_date, last_usage_date,
        budget, security_level, location, trl_start, trl_achieved,
        salient_features, achievements, tech_stack, image_path,
        dev_proj_name, dev_proj_number, dev_proj_code, funding_details
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, category, status, production_start_date || null, last_usage_date || null,
        budget || null, security_level || null, location || null, trl_start || null, trl_achieved || null,
        salient_features || null, achievements || null, tech_stack || null, image_path || null,
        dev_proj_name || null, dev_proj_number || null, dev_proj_code || null, funding_details || null
      ]
    );

    return res.status(201).json({ tech_id: result.insertId });
  } catch (err) {
    console.error("POST /", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * PUT /api/technologies/:tech_id
 */
router.put("/:tech_id", verifyToken, isEmployee, async (req, res) => {
  const { tech_id } = req.params;
  const fields = Object.keys(req.body);
  if (fields.length === 0) return res.json({ message: "Nothing to update" });
  const setStr = fields.map(f => `${f}=?`).join(", ");
  const values = fields.map(f => req.body[f]);

  try {
    const [r] = await db.promise().query(
      `UPDATE technologies SET ${setStr} WHERE tech_id=?`,
      [...values, tech_id]
    );
    if (r.affectedRows === 0) {
      return res.status(404).json({ error: "Technology not found" });
    }
    return res.json({ success: true });
  } catch (err) {
    console.error("PUT /:tech_id", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * DELETE /api/technologies/:tech_id
 */
router.delete("/:tech_id", verifyToken, isEmployee, async (req, res) => {
  const { tech_id } = req.params;
  try {
    const [r] = await db.promise().query(
      "DELETE FROM technologies WHERE tech_id=?",
      [tech_id]
    );
    if (r.affectedRows === 0) {
      return res.status(404).json({ error: "Technology not found" });
    }
    return res.json({ success: true });
  } catch (err) {
    console.error("DELETE /:tech_id", err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
