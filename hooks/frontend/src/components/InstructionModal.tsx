"use client";
import React from 'react';

interface InstructionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InstructionModal({ isOpen, onClose }: InstructionModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center modal px-4 z-50">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-semibold mb-4 text-white text-center">Как участвовать в розыгрыше</h3>

        <div className="space-y-6 text-gray-300">
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="flex items-start mb-2">
              <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                1
              </div>
              <div>
                <h4 className="font-medium text-white mb-1">Регистрация</h4>
                <p className="text-sm">Нажмите кнопку «Участвовать» на главной странице и введите своё имя.</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="flex items-start mb-2">
              <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                2
              </div>
              <div>
                <h4 className="font-medium text-white mb-1">Оплата</h4>
                <p className="text-sm">Переведите 100₽ через СБП на указанный номер телефона и нажмите кнопку «Оплатил».</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="flex items-start mb-2">
              <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                3
              </div>
              <div>
                <h4 className="font-medium text-white mb-1">Подтверждение</h4>
                <p className="text-sm">После отправки заявки вы будете добавлены в список ожидающих подтверждения. Администратор проверит оплату и подтвердит ваше участие.</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="flex items-start mb-2">
              <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                4
              </div>
              <div>
                <h4 className="font-medium text-white mb-1">Розыгрыш</h4>
                <p className="text-sm">Розыгрыш проводится автоматически по таймеру. Победитель определяется случайным образом среди всех участников.</p>
                <p className="text-xs text-yellow-400 mt-2">Важно: максимальное количество участников в одном розыгрыше — 100 человек.</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="flex items-start mb-2">
              <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                5
              </div>
              <div>
                <h4 className="font-medium text-white mb-1">Получение выигрыша</h4>
                <p className="text-sm">Если вы выиграли, с вами свяжется администратор для уточнения реквизитов для отправки выигрыша.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={onClose}
            className="participate-btn bg-blue-600 hover:bg-blue-500 text-white rounded-full px-6 py-2 transition-colors"
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
}
