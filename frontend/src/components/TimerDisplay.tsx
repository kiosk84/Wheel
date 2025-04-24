"use client";
import React, { useEffect, useState } from 'react';
import { getTimer } from '../lib/api';

export default function TimerDisplay({ onTimerEnd }: { onTimerEnd?: () => void }) {
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let current = 0;
    let mounted = true;
    const fetchTimer: () => Promise<void> = async () => {
      try {
        const data = await getTimer();
        if (mounted) {
          current = Math.max(0, data.secondsRemaining);
          setTimer(current);
        }
      } catch (e) {
        console.error('Failed to fetch timer:', e);
      }
    };
    fetchTimer();
    const id = setInterval(() => {
      if (current > 0) {
        current -= 1;
        setTimer(current);
        if (current === 0) {
          fetchTimer();
          if (onTimerEnd) {
            onTimerEnd();
          }
        }
      } else {
        fetchTimer();
        if (onTimerEnd) {
          onTimerEnd();
        }
      }
    }, 1000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [onTimerEnd]); // Add onTimerEnd to dependency array

  const h = Math.floor(timer / 3600)
    .toString()
    .padStart(2, '0');
  const m = Math.floor((timer % 3600) / 60)
    .toString()
    .padStart(2, '0');
  const s = (timer % 60).toString().padStart(2, '0');

  return (
    <div className={`digital-timer font-mono font-bold text-3xl sm:text-4xl text-yellow-400 ${timer <= 10 && timer > 0 ? 'text-red-500 animate-pulse' : ''}`}>
      {h}:{m}:{s}
    </div>
  );
}
