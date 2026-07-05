import express from "express";
import Notification from "../models/Notification.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
  const notifications = await Notification.find({ userId: req.user.id, userRole: req.user.role }).sort("-createdAt").limit(50);
  const unreadCount = await Notification.countDocuments({ userId: req.user.id, userRole: req.user.role, isRead: false });
  res.json({ notifications, unreadCount });
});

router.patch("/:id/read", verifyToken, async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
  res.json({ success: true });
});

router.patch("/read-all", verifyToken, async (req, res) => {
  await Notification.updateMany({ userId: req.user.id, userRole: req.user.role, isRead: false }, { isRead: true });
  res.json({ success: true });
});

export default router;
