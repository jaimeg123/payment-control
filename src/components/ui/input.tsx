import * as React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', ...props }, ref) => (
    <input
      className={`w-full px-3 py-2 border rounded-md ${className}`}
      ref={ref}
      {...props}
    />
  )
);

Input.displayName = 'Input';