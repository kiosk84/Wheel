This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

# Fortune Wheel Frontend

Это фронтенд-приложение для системы розыгрышей "Колесо Фортуны", созданное с использованием Next.js и TypeScript. Оно предоставляет пользовательский интерфейс для взаимодействия с бэкендом розыгрыша.

## Основные функции

*   **Отображение таймера:** Показывает время до следующего автоматического розыгрыша с визуальными эффектами в последние секунды.
*   **Призовой фонд:** Отображает текущий накопленный призовой фонд.
*   **Список участников:** Показывает список активных участников текущего розыгрыша и пользователей, ожидающих подтверждения.
*   **Участие в розыгрыше:** Позволяет пользователям (интегрированным через Telegram) подавать заявки на участие.
*   **Визуализация розыгрыша:** Отображает анимированное колесо с номерами участников при завершении таймера, останавливаясь на номере победителя.
*   **История победителей:** Позволяет просматривать список предыдущих победителей.
*   **Инструкции:** Предоставляет информацию о правилах участия.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## 🚀 Deployment Instructions

### GitHub
1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Navigate to the frontend directory:
   ```bash
   cd hooks/frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the project:
   ```bash
   npm run dev
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

### Notes
- Removed temporary testing instructions for `telegramId`. Ensure all environment variables are properly set.
