"use client";
import React, { useState, useEffect } from 'react';
import { getParticipants, getPrizepool, checkPending, getPending, getDetailedParticipants, getWinners, ParticipantWithNumber } from '../lib/api';
import WheelComponent, { Participant } from '../components/Wheel';
import TimerDisplay from '../components/TimerDisplay';
import ParticipantList from '../components/ParticipantList';
import ParticipateModal from '../components/ParticipateModalNew';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import InstructionModal from '../components/InstructionModal';
import HistoryModal from '../components/HistoryModal';
import DuplicateModal from '../components/DuplicateModal';
import PendingModal from '../components/PendingModal';
import SplashScreen from '../components/SplashScreen';

export default function Home() {
  const [participants, setParticipants] = useState<string[]>([]);
  const [detailedParticipants, setDetailedParticipants] = useState<ParticipantWithNumber[]>([]);
  const [pendingUsers, setPendingUsers] = useState<string[]>([]);
  const [prizePool, setPrizePool] = useState<number>(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [telegramId, setTelegramId] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [instrOpen, setInstrOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [duplicateMessage, setDuplicateMessage] = useState<string>('');
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [showPending, setShowPending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [winningParticipantNumber, setWinningParticipantNumber] = useState<number | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);


  // Функция для обновления данных
  const reload = async () => {
    try {
      // Загружаем список участников (обычный и детальный)
      const participantsData = await getParticipants();
      setParticipants(participantsData);

      const detailedParticipantsData = await getDetailedParticipants();
      setDetailedParticipants(detailedParticipantsData);

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

  // Более яркие и контрастные цвета для колеса
  const colors = [
    "#FF6B6B", // красный
    "#4ECDC4", // бирюзовый
    "#FFE66D", // желтый
    "#6A0572", // фиолетовый
    "#1A936F", // зеленый
    "#3A86FF", // синий
    "#FB5607", // оранжевый
    "#8338EC"  // пурпурный
  ];

  // Создаем участников для колеса с номерами
  const participantsWithColor: Participant[] = participants.length > 0
    ? detailedParticipants.map((p) => ({
        id: p.name,
        color: colors[p.number % colors.length],
        number: p.number // Добавляем номер участника
      }))
    : [{ id: 'fallback', color: colors[0], number: 0 }]; // Добавляем number для fallback

  const handleParticipate = async () => {
    if (!telegramId) {
      setModalOpen(true);
      return;
    }

    // Если пользователь - админ, сразу открываем модальное окно без проверки
    if (telegramId === process.env.NEXT_PUBLIC_ADMIN_ID || telegramId === '123456789') { // Используем переменную окружения или тестовый ID
      setModalOpen(true);
      return;
    }

    try {
      await checkPending(telegramId);
      setModalOpen(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Ошибка при проверке участия';
      setDuplicateMessage(msg);
      setShowDuplicateModal(true);
    }
  };

  const handleTimerEnd = async () => {
    console.log('Таймер завершен, запускаем процесс розыгрыша на фронтенде...');
    setIsSpinning(true); // Начинаем анимацию вращения

    // Ждем немного, чтобы дать бэкенду время завершить розыгрыш
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Обновляем данные после розыгрыша
    await reload();

    // Получаем список победителей, чтобы найти последнего
    try {
      const winners = await getWinners();
      if (winners && winners.length > 0) {
        // Предполагаем, что последний победитель в списке - это победитель только что завершившегося розыгрыша
        // В более надежной системе бэкенд должен предоставлять API для получения текущего победителя
        const latestWinner = winners[winners.length - 1];
        console.log('Последний победитель:', latestWinner);

        // Находим номер победителя среди детальных участников (если они еще доступны)
        const winnerDetails = detailedParticipants.find(p => p.name === latestWinner.name);

        if (winnerDetails) {
           setWinningParticipantNumber(winnerDetails.number);
           console.log('Номер победителя для колеса:', winnerDetails.number);
        } else {
           // Если детальные участники уже очищены, возможно, нужно запросить их снова или
           // бэкенд должен возвращать номер победителя напрямую после розыгрыша.
           // Пока просто логируем и не устанавливаем номер для спина.
           console.warn('Не удалось найти номер победителя среди текущих детальных участников.');
           // В этом случае колесо просто остановится без привязки к конкретному номеру
           setIsSpinning(false); // Останавливаем анимацию, если не можем найти номер
        }

      } else {
        console.log('Список победителей пуст после розыгрыша.');
        setIsSpinning(false); // Останавливаем анимацию, если нет победителей
      }
    } catch (error) {
      console.error('Ошибка при получении победителей после розыгрыша:', error);
      setIsSpinning(false); // Останавливаем анимацию при ошибке
    }

    // Анимация остановки колеса будет управляться в WheelComponent
    // После завершения анимации в WheelComponent, setIsSpinning(false) будет вызван там.
  };


  if (loading) return <SplashScreen />;
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
      <div className="flex-1 flex flex-col items-center justify-evenly px-2 sm:px-4 pt-4 sm:pt-6 pb-1 min-h-0 max-w-screen-sm mx-auto w-full">
        <div className="mb-2 sm:mb-3 w-full bg-gray-900 bg-opacity-90 backdrop-blur-md p-2 sm:p-3 rounded-md text-center">
          <p className="text-white text-xs sm:text-sm mb-1">До следующего розыгрыша:</p>
          <TimerDisplay onTimerEnd={handleTimerEnd} /> {/* Передаем обработчик завершения таймера */}
          <div className="mt-1 text-center">
           <p className="text-white text-lg sm:text-xl font-bold">Призовой фонд:</p>
           <p className="text-green-400 text-2xl sm:text-3xl font-bold">{prizePool > 0 ? prizePool : 0}₽</p>
          </div>
        </div>

        {/* Колесо с эффектом свечения */}
        <div className="-mt-2 sm:-mt-4 neon-glow p-2 mb-2 sm:mb-3">
          <WheelComponent
             participants={participantsWithColor}
             winningParticipantNumber={winningParticipantNumber}
             isSpinning={isSpinning}
             onSpinEnd={() => setIsSpinning(false)} // Колесо вызовет это, когда остановится
          />
        </div>

        {/* Unified Participate & Participants container */}
        <div className="w-full flex flex-col space-y-1">
          <button
            onClick={handleParticipate}
            className="participate-btn w-full rounded-full py-1.5 sm:py-2 text-xs sm:text-sm"
          >
            Участвовать
          </button>
          <ParticipateModal
            isOpen={modalOpen}
            onCloseAction={() => setModalOpen(false)}
            onSuccessAction={reload}
            telegramId={telegramId}
          />
          <PendingModal isOpen={showPending} onClose={() => setShowPending(false)} />
          <div className="bg-gray-800 p-3 sm:p-4 rounded-b-xl">
            <ParticipantList
              participants={participants}
              pendingUsers={pendingUsers}
            />
          </div>
        </div>
      </div>
      <DuplicateModal
        isOpen={showDuplicateModal}
        message={duplicateMessage}
        onClose={() => setShowDuplicateModal(false)}
      />
    </div>
  );
}
