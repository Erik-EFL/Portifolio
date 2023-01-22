import { useEffect, useState } from 'react'

function usePersistedState(key, initialState) {
  const storage = typeof window !== 'undefined' ? window.localStorage : {}
  const [state, setState] = useState(() => {
    try {
      const storageValue = storage.getItem(key);
      return storageValue !== null ? JSON.parse(storageValue) : initialState;
    } catch (e) {
      return initialState;
    }
  });

  useEffect(() => {
    try {
      storage.setItem(key, JSON.stringify(state));
    } catch (e) {
      console.error(e);
    }
  }, [key, state]);

  return [state, setState]
}

export default usePersistedState
