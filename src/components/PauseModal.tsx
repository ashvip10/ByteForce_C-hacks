import React from 'react';
import { Play, RotateCcw, Volume2, VolumeX, X } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({ onResume, onRestart }) => {
  const [isMuted, setIsMuted] = React.useState(soundManager.getMuted());

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs pointer-events-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-5 text-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold font-heading text-slate-100">Game Paused</h2>
          <p className="text-xs text-slate-400">Take a breath — the clouds are holding for a moment.</p>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={onResume}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg transition-colors cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Resume Mission (Esc)</span>
          </button>

          <button
            onClick={handleToggleMute}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-sm flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span>{isMuted ? 'Unmute Audio (M)' : 'Mute Audio (M)'}</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-sm flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restart From Beginning</span>
          </button>
        </div>

        <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500">
          Tip: Sheru barks when near uncollected litter or clogged drain grates!
        </div>
      </div>
    </div>
  );
};
