import { useRef, useEffect, useCallback } from 'react';

function useCheckRef(width: string, height: string) {
  const checkRef = useRef<HTMLElement | null>(null);

  const updateRefStyles = useCallback(() => {
    const ref = checkRef.current;
    if (ref && width !== null && height !== null) {
      requestAnimationFrame(() => {
        ref.style.width = width;
        ref.style.height = height;
        ref.style.willChange = 'transform';
      });
    }
  }, [width, height]);

  useEffect(() => {
    updateRefStyles();
    return () => {
      const ref = checkRef.current;
      if (ref) {
        ref.style.width = '';
        ref.style.height = '';
        ref.style.willChange = '';
      }
    };
  }, [updateRefStyles]);

  return checkRef;
}

export default useCheckRef;
