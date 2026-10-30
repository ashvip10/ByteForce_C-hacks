import React from 'react';
import { AlertTriangle, CloudRain, RotateCcw } from 'lucide-react';
import { GameEngine } from '../game/engine';

interface GameOverModalProps {
  engine: GameEngine;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ engine, onRestart }) => {
  const clearedDrainsCount = engine.drains.filter(d => d.isCleared).length;

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xs pointer-events-auto">
      <div className="bg-slate-900 border border-red-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl shadow-red-500/20 text-center space-y-6">
        {/* Storm Alert Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-600 flex items-center justify-center shadow-lg shadow-red-500/30">
          <CloudRain className="w-9 h-9 text-white animate-pulse" />
        </div>

        {/* Headline */}
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-widest text-red-400">
            Monsoon Arrived Too Soon!
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-100">
            Streets Flooded!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1">
            The torrential monsoon rains burst before all drains were unblocked ({clearedDrainsCount}/4 cleared). Rainwater backed up through the clogged gutters, flooding Ramesh's chai stall and the school lane.
          </p>
        </div>

        {/* Tip Box */}
        <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 text-left text-xs text-slate-300 space-y-1.5">
          <div className="font-semibold text-amber-400 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Pro Strategy:</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Sprint with [Shift] to move faster. Follow Sheru's barking alerts — he points straight to clogged grates and trapped litter! Hold [Space] continuously until the drain unblock bar fills completely.
          </p>
        </div>

        {/* Retry Button */}
        <button
          onClick={onRestart}
          className="w-full py-3.5 bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 hover:from-red-400 hover:to-emerald-400 text-slate-950 font-bold rounded-xl text-base flex items-center justify-center gap-2 shadow-xl shadow-red-500/25 transition-transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Try Again & Save The Stream</span>
        </button>
      </div>
    </div>
  );
};
