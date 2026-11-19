import React from 'react';

export function HomeSectionSkeleton({ cards = 4 }: { cards?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(cards)].map((_, i) => (
        <div key={i} className="h-72 rounded-2xl bg-surface animate-pulse" />
      ))}
    </div>
  );
}
