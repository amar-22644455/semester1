const { check, validationResult } = require('express-validator');
const express = require('express');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/users');
const auth = require("../middleware/auth");
const Post = require('../models/posts');
const Notification = require('../models/notification'); // Adjust path as needed

const multer = require("multer");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "profile-images/"); // Save files in "uploads" directory
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Unique filename
  },
});

const upload = multer({ storage });
router.patch(
  '/:id/profile-image',
  auth,
  upload.single('profileImage'),
  async (req, res) => {
    console.log('--- START PROFILE IMAGE UPLOAD ---');
    console.log('Request params:', req.params);
    console.log('Request user:', req.user);
    console.log('Uploaded file:', req.file);

    try {
      // 1. Check if user exists
      console.log('Checking user existence...');
      const user = await User.findById(req.params.id);
      if (!user) {
        console.error('User not found for ID:', req.params.id);
        return res.status(404).json({ error: 'User not found' });
      }
      console.log('User found:', user.username);

      // 2. Authorization check
      console.log('Verifying authorization...');
      console.log('Request user ID:', req.user.id, 'vs Param ID:', req.params.id);
      if (req.user.id !== req.params.id) {
        console.error('Authorization failed - User ID mismatch');
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // 3. Check if file was uploaded
      console.log('Checking file upload...');
      if (!req.file) {
        console.error('No file uploaded');
        return res.status(400).json({ error: 'No image provided' });
      }
      console.log('File uploaded successfully:', {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        filename: req.file.filename
      });

      // 4. Update user
      console.log('Updating user profile image...');
      const updateData = { profileImage: req.file.filename };
      console.log('Update data being sent:', updateData);

      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      ).select('-password');

      console.log('User after update:', {
        id: updatedUser._id,
        profileImage: updatedUser.profileImage
      });

      // 5. Return response
      console.log('--- UPLOAD SUCCESSFUL ---');
      res.json(updatedUser);

    } catch (err) {
      console.error('!!! PROFILE UPLOAD ERROR !!!');
      console.error('Error:', err.message);
      console.error('Stack:', err.stack);
      console.error('Full error object:', err);

      res.status(500).json({ 
        error: 'Failed to upload profile picture',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }
);

// Create a new user (Signup)
router.post('/CreateXp', async (req, res) => {
  try {
    const { name, email, institute, password, username, mobile } = req.body;

    // Check if the email or username already exists
    let existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "Email or username already exists" });
    }



    // Create and save new user
    const user = new User({
      name,
      email,
      institute,
      password,
      username,
      mobile
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Return the new user and token
    res.status(201).json({ 
      message: "User created successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        institute: user.institute,
        mobile: user.mobile
      }
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server Error" });
  }
});

// Get user name (Example API)
router.get('/users/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ name: user.name , username:user.username ,profileImage: user.profileImage  });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server Error" });
  }
});

// Get User Profile with Posts
router.get('/Profile/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);  // Fetch user with posts
    if (!user) return res.status(404).json({ message: "User not found" });
    const posts = await Post.find({ userId: user._id });
    res.json({
      name: user.name,
      username: user.username,
      institute: user.institute,
      posts,
      profileImage: user.profileImage,
      skills:user.skills || [],
      followers: user.followers || 0 ,
      following: user.following || 0
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server Error" });
  }
});

// Get all users for client-side searching
router.get("/all-users", auth, async (req, res) => {
  try {
    // Fetch all users with only necessary fields
    const users = await User.find({})
      .select("username name _id profilePicture") // Add any other fields you want
      .limit(1000); // Set a reasonable limit
    
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Add a new skill to user's profile
router.post('/:userId/skills-add', async (req, res) => {
  try {
    const { userId } = req.params;
    const { skill } = req.body;

    // Input validation
    if (!skill || typeof skill !== 'string' || !skill.trim()) {
      return res.status(400).json({ error: 'Valid skill string is required' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { skills: skill.trim() } }, // Avoid duplicates
      { new: true, select: 'skills' }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Skill added successfully',
      skills: updatedUser.skills
    });

  } catch (error) {
    console.error('Error adding skill:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove a skill from user's profile
// DELETE /api/:userId/skills/:skill
router.delete('/:userId/skills/:skill', async (req, res) => {
  try {
    const { userId, skill } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { skills: skill } }, // Remove the skill string
      { new: true, select: 'skills' }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Skill removed successfully',
      skills: user.skills
    });

  } catch (error) {
    console.error('Error removing skill:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all skills of a user
router.get('/:userId/skills', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('skills');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ skills: user.skills || [] });
  } catch (error) {
    console.error('Error fetching skills:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search users by skill
router.get('/search/skills', async (req, res) => {
  try {
      const { skill } = req.query;

      if (!skill) {
          return res.status(400).json({ error: 'Skill query parameter is required' });
      }

      const users = await User.find(
          { skills: { $regex: skill, $options: 'i' } },
          { name: 1, username: 1, profileImage: 1, skills: 1 }
      );

      res.json(users);

  } catch (error) {
      console.error('Error searching by skill:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all unique skills across all users (for skill suggestions)
router.get('/skills/all', async (req, res) => {
  try {
      const skills = await User.aggregate([
          { $unwind: '$skills' },
          { $group: { _id: '$skills' } },
          { $project: { _id: 0, skill: '$_id' } }
      ]);

      res.json(skills.map(item => item.skill));

  } catch (error) {
      console.error('Error fetching all skills:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

// // Search users by name or username
// router.get("/search",auth, async (req, res) => {
//   try {
//     const { query } = req.query;

//     if (!query) {
//       return res.status(400).json({ message: "Query is required" });
//     }

//     // Search for users where either username or name matches the query
//     const users = await User.find({
//       $or: [
//         { username: { $regex: query, $options: "i" } }, // Case-insensitive username match
//         { name: { $regex: query, $options: "i" } }, // Case-insensitive name match
//       ],
//     }).select("username name _id"); // Fetch only required fields

//     res.json(users);
//   } catch (error) {
//     console.error("Search Error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

router.get('/userprofile/:id', auth, async (req, res) => {
  try {
    const profileUser = await User.findById(req.params.id).select('-password');
    if (!profileUser) return res.status(404).json({ message: "User not found" });

    const posts = await Post.find({ userId: req.params.id });

    // Check if logged-in user follows the profile user
    const isFollowing = profileUser.followers.includes(req.user.id);

    res.json({
      user: {
        id: profileUser._id,
        name: profileUser.name,
        username: profileUser.username,
        institute: profileUser.institute,
        profileImage: profileUser.profileImage,
        skills: profileUser.skills || [],
        followers: profileUser.followers || [],
        following: profileUser.following || []
      },
      isFollowing,
      posts
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server Error" });
  }
});

// Helper function to send real-time notification
const sendRealTimeNotification = (io, userId, notificationData) => {
  const recipientRoom = `user_${userId}`;
  if (io.sockets.adapter.rooms.has(recipientRoom)) {
    io.to(recipientRoom).emit('new_notification', notificationData);
    return true;
  }
  return false;
};



// routes/users.js
router.post("/follow/:id", auth, async (req, res) => {
  try {
    const loggedInUserId = req.user.id;
    const targetUserId = req.params.id;
    const io = req.app.get('io');

    if (loggedInUserId === targetUserId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const [loggedInUser, targetUser] = await Promise.all([
      User.findById(loggedInUserId).select('following username profileImage'),
      User.findById(targetUserId).select('followers unreadNotifications'),
    ]);

    if (!loggedInUser || !targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isCurrentlyFollowing = loggedInUser.following.includes(targetUserId);

    if (isCurrentlyFollowing) {
      loggedInUser.following.pull(targetUserId);
      targetUser.followers.pull(loggedInUserId);
    } else {
      loggedInUser.following.push(targetUserId);
      targetUser.followers.push(loggedInUserId);

      const notificationData = {
        type: 'follow',
        sender: {
          _id: loggedInUser._id,
          username: loggedInUser.username,
          profileImage: loggedInUser.profileImage
        },
        createdAt: new Date(),
        read: false
      };

      const sentRealTime = sendRealTimeNotification(io, targetUserId, notificationData);
      
      if (!sentRealTime) {
        await Notification.create({
          recipient: targetUserId,
          sender: loggedInUserId,
          type: 'follow'
        });
        targetUser.unreadNotifications += 1;
      }
    }

    await Promise.all([loggedInUser.save(), targetUser.save()]);

    res.json({
      success: true,
      isFollowing: !isCurrentlyFollowing,
      updatedFollowerCount: targetUser.followers.length,
    });

  } catch (error) {
    console.error("Follow/Unfollow error:", error);
    res.status(500).json({ message: "Server error" });
  }
});



// Get unread notifications
// In your notification fetching route
router.get('/notifications/unread', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user.id,
      read: false
    })
    .populate('sender', 'username profileImage') // Populate sender with needed fields
    .populate('post', 'media') // Populate post with media
    .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Mark notifications as read
// Mark notifications as read
router.patch('/notifications/mark-read/:id', auth, async (req, res) => {
  try {
   

    // Debug the query parameters
   
    
    // Count unread notifications before update
    const beforeCount = await Notification.countDocuments({
      recipient: req.user.id,
      read: false
    });
    

    // Update all unread notifications
    const updateResult = await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { $set: { read: true, readAt: new Date() } }
    );
    

    // Verify the update
    const afterCount = await Notification.countDocuments({
      recipient: req.user.id,
      read: false
    });

    // Update user's unread count
    const userBefore = await User.findById(req.user.id).select('unreadNotifications');
    

    const userUpdate = await User.findByIdAndUpdate(
      req.user.id,
      { unreadNotifications: 0 },
      { new: true }
    );
   

    // Debug response
    
    const response = { 
      success: true,
      stats: {
        notificationsMarked: updateResult.modifiedCount,
        previousUnreadCount: userBefore.unreadNotifications
      }
    };

    res.json(response);

  } catch (error) {

    
    res.status(500).json({ 
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});


router.post('/actions', auth, [
  check('postId', 'Post ID is required').not().isEmpty(),
  check('actionType', 'Valid action type is required').isIn(['like', 'unlike', 'comment'])
], async (req, res) => {
  console.log('--- STARTING ACTION PROCESSING ---');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  console.log('Authenticated user ID:', req.user.id);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error('Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { postId, actionType, commentText } = req.body;
  const senderId = req.user.id;
  const io = req.app.get('io');


  const sender = await User.findById(senderId);
            if (!sender) {
              console.error('Sender user not found');
              return res.status(404).json({ msg: 'User not found' });
            };

  try {
    console.log(`Looking for post with ID: ${postId}`);
    // First get the post with its direct fields
    const post = await Post.findById(postId);
    
    if (!post) {
      console.error('Post not found with ID:', postId);
      return res.status(404).json({ msg: 'Post not found' });
    }


    
    // Then get the user's unreadNotifications separately
    const user = await User.findById(post.userId)
      .select('unreadNotifications');

    const recipientId = post.userId;
    const isSelfAction = senderId.toString() === recipientId.toString();
    console.log(`Action details - Sender: ${senderId}, Recipient: ${recipientId}, IsSelfAction: ${isSelfAction}`);

    switch (actionType) {
      case 'like':
        console.log('Processing LIKE action...');
        if (post.likes.includes(senderId)) {
          console.log('User already liked this post');
          return res.status(400).json({ msg: 'Post already liked' });
        }

        post.likes.push(senderId);
        await post.save();
        console.log('Post liked successfully. Updated likes:', post.likes);

        if (!isSelfAction) {
          console.log('Creating like notification...');
          const notificationData = {
            type: 'like',
            sender: sender._id,
            post: post._id,
            createdAt: new Date(),
            read: false
          };

          console.log('Attempting to send real-time notification');
          const sentRealTime = sendRealTimeNotification(io, recipientId, notificationData);
          console.log('Real-time notification sent:', sentRealTime);
          
          if (!sentRealTime) {
            console.log('Falling back to database notification');
            await Notification.create({
              recipient: recipientId,
              sender: sender._id,
              type: 'like',
              post: post._id
            });
            // Update unread notifications count
            await User.findByIdAndUpdate(recipientId, {
              $inc: { unreadNotifications: 1 }
            });
            console.log('Database notification created and unread count incremented');
          }
        }

        return res.json({ 
          msg: 'Post liked', 
          likes: post.likes,
          username: post.username // From Post schema
        });

      case 'unlike':
        console.log('Processing UNLIKE action...');
        if (!post.likes.includes(senderId)) {
          console.log('User has not liked this post yet');
          return res.status(400).json({ msg: 'Post not liked yet' });
        }

        post.likes = post.likes.filter(id => id.toString() !== senderId.toString());
        await post.save();
        console.log('Post unliked successfully. Updated likes:', post.likes);

        if (!isSelfAction) {
          console.log('Removing like notification...');
          const result = await Notification.deleteOne({
            recipient: recipientId,
            sender: sender._id,
            type: 'like',
            post: post._id
          });
          console.log('Notification deletion result:', result);
        }

        return res.json({ 
          msg: 'Post unliked', 
          likes: post.likes,
          username: post.username // From Post schema
        });

        case 'comment':
          console.log('Processing COMMENT action...');
          if (!commentText || commentText.trim() === '') {
            console.error('Empty comment text received');
            return res.status(400).json({ msg: 'Comment text is required' });
          }
        
          try {
            // First get the sender's user document to ensure we have all required field
        
            // Create properly structured comment
            const newComment = {
              text: commentText.trim(),
              userId: sender._id, // Use the actual ObjectId
              username: sender.username, // Verified username from DB
              profileImage: sender.profileImage, // Make sure this field exists
              createdAt: new Date()
            };
        
            // Add comment to post
            post.comments.push(newComment);
            await post.save();
            
            console.log('Comment added to post. Total comments:', post.comments.length);
            const newCommentId = post.comments[post.comments.length - 1]._id;
        
            // Notification handling (unchanged)
            if (!isSelfAction) {
              console.log('Creating comment notification...');
              const notificationData = {
                type: 'comment',
                sender: sender._id,
                post: post._id,
                commentId: newCommentId,
                createdAt: new Date(),
                read: false
              };
        
              const sentRealTime = sendRealTimeNotification(io, recipientId, notificationData);
              
              if (!sentRealTime) {
                await Notification.create({
                  recipient: recipientId,
                  sender: sender._id,
                  type: 'comment',
                  post: post._id,
                  commentId: newCommentId
                });
                await User.findByIdAndUpdate(recipientId, {
                  $inc: { unreadNotifications: 1 }
                });
              }
            }
        
            // Return the populated comment
            const populatedPost = await Post.findById(postId)
              .populate({
                path: 'comments.userId',
                select: 'username'
              });
        
            return res.json({
              msg: 'Comment added',
              comment: populatedPost.comments.id(newCommentId),
              comments: populatedPost.comments,
              username: post.username
            });
        
          } catch (err) {
            console.error('Error processing comment:', err);
            return res.status(500).json({ msg: 'Error adding comment' });
          }
      default:
        console.error('Invalid action type received:', actionType);
        return res.status(400).json({ msg: 'Invalid action type' });
    }
  } catch (err) {
    console.error('!!! ERROR IN ACTION PROCESSING !!!');
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    console.error('Full error object:', err);
    
    res.status(500).send('Server Error');
  } finally {
    console.log('--- ACTION PROCESSING COMPLETED ---');
  }
});

router.get('/:postId/like-status', auth, async (req, res) => {
  try {
    console.log('Starting /:postId/like-status endpoint');
    console.log('Authenticated user ID:', req.user?.id);
    
    const postId = req.params.postId;
    const userId = req.user.id;
    
    console.log(`Checking like status for post ${postId} and user ${userId}`);
    
    // Find the post and include the likes array
    const post = await Post.findById(postId)
      .select('likes likeCount');
    
    if (!post) {
      console.log(`Post with ID ${postId} not found`);
      return res.status(404).json({ message: "Post not found" });
    }
    
    // Check if user exists in the post's likes array
    const isLiked = post.likes.some(like => like.equals(userId));
    console.log('Like exists check result:', isLiked);
    console.log('Retrieved post likeCount:', post.likeCount);
    
    res.json({ 
      isLiked: isLiked,
      likeCount: post.likeCount 
    });
    
    console.log('Successfully completed like-status request');
  } catch (error) {
    console.error('Error in /:postId/like-status:', error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all notifications (both read and unread)
router.get('/notifications/all', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user.id
    })
    .populate('sender', 'username profileImage')
    .populate('post', 'media')
    .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});
module.exports = router;

