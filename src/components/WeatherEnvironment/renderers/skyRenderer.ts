import { WeatherEnvState, CursorState } from '../types';

interface Star {
  x: number;
  y: number;
  size: number;
  brightness: number;
  twinkleSpeed: number;
  phase: number;
}

interface DustMote {
  x: number;
  y: number;
  size: number;
  alpha: number;
  vx: number;
  vy: number;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  opacity: number;
  maxLife: number;
  life: number;
  thickness: number;
}

export class SkyRenderer {
  private stars: Star[] = [];
  private dustMotes: DustMote[] = [];
  private shootingStars: ShootingStar[] = [];
  private nextShootingStarTime = 2.5;

  constructor() {
    this.initStars(120);
    this.initDustMotes(45);
    this.scheduleNextShootingStar();
  }

  private scheduleNextShootingStar() {
    this.nextShootingStarTime = performance.now() / 1000 + (2.5 + Math.random() * 4.5);
  }

  private triggerShootingStar(width: number, height: number) {
    const angle = Math.PI * (0.18 + Math.random() * 0.12); // ~35-50 degrees diagonal
    this.shootingStars.push({
      x: Math.random() * width * 0.75,
      y: Math.random() * height * 0.35,
      length: 90 + Math.random() * 110,
      speed: 750 + Math.random() * 600,
      angle,
      opacity: 0.9 + Math.random() * 0.1,
      maxLife: 0.65 + Math.random() * 0.5,
      life: 0,
      thickness: 1.5 + Math.random() * 1.2,
    });
    this.scheduleNextShootingStar();
  }

