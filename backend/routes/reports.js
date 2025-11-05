// routes/reports.js
import express from "express";
const router = express.Router();
import db from "../config/db.js"; // your mysql pool or connection

// helper to run queries (callback -> Promise)
const queryAsync = (sql, values = []) =>
  new Promise((resolve, reject) => {
    db.query(sql, values, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });

/**
 * GET /api/reports
 * Query params:
 *  - category: one of technologies, projects, companies, patents, publications, employees (required)
 *  - keyword, status, tech_id, type, country, designation, start_date, end_date, date_filed_from, date_filed_to, date_granted_from, date_granted_to,
 *  - trl_min, trl_max, budget_min, budget_max, tech_stack
 *  - page, limit, sort_by, sort_order
 */
router.get("/", async (req, res) => {
  try {
    const {
      category,
      keyword,
      status,
      tech_id,
      type,
      country,
      designation,
      start_date,
      end_date,
      date_filed_from,
      date_filed_to,
      date_granted_from,
      date_granted_to,
      trl_min,
      trl_max,
      budget_min,
      budget_max,
      tech_stack,
      page = 1,
      limit = 50,
      sort_by,
      sort_order = "ASC",
    } = req.query;

    const allowed = ["technologies", "projects", "companies", "patents", "publications", "employees"];
    if (!allowed.includes(category)) return res.status(400).json({ error: "Invalid category" });

    const table = category;
    let sql = `SELECT * FROM \`${table}\``;
    const where = [];
    const vals = [];

    // keyword search columns per table
    const keywordCols = {
      technologies: ["name", "trl_description", "salient_features", "achievements", "tech_stack"],
      projects: ["name", "description"],
      companies: ["name", "notes", "address"],
      patents: ["title", "patent_number"],
      publications: ["title", "authors", "journal"],
      employees: ["name", "designation", "department", "email"]
    }[table];

    if (keyword && keywordCols && keywordCols.length) {
      const like = keywordCols.map((c) => `${c} LIKE ?`).join(" OR ");
      where.push(`(${like})`);
      for (let i = 0; i < keywordCols.length; i++) vals.push(`%${keyword}%`);
    }

    if (status) {
      // status exists on technologies and employees; projects may not
      where.push(`status = ?`);
      vals.push(status);
    }

    if (tech_id && ["patents", "publications", "projects", "technologies"].includes(table)) {
      where.push(`tech_id = ?`);
      vals.push(tech_id);
    }

    if (type && table === "companies") {
      where.push(`type = ?`);
      vals.push(type);
    }

    if (country && ["companies", "technologies", "employees"].includes(table)) {
      where.push(`country = ?`);
      vals.push(country);
    }

    if (designation && table === "employees") {
      where.push(`designation = ?`);
      vals.push(designation);
    }

    // Technologies-specific numeric/range filters
    if ((trl_min || trl_max) && table === "technologies") {
      if (trl_min) { where.push(`trl_achieved >= ?`); vals.push(trl_min); }
      if (trl_max) { where.push(`trl_achieved <= ?`); vals.push(trl_max); }
    }
    if ((budget_min || budget_max) && table === "technologies") {
      if (budget_min) { where.push(`budget >= ?`); vals.push(budget_min); }
      if (budget_max) { where.push(`budget <= ?`); vals.push(budget_max); }
    }
    if (tech_stack && table === "technologies") {
      where.push(`tech_stack LIKE ?`);
      vals.push(`%${tech_stack}%`);
    }
    // Production date range for technologies
    if (start_date && table === "technologies") {
      where.push(`production_start_date >= ?`);
      vals.push(start_date);
    }
    if (end_date && table === "technologies") {
      where.push(`last_usage_date <= ?`);
      vals.push(end_date);
    }

    // Projects date range
    if (start_date && table === "projects") {
      where.push(`start_date >= ?`);
      vals.push(start_date);
    }
    if (end_date && table === "projects") {
      where.push(`end_date <= ?`);
      vals.push(end_date);
    }

    // Patents date ranges
    if (date_filed_from && table === "patents") { where.push(`date_filed >= ?`); vals.push(date_filed_from); }
    if (date_filed_to && table === "patents") { where.push(`date_filed <= ?`); vals.push(date_filed_to); }
    if (date_granted_from && table === "patents") { where.push(`date_granted >= ?`); vals.push(date_granted_from); }
    if (date_granted_to && table === "patents") { where.push(`date_granted <= ?`); vals.push(date_granted_to); }

    // Publications: year exact or range (year_from/year_to)
    if (req.query.year) {
      where.push(`year = ?`);
      vals.push(req.query.year);
    }
    if (req.query.year_from && table === "publications") { where.push(`year >= ?`); vals.push(req.query.year_from); }
    if (req.query.year_to && table === "publications") { where.push(`year <= ?`); vals.push(req.query.year_to); }

    // apply where
    if (where.length) sql += " WHERE " + where.join(" AND ");

    // sorting
    if (sort_by) {
      // basic guard: allow only letters, underscores, numbers (prevent injection)
      const safeCol = sort_by.replace(/[^a-zA-Z0-9_]/g, "");
      sql += ` ORDER BY ${safeCol} ${sort_order === "DESC" ? "DESC" : "ASC"}`;
    }

    // pagination
    const lim = Number(limit) || 50;
    const off = (Number(page) - 1) * lim;
    sql += " LIMIT ? OFFSET ?";
    vals.push(lim, off);

    // run query
    const rows = await queryAsync(sql, vals);

    // Optionally return total count (for pagination UI) - run a count with same WHERE (without LIMIT)
    let total = null;
    try {
      const countSqlBase = `SELECT COUNT(*) as cnt FROM \`${table}\`` + (where.length ? " WHERE " + where.join(" AND ") : "");
      // build count vals = vals without last 2 (limit, offset)
      const countVals = vals.slice(0, Math.max(0, vals.length - 2));
      const countRes = await queryAsync(countSqlBase, countVals);
      total = countRes?.[0]?.cnt ?? null;
    } catch (errCount) {
      // ignore if count fails (not critical)
      total = null;
    }

    return res.json({ data: rows, page: Number(page), limit: lim, total });
  } catch (err) {
    console.error("reports route error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
