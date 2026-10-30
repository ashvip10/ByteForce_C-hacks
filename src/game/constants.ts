export const WORLD_WIDTH = 1600;
export const WORLD_HEIGHT = 1200;

export const PLAYER_SPEED = 3.6;
export const PLAYER_SPRINT_SPEED = 5.4;
export const DOG_FOLLOW_SPEED = 4.0;
export const DOG_RUN_SPEED = 5.2;

export const MONSOON_TOTAL_TIME = 240; // 4 minutes timer before monsoon arrives

export const WASTE_COLORS = {
  organic: {
    badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    hex: '#10b981',
    name: 'Wet / Organic',
    binName: 'Green Bin',
  },
  paper: {
    badge: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    hex: '#3b82f6',
    name: 'Dry / Paper',
    binName: 'Blue Bin',
  },
  plastic: {
    badge: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    hex: '#f59e0b',
    name: 'Plastic / Recyclable',
    binName: 'Yellow Bin',
  },
  metal: {
    badge: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
    hex: '#ef4444',
    name: 'Metal / Cans / E-Waste',
    binName: 'Red Bin',
  },
};
