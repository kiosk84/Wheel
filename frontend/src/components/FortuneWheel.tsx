import React, { useRef, useState } from "react";
import gsap from "gsap";

interface FortuneWheelProps {
  participants: string[];
  selecting?: boolean;
  winnerName?: string | null; // новое поле: имя победителя
  onFinish?: () => void;
}

const WHEEL_RADIUS = 110; // уменьшенный радиус
const CENTER = 130;
const SVG_SIZE = 260;
const LAMP_COUNT = 28;

const FortuneWheel: React.FC<FortuneWheelProps> = ({ participants, selecting = false, winnerName = null, onFinish }) => {
  const wheelRef = useRef<SVGGElement>(null);
  const [spinning, setSpinning] = useState(false);
  const [winnerIdx, setWinnerIdx] = useState<number | null>(null);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [showWinner, setShowWinner] = useState(false);

  const sliceAngle = 360 / (participants.length || 1);

  React.useEffect(() => {
    if (selecting && !spinning && participants.length > 0 && winnerName) {
      spinToWinner(winnerName);
    }
    // eslint-disable-next-line
  }, [selecting, winnerName]);

  // Новый метод: крутить колесо на определённого победителя
  const spinToWinner = (name: string) => {
    if (spinning || participants.length === 0) return;
    setSpinning(true);
    setShowWinner(false);
    const idx = participants.findIndex(p => p === name);
    if (idx === -1) {
      setSpinning(false);
      if (onFinish) onFinish();
      return;
    }
    setWinnerIdx(idx);
    const stopAngle = 360 - (idx * sliceAngle + sliceAngle / 2);
    const totalRotation = 360 * 4 + stopAngle;
    gsap.to(
      { val: currentRotation },
      {
        val: totalRotation,
        duration: 6,
        ease: "power2.out",
        onUpdate: function () {
          setCurrentRotation(this.targets()[0].val);
        },
        onComplete: () => {
          setSpinning(false);
          setShowWinner(true);
          setTimeout(() => {
            setShowWinner(false);
            if (onFinish) onFinish();
          }, 10000);
        },
      }
    );
  };

  // Размер кружка зависит от количества участников
  const getCircleRadius = (count: number) => {
    if (count >= 80) return 7;
    if (count >= 60) return 9;
    if (count >= 40) return 12;
    if (count >= 20) return 15;
    return 16;
  };

  return (
    <div className="flex flex-col items-center relative">
      <svg width={SVG_SIZE} height={SVG_SIZE} viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
        className="block">
        {/* Лампочки */}
        {[...Array(LAMP_COUNT)].map((_, i) => {
          const angle = (2 * Math.PI * i) / LAMP_COUNT;
          const x = CENTER + (WHEEL_RADIUS + 12) * Math.cos(angle);
          const y = CENTER + (WHEEL_RADIUS + 12) * Math.sin(angle);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={6}
              fill="#FFD700"
              stroke="#fff"
              strokeWidth="1.5"
              filter="drop-shadow(0 0 6px #FFD700)"
            />
          );
        })}
        {/* Группа для вращения */}
        <g ref={wheelRef} transform={`rotate(${currentRotation},${CENTER},${CENTER})`}>
          {/* Сегменты с градиентом */}
          <defs>
            <radialGradient id="wheelGrad" cx="50%" cy="50%" r="80%">
              <stop offset="0%" stopColor="#23272f" />
              <stop offset="80%" stopColor="#FFD700" />
              <stop offset="100%" stopColor="#bfa100" />
            </radialGradient>
          </defs>
          {participants.map((num, i) => {
            const startAngle = sliceAngle * i - 90;
            const endAngle = sliceAngle * (i + 1) - 90;
            const largeArc = sliceAngle > 180 ? 1 : 0;
            const x1 = CENTER + WHEEL_RADIUS * Math.cos((Math.PI / 180) * startAngle);
            const y1 = CENTER + WHEEL_RADIUS * Math.sin((Math.PI / 180) * startAngle);
            const x2 = CENTER + WHEEL_RADIUS * Math.cos((Math.PI / 180) * endAngle);
            const y2 = CENTER + WHEEL_RADIUS * Math.sin((Math.PI / 180) * endAngle);
            return (
              <path
                key={i}
                d={`M${CENTER},${CENTER} L${x1},${y1} A${WHEEL_RADIUS},${WHEEL_RADIUS} 0 ${largeArc} 1 ${x2},${y2} Z`}
                fill="url(#wheelGrad)"
                stroke="#FFD700"
                strokeWidth="2"
              />
            );
          })}
          {/* Номерки участников в кружочках внутри сегментов (цифры 1, 2, 3...) и тёмный цвет внутри круга) */}
          {participants.map((_, i) => {
            const midAngle = sliceAngle * (i + 0.5) - 90;
            const numRadius = WHEEL_RADIUS * 0.62;
            const x = CENTER + numRadius * Math.cos((Math.PI / 180) * midAngle);
            const y = CENTER + numRadius * Math.sin((Math.PI / 180) * midAngle);
            const isWinner = winnerIdx === i && !spinning;
            const circleR = getCircleRadius(participants.length);
            return (
              <g key={i}>
                <circle
                  cx={x}
                  cy={y}
                  r={isWinner ? circleR + 6 : circleR}
                  fill={isWinner ? "#FFD700" : "#23272f"}
                  stroke={isWinner ? "#b71c1c" : "#FFD700"}
                  strokeWidth={isWinner ? 4 : 2}
                  filter={isWinner ? "drop-shadow(0 0 12px #FFD700)" : undefined}
                />
                <text
                  x={x}
                  y={y + 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={isWinner ? "#b71c1c" : "#fff"}
                  fontWeight="bold"
                  fontSize={isWinner ? circleR + 6 : circleR}
                  style={{ pointerEvents: "none", userSelect: "none" }}
                >
                  {i + 1}
                </text>
              </g>
            );
          })}
        </g>
        {/* Звезда в центре теперь тёмная */}
        <g>
          <circle cx={CENTER} cy={CENTER} r={32} fill="#23272f" filter="drop-shadow(0 0 8px #23272f)" />
          <polygon
            points={Array.from({ length: 10 }).map((_, i) => {
              const r = i % 2 === 0 ? 28 : 14;
              const angle = (Math.PI / 5) * i - Math.PI / 2;
              const x = CENTER + r * Math.cos(angle);
              const y = CENTER + r * Math.sin(angle);
              return `${x},${y}`;
            }).join(" ")}
            fill="#23272f"
            stroke="#FFD700"
            strokeWidth="2"
          />
        </g>
        {/* Новый улучшенный красный треугольник-указатель: меньше, перевёрнут вниз, с градиентом и тенью */}
        <defs>
          <linearGradient id="pointerGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff6161" />
            <stop offset="100%" stopColor="#b71c1c" />
          </linearGradient>
        </defs>
        <polygon
          points={`${CENTER-12},${CENTER-WHEEL_RADIUS-16} ${CENTER+12},${CENTER-WHEEL_RADIUS-16} ${CENTER},${CENTER-WHEEL_RADIUS+10}`}
          fill="url(#pointerGrad)"
          stroke="#fff"
          strokeWidth="2"
          filter="drop-shadow(0 4px 8px #b71c1c88)"
        />
      </svg>
      {/* Неоновая подсветка под колесом */}
      {/* Удалено по просьбе пользователя */}
      {showWinner && winnerIdx !== null && (
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-yellow-400 text-balance text-center text-2xl sm:text-3xl font-extrabold rounded-2xl px-8 py-6 shadow-2xl animate-fade-in"
          style={{ pointerEvents: 'none' }}
        >
          <span className="relative inline-block">
            <span className="text-white absolute -top-0.5 -left-0.5 select-none" style={{ WebkitTextStroke: '1px #23272f', textShadow: '0 1px 4px #23272f' }}>Победитель!</span>
            <span className="relative text-white" style={{ WebkitTextStroke: '1px #23272f', textShadow: '0 1px 4px #23272f' }}>Победитель!</span>
          </span>
          <br />
          <span className="text-4xl sm:text-5xl text-red-700 drop-shadow-lg">{participants[winnerIdx]}</span>
        </div>
      )}
    </div>
  );
};

export default FortuneWheel;
