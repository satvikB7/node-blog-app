import express from 'express';
import Comment from '../models/Comment.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.post('/:postId', authMiddleware, async (req, res) => {
  const { body } = req.body;
  try {
    const comment = new Comment({ body, post: req.params.postId, user: req.user.id });
    await comment.save();
    const populatedComment = await Comment.findById(comment._id).populate('user', 'username');
    res.json(populatedComment);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get Comments for a Post (public, no auth required)
router.get('/:postId', async (req, res) => {
  const comments = await Comment.find({ post: req.params.postId })
    .populate('user', 'username')
    .sort({ createdAt: -1 }); // Newest first
  res.json(comments);
});

export default router;
