const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/users');
const bcrypt = require("bcrypt");
const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if(!email){
    return res.status(400).json({ message: '"email" is required' });
  }
  if(!password){
    return res.status(400).json({ message: '"password" is required' });
  }
  // Find the user by email
  const user = await User.findOne({ email });
  // If the user doesn't exist or the password is incorrect, return an error
  if(!user){
    return res.status(401).json({ message: 'Email is incorrect ' });
  }
  const validPassword = await bcrypt.compare(password, user.password)
  if (!validPassword) {
    return res.status(401).json({ message: 'Password is incorrect ' });
  }

  // Generate a JWT token with the user ID as payload
  const token = jwt.sign({ id : user._id }, process.env.JWT_SECRET);

  // Return the token as JSON
  res.json({ token, user: { id: user._id, name: user.name, username: user.username } });
});


module.exports = router;