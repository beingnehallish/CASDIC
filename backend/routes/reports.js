import express from "express";
const router = express.Router();
import db from "../config/db.js"; // callback-style pool

// Utility: convert callback pool to promise pool
const queryAsync = (sql, values) =>
  new Promise((resolve, reject) => {
    db.query(sql, values, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });

// GET /api/reports
router.get("/", async (req, res) => {
  try {
    const {
      category,
      status,
      trl_min,
      trl_max,
      budget_min,
      budget_max,
      tech_stack,
      start_date,
      end_date,
      country,
      keyword,
      sort_by,
      sort_order = "ASC",
      page = 1,
      limit = 10,
      watchlist_only,
    } = req.query;

    // Determine table based on category/type
    let tableName;
    switch (category) {
      case "technologies":
        tableName = "technologies";
        break;
      case "projects":
        tableName = "projects";
        break;
      case "patents":
        tableName = "patents";
        break;
      case "publications":
        tableName = "publications";
        break;
      case "versions":
        tableName = "versions";
        break;
      default:
        tableName = "technologies";
    }

    let query = `SELECT * FROM ${tableName}`;
    const whereClauses = [];
    const values = [];

    // Filters
    if (status) {
      if (tableName === "technologies") whereClauses.push(`status = ?`);
      else if (tableName === "projects" || tableName === "patents")
        whereClauses.push(`status = ?`);
      else if (tableName === "versions") whereClauses.push(`version_number IS NOT NULL`);
      values.push(status);
    }

    if (trl_min && tableName === "technologies") {
      whereClauses.push(`trl_achieved >= ?`);
      values.push(trl_min);
    }
    if (trl_max && tableName === "technologies") {
      whereClauses.push(`trl_achieved <= ?`);
      values.push(trl_max);
    }
    if (budget_min && tableName === "technologies") {
      whereClauses.push(`budget >= ?`);
      values.push(budget_min);
    }
    if (budget_max && tableName === "technologies") {
      whereClauses.push(`budget <= ?`);
      values.push(budget_max);
    }
    if (tech_stack && tableName === "technologies") {
      whereClauses.push(`tech_stack LIKE ?`);
      values.push(`%${tech_stack}%`);
    }
    if (country && (tableName === "technologies" || tableName === "companies")) {
      whereClauses.push(`country = ?`);
      values.push(country);
    }
    if (start_date) {
      if (tableName === "technologies") whereClauses.push(`production_start_date >= ?`);
      else if (tableName === "projects") whereClauses.push(`start_date >= ?`);
      values.push(start_date);
    }
    if (end_date) {
      if (tableName === "technologies") whereClauses.push(`last_usage_date <= ?`);
      else if (tableName === "projects") whereClauses.push(`end_date <= ?`);
      values.push(end_date);
    }
    if (keyword) {
      whereClauses.push(
        `(name LIKE ? OR description LIKE ? OR salient_features LIKE ? OR achievements LIKE ?)`
      );
      values.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }

    // Apply WHERE
    if (whereClauses.length > 0) query += " WHERE " + whereClauses.join(" AND ");

    // Sorting
    if (sort_by) query += ` ORDER BY ${sort_by} ${sort_order}`;

    // Pagination
    const offset = (page - 1) * limit;
    query += ` LIMIT ${limit} OFFSET ${offset}`;

    const rows = await queryAsync(query, values);

    res.json({ data: rows, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
