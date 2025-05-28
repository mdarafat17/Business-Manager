
import React, { ReactNode } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  className,
  ...props
}) => {
  const baseStyles = 'font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-neutral-800 inline-flex items-center justify-center transition-colors duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-primary text-white hover:bg-primary-dark focus:ring-primary dark:hover:bg-primary-dark',
    secondary: 'bg-secondary text-white hover:bg-green-600 focus:ring-secondary dark:hover:bg-green-600',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 dark:hover:bg-red-600',
    outline: 'bg-transparent text-primary border border-primary hover:bg-primary-light hover:text-white focus:ring-primary dark:text-primary-light dark:border-primary-light dark:hover:bg-primary-dark dark:hover:text-white',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};

export default Button;