import { useState, useEffect, useRef } from 'react';

interface AnimatedCounterProps {
  value: string;
  duration?: number;
  className?: string;
}

export default function AnimatedCounter({
  value,
  duration = 600,
  className = '',
}: AnimatedCounterProps) {
  const [display, setDisplay] = useState(value);
  const rafRef = useRef<number>(0);
  const prevValue = useRef(value);

  useEffect(() => {
    const numericMatch = value.match(/^(\d+)/);
    const prevNumericMatch = prevValue.current.match(/^(\d+)/);

    if (!numericMatch || !prevNumericMatch) {
      setDisplay(value);
      prevValue.current = value;
      return;
    }

    const target = parseInt(numericMatch[1], 10);
    const start = parseInt(prevNumericMatch[1], 10);
    const suffix = value.slice(numericMatch[1].length);

    if (target === start) {
      setDisplay(value);
      prevValue.current = value;
      return;
    }

    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (target - start) * eased);

      setDisplay(`${current}${suffix}`);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    prevValue.current = value;

    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  return <span className={className}>{display}</span>;
}
