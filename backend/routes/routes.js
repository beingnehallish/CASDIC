// routes/routes.js
import express from "express";
import bcrypt from "bcryptjs";
import db from "../config/db.js";
import {
  getTechnologies, addTechnology, updateTechnology, deleteTechnology,
  getProjects, addProject,
  getCompanies, addCompany,
  getPatents, getPublications
} from "../middleware/controllers/controller.js";

import { verifyToken, isEmployee, isUser } from "../middleware/auth.js";

const router = express.Router();

/* -------------------- DASHBOARD STATS -------------------- */
router.get("/dashboard-stats", verifyToken, async (req, res) => {
  try {
    const statsQueries = {
      totalTech: "SELECT COUNT(*) as count FROM technologies",
      active: "SELECT COUNT(*) as count FROM technologies WHERE status='In Use'",
      deprecated: "SELECT COUNT(*) as count FROM technologies WHERE status='Deprecated'",
      projects: "SELECT COUNT(*) as count FROM projects",
      patents: "SELECT COUNT(*) as count FROM patents",
      publications: "SELECT COUNT(*) as count FROM publications"
    };

    const stats = {};
    for (const key in statsQueries) {
      const [rows] = await new Promise((resolve, reject) => {
        db.query(statsQueries[key], (err, result) => {
          if (err) reject(err);
          else resolve([result]);
        });
      });
      stats[key] = rows[0].count;
    }

    res.json(stats);
  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* -------------------- READ ROUTES (AUTH REQUIRED) -------------------- */
router.get("/technologies", verifyToken, (req, res) => getTechnologies(req, res, db));
router.get("/projects", verifyToken, (req, res) => getProjects(req, res, db));
router.get("/companies", verifyToken, (req, res) => getCompanies(req, res, db));
router.get("/patents", verifyToken, (req, res) => getPatents(req, res, db));
router.get("/publications", verifyToken, (req, res) => getPublications(req, res, db));

/* -------------------- WRITE ROUTES (EMPLOYEE ONLY) -------------------- */
// Technologies
router.post("/technologies", verifyToken, isEmployee, (req, res) => addTechnology(req, res, db));
router.put("/technologies/:tech_id", verifyToken, isEmployee, (req, res) => updateTechnology(req, res, db));
router.delete("/technologies/:tech_id", verifyToken, isEmployee, (req, res) => deleteTechnology(req, res, db));

// Projects
router.post("/projects", verifyToken, isEmployee, (req, res) => addProject(req, res, db));
router.put("/projects/:project_id", verifyToken, isEmployee, (req, res) => {
  const { name, description, start_date, end_date, budget, tech_id } = req.body;
  db.query(
    "UPDATE projects SET name=?, description=?, start_date=?, end_date=?, budget=?, tech_id=? WHERE project_id=?",
    [name, description, start_date, end_date, budget, tech_id, req.params.project_id],
    (err) => {
      if (err) return res.status(500).json({ error: "Server error" });
      res.json({ message: "Project updated successfully" });
    }
  );
});
router.delete("/projects/:project_id", verifyToken, isEmployee, (req, res) => {
  db.query("DELETE FROM projects WHERE project_id=?", [req.params.project_id], (err) => {
    if (err) return res.status(500).json({ error: "Server error" });
    res.json({ message: "Project deleted successfully" });
  });
});

// Companies
router.post("/companies", verifyToken, isEmployee, (req, res) => addCompany(req, res, db));
router.put("/companies/:company_id", verifyToken, isEmployee, (req, res) => {
  const { name, country, role } = req.body;
  db.query(
    "UPDATE companies SET name=?, country=?, role=? WHERE company_id=?",
    [name, country, role, req.params.company_id],
    (err) => {
      if (err) return res.status(500).json({ error: "Server error" });
      res.json({ message: "Company updated successfully" });
    }
  );
});
router.delete("/companies/:company_id", verifyToken, isEmployee, (req, res) => {
  db.query("DELETE FROM companies WHERE company_id=?", [req.params.company_id], (err) => {
    if (err) return res.status(500).json({ error: "Server error" });
    res.json({ message: "Company deleted successfully" });
  });
});

// Patents
router.post("/patents", verifyToken, isEmployee, (req, res) => {
  const { tech_id, title, patent_number, date_filed, date_granted } = req.body;
  db.query(
    "INSERT INTO patents (tech_id, title, patent_number, date_filed, date_granted) VALUES (?, ?, ?, ?, ?)",
    [tech_id, title, patent_number, date_filed, date_granted],
    (err) => {
      if (err) return res.status(500).json({ error: "Server error" });
      res.json({ message: "Patent added successfully" });
    }
  );
});
router.put("/patents/:patent_id", verifyToken, isEmployee, (req, res) => {
  const { tech_id, title, patent_number, date_filed, date_granted } = req.body;
  db.query(
    "UPDATE patents SET tech_id=?, title=?, patent_number=?, date_filed=?, date_granted=? WHERE patent_id=?",
    [tech_id, title, patent_number, date_filed, date_granted, req.params.patent_id],
    (err) => {
      if (err) return res.status(500).json({ error: "Server error" });
      res.json({ message: "Patent updated successfully" });
    }
  );
});
router.delete("/patents/:patent_id", verifyToken, isEmployee, (req, res) => {
  db.query("DELETE FROM patents WHERE patent_id=?", [req.params.patent_id], (err) => {
    if (err) return res.status(500).json({ error: "Server error" });
    res.json({ message: "Patent deleted successfully" });
  });
});

// Publications
router.post("/publications", verifyToken, isEmployee, (req, res) => {
  const { tech_id, title, authors, journal, year, link } = req.body;
  db.query(
    "INSERT INTO publications (tech_id, title, authors, journal, year, link) VALUES (?, ?, ?, ?, ?, ?)",
    [tech_id, title, authors, journal, year, link],
    (err) => {
      if (err) return res.status(500).json({ error: "Server error" });
      res.json({ message: "Publication added successfully" });
    }
  );
});
router.put("/publications/:pub_id", verifyToken, isEmployee, (req, res) => {
  const { tech_id, title, authors, journal, year, link } = req.body;
  db.query(
    "UPDATE publications SET tech_id=?, title=?, authors=?, journal=?, year=?, link=? WHERE pub_id=?",
    [tech_id, title, authors, journal, year, link, req.params.pub_id],
    (err) => {
      if (err) return res.status(500).json({ error: "Server error" });
      res.json({ message: "Publication updated successfully" });
    }
  );
});
router.delete("/publications/:pub_id", verifyToken, isEmployee, (req, res) => {
  db.query("DELETE FROM publications WHERE pub_id=?", [req.params.pub_id], (err) => {
    if (err) return res.status(500).json({ error: "Server error" });
    res.json({ message: "Publication deleted successfully" });
  });
});

/* -------------------- EMPLOYEES (READ-ONLY HERE) -------------------- */
router.get("/employees", verifyToken, isEmployee, (req, res) => {
  db.query("SELECT * FROM employees", (err, rows) => {
    if (err) return res.status(500).json({ error: "Server error" });
    res.json(rows);
  });
});

/* -------------------- TECHNOLOGY DETAILS (CHILD TABLES) -------------------- */
router.get("/technologies/details/:tech_id", verifyToken, (req, res) => {
  const { tech_id } = req.params;

  const queries = {
    versions: "SELECT * FROM versions WHERE tech_id=?",
    specs: "SELECT * FROM technology_specs WHERE tech_id=?",
    hw: "SELECT * FROM qualification_hw WHERE tech_id=?",
    sw: "SELECT * FROM qualification_sw WHERE tech_id=?"
  };

  const results = {};

  db.query(queries.versions, [tech_id], (err, rows) => {
    if (err) return res.status(500).json({ error: "Server error" });
    results.versions = rows;

    db.query(queries.specs, [tech_id], (err2, rows2) => {
      if (err2) return res.status(500).json({ error: "Server error" });
      results.specs = rows2;

      db.query(queries.hw, [tech_id], (err3, rows3) => {
        if (err3) return res.status(500).json({ error: "Server error" });
        results.hw = rows3;

        db.query(queries.sw, [tech_id], (err4, rows4) => {
          if (err4) return res.status(500).json({ error: "Server error" });
          results.sw = rows4;

          res.json(results);
        });
      });
    });
  });
});

/* -------------------- WATCHLIST -------------------- */
router.post("/watchlist/toggle", verifyToken, (req, res) => {
  const { type, item_id } = req.body;
  const user_id = req.user?.id ?? req.user?.user_id ?? req.user?.userId;

  if (!["tech", "project", "patent", "pub"].includes(type))
    return res.status(400).json({ error: "Invalid type" });

  db.query(
    "SELECT * FROM watchlist WHERE user_id=? AND item_type=? AND item_id=?",
    [user_id, type, item_id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "Server error" });

      if (rows.length > 0) {
        db.query(
          "DELETE FROM watchlist WHERE user_id=? AND item_type=? AND item_id=?",
          [user_id, type, item_id],
          (err2) => {
            if (err2) return res.status(500).json({ error: "Server error" });
            res.json({ message: "Removed from watchlist" });
          }
        );
      } else {
        db.query(
          "INSERT INTO watchlist (user_id, item_type, item_id) VALUES (?, ?, ?)",
          [user_id, type, item_id],
          (err3) => {
            if (err3) return res.status(500).json({ error: "Server error" });
            res.json({ message: "Added to watchlist" });
          }
        );
      }
    }
  );
});

router.get("/watchlist", verifyToken, (req, res) => {
 const user_id = req.user?.id ?? req.user?.user_id ?? req.user?.userId;
  db.query(
    `SELECT w.*, 
            CASE w.item_type
                WHEN 'tech' THEN t.name
                WHEN 'project' THEN p.name
                WHEN 'patent' THEN pt.title
                WHEN 'pub' THEN pub.title
            END AS item_name
     FROM watchlist w
     LEFT JOIN technologies t ON (w.item_type='tech' AND w.item_id=t.tech_id)
     LEFT JOIN projects p ON (w.item_type='project' AND w.item_id=p.project_id)
     LEFT JOIN patents pt ON (w.item_type='patent' AND w.item_id=pt.patent_id)
     LEFT JOIN publications pub ON (w.item_type='pub' AND w.item_id=pub.pub_id)
     WHERE w.user_id=?`,
    [user_id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "Server error" });
      res.json(rows);
    }
  );
});

