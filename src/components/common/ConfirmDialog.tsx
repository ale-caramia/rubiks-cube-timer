import React from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm border-4 border-black bg-linear-to-br from-white to-yellow-100 p-6 shadow-[10px_10px_0px_0px_rgba(17,17,17,1)] neo-entrance"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-black uppercase mb-3">{title}</h3>
        <p className="text-sm font-bold mb-6">{message}</p>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 min-h-11 border-4 border-black font-bold uppercase bg-white hover:bg-gray-100 shadow-[3px_3px_0px_0px_rgba(17,17,17,1)]"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 min-h-11 border-4 border-black font-bold uppercase bg-red-300 hover:bg-red-400 shadow-[3px_3px_0px_0px_rgba(17,17,17,1)]"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
