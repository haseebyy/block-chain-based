const jwt = require("jsonwebtoken");
const env = require("../config/env");
const Session = require("../models/Session");
const User = require("../models/User");

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: token missing" });
  }

  const session = await Session.findOne({ token }).lean();

  if (!session || session.isRevoked) {
    return res.status(401).json({ message: "Unauthorized: session invalid" });
  }

  if (new Date(session.expiresAt) < new Date()) {
    return res.status(401).json({ message: "Unauthorized: session expired" });
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(payload.userId).lean();
    if (!user) {
      return res.status(401).json({ message: "Unauthorized: user not found" });
    }

    req.user = {
      id: user._id.toString(),
      full_name: user.fullName,
      email: user.email,
      role: user.role,
      created_at: user.createdAt,
    };
    req.token = token;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: invalid token" });
  }
};

module.exports = authenticate;
