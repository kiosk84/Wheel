import React from 'react';

interface PendingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PendingModal({ isOpen, onClose }: PendingModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center modal px-4">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-sm text-center">
        <h3 className="text-lg font-semibold mb-4 text-white">Оплата на проверке</h3>
        <p className="text-white mb-6">Ваша оплата на проверке. Ожидайте подтверждения от администратора.</p>
        <button
          onClick={onClose}
          className="participate-btn bg-blue-600 text-white rounded-full px-6 py-2"
        >
          Ок
        </button>
      </div>
    </div>
  );
}
