// Скрипт для очистки всех участников и сброса призового фонда
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../db/fortune.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Ошибка подключения к БД:', err);
  else console.log('Подключено к БД:', dbPath);
});

db.serialize(() => {
  db.run('DELETE FROM pending', (err) => {
    if (err) console.error('Ошибка очистки pending:', err);
  });
  db.run('DELETE FROM participants', (err) => {
    if (err) console.error('Ошибка очистки participants:', err);
  });
  db.run('UPDATE prize_pool SET amount = 0 WHERE id = 1', (err) => {
    if (err) console.error('Ошибка сброса призового фонда:', err);
  });
});

db.close(() => {
  console.log('Все участники и призовой фонд очищены.');
});
