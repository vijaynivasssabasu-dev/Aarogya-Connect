import express from "express";
import { verifyToken, requireRole } from "../middleware/auth.js";
import Hospital from "../models/Hospital.js";
import DoctorCategory from "../models/DoctorCategory.js";
import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";
import Receptionist from "../models/Receptionist.js";
import Appointment from "../models/Appointment.js";
import Payment from "../models/Payment.js";

const router = express.Router();
router.use(verifyToken, requireRole("admin"));

router.get("/stats", async (req, res) => {
  const [patients, doctors, appointments, hospitals, revenue] = await Promise.all([
    Patient.countDocuments(), Doctor.countDocuments(), Appointment.countDocuments(), Hospital.countDocuments(),
    Payment.aggregate([{ $match: { status: "success" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
  ]);
  const statusCounts = await Appointment.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);
  const recentAppointments = await Appointment.find().populate("patient", "name").populate("doctor", "name").populate("hospital", "name").sort("-createdAt").limit(10);
  res.json({ counts: { patients, doctors, appointments, hospitals }, totalRevenue: revenue[0]?.total || 0, statusCounts: Object.fromEntries(statusCounts.map(s => [s._id, s.count])), recentAppointments });
});

router.get("/hospitals", async (req, res) => { res.json({ hospitals: await Hospital.find().sort("name") }); });
router.post("/hospitals", async (req, res) => { try { res.status(201).json({ hospital: await Hospital.create(req.body) }); } catch (err) { res.status(400).json({ error: err.message }); } });
router.put("/hospitals/:id", async (req, res) => { const h = await Hospital.findByIdAndUpdate(req.params.id, req.body, { new: true }); if (!h) return res.status(404).json({ error: "Not found" }); res.json({ hospital: h }); });
router.delete("/hospitals/:id", async (req, res) => { await Hospital.findByIdAndDelete(req.params.id); res.json({ success: true }); });

router.get("/categories", async (req, res) => { res.json({ categories: await DoctorCategory.find().sort("categoryName") }); });
router.post("/categories", async (req, res) => { try { res.status(201).json({ category: await DoctorCategory.create(req.body) }); } catch (err) { res.status(400).json({ error: err.message }); } });
router.put("/categories/:id", async (req, res) => { const c = await DoctorCategory.findByIdAndUpdate(req.params.id, req.body, { new: true }); if (!c) return res.status(404).json({ error: "Not found" }); res.json({ category: c }); });
router.delete("/categories/:id", async (req, res) => { await DoctorCategory.findByIdAndDelete(req.params.id); res.json({ success: true }); });

router.get("/patients", async (req, res) => { res.json({ patients: await Patient.find().select("-passwordHash").sort("-createdAt") }); });
router.get("/doctors", async (req, res) => { res.json({ doctors: await Doctor.find().select("-passwordHash").populate("hospital", "name city").populate("category", "categoryName").sort("name") }); });
router.get("/receptionists", async (req, res) => { res.json({ receptionists: await Receptionist.find().select("-passwordHash").populate("hospital", "name city").sort("name") }); });

export default router;
