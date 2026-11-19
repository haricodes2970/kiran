import React from 'react';

interface GlassContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function GlassCard({ children, className = '', ...rest }: GlassContainerProps) {
  return (
    <div
      className={`glass-card rounded-2xl transition-all duration-300 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export function GlassFilterBar({ children, className = '', ...rest }: GlassContainerProps) {
  return (
    <div className={`glass-filter rounded-2xl p-4 sm:p-5 ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function GlassModal({ children, className = '', ...rest }: GlassContainerProps) {
  return (
    <div className={`glass-modal rounded-3xl p-6 sm:p-8 ${className}`} {...rest}>
      {children}
    </div>
  );
}
