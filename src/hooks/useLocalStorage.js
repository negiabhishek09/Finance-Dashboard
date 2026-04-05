import { useState, useCallback } from "react";

/**
 * useLocalStorage — Persists state to localStorage with JSON serialization.
 *
 * @param {string} key     - The localStorage key.
 * @param {*}      initial - Fallback value when the key doesn't exist yet.
 * @returns {[*, Function]} - [storedValue, setter] — same API as useState.
 *
 * The setter accepts either a new value or an updater function (like setState).
 */
export function useLocalStorage(key, initial) {
  const [val, setVal] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initial;
    } catch {
      return initial;
    }
  });

  const set = useCallback(
    (v) => {
      const next = typeof v === "function" ? v(val) : v;
      setVal(next);
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // localStorage may be unavailable (private browsing, quota exceeded)
      }
    },
    [key, val]
  );

  return [val, set];
}