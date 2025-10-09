import express from "express";
import { verifyToken, isEmployee } from "../middleware/auth.js";
import { changeEmployeePassword } from "../controllers/employeeController.js";

const router = express.Router();
router.put("/change-password", verifyToken, isEmployee, changeEmployeePassword);
export default router;
