import bcrypt from "bcryptjs";
import db from "../config/db.js";

export const changeEmployeePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user_id = req.user.id; // comes from JWT

  try {
    // Get employee from users table where role='employee'
    const [rows] = await db.promise().query(
      "SELECT * FROM users WHERE user_id = ? AND role='employee'",
      [user_id]
    );

    if (rows.length === 0) return res.status(404).json({ message: "Employee not found" });

    const employee = rows[0];
    const match = await bcrypt.compare(currentPassword, employee.password);
    if (!match) return res.status(400).json({ message: "Incorrect current password" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.promise().query(
      "UPDATE users SET password=? WHERE user_id=?",
      [hashed, user_id]
    );

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
