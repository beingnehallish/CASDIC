import db from "../config/db.js";

/* ==============================
   TECHNOLOGIES
================================*/
export const getTechnologies = (req, res) => {
  db.query("SELECT * FROM technologies", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

export const addTechnology = (req, res) => {
  const data = req.body;
  db.query("INSERT INTO technologies SET ?", data, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ id: result.insertId, ...data });
  });
};

/* ==============================
   TECHNOLOGY SPECS
================================*/
export const getSpecsByTech = (req, res) => {
  const { tech_id } = req.params;
  db.query("SELECT * FROM technology_specs WHERE tech_id = ?", [tech_id], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

export const addSpec = (req, res) => {
  const data = req.body;
  db.query("INSERT INTO technology_specs SET ?", data, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ id: result.insertId, ...data });
  });
};

/* ==============================
   QUALIFICATION HW
================================*/
export const getHWByTech = (req, res) => {
  const { tech_id } = req.params;
  db.query("SELECT * FROM qualification_hw WHERE tech_id = ?", [tech_id], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

export const addHW = (req, res) => {
  const data = req.body;
  db.query("INSERT INTO qualification_hw SET ?", data, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ id: result.insertId, ...data });
  });
};

/* ==============================
   QUALIFICATION SW
================================*/
export const getSWByTech = (req, res) => {
  const { tech_id } = req.params;
  db.query("SELECT * FROM qualification_sw WHERE tech_id = ?", [tech_id], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

export const addSW = (req, res) => {
  const data = req.body;
  db.query("INSERT INTO qualification_sw SET ?", data, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ id: result.insertId, ...data });
  });
};

/* ==============================
   VERSIONS
================================*/
export const getVersionsByTech = (req, res) => {
  const { tech_id } = req.params;
  db.query("SELECT * FROM versions WHERE tech_id = ?", [tech_id], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

export const addVersion = (req, res) => {
  const data = req.body;
  db.query("INSERT INTO versions SET ?", data, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ id: result.insertId, ...data });
  });
};

/* ==============================
   COMPANIES
================================*/
export const getCompanies = (req, res) => {
  db.query("SELECT * FROM companies", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

export const addCompany = (req, res) => {
  const data = req.body;
  db.query("INSERT INTO companies SET ?", data, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ id: result.insertId, ...data });
  });
};

/* ==============================
   PROJECTS
================================*/
export const getProjects = (req, res) => {
  db.query("SELECT * FROM projects", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

export const addProject = (req, res) => {
  const data = req.body;
  db.query("INSERT INTO projects SET ?", data, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ id: result.insertId, ...data });
  });
};

/* ==============================
   EMPLOYEES
================================*/
export const getEmployees = (req, res) => {
  db.query("SELECT * FROM employees", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

export const addEmployee = (req, res) => {
  const data = req.body;
  db.query("INSERT INTO employees SET ?", data, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ id: result.insertId, ...data });
  });
};

/* ==============================
   PATENTS
================================*/
export const getPatentsByTech = (req, res) => {
  const { tech_id } = req.params;
  db.query("SELECT * FROM patents WHERE tech_id = ?", [tech_id], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

export const addPatent = (req, res) => {
  const data = req.body;
  db.query("INSERT INTO patents SET ?", data, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ id: result.insertId, ...data });
  });
};

/* ==============================
   PUBLICATIONS
================================*/
export const getPublicationsByTech = (req, res) => {
  const { tech_id } = req.params;
  db.query("SELECT * FROM publications WHERE tech_id = ?", [tech_id], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

export const addPublication = (req, res) => {
  const data = req.body;
  db.query("INSERT INTO publications SET ?", data, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ id: result.insertId, ...data });
  });
};
