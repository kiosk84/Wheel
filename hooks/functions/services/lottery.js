const db = require('../db');
const { bot, ADMIN_ID } = require('../bot');
const logger = require('../logger'); // Предполагается, что у вас есть модуль логирования

async function runLottery() {
  try {
    logger.info('Запуск авто-розыгрыша...');

    const participants = await db.all('SELECT * FROM participants', []);

    if (!participants || participants.length === 0) {
      logger.info('Нет участников для розыгрыша.');
      return null;
    }

    const winner = participants[Math.floor(Math.random() * participants.length)];
    const prizePool = participants.length * 100;

    await db.run(
      'INSERT INTO winners (name, telegramId, prize, timestamp) VALUES (?, ?, ?, ?)',
      [winner.name, winner.telegramId, prizePool, Date.now()]
    );
    logger.info(`Победитель розыгрыша: ${winner.name} (ID: ${winner.telegramId}), Приз: ${prizePool} ₽.`);

    // Уведомить только победителя
    try {
      await bot.telegram.sendMessage(winner.telegramId, `🎉 Поздравляем, ${winner.name}! Вы выиграли ${prizePool} ₽!`);
      logger.info(`Уведомление отправлено победителю ${winner.name}.`);
    } catch (telegramError) {
      logger.error(`Ошибка отправки уведомления победителю ${winner.name}:`, telegramError);
      // Продолжаем выполнение, даже если не удалось отправить сообщение победителю
    }


    try {
      await bot.telegram.sendMessage(
        ADMIN_ID,
        `Розыгрыш завершён! Победитель: ${winner.name}. Приз: ${prizePool} ₽.`
      );
      logger.info(`Уведомление отправлено администратору.`);
    } catch (telegramError) {
       logger.error(`Ошибка отправки уведомления администратору:`, telegramError);
       // Продолжаем выполнение, даже если не удалось отправить сообщение администратору
    }


    await db.run('DELETE FROM participants', []);
    logger.info('Список участников очищен.');

    await db.run('UPDATE prize_pool SET amount = 0 WHERE id = 1');
    logger.info('Призовой фонд сброшен.');

    logger.info('Авто-розыгрыш завершён успешно.');
    return winner.name;

  } catch (e) {
    logger.error('Ошибка при выполнении розыгрыша:', e);
    throw e; // Перевыбрасываем ошибку для обработки на более высоком уровне (например, в планировщике)
  }
}

module.exports = runLottery;
