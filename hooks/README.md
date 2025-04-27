# 🎡 Колесо Фортуны | Telegram Bot & Web App

## 📝 Описание

Колесо Фортуны — это интерактивная лотерейная система, объединяющая Telegram-бота и современный веб-интерфейс. Проект позволяет проводить регулярные розыгрыши призов среди участников, которые могут регистрироваться через веб-приложение и получать уведомления через Telegram.

![Колесо Фортуны](https://via.placeholder.com/800x400?text=Колесо+Фортуны)

## ✨ Основные возможности

### 👤 Для пользователей
- Регистрация через веб-интерфейс с подтверждением оплаты
- Просмотр текущего призового фонда и списка участников
- Отслеживание времени до следующего розыгрыша
- Получение уведомлений о статусе заявки и результатах розыгрыша
- Просмотр истории победителей и шансов на выигрыш

### 👑 Для администраторов
- Подтверждение или отклонение заявок на участие
- Прямое добавление участников через Telegram-бота
- Управление розыгрышами (запуск, сброс)
- Просмотр статистики и истории
- Удаление участников

## 🛠️ Технологии

### Backend
- **Node.js** и **Express** — серверная часть
- **SQLite** — база данных
- **Telegraf** — фреймворк для Telegram-бота

### Frontend
- **Next.js** и **React** — фреймворк и библиотека UI
- **TypeScript** — типизация кода
- **Tailwind CSS** — стилизация компонентов

## 📂 Структура проекта

```
├── functions/                # Backend и Telegram-бот
│   ├── db/                   # База данных SQLite
│   ├── routes/               # API маршруты
│   ├── scripts/              # Вспомогательные скрипты
│   ├── services/             # Бизнес-логика
│   └── index.js              # Точка входа
│
├── frontend/                 # Next.js приложение
│   ├── public/               # Статические файлы
│   └── src/
│       ├── app/              # Страницы приложения
│       ├── components/       # React компоненты
│       └── lib/              # Утилиты и API-клиент
│
├── .env.example              # Пример переменных окружения
└── README.md                 # Документация
```

## 🚀 Установка и запуск

### Предварительные требования
- Node.js 18 или выше
- npm или yarn
- Telegram Bot Token (получить у [@BotFather](https://t.me/BotFather))

### Локальная разработка

1. **Клонирование репозитория**
   ```bash
   git clone https://github.com/your-username/fortune-wheel.git
   cd fortune-wheel
   ```

2. **Настройка переменных окружения**
   ```bash
   # Создайте файл .env в корне проекта
   cp .env.example .env
   # Отредактируйте .env, добавив BOT_TOKEN и ADMIN_ID
   ```

3. **Запуск backend**
   ```bash
   cd functions
   npm install
   npm start
   ```

4. **Запуск frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. **Доступ к приложению**
   - Backend API: http://localhost:8080
   - Frontend: http://localhost:3000

## 🌐 Деплой

### Backend (Railway)
1. Создайте проект на [Railway](https://railway.app/)
2. Подключите репозиторий
3. Добавьте переменные окружения:
   - `BOT_TOKEN` — токен Telegram-бота
   - `ADMIN_ID` — Telegram ID администратора
   - `HOST_URL` — URL вашего бэкенда
   - `FRONTEND_URL` — URL фронтенда для CORS

### Frontend (Vercel)
1. Создайте проект на [Vercel](https://vercel.com/)
2. Импортируйте репозиторий, указав директорию `frontend`
3. Добавьте переменную окружения:
   - `NEXT_PUBLIC_API_URL` — URL вашего бэкенда

## 🚀 Deployment Instructions

### GitHub
1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```bash
   cd hooks
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the project:
   ```bash
   npm start
   ```

### Vercel
1. Link the project to Vercel:
   ```bash
   vercel link
   ```
2. Deploy the project:
   ```bash
   vercel --prod
   ```

## 🔄 Процесс работы

1. **Регистрация участников**
   - Пользователь открывает веб-приложение через Telegram
   - Вводит имя и подтверждает оплату
   - Администратор получает уведомление и подтверждает участие
   - Призовой фонд увеличивается на 100₽

2. **Розыгрыш**
   - Автоматически запускается по расписанию
   - Случайным образом выбирается победитель
   - Все участники получают уведомления о результатах
   - История победителей сохраняется

## 👨‍💻 Для разработчиков

### Важные замечания
- Все React-компоненты должны начинаться с директивы `"use client";`
- При добавлении новых зависимостей выполните `npm install` в соответствующей директории
- Используйте TypeScript для типизации всех новых компонентов и функций

### Команды для разработки

```bash
# Запуск с отладкой
npm run dev

# Сборка проекта
npm run build

# Запуск тестов
npm test

# Очистка тестовых пользователей
node functions/scripts/clearTestUsers.js
```

## 🔒 Безопасность

- Доступ к админ-функциям ограничен по Telegram ID
- Все действия логируются в консоли
- Проверка подлинности запросов через CORS (ограничить origin в продакшн) и строгую валидацию данных (например, через express-validator или joi)

## 📞 Контакты и поддержка

- Telegram: [@your_telegram_handle](https://t.me/your_telegram_handle)
- Email: your.email@example.com
- [Официальный канал проекта](https://t.me/channel_fortune)

## 📄 Лицензия

MIT License © 2023 Your Name

---

Сделано с ❤️ для участников розыгрышей
