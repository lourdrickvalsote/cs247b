import { useRef, useState, useCallback, type RefObject, type PointerEvent as ReactPointerEvent, type MouseEvent as ReactMouseEvent } from 'react';

interface DragScrollResult<T extends HTMLElement> {
  ref: RefObject<T | null>;
  onPointerDown: (e: ReactPointerEvent<T>) => void;
  onPointerMove: (e: ReactPointerEvent<T>) => void;
  onPointerUp: (e: ReactPointerEvent<T>) => void;
  onClickCapture: (e: ReactMouseEvent<T>) => void;
}

export function useDragScroll<T extends HTMLElement>(): DragScrollResult<T> {
  const ref = useRef<T | null>(null);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const scrollStart = useRef(0);
  const moved = useRef(false);

  const onPointerDown = useCallback((e: ReactPointerEvent<T>) => {
    const el = ref.current;
    if (!el) return;
    el.setPointerCapture(e.pointerId);
    startX.current = e.clientX;
    scrollStart.current = el.scrollLeft;
    moved.current = false;
    setDragging(true);
  }, []);

  const onPointerMove = useCallback((e: ReactPointerEvent<T>) => {
    if (!dragging) return;
    const el = ref.current;
    if (!el) return;
    const dx = e.clientX - startX.current;
    if (Math.abs(dx) > 3) moved.current = true;
    el.scrollLeft = scrollStart.current - dx;
  }, [dragging]);

  const onPointerUp = useCallback((e: ReactPointerEvent<T>) => {
    const el = ref.current;
    if (el) el.releasePointerCapture(e.pointerId);
    setDragging(false);
  }, []);

  const onClickCapture = useCallback((e: ReactMouseEvent<T>) => {
    if (moved.current) {
      e.stopPropagation();
      e.preventDefault();
      moved.current = false;
    }
  }, []);

  return { ref, onPointerDown, onPointerMove, onPointerUp, onClickCapture };
}
