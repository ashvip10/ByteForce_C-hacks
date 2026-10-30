import React, { useState } from 'react';
import { DrainGrate } from '../../types/game';
import { soundManager } from '../../audio/soundManager';
import { Sparkles, CheckCircle2, X, AlertTriangle, ArrowDown } from 'lucide-react';

interface DrainUnclogModalProps {
  drain: DrainGrate;
  onComplete: () => void;
  onClose: () => void;
}

export const DrainUnclogModal: React.FC<DrainUnclogModalProps> = ({ drain, onComplete, onClose }) => {
  const [debris, setDebris] = useState(drain.clogDebris.map(d => ({ ...d })));
  const [sludgeCleared, setSludgeCleared] = useState<number>(0); // 0 to 4 clicks to scrub muck
  const [leverPulled, setLeverPulled] = useState<boolean>(false);
  const [isGushing, setIsGushing] = useState<boolean>(false);
  const [celebration, setCelebration] = useState<boolean>(false);

  const remainingDebrisCount = debris.filter(d => !d.removed).length;
  const allDebrisRemoved = remainingDebrisCount === 0 && sludgeCleared >= 3;

  // Handle removing a piece of trapped solid trash
  const handleRemoveDebris = (id: string) => {
    soundManager.playDebrisPull();
    setDebris(prev =>
      prev.map(item => {
        if (item.id === id) {
          return { ...item, removed: true };
        }
        return item;
      })
    );
  };

  // Handle scrubbing the oily mud sludge
  const handleScrubSludge = () => {
    if (sludgeCleared >= 3) return;
    soundManager.playSludgeSquish();
    setSludgeCleared(prev => prev + 1);
  };

  // Pull the relief valve gate
  const handlePullLever = () => {
    if (!allDebrisRemoved || leverPulled) return;
    soundManager.playClank();
    setLeverPulled(true);
    setIsGushing(true);

    setTimeout(() => {
      soundManager.playDrainGush();
    }, 250);

    setTimeout(() => {
      setCelebration(true);
      setTimeout(() => {
        onComplete();
      }, 1400);
    }, 1200);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-xs pointer-events-auto select-none">
      <div className="relative bg-slate-900 border-2 border-slate-700 rounded-3xl p-4 sm:p-6 max-w-lg w-full shadow-2xl flex flex-col gap-4 text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛠️</span>
            <div>
              <h3 className="font-heading font-bold text-base sm:text-lg text-sky-400">
                Unclog Activity: {drain.name}
              </h3>
              <p className="text-[11px] text-slate-400">
                Remove trapped rubbish & scrub the muck to release storm water!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drain Chamber Viewport */}
        <div className="relative w-full h-72 sm:h-80 bg-gradient-to-b from-stone-900 via-stone-950 to-slate-950 rounded-2xl border-2 border-stone-700 overflow-hidden shadow-inner flex flex-col justify-between p-3">
          {/* Iron Grate Bars Overlay */}
          <div className="absolute inset-0 pointer-events-none flex justify-around opacity-30">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-2.5 h-full bg-stone-500 shadow-md border-x border-stone-800" />
            ))}
          </div>

          {/* Muddy Water rising / gushing */}
          <div
            className={`absolute bottom-0 left-0 right-0 transition-all duration-700 ${
              isGushing
                ? 'h-full bg-gradient-to-t from-sky-500/80 via-sky-600/60 to-transparent animate-pulse'
                : 'h-28 bg-gradient-to-t from-stone-900/90 via-amber-950/70 to-transparent'
            }`}
          />

          {/* Water rushing streaks when gushing */}
          {isGushing && (
            <div className="absolute inset-0 pointer-events-none flex justify-around overflow-hidden">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 h-full bg-sky-300 opacity-60 animate-bounce"
                  style={{ animationDuration: '0.4s', animationDelay: `${i * 0.08}s` }}
                />
              ))}
            </div>
          )}

          {/* Interactive Trapped Debris Items inside grate */}
          {debris.map(item => {
            if (item.removed) return null;
            return (
              <button
                key={item.id}
                onClick={() => handleRemoveDebris(item.id)}
                style={{ left: `${item.x}%`, top: `${item.y}%` }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 p-2.5 rounded-2xl bg-slate-900/90 border-2 hover:scale-110 active:scale-95 transition-all shadow-xl group cursor-pointer z-10"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold font-heading">
                  <span className="text-base">
                    {item.type === 'bag' ? '🛍️' : item.type === 'bottle' ? '🥤' : item.type === 'can' ? '🥫' : '🍂'}
                  </span>
                  <span className="text-slate-100 group-hover:text-amber-300 transition-colors">
                    {item.label}
                  </span>
                  <span className="text-[10px] bg-red-500/30 text-red-300 px-1.5 py-0.5 rounded-full border border-red-500/40">
                    Pull!
                  </span>
                </div>
              </button>
            );
          })}

          {/* Mud Sludge Patch in bottom corner */}
          {sludgeCleared < 3 && (
            <button
              onClick={handleScrubSludge}
              className="absolute bottom-5 left-1/2 -translate-x-1/2 px-4 py-2 bg-amber-950/90 hover:bg-amber-900 border-2 border-amber-700/80 rounded-2xl shadow-xl flex items-center gap-2 cursor-pointer z-10 transition-transform active:scale-95"
            >
              <span className="text-xl">🧹</span>
              <div className="text-left">
                <div className="text-xs font-bold text-amber-200">
                  Scrub Sticky Leaf Silt ({3 - sludgeCleared} left)
                </div>
                <div className="text-[10px] text-amber-400">Click to scrub away muck with broom</div>
              </div>
            </button>
          )}

          {/* Sheru Peeking & Cheering at top-right */}
          <div className="absolute top-2 right-2 bg-slate-900/90 border border-slate-700 px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2 z-10">
            <span className="text-xl">🐕</span>
            <div className="text-[11px] text-amber-300 font-semibold">
              {allDebrisRemoved ? 'Woof! Pull the iron gate!' : 'Sniff! Pull that rubbish out!'}
            </div>
          </div>

          {/* Water Flow Gate / Release Lever */}
          <div className="mt-auto pt-2 z-10 flex flex-col items-center">
            {allDebrisRemoved ? (
              <button
                onClick={handlePullLever}
                disabled={leverPulled}
                className={`px-6 py-3 rounded-2xl font-bold font-heading text-sm sm:text-base flex items-center gap-2 shadow-2xl transition-all transform ${
                  leverPulled
                    ? 'bg-sky-600 text-white cursor-default'
                    : 'bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-slate-950 hover:scale-105 active:scale-95 animate-pulse cursor-pointer'
                }`}
              >
                <ArrowDown className="w-5 h-5 animate-bounce" />
                <span>{leverPulled ? 'WATER SURGING FREELY! 🌊' : 'PULL GATE TO UNCLOG DRAIN!'}</span>
              </button>
            ) : (
              <div className="text-[11px] text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Clear remaining {remainingDebrisCount + (3 - sludgeCleared)} blockages before opening the gate</span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Status / Instructions */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <div className="flex items-center gap-2">
            <span>Debris Removed:</span>
            <span className="font-mono-numbers font-bold text-sky-400">
              {debris.filter(d => d.removed).length}/{debris.length}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-300 font-semibold">+150 Eco Points Upon Unclogging</span>
          </div>
        </div>
      </div>
    </div>
  );
};
