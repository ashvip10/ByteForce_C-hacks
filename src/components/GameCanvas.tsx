import React, { useEffect, useRef } from 'react';
import { soundManager } from '../audio/soundManager';
import { GameEngine } from '../game/engine';
import { GameRenderer } from '../game/renderer';

interface GameCanvasProps {
  engine: GameEngine;
  onStatusChange?: (status: string) => void;
  onHUDUpdate?: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ engine, onStatusChange, onHUDUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<GameRenderer | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const hudThrottleRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    rendererRef.current = new GameRenderer(ctx);

    // Handle container resize & high-DPI
    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.floor(rect.width);
      const h = Math.floor(rect.height);

      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      ctx.scale(dpr, dpr);
      engine.setViewport(w, h);
      rendererRef.current?.setDimensions(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    handleResize();

    // Keyboard Listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent scrolling
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.code)) {
        e.preventDefault();
      }

      if (e.code === 'KeyM') {
        soundManager.toggleMute();
        onHUDUpdate?.();
        return;
      }

      if (e.code === 'Escape' || e.code === 'KeyP') {
        if (engine.gameStatus === 'playing') {
          engine.gameStatus = 'paused';
          onStatusChange?.('paused');
        } else if (engine.gameStatus === 'paused') {
          engine.gameStatus = 'playing';
          onStatusChange?.('playing');
        }
        return;
      }

      engine.keys[e.code] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      engine.keys[e.code] = false;
    };

    const handleBlur = () => {
      engine.keys = {};
      engine.virtualInput = { x: 0, y: 0, sprint: false, action: false };
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    // 60fps Simulation Game Loop
    const loop = (currentTime: number) => {
      const rawDt = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;
      const dt = Math.min(rawDt, 0.05); // Clamp dt to prevent simulation spiral

      // Engine update
      const prevStatus = engine.gameStatus;
      engine.update(dt);

      if (engine.gameStatus !== prevStatus) {
        onStatusChange?.(engine.gameStatus);
      }

      // Render
      if (rendererRef.current) {
        rendererRef.current.render(
          engine.player,
          engine.dog,
          engine.npcs,
          engine.wasteItems,
          engine.bins,
          engine.drains,
          engine.particles,
          engine.rainDrops,
          engine.stormProgress,
          engine.lightningTimer,
          engine.camera,
          engine.gameTime
        );
      }

      // Throttle HUD state update to ~15fps so React doesn't bottleneck canvas
      hudThrottleRef.current += 1;
      if (hudThrottleRef.current % 4 === 0) {
        onHUDUpdate?.();
      }

      rafIdRef.current = requestAnimationFrame(loop);
    };

    rafIdRef.current = requestAnimationFrame(loop);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [engine, onStatusChange, onHUDUpdate]);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-slate-950">
      <canvas ref={canvasRef} className="game-canvas block absolute inset-0 w-full h-full" />
    </div>
  );
};
