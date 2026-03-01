const express = require("express");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const env = require("../config/env");
const authenticate = require("../middleware/auth");
const { writeAuditLog } = require("../services/auditService");
const User = require("../models/User");
const Session = require("../models/Session");

const router = express.Router();

const registerValidator = [
  body("fullName").trim().isLength({ min: 3 }),
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
  body("role").isIn(["ADMIN", "OWNER", "BUYER", "TRAFFIC_POLICE"]),
];

router.post("/register", registerValidator, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Validation failed", errors: errors.array() });
  }

  const { fullName, email, password, role } = req.body;
  const exists = await User.findOne({ email }).lean();
  if (exists) {
    return res.status(409).json({ message: "Email already registered" });
  }

  const user = await User.create({
    fullName,
    email,
    passwordHash: await bcrypt.hash(password, 12),
    role,
    createdAt: new Date(),
  });

  await writeAuditLog({
    action: "USER_REGISTERED",
    entityType: "USER",
    entityId: user._id.toString(),
    actorId: user._id.toString(),
    details: { email, role },
  });

  return res.status(201).json({
    message: "Registration successful",
    user: { id: user._id.toString(), fullName, email, role },
  });
});

router.post(
  "/login",
  [body("email").isEmail().normalizeEmail(), body("password").notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Validation failed", errors: errors.array() });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user._id.toString(), role: user.role }, env.jwtSecret, {
      expiresIn: env.jwtExpiry,
    });
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);
    await Session.create({
      token,
      userId: user._id,
      expiresAt,
      createdAt: new Date(),
      isRevoked: false,
    });

    await writeAuditLog({
      action: "USER_LOGGED_IN",
      entityType: "USER",
      entityId: user._id.toString(),
      actorId: user._id.toString(),
      details: { email: user.email },
    });

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  }
);

router.post("/logout", authenticate, async (req, res) => {
  await Session.updateOne({ token: req.token }, { $set: { isRevoked: true } });
  await writeAuditLog({
    action: "USER_LOGGED_OUT",
    entityType: "SESSION",
    entityId: req.token,
    actorId: req.user.id,
    details: {},
  });
  return res.json({ message: "Logout successful" });
});

router.get("/me", authenticate, (req, res) => res.json({ user: req.user }));

router.post("/recover/request", [body("email").isEmail().normalizeEmail()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Validation failed", errors: errors.array() });
  }

  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.json({ message: "If account exists, recovery instructions are issued." });
  }

  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
  user.recoveryToken = token;
  user.recoveryExpiresAt = expiresAt;
  await user.save();

  await writeAuditLog({
    action: "RECOVERY_TOKEN_GENERATED",
    entityType: "USER",
    entityId: user._id.toString(),
    actorId: user._id.toString(),
    details: { expiresAt },
  });

  return res.json({
    message: "Recovery token generated (demo mode returns token directly)",
    recoveryToken: token,
    expiresAt,
  });
});

router.post(
  "/recover/reset",
  [body("token").notEmpty(), body("newPassword").isLength({ min: 8 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Validation failed", errors: errors.array() });
    }

    const { token, newPassword } = req.body;
    const user = await User.findOne({ recoveryToken: token });
    if (!user || !user.recoveryExpiresAt || new Date(user.recoveryExpiresAt) < new Date()) {
      return res.status(400).json({ message: "Invalid or expired recovery token" });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.recoveryToken = null;
    user.recoveryExpiresAt = null;
    await user.save();

    await writeAuditLog({
      action: "PASSWORD_RESET",
      entityType: "USER",
      entityId: user._id.toString(),
      actorId: user._id.toString(),
      details: {},
    });

    return res.json({ message: "Password reset successful" });
  }
);

router.get("/users", authenticate, async (req, res) => {
  const users = await User.find({}, "fullName email role createdAt").sort({ createdAt: -1 }).lean();
  return res.json({
    users: users.map((u) => ({
      id: u._id.toString(),
      full_name: u.fullName,
      email: u.email,
      role: u.role,
      created_at: u.createdAt,
    })),
  });
});

module.exports = router;
