import { useEffect, useState } from 'react';

import { ANIMATION_DURATION } from '@/constants/misc';

export interface UseAnimatePresenceProps {
  isVisible: boolean;
}

const useAnimatePresence = ({ isVisible }: UseAnimatePresenceProps) => {
  const [shouldRender, setShouldRender] = useState(false);
  const [showElement, setShowElement] = useState(false);

  useEffect(() => {
    let openTimer: NodeJS.Timeout | null = null;

    if (isVisible) {
      setShouldRender(true);

      // Defer to the next tick so the hidden state paints first, enabling CSS transition on open
      openTimer = setTimeout(() => {
        setShowElement(true);
      }, 20);
    } else {
      setShowElement(false);

      const timeout = setTimeout(() => {
        setShouldRender(false);
      }, ANIMATION_DURATION);

      return () => clearTimeout(timeout);
    }

    return () => {
      if (openTimer) clearTimeout(openTimer);
    };
  }, [isVisible]);

  return {
    shouldRender,
    showElement
  };
};

export default useAnimatePresence;
