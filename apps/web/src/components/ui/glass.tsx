import React from 'react';

interface SurfaceContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * Crisp architectural card surface (12px radius, single hairline elevation) for product & content grids.
 */
export function SurfaceCard({ children, className = '', ...rest }: SurfaceContainerProps) {
  return (
    <div
      className={`surface-card transition-colors duration-200 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export function GlassCard({ children, className = '', ...rest }: SurfaceContainerProps) {
  return (
    <div
      className={`glass-card rounded-card transition-colors duration-200 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export function GlassFilterBar({ children, className = '', ...rest }: SurfaceContainerProps) {
  return (
    <div className={`glass-filter rounded-card p-4 sm:p-5 ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function GlassModal({ children, className = '', ...rest }: SurfaceContainerProps) {
  return (
    <div className={`glass-modal rounded-2xl p-6 sm:p-8 ${className}`} {...rest}>
      {children}
    </div>
  );
}
