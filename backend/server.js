import express from "express";
import cors from "cors";
import routes from "./routes/routes.js";
import mysql from "mysql2";

const app = express();
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api", routes);

app.listen(5000, () => console.log("✅ Backend running on http://localhost:5000"));