/* -------------------- NOTIFICATIONS -------------------- */
router.get("/notifications", verifyToken, (req, res) => {
  const user_id = req.user?.id ?? req.user?.user_id ?? req.user?.userId;
  db.query(
    `SELECT n.*, t.name as tech_name 
     FROM notifications n 
     LEFT JOIN technologies t ON n.tech_id = t.tech_id 
     WHERE n.user_id=? 
     ORDER BY n.created_at DESC`,
    [user_id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "Server error" });
      res.json(rows);
    }
  );
});

/* -------------------- USERS PROFILE (for Settings page) -------------------- */
// Get logged-in user's profile (users table)
router.get("/users/profile", verifyToken, (req, res) => {
  const user_id = req.user?.id ?? req.user?.user_id ?? req.user?.userId;
  db.query(
    "SELECT user_id, name, email, role FROM users WHERE user_id=?",
    [user_id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "Server error" });
      if (!rows || rows.length === 0) return res.status(404).json({ error: "User not found" });
      res.json(rows[0]);
    }
  );
});

// Update logged-in user's name/email (users table)
router.put("/users/update-profile", verifyToken, (req, res) => {
  const user_id = req.user?.id ?? req.user?.user_id ?? req.user?.userId;
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  db.query(
    "UPDATE users SET name=?, email=? WHERE user_id=?",
    [name, email, user_id],
    (err) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(409).json({ error: "Email already in use" });
        }
        return res.status(500).json({ error: "Server error" });
      }
      res.json({ success: true });
    }
  );
});

