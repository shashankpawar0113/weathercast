import { WeatherEnvState, CursorState } from '../types';

interface RainDrop {
  x: number;
  y: number;
  length: number;
  speed: number;
  depth: 0 | 1 | 2; // 0: Far, 1: Mid, 2: Near
  thickness: number;
  opacity: number;
}

interface RainSplash {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  vx: number;
  vy: number;
}

export class RainRenderer {
  private drops: RainDrop[] = [];
  private splashes: RainSplash[] = [];
  private maxSplashes = 40;

  constructor() {
    this.initDrops(280);
  }

  private initDrops(count: number) {
    this.drops = [];
    for (let i = 0; i < count; i++) {
      const depth = (i % 3) as 0 | 1 | 2;
      this.drops.push({
        x: Math.random(),
        y: Math.random(),
        length: 12 + depth * 14 + Math.random() * 8,
        speed: 0.015 + depth * 0.012 + Math.random() * 0.006,
        depth,
        thickness: 0.8 + depth * 0.7,
        opacity: 0.3 + depth * 0.3,
      });
    }
  }

  public render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    state: WeatherEnvState,
    cursor: CursorState,
    dt: number
  ) {
    if (state.rainIntensity < 0.05) return;

    const { windSpeed, rainIntensity, palette } = state;
    // Active drop count scales with rain intensity
    const activeCount = Math.floor(this.drops.length * Math.min(1, rainIntensity * 1.3));

    // Wind horizontal drift factor
    const windSlant = (windSpeed * 0.35 + 0.1);

    ctx.save();
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';

    for (let i = 0; i < activeCount; i++) {
      const drop = this.drops[i];

      // Update vertical and diagonal fall
      drop.y += drop.speed * (rainIntensity * 0.6 + 0.7) * (dt * 60);
      drop.x += windSlant * drop.speed * 0.4 * (dt * 60);

      // Wrap around screen
      if (drop.y > 1) {
        drop.y = -0.05;
        drop.x = Math.random();

        // Chance to spawn ground splash
        if (Math.random() < 0.25 && this.splashes.length < this.maxSplashes) {
          this.splashes.push({
            x: drop.x * width,
            y: height - Math.random() * 40,
            radius: 1,
            maxRadius: 4 + drop.depth * 3,
            alpha: 0.6,
            vx: (Math.random() - 0.5) * 1.5,
            vy: -Math.random() * 2 - 0.5,
          });
        }
      }
      if (drop.x > 1.1) drop.x = -0.1;
      if (drop.x < -0.1) drop.x = 1.1;

      const screenX = drop.x * width;
      const screenY = drop.y * height;

      // Cursor Air Pocket Deflection (drops bend slightly around cursor)
      const dx = screenX - cursor.x;
      const dy = screenY - cursor.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const repulsionRadius = 140;

      let bendX = 0;
      let bendY = 0;
      if (dist < repulsionRadius && dist > 0) {
        const force = (1 - dist / repulsionRadius) * 18 * (drop.depth === 2 ? 1 : 0.4);
        bendX = (dx / dist) * force;
        bendY = (dy / dist) * force * 0.5;
      }

      const startX = screenX + bendX;
      const startY = screenY + bendY;
      const dropLength = drop.length * (rainIntensity * 0.5 + 0.8);
      const endX = startX + windSlant * dropLength * 0.35;
      const endY = startY + dropLength;

      ctx.strokeStyle = palette.particleColor;
      ctx.lineWidth = drop.thickness;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }

    // Render Splash Ripples
    for (let s = this.splashes.length - 1; s >= 0; s--) {
      const splash = this.splashes[s];
      splash.radius += 0.4;
      splash.alpha -= 0.035;
      splash.x += splash.vx;
      splash.y += splash.vy;

      if (splash.alpha <= 0 || splash.radius >= splash.maxRadius) {
        this.splashes.splice(s, 1);
        continue;
      }

      ctx.strokeStyle = `rgba(224, 242, 254, ${splash.alpha.toFixed(2)})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(splash.x, splash.y, splash.radius * 1.5, splash.radius * 0.6, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }
}
