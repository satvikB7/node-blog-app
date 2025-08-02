import { Schema, model } from 'mongoose';
import slugify from 'slugify';

const postSchema = new Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  slug: { type: String, unique: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Generate slug and update timestamp before saving
postSchema.pre('save', function(next) {
  this.slug = slugify(this.title, { lower: true, strict: true });
  this.updatedAt = Date.now();
  next();
});

export default model('Post', postSchema);
