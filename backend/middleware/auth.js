import jwt from "jsonwebtoken";
const SECRET_KEY = "yourSecretKey";

export function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Unauthorized" });
    req.user = decoded; // { id, role }
    next();
  });
}

export function isEmployee(req, res, next) {
  if (req.user.role !== "employee") {
    return res.status(403).json({ error: "Access denied: Employees only" });
  }
  next();
}

export function isUser(req, res, next) {
  if (req.user.role !== "user") {
    return res.status(403).json({ error: "Access denied: Users only" });
  }
  next();
}
