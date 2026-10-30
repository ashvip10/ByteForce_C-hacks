import React, { useEffect } from 'react';
import { Play, Sparkles, ShieldCheck, Heart, CloudRain } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface TitleScreenProps {
  onStart: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onStart }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        soundManager.playPickUp();
        onStart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStart]);

  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-between p-6 sm:p-12 text-slate-100 bg-radial from-slate-900/80 via-slate-950/90 to-slate-950/98 pointer-events-auto">
      {/* Top Header Tag */}
      <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 tracking-widest uppercase bg-sky-950/60 border border-sky-800/60 px-4 py-1.5 rounded-full">
        <CloudRain className="w-4 h-4 animate-bounce" />
        <span>Pre-Monsoon Eco Action Adventure</span>
      </div>

      {/* Hero Centerpiece: Bespoke Title Lockup */}
      <div className="flex flex-col items-center text-center max-w-2xl mx-auto space-y-4 my-auto">
        {/* Inline SVG Title Lockup */}
        <div className="relative">
          <svg className="w-72 sm:w-96 h-24 sm:h-28 mx-auto filter drop-shadow-[0_10px_20px_rgba(2,132,199,0.35)]" viewBox="0 0 400 120" fill="none">
            <defs>
              <linearGradient id="titleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#fbbf24" />
              </linearGradient>
              <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#e2e8f0" />
                <stop offset="100%" stopColor="#64748b" />
              </linearGradient>
            </defs>

            {/* Cloud accent */}
            <path
              d="M60 40 C60 25, 80 20, 95 30 C105 18, 130 18, 140 32 C155 30, 165 42, 160 55 C160 65, 145 70, 60 70 Z"
              fill="url(#cloudGrad)"
              opacity="0.3"
            />

            {/* Main Title Typography */}
            <text
              x="200"
              y="58"
              textAnchor="middle"
              fontFamily="Fredoka, sans-serif"
              fontWeight="700"
              fontSize="44"
              fill="url(#titleGrad)"
              letterSpacing="1"
            >
              STREET TO STREAM
            </text>

            {/* Subtitle Ribbon */}
            <rect x="70" y="76" width="260" height="26" rx="6" fill="#0f172a" stroke="#0ea5e9" strokeWidth="1.5" />
            <text
              x="200"
              y="94"
              textAnchor="middle"
              fontFamily="Plus Jakarta Sans, sans-serif"
              fontWeight="800"
              fontSize="13"
              fill="#f8fafc"
              letterSpacing="3"
            >
              BEFORE THE RAIN
            </text>
          </svg>

          {/* Sparkle badge */}
          <div className="absolute -top-3 -right-2 flex items-center gap-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
            <Sparkles className="w-3 h-3" />
            <span>2D Adventure</span>
          </div>
        </div>

        {/* Narrative Mission Pitch */}
        <p className="text-sm sm:text-base text-slate-300 max-w-lg leading-relaxed font-normal">
          Dark monsoon storm clouds are gathering fast! Join schoolboy hero <strong className="text-sky-300">Aarav</strong> and loyal street dog <strong className="text-amber-300">Sheru</strong> to collect street litter, segregate recyclables, and unclog 4 storm drain grates before the cloudburst floods the neighbourhood into the freshwater stream!
        </p>

        {/* Hero Features Highlights */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 text-xs text-slate-300 pt-1">
          <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> 🛠️ Drain Unclogging Minigame
          </span>
          <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
            <Heart className="w-4 h-4 text-amber-400" /> 🐕 Sheru Companion & Park Play
          </span>
          <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
            <Sparkles className="w-4 h-4 text-sky-400" /> ☕ Cutting Chai & Speed Boost
          </span>
          <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
            <Sparkles className="w-4 h-4 text-teal-400" /> ⛵ Stream Paper Boat Sailing
          </span>
        </div>

        {/* Primary Start CTA Button */}
        <div className="pt-4">
          <button
            onClick={() => {
              soundManager.playPickUp();
              onStart();
            }}
            className="group relative inline-flex items-center gap-3 px-8 py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-slate-950 font-bold text-base sm:text-lg rounded-2xl shadow-xl shadow-emerald-500/25 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            <span>START MISSION (SPACE / ENTER)</span>
          </button>
        </div>
      </div>

      {/* Flat Control-Hint Line (Per game craft guideline) */}
      <div className="text-center text-xs text-slate-400 font-mono-numbers">
        WASD Move · Space / E Action · Shift Sprint · Esc Pause · M Mute
      </div>
    </div>
  );
};
