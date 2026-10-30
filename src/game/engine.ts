import { soundManager } from '../audio/soundManager';
import {
  DogCompanion,
  DrainGrate,
  GameStatus,
  NPC,
  Obstacle,
  Particle,
  Player,
  Quest,
  RainDrop,
  WasteBin,
  WasteItem,
} from '../types/game';
import {
  DOG_FOLLOW_SPEED,
  DOG_RUN_SPEED,
  MONSOON_TOTAL_TIME,
  PLAYER_SPEED,
  PLAYER_SPRINT_SPEED,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from './constants';
import {
  INITIAL_BINS,
  INITIAL_DOG,
  INITIAL_DRAINS,
  INITIAL_NPCS,
  INITIAL_OBSTACLES,
  INITIAL_PLAYER,
  INITIAL_WASTE_ITEMS,
} from './worldData';

export class GameEngine {
  public player: Player;
  public dog: DogCompanion;
  public npcs: NPC[];
  public wasteItems: WasteItem[];
  public bins: WasteBin[];
  public drains: DrainGrate[];
  public obstacles: Obstacle[];
  public particles: Particle[] = [];
  public rainDrops: RainDrop[] = [];

  public timeRemaining: number = MONSOON_TOTAL_TIME; // seconds
  public stormProgress: number = 0; // 0 to 1
  public lightningTimer: number = 0;
  public nextThunderTime: number = 25;

  public gameTime: number = 0;
  public gameStatus: GameStatus = 'title';

  // Input state
  public keys: Record<string, boolean> = {};
  public virtualInput = { x: 0, y: 0, sprint: false, action: false };

  // Camera viewport
  public camera = { x: 0, y: 0, width: 800, height: 600 };

  // Toast / announcement message
  public currentToast: { text: string; timer: number; color: string } | null = null;

  // Quests
  public quests: Quest[] = [
    { id: 'q-drains', title: 'Unclog All 4 Storm Drains', current: 0, target: 4, completed: false, icon: '🌊' },
    { id: 'q-litter', title: 'Collect & Sort Litter', current: 0, target: 12, completed: false, icon: '♻️' },
    { id: 'q-dog', title: 'Befriend Sheru (Pet 3 times)', current: 0, target: 3, completed: false, icon: '🐶' },
  ];

  constructor() {
    this.player = JSON.parse(JSON.stringify(INITIAL_PLAYER));
    this.dog = JSON.parse(JSON.stringify(INITIAL_DOG));
    this.npcs = JSON.parse(JSON.stringify(INITIAL_NPCS));
    this.wasteItems = JSON.parse(JSON.stringify(INITIAL_WASTE_ITEMS));
    this.bins = JSON.parse(JSON.stringify(INITIAL_BINS));
    this.drains = JSON.parse(JSON.stringify(INITIAL_DRAINS));
    this.obstacles = JSON.parse(JSON.stringify(INITIAL_OBSTACLES));

    this.initRain();
  }

  public resetGame() {
    this.player = JSON.parse(JSON.stringify(INITIAL_PLAYER));
    this.dog = JSON.parse(JSON.stringify(INITIAL_DOG));
    this.npcs = JSON.parse(JSON.stringify(INITIAL_NPCS));
    this.wasteItems = JSON.parse(JSON.stringify(INITIAL_WASTE_ITEMS));
    this.bins = JSON.parse(JSON.stringify(INITIAL_BINS));
    this.drains = JSON.parse(JSON.stringify(INITIAL_DRAINS));
    this.obstacles = JSON.parse(JSON.stringify(INITIAL_OBSTACLES));

    this.timeRemaining = MONSOON_TOTAL_TIME;
    this.stormProgress = 0;
    this.lightningTimer = 0;
    this.nextThunderTime = 20;
    this.particles = [];
    this.gameTime = 0;
    this.gameStatus = 'playing';

    this.quests = [
      { id: 'q-drains', title: 'Unclog All 4 Storm Drains', current: 0, target: 4, completed: false, icon: '🌊' },
      { id: 'q-litter', title: 'Collect & Sort Litter', current: 0, target: 12, completed: false, icon: '♻️' },
      { id: 'q-dog', title: 'Befriend Sheru (Pet 3 times)', current: 0, target: 3, completed: false, icon: '🐶' },
    ];

    this.showToast('Monsoon clouds are rolling in! Clean the street and clear the drains!', 240, '#38bdf8');
  }

  public setViewport(width: number, height: number) {
    this.camera.width = width;
    this.camera.height = height;
  }

  private initRain() {
    this.rainDrops = [];
    for (let i = 0; i < 70; i++) {
      this.rainDrops.push({
        x: Math.random() * (this.camera.width || 800),
        y: Math.random() * (this.camera.height || 600),
        length: 12 + Math.random() * 14,
        speed: 14 + Math.random() * 8,
        opacity: 0.3 + Math.random() * 0.4,
      });
    }
  }

  public update(dt: number) {
    if (this.gameStatus !== 'playing') {
      return;
    }

    this.gameTime += 1;

    // 1. Update Monsoon Countdown & Storm progress
    this.timeRemaining = Math.max(0, this.timeRemaining - dt);
    this.stormProgress = 1 - this.timeRemaining / MONSOON_TOTAL_TIME;

    // Thunder & Lightning events
    this.nextThunderTime -= dt;
    if (this.nextThunderTime <= 0) {
      soundManager.playThunder();
      this.lightningTimer = 18;
      this.nextThunderTime = 22 + Math.random() * 25;
      this.showToast('⚡ Distant thunder rumbles! The monsoon is nearing!', 180, '#facc15');
    }
    if (this.lightningTimer > 0) {
      this.lightningTimer -= 1;
    }

    // 2. Update Player Movement & Actions
    this.updatePlayer(dt);

    // 3. Update Dog Companion (Always moving and visible!)
    this.updateDog(dt);

    // 4. Update NPCs (All moving on patrol routes!)
    this.updateNPCs(dt);

    // 5. Update Particles
    this.updateParticles(dt);

    // 6. Update Rain Drops
    this.updateRain();

    // 7. Update Camera tracking player
    this.updateCamera();

    // 8. Update Quests & Win/Loss Conditions
    this.updateGameState();

    // 9. Update Toast
    if (this.currentToast) {
      this.currentToast.timer -= 1;
      if (this.currentToast.timer <= 0) {
        this.currentToast = null;
      }
    }
  }

  private updatePlayer(dt: number) {
    const p = this.player;

    // Decay boost timer
    if (p.boostTimer > 0) {
      p.boostTimer = Math.max(0, p.boostTimer - dt);
    }

    // Freeze world movement while in an interactive minigame activity modal
    if (p.activeActivity !== null) {
      p.vx = 0;
      p.vy = 0;
      p.isMoving = false;
      return;
    }

    let dx = 0;
    let dy = 0;

    // Keyboard inputs
    if (this.keys['KeyW'] || this.keys['ArrowUp']) dy -= 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) dy += 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) dx -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) dx += 1;

    // Virtual Joystick inputs
    if (Math.abs(this.virtualInput.x) > 0.1 || Math.abs(this.virtualInput.y) > 0.1) {
      dx = this.virtualInput.x;
      dy = this.virtualInput.y;
    }

    // Sprint modifier (boost gives +45% extra turbo speed!)
    const isSprint = this.keys['ShiftLeft'] || this.keys['ShiftRight'] || this.virtualInput.sprint;
    const boostMultiplier = p.boostTimer > 0 ? 1.45 : 1.0;
    const baseSpeed = isSprint ? PLAYER_SPRINT_SPEED : PLAYER_SPEED;
    const currentSpeed = baseSpeed * boostMultiplier;

    p.isMoving = dx !== 0 || dy !== 0;

    if (p.isMoving) {
      // Normalize diagonal speed
      const len = Math.hypot(dx, dy);
      const nx = dx / len;
      const ny = dy / len;

      p.vx = nx * currentSpeed;
      p.vy = ny * currentSpeed;

      // Spawn golden trail if turbo boosted
      if (p.boostTimer > 0 && Math.random() < 0.3) {
        this.spawnParticles(p.x, p.y + 6, 'sparkle', '#f59e0b', 2);
      }

      // Update direction
      if (Math.abs(nx) > Math.abs(ny)) {
        p.direction = nx > 0 ? 'right' : 'left';
      } else {
        p.direction = ny > 0 ? 'down' : 'up';
      }

      // Check collision with obstacles
      const nextX = p.x + p.vx;
      const nextY = p.y + p.vy;

      if (!this.checkCollision(nextX, p.y, 14)) {
        p.x = Math.max(20, Math.min(WORLD_WIDTH - 20, nextX));
      }
      if (!this.checkCollision(p.x, nextY, 14)) {
        p.y = Math.max(20, Math.min(WORLD_HEIGHT - 20, nextY));
      }

      // Footstep sound tick
      p.animTimer += 1;
      if (p.animTimer % (isSprint ? 12 : 18) === 0) {
        soundManager.playStep();
      }
    } else {
      p.vx = 0;
      p.vy = 0;
    }

    // Check Action Key (Space / KeyE or virtual action)
    const isActionPressed = this.keys['Space'] || this.keys['KeyE'] || this.virtualInput.action;
    this.handlePlayerAction(isActionPressed, dt);
  }

  private handlePlayerAction(isActionPressed: boolean, dt: number) {
    const p = this.player;

    // If an activity modal is open, halt active world actions
    if (p.activeActivity !== null) {
      return;
    }

    // 1. Drain Unclogging Minigame Activity
    let nearDrain: DrainGrate | null = null;
    for (const drain of this.drains) {
      const cx = drain.x + drain.width / 2;
      const cy = drain.y + drain.height / 2;
      const dist = Math.hypot(p.x - cx, p.y - cy);
      if (dist < 65 && !drain.isCleared) {
        nearDrain = drain;
        break;
      }
    }

    if (nearDrain && isActionPressed) {
      // Launch Interactive Drain Unclogging Minigame Activity!
      p.activeActivity = 'drain_unclog';
      p.activityTargetId = nearDrain.id;
      return;
    }

    // Trigger edge-detected actions when action is tapped
    if (isActionPressed) {
      // 2. Deposit into Bins (Original in-world segregation game)
      for (const bin of this.bins) {
        const cx = bin.x + bin.width / 2;
        const cy = bin.y + bin.height / 2;
        if (Math.hypot(p.x - cx, p.y - cy) < 65) {
          const matchingItems = p.inventory.filter(i => i.type === bin.type);
          if (matchingItems.length > 0) {
            p.inventory = p.inventory.filter(i => i.type !== bin.type);
            bin.depositedCount += matchingItems.length;
            const points = matchingItems.length * 35;
            p.score += points;

            soundManager.playBinSuccess();
            this.spawnParticles(bin.x + bin.width / 2, bin.y, 'sparkle', bin.color, 16);
            this.showToast(`♻️ Deposited ${matchingItems.length} items in ${bin.name}! (+${points} pts)`, 180, bin.color);
            return;
          } else if (p.inventory.length > 0) {
            this.showToast(`⚠️ Look closely! This is the ${bin.name}. Check your satchel types.`, 120, '#fbbf24');
            return;
          } else {
            this.showToast(`🎒 Satchel is empty! Search the street with Sheru for litter to collect.`, 120, '#38bdf8');
            return;
          }
        }
      }

      // 3. Pick up Waste Item
      for (const item of this.wasteItems) {
        if (!item.isPickedUp && Math.hypot(p.x - item.x, p.y - item.y) < 55) {
          if (p.inventory.length < p.maxInventory) {
            item.isPickedUp = true;
            p.inventory.push(item);
            p.score += item.scoreValue;

            soundManager.playPickUp();
            this.spawnParticles(item.x, item.y, 'sparkle', item.color, 8);
            this.showToast(`🧺 Picked up ${item.name} (${item.type})!`, 120, item.color);
            return;
          } else {
            this.showToast(`🎒 Satchel is full! Drop items at the Segregation Bins!`, 140, '#f87171');
            return;
          }
        }
      }

      // 4. Pet Dog ("Sheru") or Launch Park Fetch Minigame
      const dogDist = Math.hypot(p.x - this.dog.x, p.y - this.dog.y);
      if (dogDist < 55 && !p.isPettingDog) {
        p.isPettingDog = true;
        p.pettingTimer = 30;
        this.dog.pettedCount += 1;
        this.dog.happiness = Math.min(100, this.dog.happiness + 20);
        this.dog.state = 'happy';
        this.dog.activeBarkText = 'Woof! Want to play fetch in the park, Aarav?';
        this.dog.barkTextTimer = 140;
        p.score += 20;

        soundManager.playDogHappy();
        this.spawnParticles(this.dog.x, this.dog.y - 20, 'heart', '#f43f5e', 8);

        // If player has already petted once, offer the Fetch minigame
        if (this.dog.pettedCount >= 2) {
          p.activeActivity = 'sheru_fetch';
          return;
        } else {
          this.showToast(`🐕 Petted Sheru! Friendship raised to ${this.dog.happiness}%! (+20 pts)`, 140, '#f59e0b');
          return;
        }
      }

      // 5. Talk to NPC or Launch Special NPC Activities
      for (const npc of this.npcs) {
        if (Math.hypot(p.x - npc.x, p.y - npc.y) < 60) {
          // If Uncle Ramesh (Chai Wallah)
          if (npc.id === 'npc-ramesh') {
            p.activeActivity = 'chai_brew';
            return;
          }

          // If Little Bunty near the stream
          if (npc.id === 'npc-bunty') {
            p.activeActivity = 'boat_sail';
            return;
          }

          const randomDialogue = npc.dialogue[Math.floor(Math.random() * npc.dialogue.length)];
          npc.activeDialogue = randomDialogue;
          npc.dialogueTimer = 180;
          this.showToast(`💬 ${npc.name}: "${randomDialogue}"`, 220, '#e2e8f0');
          return;
        }
      }
    }

    if (p.isPettingDog) {
      p.pettingTimer -= 1;
      if (p.pettingTimer <= 0) {
        p.isPettingDog = false;
      }
    }
  }

  // --- Activity Completion Callbacks ---
  public completeDrainActivity(drainId: string) {
    const drain = this.drains.find(d => d.id === drainId);
    if (drain) {
      drain.isCleared = true;
      drain.cloggedPercent = 0;
      this.player.score += 150;
      this.player.ecoTokens += 1;
      this.spawnParticles(drain.x + drain.width / 2, drain.y + drain.height / 2, 'water', '#38bdf8', 35);
      this.showToast(`🌊 ${drain.name} completely unblocked! Rainwater flowing smoothly! (+150 pts)`, 240, '#10b981');
    }
    this.player.activeActivity = null;
    this.player.activityTargetId = null;

    // Check if all drains cleared
    const allCleared = this.drains.every(d => d.isCleared);
    if (allCleared) {
      this.showToast('🎉 All 4 storm drains unblocked! The neighbourhood stream is safe!', 260, '#0284c7');
    }
  }

  public completeChaiActivity() {
    this.player.boostTimer = 30; // 30 seconds turbo speed
    this.player.score += 60;
    this.showToast('⚡ Masala Turbo Boost Active! Sprinting +50% faster for 30s! (+60 pts)', 240, '#f59e0b');
    this.player.activeActivity = null;
  }

  public completeSheruActivity(scoreGain: number) {
    this.dog.happiness = 100;
    this.player.score += scoreGain;
    this.showToast(`🐕 Sheru loves you! Found hidden Eco-Medallion! (+${scoreGain} pts)`, 240, '#f59e0b');
    this.player.activeActivity = null;
  }

  public completeBoatActivity(scoreGain: number) {
    this.player.score += scoreGain;
    this.showToast(`⛵ Paper boat sailed across clean water! (+${scoreGain} pts)`, 220, '#38bdf8');
    this.player.activeActivity = null;
  }

  public closeCurrentActivity() {
    this.player.activeActivity = null;
    this.player.activityTargetId = null;
  }

  private updateDog(dt: number) {
    const dog = this.dog;
    const p = this.player;

    // Decay dog bark text
    if (dog.barkTextTimer > 0) {
      dog.barkTextTimer -= 1;
      if (dog.barkTextTimer <= 0) {
        dog.activeBarkText = null;
      }
    }

    // Check if there is an unclogged drain or nearby litter to alert Aarav!
    let targetAlertSpot: { x: number; y: number; text: string } | null = null;
    for (const drain of this.drains) {
      if (!drain.isCleared) {
        const dDist = Math.hypot(dog.x - (drain.x + drain.width / 2), dog.y - (drain.y + drain.height / 2));
        if (dDist < 320) {
          targetAlertSpot = { x: drain.x + drain.width / 2, y: drain.y - 15, text: 'Woof! Clogged drain here!' };
          break;
        }
      }
    }

    if (!targetAlertSpot) {
      for (const item of this.wasteItems) {
        if (!item.isPickedUp) {
          const iDist = Math.hypot(dog.x - item.x, dog.y - item.y);
          if (iDist < 260) {
            targetAlertSpot = { x: item.x, y: item.y, text: 'Woof! Found litter!' };
            break;
          }
        }
      }
    }

    // Determine target location for Sheru
    let targetX = p.x - 36;
    let targetY = p.y + 10;

    if (targetAlertSpot && Math.hypot(p.x - targetAlertSpot.x, p.y - targetAlertSpot.y) > 40) {
      targetX = targetAlertSpot.x;
      targetY = targetAlertSpot.y;
      dog.state = 'lead';

      // Bark occasionally
      dog.barkTimer += 1;
      if (dog.barkTimer % 180 === 0) {
        soundManager.playDogBark();
        dog.activeBarkText = targetAlertSpot.text;
        dog.barkTextTimer = 120;
      }
    } else {
      dog.state = 'follow';
    }

    // Move dog towards target position smoothly
    const distX = targetX - dog.x;
    const distY = targetY - dog.y;
    const distance = Math.hypot(distX, distY);

    if (distance > 24) {
      const speed = distance > 120 ? DOG_RUN_SPEED : DOG_FOLLOW_SPEED;
      dog.vx = (distX / distance) * speed;
      dog.vy = (distY / distance) * speed;

      dog.x += dog.vx;
      dog.y += dog.vy;

      dog.direction = dog.vx >= 0 ? 'right' : 'left';
    } else {
      dog.vx = 0;
      dog.vy = 0;
    }

    // Dog stay within world boundaries
    dog.x = Math.max(30, Math.min(WORLD_WIDTH - 30, dog.x));
    dog.y = Math.max(30, Math.min(WORLD_HEIGHT - 30, dog.y));
  }

  private updateNPCs(dt: number) {
    this.npcs.forEach(npc => {
      // Clear dialogue bubble timer
      if (npc.dialogueTimer > 0) {
        npc.dialogueTimer -= 1;
        if (npc.dialogueTimer <= 0) {
          npc.activeDialogue = null;
        }
      }

      // If waiting at a waypoint
      if (npc.isWaiting) {
        npc.waitTimer -= 1;
        if (npc.waitTimer <= 0) {
          npc.isWaiting = false;
          npc.currentWaypointIndex = (npc.currentWaypointIndex + 1) % npc.waypoints.length;
        }
        return;
      }

      // Move towards current waypoint
      const wp = npc.waypoints[npc.currentWaypointIndex];
      const dx = wp.x - npc.x;
      const dy = wp.y - npc.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 4) {
        npc.x = wp.x;
        npc.y = wp.y;
        npc.isWaiting = true;
        npc.waitTimer = wp.waitTime || 60;
      } else {
        const nx = dx / dist;
        const ny = dy / dist;
        npc.vx = nx * npc.speed;
        npc.vy = ny * npc.speed;

        npc.x += npc.vx;
        npc.y += npc.vy;

        npc.direction = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
      }
    });
  }

  private updateCamera() {
    // Camera smooth lerp to center player
    const targetCamX = this.player.x - this.camera.width / 2;
    const targetCamY = this.player.y - this.camera.height / 2;

    this.camera.x += (targetCamX - this.camera.x) * 0.12;
    this.camera.y += (targetCamY - this.camera.y) * 0.12;

    // Clamp camera within map
    this.camera.x = Math.max(0, Math.min(WORLD_WIDTH - this.camera.width, this.camera.x));
    this.camera.y = Math.max(0, Math.min(WORLD_HEIGHT - this.camera.height, this.camera.y));
  }

  private updateParticles(dt: number) {
    // Ambient wind-blown leaves fluttering
    if (this.gameTime % 25 === 0 && Math.random() < 0.8) {
      this.particles.push({
        x: this.camera.x + Math.random() * this.camera.width,
        y: this.camera.y - 10,
        vx: -1.5 - Math.random() * 2.5,
        vy: 2.0 + Math.random() * 2.0,
        life: 140,
        maxLife: 140,
        color: Math.random() > 0.5 ? '#eab308' : '#84cc16',
        size: 3 + Math.random() * 3,
        type: 'leaf',
      });
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 1;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  private updateRain() {
    if (this.stormProgress < 0.15) return;
    this.rainDrops.forEach(r => {
      r.y += r.speed;
      r.x -= 2;
      if (r.y > this.camera.height) {
        r.y = -20;
        r.x = Math.random() * this.camera.width + 50;
      }
    });
  }

  private checkCollision(x: number, y: number, radius: number): boolean {
    for (const obs of this.obstacles) {
      if (
        x + radius > obs.x &&
        x - radius < obs.x + obs.width &&
        y + radius > obs.y &&
        y - radius < obs.y + obs.height
      ) {
        return true;
      }
    }
    return false;
  }

  public spawnParticles(x: number, y: number, type: Particle['type'], color: string, count: number) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.0 + Math.random() * 3.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 30 + Math.random() * 25,
        maxLife: 55,
        color,
        size: 2.5 + Math.random() * 3,
        type,
      });
    }
  }

  private updateGameState() {
    // Update Quests
    const clearedDrainsCount = this.drains.filter(d => d.isCleared).length;
    const depositedCount = this.bins.reduce((sum, b) => sum + b.depositedCount, 0);

    this.quests[0].current = clearedDrainsCount;
    this.quests[0].completed = clearedDrainsCount >= this.quests[0].target;

    this.quests[1].current = depositedCount;
    this.quests[1].completed = depositedCount >= this.quests[1].target;

    this.quests[2].current = this.dog.pettedCount;
    this.quests[2].completed = this.dog.pettedCount >= this.quests[2].target;

    // Victory condition: All 4 drains cleared and at least 10 items sorted
    if (clearedDrainsCount === 4 && depositedCount >= 10 && this.gameStatus === 'playing') {
      this.gameStatus = 'victory';
      soundManager.playVictory();
      return;
    }

    // Loss condition: Time ran out with drains blocked
    if (this.timeRemaining <= 0 && clearedDrainsCount < 4 && this.gameStatus === 'playing') {
      this.gameStatus = 'gameover';
    }
  }

  public showToast(text: string, durationFrames: number = 180, color: string = '#38bdf8') {
    this.currentToast = { text, timer: durationFrames, color };
  }
}
