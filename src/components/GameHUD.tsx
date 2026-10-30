import React, { useState } from 'react';
import { soundManager } from '../audio/soundManager';
import { GameEngine } from '../game/engine';
import { WORLD_HEIGHT, WORLD_WIDTH } from '../game/constants';
import {
  Volume2,
  VolumeX,
  Pause,
  Map as MapIcon,
  Sparkles,
  CloudLightning,
  Heart,
  Package,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Compass,
} from 'lucide-react';

interface GameHUDProps {
  engine: GameEngine;
  onPause: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({ engine, onPause }) => {
  const [showMinimap, setShowMinimap] = useState<boolean>(true);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(soundManager.getMuted());

  const minutes = Math.floor(engine.timeRemaining / 60);
  const seconds = Math.floor(engine.timeRemaining % 60);
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const clearedDrainsCount = engine.drains.filter(d => d.isCleared).length;
  const isStormCritical = engine.timeRemaining < 60;

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-4 z-20">
      {/* Top Header Cluster */}
      <div className="flex items-start justify-between gap-3 w-full">
        {/* Top-Left: Storm Clock & Drains Status */}
        <div className="flex flex-col gap-2">
          {/* Storm Timer Card */}
          <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-xs border border-slate-700/60 rounded-xl px-3.5 py-2 shadow-xl flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isStormCritical ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-sky-500/20 text-sky-400'}`}>
              <CloudLightning className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Monsoon Rain Arrival
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xl font-bold font-mono-numbers tracking-tight ${isStormCritical ? 'text-red-400 animate-pulse' : 'text-slate-100'}`}>
                  {formattedTime}
                </span>
                <span className="text-xs text-slate-400">
                  {isStormCritical ? 'Downpour imminent!' : 'Approaching'}
                </span>
              </div>
            </div>
            {/* Storm Progress Bar */}
            <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className={`h-full transition-all duration-300 ${isStormCritical ? 'bg-red-500' : 'bg-sky-400'}`}
                style={{ width: `${Math.min(100, engine.stormProgress * 100)}%` }}
              />
            </div>
          </div>

          {/* Drains Unblocked Indicator */}
          <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-xs border border-slate-700/60 rounded-xl px-3.5 py-1.5 shadow-lg flex items-center gap-2.5">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <span>Drains Cleared:</span>
              <span className="font-mono-numbers font-bold text-sky-400">{clearedDrainsCount}/4</span>
            </span>
            <div className="flex items-center gap-1">
              {engine.drains.map((drain, idx) => (
                <div
                  key={drain.id}
                  title={`${drain.name}: ${drain.isCleared ? 'Cleared' : 'Clogged'}`}
                  className={`w-3 h-3 rounded-full border transition-all ${
                    drain.isCleared
                      ? 'bg-emerald-400 border-emerald-300 shadow-sm shadow-emerald-500/50'
                      : 'bg-red-500/60 border-red-400 animate-ping'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Top-Center Toast / Alert Announcement */}
        {engine.currentToast && (
          <div className="pointer-events-auto max-w-md mx-auto transition-all animate-bounce-once">
            <div className="bg-slate-900/95 border border-slate-700 px-4 py-2 rounded-xl shadow-2xl text-center flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs sm:text-sm font-semibold text-slate-100 font-heading">
                {engine.currentToast.text}
              </span>
            </div>
          </div>
        )}

        {/* Top-Right: Score, Satchel Inventory & Quick Controls */}
        <div className="flex flex-col items-end gap-2">
          {/* Score & Sheru meter */}
          <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-xs border border-slate-700/60 rounded-xl px-3.5 py-2 shadow-xl flex items-center gap-3">
            {/* Score */}
            <div className="text-right">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Eco Score
              </div>
              <div className="text-lg font-bold font-mono-numbers text-emerald-400">
                {engine.player.score}
              </div>
            </div>

            <div className="w-px h-6 bg-slate-700" />

            {/* Dog Sheru Friendship */}
            <div className="flex items-center gap-1.5" title={`Sheru's Friendship: ${engine.dog.happiness}%`}>
              <div className="p-1.5 bg-amber-500/20 rounded-lg text-amber-400">
                <Heart className="w-4 h-4 fill-amber-400" />
              </div>
              <div className="text-right">
                <div className="text-[10px] font-semibold text-slate-400">Sheru 🐾</div>
                <div className="text-xs font-bold font-mono-numbers text-amber-300">
                  {engine.dog.happiness}%
                </div>
              </div>
            </div>
          </div>

          {/* Satchel Waste Inventory */}
          <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-xs border border-slate-700/60 rounded-xl px-3 py-1.5 shadow-lg flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs font-medium text-slate-300">
              Satchel: <span className="font-mono-numbers font-bold text-slate-100">{engine.player.inventory.length}/{engine.player.maxInventory}</span>
            </span>
            <div className="flex items-center gap-1">
              {engine.player.inventory.map((item, i) => (
                <span
                  key={item.id + i}
                  title={`${item.name} (${item.type})`}
                  className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{ backgroundColor: item.color }}
                >
                  •
                </span>
              ))}
              {Array.from({ length: engine.player.maxInventory - engine.player.inventory.length }).map((_, i) => (
                <span key={'empty-' + i} className="w-3.5 h-3.5 rounded-full border border-dashed border-slate-600" />
              ))}
            </div>
          </div>

