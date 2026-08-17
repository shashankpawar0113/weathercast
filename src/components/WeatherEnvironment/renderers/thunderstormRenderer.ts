import { WeatherEnvState, CursorState } from '../types';

interface LightningBranch {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export class ThunderstormRenderer {
  private nextFlashTime = 3;
  private flashProgress = 0;
  private isFlashing = false;
  private flashIntensity = 0;
  private branches: LightningBranch[] = [];

  constructor() {
    this.scheduleNextFlash();
  }

  private scheduleNextFlash() {
    // Randomized interval between 4.5 and 11 seconds
    this.nextFlashTime = performance.now() / 1000 + (4.5 + Math.random() * 6.5);
  }

  private triggerLightning(width: number, height: number) {
    this.isFlashing = true;
    this.flashProgress = 0;
    this.generateLightningBolt(width, height);
  }

  private generateLightningBolt(width: number, height: number) {
    this.branches = [];
    let curX = width * (0.2 + Math.random() * 0.6);
    let curY = height * 0.05;
    const targetY = height * (0.65 + Math.random() * 0.25);

    while (curY < targetY) {
      const nextX = curX + (Math.random() - 0.5) * 60;
      const nextY = curY + 25 + Math.random() * 35;
      this.branches.push({ startX: curX, startY: curY, endX: nextX, endY: nextY });

      // Occasional sub-branch
      if (Math.random() < 0.4) {
        const subEndX = nextX + (Math.random() - 0.5) * 80;
        const subEndY = nextY + 30 + Math.random() * 40;
        this.branches.push({ startX: nextX, startY: nextY, endX: subEndX, endY: subEndY });
      }

      curX = nextX;
      curY = nextY;
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
    if (state.type !== 'thunderstorm') return;

    const now = performance.now() / 1000;

    // Check if it's time to trigger lightning
    if (!this.isFlashing && now >= this.nextFlashTime) {
      this.triggerLightning(width, height);
    }

    if (this.isFlashing) {
      this.flashProgress += dt * 3.2;

      // Multi-stage realistic lightning flash curve
      // Phase 1 (0-0.2): Initial cloud strike flash
      // Phase 2 (0.2-0.45): Primary bolt discharge
      // Phase 3 (0.45-0.7): Secondary return stroke
      // Phase 4 (0.7-1.0): Diffuse ambient sky glow & rapid fade
      if (this.flashProgress < 0.2) {
        this.flashIntensity = Math.sin((this.flashProgress / 0.2) * Math.PI) * 0.7;
      } else if (this.flashProgress < 0.45) {
        this.flashIntensity = 0.95;
      } else if (this.flashProgress < 0.7) {
        this.flashIntensity = 0.85 * (1 - (this.flashProgress - 0.45) / 0.25);
      } else if (this.flashProgress < 1.0) {
        this.flashIntensity = 0.45 * (1 - (this.flashProgress - 0.7) / 0.3);
      } else {
        this.isFlashing = false;
        this.flashIntensity = 0;
        this.scheduleNextFlash();
      }

      if (this.flashIntensity > 0.05) {
        ctx.save();

        // 1. Ambient Sky Flash Glow
        const flashGrad = ctx.createRadialGradient(
          width * 0.5 + cursor.normalizedX * 40,
          height * 0.2,
          50,
          width * 0.5,
          height * 0.2,
          Math.max(width, height) * 0.9
        );
        flashGrad.addColorStop(0, `rgba(224, 231, 255, ${(this.flashIntensity * 0.55).toFixed(2)})`);
        flashGrad.addColorStop(0.4, `rgba(165, 180, 252, ${(this.flashIntensity * 0.35).toFixed(2)})`);
        flashGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = flashGrad;
        ctx.fillRect(0, 0, width, height);

        // 2. Render Procedural Lightning Fork / Bolt (during primary stroke)
        if (this.flashProgress >= 0.15 && this.flashProgress <= 0.6) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${(this.flashIntensity).toFixed(2)})`;
          ctx.lineWidth = 3;
          ctx.shadowColor = '#818cf8';
          ctx.shadowBlur = 20;

          ctx.beginPath();
          for (const branch of this.branches) {
            ctx.moveTo(branch.startX, branch.startY);
            ctx.lineTo(branch.endX, branch.endY);
          }
          ctx.stroke();

          // Inner white core
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        ctx.restore();
      }
    }
  }
}
