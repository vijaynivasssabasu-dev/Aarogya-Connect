import express from "express";
import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import DoctorCategory from "../models/DoctorCategory.js";
import Hospital from "../models/Hospital.js";
import { verifyToken, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.get("/categories", async (req, res) => {
  const categories = await DoctorCategory.find().sort("categoryName");
  res.json({ categories });
});

router.get("/hospitals", async (req, res) => {
  const hospitals = await Hospital.find().sort("name");
  res.json({ hospitals });
});

router.get("/available-doctors", verifyToken, async (req, res) => {
  const { categoryId } = req.query;
  const filter = { availabilityStatus: "available" };
  if (categoryId) filter.category = categoryId;
  const doctors = await Doctor.find(filter).populate("hospital", "name city").populate("category", "categoryName");
  res.json({ count: doctors.length, doctors });
});

router.post("/book", verifyToken, requireRole("patient"), async (req, res) => {
  try {
    const { doctorId, hospitalId, slotDate, slotTime, isEmergency } = req.body;

    const [hours, minutes] = slotTime.split(":").map(Number);
    const targetDate = new Date(slotDate);
    targetDate.setHours(hours, minutes, 0, 0);
    if (targetDate < new Date()) {
      return res.status(400).json({ error: "Cannot book appointments in the past" });
    }

    const existing = await Appointment.findOne({ doctor: doctorId, slotDate, slotTime, status: { $in: ["booked", "pending_payment"] } });
    if (existing) return res.status(409).json({ error: "This slot is already booked" });
    const appointment = await Appointment.create({ patient: req.user.id, doctor: doctorId, hospital: hospitalId, slotDate, slotTime, isEmergency: isEmergency || false, status: "pending_payment" });
    res.status(201).json({ appointment });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.get("/my", verifyToken, requireRole("patient"), async (req, res) => {
  const appointments = await Appointment.find({ patient: req.user.id }).populate("doctor", "name").populate("hospital", "name city").populate("payment").sort("-createdAt");
  res.json({ appointments });
});

router.get("/doctor", verifyToken, requireRole("doctor"), async (req, res) => {
  const { date, status } = req.query;
  const filter = { doctor: req.user.id };
  if (date) filter.slotDate = date;
  if (status) filter.status = status;
  const appointments = await Appointment.find(filter).populate("patient", "name phone email gender dob bloodGroup").populate("hospital", "name").sort("slotDate slotTime");
  res.json({ appointments });
});

router.get("/hospital", verifyToken, requireRole("receptionist"), async (req, res) => {
  const Receptionist = (await import("../models/Receptionist.js")).default;
  const receptionist = await Receptionist.findById(req.user.id);
  if (!receptionist) return res.status(404).json({ error: "Receptionist not found" });
  const { date, status } = req.query;
  const filter = { hospital: receptionist.hospital };
  if (date) filter.slotDate = date;
  if (status) filter.status = status;
  const appointments = await Appointment.find(filter).populate("patient", "name phone email").populate("doctor", "name").sort("slotDate slotTime");
  res.json({ appointments });
});

router.get("/all", verifyToken, requireRole("admin"), async (req, res) => {
  const { page = 1, limit = 20, status, date } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (date) filter.slotDate = date;
  const appointments = await Appointment.find(filter).populate("patient", "name phone email").populate("doctor", "name").populate("hospital", "name city").sort("-createdAt").skip((page - 1) * limit).limit(Number(limit));
  const total = await Appointment.countDocuments(filter);
  res.json({ appointments, total, page: Number(page), pages: Math.ceil(total / limit) });
});

router.patch("/:id/check-in", verifyToken, requireRole("receptionist"), async (req, res) => {
  const appointment = await Appointment.findByIdAndUpdate(req.params.id, { checkedInAt: new Date() }, { new: true }).populate("patient", "name").populate("doctor", "name");
  if (!appointment) return res.status(404).json({ error: "Appointment not found" });
  res.json({ appointment });
});

router.patch("/:id/complete", verifyToken, requireRole("doctor"), async (req, res) => {
  const appointment = await Appointment.findOneAndUpdate({ _id: req.params.id, doctor: req.user.id }, { status: "completed" }, { new: true });
  if (!appointment) return res.status(404).json({ error: "Appointment not found" });
  res.json({ appointment });
});

router.patch("/:id/cancel", verifyToken, async (req, res) => {
  const filter = { _id: req.params.id };
  if (req.user.role === "patient") filter.patient = req.user.id;
  const appointment = await Appointment.findOneAndUpdate(filter, { status: "cancelled" }, { new: true });
  if (!appointment) return res.status(404).json({ error: "Appointment not found" });
  res.json({ appointment });
});

export default router;
