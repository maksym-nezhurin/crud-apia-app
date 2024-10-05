const Article = require('../models/Article');
const User = require('../models/User');

// CREATE a new article
exports.createArticle = async (req, res) => {
  const { title, content, author, tags, status } = req.body;

  try {
    console.log('hello', author);
    
    const existingUser = await User.findById(author);
    console.log('hello 2');
    if (!existingUser) {
      return res.status(400).json({ msg: 'Author not found in the database' });
    }

    const newArticle = new Article({
      title,
      content,
      author,
      tags,
      status: status || 'draft',  // Default to draft if no status is provided
    });

    await newArticle.save();
    res.status(201).json(newArticle);
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
};

exports.updateArticleStatus = async (req, res) => {
  const { status } = req.body;  // Get the new status from the request body
  const validStatuses = ['draft', 'published', 'archived'];  // Define valid statuses

  try {
    // Find the article by ID
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ msg: 'Article not found' });
    }

    // Validate the new status
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ msg: 'Invalid status' });
    }

    // Update the status
    article.status = status;
    await article.save();  // Save the updated article

    res.json(article);  // Respond with the updated article
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Article not found' });
    }
    res.status(500).send('Server error');
  }
};

// READ: Get all articles or filtered by query (e.g., only published)
exports.getArticles = async (req, res) => {
  try {
    let query = { isDeleted: false };  // Only show articles that are not deleted

    // If the user is a super admin, show all articles (including deleted ones)
    if (req.user && req.user.role === 'super_admin') {
      query = {};  // No filter applied, show all articles including deleted ones
    }

    const articles = await Article.find(query).populate('author', 'name email');
    res.json(articles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// READ: Get a single article by ID
exports.getArticleById = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id).populate('author', 'name email');

    if (!article) {
      return res.status(404).json({ msg: 'Article not found' });
    }

    // If the article is deleted and the user is not a super admin, block access
    if (article.isDeleted && (!req.user || req.user.role !== 'super_admin')) {
      return res.status(403).json({ msg: 'Access denied. Article is deleted.' });
    }

    res.json(article);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Article not found' });
    }
    res.status(500).send('Server error');
  }
};

// UPDATE an article
exports.updateArticle = async (req, res) => {
  const { title, content, tags, status, publishedAt } = req.body;

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
      return res.status(404).json({ msg: 'Article not found' });
    }

    // Set the user who is updating the article
    updatedFields.updatedBy = req.user.id;  // Get the user ID from the JWT middleware

    article = await Article.findByIdAndUpdate(
      req.params.id,
      { $set: updatedFields },
      { new: true }
    );

    res.json(article);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Article not found' });
    }
    res.status(500).send('Server error');
  }
};

// DELETE an article
exports.deleteArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ msg: 'Article not found' });
    }

    // Check if the article is already marked as deleted
    if (article.isDeleted) {
      return res.status(400).json({ msg: 'Article is already deleted' });
    }

    // Mark the article as deleted
    article.isDeleted = true;
    article.deletedBy = req.user.id;  // Get the user ID from the JWT middleware
    article.deletedAt = new Date();  // Store the current timestamp for when the deletion happened

    await article.save();  // Save the soft deletion information

    res.json({ msg: 'Article marked as deleted' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Article not found' });
    }
    res.status(500).send('Server error');
  }
};