  private initStars(count: number) {
    this.stars = [];
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random(),
        y: Math.random() * 0.8,
        size: Math.random() * 1.5 + 0.5,
        brightness: Math.random() * 0.7 + 0.3,
        twinkleSpeed: Math.random() * 2 + 1,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  private initDustMotes(count: number) {
    this.dustMotes = [];
    for (let i = 0; i < count; i++) {
      this.dustMotes.push({
        x: Math.random(),
        y: Math.random(),
        size: Math.random() * 2 + 1,
        alpha: Math.random() * 0.4 + 0.1,
        vx: (Math.random() - 0.5) * 0.0003,
        vy: (Math.random() - 0.5) * 0.0003 - 0.0001,
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
    dt: number = 0.016
  ) {
    const { palette, solarPhase, sunRayIntensity } = state;

    // 1. Base Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
    skyGrad.addColorStop(0, palette.top);
    skyGrad.addColorStop(0.55, palette.middle);
    skyGrad.addColorStop(1, palette.bottom);

    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Stars & Shooting Stars (if night or twilight with low clouds)
    if (solarPhase === 'night' && state.cloudCover < 85) {
      const starAlphaMultiplier = Math.max(0, 1 - state.cloudCover / 100);
      ctx.save();
      for (const star of this.stars) {
        const twinkle = Math.sin(time * star.twinkleSpeed + star.phase) * 0.3 + 0.7;
        const currentAlpha = star.brightness * twinkle * starAlphaMultiplier;

        ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha.toFixed(2)})`;
        ctx.beginPath();
        // Subtle parallax shift with cursor
        const starX = (star.x * width + cursor.normalizedX * 10) % width;
        const starY = (star.y * height + cursor.normalizedY * 8) % height;
        ctx.arc(starX, starY, star.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Check and spawn shooting stars
      const nowSec = performance.now() / 1000;
      if (nowSec >= this.nextShootingStarTime && this.shootingStars.length < 3) {
        this.triggerShootingStar(width, height);
      }

      // Render Active Shooting Stars
      this.renderShootingStars(ctx, dt, starAlphaMultiplier);
      ctx.restore();
    }

    // 3. Volumetric Atmospheric Sun Rays & Light Shafts (if Clear or Partly Cloudy daytime/sunset)
    if (sunRayIntensity > 0.1) {
      this.renderSunRays(ctx, width, height, state, cursor, time);
    }

    // 4. Soft Atmospheric Dust / Floating Light Motes
    if (solarPhase !== 'night' && state.type === 'clear') {
      this.renderDustMotes(ctx, width, height, cursor);
    }
  }

  private renderSunRays(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    state: WeatherEnvState,
    cursor: CursorState,
    time: number
  ) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    // Source of sunlight shifts smoothly with cursor parallax
    const sunSourceX = width * 0.75 + cursor.normalizedX * 60;
    const sunSourceY = height * 0.15 + cursor.normalizedY * 30;

    // Atmospheric bloom halo
    const bloomRadius = Math.max(width, height) * (0.4 + state.lightBloomIntensity * 0.3);
    const bloomGrad = ctx.createRadialGradient(
      sunSourceX,
      sunSourceY,
      10,
      sunSourceX,
      sunSourceY,
      bloomRadius
    );
    bloomGrad.addColorStop(0, state.palette.sunGlow);
    bloomGrad.addColorStop(0.35, state.palette.ambientLight);
    bloomGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = bloomGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle volumetric breathing shafts
    const rayCount = 7;
    const baseAngle = Math.PI * 0.65;

    for (let i = 0; i < rayCount; i++) {
      const rayOffset = (i - rayCount / 2) * 0.18;
      const breathing = Math.sin(time * 0.8 + i * 1.2) * 0.05;
      const cursorShift = cursor.normalizedX * 0.08;
      const angle = baseAngle + rayOffset + breathing + cursorShift;

      const rayLength = Math.max(width, height) * 1.2;

      const rayGrad = ctx.createRadialGradient(
        sunSourceX,
        sunSourceY,
        40,
        sunSourceX + Math.cos(angle) * rayLength * 0.5,
        sunSourceY + Math.sin(angle) * rayLength * 0.5,
        rayLength
      );

      const alpha = (0.06 + Math.sin(time * 0.5 + i) * 0.03) * state.sunRayIntensity;
      rayGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha.toFixed(3)})`);
      rayGrad.addColorStop(0.5, `rgba(254, 240, 138, ${(alpha * 0.6).toFixed(3)})`);
      rayGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = rayGrad;
      ctx.beginPath();
      ctx.moveTo(sunSourceX, sunSourceY);
      ctx.lineTo(
        sunSourceX + Math.cos(angle - 0.08) * rayLength,
        sunSourceY + Math.sin(angle - 0.08) * rayLength
      );
      ctx.lineTo(
        sunSourceX + Math.cos(angle + 0.08) * rayLength,
        sunSourceY + Math.sin(angle + 0.08) * rayLength
      );
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  private renderDustMotes(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    cursor: CursorState
  ) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    for (const mote of this.dustMotes) {
      // Update position with subtle brownian motion
      mote.x += mote.vx;
      mote.y += mote.vy;

      if (mote.x < 0) mote.x = 1;
      if (mote.x > 1) mote.x = 0;
      if (mote.y < 0) mote.y = 1;
      if (mote.y > 1) mote.y = 0;

      const px = mote.x * width + cursor.normalizedX * 25;
      const py = mote.y * height + cursor.normalizedY * 20;

      ctx.fillStyle = `rgba(255, 245, 220, ${mote.alpha.toFixed(2)})`;
      ctx.beginPath();
      ctx.arc(px, py, mote.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private renderShootingStars(
    ctx: CanvasRenderingContext2D,
    dt: number,
    starAlphaMultiplier: number
  ) {
    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const star = this.shootingStars[i];
      star.life += dt;

      if (star.life >= star.maxLife) {
        this.shootingStars.splice(i, 1);
        continue;
      }

      // Move along trajectory
      const moveDistance = star.speed * dt;
      star.x += Math.cos(star.angle) * moveDistance;
      star.y += Math.sin(star.angle) * moveDistance;

      const lifeProgress = star.life / star.maxLife;
      // Fade in quickly, then fade out
      let currentAlpha = star.opacity * starAlphaMultiplier;
      if (lifeProgress < 0.2) {
        currentAlpha *= lifeProgress / 0.2;
      } else {
        currentAlpha *= 1 - (lifeProgress - 0.2) / 0.8;
      }

      if (currentAlpha <= 0.01) continue;

      const tailX = star.x - Math.cos(star.angle) * star.length;
      const tailY = star.y - Math.sin(star.angle) * star.length;

      // Glowing Ion Trail
      const trailGrad = ctx.createLinearGradient(tailX, tailY, star.x, star.y);
      trailGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      trailGrad.addColorStop(0.65, `rgba(186, 230, 253, ${(currentAlpha * 0.5).toFixed(2)})`);
      trailGrad.addColorStop(1, `rgba(255, 255, 255, ${currentAlpha.toFixed(2)})`);

      ctx.strokeStyle = trailGrad;
      ctx.lineWidth = star.thickness;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(star.x, star.y);
      ctx.stroke();

      // Bright Head Glow
      ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha.toFixed(2)})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.thickness * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Subtle Outer Halo
      const headGlow = ctx.createRadialGradient(
        star.x,
        star.y,
        0,
        star.x,
        star.y,
        star.thickness * 6
      );
      headGlow.addColorStop(0, `rgba(224, 242, 254, ${(currentAlpha * 0.7).toFixed(2)})`);
      headGlow.addColorStop(1, 'rgba(224, 242, 254, 0)');
      ctx.fillStyle = headGlow;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.thickness * 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
