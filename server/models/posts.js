const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  username: { type: String, required: true },
  institute: { type: String, required: true },
  text: { type: String },
  media: {
    url: { type: String, required: true },
    fileType: { type: String, enum: ["image", "video", "document"], required: true },
    size: { type: Number } // Optional: Size in bytes
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Array of user IDs
  comments: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      username: { type: String, required: true }, // Prevents extra queries
      profileImage: { type: String, default: "https://picsum.photos/100" },
      text: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  shares: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }] // Stores who shared the post
},
{ timestamps: true }
);

// Virtual fields
PostSchema.virtual("likeCount").get(function () {
  return this.likes?.length;
});

PostSchema.virtual("commentCount").get(function () {
  return this.comments?.length;
});

PostSchema.virtual("shareCount").get(function () {
  return this.shares?.length;
});

// Ensure virtuals are included when converting documents
PostSchema.set("toJSON", { virtuals: true });
PostSchema.set("toObject", { virtuals: true });

// Indexes for efficient querying
PostSchema.index({ userId: 1, createdAt: -1 }); // Optimized for user-specific queries
PostSchema.index({ createdAt: -1 }); // Sorting posts by newest first

const Post = mongoose.model("Post", PostSchema);
module.exports = Post;
