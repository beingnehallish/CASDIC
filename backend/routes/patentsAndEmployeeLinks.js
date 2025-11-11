// routes/patentsAndEmployeeLinks.js
import express from "express";
import db from "../config/db.js";
import { verifyToken, isEmployee } from "../middleware/auth.js";

const router = express.Router();

/* ----------------------- helpers ----------------------- */
function compactPatent(row) {
  return {
    patent_id: row.patent_id,
    title: row.title,
    patent_number: row.patent_number,
    tech_id: row.tech_id ?? null,
    date_filed: row.date_filed,
    date_granted: row.date_granted,
  };
}

/* ----------------------- PATENTS CRUD ----------------------- */
// POST /api/patents  -> { patent_id }
router.post("/patents", verifyToken, isEmployee, async (req, res) => {
  try {
    const { title, patent_number, date_filed, date_granted, tech_id } = req.body || {};
    if (!title || !patent_number) {
      return res.status(400).json({ error: "title and patent_number are required" });
    }

    const [result] = await db.promise().query(
      `INSERT INTO patents (title, patent_number, date_filed, date_granted, tech_id)
       VALUES (?, ?, ?, ?, ?)`,
      [title, patent_number, date_filed || null, date_granted || null, tech_id || null]
    );

    return res.status(201).json({ patent_id: result.insertId });
  } catch (err) {
    console.error("POST /api/patents", err?.sqlMessage || err);
    return res.status(500).json({ error: err?.sqlMessage || "Failed to create patent" });
  }
});

// GET /api/patents
router.get("/patents", verifyToken, async (_req, res) => {
  try {
    const [rows] = await db.promise().query(
      `SELECT patent_id, tech_id, title, patent_number, date_filed, date_granted
         FROM patents
        ORDER BY patent_id DESC`
    );
    return res.json(rows);
  } catch (err) {
    console.error("GET /api/patents", err?.sqlMessage || err);
    return res.status(500).json({ error: "Failed to fetch patents" });
  }
});

// PUT /api/patents/:id
router.put("/patents/:id", verifyToken, isEmployee, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, patent_number, date_filed, date_granted, tech_id } = req.body || {};

    const [r] = await db.promise().query(
      `UPDATE patents
          SET title=?, patent_number=?, date_filed=?, date_granted=?, tech_id=?
        WHERE patent_id=?`,
      [title || null, patent_number || null, date_filed || null, date_granted || null, tech_id || null, id]
    );

    if (r.affectedRows === 0) return res.status(404).json({ error: "Patent not found" });
    return res.json({ success: true });
  } catch (err) {
    console.error("PUT /api/patents/:id", err?.sqlMessage || err);
    return res.status(500).json({ error: err?.sqlMessage || "Failed to update patent" });
  }
});

// DELETE /api/patents/:id
router.delete("/patents/:id", verifyToken, isEmployee, async (req, res) => {
  try {
    const { id } = req.params;
    const [r] = await db.promise().query(`DELETE FROM patents WHERE patent_id=?`, [id]);
    if (r.affectedRows === 0) return res.status(404).json({ error: "Patent not found" });
    return res.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/patents/:id", err?.sqlMessage || err);
    return res.status(500).json({ error: "Failed to delete patent" });
  }
});

/* -------------- EMPLOYEE ↔ PATENT LINKS (M2M) -------------- */
// POST /api/employee_patents  -> { id, employee_id, patent_id, role, created:true }
router.post("/employee_patents", verifyToken, isEmployee, async (req, res) => {
  try {
    const { employee_id, patent_id, role } = req.body || {};
    if (!employee_id || !patent_id) {
      return res.status(400).json({ error: "employee_id and patent_id are required" });
    }

    const [r] = await db.promise().query(
      `INSERT INTO employee_patents (employee_id, patent_id, role) VALUES (?, ?, ?)`,
      [employee_id, patent_id, role || null]
    );

    return res
      .status(201)
      .json({ id: r.insertId, employee_id, patent_id, role: role || null, created: true });
  } catch (err) {
    console.error("POST /api/employee_patents", err?.sqlMessage || err);
    return res.status(500).json({ error: err?.sqlMessage || "Failed to link employee to patent" });
  }
});

// GET /api/employee_patents/patent/:patent_id  -> linked inventors
router.get("/employee_patents/patent/:patent_id", verifyToken, async (req, res) => {
  try {
    const { patent_id } = req.params;
    const [rows] = await db.promise().query(
      `SELECT ep.id, e.employee_id, e.name, e.department, ep.role
         FROM employee_patents ep
         JOIN employees e ON e.employee_id = ep.employee_id
        WHERE ep.patent_id = ?
        ORDER BY e.name`,
      [patent_id]
    );
    return res.json(rows);
  } catch (err) {
    console.error("GET inventors", err?.sqlMessage || err);
    return res.status(500).json({ error: "Failed to fetch inventors" });
  }
});

