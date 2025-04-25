"use client";
import React from 'react';

interface SidebarProps {
  isOpen: boolean;
  onShowInstructionsAction: () => void;
  onShowHistoryAction: () => void;
  onCloseAction: () => void;
  onAdminTestAction?: () => void; // Добавлен новый проп
}

export default function Sidebar({ isOpen, onShowInstructionsAction, onShowHistoryAction, onCloseAction, onAdminTestAction }: SidebarProps) {
  const style = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    height: '100%',
    width: '16rem',
    backgroundColor: '#1F2937', // tailwind bg-gray-800
    color: '#fff',
    padding: '1rem',
    zIndex: isOpen ? 50 : -1,
    pointerEvents: isOpen ? 'auto' as const : 'none' as const,
    transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
    transition: 'transform 0.3s ease-in-out',
  };
  return (
    <div style={style}>
      <button onClick={onCloseAction} className="mb-4 focus:outline-none">Закрыть ✕</button>
      <ul className="space-y-2">
        <li>
          <button onClick={onShowInstructionsAction} className="w-full text-left px-2 py-2 hover:bg-gray-700 rounded">
            Инструкция
          </button>
        </li>
        <li>
          <button onClick={onShowHistoryAction} className="w-full text-left px-2 py-2 hover:bg-gray-700 rounded">
            История
          </button>
        </li>
        <li>
          <button
            onClick={onAdminTestAction}
            className="w-full text-left px-2 py-2 hover:bg-yellow-700 rounded bg-yellow-500 text-white font-bold mt-4"
          >
            Тест: Таймер 5 минут и выбрать победителя
          </button>
        </li>
      </ul>
    </div>
  );
}