/* -------------------- AUTH: CHANGE PASSWORD -------------------- */
router.put("/auth/change-password", verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user_id = req.user?.id ?? req.user?.user_id ?? req.user?.userId;

    if (!user_id) return res.status(401).json({ success: false, message: "Unauthorized: user id missing" });
    if (typeof currentPassword !== "string" || typeof newPassword !== "string")
      return res.status(400).json({ success: false, message: "Invalid payload" });
    if (newPassword.length < 8)
      return res.status(422).json({ success: false, message: "New password must be at least 8 characters" });

    db.query("SELECT user_id, password FROM users WHERE user_id=?", [user_id], async (err, rows) => {
      if (err) return res.status(500).json({ success: false, message: "Server error (read)" });
      if (!rows || rows.length === 0) return res.status(404).json({ success: false, message: "User not found" });

      const stored = rows[0].password || "";
      const looksHashed = stored.startsWith("$2a$") || stored.startsWith("$2b$") || stored.startsWith("$2y$");

      try {
        // Legacy plaintext migration path
        if (!looksHashed) {
          if (currentPassword !== stored)
            return res.status(400).json({ success: false, message: "Current password incorrect" });

          const newHash = await bcrypt.hash(newPassword, 10);
          db.query("UPDATE users SET password=? WHERE user_id=?", [newHash, user_id], (err2) => {
            if (err2) return res.status(500).json({ success: false, message: "Server error (update)" });
            return res.json({ success: true, message: "Password updated successfully (migrated)" });
          });
          return;
        }

        // Normal bcrypt flow
        const ok = await bcrypt.compare(currentPassword, stored);
        if (!ok) return res.status(400).json({ success: false, message: "Current password incorrect" });

        const newHash = await bcrypt.hash(newPassword, 10);
        db.query("UPDATE users SET password=? WHERE user_id=?", [newHash, user_id], (err2) => {
          if (err2) return res.status(500).json({ success: false, message: "Server error (update)" });
          return res.json({ success: true, message: "Password updated successfully" });
        });
      } catch {
        return res.status(500).json({ success: false, message: "Password check error" });
      }
    });
  } catch {
    return res.status(500).json({ success: false, message: "Unexpected server error" });
  }
});

