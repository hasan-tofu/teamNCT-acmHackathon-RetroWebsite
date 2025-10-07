
import React, { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-retro-blue pixel-border border-retro-cyan border-4 w-full max-w-md animate-float">
        <div className="flex justify-between items-center p-4 bg-retro-purple border-b-4 border-retro-cyan">
          <h2 className="font-press-start text-lg text-retro-yellow">{title}</h2>
          <button onClick={onClose} className="font-press-start text-lg text-retro-pink hover:text-white">X</button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
