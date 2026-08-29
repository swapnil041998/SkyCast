import { useCallback, useState } from "react";

/**
 * useState synced to localStorage. Values are stored as JSON.
 * Safe against private-mode / quota errors.
 */
export function useLocalStorage<T>(
  key: string,
  initial: T | (() => T)
): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) return JSON.parse(raw) as T;
    } catch {
      /* fall through to initial */
    }
    return typeof initial === "function" ? (initial as () => T)() : initial;
  });

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved =
          typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          /* storage unavailable — keep in-memory state */
        }
        return resolved;
      });
    },
    [key]
  );

  return [value, set];
}