          {/* Active Turbo Sprint Badge */}
          {engine.player.boostTimer > 0 && (
            <div className="pointer-events-auto bg-amber-500/20 border border-amber-500/60 rounded-xl px-3 py-1 shadow-lg flex items-center gap-1.5 text-amber-300 text-xs font-bold animate-pulse">
              <span>⚡ Masala Boost:</span>
              <span className="font-mono-numbers text-amber-200">{Math.ceil(engine.player.boostTimer)}s</span>
            </div>
          )}

          {/* Quick Action Icons */}
          <div className="pointer-events-auto flex items-center gap-1.5">
            <button
              onClick={() => setShowMinimap(!showMinimap)}
              title="Toggle Neighbourhood Radar"
              className={`p-2 rounded-lg border text-slate-300 transition-colors ${
                showMinimap ? 'bg-sky-500/20 border-sky-400 text-sky-300' : 'bg-slate-900/80 border-slate-700 hover:bg-slate-800'
              }`}
            >
              <MapIcon className="w-4 h-4" />
            </button>

            <button
              onClick={handleToggleMute}
              title={isMuted ? 'Unmute Audio (M)' : 'Mute Audio (M)'}
              className="p-2 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            <button
              onClick={onPause}
              title="Pause Game (Esc)"
              className="p-2 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
            >
              <Pause className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowHelp(!showHelp)}
              title="Controls & Objectives"
              className="p-2 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Middle Floaters: Help dialog if toggled */}
      {showHelp && (
        <div className="pointer-events-auto self-center bg-slate-900/95 border border-slate-700 p-4 rounded-2xl shadow-2xl max-w-md w-full my-auto text-xs text-slate-300 space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-heading text-sm font-bold text-slate-100">Controls & Neighbourhood Guide</span>
            <button onClick={() => setShowHelp(false)} className="text-slate-400 hover:text-slate-200">✕</button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-slate-800/60 p-2 rounded-lg">
              <span className="font-semibold text-sky-400 block mb-0.5">WASD / Arrow Keys</span>
              Move schoolboy Aarav
            </div>
            <div className="bg-slate-800/60 p-2 rounded-lg">
              <span className="font-semibold text-emerald-400 block mb-0.5">Space / Key E</span>
              Pick litter, Unclog drain, Pet Sheru
            </div>
            <div className="bg-slate-800/60 p-2 rounded-lg">
              <span className="font-semibold text-amber-400 block mb-0.5">Shift Key</span>
              Jog / Sprint speed
            </div>
            <div className="bg-slate-800/60 p-2 rounded-lg">
              <span className="font-semibold text-purple-400 block mb-0.5">Esc / P / M</span>
              Pause menu / Mute audio
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            <strong className="text-slate-200">Mission:</strong> Hold [Space] near clogged drain grates to unblock them before monsoon floods the lane. Collect littered plastics, papers, cans and deposit them into the 4 Color Bins for bonus score!
          </p>
        </div>
      )}

      {/* Bottom Row: Mini-map & Virtual Touch Controls */}
      <div className="flex items-end justify-between w-full">
        {/* Bottom-Left: Live Mini-Map */}
        {showMinimap && (
          <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-xs border border-slate-700/70 p-2 rounded-xl shadow-2xl">
            <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 mb-1 px-1">
              <span className="flex items-center gap-1">
                <Compass className="w-3 h-3 text-sky-400" /> Radar
              </span>
              <span className="text-[9px] text-slate-500">Aarav 🔵 Sheru 🟡 Drains 🔴</span>
            </div>
            <div className="relative w-36 h-28 bg-slate-950/90 border border-slate-800 rounded-lg overflow-hidden">
              {/* Stream bottom strip */}
              <div className="absolute bottom-0 left-0 right-0 h-4 bg-sky-900/50" />
              {/* Road strip */}
              <div className="absolute top-[32%] left-0 right-0 h-3 bg-slate-800/60" />

              {/* Bins cluster */}
              <div
                className="absolute w-2 h-2 rounded-xs bg-emerald-500"
                style={{
                  left: `${(780 / WORLD_WIDTH) * 100}%`,
                  top: `${(530 / WORLD_HEIGHT) * 100}%`,
                }}
                title="Sorting Bins"
              />

              {/* Drains */}
              {engine.drains.map(d => (
                <div
                  key={'mini-' + d.id}
                  className={`absolute w-2 h-2 rounded-full ${d.isCleared ? 'bg-sky-400' : 'bg-red-500 animate-ping'}`}
                  style={{
                    left: `${((d.x + d.width / 2) / WORLD_WIDTH) * 100}%`,
                    top: `${((d.y + d.height / 2) / WORLD_HEIGHT) * 100}%`,
                  }}
                />
              ))}

              {/* NPCs moving dots */}
              {engine.npcs.map(npc => (
                <div
                  key={'mini-' + npc.id}
                  className="absolute w-1.5 h-1.5 rounded-full bg-orange-400"
                  style={{
                    left: `${(npc.x / WORLD_WIDTH) * 100}%`,
                    top: `${(npc.y / WORLD_HEIGHT) * 100}%`,
                  }}
                />
              ))}

              {/* Dog Sheru */}
              <div
                className="absolute w-2.5 h-2.5 rounded-full bg-amber-400 shadow-xs shadow-amber-300 ring-1 ring-amber-200"
                style={{
                  left: `${(engine.dog.x / WORLD_WIDTH) * 100}%`,
                  top: `${(engine.dog.y / WORLD_HEIGHT) * 100}%`,
                }}
                title="Sheru 🐕"
              />

              {/* Player Aarav */}
              <div
                className="absolute w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-white"
                style={{
                  left: `${(engine.player.x / WORLD_WIDTH) * 100}%`,
                  top: `${(engine.player.y / WORLD_HEIGHT) * 100}%`,
                }}
                title="Aarav"
              />
            </div>
          </div>
        )}

        {/* Bottom-Center Quests Minimal Tracker */}
        <div className="pointer-events-auto hidden md:flex items-center gap-3 bg-slate-900/80 border border-slate-700/60 px-3.5 py-1.5 rounded-xl shadow-lg">
          {engine.quests.map(quest => (
            <div key={quest.id} className="flex items-center gap-1.5 text-xs text-slate-300">
              <span>{quest.icon}</span>
              <span className={quest.completed ? 'text-emerald-400 line-through' : 'text-slate-200'}>
                {quest.title}
              </span>
              <span className="font-mono-numbers font-bold text-slate-400">
                ({quest.current}/{quest.target})
              </span>
              {quest.completed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
            </div>
          ))}
        </div>

        {/* Bottom-Right: Touch / Mouse Virtual Action Controls (Always available for touch or click) */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Virtual D-pad (compact) */}
          <div className="grid grid-cols-3 gap-1 bg-slate-900/85 p-1.5 rounded-xl border border-slate-800 shadow-xl">
            <div />
            <button
              onMouseDown={() => (engine.virtualInput.y = -1)}
              onMouseUp={() => (engine.virtualInput.y = 0)}
              onTouchStart={() => (engine.virtualInput.y = -1)}
              onTouchEnd={() => (engine.virtualInput.y = 0)}
              className="w-9 h-9 flex items-center justify-center bg-slate-800 hover:bg-slate-700 active:bg-sky-600 rounded-lg text-slate-200 font-bold select-none text-xs"
            >
              ▲
            </button>
            <div />
            <button
              onMouseDown={() => (engine.virtualInput.x = -1)}
              onMouseUp={() => (engine.virtualInput.x = 0)}
              onTouchStart={() => (engine.virtualInput.x = -1)}
              onTouchEnd={() => (engine.virtualInput.x = 0)}
              className="w-9 h-9 flex items-center justify-center bg-slate-800 hover:bg-slate-700 active:bg-sky-600 rounded-lg text-slate-200 font-bold select-none text-xs"
            >
              ◀
            </button>
            <button
              onMouseDown={() => (engine.virtualInput.y = 1)}
              onMouseUp={() => (engine.virtualInput.y = 0)}
              onTouchStart={() => (engine.virtualInput.y = 1)}
              onTouchEnd={() => (engine.virtualInput.y = 0)}
              className="w-9 h-9 flex items-center justify-center bg-slate-800 hover:bg-slate-700 active:bg-sky-600 rounded-lg text-slate-200 font-bold select-none text-xs"
            >
              ▼
            </button>
            <button
              onMouseDown={() => (engine.virtualInput.x = 1)}
              onMouseUp={() => (engine.virtualInput.x = 0)}
              onTouchStart={() => (engine.virtualInput.x = 1)}
              onTouchEnd={() => (engine.virtualInput.x = 0)}
              className="w-9 h-9 flex items-center justify-center bg-slate-800 hover:bg-slate-700 active:bg-sky-600 rounded-lg text-slate-200 font-bold select-none text-xs"
            >
              ▶
            </button>
          </div>

          {/* Action Button & Sprint */}
          <div className="flex flex-col gap-1.5">
            <button
              onMouseDown={() => (engine.virtualInput.action = true)}
              onMouseUp={() => (engine.virtualInput.action = false)}
              onTouchStart={() => (engine.virtualInput.action = true)}
              onTouchEnd={() => (engine.virtualInput.action = false)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-xl shadow-lg border border-emerald-400 text-xs flex items-center justify-center gap-1 select-none"
            >
              <span>CLEAN / E</span>
            </button>

            <button
              onMouseDown={() => (engine.virtualInput.sprint = true)}
              onMouseUp={() => (engine.virtualInput.sprint = false)}
              onTouchStart={() => (engine.virtualInput.sprint = true)}
              onTouchEnd={() => (engine.virtualInput.sprint = false)}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-amber-600 text-amber-300 font-semibold rounded-lg border border-slate-700 text-[11px] text-center select-none"
            >
              RUN / SHIFT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
