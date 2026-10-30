export type WasteType = 'plastic' | 'organic' | 'paper' | 'metal';

export interface WasteItem {
  id: string;
  name: string;
  type: WasteType;
  x: number;
  y: number;
  width: number;
  height: number;
  isPickedUp: boolean;
  scoreValue: number;
  color: string;
  description: string;
}

export interface WasteBin {
  id: string;
  type: WasteType;
  name: string;
  label: string;
  color: string;
  borderColor: string;
  x: number;
  y: number;
  width: number;
  height: number;
  depositedCount: number;
}

export interface ClogDebrisItem {
  id: string;
  name: string;
  type: 'bag' | 'leaves' | 'bottle' | 'can' | 'sludge';
  x: number; // percentage in grate modal
  y: number;
  removed: boolean;
  color: string;
  label: string;
}

export interface DrainGrate {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  cloggedPercent: number; // 100 = fully blocked, 0 = fully flowing
  isCleared: boolean;
  puddleRadius: number; // grows if clogged
  clogDebris: ClogDebrisItem[];
}

export type DogState = 'follow' | 'lead' | 'sniff' | 'bark' | 'sit' | 'happy' | 'run';

export interface DogCompanion {
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
  direction: 'left' | 'right' | 'up' | 'down';
  state: DogState;
  targetX: number;
  targetY: number;
  barkTimer: number;
  happiness: number; // 0 - 100
  pettedCount: number;
  animFrame: number;
  animTimer: number;
  tailWag: number;
  activeBarkText: string | null;
  barkTextTimer: number;
}

export type NPCType = 'vendor' | 'jogger' | 'cyclist' | 'elder' | 'child';

export interface NPC {
  id: string;
  name: string;
  role: string;
  type: NPCType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
  direction: 'left' | 'right' | 'up' | 'down';
  waypoints: { x: number; y: number; waitTime?: number }[];
  currentWaypointIndex: number;
  waitTimer: number;
  isWaiting: boolean;
  animFrame: number;
  animTimer: number;
  dialogue: string[];
  activeDialogue: string | null;
  dialogueTimer: number;
  hairColor: string;
  shirtColor: string;
  pantsColor: string;
  specialProp?: 'bicycle' | 'chai_pot' | 'walking_stick' | 'flowers' | 'ball';
}

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
  direction: 'left' | 'right' | 'up' | 'down';
  isMoving: boolean;
  isSprinting: boolean;
  animFrame: number;
  animTimer: number;
  inventory: WasteItem[];
  maxInventory: number;
  score: number;
  ecoTokens: number;
  isCleaning: boolean;
  cleaningTargetId: string | null;
  cleaningProgress: number; // 0 to 100
  isPettingDog: boolean;
  pettingTimer: number;
  boostTimer: number; // Masala Chai turbo sprint timer (seconds)
  activeActivity: 'drain_unclog' | 'chai_brew' | 'sheru_fetch' | 'boat_sail' | null;
  activityTargetId: string | null;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: 'leaf' | 'sparkle' | 'water' | 'mud' | 'heart' | 'splash';
}

export interface RainDrop {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
}

export interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
}

export interface Quest {
  id: string;
  title: string;
  current: number;
  target: number;
  completed: boolean;
  icon: string;
}

export type GameStatus = 'title' | 'playing' | 'paused' | 'victory' | 'gameover';
