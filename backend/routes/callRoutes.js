import express from "express";
import Appointment from "../models/Appointment.js";
import AICallLog from "../models/AICallLog.js";
import { callPatient } from "../services/twilioService.js";

const router = express.Router();

// Manually trigger a no-show call for one appointment (useful for demo/testing)
router.post("/trigger-noshow/:appointmentId", async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.appointmentId).populate("patient");
    if (!appointment) return res.status(404).json({ error: "Appointment not found" });

    const callSid = await callPatient({
      toPhoneNumber: appointment.patient.phone, // must be in E.164 format: +91XXXXXXXXXX
      appointmentId: appointment._id.toString(),
    });

    appointment.noShowCallTriggered = true;
    await appointment.save();

    res.json({ success: true, callSid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get all AI call logs (for Admin review)
router.get("/logs", async (req, res) => {
  try {
    const logs = await AICallLog.find()
      .populate("patient", "name phone")
      .populate("appointment", "slotDate slotTime")
      .sort("-createdAt");
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
