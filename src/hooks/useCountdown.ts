import { useEffect, useMemo, useState } from 'react';

export function useCountdown(expiresAt: string | null | undefined) {
  const target = useMemo(
    () => (expiresAt ? new Date(expiresAt).getTime() : null),
    [expiresAt],
  );
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (target === null) {
      return;
    }
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [target]);

  if (target === null) {
    return { secondsLeft: 0, expired: true };
  }

  const secondsLeft = Math.max(0, Math.ceil((target - now) / 1000));
  return { secondsLeft, expired: secondsLeft <= 0 };
}

export function useTicker(intervalMs = 1000): number {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(
      () => setTick((value) => value + 1),
      intervalMs,
    );
    return () => window.clearInterval(timer);
  }, [intervalMs]);

  return tick;
}
