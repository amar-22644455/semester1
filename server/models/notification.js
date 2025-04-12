// models/Notification.js
const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['like', 'comment', 'follow'], 
    required: true 
  },
  post: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Post' 
  }, // Only for post-related notifications
  commentId: { type: mongoose.Schema.Types.ObjectId }, // For comment replies
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Indexes for faster queries
NotificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });



module.exports = mongoose.model('Notification', NotificationSchema);