// server.js

import "dotenv/config"; 
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import routes from "./routes/routes.js";
import authRoutes from "./routes/authRoutes.js";
import reports from "./routes/reports.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import technologyRoutes from "./routes/technologyRoutes.js";
import projectCompanyRoutes from "./routes/projectCompanyRoutes.js";
import employeeProjectsRoutes from "./routes/employeeProjectsRoutes.js";
import employeeTechnologyRoutes from "./routes/employeeTechnologyRoutes.js";
import patentsAndEmployeeLinks from "./routes/patentsAndEmployeeLinks.js";
import publicationsRouter from "./routes/publicationsAndEmployeeLinks.js";
const app = express();
app.use(cors());
app.use(express.json());

app.use(express.urlencoded({ limit: "10mb", extended: true }));
// Register routes - specific routes BEFORE generic ones
app.use("/api/auth", authRoutes);
app.use("/api/reports", reports);
app.use("/api/employees", employeeRoutes);
app.use(employeeTechnologyRoutes);
app.use("/api/technologies", technologyRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/company", companyRoutes);
app.use("/api", projectCompanyRoutes);
app.use("/api/employee_projects", employeeProjectsRoutes);
app.use("/api", patentsAndEmployeeLinks);
app.use("/api", publicationsRouter);
app.use("/api", routes); // Generic routes last
app.listen(5000, () => {
  console.log("✅ Backend running on http://localhost:5000");
});

export default app;