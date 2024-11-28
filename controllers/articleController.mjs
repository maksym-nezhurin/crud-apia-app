import Article from '../models/Article.mjs';
import User from '../models/User.mjs';
import Comment from '../models/Comment.mjs';
import {ARTICLE_CREATED, ARTICLE_DELETED, COMMENT_CREATED} from "../constants/socket.mjs";

export const createArticle = async (req, res) => {
    const {title, content, tags, status = 'draft'} = req.body;

    try {
        const existingUser = await User.findById(req.user.userId);

        if (!existingUser) {
            return res.status(400).json({message: 'Author not found in the database'});
        }

        const newArticle = new Article({
            title,
            content,
            author: existingUser?._id,
            tags,
            status: status || 'draft',  // Default to draft if no status is provided
        });

        await newArticle.save();
        res.status(201).json({
            data: {
                article: newArticle,
                message: 'Article successfully added!'
            }
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

export const updateArticleStatus = async (req, res) => {
    const {status} = req.body;  // Get the new status from the request body
    const validStatuses = ['draft', 'published', 'archived'];  // Define valid statuses

    try {
        // Find the article by ID
        const article = await Article.findById(req.params.id);

        if (!article) {
            return res.status(404).json({message: 'Article not found'});
        }

        // Validate the new status
        if (!validStatuses.includes(status)) {
            return res.status(400).json({message: 'Invalid status'});
        }

        // Update the status
        article.status = status;
        await article.save();  // Save the updated article
        req.io.emit(ARTICLE_CREATED, article);
        res.json(article);  // Respond with the updated article
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(404).json({message: 'Article not found'});
        }
        res.status(500).send('Server error');
    }
};

// READ: Get all articles or filtered by query (e.g., only published)
export const getArticles = async (req, res) => {
    try {
        let query = {isDeleted: false};  // Only show articles that are not deleted

        // If the user is a super admin, show all articles (including deleted ones)
        if (req.user && req.user.role === 'super_admin') {
            query = {};  // No filter applied, show all articles including deleted ones
        }

        const articles = await Article.find(query).populate('author', 'name email');
        res.status(200).json({
            data: {
                articles
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// READ: Get a single article by ID
export const getArticleById = async (req, res) => {
    try {
        const article = await Article.findById(req.params.id).populate('author', 'name email');

        if (!article) {
            return res.status(404).json({message: 'Article not found'});
        }

        if (article.isDeleted && (!req.user || req.user.role !== 'super_admin')) {
            return res.status(403).json({message: 'Access denied. Article is deleted.'});
        }

        res.json(article);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({message: 'Article not found'});
        }
        res.status(500).send('Server error');
    }
};

// UPDATE an article
export const updateArticle = async (req, res) => {
    const {title, content, tags, status, publishedAt} = req.body;

    // Build updated article fields
    const updatedFields = {};
    if (title) updatedFields.title = title;
    if (content) updatedFields.content = content;
    if (tags) updatedFields.tags = tags;
    if (status) updatedFields.status = status;
    if (status === 'published' && !publishedAt) updatedFields.publishedAt = new Date();

    try {
        let article = await Article.findById(req.params.id);

        if (!article) {
            return res.status(404).json({message: 'Article not found'});
        }

        // Set the user who is updating the article
        updatedFields.updatedBy = req.user._id;  // Get the user ID from the JWT middleware

        article = await Article.findByIdAndUpdate(
            req.params.id,
            {$set: updatedFields},
            {new: true}
        );

        res.status(201).json({data: {article, message: 'Successfully updated!'}});
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(404).json({message: 'Article not found'});
        }
        res.status(500).send('Server error');
    }
};

// DELETE an article
export const deleteArticle = async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);

        if (!article) {
            return res.status(404).json({message: 'Article not found'});
        }

        // Check if the article is already marked as deleted
        if (article.isDeleted) {
            return res.status(400).json({message: 'Article is already deleted'});
        }

        // Mark the article as deleted
        article.isDeleted = true;
        article.deletedBy = req.user.id;  // Get the user ID from the JWT middleware
        article.deletedAt = new Date();  // Store the current timestamp for when the deletion happened

        await article.save();  // Save the soft deletion information
        req.io.emit(ARTICLE_DELETED, req.params.id);
        res.status(200).json({
            data: {
                message: 'Article marked as deleted'
            }
        });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({msg: 'Article not found'});
        }
        res.status(500).send('Server error');
    }
};

export const getAllComments = async (req, res) => {
    try {
        const {id} = req.params;

        const article = await Article.findById(id);

        if (!article) {
            return res.status(404).send('Article not found');
        }

        const comments = await Comment.find({article: id}).sort({createdAt: -1});

        if (!comments.length) {
            return res.status(200).send({
                data: {
                    comments: [],
                    message:'Article does not has any comments'
                }
            });
        }

        res.status(200).send({
            data: {
                comments,
                message: ''
            }
        });
    } catch (error) {
        res.status(500).send(error.message)
    }
}

// Add comment to the article
export const commentArticle = async (req, res) => {
    try {
        const {id} = req.params;
        const {userId} = req.user;
        const {comment} = req.body;
        const article = await Article.findById(id);

        if (!article) {
            return res.status(404).send('Article not found');
        }

        const newComment = new Comment({
            article: id,
            user: userId,
            content: comment
        });

        await newComment.save();

        article.comments.push(newComment._id);
        await article.save();

        // Emit the comment to all clients via Socket.IO
        req.io.emit(COMMENT_CREATED, newComment);

        res.status(201).send({
            data: {
                comment: newComment,
                message: 'Comment successfully added!'
            }
        });
    } catch (error) {
        res.status(500).send(error.message)
    }
};
