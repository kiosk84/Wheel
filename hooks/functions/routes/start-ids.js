const express = require('express');
const db = require('../db');
const { sendTelegramMessage } = require('../services/telegram');
const { ADMIN_ID } = require('../bot'); // Импортируем ADMIN_ID
const router = express.Router();

// Создаём таблицу start_ids, если не существует
// (лучше вынести в миграции, но для простоты делаем здесь)
db.run(`CREATE TABLE IF NOT EXISTS start_ids (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  telegramId TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL
)`);

db.run(`CREATE TABLE IF NOT EXISTS paid_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  telegramId TEXT NOT NULL UNIQUE,
  name TEXT,
  paid_at INTEGER NOT NULL
)`);

db.run(`CREATE TABLE IF NOT EXISTS participating_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  telegramId TEXT NOT NULL UNIQUE,
  name TEXT,
  joined_at INTEGER NOT NULL
)`);

// POST /start-ids — добавить стартовый id
router.post('/', (req, res) => {
  const { telegramId } = req.body;
  if (!telegramId) return res.status(400).json({ error: 'telegramId required' });
  db.run(
    'INSERT OR IGNORE INTO start_ids (telegramId, created_at) VALUES (?, ?)',
    [telegramId, Date.now()],
    async function (err) { // Добавляем async
      if (err) return res.status(500).json({ error: 'DB error' });
      // Отправляем уведомление админу о новом старте
      if (this.changes > 0) { // Отправляем только если запись была добавлена
        try {
          await sendTelegramMessage(ADMIN_ID, `🚀 Новый пользователь нажал "Старт"\n🆔 Telegram ID: <code>${telegramId}</code>`, { parse_mode: 'HTML' });
        } catch (e) {
          console.error('Ошибка отправки уведомления админу (старт):', e);
        }
      }
      return res.json({ success: true });
    }
  );
});

// GET /start-ids — получить все стартовые id
router.get('/', (req, res) => {
  db.all('SELECT * FROM start_ids', (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(rows);
  });
});

// POST /paid-users — добавить оплатившего пользователя
router.post('/paid-users', (req, res) => {
  const { telegramId, name } = req.body;
  if (!telegramId) return res.status(400).json({ error: 'telegramId required' });
  db.run(
    'INSERT OR IGNORE INTO paid_users (telegramId, name, paid_at) VALUES (?, ?, ?)',
    [telegramId, name || null, Date.now()],
    function (err) {
      if (err) return res.status(500).json({ error: 'DB error' });
      return res.json({ success: true });
    }
  );
});

// GET /paid-users — получить всех оплативших
router.get('/paid-users', (req, res) => {
  db.all('SELECT * FROM paid_users', (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(rows);
  });
});

// POST /participating-users — добавить пользователя, решившего участвовать
router.post('/participating-users', (req, res) => {
  const { telegramId, name } = req.body;
  if (!telegramId) return res.status(400).json({ error: 'telegramId required' });
  db.run(
    'INSERT OR IGNORE INTO participating_users (telegramId, name, joined_at) VALUES (?, ?, ?)',
    [telegramId, name || null, Date.now()],
    async function (err) { // Добавляем async
      if (err) return res.status(500).json({ error: 'DB error' });
      // Отправляем уведомление админу о решившем участвовать
      if (this.changes > 0) { // Отправляем только если запись была добавлена
        try {
          await sendTelegramMessage(ADMIN_ID, `💡 Пользователь нажал "Участвовать"\n🆔 Telegram ID: <code>${telegramId}</code>`, { parse_mode: 'HTML' });
        } catch (e) {
          console.error('Ошибка отправки уведомления админу (участие):', e);
        }
      }
      return res.json({ success: true });
    }
  );
});

// GET /participating-users — получить всех решивших участвовать
router.get('/participating-users', (req, res) => {
  db.all('SELECT * FROM participating_users', (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(rows);
  });
});

module.exports = router;
