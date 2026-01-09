import { useEffect, useRef } from "react";

export function useEffectOnceWhenReady(
  effect: () => any,
  deps: any[],
  testers: (undefined | ((m: any) => boolean))[]
) {
  const hasRun = useRef(false);

  useEffect(() => {
    const allReady = deps.every(
      (d, i) => d !== undefined && d !== null && (!testers[i] || testers[i](d))
    );
    if (!allReady || hasRun.current) return;
    hasRun.current = true;

    return effect();
  }, deps);
}
