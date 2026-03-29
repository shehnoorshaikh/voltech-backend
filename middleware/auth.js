import jwt from "jsonwebtoken";
import User from "../models/User.js";

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = decoded;
    next();
  });
}

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader)
    return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    req.user = user;
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.isBlocked) {
      return res.status(403).json({ message: "Your account is blocked" });
    }

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export const checkBlocked = (req, res, next) => {
  if (req.user.isBlocked) {
    return res.status(403).json({ message: "User is blocked" });
  }
  next();
};
export default verifyToken;
