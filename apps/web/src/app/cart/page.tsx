'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  CheckCircle2,
  ShoppingCart,
  Trash2,
} from 'lucide-react';
import { apiFetch, formatINR } from '@/lib/api';
import { useApp } from '@/context/app-context';

export default function CartPage() {
  const router = useRouter();
  const {
    user,
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartTotal,
    notify,
  } = useApp();

  const [fulfilmentType, setFulfilmentType] = useState<'STORE_PICKUP' | 'DELIVERY'>(
    'STORE_PICKUP',
  );
  const [recipient, setRecipient] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [addressText, setAddressText] = useState(
    "In-Store Pickup at Kiran's Infotech Showroom",
  );
  const [gstNumber, setGstNumber] = useState(
    user?.customerProfile?.gstNumber || '',
  );
  const [customerNotes, setCustomerNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<any | null>(null);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      notify('Please sign in to submit your order request', 'error');
      router.push('/login');
      return;
    }

    try {
      setSubmitting(true);
      const itemsPayload = cart.map((item) =>
        item.type === 'REFURBISHED'
          ? { refurbishedDeviceId: item.id, quantity: 1 }
          : { productId: item.id, quantity: item.quantity },
      );

      const created = await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify({
          items: itemsPayload,
          fulfilmentType,
          shippingRecipient: recipient || user.name,
          shippingPhone: phone || user.phone || '+919000000000',
          shippingAddressText: addressText,
          gstNumber: gstNumber || undefined,
          customerNotes: customerNotes || undefined,
        }),
      });

      setConfirmedOrder(created);
      clearCart();
      notify(`Order request ${created.reference} submitted!`);
    } catch (err: any) {
      notify(err.message || 'Failed to submit order request', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="glass-card rounded-3xl border border-emerald-500/30 p-8 space-y-5">
          <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-8 w-8 shrink-0" />
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-wider">
                Order Request Confirmed
              </p>
              <h1 className="font-display text-2xl font-bold text-fg">
                Reference: {confirmedOrder.reference}
              </h1>
            </div>
          </div>
          <p className="text-sm text-muted">
            Thank you! Your order request has been recorded and stock has been reserved. Our sales desk will confirm pickup/delivery and payment details shortly.
          </p>
          <div className="rounded-2xl bg-panel-2 p-4 border border-subtle space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted">Status:</span>
              <span className="font-semibold text-fg">
                {confirmedOrder.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Fulfilment:</span>
              <span className="font-semibold text-fg">
                {confirmedOrder.fulfilmentType}
              </span>
            </div>
            <div className="flex justify-between text-sm font-bold text-fg pt-2 border-t border-subtle">
              <span>Total Amount (Incl. GST):</span>
              <span>{formatINR(confirmedOrder.totalAmount)}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/account/orders"
              className="rounded-full bg-brand-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-brand-700 transition"
            >
              View in My Orders
            </Link>
            <Link
              href="/products"
              className="glass-pill rounded-full px-5 py-2.5 text-xs font-semibold text-fg hover:border-accent transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
          Order Request Only • No Online Payment
        </p>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-fg mt-1">
          Your Hardware Order Cart
        </h1>
      </div>

      {cart.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center space-y-4">
          <ShoppingCart className="h-10 w-10 text-muted mx-auto" />
          <h2 className="font-display text-lg font-bold text-fg">Your cart is empty</h2>
          <p className="text-xs text-muted max-w-md mx-auto">
            Browse our new laptops, SSDs, RAM modules, monitors, or certified refurbished laptops to add items to your order request.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link
              href="/products"
              className="rounded-full bg-amber-500 px-5 py-2.5 text-xs font-semibold text-ink hover:bg-amber-400 transition"
            >
              Browse Hardware Catalogue
            </Link>
            <Link
              href="/refurbished"
              className="glass-pill rounded-full px-5 py-2.5 text-xs font-semibold text-fg hover:border-accent transition"
            >
              Browse Refurbished Laptops
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-7 space-y-4">
            {cart.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className="glass-card rounded-2xl p-4 sm:p-5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="glass-pill rounded-full px-2.5 py-0.5 font-mono text-muted">
                      {item.sku}
                    </span>
                    <span className="text-accent font-semibold">
                      {item.type === 'REFURBISHED'
                        ? 'Refurbished Unit'
                        : 'Hardware'}
                    </span>
                  </div>
                  <Link
                    href={
                      item.type === 'REFURBISHED'
                        ? `/refurbished/${item.slug}`
                        : `/products/${item.slug}`
                    }
                    className="block font-display font-semibold text-fg text-sm sm:text-base hover:text-accent transition-colors"
                  >
                    {item.name}
                  </Link>
                  <p className="text-xs text-muted">
                    Unit Price: {formatINR(item.price)}
                  </p>
                </div>

                <div className="flex items-center gap-3 ml-auto">
                  {item.type === 'PRODUCT' ? (
                    <select
                      aria-label={`Quantity for ${item.name}`}
                      value={item.quantity}
                      onChange={(e) =>
                        updateCartQuantity(item.id, Number(e.target.value))
                      }
                      className="glass-input rounded-full px-3 py-1.5 text-xs font-semibold"
                    >
                      {[...Array(Math.min(10, item.maxStock))].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          Qty: {i + 1}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-xs font-medium text-muted px-2">
                      1 Unit
                    </span>
                  )}

                  <span className="font-display text-sm font-bold text-fg min-w-[85px] text-right">
                    {formatINR(item.price * item.quantity)}
                  </span>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    className="text-muted hover:text-red-500 p-1.5 rounded-full transition"
                    title="Remove item"
                    aria-label={`Remove ${item.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Request Form */}
          <div className="lg:col-span-5">
            <form
              onSubmit={handleSubmitOrder}
              className="glass-card rounded-3xl p-6 space-y-4"
            >
              <h2 className="font-display text-base font-bold text-fg border-b border-subtle pb-3">
                Submit Order Request
              </h2>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-fg mb-1">
                    Fulfilment Preference
                  </label>
                  <select
                    value={fulfilmentType}
                    onChange={(e) =>
                      setFulfilmentType(
                        e.target.value as 'STORE_PICKUP' | 'DELIVERY',
                      )
                    }
                    className="glass-input w-full rounded-xl px-3.5 py-2"
                  >
                    <option value="STORE_PICKUP">
                      In-Store Collection (Kiran&apos;s Infotech Showroom)
                    </option>
                    <option value="DELIVERY">Local / Courier Delivery</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-fg mb-1">
                    Recipient Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder={user?.name || 'Full Name'}
                    className="glass-input w-full rounded-xl px-3.5 py-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-fg mb-1">
                    Contact Phone *
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={user?.phone || '+91 98765 43210'}
                    className="glass-input w-full rounded-xl px-3.5 py-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-fg mb-1">
                    Delivery / Pickup Address *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={addressText}
                    onChange={(e) => setAddressText(e.target.value)}
                    className="glass-input w-full rounded-xl px-3.5 py-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-fg mb-1">
                    Company GSTIN (Optional for Tax Invoice)
                  </label>
                  <input
                    type="text"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                    placeholder="27AABCU9603R1ZM"
                    className="glass-input w-full rounded-xl px-3.5 py-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-fg mb-1">
                    Order Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    placeholder="e.g. Please pre-install RAM upgrade before pickup"
                    className="glass-input w-full rounded-xl px-3.5 py-2"
                  />
                </div>
              </div>

              <div className="border-t border-subtle pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-muted">
                  <span>Estimated Base Amount:</span>
                  <span>{formatINR(Math.round(cartTotal / 1.18))}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Included GST (18%):</span>
                  <span>
                    {formatINR(cartTotal - Math.round(cartTotal / 1.18))}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-fg pt-2 border-t border-subtle">
                  <span>Order Total:</span>
                  <span>{formatINR(cartTotal)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 px-5 py-3 text-xs font-semibold text-ink hover:bg-amber-400 disabled:opacity-50 transition shadow-sm"
              >
                <span>
                  {submitting
                    ? 'Validating Stock & Submitting...'
                    : user
                      ? 'Confirm & Submit Order Request'
                      : 'Sign In to Place Order Request'}
                </span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
