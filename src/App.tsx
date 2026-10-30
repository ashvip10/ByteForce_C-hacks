/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useReducer, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/engine';
import { GameCanvas } from './components/GameCanvas';
import { GameHUD } from './components/GameHUD';
import { TitleScreen } from './components/TitleScreen';
import { PauseModal } from './components/PauseModal';
import { VictoryModal } from './components/VictoryModal';
import { GameOverModal } from './components/GameOverModal';
import { DrainUnclogModal } from './components/activities/DrainUnclogModal';
import { ChaiBrewModal } from './components/activities/ChaiBrewModal';
import { SheruFetchModal } from './components/activities/SheruFetchModal';
import { PaperBoatModal } from './components/activities/PaperBoatModal';
import { GameStatus } from './types/game';

export default function App() {
  const engineRef = useRef<GameEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = new GameEngine();
  }
  const engine = engineRef.current;

  const [status, setStatus] = useState<GameStatus>(engine.gameStatus);
  // Reducer tick to trigger lightweight HUD re-renders at throttled rate without re-rendering canvas loop
  const [, forceHUDUpdate] = useReducer((x: number) => (x + 1) % 1000, 0);

  const handleStartGame = useCallback(() => {
    engine.resetGame();
    setStatus('playing');
  }, [engine]);

  const handlePause = useCallback(() => {
    engine.gameStatus = 'paused';
    setStatus('paused');
  }, [engine]);

  const handleResume = useCallback(() => {
    engine.gameStatus = 'playing';
    setStatus('playing');
  }, [engine]);

  const handleRestart = useCallback(() => {
    engine.resetGame();
    setStatus('playing');
  }, [engine]);

  const handleStatusChange = useCallback((newStatus: string) => {
    setStatus(newStatus as GameStatus);
  }, []);

  const activeDrain = engine.drains.find(d => d.id === engine.player.activityTargetId);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none font-sans">
      {/* 60fps Isolated Simulation Canvas */}
      <GameCanvas
        engine={engine}
        onStatusChange={handleStatusChange}
        onHUDUpdate={forceHUDUpdate}
      />

      {/* World-Matched Low-Occlusion HUD Overlay when playing or paused */}
      {(status === 'playing' || status === 'paused') && (
        <GameHUD engine={engine} onPause={handlePause} />
      )}

      {/* Interactive Activity Modals */}
      {status === 'playing' && engine.player.activeActivity === 'drain_unclog' && activeDrain && (
        <DrainUnclogModal
          drain={activeDrain}
          onComplete={() => {
            engine.completeDrainActivity(activeDrain.id);
            forceHUDUpdate();
          }}
          onClose={() => {
            engine.closeCurrentActivity();
            forceHUDUpdate();
          }}
        />
      )}

      {status === 'playing' && engine.player.activeActivity === 'chai_brew' && (
        <ChaiBrewModal
          onComplete={() => {
            engine.completeChaiActivity();
            forceHUDUpdate();
          }}
          onClose={() => {
            engine.closeCurrentActivity();
            forceHUDUpdate();
          }}
        />
      )}

      {status === 'playing' && engine.player.activeActivity === 'sheru_fetch' && (
        <SheruFetchModal
          onComplete={(scoreGain) => {
            engine.completeSheruActivity(scoreGain);
            forceHUDUpdate();
          }}
          onClose={() => {
            engine.closeCurrentActivity();
            forceHUDUpdate();
          }}
        />
      )}

      {status === 'playing' && engine.player.activeActivity === 'boat_sail' && (
        <PaperBoatModal
          onComplete={(scoreGain) => {
            engine.completeBoatActivity(scoreGain);
            forceHUDUpdate();
          }}
          onClose={() => {
            engine.closeCurrentActivity();
            forceHUDUpdate();
          }}
        />
      )}

      {/* Full-viewport Title Screen */}
      {status === 'title' && <TitleScreen onStart={handleStartGame} />}

      {/* Pause Menu Modal */}
      {status === 'paused' && (
        <PauseModal onResume={handleResume} onRestart={handleRestart} />
      )}

      {/* Victory Modal */}
      {status === 'victory' && (
        <VictoryModal engine={engine} onRestart={handleRestart} />
      )}

      {/* Game Over Modal */}
      {status === 'gameover' && (
        <GameOverModal engine={engine} onRestart={handleRestart} />
      )}
    </div>
  );
}
