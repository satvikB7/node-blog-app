import express from 'express';
import authMiddleware, {adminMiddleware} from '../middleware/auth.js'; // Updated import
import Post from '../models/Post.js';
import User from '../models/User.js';
import Comment from '../models/Comment.js';

const router = express.Router();

// View all posts (protected)
router.get('/posts', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const posts = await Post.find().populate('user', 'username');
    res.json(posts);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// View all users (protected)
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find({}, 'username email role createdAt');
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete a post (protected)
router.delete('/posts/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });
    await post.deleteOne();
    res.json({ msg: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete a comment (protected)
router.delete('/comments/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ msg: 'Comment not found' });
    await comment.deleteOne();
    res.json({ msg: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

export default router;
