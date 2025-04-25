const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/state — возвращает участников, ожидающих и призовой фонд
router.get('/', async (req, res) => {
  try {
    const participants = await db.getParticipants();
    const pending = await db.getPending();
    const prizepool = await db.getPrizepool();
    res.json({
      participants,
      pending,
      prizepool
    });
  } catch (error) {
    console.error('Ошибка в /api/state:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
