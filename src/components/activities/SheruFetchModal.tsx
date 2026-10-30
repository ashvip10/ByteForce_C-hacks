import React, { useState } from 'react';
import { soundManager } from '../../audio/soundManager';
import { Sparkles, Heart, Trophy, X } from 'lucide-react';

interface SheruFetchModalProps {
  onComplete: (scoreGain: number) => void;
  onClose: () => void;
}

export const SheruFetchModal: React.FC<SheruFetchModalProps> = ({ onComplete, onClose }) => {
  const [stickThrown, setStickThrown] = useState<boolean>(false);
  const [sheruState, setSheruState] = useState<'waiting' | 'running' | 'digging' | 'found'>('waiting');

  const handleThrow = () => {
    if (stickThrown) return;
    setStickThrown(true);
    setSheruState('running');
    soundManager.playDebrisPull();

    setTimeout(() => {
      soundManager.playDogBark();
      setSheruState('digging');
      soundManager.playSludgeSquish();
    }, 1000);

    setTimeout(() => {
      soundManager.playDogHappy();
      soundManager.playVictory();
      setSheruState('found');
    }, 2200);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs pointer-events-auto select-none">
      <div className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl flex flex-col gap-4 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐕</span>
            <div>
              <h3 className="font-heading font-bold text-base sm:text-lg text-amber-400">
                Park Play with Sheru
              </h3>
              <p className="text-[11px] text-slate-400">Throw the wooden stick & search for treasures!</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Park Meadow Visual Area */}
        <div className="relative py-12 bg-gradient-to-b from-emerald-950/60 via-green-950/70 to-slate-950 rounded-2xl border border-emerald-800/60 flex flex-col items-center justify-center text-center overflow-hidden">
          {/* Flower & grass decorations */}
          <div className="absolute bottom-2 left-4 text-xl">🌼 🌿</div>
          <div className="absolute bottom-3 right-6 text-xl">🌱 🌸</div>

          {/* Sheru Display */}
          <div className="relative mb-2">
            <div className={`text-6xl transition-all duration-700 ${sheruState === 'running' ? 'translate-x-12 animate-bounce' : sheruState === 'digging' ? 'animate-spin' : ''}`}>
              {sheruState === 'found' ? '🐕‍🦺' : '🐕'}
            </div>
            {sheruState === 'found' && (
              <div className="absolute -top-3 -right-2 text-2xl animate-bounce">
                ✨ 🪙
              </div>
            )}
          </div>

          {/* State Text */}
          <div className="px-4 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-xs max-w-xs mt-2">
            {sheruState === 'waiting' && <span className="text-amber-200">Sheru is waiting eagerly with a wagging tail!</span>}
            {sheruState === 'running' && <span className="text-sky-300">Sheru dashes across the meadow at top speed!</span>}
            {sheruState === 'digging' && <span className="text-amber-300">Sheru is digging enthusiastically near the willow tree!</span>}
            {sheruState === 'found' && <span className="text-emerald-300 font-semibold">Woof! Sheru dug up a Golden Monsoon Eco-Medallion! 🏅</span>}
          </div>
        </div>

        {/* Action Button */}
        {sheruState === 'waiting' && (
          <button
            onClick={handleThrow}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-xl cursor-pointer transition-transform active:scale-95"
          >
            <span>🪵</span>
            <span>Throw Wooden Stick Across Park!</span>
          </button>
        )}

        {sheruState === 'found' && (
          <button
            onClick={() => onComplete(100)}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-xl cursor-pointer"
          >
            <Trophy className="w-4 h-4" />
            <span>Praise Sheru & Collect Reward (+100 pts)</span>
          </button>
        )}
      </div>
    </div>
  );
};
