# AI No-Show Call — Setup Guide

## Why this correctly works
Twilio physically dials the patient's real phone number. When they pick up, Twilio
asks YOUR server "what do I say/do next?" via webhook (`/api/voice/answer`), and your
server replies with TwiML instructions. This request-response loop continues for
each step (language choice → message → reschedule capture) — it is a genuine live
phone call, not a simulation.

## One-time setup

1. **Get a Twilio trial account** — twilio.com/try-twilio (free trial gives you a
   real phone number + trial credit, enough for hackathon demo calls).

2. **Verify your test phone number** — Twilio trial accounts can only call numbers
   you've verified in the console (Phone Numbers → Verified Caller IDs). Do this
   for your own number and your teammates' numbers before the demo.

3. **Install ngrok** (`npm install -g ngrok` or download from ngrok.com) — Twilio
   needs a public HTTPS URL to reach your local server during development.

4. Copy `.env.example` to `.env` and fill in:
   - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` — from Twilio Console
   - `MONGO_URI` — from MongoDB Atlas
   - `ANTHROPIC_API_KEY` — from console.anthropic.com

## Running it

```bash
cd backend
npm install
npm run dev          # starts server on port 5000

# in a separate terminal
ngrok http 5000       # copy the https URL it gives you
```

Paste the ngrok https URL into `.env` as `SERVER_BASE_URL`, then restart the server.

## Testing the call

You need one Patient and one Appointment in the database first (with a verified
phone number in E.164 format, e.g. `+919876543210`).

```bash
curl -X POST http://localhost:5000/api/calls/trigger-noshow/<appointmentId>
```

Your phone will ring within a few seconds. Walk through:
1. Press 1 (English) or 2 (Hindi)
2. Listen to the missed-appointment message
3. Speak your reschedule time, e.g. "next Monday at 5 PM"
4. Hear the confirmation — check MongoDB: the appointment's `slotDate`/`slotTime`
   should now be updated, and a new `AICallLog` document will exist.

## Known limitations to mention in your demo/PPT
- Twilio trial accounts can only call **verified** numbers — fine for a demo,
  but production needs a paid Twilio number.
- Twilio's built-in `<Say>` TTS does not support Telugu natively. For the
  hackathon, English + Hindi are wired up. If Telugu is a hard requirement,
  swap `<Say>` for `<Play>` with pre-recorded Telugu audio clips, or use a
  third-party TTS (e.g. Google Cloud TTS supports te-IN) and host the generated
  audio file for Twilio to play.
- The no-show checker cron job needs the server running continuously — on
  Render/Railway free tier, make sure the service doesn't spin down, or trigger
  the check via a scheduled external ping instead.
