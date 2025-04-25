import React from 'react';

interface ParticipantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  participants: string[];
}

export default function ParticipantsModal({ isOpen, onClose, participants }: ParticipantsModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <div className="bg-gray-900 p-6 rounded-lg shadow-lg max-w-xs w-full text-center relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl"
          onClick={onClose}
          aria-label="Закрыть"
        >
          ×
        </button>
        <h4 className="text-lg font-bold text-yellow-400 mb-3">Все участники</h4>
        <ul className="max-h-72 overflow-y-auto text-left space-y-2">
          {participants.map((name, idx) => (
            <li key={idx} className="bg-gray-800 rounded px-3 py-2 text-white flex items-center">
              <span className="w-6 inline-block text-gray-400">{idx + 1}.</span>
              <span className="truncate" title={name}>{name}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
