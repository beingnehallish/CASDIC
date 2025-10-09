import db from "../config/db.js";

/* ========== TECHNOLOGIES ========== */
export const getTechnologies = (req, res) => {
  db.query("SELECT * FROM technologies", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

export const addTechnology = (req, res) => {
  db.query("INSERT INTO technologies SET ?", req.body, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ id: result.insertId, ...req.body });
  });
};

export const updateTechnology = (req, res) => {
  const { tech_id } = req.params;
  db.query("UPDATE technologies SET ? WHERE tech_id = ?", [req.body, tech_id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Technology updated!" });
  });
};

export const deleteTechnology = (req, res) => {
  const { tech_id } = req.params;
  db.query("DELETE FROM technologies WHERE tech_id = ?", [tech_id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Technology deleted!" });
  });
};

/* ========== PROJECTS ========== */
export const getProjects = (req, res) => {
  db.query("SELECT * FROM projects", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

export const addProject = (req, res) => {
  db.query("INSERT INTO projects SET ?", req.body, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ id: result.insertId, ...req.body });
  });
};

/* ========== COMPANIES ========== */
export const getCompanies = (req, res) => {
  db.query("SELECT * FROM companies", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

export const addCompany = (req, res) => {
  db.query("INSERT INTO companies SET ?", req.body, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ id: result.insertId, ...req.body });
  });
};

/* ========== PATENTS ========== */
export const getPatents = (req, res) => {
  const query = `
    SELECT p.*, t.name AS tech_name
    FROM patents p
    LEFT JOIN technologies t ON p.tech_id = t.tech_id
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

/* ========== PUBLICATIONS ========== */
export const getPublications = (req, res) => {
  const query = `
    SELECT pub.*, t.name AS tech_name
    FROM publications pub
    LEFT JOIN technologies t ON pub.tech_id = t.tech_id
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

/* ========== EMPLOYEES ========== */
export const getEmployees = (req, res) => {
  db.query("SELECT * FROM employees", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

/* ========== USERS ========== */
export const getUsers = (req, res) => {
  db.query("SELECT user_id, name, email, role FROM users", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};
