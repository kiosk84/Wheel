# План обновления фронтенда

Мы будем приводить интерфейс в соответствие с исходным `index.html`, используя Next.js и TailwindCSS.

1. **Глобальные стили**
   - Скопировать стили `<style>` из `index.html` в `globals.css` (или подключить через Tailwind `@layer base`).
   - Описать фон, цвет текста, шрифт по умолчанию.

2. **Tailwind‑утилиты и кастомные классы**
   - В `tailwind.config.js` добавить `extend` для анимаций:
     - `firework-burst`, `pulse-btn`, `bounce`, `overlay-pop`.
   - Создать утилиты: `.gradient-text`, `.digital-timer`, `.participate-btn`, `.modal`.

3. **Компоненты и разметка**
   - `Navbar` и `Sidebar` с бургером и пунктами меню.
   - Модалки: `ParticipateModal`, `InstructionModal`, `HistoryModal`, `WinnerOverlay`.
   - Таймер: обернуть внутрь `<div className="digital-timer">`.
   - Заголовки: применить `.gradient-text`.

4. **WheelComponent**
   - Стили:
     - `border: 4px solid #001f3f; border-radius: 50%`.
     - `box-shadow: 0 0 40px 12px rgba(0,255,255,0.8)`.
     - Маркер‑треугольник и линия из `index.html`.
   - Анимация частиц: класс `.firework-particle` и `@keyframes firework-burst`.

5. **Overlay победителя**
   - Компонент `WinnerOverlay` с анимацией `overlay-pop`.
   - Полупрозрачный фон и текст по центру.

6. **Кнопки и взаимодействия**
   - `participate-btn` с градиентом и `@keyframes pulse-btn`.
   - Hover-эффект и тень при наведении.
   - Кнопки сайдбара с `hover:bg-gray-700`.

7. **Адаптивность**
   - Центрирование: контейнер `max-w-screen-md mx-auto p-4`.
   - Мобильный дизайн: сайдбар на весь экран, колесо `w-64 h-64`.

8. **Финальные штрихи**
   - Проверить консистентность палитры.
   - Перенести кастомные CSS в Tailwind либо в глобальный файл.
   - Убедиться, что интерфейс идентичен `index.html`.

> Работать по этому плану, шаг за шагом реализуя и проверяя каждый пункт.
