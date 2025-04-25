"use client";
import React, { useState } from 'react';
import ParticipantsModal from './ParticipantsModal';

interface ParticipantListProps {
  participants: string[];
  pendingUsers?: string[];
}

export default function ParticipantList({ participants, pendingUsers = [] }: ParticipantListProps) {
  const [showModal, setShowModal] = useState(false);
  return (
    <div className="text-white sticky bottom-0 z-30 bg-gray-900 bg-opacity-95 rounded-t-xl shadow-lg">
      <div className="flex justify-between items-center mb-2 cursor-pointer select-none" onClick={() => setShowModal(true)}>
        <h2 className="text-base sm:text-lg font-semibold gradient-text">Участники</h2>
        <span className="text-xs sm:text-sm bg-gray-700 px-2 py-1 rounded-full">
          {participants.length} {getParticipantWord(participants.length)}
        </span>
      </div>

      {participants.length > 0 ? (
        <ul className="space-y-1 max-h-36 sm:max-h-48 overflow-y-auto pr-1">
          {participants.map((name, idx) => (
            <li key={idx} className="flex items-center px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors">
              <span className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center bg-gray-800 rounded-full mr-2 text-xs">
                {idx + 1}
              </span>
              <span className="flex-grow text-sm sm:text-base truncate" title={name}>{name}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="px-3 py-3 sm:py-4 bg-gray-700 rounded text-center text-gray-400 text-sm">
          Нет участников
        </div>
      )}

      {/* Отображение ожидающих подтверждения */}
      {pendingUsers.length > 0 && (
        <div className="mt-3 sm:mt-4">
          <div className="flex justify-between items-center mb-1 sm:mb-2">
            <h3 className="text-xs sm:text-sm font-semibold text-yellow-400">Ожидают подтверждения</h3>
            <span className="text-xs bg-gray-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-yellow-400">
              {pendingUsers.length}
            </span>
          </div>
          <ul className="space-y-1 max-h-20 sm:max-h-24 overflow-y-auto pr-1">
            {pendingUsers.map((name, idx) => (
              <li key={`pending-${idx}`} className="flex items-center px-2 sm:px-3 py-1 sm:py-2 bg-gray-700/50 rounded">
                <span className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center bg-yellow-600/30 text-yellow-400 rounded-full mr-1.5 sm:mr-2 text-xs">
                  ⏳
                </span>
                <span className="flex-grow text-yellow-200 text-xs sm:text-sm truncate" title={name}>{name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <ParticipantsModal isOpen={showModal} onClose={() => setShowModal(false)} participants={participants} />
    </div>
  );
}

// Вспомогательная функция для правильного склонения слова "участник"
function getParticipantWord(count: number): string {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastDigit === 1 && lastTwoDigits !== 11) {
    return 'участник';
  } else if ([2, 3, 4].includes(lastDigit) && ![12, 13, 14].includes(lastTwoDigits)) {
    return 'участника';
  } else {
    return 'участников';
  }
}
