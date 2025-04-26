"use client";
import React, { useState, useEffect } from 'react';
import { getParticipants, getPending, getPrizepool, getWinners, checkPending } from '../lib/api';
import TimerDisplay from '../components/TimerDisplay';
import FortuneWheel from '../components/FortuneWheel';
import ParticipantList from '../components/ParticipantList';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import InstructionModal from '../components/InstructionModal';
import HistoryModal from '../components/HistoryModal';
import DuplicateModal from '../components/DuplicateModal';
import SplashScreen from '../components/SplashScreen';
import ParticipateModalNew from '../components/ParticipateModalNew';

function StartScreen({ onStart, telegramId }: { onStart: (id: string) => void, telegramId: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#181A20] text-white">
      <h1 className="text-2xl font-bold mb-6">Колесо Фортуны</h1>
      <p className="mb-4 text-sm">Добро пожаловать! Для продолжения нажмите кнопку ниже.</p>
      <button
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl text-lg shadow-lg"
        onClick={() => onStart(telegramId)}
      >
        Старт
      </button>
      <div className="mt-6 text-xs text-gray-400 select-all">
        Ваш Telegram ID: <span className="font-mono text-blue-400">{telegramId || 'не определён'}</span>
      </div>
    </div>
  );
}

export default function Home() {
  const [participants, setParticipants] = useState<string[]>([]);
  const [pendingUsers, setPendingUsers] = useState<string[]>([]);
  const [prizePool, setPrizePool] = useState<number>(0);
  const [telegramId, setTelegramId] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [instrOpen, setInstrOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(false);
  const [winnerName, setWinnerName] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [showParticipateModal, setShowParticipateModal] = useState(false);
  const [duplicateMessage, setDuplicateMessage] = useState<string | null>(null);
  const [showStartScreen, setShowStartScreen] = useState(true);

  // Проверка, открыт ли WebApp в Telegram
  // const [notInTelegram, setNotInTelegram] = useState(false);

  // useEffect(() => {
  //   if (typeof window !== 'undefined') {
  //     // Проверяем наличие Telegram WebApp
  //     if (!window.Telegram?.WebApp) {
  //       setNotInTelegram(true);
  //     }
  //   }
  // }, []);

  // Функция для обновления данных (отдельные запросы)
  const reload = async () => {
    try {
      const [participants, pending, prize] = await Promise.all([
        getParticipants(),
        getPending(),
        getPrizepool()
      ]);
      setParticipants(participants);
      setPendingUsers(pending.map((item) => item.name));
      setPrizePool(prize.total);
    } catch (error) {
      console.error('Ошибка при обновлении данных:', error);
    }
  };

  useEffect(() => {
    reload();
    if (typeof window !== 'undefined') {
      // Fallback: get telegramId from URL params
      const params = new URLSearchParams(window.location.search);
      const tidParam = params.get('telegramId');
      setTelegramId(tidParam || '');
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.ready();
        const user = window.Telegram.WebApp.initDataUnsafe?.user;
        if (user?.id) setTelegramId(user.id.toString());
      }
    }
    // TimerDisplay handles timer polling and auto-spin
    // Removed the redundant interval here
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Постоянно пытаемся получить telegramId из Telegram WebApp, пока не появится
  useEffect(() => {
    if (telegramId) return; // Уже есть id — не продолжаем
    let interval: NodeJS.Timeout | undefined;
    if (typeof window !== 'undefined') {
      interval = setInterval(() => {
        const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
        if (user?.id) {
          setTelegramId(user.id.toString());
          if (interval) clearInterval(interval);
        }
      }, 500);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [telegramId]);

  // Получение telegramId из разных источников
  const getTelegramId = () => {
    if (typeof window === 'undefined') return '';
    // 1. Telegram WebApp
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
    if (tgUser?.id) {
      console.log('[TG] user.id найден:', tgUser.id);
      return tgUser.id.toString();
    }
    // 2. localStorage
    const stored = localStorage.getItem('telegramId');
    if (stored) {
      console.log('[TG] id из localStorage:', stored);
      return stored;
    }
    // 3. sessionStorage
    const session = sessionStorage.getItem('telegramId');
    if (session) {
      console.log('[TG] id из sessionStorage:', session);
      return session;
    }
    // 4. URL
    const params = new URLSearchParams(window.location.search);
    const tidParam = params.get('telegramId');
    if (tidParam) {
      console.log('[TG] id из URL:', tidParam);
      return tidParam;
    }
    console.warn('[TG] Не удалось получить Telegram ID!');
    return '';
  };

  // Обновлённая функция участия
  const handleParticipate = async () => {
    const id = getTelegramId();
    console.log('[handleParticipate] Используемый id:', id);
    const tgUser = typeof window !== 'undefined' ? window.Telegram?.WebApp?.initDataUnsafe?.user : null;
    const tgInitData = typeof window !== 'undefined' ? (window.Telegram?.WebApp?.initDataUnsafe as Record<string, unknown>) : null;
    const hash = tgInitData?.hash;
    const auth_date = tgInitData?.auth_date;

    // Если нет реального Telegram ID (и это не админ), показываем сообщение и не даём участвовать
    if (!id || /^test_/.test(id)) {
      if (id !== process.env.NEXT_PUBLIC_ADMIN_ID && id !== process.env.ADMIN_ID) {
        setDuplicateMessage('Пожалуйста, откройте приложение через Telegram для участия в розыгрыше.');
        return;
      }
    }

    // Отправляем данные в /telegram-auth если есть id и hash
    if (id && hash && auth_date) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/telegram-auth`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id,
            first_name: tgUser?.first_name,
            username: tgUser?.username,
            hash,
            auth_date,
          }),
        });
      } catch (e) {
        // Не блокируем участие, если временная база недоступна
        console.warn('Не удалось сохранить Telegram ID во временную базу:', e);
      }
    }
    // Для админа всегда разрешаем участие без проверки
    if (id === process.env.NEXT_PUBLIC_ADMIN_ID || id === process.env.ADMIN_ID) {
      setTelegramId(id);
      localStorage.setItem('telegramId', id);
      setShowParticipateModal(true);
      return;
    }
    setTelegramId(id);
    localStorage.setItem('telegramId', id);
    try {
      await checkPending(id);
      setShowParticipateModal(true);
    } catch (e) {
      setDuplicateMessage(e instanceof Error ? e.message : 'Вы уже участвуете или ожидаете подтверждения');
    }

    // После успешной проверки и перед открытием модалки участия — фиксируем этап "решил участвовать"
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/start-ids/participating-users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId: id }),
      });
    } catch (e) {
      console.warn('Не удалось сохранить этап "решил участвовать":', e);
    }
  };

  // Таймер для автозапуска (ровно в 20:00)
  const handleTimerEnd = () => {
    setSelecting(true);
    setSpinning(true);
    setWinnerName(null);
  };

  // Опрос сервера на победителя только во время вращения
  useEffect(() => {
    if (!spinning) return;
    const interval = setInterval(pollWinner, 1500);
    return () => clearInterval(interval);
  }, [spinning]);

  const pollWinner = async () => {
    try {
      const winners = await getWinners();
      if (winners && winners.length > 0) {
        const latest = winners[0];
        // Если победитель определён — останавливаем колесо
        if (latest && latest.name) {
          setWinnerName(latest.name);
          setSpinning(false);
        }
      }
    } catch {}
  };

  // После завершения вращения сбрасываем участников и призовой фонд
  const handleSpinFinish = () => {
    setSelecting(false);
    setWinnerName(null);
    reload();
  };

  // Временный обработчик для администратора: установить таймер на 5 минут и выбрать победителя
  // const handleAdminTestAction = async () => {
  //   try {
  //     // Установить таймер на 5 минут от текущего времени
  //     const now = new Date();
  //     now.setMinutes(now.getMinutes() + 5);
  //     const hh = String(now.getHours()).padStart(2, '0');
  //     const mm = String(now.getMinutes()).padStart(2, '0');
  //     const time = `${hh}:${mm}`;
  //     await postTimer(time);
  //     // Сразу запустить спин (выбор победителя)
  //     await spinWheel();
  //     alert('Таймер установлен на 5 минут и выбран победитель (см. историю)');
  //     reload();
  //   } catch (e) {
  //     alert('Ошибка при тестовом запуске: ' + (e instanceof Error ? e.message : e));
  //   }
  // };

  // --- Очистка всей базы (только для админа) ---
  const handleClearAll = async () => {
    if (!window.confirm('Вы уверены, что хотите полностью очистить базу? Это действие необратимо!')) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/pending/clear-all`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert('База полностью очищена!');
        reload();
      } else {
        alert('Ошибка при очистке базы: ' + (data.message || ''));
      }
    } catch (e) {
      alert('Ошибка при очистке базы: ' + (e instanceof Error ? e.message : e));
    }
  };

  // Новый обработчик для кнопки Старт
  const handleStart = async (id: string) => {
    // Сохраняем id в отдельный список стартовых пользователей через API
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/start-ids`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId: id }),
      });
    } catch (e) {
      // Не блокируем, если не удалось сохранить
      console.warn('Не удалось сохранить стартовый Telegram ID:', e);
    }
    setShowStartScreen(false);
  };

  if (loading) return <SplashScreen />;
  if (showStartScreen) {
    return <StartScreen onStart={handleStart} telegramId={telegramId} />;
  }
  return (
    <div className="relative min-h-screen flex flex-col bg-[#181A20]">
      <Navbar onMenuToggleAction={() => setSidebarOpen(true)} />
      <Sidebar
        isOpen={sidebarOpen}
        onShowInstructionsAction={() => { setInstrOpen(true); setSidebarOpen(false); }}
        onShowHistoryAction={() => { setHistoryOpen(true); setSidebarOpen(false); }}
        onCloseAction={() => setSidebarOpen(false)}
        onClearAllAction={handleClearAll}
      />
      <InstructionModal isOpen={instrOpen} onClose={() => setInstrOpen(false)} />
      <HistoryModal isOpen={historyOpen} onClose={() => setHistoryOpen(false)} />
      <main className="flex-1 flex flex-col items-center justify-evenly px-2 sm:px-4 pt-20 pb-8 max-w-screen-sm mx-auto w-full">
        {/* pt-20 для отступа под фиксированный header, pb-8 для отступа снизу */}
        <div className="mt-3 w-full bg-[#23262F] bg-opacity-90 backdrop-blur-md p-2 rounded-xl text-center max-w-[320px] mx-auto shadow-md border border-[#222]">
          <p className="text-[#229ED9] text-xs sm:text-sm mb-1 font-semibold">До следующего розыгрыша:</p>
          <TimerDisplay onTimerEnd={handleTimerEnd} />
          <div className="mt-0 text-center flex items-center justify-center gap-2 mb-0.5">
            <p className="text-[#229ED9] text-xs sm:text-sm font-bold">Призовой фонд:</p>
            <p className="text-green-400 text-lg sm:text-xl font-bold">{prizePool > 0 ? prizePool : 0}₽</p>
          </div>
        </div>
        {/* Отладочный вывод Telegram ID для пользователя */}
        <div className="w-full text-center text-xs text-gray-400 mt-2 mb-1 select-all">
          <span>Ваш Telegram ID: </span>
          <span className="font-mono text-blue-400">{telegramId || 'не определён'}</span>
        </div>
        <div className="flex flex-col items-center justify-center w-full my-[8px]">
          <FortuneWheel participants={participants} selecting={selecting} winnerName={winnerName} onFinish={handleSpinFinish} />
        </div>
        <div className="w-full flex flex-col space-y-1 mt-0 mb-0.5">
          <button
            onClick={handleParticipate}
            className="participate-btn w-full py-3 sm:py-4 text-xs sm:text-sm bg-[#229ED9] text-white font-bold hover:bg-[#1b7eb3] transition-all duration-150 shadow rounded-xl"
            style={{ maxWidth: 220, margin: '8px auto 4px auto' }}
          >
            Участвовать
          </button>
          <div className="flex justify-center">
            <div className="bg-[#23262F] p-4 rounded-2xl shadow-xl mt-4 mb-8 w-full max-w-md backdrop-blur-md border border-[#222]">
              <ParticipantList
                participants={participants}
                pendingUsers={pendingUsers}
              />
            </div>
          </div>
        </div>
        <ParticipateModalNew
          isOpen={showParticipateModal}
          onCloseAction={() => setShowParticipateModal(false)}
          onSuccessAction={() => { setShowParticipateModal(false); reload(); }}
          telegramId={telegramId}
        />
      </main>
      <DuplicateModal
        isOpen={!!duplicateMessage}
        onClose={() => setDuplicateMessage(null)}
        message={duplicateMessage || ''}
      />
    </div>
  );
}
