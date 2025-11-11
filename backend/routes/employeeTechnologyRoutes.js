// routes/employeeTechnologyRoutes.js
import express from "express";
import jwt from "jsonwebtoken";
import db from "../config/db.js";

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || "yourSecretKey";

// --- auth guard (Bearer token) ---
function verifyToken(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Missing token" });
  try {
    jwt.verify(token, SECRET_KEY);
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

// --- tiny helpers ---
const runQuery = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.query(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });

const nonEmpty = (v) => (v === undefined || v === "" ? null : v);

const pick = (obj, keys) =>
  keys.reduce((acc, k) => {
    if (k in obj) acc[k] = obj[k];
    return acc;
  }, {});

// ===================== TECHNOLOGIES =====================

// GET /api/technologies
router.get("/api/technologies", verifyToken, async (req, res) => {
  try {
    const rows = await runQuery(
      `SELECT tech_id, name, category, status, trl_start, trl_achieved, trl_description,
              production_start_date, last_usage_date, budget, security_level, location,
              tech_stack, salient_features, achievements, image_path,
              dev_proj_name, dev_proj_number, dev_proj_code, funding_details
         FROM technologies
         ORDER BY tech_id DESC`
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch technologies", error: e.message });
  }
});

// POST /api/technologies
router.post("/api/technologies", verifyToken, async (req, res) => {
  try {
    const body = req.body || {};
    // sanitize/normalize
    const data = {
      name: nonEmpty(body.name),
      category: nonEmpty(body.category),
      status: nonEmpty(body.status) || "In Development",
      production_start_date: nonEmpty(body.production_start_date),
      last_usage_date: nonEmpty(body.last_usage_date),
      trl_start: body.trl_start ?? null,
      trl_achieved: body.trl_achieved ?? null,
      trl_description: nonEmpty(body.trl_description),
      budget: body.budget ?? null,
      security_level: nonEmpty(body.security_level) || "Public",
      location: nonEmpty(body.location),
      tech_stack: nonEmpty(body.tech_stack),
      salient_features: nonEmpty(body.salient_features),
      achievements: nonEmpty(body.achievements),
      image_path: nonEmpty(body.image_path),
      dev_proj_name: nonEmpty(body.dev_proj_name),
      dev_proj_number: nonEmpty(body.dev_proj_number),
      dev_proj_code: nonEmpty(body.dev_proj_code),
      funding_details: nonEmpty(body.funding_details),
    };

    const sql = `INSERT INTO technologies
      (name, category, status, production_start_date, last_usage_date,
       trl_start, trl_achieved, trl_description, budget, security_level, location,
       tech_stack, salient_features, achievements, image_path,
       dev_proj_name, dev_proj_number, dev_proj_code, funding_details)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

    const params = [
      data.name, data.category, data.status, data.production_start_date, data.last_usage_date,
      data.trl_start, data.trl_achieved, data.trl_description, data.budget, data.security_level, data.location,
      data.tech_stack, data.salient_features, data.achievements, data.image_path,
      data.dev_proj_name, data.dev_proj_number, data.dev_proj_code, data.funding_details
    ];

    const result = await runQuery(sql, params);
    res.status(201).json({ tech_id: result.insertId, ...data });
  } catch (e) {
    res.status(500).json({ message: "Failed to create technology", error: e.message });
  }
});

// PUT /api/technologies/:tech_id
router.put("/api/technologies/:tech_id", verifyToken, async (req, res) => {
  try {
    const { tech_id } = req.params;
    const allowed = [
      "name","category","status","production_start_date","last_usage_date",
      "trl_start","trl_achieved","trl_description","budget","security_level","location",
      "tech_stack","salient_features","achievements","image_path",
      "dev_proj_name","dev_proj_number","dev_proj_code","funding_details"
    ];
    const incoming = pick(req.body || {}, allowed);

    // normalize empties -> null
    Object.keys(incoming).forEach((k) => {
      const v = incoming[k];
      incoming[k] = typeof v === "string" ? nonEmpty(v.trim()) : v;
    });

    const setClause = Object.keys(incoming).map((k) => `${k}=?`).join(", ");
    if (!setClause) return res.status(400).json({ message: "No fields to update" });

    const sql = `UPDATE technologies SET ${setClause} WHERE tech_id=?`;
    await runQuery(sql, [...Object.values(incoming), tech_id]);

    res.json({ tech_id: Number(tech_id), ...incoming });
  } catch (e) {
    res.status(500).json({ message: "Failed to update technology", error: e.message });
  }
});

// DELETE /api/technologies/:tech_id
router.delete("/api/technologies/:tech_id", verifyToken, async (req, res) => {
  try {
    const { tech_id } = req.params;

    // Try delete; if you use FK with ON DELETE CASCADE, this is enough.
    // If not, you can optionally delete child rows first.
    await runQuery(`DELETE FROM technologies WHERE tech_id=?`, [tech_id]);
    res.json({ message: "Technology deleted", tech_id: Number(tech_id) });
  } catch (e) {
    res.status(500).json({
      message: "Failed to delete technology. It may be referenced by related rows.",
      error: e.message,
    });
  }
});

// GET /api/technologies/details/:tech_id  (bundle specs + hw + sw + versions)
router.get("/api/technologies/details/:tech_id", verifyToken, async (req, res) => {
  try {
    const { tech_id } = req.params;

    const [specs, hw, sw, versions] = await Promise.all([
      runQuery(`SELECT spec_id, tech_id, parameter_name, parameter_value, unit
                  FROM technology_specs WHERE tech_id=? ORDER BY spec_id DESC`, [tech_id]),
      runQuery(`SELECT hw_id, tech_id, requirement, achieved_status, date_achieved
                  FROM qualification_hw WHERE tech_id=? ORDER BY hw_id DESC`, [tech_id]),
      runQuery(`SELECT sw_id, tech_id, requirement, achieved_status, date_achieved
                  FROM qualification_sw WHERE tech_id=? ORDER BY sw_id DESC`, [tech_id]),
      runQuery(`SELECT version_id, tech_id, version_number, release_date, notes
                  FROM versions WHERE tech_id=? ORDER BY version_id DESC`, [tech_id]),
    ]);

    res.json({ specs, hw, sw, versions });
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch technology details", error: e.message });
  }
});

// ===================== SPECS =====================

// POST /api/specs
router.post("/api/specs", verifyToken, async (req, res) => {
  try {
    const b = req.body || {};
    if (!b.tech_id) return res.status(400).json({ message: "tech_id is required" });

    const name = (b.parameter_name ?? "").toString().trim();
    const value = (b.parameter_value ?? "").toString().trim();
    if (!name || !value) {
      return res.status(400).json({ message: "parameter_name and parameter_value are required" });
    }

    const sql = `INSERT INTO technology_specs (tech_id, parameter_name, parameter_value, unit)
                 VALUES (?,?,?,?)`;
    const result = await runQuery(sql, [
      b.tech_id,
      name,
      value,
      nonEmpty(b.unit),
    ]);

    res.status(201).json({
      spec_id: result.insertId,
      tech_id: Number(b.tech_id),
      parameter_name: name,
      parameter_value: value,
      unit: nonEmpty(b.unit),
    });
  } catch (e) {
    res.status(500).json({ message: "Failed to add spec", error: e.message });
  }
});

// PUT /api/specs/:spec_id
router.put("/api/specs/:spec_id", verifyToken, async (req, res) => {
  try {
    const { spec_id } = req.params;
    const allowed = ["parameter_name", "parameter_value", "unit", "tech_id"];
    const incoming = pick(req.body || {}, allowed);

    Object.keys(incoming).forEach((k) => {
      const v = incoming[k];
      incoming[k] = typeof v === "string" ? nonEmpty(v.trim()) : v;
    });

    const setClause = Object.keys(incoming).map((k) => `${k}=?`).join(", ");
    if (!setClause) return res.status(400).json({ message: "No fields to update" });

    await runQuery(`UPDATE technology_specs SET ${setClause} WHERE spec_id=?`, [
      ...Object.values(incoming),
      spec_id,
    ]);

    res.json({ spec_id: Number(spec_id), ...incoming });
  } catch (e) {
    res.status(500).json({ message: "Failed to update spec", error: e.message });
  }
});

// DELETE /api/specs/:spec_id
router.delete("/api/specs/:spec_id", verifyToken, async (req, res) => {
  try {
    const { spec_id } = req.params;
    await runQuery(`DELETE FROM technology_specs WHERE spec_id=?`, [spec_id]);
    res.json({ message: "Spec deleted", spec_id: Number(spec_id) });
  } catch (e) {
    res.status(500).json({ message: "Failed to delete spec", error: e.message });
  }
});

// (optional) GET /api/specs/by-tech/:tech_id
router.get("/api/specs/by-tech/:tech_id", verifyToken, async (req, res) => {
  try {
    const rows = await runQuery(
      `SELECT spec_id, tech_id, parameter_name, parameter_value, unit
         FROM technology_specs WHERE tech_id=? ORDER BY spec_id DESC`,
      [req.params.tech_id]
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch specs", error: e.message });
  }
});

// ===================== HARDWARE QUALIFICATIONS =====================

router.post("/api/hw", verifyToken, async (req, res) => {
  try {
    const b = req.body || {};
    if (!b.tech_id) return res.status(400).json({ message: "tech_id is required" });

    const sql = `INSERT INTO qualification_hw (tech_id, requirement, achieved_status, date_achieved)
                 VALUES (?,?,?,?)`;
    const result = await runQuery(sql, [
      b.tech_id,
      nonEmpty(b.requirement),
      nonEmpty(b.achieved_status),
      nonEmpty(b.date_achieved),
    ]);

    res.status(201).json({
      hw_id: result.insertId,
      tech_id: Number(b.tech_id),
      requirement: nonEmpty(b.requirement),
      achieved_status: nonEmpty(b.achieved_status),
      date_achieved: nonEmpty(b.date_achieved),
    });
  } catch (e) {
    res.status(500).json({ message: "Failed to add hardware qualification", error: e.message });
  }
});

router.put("/api/hw/:hw_id", verifyToken, async (req, res) => {
  try {
    const { hw_id } = req.params;
    const allowed = ["tech_id", "requirement", "achieved_status", "date_achieved"];
    const incoming = pick(req.body || {}, allowed);

    Object.keys(incoming).forEach((k) => {
      const v = incoming[k];
      incoming[k] = typeof v === "string" ? nonEmpty(v.trim()) : v;
    });

    const setClause = Object.keys(incoming).map((k) => `${k}=?`).join(", ");
    if (!setClause) return res.status(400).json({ message: "No fields to update" });

    await runQuery(`UPDATE qualification_hw SET ${setClause} WHERE hw_id=?`, [
      ...Object.values(incoming),
      hw_id,
    ]);

    res.json({ hw_id: Number(hw_id), ...incoming });
  } catch (e) {
    res.status(500).json({ message: "Failed to update hardware qualification", error: e.message });
  }
});

router.delete("/api/hw/:hw_id", verifyToken, async (req, res) => {
  try {
    const { hw_id } = req.params;
    await runQuery(`DELETE FROM qualification_hw WHERE hw_id=?`, [hw_id]);
    res.json({ message: "Hardware qualification deleted", hw_id: Number(hw_id) });
  } catch (e) {
    res.status(500).json({ message: "Failed to delete hardware qualification", error: e.message });
  }
});

router.get("/api/hw/by-tech/:tech_id", verifyToken, async (req, res) => {
  try {
    const rows = await runQuery(
      `SELECT hw_id, tech_id, requirement, achieved_status, date_achieved
         FROM qualification_hw WHERE tech_id=? ORDER BY hw_id DESC`,
      [req.params.tech_id]
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch hardware qualifications", error: e.message });
  }
});

// ===================== SOFTWARE QUALIFICATIONS =====================

router.post("/api/sw", verifyToken, async (req, res) => {
  try {
    const b = req.body || {};
    if (!b.tech_id) return res.status(400).json({ message: "tech_id is required" });

    const sql = `INSERT INTO qualification_sw (tech_id, requirement, achieved_status, date_achieved)
                 VALUES (?,?,?,?)`;
    const result = await runQuery(sql, [
      b.tech_id,
      nonEmpty(b.requirement),
      nonEmpty(b.achieved_status),
      nonEmpty(b.date_achieved),
    ]);

    res.status(201).json({
      sw_id: result.insertId,
      tech_id: Number(b.tech_id),
      requirement: nonEmpty(b.requirement),
      achieved_status: nonEmpty(b.achieved_status),
      date_achieved: nonEmpty(b.date_achieved),
    });
  } catch (e) {
    res.status(500).json({ message: "Failed to add software qualification", error: e.message });
  }
});

router.put("/api/sw/:sw_id", verifyToken, async (req, res) => {
  try {
    const { sw_id } = req.params;
    const allowed = ["tech_id", "requirement", "achieved_status", "date_achieved"];
    const incoming = pick(req.body || {}, allowed);

    Object.keys(incoming).forEach((k) => {
      const v = incoming[k];
      incoming[k] = typeof v === "string" ? nonEmpty(v.trim()) : v;
    });

    const setClause = Object.keys(incoming).map((k) => `${k}=?`).join(", ");
    if (!setClause) return res.status(400).json({ message: "No fields to update" });

    await runQuery(`UPDATE qualification_sw SET ${setClause} WHERE sw_id=?`, [
      ...Object.values(incoming),
      sw_id,
    ]);

    res.json({ sw_id: Number(sw_id), ...incoming });
  } catch (e) {
    res.status(500).json({ message: "Failed to update software qualification", error: e.message });
  }
});

router.delete("/api/sw/:sw_id", verifyToken, async (req, res) => {
  try {
    const { sw_id } = req.params;
    await runQuery(`DELETE FROM qualification_sw WHERE sw_id=?`, [sw_id]);
    res.json({ message: "Software qualification deleted", sw_id: Number(sw_id) });
  } catch (e) {
    res.status(500).json({ message: "Failed to delete software qualification", error: e.message });
  }
});

router.get("/api/sw/by-tech/:tech_id", verifyToken, async (req, res) => {
  try {
    const rows = await runQuery(
      `SELECT sw_id, tech_id, requirement, achieved_status, date_achieved
         FROM qualification_sw WHERE tech_id=? ORDER BY sw_id DESC`,
      [req.params.tech_id]
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch software qualifications", error: e.message });
  }
});

// ===================== VERSIONS =====================

router.post("/api/versions", verifyToken, async (req, res) => {
  try {
    const b = req.body || {};
    if (!b.tech_id) return res.status(400).json({ message: "tech_id is required" });

    const sql = `INSERT INTO versions (tech_id, version_number, release_date, notes)
                 VALUES (?,?,?,?)`;
    const result = await runQuery(sql, [
      b.tech_id,
      nonEmpty(b.version_number),
      nonEmpty(b.release_date),
      nonEmpty(b.notes),
    ]);

    res.status(201).json({
      version_id: result.insertId,
      tech_id: Number(b.tech_id),
      version_number: nonEmpty(b.version_number),
      release_date: nonEmpty(b.release_date),
      notes: nonEmpty(b.notes),
    });
  } catch (e) {
    res.status(500).json({ message: "Failed to add version", error: e.message });
  }
});

router.put("/api/versions/:version_id", verifyToken, async (req, res) => {
  try {
    const { version_id } = req.params;
    const allowed = ["tech_id", "version_number", "release_date", "notes"];
    const incoming = pick(req.body || {}, allowed);

    Object.keys(incoming).forEach((k) => {
      const v = incoming[k];
      incoming[k] = typeof v === "string" ? nonEmpty(v.trim()) : v;
    });

    const setClause = Object.keys(incoming).map((k) => `${k}=?`).join(", ");
    if (!setClause) return res.status(400).json({ message: "No fields to update" });

    await runQuery(`UPDATE versions SET ${setClause} WHERE version_id=?`, [
      ...Object.values(incoming),
      version_id,
    ]);

    res.json({ version_id: Number(version_id), ...incoming });
  } catch (e) {
    res.status(500).json({ message: "Failed to update version", error: e.message });
  }
});

router.delete("/api/versions/:version_id", verifyToken, async (req, res) => {
  try {
    const { version_id } = req.params;
    await runQuery(`DELETE FROM versions WHERE version_id=?`, [version_id]);
    res.json({ message: "Version deleted", version_id: Number(version_id) });
  } catch (e) {
    res.status(500).json({ message: "Failed to delete version", error: e.message });
  }
});

router.get("/api/versions/by-tech/:tech_id", verifyToken, async (req, res) => {
  try {
    const rows = await runQuery(
      `SELECT version_id, tech_id, version_number, release_date, notes
         FROM versions WHERE tech_id=? ORDER BY version_id DESC`,
      [req.params.tech_id]
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch versions", error: e.message });
  }
});

export default router;
