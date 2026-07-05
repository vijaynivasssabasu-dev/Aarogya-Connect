import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * Takes raw speech-to-text like "next Monday evening 5 o'clock" or
 * "శుక్రవారం ఉదయం పది గంటలకు" and converts it into a structured date/time.
 * Returns { date: "YYYY-MM-DD", time: "HH:mm" } or null if unclear.
 */
export async function parseRescheduleRequest(speechText, todayISODate) {
  const msg = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 200,
    messages: [
      {
        role: "user",
        content: `Today's date is ${todayISODate}. A patient said this when asked to reschedule their appointment: "${speechText}"

Extract the intended date and time. Respond ONLY with JSON, no other text, in this exact format:
{"date": "YYYY-MM-DD", "time": "HH:mm", "understood": true}

If you cannot confidently determine a date/time, respond with:
{"date": null, "time": null, "understood": false}`,
      },
    ],
  });

  const textBlock = msg.content.find((b) => b.type === "text");
  try {
    const clean = textBlock.text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    return { date: null, time: null, understood: false };
  }
}
