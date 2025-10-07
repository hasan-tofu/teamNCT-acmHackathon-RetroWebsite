
import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

const Button: React.FC<ButtonProps> = ({ children, className = '', variant = 'primary', ...props }) => {
  const baseClasses = "font-press-start text-sm px-4 py-2 border-2 border-black shadow-pixel transition-all duration-150 ease-in-out active:shadow-none active:transform active:translate-x-1 active:translate-y-1";

  const variantClasses = {
    primary: 'bg-retro-cyan text-black hover:bg-green-400',
    secondary: 'bg-retro-yellow text-black hover:bg-yellow-400',
    danger: 'bg-retro-pink text-black hover:bg-red-400',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
