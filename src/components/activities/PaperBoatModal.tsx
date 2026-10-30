import React, { useState, useEffect } from 'react';
import { soundManager } from '../../audio/soundManager';
import { Sparkles, Trophy, Waves, X } from 'lucide-react';

interface PaperBoatModalProps {
  onComplete: (scoreGain: number) => void;
  onClose: () => void;
}

export const PaperBoatModal: React.FC<PaperBoatModalProps> = ({ onComplete, onClose }) => {
  const [boatX, setBoatX] = useState<number>(50); // percentage 20 to 80
  const [progress, setProgress] = useState<number>(0); // 0 to 100
  const [petalsCollected, setPetalsCollected] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  useEffect(() => {
    if (isFinished) return;
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          soundManager.playVictory();
          setIsFinished(true);
          return 100;
        }
        return p + 4;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [isFinished]);

  const handleMoveLeft = () => {
    soundManager.playBoatSplash();
    setBoatX(x => Math.max(20, x - 15));
    setPetalsCollected(c => c + 1);
  };

  const handleMoveRight = () => {
    soundManager.playBoatSplash();
    setBoatX(x => Math.min(80, x + 15));
    setPetalsCollected(c => c + 1);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs pointer-events-auto select-none">
      <div className="bg-slate-900 border-2 border-sky-500/40 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl flex flex-col gap-4 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⛵</span>
            <div>
              <h3 className="font-heading font-bold text-base sm:text-lg text-sky-400">
                Bunty's Paper Boat Stream Voyage
              </h3>
              <p className="text-[11px] text-slate-400">Steer the paper boat down the clean freshwater stream!</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stream Water Course */}
        <div className="relative h-60 bg-gradient-to-b from-sky-950 via-sky-800/80 to-blue-900 rounded-2xl border border-sky-600/50 overflow-hidden shadow-inner flex flex-col justify-between p-3">
          {/* Animated Ripples */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="w-full h-1 bg-white my-8 animate-pulse"
                style={{ animationDuration: `${1.2 + i * 0.3}s` }}
              />
            ))}
          </div>

          {/* Steerable Paper Boat */}
          <div
            className="absolute transition-all duration-200 text-4xl select-none filter drop-shadow-md"
            style={{
              left: `${boatX}%`,
              bottom: `${15 + (progress * 0.65)}%`,
              transform: 'translateX(-50%)',
            }}
          >
            ⛵
          </div>

          {/* Lotus Flowers in stream */}
          <div className="absolute top-6 left-1/4 text-xl">🪷</div>
          <div className="absolute top-20 right-1/4 text-xl">🪷</div>
          <div className="absolute bottom-16 left-1/3 text-xl">🪷</div>

          {/* Finish Line Buoy */}
          <div className="absolute top-2 left-0 right-0 border-b-2 border-dashed border-sky-300 flex justify-between px-4 text-[10px] text-sky-200 font-bold uppercase">
            <span>🏁 Lotus Pond Finish</span>
            <span>Progress: {progress}%</span>
          </div>

          {/* Cheer message */}
          <div className="mt-auto z-10 self-center bg-slate-900/90 border border-slate-700 px-3 py-1 rounded-full text-xs text-sky-300">
            Bunty: "Look how fast it glides! The water is sparkling!"
          </div>
        </div>

        {/* Steering Controls or Victory Button */}
        {!isFinished ? (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleMoveLeft}
              className="py-3 bg-sky-950 hover:bg-sky-900 border-2 border-sky-500 rounded-xl text-xs font-bold text-sky-200 flex items-center justify-center gap-1 cursor-pointer transition-transform active:scale-95"
            >
              <span>◀</span>
              <span>Steer Port (Left)</span>
            </button>
            <button
              onClick={handleMoveRight}
              className="py-3 bg-sky-950 hover:bg-sky-900 border-2 border-sky-500 rounded-xl text-xs font-bold text-sky-200 flex items-center justify-center gap-1 cursor-pointer transition-transform active:scale-95"
            >
              <span>Steer Starboard (Right)</span>
              <span>▶</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => onComplete(80 + petalsCollected * 5)}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-xl cursor-pointer"
          >
            <Trophy className="w-4 h-4" />
            <span>Boat Reached Lotus Pond! (+{80 + petalsCollected * 5} pts)</span>
          </button>
        )}
      </div>
    </div>
  );
};
