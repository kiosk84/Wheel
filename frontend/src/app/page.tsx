"use client";
import React, { useState, useEffect } from 'react';
import { getParticipants, getPrizepool, checkPending, getPending, getWinners } from '../lib/api';
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
  const [duplicateMessage, setDuplicateMessage] = useState<string>('');
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

  // Функция для обновления данных
  const reload = async () => {
    try {
      // Загружаем список участников (обычный и детальный)
      const participantsData = await getParticipants();
      setParticipants(participantsData);

      // Загружаем список ожидающих подтверждения
      const pendingData = await getPending();
      const pendingNames = pendingData.map(item => item.name);
      setPendingUsers(pendingNames);

      // Загружаем призовой фонд
      const prizepoolData = await getPrizepool();
      setPrizePool(prizepoolData.total);

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

  const handleParticipate = async () => {
    // Всегда пробуем получить telegramId из Telegram WebApp при нажатии
    let id = '';
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
      id = window.Telegram.WebApp.initDataUnsafe.user.id.toString();
      setTelegramId(id);
    } else if (telegramId) {
      id = telegramId;
    }
    if (!id) {
      alert('Для участия нужен Telegram!');
      return;
    }
    try {
      await checkPending(id);
      setShowParticipateModal(true); // Открыть модалку для ввода имени
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Ошибка при проверке участия';
      setDuplicateMessage(msg);
      setShowDuplicateModal(true);
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
    <div className="min-h-screen bg-gray-900 text-white p-0 flex flex-col">
      <Navbar onMenuToggleAction={() => setSidebarOpen(true)} />
      <Sidebar
        isOpen={sidebarOpen}
        onShowInstructionsAction={() => { setInstrOpen(true); setSidebarOpen(false); }}
        onShowHistoryAction={() => { setHistoryOpen(true); setSidebarOpen(false); }}
        onCloseAction={() => setSidebarOpen(false)}
      />
      <InstructionModal isOpen={instrOpen} onClose={() => setInstrOpen(false)} />
      <HistoryModal isOpen={historyOpen} onClose={() => setHistoryOpen(false)} />
      <div className="flex-1 flex flex-col items-center justify-evenly px-2 sm:px-4 pt-2 sm:pt-3 pb-0 min-h-0 max-w-screen-sm mx-auto w-full">
        <div className="mt-3 mb-0 sm:mb-0 w-full bg-gray-900 bg-opacity-90 backdrop-blur-md p-2 sm:p-2 rounded-md text-center max-w-[320px] mx-auto">
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
          <div className="bg-gray-800 p-3 sm:p-4 rounded-b-xl mt-1">
            <ParticipantList
              participants={participants}
              pendingUsers={pendingUsers}
            />
          </div>
        </div>
        <ParticipateModalNew
          isOpen={showParticipateModal}
          onCloseAction={() => setShowParticipateModal(false)}
          onSuccessAction={() => { setShowParticipateModal(false); reload(); }}
          telegramId={telegramId}
        />
      </div>
      <DuplicateModal
        isOpen={showDuplicateModal}
        message={duplicateMessage}
        onClose={() => setShowDuplicateModal(false)}
      />
    </div>
  );
}
