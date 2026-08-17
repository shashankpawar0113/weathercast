import { WeatherEnvState, CursorState } from '../types';

interface Snowflake {
  x: number;
  y: number;
  radius: number;
  fallSpeed: number;
  swaySpeed: number;
  swayAmplitude: number;
  swayPhase: number;
  depth: 0 | 1 | 2; // 0: Far, 1: Mid, 2: Near (Soft bokeh)
  alpha: number;
}

export class SnowRenderer {
  private flakes: Snowflake[] = [];

  constructor() {
    this.initFlakes(160);
  }

  private initFlakes(count: number) {
    this.flakes = [];
    for (let i = 0; i < count; i++) {
      const depth = (i % 3) as 0 | 1 | 2;
      this.flakes.push({
        x: Math.random(),
        y: Math.random(),
        radius: 1.2 + depth * 1.8 + Math.random() * 1.2,
        fallSpeed: 0.0025 + depth * 0.002 + Math.random() * 0.0015,
        swaySpeed: 1.5 + Math.random() * 2,
        swayAmplitude: 0.004 + depth * 0.003,
        swayPhase: Math.random() * Math.PI * 2,
        depth,
        alpha: 0.4 + depth * 0.28,
      });
    }
  }

  public render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    state: WeatherEnvState,
    cursor: CursorState,
    time: number,
    dt: number
  ) {
    if (state.snowIntensity < 0.05) return;

    const { windSpeed, snowIntensity, palette } = state;
    const activeCount = Math.floor(this.flakes.length * Math.min(1, snowIntensity * 1.2));
    const windDrift = windSpeed * 0.002;

    ctx.save();

    for (let i = 0; i < activeCount; i++) {
      const flake = this.flakes[i];

      // Vertical Fall & Horizontal Sway
      flake.y += flake.fallSpeed * (snowIntensity * 0.5 + 0.8) * (dt * 60);
      const sway = Math.sin(time * flake.swaySpeed + flake.swayPhase) * flake.swayAmplitude;
      flake.x += (sway + windDrift) * (dt * 60);

      // Wrap around
      if (flake.y > 1.05) {
        flake.y = -0.05;
        flake.x = Math.random();
      }
      if (flake.x > 1.05) flake.x = -0.05;
      if (flake.x < -0.05) flake.x = 1.05;

      const screenX = flake.x * width;
      const screenY = flake.y * height;

      // Cursor Air Turbulence (snowflakes float gracefully around cursor)
      const dx = screenX - cursor.x;
      const dy = screenY - cursor.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const airRadius = 180;

      let swirlX = 0;
      let swirlY = 0;
      if (dist < airRadius && dist > 0) {
        const force = (1 - dist / airRadius) * 22 * (flake.depth === 2 ? 1 : 0.5);
        swirlX = (dx / dist) * force + (cursor.vx * 0.02);
        swirlY = (dy / dist) * force * 0.6;
      }

      const finalX = screenX + swirlX;
      const finalY = screenY + swirlY;

      // Soft Bokeh styling for foreground snowflakes
      if (flake.depth === 2) {
        const grad = ctx.createRadialGradient(finalX, finalY, 0, finalX, finalY, flake.radius * 2);
        grad.addColorStop(0, `rgba(255, 255, 255, ${flake.alpha})`);
        grad.addColorStop(0.6, `rgba(240, 249, 255, ${(flake.alpha * 0.4).toFixed(2)})`);
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(finalX, finalY, flake.radius * 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = palette.particleColor;
        ctx.beginPath();
        ctx.arc(finalX, finalY, flake.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }
}
