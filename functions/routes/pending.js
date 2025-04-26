const express = require('express');
const db = require('../db');
// Import bot and ADMIN_ID from the bot module to avoid cyclic dependency
const { bot, ADMIN_ID } = require('../bot');
const router = express.Router();

// GET /pending (List pending names - requires admin check potentially)
// TODO: Add authentication/authorization check if this should be admin-only
router.get('/', (req, res) => {
  db.all('SELECT name FROM pending', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows.map(r => r.name));
  });
});

// GET /pending/check?telegramId=...  Проверка участия по telegramId
router.get('/check', (req, res) => {
  const telegramId = req.query.telegramId;
  if (!telegramId) return res.status(400).json({ error: 'telegramId required' });
  // Admin bypass
  if (telegramId === ADMIN_ID) return res.json({ success: true });
  // Проверяем pending
  db.get('SELECT 1 FROM pending WHERE telegramId = ?', [telegramId], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (row) return res.status(409).json({ error: 'Вы уже участвуете в розыгрыше. Дождитесь результатов.' });
    // Проверяем participants
    db.get('SELECT 1 FROM participants WHERE telegramId = ?', [telegramId], (err2, row2) => {
      if (err2) return res.status(500).json({ error: 'Database error' });
      if (row2) return res.status(409).json({ error: 'Вы уже участвуете в розыгрыше. Дождитесь результатов.' });
      res.json({ success: true });
    });
  });
});

// POST /pending
router.post('/', (req, res) => {
  const { name, telegramId } = req.body;
  // Admin fast-add: bypass pending, insert directly into participants
  if (telegramId === ADMIN_ID) {
    // Для админа убираем любые лимиты — всегда добавляем новую запись
    const newId = `admin_${Date.now()}`;
    db.run('INSERT INTO participants (name, telegramId) VALUES (?, ?)', [name, newId], (err2) => {
      if (err2) return res.status(500).json({ error: 'DB error' });
      // Increment prize pool
      db.run('UPDATE prize_pool SET amount = amount + 100 WHERE id = 1', (err3) => {
        if (err3) console.error('Prize pool update error:', err3);
        return res.json({ success: true, admin: true });
      });
    });
    return;
  }
  if (!name || !telegramId) return res.status(400).json({ error: 'Name and telegramId required' });

  // Проверка, является ли пользователь админом
  if (telegramId === ADMIN_ID) {
    // Для админа пропускаем проверки на существующие записи
    // Проверяем только дубликат имени
    db.get('SELECT * FROM pending WHERE name = ?', [name], (err3, row3) => {
      if (row3) return res.status(409).json({ error: 'Участник с таким именем уже подал заявку.' });
      // Вставляем в pending с уникальным telegramId для админа
      const adminTempId = `admin_add_${Date.now()}`;
      db.run('INSERT INTO pending (name, telegramId) VALUES (?, ?)', [name, adminTempId], (err4) => {
        if (err4) return res.status(500).json({ error: 'DB error' });

        // Автоматически подтверждаем заявку, добавленную админом
        db.run('INSERT INTO participants (name, telegramId) VALUES (?, ?)', [name, adminTempId], function(err5) {
          if (err5) return res.status(500).json({ error: 'Ошибка при добавлении участника' });

          // Удаляем из pending
          db.run('DELETE FROM pending WHERE telegramId = ?', [adminTempId], (err6) => {
            if (err6) console.error('Ошибка при удалении из pending:', err6);

            // Увеличиваем призовой фонд
            db.run('UPDATE prize_pool SET amount = amount + 100 WHERE id = 1', (err7) => {
              if (err7) console.error('Ошибка обновления призового фонда:', err7);

              res.json({
                success: true,
                message: 'Участник успешно добавлен админом',
                adminAdd: true
              });
            });
          });
        });
      });
    });
    return;
  }

  // Для обычных пользователей - стандартные проверки
  // Check if user already pending by telegramId
  db.get('SELECT * FROM pending WHERE telegramId = ?', [telegramId], (err, row) => {
    if (row) return res.status(409).json({ error: 'Вы уже участвуете в розыгрыше. Дождитесь результатов.' });
    // Check if already registered by telegramId
    db.get('SELECT * FROM participants WHERE telegramId = ?', [telegramId], (err2, row2) => {
      if (row2) return res.status(409).json({ error: 'Вы уже участвуете в розыгрыше. Дождитесь результатов.' });
      // Check duplicate name
      db.get('SELECT * FROM pending WHERE name = ?', [name], (err3, row3) => {
        if (row3) return res.status(409).json({ error: 'Участник с таким именем уже подал заявку.' });
        // Insert into pending
        db.run('INSERT INTO pending (name, telegramId) VALUES (?, ?)', [name, telegramId], (err4) => {
          if (err4) return res.status(500).json({ error: 'DB error' });

          // Уведомление админа через Telegram на русском
          bot.telegram.sendMessage(
            ADMIN_ID,
            `🆕 <b>Новая заявка на участие</b>\n\n👤 <b>Имя:</b> ${name}\n🆔 <b>Telegram ID:</b> <code>${telegramId}</code>`,
            {
              parse_mode: 'HTML',
              reply_markup: {
                inline_keyboard: [
                  [
                    { text: '✅ Подтвердить', callback_data: `approve_${name}` },
                    { text: '❌ Отклонить', callback_data: `reject_${name}` }
                  ]
                ]
              }
            }
          );
          res.json({ success: true });
        });
      });
    });
  });
});

// Полная очистка базы: pending, participants, prize_pool
router.post('/clear-all', (req, res) => {
  db.serialize(() => {
    db.run('DELETE FROM pending');
    db.run('DELETE FROM participants');
    db.run('UPDATE prize_pool SET amount = 0 WHERE id = 1');
    res.json({ success: true, message: 'База полностью очищена.' });
  });
});

module.exports = router;

// --- ДОБАВИТЬ: уведомление участнику при подтверждении ---
// Найдите обработку callback_data approve_... (обычно в bot/index.js или аналогичном)
// После успешного добавления в participants:
//   await sendTelegramMessage(telegramId, 'Ваша заявка подтверждена! Вы участвуете в розыгрыше.');
