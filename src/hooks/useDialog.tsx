import { useState, useCallback } from 'react';

import useAnimatePresence from './useAnimatePresence';

interface BasePopupConfig {
  isVisible: boolean;
}

const useDialog = <T extends Record<string, unknown> = Record<string, unknown>>() => {
  const [config, setConfig] = useState<(BasePopupConfig & T) | null>(null);

  const show = useCallback((additionalConfig?: T) => {
    setConfig({
      isVisible: true,
      ...(additionalConfig || {})
    } as BasePopupConfig & T);
  }, []);

  const hide = useCallback(() => {
    if (config) {
      setConfig({
        ...config,
        isVisible: false
      });
    }
  }, [config]);

  const updateConfig = useCallback((newConfig: Partial<BasePopupConfig & T>) => {
    setConfig((prev) => (prev ? { ...prev, ...newConfig } : null));
  }, []);

  const { shouldRender, showElement } = useAnimatePresence({
    isVisible: config?.isVisible ?? false
  });

  return {
    dialogConfig: config,
    updateConfig,
    shouldRender,
    showDialog: show,
    hideDialog: hide,
    showElement
  };
};

export default useDialog;
