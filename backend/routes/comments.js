const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const BaziRecord = require('../models/BaziRecord');
const Comment = require('../models/Comment');
const Action = require('../models/Action');

function canViewRecord(record, user) {
  if (!record.addToCommunity) {
    return record.userId.toString() === user._id.toString();
  }
  if (user.admin === 1) return true;
  const type = record.shareSettings?.type || 'public';
  if (type === 'public') return true;
  const allowed = (record.shareSettings?.allowedUserIds || []).map(id => id.toString());
  return allowed.includes(user._id.toString());
}

/**
 * @route   GET /api/comments/:baziId
 * @desc    获取指定八字的评论列表
 * @access  Private
 */
router.get('/:baziId', protect, async (req, res) => {
  try {
    const record = await BaziRecord.findById(req.params.baziId);
    if (!record) return res.status(404).json({ success: false, message: '八字记录不存在' });
    if (!canViewRecord(record, req.user)) return res.status(403).json({ success: false, message: '无权查看此记录的评论' });

    const comments = await Comment.find({ baziId: record._id })
      .populate('userId', 'username nickname avatarUrl')
      .sort({ createdAt: -1 });

    const likes = await Action.aggregate([
      { $match: { type: 'like', commentId: { $in: comments.map(c => c._id) } } },
      { $group: { _id: '$commentId', count: { $sum: 1 } } }
    ]);
    const likeMap = new Map(likes.map(l => [l._id.toString(), l.count]));

    const myLikes = await Action.find({ type: 'like', userId: req.user._id, commentId: { $in: comments.map(c => c._id) } });
    const myLikeSet = new Set(myLikes.map(a => a.commentId.toString()));

    const data = comments.map(c => ({
      id: c._id,
      baziId: c.baziId,
      user: c.userId,
      replyToCommentId: c.replyToCommentId,
      content: c.content,
      mentions: c.mentions,
      images: c.images,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      likeCount: likeMap.get(c._id.toString()) || 0,
      liked: myLikeSet.has(c._id.toString())
    }));

    res.json({ success: true, data });
  } catch (error) {
    console.error('获取评论列表错误:', error);
    res.status(500).json({ success: false, message: '获取评论失败' });
  }
});

/**
 * @route   POST /api/comments
 * @desc    发布评论
 * @access  Private
 */
router.post('/', protect, async (req, res) => {
  try {
    const { baziId, content, mentions, images, replyToCommentId } = req.body;
    if (!baziId) return res.status(400).json({ success: false, message: '缺少baziId' });
    const record = await BaziRecord.findById(baziId);
    if (!record) return res.status(404).json({ success: false, message: '八字记录不存在' });
    if (!canViewRecord(record, req.user)) return res.status(403).json({ success: false, message: '无权在此记录评论' });

    const comment = await Comment.create({
      baziId: record._id,
      userId: req.user._id,
      replyToCommentId: replyToCommentId || undefined,
      content: content || '',
      mentions: Array.isArray(mentions) ? mentions : [],
      images: Array.isArray(images) ? images : []
    });

    const populated = await comment.populate('userId', 'username nickname avatarUrl');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    console.error('发布评论错误:', error);
    res.status(500).json({ success: false, message: '发布失败' });
  }
});

/**
 * @route   PATCH /api/comments/:id
 * @desc    修改评论
 * @access  Private
 */
router.patch('/:id', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: '评论不存在' });
    if (comment.userId.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: '无权修改此评论' });

    const update = {};
    for (const k of ['content', 'mentions', 'images']) if (req.body[k] !== undefined) update[k] = req.body[k];
    const updated = await Comment.findByIdAndUpdate(comment._id, { $set: update }, { new: true });
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('修改评论错误:', error);
    res.status(500).json({ success: false, message: '修改失败' });
  }
});

/**
 * @route   DELETE /api/comments/:id
 * @desc    删除评论（本人或管理员）
 * @access  Private
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: '评论不存在' });
    if (comment.userId.toString() !== req.user._id.toString() && req.user.admin !== 1) {
      return res.status(403).json({ success: false, message: '无权删除此评论' });
    }
    await comment.deleteOne();
    res.json({ success: true, message: '评论已删除' });
  } catch (error) {
    console.error('删除评论错误:', error);
    res.status(500).json({ success: false, message: '删除失败' });
  }
});

/**
 * @route   POST /api/comments/:id/like
 * @desc    点赞/取消点赞
 * @access  Private
 */
router.post('/:id/like', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: '评论不存在' });

    const existing = await Action.findOne({ type: 'like', commentId: comment._id, userId: req.user._id });
    if (existing) {
      await existing.deleteOne();
    } else {
      await Action.create({ type: 'like', commentId: comment._id, userId: req.user._id });
    }
    const likeCount = await Action.countDocuments({ type: 'like', commentId: comment._id });
    const liked = !existing;
    res.json({ success: true, likeCount, liked });
  } catch (error) {
    console.error('点赞错误:', error);
    res.status(500).json({ success: false, message: '操作失败' });
  }
});

module.exports = router;