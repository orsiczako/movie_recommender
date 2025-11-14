const express = require('express');
const router = express.Router();
const movieChatController = require('../../../controllers/movieChat.controller');

/**
 * POST /api/chat/movie
 * Chat about a movie with AI
 */
router.post('/movie', (req, res) => movieChatController.chatAboutMovie(req, res));

module.exports = router;
