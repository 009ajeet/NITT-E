const express = require("express");
const router = express.Router();
const Notice = require("../models/Notice");

// Middlewares
const { auth, authorize } = require("../middleware/auth");

/**
 * Get all notices for user by role
 */
router.get("/", auth, async (req, res) => {
  try {
    const notices = await Notice.find({
      targetRoles: { $in: [req.user.role] }, // Filter by user role
    }).sort({ createdAt: -1 });

    res.json(notices);
  } catch (error) {
    console.error("Error fetching notices:", error);
    res.status(500).json({ message: "Error fetching notices" });
  }
});

/**
 * Get single notice by ID
 */
router.get("/:id", auth, async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }

    // Check if notice targets this role
    if (!notice.targetRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access Denied: You are not authorized to view this notice" });
    }

    res.json(notice);
  } catch (error) {
    console.error("Error fetching notice:", error);
    res.status(500).json({ message: "Error fetching notice" });
  }
});

/**
 * Create new notice (Admin only)
 */
router.post("/", auth, authorize(["admin"]), async (req, res) => {
  try {
    const { title, description, expiresAt, targetRoles } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and Description are required" });
    }

    const newNotice = new Notice({
      title,
      description,
      postedBy: req.user.userId,
      expiresAt,
      targetRoles: targetRoles || ["student", "content_admin", "admin"],
    });

    await newNotice.save();
    res.status(201).json({ message: "Notice posted successfully!", notice: newNotice });
  } catch (error) {
    console.error("Error posting notice:", error);
    res.status(500).json({ message: "Error posting notice" });
  }
});

/**
 * Update notice (Admin only)
 */
router.put("/:id", auth, authorize(["admin"]), async (req, res) => {
  try {
    const { title, description, expiresAt, targetRoles } = req.body;

    const updatedNotice = await Notice.findByIdAndUpdate(
      req.params.id,
      { title, description, expiresAt, targetRoles },
      { new: true }
    );

    if (!updatedNotice) {
      return res.status(404).json({ message: "Notice not found" });
    }

    res.json({ message: "Notice updated successfully", notice: updatedNotice });
  } catch (error) {
    console.error("Error updating notice:", error);
    res.status(500).json({ message: "Error updating notice" });
  }
});

/**
 * Delete notice (Admin only)
 */
router.delete("/:id", auth, authorize(["admin"]), async (req, res) => {
  try {
    const deletedNotice = await Notice.findByIdAndDelete(req.params.id);

    if (!deletedNotice) {
      return res.status(404).json({ message: "Notice not found" });
    }

    res.json({ message: "Notice deleted successfully" });
  } catch (error) {
    console.error("Error deleting notice:", error);
    res.status(500).json({ message: "Error deleting notice" });
  }
});

module.exports = router;