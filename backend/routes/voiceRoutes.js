import express from "express";
import twilio from "twilio";
import Appointment from "../models/Appointment.js";
import AICallLog from "../models/AICallLog.js";
import { parseRescheduleRequest } from "../utils/parseReschedule.js";

const router = express.Router();
const VoiceResponse = twilio.twiml.VoiceResponse;

const LANGUAGE_MAP = {
  1: { code: "en-IN", label: "English" },
  2: { code: "hi-IN", label: "Hindi" },
};

// STEP 1: Call connects -> ask patient to pick a language via digit press
router.post("/answer", async (req, res) => {
  const { appointmentId } = req.query;
  const twiml = new VoiceResponse();

  const gather = twiml.gather({
    numDigits: 1,
    action: `/api/voice/language-selected?appointmentId=${appointmentId}`,
    method: "POST",
    timeout: 8,
  });
  gather.say({ language: "en-IN" }, "Press 1 for English. Press 2 for Hindi.");

  // If no input received, repeat
  twiml.redirect(`/api/voice/answer?appointmentId=${appointmentId}`);

  res.type("text/xml").send(twiml.toString());
});

// STEP 2: Language chosen -> Ask why they didn't come
router.post("/language-selected", async (req, res) => {
  const { appointmentId } = req.query;
  const digit = req.body.Digits;
  const lang = LANGUAGE_MAP[digit] || LANGUAGE_MAP[1];

  const twiml = new VoiceResponse();

  const queryMsg =
    lang.code === "hi-IN"
      ? "Aapne apni appointment miss kar di hai. Kripya bataiye aap kyu nahi aaye."
      : "You have missed your appointment. Please tell me why you were unable to attend.";

  const gather = twiml.gather({
    input: "speech",
    speechTimeout: "auto",
    action: `/api/voice/process-reason?appointmentId=${appointmentId}&lang=${lang.code}`,
    method: "POST",
  });
  gather.say({ language: lang.code }, queryMsg);

  res.type("text/xml").send(twiml.toString());
});

// STEP 3: Reason processed -> Ask when they want to reschedule
router.post("/process-reason", async (req, res) => {
  const { appointmentId, lang } = req.query;
  const reasonText = req.body.SpeechResult || "No reason given";

  const twiml = new VoiceResponse();

  const queryMsg =
    lang === "hi-IN"
      ? "Hum samajh sakte hain. Aap apni appointment kab reschedule karna chahenge, kripya date aur time batayein."
      : "Thank you for letting us know. When would you like to reschedule your appointment? Please state the preferred date and time.";

  const gather = twiml.gather({
    input: "speech",
    speechTimeout: "auto",
    action: `/api/voice/process-reschedule?appointmentId=${appointmentId}&lang=${lang}&reason=${encodeURIComponent(reasonText)}`,
    method: "POST",
  });
  gather.say({ language: lang }, queryMsg);

  res.type("text/xml").send(twiml.toString());
});

// STEP 4: Preferred time spoken -> parse with LLM -> confirm and update database
router.post("/process-reschedule", async (req, res) => {
  const { appointmentId, lang, reason } = req.query;
  const speechText = req.body.SpeechResult || "";
  const callSid = req.body.CallSid;

  const twiml = new VoiceResponse();

  const appointment = await Appointment.findById(appointmentId).populate("patient");
  if (!appointment) {
    twiml.say("Appointment not found. Goodbye.");
    twiml.hangup();
    return res.type("text/xml").send(twiml.toString());
  }

  const today = new Date().toISOString().split("T")[0];
  const parsed = await parseRescheduleRequest(speechText, today);

  // Save the full call log including the reason why they missed the appointment
  await AICallLog.create({
    appointment: appointmentId,
    patient: appointment.patient._id,
    twilioCallSid: callSid,
    callStatus: "completed",
    languageSelected: lang,
    missedReason: decodeURIComponent(reason),
    rawSpeechTranscript: speechText,
    rescheduledToDate: parsed.date,
    rescheduledToTime: parsed.time,
  });

  if (parsed.understood && parsed.date && parsed.time) {
    appointment.status = "rescheduled";
    appointment.slotDate = parsed.date;
    appointment.slotTime = parsed.time;
    appointment.checkedInAt = null;
    appointment.noShowCallTriggered = false;
    await appointment.save();

    const confirmMsg =
      lang === "hi-IN"
        ? `Aapki appointment ${parsed.date} ko ${parsed.time} baje ke liye reschedule ho gayi hai. Dhanyavaad.`
        : `Your appointment has been successfully rescheduled to ${parsed.date} at ${parsed.time}. Thank you.`;
    twiml.say({ language: lang }, confirmMsg);
  } else {
    // Fallback message
    const fallbackMsg =
      lang === "hi-IN"
        ? "Maaf kijiye, hum reschedule date nahi samajh paye. Kripya app se reschedule karein."
        : "Sorry, I could not understand the reschedule time. Please reschedule through your portal.";
    twiml.say({ language: lang }, fallbackMsg);
  }

  twiml.hangup();
  res.type("text/xml").send(twiml.toString());
});

// Twilio posts final status updates here
router.post("/status", async (req, res) => {
  console.log("Call status update:", req.body.CallStatus, req.body.CallSid);
  res.sendStatus(200);
});

export default router;
