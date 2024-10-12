import express from 'express';

import {
  createArticle,
  getArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
  updateArticleStatus,
  commentArticle,
  getAllComments
} from '../controllers/articleController';
import auth from '../middleware/auth';  // Assuming you want to protect some routes

const router = express.Router();

// Route to create a new article
router.post('/', auth, createArticle);

// Route to get all articles (optional filter by status)
router.get('/', getArticles);

// Route to get a single article by ID
router.get('/:id', getArticleById);

// Route to update an article by ID
router.put('/:id', auth, updateArticle);

// Route to update the status of an article
router.patch('/:id/status', auth, updateArticleStatus);  // PATCH for partial updates

// Route to delete an article by ID
router.delete('/:id', auth, deleteArticle);

router.post('/:id/comments', auth, commentArticle);

router.get('/:id/comments', auth, getAllComments)

export default router;
