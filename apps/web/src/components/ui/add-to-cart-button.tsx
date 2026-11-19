'use client';

import React, { useState } from 'react';
import { Check, ShoppingCart } from 'lucide-react';

interface AddToCartButtonProps {
  disabled?: boolean;
  onAdd: () => void;
  label?: string;
  className?: string;
}

export function AddToCartButton({
  disabled = false,
  onAdd,
  label = 'Add to Cart',
  className = '',
}: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);

  const handleClick = () => {
    if (disabled) return;
    onAdd();
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      className={`inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-sm ${
        added
          ? 'bg-emerald-600 text-white'
          : 'bg-amber-500 text-ink hover:bg-amber-400'
      } ${className}`}
    >
      {added ? <Check className="h-3.5 w-3.5" /> : <ShoppingCart className="h-3.5 w-3.5" />}
      <span>{added ? 'Added to Order Cart' : label}</span>
    </button>
  );
}
