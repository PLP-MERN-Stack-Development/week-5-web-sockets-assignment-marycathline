// server/api/messages.js
const express = require('express');
const router = express.Router();

// Access in-memory messages store from main server
const { messages } = require('../data/memoryStore');

// GET /api/messages?room=general&page=1&limit=20
router.get('/', (req, res) => {
  const { room, page = 1, limit = 20 } = req.query;

  const filtered = room
    ? messages.filter((msg) => msg.room === room)
    : messages;

  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + parseInt(limit));

  res.json({
    page: parseInt(page),
    total: filtered.length,
    messages: paginated,
  });
});

// GET /api/messages/search?q=hello
router.get('/search', (req, res) => {
  const { q = '', room } = req.query;
  const query = q.toLowerCase();

  const results = messages.filter(
    (msg) =>
      (msg.text || "").toLowerCase().includes(query) &&
      (!room || msg.room === room)
  );

  res.json(results);
});

module.exports = router;
