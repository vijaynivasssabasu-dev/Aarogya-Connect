import twilio from "twilio";

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

/**
 * Places a real outbound call to the patient's phone number.
 * Twilio will fetch TwiML instructions from `answerUrl` once the call connects.
 */
export async function callPatient({ toPhoneNumber, appointmentId }) {
  const answerUrl = `${process.env.SERVER_BASE_URL}/api/voice/answer?appointmentId=${appointmentId}`;

  const call = await client.calls.create({
    to: toPhoneNumber, // must be E.164 format e.g. +919876543210
    from: process.env.TWILIO_PHONE_NUMBER,
    url: answerUrl,
    method: "POST",
    // Tracks final call outcome (no-answer, busy, failed, completed)
    statusCallback: `${process.env.SERVER_BASE_URL}/api/voice/status`,
    statusCallbackMethod: "POST",
    statusCallbackEvent: ["completed", "no-answer", "busy", "failed"],
  });

  return call.sid;
}
