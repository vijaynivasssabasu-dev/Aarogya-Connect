import express from "express";
import crypto from "crypto";
import Razorpay from "razorpay";
import Payment from "../models/Payment.js";
import Appointment from "../models/Appointment.js";
import { verifyToken, requireRole } from "../middleware/auth.js";

const router = express.Router();

const hasRazorpayKeys = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET;

const razorpay = hasRazorpayKeys
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

if (!hasRazorpayKeys) {
  console.warn("⚠️ WARNING: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not defined. Payments will run in mock/simulator mode.");
}

// STEP 1: Patient wants to pay for a slot -> create a Razorpay order
// POST /api/payments/create-order  { appointmentId, amount }
router.post("/create-order", verifyToken, requireRole("patient"), async (req, res) => {
  try {
    const { appointmentId, amount } = req.body;

    let order;
    if (razorpay) {
      order = await razorpay.orders.create({
        amount: amount * 100, // Razorpay expects paise
        currency: "INR",
        receipt: `appt_${appointmentId}`,
      });
    } else {
      order = {
        id: `order_mock_${Date.now()}`,
        amount: amount * 100,
        currency: "INR",
        receipt: `appt_${appointmentId}`,
      };
    }

    const payment = await Payment.create({
      appointment: appointmentId,
      patient: req.user.id,
      amount,
      status: "created",
      razorpayOrderId: order.id,
    });

    res.json({ order, paymentId: payment._id, keyId: process.env.RAZORPAY_KEY_ID || "mock_razorpay_key" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// STEP 2: Frontend gets payment success callback from Razorpay checkout ->
// sends signature here to verify it's genuine, THEN confirms the appointment.
// POST /api/payments/verify
router.post("/verify", verifyToken, requireRole("patient"), async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId } = req.body;

    if (razorpay) {
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ error: "Payment verification failed" });
      }
    }

    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      {
        status: "success",
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      },
      { new: true }
    );

    // Payment confirmed -> now the appointment officially becomes "booked"
    await Appointment.findByIdAndUpdate(payment.appointment, {
      status: "booked",
      payment: payment._id,
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
