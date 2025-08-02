import { Schema, model } from 'mongoose';

const commentSchema = new Schema({
  body: { type: String, required: true },
  post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

export default model('Comment', commentSchema);
