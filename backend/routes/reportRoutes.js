import express from "express";
import Appointment from "../models/Appointment.js";
import Payment from "../models/Payment.js";
import Patient from "../models/Patient.js";
import { verifyToken, requireRole } from "../middleware/auth.js";

const router = express.Router();
router.use(verifyToken, requireRole("admin"));

router.get("/appointments", async (req, res) => {
  const { startDate, endDate } = req.query;
  const match = {};
  if (startDate && endDate) match.slotDate = { $gte: startDate, $lte: endDate };
  const byStatus = await Appointment.aggregate([{ $match: match }, { $group: { _id: "$status", count: { $sum: 1 } } }]);
  const byDoctor = await Appointment.aggregate([{ $match: match }, { $group: { _id: "$doctor", count: { $sum: 1 } } }, { $lookup: { from: "doctors", localField: "_id", foreignField: "_id", as: "doctorInfo" } }, { $unwind: { path: "$doctorInfo", preserveNullAndEmptyArrays: true } }, { $project: { doctorName: "$doctorInfo.name", count: 1 } }, { $sort: { count: -1 } }, { $limit: 10 }]);
  const byMonth = await Appointment.aggregate([{ $match: match }, { $addFields: { month: { $substr: ["$slotDate", 0, 7] } } }, { $group: { _id: "$month", count: { $sum: 1 } } }, { $sort: { _id: 1 } }]);
  res.json({ byStatus, byDoctor, byMonth });
});

router.get("/revenue", async (req, res) => {
  const byMonth = await Payment.aggregate([{ $match: { status: "success" } }, { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, total: { $sum: "$amount" }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]);
  const total = await Payment.aggregate([{ $match: { status: "success" } }, { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }]);
  res.json({ byMonth, totalRevenue: total[0]?.total || 0, totalPayments: total[0]?.count || 0 });
});

router.get("/patients", async (req, res) => {
  const total = await Patient.countDocuments();
  const byMonth = await Patient.aggregate([{ $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]);
  res.json({ total, byMonth });
});

export default router;
