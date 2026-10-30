import React, { useState } from 'react';
import { soundManager } from '../../audio/soundManager';
import { Sparkles, Flame, Zap, X } from 'lucide-react';

interface ChaiBrewModalProps {
  onComplete: () => void;
  onClose: () => void;
}

export const ChaiBrewModal: React.FC<ChaiBrewModalProps> = ({ onComplete, onClose }) => {
  const [step, setStep] = useState<number>(0);
  const [isBrewing, setIsBrewing] = useState<boolean>(false);
  const [isDone, setIsDone] = useState<boolean>(false);

  const handleAddGinger = () => {
    soundManager.playDebrisPull();
    setStep(1);
  };

  const handleAddSpices = () => {
    soundManager.playClank();
    setStep(2);
  };

  const handleAddTeaLeaves = () => {
    soundManager.playDebrisPull();
    setStep(3);
  };

  const handleBrewKettle = () => {
    soundManager.playTeaBoil();
    setIsBrewing(true);
    setTimeout(() => {
      soundManager.playTurboBoost();
      setIsBrewing(false);
      setIsDone(true);
    }, 1500);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs pointer-events-auto select-none">
      <div className="bg-slate-900 border-2 border-amber-600/50 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl flex flex-col gap-4 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">☕</span>
            <div>
              <h3 className="font-heading font-bold text-base sm:text-lg text-amber-400">
                Uncle Ramesh's Cutting Chai
              </h3>
              <p className="text-[11px] text-slate-400">Brew hot masala chai for a Turbo Sprint Boost!</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chai Kettle Stove Canvas Area */}
        <div className="relative py-8 bg-gradient-to-b from-stone-900 via-amber-950/40 to-slate-950 rounded-2xl border border-stone-800 flex flex-col items-center justify-center text-center overflow-hidden">
          {/* Flame burner underneath */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 text-amber-500 animate-pulse">
            <Flame className="w-5 h-5 fill-amber-500" />
            <Flame className="w-6 h-6 fill-orange-500" />
            <Flame className="w-5 h-5 fill-amber-500" />
          </div>

          {/* Steaming Brass Kettle Graphic */}
          <div className="relative mb-3">
            <span className="text-6xl select-none">🫖</span>
            {isBrewing && (
              <div className="absolute -top-4 right-0 text-xl animate-bounce">
                💨 🫧
              </div>
            )}
          </div>

          {/* Dialogue from Uncle Ramesh */}
          <div className="px-4 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs max-w-xs">
            {!isDone ? (
              <span className="text-amber-200">
                Uncle Ramesh: "Add the crushed ginger and cardamom, Aarav! A good cup of cutting chai gives wings to your legs!"
              </span>
            ) : (
              <span className="text-emerald-300 font-semibold">
                Uncle Ramesh: "Wah! Piping hot and aromatic! Drink up for Masala Turbo Boost!"
              </span>
            )}
          </div>
        </div>

        {/* Step-by-Step Ingredient Actions */}
        {!isDone ? (
          <div className="space-y-2">
            {step === 0 && (
              <button
                onClick={handleAddGinger}
                className="w-full py-3 bg-amber-700 hover:bg-amber-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-transform active:scale-95"
              >
                <span>🫚</span>
                <span>1. Crush Fresh Root Ginger into Pot</span>
              </button>
            )}

            {step === 1 && (
              <button
                onClick={handleAddSpices}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-transform active:scale-95"
              >
                <span>🌱</span>
                <span>2. Add Green Cardamom & Cloves</span>
              </button>
            )}

            {step === 2 && (
              <button
                onClick={handleAddTeaLeaves}
                className="w-full py-3 bg-stone-700 hover:bg-stone-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-transform active:scale-95"
              >
                <span>🍂</span>
                <span>3. Spoon in Strong Assam Tea Leaves</span>
              </button>
            )}

            {step === 3 && (
              <button
                onClick={handleBrewKettle}
                disabled={isBrewing}
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-bold rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xl animate-pulse"
              >
                <Flame className="w-4 h-4 fill-slate-950" />
                <span>{isBrewing ? 'Boiling Frothy Chai...' : '4. Bring to a Boil & Simmer!'}</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-amber-950/60 border border-amber-500/40 p-3 rounded-xl text-center space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-amber-300 font-bold text-sm">
                <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>MASALA TURBO BOOST ACTIVATED!</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Aarav sprints +50% faster with golden motion trails for the next 30 seconds!
              </p>
            </div>

            <button
              onClick={onComplete}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-xl cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Drink Chai & Dash to Clean! (+60 pts)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
