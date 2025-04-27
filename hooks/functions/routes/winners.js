const express = require('express');
const db = require('../db');
const router = express.Router();

// GET /winners
router.get('/', (req, res) => {
  db.all('SELECT name, prize, timestamp FROM winners ORDER BY timestamp DESC LIMIT 10', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    const result = rows.map(r => ({
      name: r.name,
      prize: r.prize,
      date: new Date(r.timestamp).toLocaleDateString('ru-RU')
    }));
    res.json(result);
  });
});

module.exports = router;
