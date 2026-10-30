import { DogCompanion, DrainGrate, NPC, Particle, Player, RainDrop, WasteBin, WasteItem } from '../types/game';
import { WORLD_HEIGHT, WORLD_WIDTH } from './constants';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number = 800;
  private height: number = 600;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public setDimensions(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  public render(
    player: Player,
    dog: DogCompanion,
    npcs: NPC[],
    items: WasteItem[],
    bins: WasteBin[],
    drains: DrainGrate[],
    particles: Particle[],
    rainDrops: RainDrop[],
    stormProgress: number,
    lightningTimer: number,
    camera: { x: number; y: number },
    gameTime: number
  ) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    ctx.save();
    // Translate canvas for camera viewport
    ctx.translate(-camera.x, -camera.y);

    // 1. Draw World Map Background (Roads, Sidewalks, Ground, Stream)
    this.drawWorldBackground(ctx, gameTime, drains);

    // 2. Draw Buildings & Architecture Facades
    this.drawBuildings(ctx);

    // 3. Draw Waste Sorting Bins
    this.drawBins(ctx, bins);

    // 4. Draw Storm Drains
    this.drawDrains(ctx, drains, gameTime);

    // 5. Draw Waste Items to pick up
    this.drawWasteItems(ctx, items, gameTime);

    // 6. Draw NPCs (Animated & Moving!)
    this.drawNPCs(ctx, npcs, gameTime);

    // 7. Draw Dog Companion ("Sheru") - Always clearly visible!
    this.drawDog(ctx, dog, gameTime);

    // 8. Draw Player ("Aarav")
    this.drawPlayer(ctx, player, gameTime);

    // 9. Draw Stream Water Surface & Paper Boat / Fish
    this.drawStreamLife(ctx, gameTime);

    // 10. Draw Particles (water splashes, leaf gusts, hearts, sparkles)
    this.drawParticles(ctx, particles);

    // 11. Draw Interaction Prompts over active objects near player
    this.drawInteractionPrompts(ctx, player, dog, npcs, items, bins, drains);

    ctx.restore();

    // 12. Weather & Storm Overlay (Darkening sky, lightning, rain)
    this.drawWeatherEffects(ctx, stormProgress, lightningTimer, rainDrops);
  }

  private drawWorldBackground(ctx: CanvasRenderingContext2D, gameTime: number, drains: DrainGrate[]) {
    // Ground Base: warm pavement/stone
    ctx.fillStyle = '#1e2430';
    ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    // Top Area: School & Bazaar Paved Plaza
    ctx.fillStyle = '#262f40';
    ctx.fillRect(0, 0, WORLD_WIDTH, 420);

    // Main Street (y: 380 - 540)
    ctx.fillStyle = '#181e29';
    ctx.fillRect(0, 380, WORLD_WIDTH, 160);

    // Street markings (dashed center lines)
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 4;
    ctx.setLineDash([24, 20]);
    ctx.beginPath();
    ctx.moveTo(0, 460);
    ctx.lineTo(WORLD_WIDTH, 460);
    ctx.stroke();
    ctx.setLineDash([]);

    // Zebra Crossings
    this.drawZebraCrossing(ctx, 480, 380, 80, 160);
    this.drawZebraCrossing(ctx, 1020, 380, 80, 160);

    // Sidewalk Curbs
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 372, WORLD_WIDTH, 8);
    ctx.fillRect(0, 540, WORLD_WIDTH, 8);

    // Gully Lane & Residential Plaza (y: 548 - 760)
    ctx.fillStyle = '#222b3b';
    ctx.fillRect(0, 548, WORLD_WIDTH, 220);

    // Sorting Station Floor Pattern (Checker/Stone slab under bins)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(660, 510, 300, 90);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.strokeRect(660, 510, 300, 90);

    // Park Greenery (y: 768 - 1000)
    const parkGrad = ctx.createLinearGradient(0, 768, 0, 1000);
    parkGrad.addColorStop(0, '#143823');
    parkGrad.addColorStop(1, '#0f291a');
    ctx.fillStyle = parkGrad;
    ctx.fillRect(0, 768, WORLD_WIDTH, 240);

    // Park Paver Path
    ctx.fillStyle = '#3a342a';
    ctx.beginPath();
    ctx.moveTo(0, 840);
    ctx.bezierCurveTo(400, 830, 800, 860, WORLD_WIDTH, 840);
    ctx.lineWidth = 42;
    ctx.strokeStyle = '#4a4235';
    ctx.stroke();

    // Stream Bed & Water (y: 1000 - 1200)
    const allDrainsCleared = drains.every(d => d.isCleared);
    const streamGrad = ctx.createLinearGradient(0, 1000, 0, 1200);
    if (allDrainsCleared) {
      streamGrad.addColorStop(0, '#0284c7');
      streamGrad.addColorStop(1, '#0369a1');
    } else {
      streamGrad.addColorStop(0, '#155e75');
      streamGrad.addColorStop(1, '#0e3a47');
    }
    ctx.fillStyle = streamGrad;
    ctx.fillRect(0, 1008, WORLD_WIDTH, 192);

    // Stream Banks with grass edge
    ctx.fillStyle = '#064e3b';
    ctx.fillRect(0, 1000, WORLD_WIDTH, 8);

    // Stepping stones across stream (x: 720 to 800, y: 1020 to 1180)
    const stoneY = [1030, 1070, 1110, 1150];
    stoneY.forEach((sy, idx) => {
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.ellipse(750 + (idx % 2 === 0 ? -15 : 15), sy, 22, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.ellipse(748 + (idx % 2 === 0 ? -15 : 15), sy - 2, 18, 10, 0, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  private drawZebraCrossing(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
    ctx.fillStyle = '#94a3b8';
    const stripeCount = 6;
    const stripeH = h / (stripeCount * 2);
    for (let i = 0; i < stripeCount; i++) {
      ctx.fillRect(x, y + i * stripeH * 2, w, stripeH);
    }
  }

  private drawBuildings(ctx: CanvasRenderingContext2D) {
    // 1. Chai Stall (Ramesh Cutting Chai)
    ctx.fillStyle = '#b45309';
    ctx.fillRect(80, 80, 280, 150);
    // Stall Canopy (Orange & Yellow striped awning)
    this.drawAwning(ctx, 70, 210, 300, 36, '#ea580c', '#fef08a');
    // Stall Sign
    ctx.fillStyle = '#78350f';
    ctx.fillRect(90, 95, 260, 32);
    ctx.fillStyle = '#fef3c7';
    ctx.font = 'bold 14px "Fredoka", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('☕ RAMESH CUTTING CHAI & SNACKS', 220, 116);
    // Counter bench & kettle
    ctx.fillStyle = '#92400e';
    ctx.fillRect(110, 180, 220, 30);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(180, 160, 24, 20); // Brass/steel kettle

    // 2. School Gate & Wall
    ctx.fillStyle = '#475569';
    ctx.fillRect(440, 70, 500, 60);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(620, 60, 140, 70); // Gate Arch
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 3;
    ctx.strokeRect(624, 64, 132, 66);
    // School Banner
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(470, 82, 440, 28);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 13px "Fredoka", sans-serif';
    ctx.fillText('🏫 VIDYA MANDIR HIGH SCHOOL · ECO CLUB', 690, 101);

    // 3. Ancient Banyan Tree
    ctx.fillStyle = '#3f2b18';
    ctx.beginPath();
    ctx.arc(740, 240, 30, 0, Math.PI * 2);
    ctx.fill();
    // Huge Canopy
    const treeGrad = ctx.createRadialGradient(740, 220, 10, 740, 220, 110);
    treeGrad.addColorStop(0, '#166534');
    treeGrad.addColorStop(0.7, '#14532d');
    treeGrad.addColorStop(1, '#052e16');
    ctx.fillStyle = treeGrad;
    ctx.beginPath();
    ctx.arc(740, 220, 95, 0, Math.PI * 2);
    ctx.fill();
    // Hanging aerial roots
    ctx.strokeStyle = '#713f12';
    ctx.lineWidth = 2.5;
    [-40, -15, 20, 45].forEach(ox => {
      ctx.beginPath();
      ctx.moveTo(740 + ox, 220);
      ctx.bezierCurveTo(740 + ox + 5, 260, 740 + ox - 5, 290, 740 + ox + 2, 310);
      ctx.stroke();
    });

    // 4. Kirana Store & Florist (Kamala)
    ctx.fillStyle = '#065f46';
    ctx.fillRect(1040, 80, 340, 150);
    this.drawAwning(ctx, 1030, 210, 360, 36, '#047857', '#a7f3d0');
    ctx.fillStyle = '#064e3b';
    ctx.fillRect(1060, 95, 300, 32);
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 14px "Fredoka", sans-serif';
    ctx.fillText('🌸 KAMALA GENERAL STORE & FRESH FLOWERS', 1210, 116);
    // Flower garlands hanging
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#f97316' : '#facc15';
      ctx.beginPath();
      ctx.arc(1060 + i * 50, 210, 8, 0, Math.PI * 2);
      ctx.fill();
    }

    // 5. Residential Row Houses
    ctx.fillStyle = '#334155';
    ctx.fillRect(60, 590, 320, 130);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(75, 605, 290, 24);
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 12px "Fredoka", sans-serif';
    ctx.fillText('🏡 SHANTI NIVAS RESIDENTS', 220, 621);
    // Windows with warm light
    for (let w = 0; w < 4; w++) {
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(90 + w * 70, 645, 36, 42);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.strokeRect(90 + w * 70, 645, 36, 42);
    }
  }

  private drawAwning(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, col1: string, col2: string) {
    const stripes = 12;
    const stripeW = w / stripes;
    for (let i = 0; i < stripes; i++) {
      ctx.fillStyle = i % 2 === 0 ? col1 : col2;
      ctx.fillRect(x + i * stripeW, y, stripeW, h);
    }
    // Awning scallop bottom edge
    for (let i = 0; i < stripes; i++) {
      ctx.fillStyle = i % 2 === 0 ? col1 : col2;
      ctx.beginPath();
      ctx.arc(x + i * stripeW + stripeW / 2, y + h, stripeW / 2, 0, Math.PI);
      ctx.fill();
    }
  }

  private drawBins(ctx: CanvasRenderingContext2D, bins: WasteBin[]) {
    // Sorting Station Overhead Board
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(660, 480, 300, 34);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('♻️ NEIGHBOURHOOD SEGREGATION HUB', 810, 502);

    bins.forEach(bin => {
      // Bin shadow
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.ellipse(bin.x + bin.width / 2, bin.y + bin.height - 2, bin.width / 2, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Bin Body
      ctx.fillStyle = bin.color;
      ctx.beginPath();
      ctx.roundRect(bin.x, bin.y, bin.width, bin.height, [6, 6, 3, 3]);
      ctx.fill();
      ctx.strokeStyle = bin.borderColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Bin Lid flap
      ctx.fillStyle = bin.borderColor;
      ctx.fillRect(bin.x - 3, bin.y - 4, bin.width + 6, 8);

      // Waste Type Symbol
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      let icon = '🌱';
      if (bin.type === 'paper') icon = '📄';
      if (bin.type === 'plastic') icon = '🥤';
      if (bin.type === 'metal') icon = '🥫';
      ctx.fillText(icon, bin.x + bin.width / 2, bin.y + 26);

      // Deposited count tag
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(bin.x + bin.width / 2, bin.y + 40, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(`${bin.depositedCount}`, bin.x + bin.width / 2, bin.y + 43);
    });
  }

  private drawDrains(ctx: CanvasRenderingContext2D, drains: DrainGrate[], gameTime: number) {
    drains.forEach(drain => {
      const cx = drain.x + drain.width / 2;
      const cy = drain.y + drain.height / 2;

      // Draw Puddle around drain
      if (!drain.isCleared) {
        // Clogged murky puddle expanding
        const pulse = Math.sin(gameTime * 0.05) * 4;
        const rad = drain.puddleRadius + pulse;
        const puddleGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, rad);
        puddleGrad.addColorStop(0, 'rgba(44, 30, 20, 0.85)');
        puddleGrad.addColorStop(0.7, 'rgba(30, 41, 59, 0.6)');
        puddleGrad.addColorStop(1, 'rgba(30, 41, 59, 0)');
        ctx.fillStyle = puddleGrad;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rad * 1.3, rad * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Clear flowing water circle
        const ripple = (gameTime * 0.04) % 1;
        ctx.strokeStyle = `rgba(56, 189, 248, ${1 - ripple})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 32 + ripple * 20, 18 + ripple * 12, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Grate Box
      ctx.fillStyle = drain.isCleared ? '#0369a1' : '#1c1917';
      ctx.fillRect(drain.x, drain.y, drain.width, drain.height);
      ctx.strokeStyle = drain.isCleared ? '#38bdf8' : '#78716c';
      ctx.lineWidth = 3;
      ctx.strokeRect(drain.x, drain.y, drain.width, drain.height);

      // Grate Bars
      ctx.strokeStyle = drain.isCleared ? '#e0f2fe' : '#a8a29e';
      ctx.lineWidth = 2;
      const barCount = 5;
      const step = drain.width / (barCount + 1);
      for (let b = 1; b <= barCount; b++) {
        ctx.beginPath();
        ctx.moveTo(drain.x + b * step, drain.y + 3);
        ctx.lineTo(drain.x + b * step, drain.y + drain.height - 3);
        ctx.stroke();
      }

      // If clogged: show muck, debris & glowing warning indicator!
      if (!drain.isCleared) {
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.arc(cx - 10, cy, 10, 0, Math.PI * 2);
        ctx.arc(cx + 8, cy - 4, 12, 0, Math.PI * 2);
        ctx.fill();

        // Pulsing warning badge
        const alertBounce = Math.sin(gameTime * 0.1) * 3;
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(cx, drain.y - 18 + alertBounce, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('!', cx, drain.y - 14 + alertBounce);
      } else {
        // Cleared checkmark badge
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(cx, drain.y - 16, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('✓', cx, drain.y - 13);
      }
    });
  }

  private drawWasteItems(ctx: CanvasRenderingContext2D, items: WasteItem[], gameTime: number) {
    items.forEach(item => {
      if (item.isPickedUp) return;

      const bounce = Math.sin(gameTime * 0.08 + item.x) * 2;
      const x = item.x;
      const y = item.y + bounce;

      // Glow / subtle shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(x + item.width / 2, item.y + item.height + 2, item.width / 2, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Draw item based on type
      ctx.save();
      ctx.translate(x + item.width / 2, y + item.height / 2);

      if (item.type === 'plastic') {
        // Plastic Bottle / Wrapper
        ctx.fillStyle = item.color;
        ctx.fillRect(-6, -10, 12, 18);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-4, -13, 8, 4); // cap
      } else if (item.type === 'organic') {
        // Banana peel or leaf
        ctx.fillStyle = item.color;
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 1.5);
        ctx.fill();
      } else if (item.type === 'paper') {
        // Paper sheet or cardboard box
        ctx.fillStyle = item.color;
        ctx.fillRect(-8, -8, 16, 16);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        ctx.strokeRect(-8, -8, 16, 16);
      } else if (item.type === 'metal') {
        // Metal soda can
        ctx.fillStyle = item.color;
        ctx.beginPath();
        ctx.roundRect(-6, -9, 12, 18, [3, 3, 3, 3]);
        ctx.fill();
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(-5, -9, 10, 3);
      }

      ctx.restore();
    });
  }

  private drawNPCs(ctx: CanvasRenderingContext2D, npcs: NPC[], gameTime: number) {
    npcs.forEach(npc => {
      ctx.save();
      ctx.translate(npc.x, npc.y);

      // Walk cycle leg swinging
      const isMoving = !npc.isWaiting;
      const legCycle = isMoving ? Math.sin(gameTime * 0.18 + npc.x) * 7 : 0;
      const bodyBob = isMoving ? Math.abs(Math.sin(gameTime * 0.18 + npc.x)) * 3 : 0;

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.ellipse(0, 8, 12, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Cyclist has bicycle underneath
      if (npc.specialProp === 'bicycle') {
        this.drawBicycle(ctx, npc.direction, gameTime);
      } else {
        // Legs & Shoes
        ctx.fillStyle = npc.pantsColor;
        ctx.fillRect(-6, -6 + legCycle, 4, 14);
        ctx.fillRect(2, -6 - legCycle, 4, 14);

        ctx.fillStyle = '#0f172a'; // shoes
        ctx.fillRect(-7, 7 + legCycle, 6, 4);
        ctx.fillRect(1, 7 - legCycle, 6, 4);
      }

      // Torso & Shirt
      ctx.fillStyle = npc.shirtColor;
      ctx.beginPath();
      ctx.roundRect(-10, -26 - bodyBob, 20, 22, [5, 5, 2, 2]);
      ctx.fill();

      // Head & Face
      ctx.fillStyle = '#fbb67e'; // warm skin tone
      ctx.beginPath();
      ctx.arc(0, -36 - bodyBob, 9, 0, Math.PI * 2);
      ctx.fill();

      // Hair
      ctx.fillStyle = npc.hairColor;
      ctx.beginPath();
      ctx.arc(0, -39 - bodyBob, 9, Math.PI, Math.PI * 2);
      ctx.fill();

      // Eyes direction
      ctx.fillStyle = '#0f172a';
      const eyeOffset = npc.direction === 'left' ? -3 : npc.direction === 'right' ? 3 : 0;
      ctx.beginPath();
      ctx.arc(eyeOffset - 2, -36 - bodyBob, 1.5, 0, Math.PI * 2);
      ctx.arc(eyeOffset + 2, -36 - bodyBob, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Special Handheld Props
      if (npc.specialProp === 'chai_pot') {
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(npc.direction === 'left' ? -16 : 8, -22 - bodyBob, 8, 10);
      } else if (npc.specialProp === 'walking_stick') {
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(npc.direction === 'left' ? -12 : 12, -26 - bodyBob);
        ctx.lineTo(npc.direction === 'left' ? -12 : 12, 6);
        ctx.stroke();
      }

      // Name & Role Label (Subtle, clean)
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '600 11px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(npc.name, 0, -52 - bodyBob);

      // Active Speech Bubble
      if (npc.activeDialogue) {
        this.drawSpeechBubble(ctx, 0, -62 - bodyBob, npc.activeDialogue);
      }

      ctx.restore();
    });
  }

  private drawBicycle(ctx: CanvasRenderingContext2D, dir: string, gameTime: number) {
    const wheelSpin = (gameTime * 0.2) % (Math.PI * 2);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2.5;

    // Wheels
    [-18, 18].forEach(wx => {
      ctx.beginPath();
      ctx.arc(wx, 2, 10, 0, Math.PI * 2);
      ctx.stroke();
      // Spokes
      ctx.beginPath();
      ctx.moveTo(wx + Math.cos(wheelSpin) * 8, 2 + Math.sin(wheelSpin) * 8);
      ctx.lineTo(wx - Math.cos(wheelSpin) * 8, 2 - Math.sin(wheelSpin) * 8);
      ctx.stroke();
    });

    // Frame
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-18, 2);
    ctx.lineTo(0, -6);
    ctx.lineTo(18, 2);
    ctx.moveTo(0, -6);
    ctx.lineTo(-4, -14);
    ctx.stroke();

    // Bell ring animation text
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('🔔 Tring!', 0, -28);
  }

  private drawDog(ctx: CanvasRenderingContext2D, dog: DogCompanion, gameTime: number) {
    ctx.save();
    ctx.translate(dog.x, dog.y);

    const isRunning = Math.abs(dog.vx) > 0.2 || Math.abs(dog.vy) > 0.2;
    const runCycle = isRunning ? Math.sin(gameTime * 0.25) * 8 : 0;
    const wagAngle = Math.sin(gameTime * 0.35 + dog.happiness) * 0.5;
    const flip = dog.direction === 'left' ? -1 : 1;

    ctx.scale(flip, 1);

    // Ground Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 10, 16, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // 4 Animated Legs (Golden brown with white paws)
    ctx.fillStyle = '#b45309';
    // Back legs
    ctx.fillRect(-12, 0 + runCycle, 4, 11);
    ctx.fillRect(8, 0 - runCycle, 4, 11);
    // Front legs
    ctx.fillRect(-8, 0 - runCycle, 4, 11);
    ctx.fillRect(12, 0 + runCycle, 4, 11);

    // White paws
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(-13, 9 + runCycle, 5, 3);
    ctx.fillRect(7, 9 - runCycle, 5, 3);
    ctx.fillRect(-9, 9 - runCycle, 5, 3);
    ctx.fillRect(11, 9 + runCycle, 5, 3);

    // Dog Torso (Golden indie dog fur)
    const dogGrad = ctx.createLinearGradient(-16, -16, 16, 8);
    dogGrad.addColorStop(0, '#f59e0b');
    dogGrad.addColorStop(1, '#d97706');
    ctx.fillStyle = dogGrad;
    ctx.beginPath();
    ctx.roundRect(-16, -10, 28, 16, [8, 8, 8, 8]);
    ctx.fill();

    // Chest White Patch
    ctx.fillStyle = '#fef3c7';
    ctx.beginPath();
    ctx.ellipse(6, -2, 6, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Animated Wagging Tail
    ctx.save();
    ctx.translate(-16, -4);
    ctx.rotate(wagAngle - 0.4);
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.roundRect(-12, -3, 14, 5, [4, 4, 4, 4]);
    ctx.fill();
    ctx.fillStyle = '#fef3c7'; // white tail tip
    ctx.beginPath();
    ctx.arc(-11, -0.5, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Red Collar with golden bell
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(8, -13, 5, 12);
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(10, -2, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Dog Head
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.roundRect(8, -18, 16, 14, [6, 6, 5, 5]);
    ctx.fill();

    // Snout
    ctx.fillStyle = '#fef3c7';
    ctx.beginPath();
    ctx.roundRect(16, -12, 10, 8, [3, 3, 3, 3]);
    ctx.fill();

    // Black Nose
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(24, -10, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Floppy Ear
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.ellipse(10, -18 + (isRunning ? Math.sin(gameTime * 0.3) * 2 : 0), 4, 7, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Eye
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(15, -13, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(15.5, -13.5, 0.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore(); // restore flip scale

    // Dog Nametag & Happiness Hearts above head
    ctx.save();
    ctx.translate(dog.x, dog.y);
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 11px "Fredoka", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Sheru 🐾', 0, -32);

    // Speech / Bark Bubble
    if (dog.activeBarkText) {
      this.drawSpeechBubble(ctx, 0, -42, dog.activeBarkText, '#fef3c7', '#78350f');
    }

    ctx.restore();
  }

  private drawPlayer(ctx: CanvasRenderingContext2D, player: Player, gameTime: number) {
    ctx.save();
    ctx.translate(player.x, player.y);

    const isMoving = player.isMoving;
    const legCycle = isMoving ? Math.sin(gameTime * 0.22) * 8 : 0;
    const bodyBob = isMoving ? Math.abs(Math.sin(gameTime * 0.22)) * 3 : 0;

    // Ground Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 10, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs & White Socks & Sneakers
    ctx.fillStyle = '#d97706'; // khaki shorts
    ctx.fillRect(-7, -4, 5, 8);
    ctx.fillRect(2, -4, 5, 8);

    // Bare legs & socks
    ctx.fillStyle = '#fbb67e';
    ctx.fillRect(-6, 4 + legCycle, 4, 6);
    ctx.fillRect(2, 4 - legCycle, 4, 6);
    ctx.fillStyle = '#f8fafc'; // white sports socks
    ctx.fillRect(-6, 7 + legCycle, 4, 4);
    ctx.fillRect(2, 7 - legCycle, 4, 4);
    ctx.fillStyle = '#0284c7'; // blue sneakers
    ctx.fillRect(-8, 9 + legCycle, 6, 4);
    ctx.fillRect(2, 9 - legCycle, 6, 4);

    // Torso (School Blue Polo Shirt)
    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.roundRect(-10, -26 - bodyBob, 20, 22, [5, 5, 2, 2]);
    ctx.fill();
    // Collar
    ctx.fillStyle = '#1d4ed8';
    ctx.fillRect(-6, -26 - bodyBob, 12, 4);

    // Eco Satchel Bag across shoulder
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-10, -22 - bodyBob);
    ctx.lineTo(10, -8 - bodyBob);
    ctx.stroke();
    // Satchel pouch
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.roundRect(6, -14 - bodyBob, 8, 10, [2, 2, 2, 2]);
    ctx.fill();

    // Cleaning Broom / Tongs in hand
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    const broomAngle = player.isCleaning ? Math.sin(gameTime * 0.3) * 0.6 : 0.2;
    ctx.save();
    ctx.translate(10, -12 - bodyBob);
    ctx.rotate(broomAngle);
    ctx.moveTo(0, 0);
    ctx.lineTo(8, 22);
    ctx.stroke();
    // Broom bristles
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(8, 22, 5, 0, Math.PI);
    ctx.fill();
    ctx.restore();

    // Head
    ctx.fillStyle = '#fbb67e';
    ctx.beginPath();
    ctx.arc(0, -36 - bodyBob, 9, 0, Math.PI * 2);
    ctx.fill();

    // Backward Cap (Red/Yellow)
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(0, -38 - bodyBob, 9, Math.PI, Math.PI * 2);
    ctx.fill();
    // Cap visor backwards
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-12, -40 - bodyBob, 6, 3);

    // Eyes
    ctx.fillStyle = '#0f172a';
    const faceOff = player.direction === 'left' ? -3 : player.direction === 'right' ? 3 : 0;
    ctx.beginPath();
    ctx.arc(faceOff - 2, -36 - bodyBob, 1.5, 0, Math.PI * 2);
    ctx.arc(faceOff + 2, -36 - bodyBob, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Player Name & Turbo Boost Indicator
    if (player.boostTimer > 0) {
      // Golden speed aura
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(0, -18 - bodyBob, 20, 28, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`⚡ TURBO (${Math.ceil(player.boostTimer)}s)`, 0, -54 - bodyBob);
    } else {
      ctx.fillStyle = '#60a5fa';
      ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Aarav 🧹', 0, -52 - bodyBob);
    }

    // Cleaning Progress bar over player if active
    if (player.isCleaning) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-24, -66 - bodyBob, 48, 8);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(-23, -65 - bodyBob, (46 * player.cleaningProgress) / 100, 6);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1;
      ctx.strokeRect(-24, -66 - bodyBob, 48, 8);
    }

    ctx.restore();
  }

  private drawStreamLife(ctx: CanvasRenderingContext2D, gameTime: number) {
    // Water surface ripples
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1.5;
    for (let r = 0; r < 6; r++) {
      const rx = (120 * r + gameTime * 0.8) % WORLD_WIDTH;
      const ry = 1040 + (r * 24);
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.bezierCurveTo(rx + 15, ry - 3, rx + 30, ry + 3, rx + 45, ry);
      ctx.stroke();
    }

    // Lotus pads & flowers
    const lotuses = [
      { x: 220, y: 1060 },
      { x: 540, y: 1080 },
      { x: 920, y: 1050 },
      { x: 1240, y: 1090 },
    ];
    lotuses.forEach(lotus => {
      // Leaf
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.ellipse(lotus.x, lotus.y, 16, 10, 0, 0, Math.PI * 1.8);
      ctx.fill();
      // Lotus flower
      ctx.fillStyle = '#f472b6';
      ctx.beginPath();
      ctx.arc(lotus.x + 2, lotus.y - 2, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(lotus.x + 2, lotus.y - 2, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Little paper boat floating
    const boatX = 660 + Math.sin(gameTime * 0.04) * 40;
    const boatY = 1040 + Math.cos(gameTime * 0.04) * 6;
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(boatX - 10, boatY);
    ctx.lineTo(boatX + 10, boatY);
    ctx.lineTo(boatX + 6, boatY + 5);
    ctx.lineTo(boatX - 6, boatY + 5);
    ctx.closePath();
    ctx.fill();
    // Sail
    ctx.beginPath();
    ctx.moveTo(boatX, boatY);
    ctx.lineTo(boatX, boatY - 10);
    ctx.lineTo(boatX + 7, boatY);
    ctx.closePath();
    ctx.fill();
  }

  private drawSpeechBubble(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    text: string,
    bgColor: string = '#ffffff',
    textColor: string = '#0f172a'
  ) {
    ctx.font = '500 12px "Fredoka", sans-serif';
    const metrics = ctx.measureText(text);
    const textW = Math.min(metrics.width + 16, 260);
    const boxH = 24;

    ctx.fillStyle = bgColor;
    ctx.beginPath();
    ctx.roundRect(x - textW / 2, y - boxH, textW, boxH, 8);
    ctx.fill();

    // Bubble pointer
    ctx.beginPath();
    ctx.moveTo(x - 5, y);
    ctx.lineTo(x, y + 6);
    ctx.lineTo(x + 5, y);
    ctx.fill();

    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.fillText(text, x, y - 7, textW - 10);
  }

  private drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
    particles.forEach(p => {
      ctx.save();
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = Math.max(0, alpha);

      if (p.type === 'heart') {
        ctx.fillStyle = '#f43f5e';
        ctx.font = `${Math.floor(p.size * 2)}px sans-serif`;
        ctx.fillText('❤️', p.x, p.y);
      } else if (p.type === 'leaf') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.size, p.size * 0.5, p.life * 0.1, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
  }

  private drawInteractionPrompts(
    ctx: CanvasRenderingContext2D,
    player: Player,
    dog: DogCompanion,
    npcs: NPC[],
    items: WasteItem[],
    bins: WasteBin[],
    drains: DrainGrate[]
  ) {
    const INTERACT_DIST = 55;

    // 1. Drain prompt (opens minigame activity!)
    for (const drain of drains) {
      const cx = drain.x + drain.width / 2;
      const cy = drain.y + drain.height / 2;
      const dist = Math.hypot(player.x - cx, player.y - cy);
      if (dist < INTERACT_DIST + 15 && !drain.isCleared) {
        this.drawPromptBadge(ctx, cx, drain.y - 32, '[E] Start Unclog Activity 🛠️', '#38bdf8');
        return;
      }
    }

    // 2. Bin deposit prompt (Original in-world segregation game)
    if (player.inventory.length > 0) {
      for (const bin of bins) {
        const cx = bin.x + bin.width / 2;
        const cy = bin.y + bin.height / 2;
        const dist = Math.hypot(player.x - cx, player.y - cy);
        if (dist < INTERACT_DIST) {
          const matchingCount = player.inventory.filter(i => i.type === bin.type).length;
          const label = matchingCount > 0 ? `Press [E] to Deposit ${matchingCount} ${bin.type} items` : `[E] Sort items in ${bin.name}`;
          this.drawPromptBadge(ctx, cx, bin.y - 24, label, bin.color);
          return;
        }
      }
    }

    // 3. Litter pickup prompt
    for (const item of items) {
      if (item.isPickedUp) continue;
      const dist = Math.hypot(player.x - item.x, player.y - item.y);
      if (dist < INTERACT_DIST) {
        const full = player.inventory.length >= player.maxInventory;
        const label = full ? 'Satchel Full! Deposit at Bins' : `[E] Pick up ${item.name}`;
        this.drawPromptBadge(ctx, item.x, item.y - 20, label, full ? '#ef4444' : '#38bdf8');
        return;
      }
    }

    // 4. Dog pet / fetch play prompt
    const dogDist = Math.hypot(player.x - dog.x, player.y - dog.y);
    if (dogDist < 50) {
      const label = dog.pettedCount >= 1 ? '[E] Play Fetch with Sheru 🐕' : '[E] Pet Sheru 🐶 (+Hearts)';
      this.drawPromptBadge(ctx, dog.x, dog.y - 48, label, '#f59e0b');
      return;
    }

    // 5. NPC talk & special activity prompts
    for (const npc of npcs) {
      const dist = Math.hypot(player.x - npc.x, player.y - npc.y);
      if (dist < 55) {
        if (npc.id === 'npc-ramesh') {
          this.drawPromptBadge(ctx, npc.x, npc.y - 70, '[E] Brew Cutting Chai ☕ (+Speed Boost)', '#f59e0b');
        } else if (npc.id === 'npc-bunty') {
          this.drawPromptBadge(ctx, npc.x, npc.y - 70, '[E] Sail Paper Boat in Stream ⛵', '#38bdf8');
        } else {
          this.drawPromptBadge(ctx, npc.x, npc.y - 70, `[E] Talk to ${npc.name}`, '#e2e8f0');
        }
        return;
      }
    }
  }

  private drawPromptBadge(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, color: string) {
    ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
    const tw = ctx.measureText(text).width + 20;
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(x - tw / 2, y - 10, tw, 22, 6);
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.fillText(text, x, y + 5);
  }

  private drawWeatherEffects(
    ctx: CanvasRenderingContext2D,
    stormProgress: number,
    lightningTimer: number,
    rainDrops: RainDrop[]
  ) {
    // 1. Darkening Sky Overlay as monsoon approaches
    const darkAlpha = Math.min(stormProgress * 0.55, 0.55);
    if (darkAlpha > 0.05) {
      ctx.fillStyle = `rgba(15, 23, 42, ${darkAlpha})`;
      ctx.fillRect(0, 0, this.width, this.height);
    }

    // 2. Lightning Flash
    if (lightningTimer > 0) {
      const flashAlpha = (lightningTimer / 15) * 0.45;
      ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
      ctx.fillRect(0, 0, this.width, this.height);
    }

    // 3. Falling Rain Streaks
    if (stormProgress > 0.15) {
      ctx.strokeStyle = 'rgba(186, 230, 253, 0.45)';
      ctx.lineWidth = 1.2;
      rainDrops.forEach(r => {
        ctx.beginPath();
        ctx.moveTo(r.x, r.y);
        ctx.lineTo(r.x - 3, r.y + r.length);
        ctx.stroke();
      });
    }
  }
}