/* -------------------- GENERIC DETAILS LOOKUP -------------------- */
router.get("/details/:type/:id", verifyToken, async (req, res) => {
  const { type, id } = req.params;

  let query = "";
  switch (type) {
    case "tech":
      query = `
        SELECT t.*, p.patent_number, pr.name as project_name, pub.title as publication_title
        FROM technologies t
        LEFT JOIN patents p ON p.tech_id = t.tech_id
        LEFT JOIN projects pr ON pr.tech_id = t.tech_id
        LEFT JOIN publications pub ON pub.tech_id = t.tech_id
        WHERE t.tech_id = ?
      `;
      break;
    case "project":
      query = `
        SELECT pr.*, t.name as tech_name
        FROM projects pr
        LEFT JOIN technologies t ON t.tech_id = pr.tech_id
        WHERE pr.project_id = ?
      `;
      break;
    case "patent":
      query = `
        SELECT p.*, t.name as tech_name
        FROM patents p
        LEFT JOIN technologies t ON t.tech_id = p.tech_id
        WHERE p.patent_id = ?
      `;
      break;
    case "pub":
      query = `
        SELECT pub.*, t.name as tech_name
        FROM publications pub
        LEFT JOIN technologies t ON t.tech_id = pub.tech_id
        WHERE pub.pub_id = ?
      `;
      break;
    default:
      return res.status(400).json({ message: "Invalid type" });
  }

  db.query(query, [id], (err, rows) => {
    if (err) return res.status(500).json({ message: "Server error" });
    if (rows.length === 0) return res.status(404).json({ message: "Not found" });
    res.json(rows[0]);
  });
});

export default router;
