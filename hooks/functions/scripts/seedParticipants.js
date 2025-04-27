// Скрипт для добавления ожидающих участников в pending
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../db/fortune.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Ошибка подключения к БД:', err);
  else console.log('Подключено к БД:', dbPath);
});

const pendingUsers = [
  { name: 'Иван', telegramId: '10001' },
  { name: 'Мария', telegramId: '10002' },
  { name: 'Алексей', telegramId: '10003' }
];

db.serialize(() => {
  pendingUsers.forEach(({ name, telegramId }) => {
    db.run('INSERT INTO pending (name, telegramId) VALUES (?, ?)', [name, telegramId], (err) => {
      if (err) console.error(`Ошибка добавления ${name}:`, err);
      else console.log(`Добавлен ожидающий: ${name}`);
    });
  });
});

db.close(() => {
  console.log('Добавление ожидающих завершено.');
});
