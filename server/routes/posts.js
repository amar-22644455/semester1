const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const Post = require('../models/posts');
const User = require('../models/users');
const { server } = require("../server"); // Import server instance
const socketIo = require("socket.io");

const io = socketIo(server); // Initialize io from the server instance
const multer = require("multer");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Save files in "uploads" directory
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Unique filename
  },
});

const upload = multer({ storage });

router.post(
  '/posts',
  [
    auth, upload.single("media"), // Allows only a single file
    [
      check('text')
        .optional() // Makes it optional
        .isString().withMessage('Text content must be a string') // Ensures it's a string if provided
    ]
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ message: 'Invalid inputs', errors: errors.array() });
    }

    try {
      // Extract data from authenticated user
      const { user } = req;
      const { text = "" } = req.body; // Ensure text is always a string (even empty)
      const file = req.file;
      const media = file ? {
        url: `/uploads/${file.filename}`,
        fileType: file.mimetype.startsWith("image") ? "image" :
                  file.mimetype.startsWith("video") ? "video" : 
                  "document",
        size: file.size,
      } : null;
  
      // Create a new post
      const post = new Post({
          userId: user._id,
          username: user.username,
          institute: user.institute,
          text,
          media, // Store a single file
      });
      // Save post to database
      await post.save();
      if (io) {
        io.emit("newPost", post); // Ensure io is defined before emitting
      } else {
        console.error("Socket.io is not initialized.");
      }
      // Return created post
      res.status(201).json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: 'Server Error' });
    }
  }
);

// Fetch posts for a user
router.get("/posts/:id",auth,async (req, res) => {
  try {
      const posts = await Post.find({ userId: req.params.id }).sort({ createdAt: -1 });
      res.setHeader("Content-Type", "application/json");
      res.json(posts);
  } catch (error) {
      res.status(500).json({ error: "Failed to fetch posts" });
  }
});



// Fetch posts for a user with user details
router.get("/posts/:userId",auth, async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .populate('userId', 'username profileImage'); // Populate user details
    
    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});




// routes/postRoutes.js
// routes/postRoutes.js
router.get('/following', auth, async (req, res) => {
  try {
    console.log('[Following Feed] Starting request processing');
    console.log(`[Following Feed] Authenticated user ID: ${req.user._id}`);

    // 1. Get the current user with their following list
    console.log('[Following Feed] Fetching current user following list');
    const currentUser = await User.findById(req.user._id)
      .select('following');
    
    if (!currentUser) {
      console.log('[Following Feed] Current user not found in database');
      return res.status(404).json({ message: 'User not found' });
    }
    console.log(`[Following Feed] Found ${currentUser.following?.length || 0} users being followed`);

    // 2. Get posts from users they follow (including their own posts)
    const followingIds = [...currentUser.following, req.user._id];
    console.log(`[Following Feed] Fetching posts from ${followingIds.length} users (including self)`);
    
    const posts = await Post.find({
      userId: { $in: followingIds }
    })
    .sort({ createdAt: -1 })
    .populate('userId', 'name username profileImage institute')
    .lean();

    console.log(`[Following Feed] Found ${posts.length} posts`);
    
    // 3. Format response with engagement metrics
    console.log('[Following Feed] Formatting response data');
    const formattedPosts = posts.map(post => {
      const isLiked = post.likes?.some(like => like.equals(req.user._id)) || false;
      const likeCount = post.likes?.length || 0;
      const commentCount = post.comments?.length || 0;
      
      console.log(`[Following Feed] Post ${post._id}: 
        Likes: ${likeCount}, 
        Comments: ${commentCount}, 
        Current User Liked: ${isLiked}`);
      
      return {
        ...post,
        isLiked,
        likeCount,
        commentCount
      };
    });

    console.log('[Following Feed] Successfully processed request');
    res.status(200).json({
      success: true,
      posts: formattedPosts
    });

  } catch (error) {
    console.error('[Following Feed] Error:', {
      timestamp: new Date().toISOString(),
      userId: req.user?._id,
      errorDetails: {
        message: error.message,
        stack: error.stack,
        type: error.name
      },
      requestDetails: {
        method: req.method,
        path: req.path,
        query: req.query,
        params: req.params
      }
    });
    
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch feed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});


const fs = require('fs');
const path = require('path');

router.delete("/delete/:id", auth, async (req, res) => {
  console.log('Delete request received for ID:', req.params.id);
  console.log('Authenticated user ID:', req.user?.id);
  
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log('Invalid ID format');
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    const post = await Post.findById(req.params.id);
    console.log('Found post:', post);
    
    if (!post) {
      console.log('Post not found');
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.userId.toString() !== req.user.id.toString()) {
      console.log('Authorization failed');
      return res.status(403).json({ 
        message: 'Not authorized to delete this post' 
      });
    }

    // Delete associated media file if it exists
    if (post.media && post.media.url) {
      const filename = post.media.url.replace('/uploads/', '');
      const filePath = path.join(__dirname, '..', 'uploads', filename);
      
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('Error deleting file:', err);
          // Don't fail the request if file deletion fails
        } else {
          console.log('Successfully deleted file:', filename);
        }
      });
    }

    const result = await Post.deleteOne({ _id: req.params.id });
    console.log('Deletion result:', result);
    
    res.status(200).json({ 
      success: true,
      message: 'Post deleted successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('FULL ERROR:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while deleting post',
      errorDetails: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack,
        type: error.name
      } : undefined
    });
  }
});






module.exports = router;
