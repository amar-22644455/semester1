const express = require("express");
const router = express.Router();
const Achievement = require("../models/Achievement");
const auth = require('../middleware/auth');

router.get("/:userId/achievements", async (req, res) => {
  try {
    const achievements = await Achievement.find({
      user: req.params.userId,
    }).sort({ createdAt: -1 });
    res.json({ achievements });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/:userId/achievements",auth, async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify requesting user is the owner of the profile
    if (req.user.id !== userId) {
      return res.status(403).json({ message: "Unauthorized to add achievements to this profile" });
    }

    const achievement = new Achievement({
      user: userId,
      title: req.body.title,
      category: req.body.category,
      date: req.body.date,
      description: req.body.description,
      tags: req.body.tags,
    });
    await achievement.save();
    res.status(201).json(achievement);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


router.delete("/achievements/:achievementId",auth, async (req, res) => {
  try {
    const achievement = await Achievement.findById(
      req.params.achievementId
    );

    if (!achievement) {
      return res.status(404).json({ message: "Achievement not found" });
    }
    
    // Verify ownership of the achievement before deleting
    if (achievement.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this achievement" });
    }

    await achievement.deleteOne();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
