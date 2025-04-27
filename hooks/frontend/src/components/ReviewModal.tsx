import React from 'react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReviewModal({ isOpen, onClose }: ReviewModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center modal">
      <div className="bg-gray-800 p-6 rounded shadow-lg max-w-sm w-full">
        <h3 className="text-lg font-semibold mb-4 text-white">Заявка отправлена</h3>
        <p className="text-white mb-4">Ваша заявка на проверке. Дождитесь подтверждения.</p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Закрыть
        </button>
      </div>
    </div>
  );
}
