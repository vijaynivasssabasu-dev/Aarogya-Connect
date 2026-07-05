import express from "express";
import MedicalRecord from "../models/MedicalRecord.js";
import { verifyToken, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.post("/", verifyToken, requireRole("doctor", "receptionist"), async (req, res) => {
  try {
    const doctorId = req.user.role === "doctor" ? req.user.id : req.body.doctor;
    res.status(201).json({ record: await MedicalRecord.create({ ...req.body, doctor: doctorId }) });
  }
  catch (err) { res.status(400).json({ error: err.message }); }
});

router.get("/my", verifyToken, requireRole("patient"), async (req, res) => {
  const records = await MedicalRecord.find({ patient: req.user.id }).populate("doctor", "name").populate("appointment", "slotDate slotTime").sort("-createdAt");
  res.json({ records });
});

router.get("/doctor", verifyToken, requireRole("doctor"), async (req, res) => {
  const filter = { doctor: req.user.id };
  if (req.query.patientId) filter.patient = req.query.patientId;
  const records = await MedicalRecord.find(filter).populate("patient", "name phone dob gender bloodGroup").populate("appointment", "slotDate slotTime").sort("-createdAt");
  res.json({ records });
});

router.get("/:id", verifyToken, async (req, res) => {
  const record = await MedicalRecord.findById(req.params.id).populate("patient", "name phone dob gender bloodGroup").populate("doctor", "name").populate("appointment", "slotDate slotTime");
  if (!record) return res.status(404).json({ error: "Not found" });
  if (req.user.role === "patient" && record.patient._id.toString() !== req.user.id) return res.status(403).json({ error: "Access denied" });
  if (req.user.role === "doctor" && record.doctor._id.toString() !== req.user.id) return res.status(403).json({ error: "Access denied" });
  res.json({ record });
});

router.put("/:id", verifyToken, requireRole("doctor"), async (req, res) => {
  const record = await MedicalRecord.findOneAndUpdate({ _id: req.params.id, doctor: req.user.id }, req.body, { new: true });
  if (!record) return res.status(404).json({ error: "Not found" });
  res.json({ record });
});

export default router;
