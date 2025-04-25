"use client";
import React, { useState } from 'react';
import { postPending } from '../lib/api';

interface ParticipateModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  onSuccessAction: () => void;
  telegramId: string;
}

export default function ParticipateModal({ isOpen, onCloseAction, onSuccessAction, telegramId }: ParticipateModalProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    if (!name.trim()) { alert('Введите имя'); return; }
    setLoading(true);
    let id = telegramId;
    // Попытка получить id из Telegram WebApp при отправке
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
      id = window.Telegram.WebApp.initDataUnsafe.user.id.toString();
    }
    // Если id всё равно нет — генерируем временный id
    if (!id) {
      id = 'webapp_' + Date.now();
    }
    try {
      await postPending(name.trim(), id);
      alert('Заявка отправлена! Вы добавлены в список ожидающих подтверждения.');
      onSuccessAction();
      setName('');
      onCloseAction();
    } catch (e) {
      console.error('postPending error', e);
      alert(e instanceof Error ? e.message : 'Ошибка при отправке заявки');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center modal px-3 sm:px-4 z-50">
      <div className="bg-gray-800 p-4 sm:p-6 md:p-8 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-white text-center">Участие в розыгрыше</h3>

        <div className="mb-4 sm:mb-6 bg-gray-700 p-3 sm:p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300 text-sm sm:text-base">Стоимость участия:</span>
            <span className="text-green-400 font-bold text-sm sm:text-base">100 ₽</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300 text-sm sm:text-base">Способ оплаты:</span>
            <span className="text-white text-sm sm:text-base">СБП</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm sm:text-base">Номер для перевода:</span>
            <span className="text-white font-mono bg-gray-600 px-2 py-1 rounded text-xs sm:text-sm">+79536029130</span>
          </div>
          <div className="mt-2 sm:mt-3 text-xs text-gray-400">
            Переведите указанную сумму по СБП на номер телефона (Озон Банк), затем нажмите кнопку &quot;Оплатил&quot;.
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-300 text-sm sm:text-base mb-1 sm:mb-2">Ваше имя:</label>
          <input
            type="text"
            className="w-full p-2 sm:p-3 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none text-sm sm:text-base"
            placeholder="Введите ваше имя"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <p className="mt-1 text-xs text-gray-400">
            Имя будет отображаться в списке участников и в случае выигрыша
          </p>
        </div>

        <div className="flex justify-center space-x-3 sm:space-x-4">
          <button
            onClick={onCloseAction}
            className="participate-btn bg-gray-600 hover:bg-gray-500 text-white rounded-full px-4 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={handleApprove}
            disabled={loading || !name.trim()}
            className={`participate-btn ${!name.trim() ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500'} text-white rounded-full px-4 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm transition-colors`}
          >
            {loading ? 'Отправка...' : 'Оплатил'}
          </button>
        </div>

        <p className="mt-3 sm:mt-4 text-xs text-center text-gray-400">
          После нажатия кнопки &quot;Оплатил&quot; ваша заявка будет отправлена на проверку администратору.
          Вы получите уведомление о подтверждении участия.
        </p>
      </div>
    </div>
  );
}