// PUT /api/employee_patents/:id  -> update role
router.put("/employee_patents/:id", verifyToken, isEmployee, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body || {};
    const [r] = await db.promise().query(`UPDATE employee_patents SET role=? WHERE id=?`, [
      role || null,
      id,
    ]);
    if (r.affectedRows === 0) return res.status(404).json({ error: "Link not found" });
    return res.json({ id: Number(id), role: role || null });
  } catch (err) {
    console.error("PUT /api/employee_patents/:id", err?.sqlMessage || err);
    return res.status(500).json({ error: "Failed to update role" });
  }
});

// DELETE /api/employee_patents/:id
router.delete("/employee_patents/:id", verifyToken, isEmployee, async (req, res) => {
  try {
    const { id } = req.params;
    const [r] = await db.promise().query(`DELETE FROM employee_patents WHERE id=?`, [id]);
    if (r.affectedRows === 0) return res.status(404).json({ error: "Link not found" });
    return res.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/employee_patents/:id", err?.sqlMessage || err);
    return res.status(500).json({ error: "Failed to unlink employee from patent" });
  }
});

/* ----------------------- ANALYTICS ----------------------- */
/**
 * GET /api/patents/analytics
 * -> { filed:[{year,label,count,patents:[...] }], granted:[...] }
 */
router.get("/patents/analytics", verifyToken, async (_req, res) => {
  try {
    const [rows] = await db
      .promise()
      .query(
        `SELECT patent_id, title, patent_number, tech_id, date_filed, date_granted FROM patents`
      );

    const filed = {};
    const granted = {};

    for (const r of rows) {
      if (r.date_filed) {
        const y = new Date(r.date_filed).getFullYear().toString();
        if (!filed[y]) filed[y] = { count: 0, patents: [] };
        filed[y].count++;
        filed[y].patents.push(compactPatent(r));
      }
      if (r.date_granted) {
        const y = new Date(r.date_granted).getFullYear().toString();
        if (!granted[y]) granted[y] = { count: 0, patents: [] };
        granted[y].count++;
        granted[y].patents.push(compactPatent(r));
      }
    }

    const filedArr = Object.entries(filed)
      .map(([year, obj]) => ({ year, label: `Filed ${year}`, count: obj.count, patents: obj.patents }))
      .sort((a, b) => a.year.localeCompare(b.year));

    const grantedArr = Object.entries(granted)
      .map(([year, obj]) => ({
        year,
        label: `Granted ${year}`,
        count: obj.count,
        patents: obj.patents,
      }))
      .sort((a, b) => a.year.localeCompare(b.year));

    res.json({ filed: filedArr, granted: grantedArr });
  } catch (err) {
    console.error("GET /patents/analytics", err?.sqlMessage || err);
    res.status(500).json({ error: "Failed to build analytics" });
  }
});

/**
 * GET /api/patents/analytics/filed
 * -> [{ year, label, count, patents:[...] }]
 */
router.get("/patents/analytics/filed", verifyToken, async (_req, res) => {
  try {
    const [rows] = await db
      .promise()
      .query(
        `SELECT patent_id, title, patent_number, tech_id, date_filed, date_granted
           FROM patents
          WHERE date_filed IS NOT NULL`
      );

    const buckets = {};
    for (const r of rows) {
      const y = new Date(r.date_filed).getFullYear().toString();
      if (!buckets[y]) buckets[y] = { count: 0, patents: [] };
      buckets[y].count++;
      buckets[y].patents.push(compactPatent(r));
    }

    const out = Object.entries(buckets)
      .map(([year, obj]) => ({ year, label: `Filed ${year}`, count: obj.count, patents: obj.patents }))
      .sort((a, b) => a.year.localeCompare(b.year));

    res.json(out);
  } catch (err) {
    console.error("GET /patents/analytics/filed", err?.sqlMessage || err);
    res.status(500).json({ error: "Failed to build filed analytics" });
  }
});

/**
 * GET /api/patents/analytics/granted
 * -> [{ year, label, count, patents:[...] }]
 */
router.get("/patents/analytics/granted", verifyToken, async (_req, res) => {
  try {
    const [rows] = await db
      .promise()
      .query(
        `SELECT patent_id, title, patent_number, tech_id, date_filed, date_granted
           FROM patents
          WHERE date_granted IS NOT NULL`
      );

    const buckets = {};
    for (const r of rows) {
      const y = new Date(r.date_granted).getFullYear().toString();
      if (!buckets[y]) buckets[y] = { count: 0, patents: [] };
      buckets[y].count++;
      buckets[y].patents.push(compactPatent(r));
    }

    const out = Object.entries(buckets)
      .map(([year, obj]) => ({
        year,
        label: `Granted ${year}`,
        count: obj.count,
        patents: obj.patents,
      }))
      .sort((a, b) => a.year.localeCompare(b.year));

    res.json(out);
  } catch (err) {
    console.error("GET /patents/analytics/granted", err?.sqlMessage || err);
    res.status(500).json({ error: "Failed to build granted analytics" });
  }
});

export default router;
