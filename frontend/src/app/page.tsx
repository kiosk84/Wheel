"use client";
import React, { useState, useEffect } from 'react';
import { getParticipants, getPending, getPrizepool, getWinners, postTimer, spinWheel } from '../lib/api';
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

export default function Home() {
  const [participants, setParticipants] = useState<string[]>([]);
  const [pendingUsers, setPendingUsers] = useState<string[]>([]);
  const [prizePool, setPrizePool] = useState<number>(0);
  const [telegramId, setTelegramId] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [instrOpen, setInstrOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(false);
  const [winnerName, setWinnerName] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [showParticipateModal, setShowParticipateModal] = useState(false);

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
    if (tgUser?.id) return tgUser.id.toString();
    // 2. localStorage
    const stored = localStorage.getItem('telegramId');
    if (stored) return stored;
    // 3. sessionStorage
    const session = sessionStorage.getItem('telegramId');
    if (session) return session;
    // 4. URL
    const params = new URLSearchParams(window.location.search);
    const tidParam = params.get('telegramId');
    if (tidParam) return tidParam;
    return '';
  };

  // Обновлённая функция участия
  const handleParticipate = async () => {
    const id = getTelegramId();
    if (!id) {
      alert('Не удалось получить ваш Telegram ID. Пожалуйста, откройте приложение через Telegram-бота.');
      return;
    }
    setTelegramId(id);
    localStorage.setItem('telegramId', id);
    setShowParticipateModal(true);
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
  const handleAdminTestAction = async () => {
    try {
      // Установить таймер на 5 минут от текущего времени
      const now = new Date();
      now.setMinutes(now.getMinutes() + 5);
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const time = `${hh}:${mm}`;
      await postTimer(time);
      // Сразу запустить спин (выбор победителя)
      await spinWheel();
      alert('Таймер установлен на 5 минут и выбран победитель (см. историю)');
      reload();
    } catch (e) {
      alert('Ошибка при тестовом запуске: ' + (e instanceof Error ? e.message : e));
    }
  };

  if (loading) return <SplashScreen />;
  // if (notInTelegram) {
  //   return (
  //     <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
  //       <div className="bg-gray-800 rounded-xl p-6 max-w-xs w-full text-center shadow-lg">
  //         <h2 className="text-lg font-bold mb-3">Вход только через Telegram</h2>
  //         <p className="mb-4 text-sm">Пожалуйста, откройте это приложение через Telegram-бота, чтобы участвовать в розыгрыше.</p>
  //         <a
  //           href="https://t.me/your_bot_username"
  //           className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-5 py-3 text-base transition-colors duration-150 shadow-md w-full"
  //           style={{ maxWidth: 320 }}
  //         >
  //           Открыть бота в Telegram
  //         </a>
  //       </div>
  //     </div>
  //   );
  // }
  return (
    <div className="relative min-h-screen flex flex-col">
      <Navbar onMenuToggleAction={() => setSidebarOpen(true)} />
      <Sidebar
        isOpen={sidebarOpen}
        onShowInstructionsAction={() => { setInstrOpen(true); setSidebarOpen(false); }}
        onShowHistoryAction={() => { setHistoryOpen(true); setSidebarOpen(false); }}
        onCloseAction={() => setSidebarOpen(false)}
        onAdminTestAction={handleAdminTestAction}
      />
      <InstructionModal isOpen={instrOpen} onClose={() => setInstrOpen(false)} />
      <HistoryModal isOpen={historyOpen} onClose={() => setHistoryOpen(false)} />
      <main className="flex-1 flex flex-col items-center justify-evenly px-2 sm:px-4 pt-20 pb-8 max-w-screen-sm mx-auto w-full">
        {/* pt-20 для отступа под фиксированный header, pb-8 для отступа снизу */}
        <div className="mt-3 w-full bg-gray-900 bg-opacity-90 backdrop-blur-md p-2 rounded-md text-center max-w-[320px] mx-auto">
          <p className="text-white text-xs sm:text-sm mb-1">До следующего розыгрыша:</p>
          <TimerDisplay onTimerEnd={handleTimerEnd} />
          <div className="mt-0 text-center flex items-center justify-center gap-2 mb-0.5">
            <p className="text-white text-xs sm:text-sm font-bold">Призовой фонд:</p>
            <p className="text-green-400 text-lg sm:text-xl font-bold">{prizePool > 0 ? prizePool : 0}₽</p>
          </div>
        </div>
        <div className="flex items-center justify-center w-full my-0">
          <FortuneWheel participants={participants} selecting={selecting} winnerName={winnerName} onFinish={handleSpinFinish} />
        </div>
        <div className="w-full flex flex-col space-y-1 mt-0 mb-0.5">
          <button
            onClick={handleParticipate}
            className="participate-btn w-full py-3 sm:py-4 text-xs sm:text-sm bg-yellow-400 text-white font-bold hover:bg-yellow-300 transition-all duration-150"
            style={{ borderRadius: '4px', maxWidth: 220, margin: '8px auto 4px auto' }}
          >
            Участвовать
          </button>
          <div className="flex justify-center">
            <div className="bg-gray-800/80 p-4 rounded-2xl shadow-2xl mt-4 mb-8 w-full max-w-md backdrop-blur-md">
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
        isOpen={showDuplicateModal}
        message={''}
        onClose={() => setShowDuplicateModal(false)}
      />
    </div>
  );
}
