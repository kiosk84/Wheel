"use client";
import React, { useRef, useEffect, useState } from 'react'; // Убедимся, что React импортирован правильно
import gsap from 'gsap'; // Добавляем импорт GSAP

export interface Participant { // Оставляем только одно определение интерфейса
  id: string;
  color: string;
  number?: number; // Добавляем номер участника
}

interface WheelProps {
  participants: Participant[];
  isSpinning: boolean; // Добавляем пропс для управления вращением
  winningParticipantNumber: number | null; // Добавляем пропс для номера победителя
  onSpinEnd: () => void; // Добавляем колбэк для завершения вращения
}

const Wheel: React.FC<WheelProps> = ({ participants, isSpinning, winningParticipantNumber, onSpinEnd }) => {
  const wheelRef = useRef<SVGGElement>(null);
  const [currentRotation, setCurrentRotation] = useState(0); // Состояние для текущего вращения

  const radius = 90; // Уменьшили с 120 до 90
  const center = 100; // Уменьшили с 120 до 100
  // Fallback to single gray segment when no participants
  const items = participants.length > 0 ? participants : [{ id: 'placeholder', color: '#555', number: 0 }]; // Добавляем number для fallback
  const sliceAngle = 360 / items.length;

  useEffect(() => {
    if (isSpinning && wheelRef.current && winningParticipantNumber !== null) {
      const winnerIndex = items.findIndex(p => p.number === winningParticipantNumber);
      if (winnerIndex === -1) {
        console.error(`Участник с номером ${winningParticipantNumber} не найден.`);
        onSpinEnd(); // Завершаем спин, если победитель не найден
        return;
      }

      // Угол для остановки: середина сегмента победителя
      // Учитываем, что указатель находится сверху (0 градусов)
      // Сегменты начинаются с 0 градусов по часовой стрелке
      // Угол сегмента победителя: winnerIndex * sliceAngle
      // Середина сегмента: winnerIndex * sliceAngle + sliceAngle / 2
      // Целевой угол для вращения колеса: 360 - (середина сегмента)
      // Добавляем несколько полных оборотов для эффекта вращения
      const baseAngle = 360 - (winnerIndex * sliceAngle + sliceAngle / 2);
      const totalRotation = currentRotation + 360 * 5 + baseAngle - (currentRotation % 360); // Добавляем 5 полных оборотов + целевой угол

      gsap.to(wheelRef.current, {
        rotation: totalRotation,
        duration: 5, // Длительность анимации в секундах
        ease: "power2.out", // Плавное замедление
        onComplete: () => {
          setCurrentRotation(totalRotation % 360); // Обновляем текущее вращение
          onSpinEnd(); // Вызываем колбэк по завершении
        }
      });
    } else if (!isSpinning && wheelRef.current) {
       // Если isSpinning стало false (например, при ошибке или сбросе), останавливаем анимацию
       gsap.killTweensOf(wheelRef.current);
    }
  }, [isSpinning, winningParticipantNumber, participants]); // Добавляем зависимости

  return (
    <div className="flex flex-col items-center">
      <svg
        width="200"
        height="200"
        viewBox="0 0 200 200"
      >
        {/* Gradient background behind wheel segments */}
        <defs>
          <radialGradient id="wheelBackground" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="#2d3748" />
            <stop offset="100%" stopColor="#1a202c" />
          </radialGradient>
        </defs>
        <circle cx={center} cy={center} r={radius} fill="url(#wheelBackground)" />
        {/* Применяем вращение к группе сегментов */}
        <g ref={wheelRef} style={{ transformOrigin: `${center}px ${center}px`, transform: `rotate(${currentRotation}deg)` }}>
          {items.length === 1 ? (
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill={items[0].color}
            />
          ) : (
            items.map((p, i) => {
              const startAngle = sliceAngle * i;
              const endAngle = sliceAngle * (i + 1);
              const x1 = center + radius * Math.cos((Math.PI / 180) * startAngle);
              const y1 = center + radius * Math.sin((Math.PI / 180) * startAngle);
              const x2 = center + radius * Math.cos((Math.PI / 180) * endAngle);
              const y2 = center + radius * Math.sin((Math.PI / 180) * endAngle);
              // Вычисляем позицию для текста (посередине сегмента)
              const midAngle = (startAngle + endAngle) / 2;
              const textRadius = radius * 0.7; // Немного ближе к центру для текста
              const textX = center + textRadius * Math.cos((Math.PI / 180) * midAngle);
              const textY = center + textRadius * Math.sin((Math.PI / 180) * midAngle);

              return (
                <React.Fragment key={p.id}>
                  <path
                    d={`M${center},${center} L${x1},${y1} A${radius},${radius} 0 0,1 ${x2},${y2} Z`}
                    fill={p.color}
                  />
                  {/* Добавляем номер участника с адаптивным размером и улучшенным стилем */}
                  <text
                    x={textX}
                    y={textY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontWeight="bold"
                    fontSize={items.length > 20 ? "10" : items.length > 10 ? "12" : "14"} // Адаптивный размер шрифта
                    style={{
                      pointerEvents: 'none',
                      textShadow: '0px 1px 2px rgba(0,0,0,0.8)'
                    }}
                    stroke="black"
                    strokeWidth="0.5"
                    paintOrder="stroke"
                  >
                    {p.number || ''}
                  </text>
                </React.Fragment>
              );
            })
          )}
          {/* Pointer with gradient */}
          <defs>
            <linearGradient id="pointerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FF3E3E" />
              <stop offset="100%" stopColor="#B71C1C" />
            </linearGradient>
          </defs>
          <polygon
            points="90,10 100,25 110,10"
            fill="url(#pointerGradient)"
            stroke="#000"
            strokeWidth={1.5}
            filter="drop-shadow(0px 2px 2px rgba(0,0,0,0.3))"
          />
        </g>
      </svg>
    </div>
  );
};

export default Wheel;
// Removed gsap import since automatic spin handled by backend/timer
