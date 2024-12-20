const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10); // Generates salt
  this.password = await bcrypt.hash(this.password, salt); // Hashes password
  next();
});

module.exports = mongoose.model('User', UserSchema);