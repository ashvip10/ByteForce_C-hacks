import React from 'react';
import { Trophy, Sparkles, CheckCircle2, RotateCcw, Heart, Waves } from 'lucide-react';
import { GameEngine } from '../game/engine';

interface VictoryModalProps {
  engine: GameEngine;
  onRestart: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({ engine, onRestart }) => {
  const depositedCount = engine.bins.reduce((sum, b) => sum + b.depositedCount, 0);

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs pointer-events-auto">
      <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl shadow-emerald-500/20 text-center space-y-6">
        {/* Celebration Trophy Icon */}
        <div className="relative mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/30">
          <Trophy className="w-9 h-9 text-slate-950" />
          <div className="absolute -top-2 -right-2">
            <Sparkles className="w-6 h-6 text-amber-300 animate-spin" />
          </div>
        </div>

        {/* Headline */}
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            Mission Accomplished!
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-100">
            The Stream Is Saved!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1">
            The monsoon downpour has arrived, but thanks to your swift action with Sheru, all 4 storm drains are clear and crystal water flows safely into the park stream without flooding the street!
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 text-center">
          <div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Eco Score</div>
            <div className="text-xl font-bold font-mono-numbers text-emerald-400">
              {engine.player.score}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Waste Sorted</div>
            <div className="text-xl font-bold font-mono-numbers text-sky-400">
              {depositedCount} items
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Sheru Love</div>
            <div className="text-xl font-bold font-mono-numbers text-amber-400 flex items-center justify-center gap-1">
              <Heart className="w-3.5 h-3.5 fill-amber-400" />
              <span>{engine.dog.happiness}%</span>
            </div>
          </div>
        </div>

        {/* Eco Heroes Certificate */}
        <div className="flex items-center justify-center gap-2 text-xs text-emerald-300 bg-emerald-950/50 border border-emerald-800/60 py-2 px-3 rounded-xl">
          <Waves className="w-4 h-4 shrink-0" />
          <span>Awarded: <strong>Neighbourhood Guardian Badge</strong> 🏅</span>
        </div>

        {/* Play Again Button */}
        <button
          onClick={onRestart}
          className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-base flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 transition-transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Play Again & Beat Score</span>
        </button>
      </div>
    </div>
  );
};
