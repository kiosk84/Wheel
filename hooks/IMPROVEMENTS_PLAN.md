# Improvements Plan for Wheel of Fortune Project

## Overview
Проект Wheel of Fortune на базе React + Express + SQLite будет мигрирован на более современный фронтенд-стек и улучшен в следующих областях:
- Плавность и визуализация вращения колеса
- Сохранение истории победителей
- Архитектура и развертывание на Railway
- Качество кода и удобство разработки

## Goals
- Перенести фронтенд на Next.js (SSR/SSG)
- Сохранить существующий API-контракт Backend
- Улучшить UX вращения колеса с помощью специализированной библиотеки
- Организовать CI/CD и деплой на Railway
- Обеспечить тестирование и документацию

## Phase 1: Preparation
1. Провести аудит текущего кода (front + back).
2. Документировать все конечные точки API: `/participants`, `/pending`, `/spin`, `/winners`, `/prizepool`, `/timer`.
3. Настроить окружения на Railway для Backend и Frontend сервисов.
4. Добавить CORS на сервер и переменные среды (API_URL) для фронтенда.

## Phase 2: Frontend Migration to Next.js
1. Инициализировать проект: `npx create-next-app wheel-fortune`.
2. Перенести страницы:
   - `/` → `pages/index.tsx`
   - `/history` → `pages/history.tsx`
3. Интегрировать API Routes (опционально) для `/spin`, `/winners`.
4. Использовать встроенные возможности:
   - `getServerSideProps` или ISR для предзагрузки данных
   - Компонент `next/image` для оптимизации изображений
   - Tailwind CSS / CSS Modules для стилей
5. Перенести логику модалок и Overlay в компоненты.
6. Обеспечить HMR и TypeScript поддержку.

## Phase 3: Spin Enhancement
1. Выбрать библиотеку:
   - `react-custom-roulette` для быстрого старта
   - или `Winwheel.js` + GSAP для гибкой анимации
2. Реализовать кастомный Wheel-компонент:
   - Обновить кривую easing (cubic-bezier)
   - Добавить неоновую линию указателя с обводкой
   - Интегрировать event callback `onComplete()` для точного определения победителя
3. Отобразить анимацию «Победитель» в центре и очистить участников через 5 секунд.
4. Сохранить победителя на сервере через POST `/spin` и обновить историю.

## Phase 4: Backend Improvements
1. Проверить маршруты Express и мигрировать на TypeScript (опционально).
2. Добавить валидацию и логирование (winston).
3. Обновить сервис сохранения призового фонда и участников.
4. Убедиться, что история победителей хранится в таблице `winners`.
5. Добавить лимиты и защиту от дублирующих запросов.

## Phase 5: Deployment & CI/CD
1. Настроить Railway для двух проектов:
   - Backend (Express)
   - Frontend (Next.js)
2. В Github Actions или Railway Deploy:
   - Установка Node.js, `npm ci`, `npm run build`, `npm start`
   - Переменные среды: `DATABASE_URL`, `API_URL`, `TELEGRAM_BOT_TOKEN`
3. Настроить Preview Deploy для каждого PR.
4. Обеспечить мониторинг и алертинг (Logflare/Datadog).

## Phase 6: Testing & Quality Assurance
1. Написать unit-тесты (Jest) для сервисов Backend.
2. E2E-тесты (Cypress) для сценариев:
   - Регистрация участника
   - Подтверждение платежа
   - Вращение колеса и определение победителя
3. Провести нагрузочное тестирование.
4. Обновить README с инструкциями по запуску локально и на Railway.

## Maintenance
- Регулярно обновлять зависимости.
- Проводить код-ревью и ревизию безопасности.
- Планировать новые фичи по обратной связи пользователей.
