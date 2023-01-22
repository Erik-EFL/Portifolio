import { useRef, useEffect, useCallback } from 'react';

function useCheckRef(width, height) {
  const checkRef = useRef(null);

  const handleCheckRef = useCallback(() => {
    if (checkRef.current) {
      checkRef.current.style.width = width;
      checkRef.current.style.height = height;
      checkRef.current.style.willChange = 'transform';
    }
  }, [width, height]);

  useEffect(() => {
    handleCheckRef();
  }, [handleCheckRef]);

  return checkRef;
}

export default useCheckRef;
