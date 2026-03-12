import { memo, useState, useEffect, useRef } from 'react';

interface AnimatedDigitsProps {
  value: number;
  running?: boolean;
  className?: string;
}

const Digit = memo(function Digit({ char, animating }: { char: string; animating: boolean }) {
  const [display, setDisplay] = useState(char);
  const [prev, setPrev] = useState(char);
  const [flip, setFlip] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (char !== display && animating) {
      setPrev(display);
      setFlip(true);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setDisplay(char);
        setFlip(false);
      }, 200);
    } else if (char !== display) {
      setDisplay(char);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [char, animating]);

  if (char === ':') {
    return (
      <span
        className={`inline-block w-[0.4em] text-center ${
          animating ? 'animate-colon-pulse' : ''
        }`}
      >
        :
      </span>
    );
  }

  return (
    <span className="inline-block relative overflow-hidden w-[0.6em] text-center">
      {flip ? (
        <>
          <span className="inline-block animate-digit-out">{prev}</span>
          <span className="absolute inset-0 inline-block animate-digit-in">
            {char}
          </span>
        </>
      ) : (
        <span className="inline-block">{display}</span>
      )}
    </span>
  );
});

export default function AnimatedDigits({
  value,
  running = false,
  className = '',
}: AnimatedDigitsProps) {
  const mins = Math.floor(value / 60);
  const secs = value % 60;
  const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  return (
    <span className={`inline-flex tabular-nums ${className}`}>
      {timeStr.split('').map((ch, i) => (
        <Digit key={i} char={ch} animating={running} />
      ))}
    </span>
  );
}
