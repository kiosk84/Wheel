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
    try {
      await postPending(name.trim(), telegramId);
      alert('Заявка отправлена!');
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
    <div className="fixed inset-0 flex items-center justify-center modal px-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-sm">
        <h3 className="text-lg font-semibold mb-4 text-white">Участвовать</h3>
        <input
          type="text"
          className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
          placeholder="Ваше имя"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <p className="text-sm text-gray-300 mb-6">
          Стоимость участия: 100 ₽. Переведите через СБП на номер <strong>+79536029130</strong> (Озон Банк).
        </p>
        <div className="flex justify-center space-x-4">
          <button onClick={onCloseAction} className="participate-btn bg-red-600 text-white rounded-full px-4 py-2">
            Отмена
          </button>
          <button onClick={handleApprove} disabled={loading} className="participate-btn bg-green-600 text-white rounded-full px-4 py-2">
            {loading ? '...' : 'Оплатил'}
          </button>
        </div>
      </div>
    </div>
  );
}
