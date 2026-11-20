'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, ShoppingCart } from 'lucide-react';

interface AddToCartButtonProps {
  disabled?: boolean;
  onAdd: () => void;
  label?: string;
  className?: string;
  showCartLink?: boolean;
}

export function AddToCartButton({
  disabled = false,
  onAdd,
  label = 'Add to Cart',
  className = '',
  showCartLink = false,
}: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);

  const handleClick = () => {
    if (disabled) return;
    onAdd();
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2600);
  };

  return (
    <div className="space-y-1.5">
      <button
        type="button"
        disabled={disabled}
        onClick={handleClick}
        className={`inline-flex items-center justify-center gap-1.5 rounded-control px-4 py-2.5 text-xs font-semibold transition-colors duration-200 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed ${
          added
            ? 'bg-emerald-600 text-white'
            : 'bg-amber-500 text-[#0B1930] hover:bg-amber-400'
        } ${className}`}
      >
        {added ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <ShoppingCart className="h-3.5 w-3.5" aria-hidden="true" />}
        <span>{added ? 'Added to Order Cart' : label}</span>
      </button>

      {showCartLink && added && (
        <Link
          href="/cart"
          className="inline-flex w-full items-center justify-center gap-1 font-mono text-[11px] font-semibold text-accent hover:underline"
        >
          <span>View Order Cart</span>
          <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
