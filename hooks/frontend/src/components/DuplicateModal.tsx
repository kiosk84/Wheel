import React from 'react';

interface DuplicateModalProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}

export default function DuplicateModal({ isOpen, message, onClose }: DuplicateModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
      <div className="bg-[#23262F] p-6 rounded-2xl shadow-2xl max-w-sm w-full border border-[#222]">
        <h3 className="text-lg font-semibold mb-4 text-[#229ED9]">Уведомление</h3>
        <p className="text-[#E5E5E5] mb-4">{message}</p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-[#229ED9] text-white rounded-xl hover:bg-[#1b7eb3] font-semibold shadow"
        >
          Закрыть
        </button>
      </div>
    </div>
  );
}
