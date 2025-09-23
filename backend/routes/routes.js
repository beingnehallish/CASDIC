import express from "express";
import * as controller from "../controllers/controller.js";

const router = express.Router();

// Technologies
router.get("/technologies", controller.getTechnologies);
router.post("/technologies", controller.addTechnology);

// Specs
router.get("/specs/:tech_id", controller.getSpecsByTech);
router.post("/specs", controller.addSpec);

// Qualification HW
router.get("/qualification_hw/:tech_id", controller.getHWByTech);
router.post("/qualification_hw", controller.addHW);

// Qualification SW
router.get("/qualification_sw/:tech_id", controller.getSWByTech);
router.post("/qualification_sw", controller.addSW);

// Versions
router.get("/versions/:tech_id", controller.getVersionsByTech);
router.post("/versions", controller.addVersion);

// Companies
router.get("/companies", controller.getCompanies);
router.post("/companies", controller.addCompany);

// Projects
router.get("/projects", controller.getProjects);
router.post("/projects", controller.addProject);

// Employees
router.get("/employees", controller.getEmployees);
router.post("/employees", controller.addEmployee);

// Patents
router.get("/patents/:tech_id", controller.getPatentsByTech);
router.post("/patents", controller.addPatent);

// Publications
router.get("/publications/:tech_id", controller.getPublicationsByTech);
router.post("/publications", controller.addPublication);

export default router;
