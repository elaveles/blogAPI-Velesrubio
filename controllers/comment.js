const Comment = require("../models/Comment");
const Post = require("../models/Post");

module.exports.createComment = async (req, res) => {
    try {
        const { postId, comment } = req.body;

        const newComment = new Comment({
            postId,
            userId: req.user.id,
            comment
        });

        const savedComment = await newComment.save();
        const updatedPost = await Post.findByIdAndUpdate(
            postId,
            { $push: { comments: savedComment._id } },
            { new: true }
        );

        if (!updatedPost) {
            await Comment.findByIdAndDelete(savedComment._id);
            return res.status(404).json({ message: 'Post not found' });
        }

        res.status(201).json({
            message: 'Comment added successfully',
            comment: savedComment,
            post: updatedPost
        });
    } catch (err) {
        console.error('Error creating comment:', err);
        res.status(500).json({ error: 'Error adding comment', details: err.message });
    }
};

module.exports.getCommentsByPostId = async (req, res) => {
    try {
        const comments = await Comment.find({ postId: req.params.postId })
            .populate('userId', 'username');
        res.status(200).json({ comments });
    } catch (err) {
        console.error('Error fetching comments:', err);
        res.status(500).json({ error: 'Error retrieving comments', details: err.message });
    }
};

module.exports.deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        const post = await Post.findById(comment.postId);
        const isPostAuthor = post && post.author.toString() === req.user.id;
        const isCommentAuthor = comment.userId.toString() === req.user.id;
        
        if (!isCommentAuthor && !isPostAuthor && !req.user.isAdmin) {
            return res.status(403).json({ 
                message: 'Permission denied - you must be the comment author, post author, or an admin to delete this comment' 
            });
        }

        await Post.findByIdAndUpdate(
            comment.postId,
            { $pull: { comments: comment._id } }
        );

        await Comment.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (err) {
        console.error('Error deleting comment:', err);
        res.status(500).json({ error: 'Error deleting the comment', details: err.message });
    }
};
