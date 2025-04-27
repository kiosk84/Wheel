const express = require('express');
const db = require('../db');
const router = express.Router();

// GET /prizepool
router.get('/', (req, res) => {
  db.get('SELECT amount FROM prize_pool WHERE id = 1', (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ total: row.amount });
  });
});

module.exports = router;
