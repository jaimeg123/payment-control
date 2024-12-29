import * as React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'destructive';
  children: React.ReactNode;
  className?: string;
}

export const Button = ({ 
  children, 
  className = '', 
  variant = 'default',
  ...props 
}: ButtonProps) => {
  const variantStyles = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 hover:bg-gray-50',
    destructive: 'bg-red-600 text-white hover:bg-red-700'
  };

  return (
    <button
      className={`px-4 py-2 rounded font-medium ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};