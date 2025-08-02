// backend/models/User.js
import { Schema, model } from 'mongoose';
import { hash, compare } from 'bcryptjs';

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    this.password = await hash(this.password, 10);
    next();
  } catch (err) {
    next(err); // Pass any hashing errors
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (password) {
  return await compare(password, this.password);
};

export default model('User', userSchema);
