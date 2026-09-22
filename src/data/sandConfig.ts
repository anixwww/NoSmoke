export interface SandLevelConfig {
  level: number;
  name: string;
  color: string;
  glow: string;
  size: number;
  shape: 'circle' | 'square' | 'diamond' | 'triangle' | 'pentagon' | 'star';
}

const PALETTE = [
  { color: '#F59E0B', glow: '#FDE68A', shape: 'circle' as const },
  { color: '#06B6D4', glow: '#67E8F9', shape: 'diamond' as const },
  { color: '#A855F7', glow: '#E9D5FF', shape: 'star' as const },
  { color: '#10B981', glow: '#A7F3D0', shape: 'square' as const },
  { color: '#EC4899', glow: '#FBCFE8', shape: 'pentagon' as const },
  { color: '#3B82F6', glow: '#BFDBFE', shape: 'triangle' as const },
  { color: '#14B8A6', glow: '#99F6E4', shape: 'diamond' as const },
  { color: '#8B5CF6', glow: '#DDD6FE', shape: 'star' as const },
  { color: '#F43F5E', glow: '#FECDD3', shape: 'star' as const },
  { color: '#F4B73C', glow: '#FEF08A', shape: 'circle' as const }
];

const NAMES = ['Зерно', 'Кристал', 'Аметист', 'Смарагд', 'Рубін', 'Сонце', 'Сапфір', 'Топаз', 'Опал', 'Діамант'];

export function getLevelConfig(level: number): SandLevelConfig {
  const paletteItem = PALETTE[(level - 1) % PALETTE.length];
  const baseName = NAMES[(level - 1) % NAMES.length];
  const name = level <= 10 ? `${level} рівень (${baseName})` : `Рівень ${level} (Космічний)`;
  const size = Math.min(45, 5 + (level - 1) * 2);
  return {
    level,
    name,
    color: paletteItem.color,
    glow: paletteItem.glow,
    size,
    shape: paletteItem.shape
  };
}

export interface LevelCountItem {
  level: number;
  count: number;
  config: SandLevelConfig;
}

export function getLevelCounts(totalSeconds: number): LevelCountItem[] {
  let n = Math.max(0, Math.floor(totalSeconds));
  const results: LevelCountItem[] = [];
  let level = 1;

  while (n > 0 || level <= 3) {
    const count = n % 10;
    const config = getLevelConfig(level);
    results.push({ level, count, config });
    n = Math.floor(n / 10);
    if (n === 0 && level >= 3) break;
    level++;
  }
  return results;
}

// Backward compatibility helper for components expecting LEVEL_CONFIG array
export const LEVEL_CONFIG = Array.from({ length: 15 }, (_, i) => getLevelConfig(i + 1));

export function drawGrainShape(
  ctx: CanvasRenderingContext2D,
  shape: string,
  x: number,
  y: number,
  size: number,
  rot: number
) {
  ctx.beginPath();
  if (shape === 'circle') {
    ctx.arc(x, y, size, 0, Math.PI * 2);
  } else if (shape === 'square') {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.rect(-size * 0.8, -size * 0.8, size * 1.6, size * 1.6);
    ctx.restore();
  } else if (shape === 'diamond') {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot + Math.PI / 4);
    ctx.rect(-size * 0.75, -size * 0.75, size * 1.5, size * 1.5);
    ctx.restore();
  } else if (shape === 'triangle') {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.moveTo(0, -size);
    ctx.lineTo(size * 0.9, size * 0.8);
    ctx.lineTo(-size * 0.9, size * 0.8);
    ctx.closePath();
    ctx.restore();
  } else if (shape === 'star') {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    const points = 5;
    const step = Math.PI / points;
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? size : size * 0.45;
      const a = i * step - Math.PI / 2;
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.restore();
  } else {
    // Pentagon
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    for (let i = 0; i < 5; i++) {
      const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
      const px = Math.cos(a) * size;
      const py = Math.sin(a) * size;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.restore();
  }
}

export function drawGlowingGrain(
  ctx: CanvasRenderingContext2D,
  shape: string,
  x: number,
  y: number,
  size: number,
  rot: number,
  color: string,
  glowColor: string,
  haloBlur = 10
) {
  ctx.save();
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = haloBlur;

  const grad = ctx.createRadialGradient(
    x - size * 0.25,
    y - size * 0.25,
    size * 0.1,
    x,
    y,
    size * 1.2
  );
  grad.addColorStop(0, '#FFFFFF');
  grad.addColorStop(0.35, glowColor);
  grad.addColorStop(1, color);

  ctx.fillStyle = grad;
  drawGrainShape(ctx, shape, x, y, size, rot);
  ctx.fill();

  // Highlight dot
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.beginPath();
  ctx.arc(x - size * 0.3, y - size * 0.3, Math.max(0.8, size * 0.25), 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
