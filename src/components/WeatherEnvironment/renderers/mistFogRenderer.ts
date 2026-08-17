import { WeatherEnvState, CursorState } from '../types';

interface FogLayer {
  yOffset: number;
  heightRatio: number;
  speed: number;
  opacity: number;
  waveFrequency: number;
  phase: number;
}

export class MistFogRenderer {
  private layers: FogLayer[] = [
    { yOffset: 0.25, heightRatio: 0.45, speed: 0.00006, opacity: 0.35, waveFrequency: 0.0015, phase: 0 },
    { yOffset: 0.5, heightRatio: 0.5, speed: 0.00009, opacity: 0.45, waveFrequency: 0.002, phase: 2.1 },
    { yOffset: 0.7, heightRatio: 0.4, speed: 0.00012, opacity: 0.3, waveFrequency: 0.0025, phase: 4.3 },
  ];

  public render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    state: WeatherEnvState,
    cursor: CursorState,
    time: number
  ) {
    if (state.fogDensity < 0.1 && state.type !== 'mist' && state.type !== 'fog') return;

    const { fogDensity, windSpeed, palette } = state;
    const density = Math.max(0.3, fogDensity);

    ctx.save();

    for (let i = 0; i < this.layers.length; i++) {
      const layer = this.layers[i];
      const drift = time * layer.speed * (windSpeed + 0.5);
      const layerY = height * layer.yOffset + cursor.normalizedY * 15;
      const layerHeight = height * layer.heightRatio;

      const grad = ctx.createLinearGradient(0, layerY - layerHeight * 0.5, 0, layerY + layerHeight * 0.5);
      ctx.globalAlpha = layer.opacity * density;

      grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      grad.addColorStop(0.5, palette.cloudBase);
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = grad;

      // Draw undulating fog ribbon across canvas
      ctx.beginPath();
      ctx.moveTo(0, layerY);

      const segmentWidth = 60;
      const segments = Math.ceil(width / segmentWidth);

      for (let s = 0; s <= segments; s++) {
        const x = s * segmentWidth;
        const wave = Math.sin(x * layer.waveFrequency + drift + layer.phase) * 35;

        // Subtle cursor disturbance
        const dx = x - cursor.x;
        const dy = layerY - cursor.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        let cursorDisp = 0;
        if (dist < 220 && dist > 0) {
          cursorDisp = (1 - dist / 220) * (dy > 0 ? 25 : -25);
        }

        const y = layerY + wave + cursorDisp;
        ctx.lineTo(x, y);
      }

      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }
}
