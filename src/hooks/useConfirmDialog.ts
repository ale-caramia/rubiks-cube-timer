import { useEffect, useRef, useState } from 'react';

export const useConfirmDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const actionRef = useRef<(() => void) | null>(null);

  const open = (nextTitle: string, nextMessage: string, onConfirm: () => void) => {
    setTitle(nextTitle);
    setMessage(nextMessage);
    actionRef.current = onConfirm;
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    actionRef.current = null;
  };

  const confirm = () => {
    actionRef.current?.();
    close();
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return { isOpen, title, message, open, close, confirm };
};
