import { CursorState } from './types';

export class CursorPhysicsManager {
  private state: CursorState = {
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
    y: typeof window !== 'undefined' ? window.innerHeight / 3 : 0,
    targetX: typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
    targetY: typeof window !== 'undefined' ? window.innerHeight / 3 : 0,
    vx: 0,
    vy: 0,
    normalizedX: 0,
    normalizedY: 0,
    isInside: false,
  };

  private lastTime = performance.now();
  private smoothing = 0.08;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', this.handleMouseMove, { passive: true });
      window.addEventListener('mouseleave', this.handleMouseLeave, { passive: true });
      window.addEventListener('mouseenter', this.handleMouseEnter, { passive: true });
    }
  }

  public destroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('mousemove', this.handleMouseMove);
      window.removeEventListener('mouseleave', this.handleMouseLeave);
      window.removeEventListener('mouseenter', this.handleMouseEnter);
    }
  }

  private handleMouseMove = (e: MouseEvent) => {
    this.state.targetX = e.clientX;
    this.state.targetY = e.clientY;
    this.state.isInside = true;
  };

  private handleMouseLeave = () => {
    this.state.isInside = false;
  };

  private handleMouseEnter = (e: MouseEvent) => {
    this.state.targetX = e.clientX;
    this.state.targetY = e.clientY;
    this.state.isInside = true;
  };

  /**
   * Updates cursor position using exponential smoothing (lerp)
   */
  public update(): CursorState {
    const now = performance.now();
    const dt = Math.min(0.1, (now - this.lastTime) / 1000);
    this.lastTime = now;

    // If mouse left screen, gently return towards center
    if (!this.state.isInside && typeof window !== 'undefined') {
      this.state.targetX = window.innerWidth / 2;
      this.state.targetY = window.innerHeight / 3;
    }

    const prevX = this.state.x;
    const prevY = this.state.y;

    // Exponential smoothing
    this.state.x += (this.state.targetX - this.state.x) * this.smoothing;
    this.state.y += (this.state.targetY - this.state.y) * this.smoothing;

    if (dt > 0) {
      this.state.vx = (this.state.x - prevX) / dt;
      this.state.vy = (this.state.y - prevY) / dt;
    }

    if (typeof window !== 'undefined') {
      this.state.normalizedX = (this.state.x / window.innerWidth) * 2 - 1;
      this.state.normalizedY = (this.state.y / window.innerHeight) * 2 - 1;
    }

    return this.state;
  }

  public getState(): CursorState {
    return this.state;
  }
}
