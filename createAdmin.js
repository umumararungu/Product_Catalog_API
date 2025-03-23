const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost:27017/productCatalog', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const createAdmin = async () => {
  const admin = new User({
    username: 'admin',
    password: 'admin123', // Replace with a secure password
    role: 'admin',
  });

  await admin.save();
  console.log('Admin user created successfully');
  mongoose.disconnect();
};

createAdmin();
