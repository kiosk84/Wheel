"use client";
import React, { useEffect, useState } from 'react';
import { getWinners, Winner } from '../lib/api';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HistoryModal({ isOpen, onClose }: HistoryModalProps) {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    getWinners()
      .then(data => setWinners(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center modal">
      <div className="bg-gray-800 p-6 rounded shadow-lg max-w-md w-full mx-4">
        <h3 className="text-xl font-semibold mb-4 text-white">История победителей</h3>
        {loading && <p className="text-white">Загрузка...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && (
          <ul className="text-white space-y-2 max-h-60 overflow-y-auto">
            {winners.map((w, idx) => (
              <li key={idx}>{w.date}: {w.name} — {w.prize}₽</li>
            ))}
          </ul>
        )}
        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded">Закрыть</button>
        </div>
      </div>
    </div>
  );
}
