import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import routes from "./routes/routes.js";
import authRoutes from "./routes/authRoutes.js";
import reports from "./routes/reports.js";
import employeeRoutes from "./routes/employeeRoutes.js";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Register routes
app.use("/api/auth", authRoutes);
app.use("/api/reports", reports);
app.use("/api/employees", employeeRoutes);
app.use("/api", routes);

app.listen(5000, () => {
  console.log("✅ Backend running on http://localhost:5000");
});
