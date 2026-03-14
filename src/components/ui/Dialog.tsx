import { useMemo, type HTMLAttributes } from 'react';
import { createPortal } from 'react-dom';

import { ANIMATION_DURATION } from '@/constants/misc';
import { cn } from '@/utils/misc';

interface DialogProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  isOpen: boolean;
  onHide: () => void;
  shouldRender?: boolean;
  overlayClassName?: string;
  contentClassName?: string;
}

const Dialog = ({
  title,
  isOpen,
  onHide,
  shouldRender = true,
  overlayClassName,
  contentClassName,
  className,
  style,
  children,
  ...props
}: DialogProps) => {
  const popupContent = useMemo(
    () => (
      <div
        className={cn(
          'fixed inset-0 z-[50] flex h-full w-full items-center justify-center bg-black/50 p-8 backdrop-blur-sm transition-opacity duration-300',
          isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
          overlayClassName
        )}
        style={{
          transition: `opacity ${ANIMATION_DURATION}ms`,
          ...style
        }}
      >
        <div
          className={cn(
            'relative z-[100] flex h-auto w-full max-w-xl flex-col rounded-md bg-white text-black transition-all',

            className
          )}
          {...props}
        >
          <div className="flex justify-between gap-5 p-4 sm:p-5">
            <p className="text-xl font-medium">{title}</p>

            <div>
              <span
                className={cn(
                  'cursor-pointer rounded-md bg-indigo-600 px-2.5 py-1.5 text-lg text-white backdrop-blur-sm hover:bg-indigo-500'
                )}
                onClick={onHide}
              >
                ✕
              </span>
            </div>
          </div>

          <div className={cn('p-4 pt-0 sm:p-5 sm:pt-0', contentClassName)}>{children}</div>
        </div>
      </div>
    ),
    [children, className, contentClassName, isOpen, onHide, overlayClassName, props, style, title]
  );

  if (!shouldRender) return null;

  return createPortal(popupContent, document.body, title);
};

export default Dialog;
