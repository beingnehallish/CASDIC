// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import routes from "./routes/routes.js";
import authRoutes from "./routes/authRoutes.js";
import reports from "./routes/reports.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import technologyRoutes from "./routes/technologyRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import projectCompanyRoutes from "./routes/projectCompanyRoutes.js";
import patentRoutes from "./routes/patentRoutes.js";
import publicationsRoutes from "./routes/publicationsRoutes.js";
import employeeProjectsRoutes from "./routes/employeeProjectsRoutes.js";
import employeePatentsRoutes from "./routes/employeePatentsRoutes.js";
import employeePublicationsRoutes from "./routes/employeePublicationsRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Register routes - specific routes BEFORE generic ones
app.use("/api/auth", authRoutes);
app.use("/api/reports", reports);
app.use("/api/employees", employeeRoutes);
app.use("/api/technologies", technologyRoutes); // ⚠️ MUST come before /api
app.use("/api/projects", projectRoutes);
app.use("/api/company", companyRoutes);
app.use("/api", projectCompanyRoutes);
app.use("/api/patents", patentRoutes);
app.use("/api/publications", publicationsRoutes);
app.use("/api/employee_projects", employeeProjectsRoutes);
app.use("/api/employee_patents", employeePatentsRoutes);
app.use("/api/employee_publications", employeePublicationsRoutes);
app.use("/api", routes); // Generic routes last
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.listen(5000, () => {
  console.log("✅ Backend running on http://localhost:5000");
});

export default app;