const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Путь к временной базе участников (можно заменить на fortune.db или другую БД)
const TEMP_DB_PATH = path.join(__dirname, '../db/telegram_temp.json');

// Вспомогательная функция для чтения и записи временной базы
function readTempDB() {
  if (!fs.existsSync(TEMP_DB_PATH)) return [];
  try {
    return JSON.parse(fs.readFileSync(TEMP_DB_PATH, 'utf8'));
  } catch {
    return [];
  }
}
function writeTempDB(data) {
  fs.writeFileSync(TEMP_DB_PATH, JSON.stringify(data, null, 2));
}

// POST /telegram-auth
module.exports = async function telegramAuth(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const { id, first_name, username, hash, auth_date, ...other } = req.body;
  const botToken = process.env.TELEGRAM_TOKEN;
  if (!botToken) {
    res.status(500).json({ error: 'Bot token not set' });
    return;
  }
  // Проверка подлинности данных от Telegram
  const data = { id, first_name, username, auth_date, ...other };
  const dataCheckArr = Object.keys(data)
    .sort()
    .map((key) => `${key}=${data[key]}`);
  const dataCheckString = dataCheckArr.join('\n');
  const secret = crypto.createHash('sha256').update(botToken).digest();
  const computedHash = crypto
    .createHmac('sha256', secret)
    .update(dataCheckString)
    .digest('hex');
  if (computedHash !== hash) {
    res.status(401).json({ error: 'Invalid Telegram auth data' });
    return;
  }
  // Проверка времени авторизации (не старше 24 часов)
  const now = Math.floor(Date.now() / 1000);
  if (now - auth_date > 86400) {
    res.status(401).json({ error: 'Auth data is too old' });
    return;
  }
  // Сохраняем временно Telegram ID и имя
  const tempUsers = readTempDB();
  const exists = tempUsers.find((u) => u.id === id);
  if (!exists) {
    tempUsers.push({ id, first_name, username, auth_date, ts: Date.now() });
    writeTempDB(tempUsers);
  }
  res.status(200).json({ message: 'Telegram ID saved', id, first_name, username });
};
