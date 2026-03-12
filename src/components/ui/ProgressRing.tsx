import { useMemo } from 'react';

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  trackColor?: string;
  fillColor?: string;
  glowing?: boolean;
  showDot?: boolean;
  children?: React.ReactNode;
  ariaLabel?: string;
}

export default function ProgressRing({
  progress,
  size = 240,
  strokeWidth = 8,
  trackColor,
  fillColor = '#2E6F40',
  glowing = false,
  showDot = true,
  children,
  ariaLabel,
}: ProgressRingProps) {
  const resolvedTrackColor = trackColor ?? 'var(--ring-track, #dae1eb)';
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const offset = circumference - clampedProgress * circumference;

  const dotPosition = useMemo(() => {
    const angle = clampedProgress * 2 * Math.PI - Math.PI / 2;
    return {
      cx: size / 2 + radius * Math.cos(angle),
      cy: size / 2 + radius * Math.sin(angle),
    };
  }, [clampedProgress, size, radius]);

  const glowId = `glow-${size}`;

  return (
    <div
      className="relative inline-flex items-center justify-center gpu"
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={Math.round(clampedProgress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel ?? `${Math.round(clampedProgress * 100)}% complete`}
    >
      <svg
        width={size}
        height={size}
        className={`transform -rotate-90 ${
          glowing ? 'ring-glow' : 'ring-glow-off'
        }`}
        style={
          glowing
            ? ({ '--glow-color': `${fillColor}44` } as React.CSSProperties)
            : undefined
        }
      >
        <defs>
          <filter id={glowId}>
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={resolvedTrackColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={fillColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="timer-ring"
          filter={glowing ? `url(#${glowId})` : undefined}
        />

        {showDot && clampedProgress > 0.01 && clampedProgress < 0.99 && (
          <circle
            cx={dotPosition.cx}
            cy={dotPosition.cy}
            r={strokeWidth * 0.6}
            fill="white"
            stroke={fillColor}
            strokeWidth={1.5}
            className="transition-all duration-1000 linear"
            opacity={glowing ? 1 : 0.6}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
