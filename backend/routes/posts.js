import express from 'express';
import Post from '../models/Post.js';
import authMiddleware from '../middleware/auth.js';
import Comment from '../models/Comment.js';

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const posts = await Post.find({ status: 'published' }) 
      .sort({ createdAt: -1 })
      .populate('user', 'username');
    res.json(posts);
  } catch (err) {
    console.error('Error in GET /posts:', err);
    res.status(500).json({ msg: 'Server error', details: err.message });
  }
});


// Create Post (logged-in only)
router.post('/', authMiddleware, async (req, res) => {
  const { title, body, status } = req.body;
  try {
    const post = new Post({ title, body, status, user: req.user.id });
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/visible', async (req, res) => {
  try {
    authMiddleware(req, res, async () => {
      const userId = req.user ? req.user.id : null;
      const { search, publishedOnly, ownOnly, startDate, endDate, draftOnly} = req.query;
      let query = { }; 
      
      if(draftOnly === 'true' && userId)
      {
        query.status='draft';
        query.user=userId;
      }
      else if(publishedOnly === 'true')
      {
        query.status = 'published';
      }else if(userId)
      {
        query = {
          $or: [
            { status: 'published' }, 
            { user: userId } 
          ]
        };
      }else{
        query.status='published';
      }

      if(ownOnly === 'true' && userId && draftOnly !== 'true')
      {
        query.user=userId;
      }

      if(search)
      {
        query.$or = [
          { title: {$regex: search, $options: 'i'}}, 
          { body: {$regex: search, $options: 'i'} } 
        ];
      }

      if(startDate || endDate)
      {
        query.createdAt={};
        if(startDate) query.createdAt.$gte = new Date(startDate);
        if(endDate) query.createdAt.$lte = new Date(endDate + 'T23:59:59.999z');
      }

      const posts = await Post.find(query).sort({ createdAt: -1 }).populate('user', 'username');
      const postsWithOwnership = await Promise.all(posts.map(async (post) => {
        const commentCount = await Comment.countDocuments({post: post._id});
        return{
          ...post.toObject(),
          isOwner: !!userId && post.user._id.toString() === userId,
          commentCount
        };
      }));

      res.json(postsWithOwnership);
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/public', async (req, res) => {
  try {
    const posts = await Post.find({ status: 'published' }).sort({ updatedAt: -1 }).populate('user', 'username');
    res.json(posts);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get User's Posts (for dashboard)
router.get('/my-posts', authMiddleware, async (req, res) => {
  const posts = await Post.find({ user: req.user.id }).sort({ updatedAt: -1 });
  res.json(posts);
});

// Edit Post (own posts only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.user.toString() !== req.user.id) return res.status(403).json({ msg: 'Not authorized' });
    Object.assign(post, req.body);
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});



router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'username');
    if (!post) return res.status(404).json({ msg: 'Post not found' });
    if (post.status !== 'published') return res.status(403).json({ msg: 'Post is not published' });
    res.json(post);
  } catch (err) {
    console.error('Error in GET /posts/:id:', err);
    res.status(500).json({ msg: 'Server error', details: err.message });
  }
});

// Delete Post (own posts only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.user.toString() !== req.user.id) return res.status(403).json({ msg: 'Not authorized' });
    await post.deleteOne();
    res.json({ msg: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get Post by Slug (for viewing, public but we'll handle in frontend)
router.get('/slug/:slug', async (req, res) => {
  const post = await Post.findOne({ slug: req.params.slug }).populate('user', 'username');
  if (!post) return res.status(404).json({ msg: 'Post not found' });
  const comments = await Comment.find({ post: post._id }).populate('user', 'username').sort({ createdAt: -1 });
  res.json({post, comments});
});

export default router;
