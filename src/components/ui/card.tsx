import * as React from 'react';

export interface CardProps {
  className?: string;
  children?: React.ReactNode;
}

export function Card({ className = '', children }: CardProps) {
  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children }: CardProps) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}

export function CardTitle({ className = '', children }: CardProps) {
  return <h3 className={`text-lg font-medium ${className}`}>{children}</h3>;
}

export function CardContent({ className = '', children }: CardProps) {
  return <div className={`p-6 pt-0 ${className}`}>{children}</div>;
}