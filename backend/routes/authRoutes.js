import express from "express";
import bcrypt from "bcryptjs";
import { body } from "express-validator";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";
import Receptionist from "../models/Receptionist.js";
import Admin from "../models/Admin.js";
import OTP from "../models/OTP.js";
import { generateToken } from "../utils/generateToken.js";
import { verifyToken } from "../middleware/auth.js";
import { handleValidationErrors } from "../middleware/validate.js";
import { sendSMS } from "../services/twilioService.js";

const router = express.Router();
const MODEL_BY_ROLE = { patient: Patient, doctor: Doctor, receptionist: Receptionist, admin: Admin };

router.post("/register",
  [body("role").isIn(["patient", "doctor", "receptionist", "admin"]), body("password").isLength({ min: 6 }), body("name").trim().notEmpty()],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { role, password, ...rest } = req.body;
      const Model = MODEL_BY_ROLE[role];
      if (!Model) return res.status(400).json({ error: "Invalid role" });
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await Model.create({ ...rest, passwordHash });
      const token = generateToken({ id: user._id, role });
      const userObj = user.toObject(); delete userObj.passwordHash;
      res.status(201).json({ token, role, user: userObj });
    } catch (err) {
      if (err.code === 11000) return res.status(409).json({ error: "Email or phone already registered" });
      res.status(400).json({ error: err.message });
    }
  }
);

router.post("/login",
  [body("role").isIn(["patient", "doctor", "receptionist", "admin"]), body("identifier").trim().notEmpty(), body("password").notEmpty()],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { role, identifier, password } = req.body;
      const Model = MODEL_BY_ROLE[role];
      if (!Model) return res.status(400).json({ error: "Invalid role" });
      const user = await Model.findOne({ $or: [{ email: identifier }, { phone: identifier }] });
      if (!user) return res.status(404).json({ error: "User not found" });
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) return res.status(401).json({ error: "Incorrect password" });
      const token = generateToken({ id: user._id, role });
      const userObj = user.toObject(); delete userObj.passwordHash;
      res.json({ token, role, user: userObj });
    } catch (err) { res.status(400).json({ error: err.message }); }
  }
);

// Send SMS verification OTP
router.post("/send-otp", async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: "Phone number is required" });

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  try {
    await OTP.findOneAndUpdate({ phone }, { code }, { upsert: true, new: true });

    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      await sendSMS({
        toPhoneNumber: phone,
        message: `Your MedCare AI verification code is: ${code}. Valid for 5 minutes.`,
      });
      console.log(`Real SMS OTP ${code} dispatched to ${phone}`);
    } else {
      console.log(`Mock SMS OTP ${code} generated for ${phone} (Twilio not configured)`);
    }

    res.json({ success: true, code, message: "Verification SMS dispatched" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify OTP
router.post("/verify-otp", async (req, res) => {
  const { phone, code } = req.body;
  if (!phone || !code) return res.status(400).json({ error: "Phone and code are required" });

  try {
    const record = await OTP.findOne({ phone, code });
    if (!record) {
      return res.status(400).json({ error: "Invalid or expired verification code" });
    }
    await OTP.deleteOne({ _id: record._id });
    res.json({ success: true, verified: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/me", verifyToken, async (req, res) => {
  try {
    const Model = MODEL_BY_ROLE[req.user.role];
    if (!Model) return res.status(400).json({ error: "Invalid role" });
    const user = await Model.findById(req.user.id).select("-passwordHash");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ role: req.user.role, user });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
