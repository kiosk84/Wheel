const express = require('express');
const db = require('../db');
const router = express.Router();

// GET /participants
router.get('/', (req, res) => {
  // Изменяем запрос, чтобы получить rowid (который будет использоваться как номер)
  db.all('SELECT rowid, name FROM participants', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });

    // Проверяем, нужно ли вернуть подробную информацию с номерами
    const detailed = req.query.detailed === 'true';

    if (detailed) {
      // Возвращаем подробную информацию с номерами
      res.json(rows.map(r => ({
        name: r.name,
        number: r.rowid
      })));
    } else {
      // Для обратной совместимости возвращаем только имена
      res.json(rows.map(r => r.name));
    }
  });
});

module.exports = router;
