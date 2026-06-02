const mongoose = require("mongoose");

const achievementSchema = new mongoose.Schema(
  {
    // ================= OWNER =================
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ================= CATEGORY =================
    category: {
      type: String,
      enum: ["Technical", "Cultural", "Sports", "Academic"],
      required: true,
      index: true,
    },

    // ================= TITLE =================
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    // ================= DESCRIPTION =================
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    // ================= DISPLAY DATE =================
    date: {
      type: String, // e.g. "Jan 2024"
      required: true,
      trim: true,
    },

    // ================= OPTIONAL MEDIA =================
    certificateUrl: {
      type: String,
      trim: true,
      match: /^https?:\/\/.+/i, // basic URL validation
    },

    imageUrl: {
      type: String,
      trim: true,
      match: /^https?:\/\/.+/i,
    },

    // ================= TAGS =================
    tags: {
      type: [String],
      default: [],
      set: tags =>
        tags.map(tag => tag.toLowerCase().trim()),
    },

    // ================= VISIBILITY =================
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

/* ================= INDEXES ================= */

// Fast sorting + filtering
achievementSchema.index({ user: 1, createdAt: -1 });

// Optional: prevent duplicate titles per user
achievementSchema.index(
  { user: 1, title: 1 },
  { unique: false } // set true ONLY if you want strict uniqueness
);

module.exports = mongoose.model("Achievement", achievementSchema);
