import React, { useRef, useState, useCallback } from 'react';

interface ReactiveCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  spotlightColor?: string;
  scale?: number;
  overflowVisible?: boolean;
}

export const ReactiveCard: React.FC<ReactiveCardProps> = ({
  children,
  className = '',
  maxTilt = 5,
  spotlightColor = 'rgba(56, 189, 248, 0.15)',
  scale = 1.015,
  overflowVisible = false,
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transformStyle, setTransformStyle] = useState<string>('');
  const [spotlightPos, setSpotlightPos] = useState<{ x: number; y: number; opacity: number }>({
    x: 0,
    y: 0,
    opacity: 0,
  });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate tilt angles based on mouse offset from center
      const rotateX = ((centerY - y) / centerY) * maxTilt;
      const rotateY = ((x - centerX) / centerX) * maxTilt;

      setTransformStyle(
        `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`
      );
      setSpotlightPos({ x, y, opacity: 1 });
    },
    [maxTilt, scale]
  );

  const handleMouseLeave = useCallback(() => {
    setTransformStyle('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setSpotlightPos(prev => ({ ...prev, opacity: 0 }));
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: transformStyle,
        transformStyle: 'preserve-3d',
        transition: transformStyle.includes('scale3d(1, 1, 1)')
          ? 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)'
          : 'transform 0.08s ease-out',
        willChange: 'transform',
      }}
      className={`relative ${overflowVisible ? 'overflow-visible' : 'overflow-hidden'} ${className}`}
      {...props}
    >
      {/* Interactive Cursor Spotlight Glow */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300 rounded-[inherit] z-20"
        style={{
          opacity: spotlightPos.opacity,
          background: `radial-gradient(350px circle at ${spotlightPos.x}px ${spotlightPos.y}px, ${spotlightColor}, transparent 65%)`,
        }}
      />

      {children}
    </div>
  );
};
