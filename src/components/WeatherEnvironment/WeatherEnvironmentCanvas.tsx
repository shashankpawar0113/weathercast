import React, { useRef, useEffect } from 'react';
import { useWeather } from '../../context/WeatherContext';
import { WeatherEnvState } from './types';
import { mapWeatherToEnvironment } from './weatherConditionMapper';
import { CursorPhysicsManager } from './cursorPhysics';
import { SkyRenderer } from './renderers/skyRenderer';
import { CloudRenderer } from './renderers/cloudRenderer';
import { RainRenderer } from './renderers/rainRenderer';
import { SnowRenderer } from './renderers/snowRenderer';
import { ThunderstormRenderer } from './renderers/thunderstormRenderer';
import { MistFogRenderer } from './renderers/mistFogRenderer';

export const WeatherEnvironmentCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { weatherData, theme } = useWeather();

  const isDark = theme === 'dark';
  const currentStateRef = useRef<WeatherEnvState>(mapWeatherToEnvironment(weatherData, isDark));
  const targetStateRef = useRef<WeatherEnvState>(mapWeatherToEnvironment(weatherData, isDark));
  const transitionProgressRef = useRef<number>(1.0); // 1.0 = fully transitioned

  // When weatherData or theme changes, update target state and initiate smooth transition
  useEffect(() => {
    const nextState = mapWeatherToEnvironment(weatherData, isDark);
    targetStateRef.current = nextState;
    transitionProgressRef.current = 0.0;
  }, [weatherData, isDark]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Initialize cursor physics and renderers
    const cursorManager = new CursorPhysicsManager();
    const skyRenderer = new SkyRenderer();
    const cloudRenderer = new CloudRenderer();
    const rainRenderer = new RainRenderer();
    const snowRenderer = new SnowRenderer();
    const thunderRenderer = new ThunderstormRenderer();
    const mistRenderer = new MistFogRenderer();

    let animationFrameId: number;
    let lastTime = performance.now();
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Resize handling with DPR clamp (max 1.5 for 60fps performance)
    const handleResize = () => {
      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });

    // Main animation render loop
    const renderLoop = (now: number) => {
      const dt = Math.min(0.06, (now - lastTime) / 1000);
      lastTime = now;

      // Only render if tab is visible
      if (document.hidden) {
        animationFrameId = requestAnimationFrame(renderLoop);
        return;
      }

      // Smooth state transition lerp (1.2 - 1.8s duration)
      if (transitionProgressRef.current < 1.0) {
        transitionProgressRef.current = Math.min(1.0, transitionProgressRef.current + dt * 0.85);
        const p = transitionProgressRef.current;
        const cur = currentStateRef.current;
        const tgt = targetStateRef.current;

        currentStateRef.current = {
          ...tgt,
          palette: tgt.palette,
          windSpeed: cur.windSpeed + (tgt.windSpeed - cur.windSpeed) * p,
          cloudCover: cur.cloudCover + (tgt.cloudCover - cur.cloudCover) * p,
          rainIntensity: cur.rainIntensity + (tgt.rainIntensity - cur.rainIntensity) * p,
          snowIntensity: cur.snowIntensity + (tgt.snowIntensity - cur.snowIntensity) * p,
          fogDensity: cur.fogDensity + (tgt.fogDensity - cur.fogDensity) * p,
          sunRayIntensity: cur.sunRayIntensity + (tgt.sunRayIntensity - cur.sunRayIntensity) * p,
        };
      } else {
        currentStateRef.current = targetStateRef.current;
      }

      const activeState = currentStateRef.current;
      const cursor = cursorManager.update();
      const time = prefersReducedMotion ? 0 : now * 0.001;

      // 1. Render Sky & Atmospheric Sunlight / Night Shooting Stars
      skyRenderer.render(ctx, width, height, activeState, cursor, time, dt);

      if (!prefersReducedMotion) {
        // 2. Render Layered Volumetric Clouds
        cloudRenderer.render(ctx, width, height, activeState, cursor, time);

        // 3. Render Mist / Fog Banks
        mistRenderer.render(ctx, width, height, activeState, cursor, time);

        // 4. Render Procedural Rain
        rainRenderer.render(ctx, width, height, activeState, cursor, dt);

        // 5. Render Procedural Snow
        snowRenderer.render(ctx, width, height, activeState, cursor, time, dt);

        // 6. Render Thunderstorm & Lightning Flash
        thunderRenderer.render(ctx, width, height, activeState, cursor, dt);
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      cursorManager.destroy();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none -z-10 transition-opacity duration-1000"
      style={{ display: 'block' }}
    />
  );
};
