import { useEffect, useState } from 'react';

function usePersistedState(key: string, initialState: any) {
  const storage = typeof window !== 'undefined' ? window.localStorage : null;

  const handleStorageOperation = (action: 'get' | 'set', key: string, data: any) => {
    try {
      if (action === 'get') {
        const storageValue = storage?.getItem(key) || null;
        return storageValue !== null ? JSON.parse(storageValue) : data;
      } else if (action === 'set') {
        storage?.setItem(key, JSON.stringify(data));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const [state, setState] = useState(() => handleStorageOperation('get', key, initialState));

  useEffect(() => {
    handleStorageOperation('set', key, state);
  }, [key, state]);

  return [state, setState]
}

export default usePersistedState
