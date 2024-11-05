const Post = require("../models/Post");

module.exports.createPost = async (req, res) => {
    try {
        const newPost = new Post({
            title: req.body.title,
            content: req.body.content,
            author: req.user.id,
        });

        const savedPost = await newPost.save();
        const populatedPost = await Post.findById(savedPost._id)
            .populate('author', 'username')
            .lean();
            
        res.status(201).json(populatedPost);
    } catch (err) {
        console.error('Error saving post:', err.message);
        res.status(500).json({ error: 'Failed to save the post', details: err.message });
    }
};

module.exports.getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find({})
            .populate('author', 'username')
            .lean()
            .exec();

        res.status(200).json({ posts });
    } catch (err) {
        console.error('Error retrieving posts:', err.message);
        res.status(500).json({ error: 'Error retrieving posts' });
    }
};

module.exports.getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('author', 'username')
            .lean()
            .exec();

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.status(200).json(post);
    } catch (err) {
        console.error('Error retrieving the post:', err.message);
        res.status(500).json({ error: 'Error retrieving the post' });
    }
};

module.exports.updatePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.author.toString() !== req.user.id) {
            return res.status(403).json({ 
                message: 'Permission denied - you can only update your own posts' 
            });
        }

        const updates = {
            title: req.body.title,
            content: req.body.content
        };

        const updatedPost = await Post.findByIdAndUpdate(
            req.params.id, 
            updates, 
            { new: true, runValidators: true }
        )
        .populate('author', 'username')
        .lean()
        .exec();

        res.status(200).json({ 
            message: 'Post updated successfully', 
            post: updatedPost 
        });
    } catch (err) {
        console.error('Error updating post:', err.message);
        res.status(500).json({ error: 'Error updating the post' });
    }
};

module.exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.author.toString() !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ 
                message: 'Permission denied - you can only delete your own posts or must be an admin' 
            });
        }

        await Post.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (err) {
        console.error('Error deleting post:', err.message);
        res.status(500).json({ error: 'Error deleting the post' });
    }
};
