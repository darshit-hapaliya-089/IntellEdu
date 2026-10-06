import { useEffect, useRef, useState } from 'react';

/**
 * Counts down once per second while `isActive` is true, calling `onExpire`
 * exactly once when it reaches zero.
 */
export function useCountdown(
  totalSeconds: number,
  onExpire: () => void,
  isActive: boolean
): number {
  const [secondsLeft, setSecondsLeft] = useState<number>(totalSeconds);
  const onExpireRef = useRef(onExpire);
  const firedRef = useRef(false);

  useEffect(() => {
    onExpireRef.current = onExpire;
  });

  useEffect(() => {
    if (!isActive) return;
    const id = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [isActive]);

  useEffect(() => {
    if (isActive && secondsLeft === 0 && !firedRef.current) {
      firedRef.current = true;
      onExpireRef.current();
    }
  }, [secondsLeft, isActive]);

  return secondsLeft;
}

export default useCountdown;
