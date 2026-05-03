import { useState } from 'react';

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch { return initialValue; }
  });

  const set = (val) => {
    const toStore = val instanceof Function ? val(value) : val;
    setValue(toStore);
    try { localStorage.setItem(key, JSON.stringify(toStore)); } catch {}
  };

  return [value, set];
}
