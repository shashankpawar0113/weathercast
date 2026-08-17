import { WeatherEnvState, CursorState } from '../types';

interface CloudPuff {
  offsetX: number;
  offsetY: number;
  radius: number;
  opacity: number;
}

interface CloudCluster {
  x: number; // 0 to 1
  y: number; // 0 to 1
  scale: number;
  depthLayer: 0 | 1 | 2; // 0: Far, 1: Mid, 2: Near
  puffs: CloudPuff[];
  speedFactor: number;
}

export class CloudRenderer {
  private clouds: CloudCluster[] = [];

  constructor() {
    this.generateClouds(12);
  }

  private generateClouds(count: number) {
    this.clouds = [];
    for (let i = 0; i < count; i++) {
      const depthLayer = (i % 3) as 0 | 1 | 2;
      const puffCount = 5 + Math.floor(Math.random() * 4);
      const puffs: CloudPuff[] = [];

      // Generate soft cluster of overlapping rounded puffs
      for (let p = 0; p < puffCount; p++) {
        puffs.push({
          offsetX: (Math.random() - 0.5) * 160,
          offsetY: (Math.random() - 0.5) * 60,
          radius: 60 + Math.random() * 70,
          opacity: 0.25 + Math.random() * 0.45,
        });
      }

      this.clouds.push({
        x: Math.random() * 1.5 - 0.25,
        y: 0.05 + Math.random() * 0.55,
        scale: 0.6 + depthLayer * 0.35 + Math.random() * 0.2,
        depthLayer,
        puffs,
        speedFactor: 0.00008 * (depthLayer + 1),
      });
    }
  }

  public render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    state: WeatherEnvState,
    cursor: CursorState,
    time: number
  ) {
    if (state.cloudCover < 15) return;

    const { palette, windSpeed, cloudCover } = state;
    const globalCloudAlpha = Math.min(1, cloudCover / 70);

    ctx.save();

    for (const cloud of this.clouds) {
      // 1. Move cloud horizontally with wind velocity
      const drift = time * cloud.speedFactor * (windSpeed * 1.5 + 0.5);
      const currentX = ((cloud.x + drift) % 1.4) - 0.2; // wraps seamlessly

      // 2. Parallax and Cursor Air Displacement
      const depthMultiplier = (cloud.depthLayer + 1) * 0.015;
      const parallaxX = cursor.normalizedX * width * depthMultiplier;
      const parallaxY = cursor.normalizedY * height * depthMultiplier * 0.5;

      const screenX = currentX * width + parallaxX;
      const screenY = cloud.y * height + parallaxY;

      // Cursor proximity air disturbance
      const dx = screenX - cursor.x;
      const dy = screenY - cursor.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = 260;

      let pushX = 0;
      let pushY = 0;
      if (dist < maxDist && dist > 0) {
        const force = (1 - dist / maxDist) * 30 * (cloud.depthLayer === 2 ? 1 : 0.4);
        pushX = (dx / dist) * force;
        pushY = (dy / dist) * force;
      }

      const finalX = screenX + pushX;
      const finalY = screenY + pushY;

      // Render individual puffs with soft multi-radial gradient
      for (const puff of cloud.puffs) {
        const px = finalX + puff.offsetX * cloud.scale;
        const py = finalY + puff.offsetY * cloud.scale;
        const r = puff.radius * cloud.scale;

        const grad = ctx.createRadialGradient(
          px - r * 0.2,
          py - r * 0.3,
          r * 0.1,
          px,
          py,
          r
        );

        ctx.globalAlpha = puff.opacity * globalCloudAlpha;
        grad.addColorStop(0, palette.cloudHighlight);
        grad.addColorStop(0.55, palette.cloudBase);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }
    }

    ctx.restore();
  }
}
