const mongoose = require('mongoose');

const connectDB = async () => {
  try {

    await mongoose.connect(process.env.MONGODB_URI, {

      tls: true, // Explicitly enable TLS
      tlsAllowInvalidCertificates: false, // Use only if necessary
      
    });
    console.log('MongoDB connected');
   
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

module.exports = connectDB;