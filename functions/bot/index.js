const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);
const ADMIN_ID = process.env.ADMIN_ID;

module.exports = { bot, ADMIN_ID };

          await bot.telegram.sendMessage(
            telegramId,
            `✅ Ваше участие подтверждено!

👤 Имя: ${name}
👥 Всего участников: ${participantsCount}
💰 Текущий призовой фонд: ${prizePool}₽
🎯 Ваш шанс на победу: ${winChance}%

⏰ Следующий розыгрыш: ${nextSpinTime ? nextSpinTime.toLocaleTimeString('ru-RU') : 'Не запланирован'}

🌐 Откройте приложение для подробностей: [Перейти](https://wheel-woad.vercel.app/)`,
            { parse_mode: 'MarkdownV2' }
          );
