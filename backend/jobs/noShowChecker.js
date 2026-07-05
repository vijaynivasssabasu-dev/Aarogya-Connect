import cron from "node-cron";
import Appointment from "../models/Appointment.js";
import { callPatient } from "../services/twilioService.js";

/**
 * Runs every 5 minutes. Finds appointments where:
 * - slot time has passed by 25+ minutes
 * - patient never checked in
 * - status is still "booked"
 * - no call has been triggered yet
 * Then places the real Twilio call automatically.
 */
export function startNoShowChecker() {
  cron.schedule("*/5 * * * *", async () => {
    const now = new Date();

    const candidates = await Appointment.find({
      status: "booked",
      checkedInAt: null,
      noShowCallTriggered: false,
    }).populate("patient");

    for (const appt of candidates) {
      const slotDateTime = new Date(`${appt.slotDate}T${appt.slotTime}:00`);
      const minutesLate = (now - slotDateTime) / (1000 * 60);

      if (minutesLate >= 25) {
        try {
          appt.status = "missed";
          appt.noShowCallTriggered = true;
          await appt.save();

          await callPatient({
            toPhoneNumber: appt.patient.phone,
            appointmentId: appt._id.toString(),
          });

          console.log(`No-show call triggered for appointment ${appt._id}`);
        } catch (err) {
          console.error(`Failed to call for appointment ${appt._id}:`, err.message);
        }
      }
    }
  });

  console.log("No-show checker cron job started (runs every 5 min)");
}
