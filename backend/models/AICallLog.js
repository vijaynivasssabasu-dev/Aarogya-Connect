import mongoose from "mongoose";

const aiCallLogSchema = new mongoose.Schema(
  {
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    twilioCallSid: String,
    callStatus: {
      type: String,
      enum: ["initiated", "answered", "no_answer", "failed", "completed"],
      default: "initiated",
    },
    languageSelected: String, // "en", "te", "hi"
    missedReason: String, // why the patient did not come
    rawSpeechTranscript: String, // what the patient said for rescheduling
    rescheduledToDate: String, // parsed result
    rescheduledToTime: String,
  },
  { timestamps: true }
);

export default mongoose.model("AICallLog", aiCallLogSchema);
