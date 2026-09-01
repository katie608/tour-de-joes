import { useEffect, useRef } from "react";

/** Repeatedly calls `callback` every `delayMs` milliseconds. */
export function useInterval(callback: () => void, delayMs: number) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const id = setInterval(() => callbackRef.current(), delayMs);
    return () => clearInterval(id);
  }, [delayMs]);
}
