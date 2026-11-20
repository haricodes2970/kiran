'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Minus,
  Plus,
  ShoppingCart,
  Store,
  Trash2,
  Truck,
} from 'lucide-react';
import { apiFetch, formatINR } from '@/lib/api';
import { useApp } from '@/context/app-context';

const PICKUP_DEFAULT_ADDRESS = "In-Store Pickup at Kiran's Infotech Showroom";

export default function CartPage() {
  const router = useRouter();
  const {
    user,
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartTotal,
    cartCount,
    notify,
  } = useApp();

  const [fulfilmentType, setFulfilmentType] = useState<'STORE_PICKUP' | 'DELIVERY'>(
    'STORE_PICKUP',
  );
  const [recipient, setRecipient] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [addressText, setAddressText] = useState(PICKUP_DEFAULT_ADDRESS);
  const [gstNumber, setGstNumber] = useState(
    user?.customerProfile?.gstNumber || '',
  );
  const [customerNotes, setCustomerNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<any | null>(null);

  useEffect(() => {
    if (!user) return;
    setRecipient((prev) => prev || user.name || '');
    setPhone((prev) => prev || user.phone || '');
    setGstNumber((prev) => prev || user.customerProfile?.gstNumber || '');
  }, [user]);

  const handleFulfilmentChange = (nextType: 'STORE_PICKUP' | 'DELIVERY') => {
    setFulfilmentType(nextType);
    if (nextType === 'STORE_PICKUP' && !addressText.trim()) {
      setAddressText(PICKUP_DEFAULT_ADDRESS);
    } else if (nextType === 'DELIVERY' && addressText === PICKUP_DEFAULT_ADDRESS) {
      setAddressText('');
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!user) {
      notify('Please sign in to submit your order request', 'error');
      router.push('/login');
      return;
    }

    const finalRecipient = (recipient || user.name || '').trim();
    const finalPhone = (phone || user.phone || '').trim();
    const finalAddress = addressText.trim();

    if (!finalRecipient || finalRecipient.length < 2) {
      setFormError('Please enter a valid recipient name.');
      return;
    }
    if (!finalPhone || finalPhone.length < 8) {
      setFormError('Please enter a valid contact phone number.');
      return;
    }
    if (!finalAddress || finalAddress.length < 5) {
      setFormError(
        fulfilmentType === 'DELIVERY'
          ? 'Please enter your delivery address.'
          : 'Please confirm your pickup details.',
      );
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
          shippingRecipient: finalRecipient,
          shippingPhone: finalPhone,
          shippingAddressText: finalAddress,
          gstNumber: gstNumber.trim() || undefined,
          customerNotes: customerNotes.trim() || undefined,
        }),
      });

      setConfirmedOrder(created);
      clearCart();
      notify(`Order request ${created.reference} submitted!`);
    } catch (err: any) {
      const msg = err?.message || 'Failed to submit order request';
      setFormError(msg);
      notify(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="glass-stage rounded-card border-emerald-500/35 p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-3 text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="h-8 w-8 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-wider">
                Order Request Confirmed
              </p>
              <h1 className="font-display text-2xl font-bold text-fg">
                Reference: {confirmedOrder.reference}
              </h1>
            </div>
          </div>

          <p className="text-sm text-muted leading-relaxed">
            Your order request has been recorded and stock is reserved. No online payment was charged — our sales desk will confirm final payment and pickup or delivery details directly.
          </p>

          <div className="surface-card p-4 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted">Order Status:</span>
              <span className="font-semibold text-fg">{confirmedOrder.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Payment Status:</span>
              <span className="font-semibold text-fg">
                {confirmedOrder.paymentStatus || 'PENDING'}
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

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              href="/account/orders"
              className="rounded-control bg-brand-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-brand-700 transition-colors"
            >
              View in My Orders
            </Link>
            <Link
              href="/products"
              className="rounded-control border border-subtle bg-panel px-5 py-2.5 text-xs font-semibold text-fg hover:border-accent transition-colors"
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
      <div className="border-b border-subtle pb-5">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
          Order Request Only · No Online Payment
        </p>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-fg mt-1">
          Hardware Order Request Cart
        </h1>
        <p className="text-sm text-muted mt-1">
          Final payment and pickup or delivery timing are confirmed directly by Kiran&apos;s Infotech after stock verification.
        </p>
      </div>

      {cart.length === 0 ? (
        <div className="surface-card p-10 sm:p-14 text-center space-y-4">
          <ShoppingCart className="h-10 w-10 text-muted mx-auto" aria-hidden="true" />
          <h2 className="font-display text-lg font-bold text-fg">
            Your order cart is empty
          </h2>
          <p className="text-xs sm:text-sm text-muted max-w-md mx-auto">
            Browse new laptops, components, monitors, or certified refurbished laptops to build an order request.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link
              href="/products"
              className="rounded-control bg-amber-500 px-5 py-2.5 text-xs font-semibold text-[#0B1930] hover:bg-amber-400 transition-colors"
            >
              Browse Hardware Catalogue
            </Link>
            <Link
              href="/refurbished"
              className="rounded-control border border-subtle bg-panel px-5 py-2.5 text-xs font-semibold text-fg hover:border-accent transition-colors"
            >
              Browse Refurbished Laptops
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart Items */}
          <div className="lg:col-span-7 space-y-3.5">
            {cart.map((item) => {
              const isRefurbished = item.type === 'REFURBISHED';
              const maxAllowed = Math.max(1, item.maxStock || 1);
              return (
                <article
                  key={`${item.type}-${item.id}`}
                  className="surface-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-md border border-subtle bg-panel-2 px-2 py-0.5 font-mono text-[11px] text-muted">
                        {item.sku}
                      </span>
                      <span
                        className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold uppercase ${
                          isRefurbished
                            ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30'
                            : 'bg-blue-50 dark:bg-brand-600/20 text-brand-700 dark:text-electric border border-blue-200/80 dark:border-electric/30'
                        }`}
                      >
                        {isRefurbished ? 'Refurbished · Single Unit' : 'Hardware'}
                      </span>
                      {!isRefurbished && (
                        <span className="font-mono text-[10px] text-muted">
                          Max stock: {maxAllowed}
                        </span>
                      )}
                    </div>

                    <Link
                      href={
                        isRefurbished
                          ? `/refurbished/${item.slug}`
                          : `/products/${item.slug}`
                      }
                      className="block font-display font-semibold text-fg text-sm sm:text-base hover:text-accent transition-colors"
                    >
                      {item.name}
                    </Link>

                    <p className="text-xs text-muted">
                      Unit Price: {formatINR(item.price)}
                      {isRefurbished ? ' · Serial-tracked (Qty locked to 1)' : ''}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-subtle shrink-0">
                    {!isRefurbished ? (
                      <div
                        className="inline-flex items-center rounded-control border border-subtle bg-panel-2 overflow-hidden"
                        role="group"
                        aria-label={`Quantity controls for ${item.name}`}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            updateCartQuantity(item.id, item.quantity - 1)
                          }
                          aria-label={`Decrease quantity for ${item.name}`}
                          className="h-9 w-9 inline-flex items-center justify-center text-fg hover:bg-panel transition-colors"
                        >
                          <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        <span className="px-3 font-mono text-xs font-bold text-fg min-w-[28px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          disabled={item.quantity >= maxAllowed}
                          onClick={() =>
                            updateCartQuantity(item.id, item.quantity + 1)
                          }
                          aria-label={`Increase quantity for ${item.name}`}
                          className="h-9 w-9 inline-flex items-center justify-center text-fg hover:bg-panel disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
                        >
                          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    ) : (
                      <span className="rounded-md border border-subtle bg-panel-2 px-2.5 py-1.5 font-mono text-xs font-semibold text-muted">
                        1 Unit
                      </span>
                    )}

                    <span className="font-display text-sm sm:text-base font-bold text-fg min-w-[82px] text-right">
                      {formatINR(item.price * item.quantity)}
                    </span>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="h-9 w-9 inline-flex items-center justify-center rounded-control border border-subtle bg-panel text-muted hover:text-red-600 hover:border-red-300 dark:hover:text-red-300 transition-colors"
                      title="Remove item"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Order Request Form */}
          <div className="lg:col-span-5">
            <form
              onSubmit={handleSubmitOrder}
              className="glass-stage lg:sticky lg:top-28 rounded-card p-5 sm:p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-subtle pb-3">
                <h2 className="font-display text-base font-bold text-fg">
                  Submit Order Request
                </h2>
                <span className="rounded-md border border-subtle bg-panel px-2 py-0.5 font-mono text-[11px] font-semibold text-muted">
                  {cartCount} {cartCount === 1 ? 'ITEM' : 'ITEMS'}
                </span>
              </div>

              {formError && (
                <div
                  role="alert"
                  className="rounded-control border border-red-300 bg-red-50 dark:bg-red-950/60 dark:border-red-500/40 px-3.5 py-2.5 text-xs text-red-700 dark:text-red-200 flex items-start gap-2"
                >
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="block font-semibold text-fg mb-1.5">
                    Fulfilment Preference
                  </span>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleFulfilmentChange('STORE_PICKUP')}
                      aria-pressed={fulfilmentType === 'STORE_PICKUP'}
                      className={`flex items-center justify-center gap-1.5 rounded-control px-3 py-2.5 text-xs font-semibold border transition-colors ${
                        fulfilmentType === 'STORE_PICKUP'
                          ? 'border-brand-600 bg-brand-600/10 text-brand-700 dark:border-electric dark:bg-electric/15 dark:text-electric'
                          : 'border-subtle bg-panel text-muted hover:text-fg'
                      }`}
                    >
                      <Store className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Store Pickup</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFulfilmentChange('DELIVERY')}
                      aria-pressed={fulfilmentType === 'DELIVERY'}
                      className={`flex items-center justify-center gap-1.5 rounded-control px-3 py-2.5 text-xs font-semibold border transition-colors ${
                        fulfilmentType === 'DELIVERY'
                          ? 'border-brand-600 bg-brand-600/10 text-brand-700 dark:border-electric dark:bg-electric/15 dark:text-electric'
                          : 'border-subtle bg-panel text-muted hover:text-fg'
                      }`}
                    >
                      <Truck className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Delivery</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="cart-recipient" className="block font-semibold text-fg mb-1">
                      Recipient Name *
                    </label>
                    <input
                      id="cart-recipient"
                      type="text"
                      required
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      placeholder={user?.name || 'Full Name'}
                      className="glass-input w-full rounded-control px-3 py-2"
                    />
                  </div>

                  <div>
                    <label htmlFor="cart-phone" className="block font-semibold text-fg mb-1">
                      Contact Phone *
                    </label>
                    <input
                      id="cart-phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={user?.phone || '+91 98765 43210'}
                      className="glass-input w-full rounded-control px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="cart-address" className="flex items-center gap-1 font-semibold text-fg mb-1">
                    <MapPin className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                    <span>
                      {fulfilmentType === 'DELIVERY'
                        ? 'Delivery Address *'
                        : 'Pickup Location / Notes *'}
                    </span>
                  </label>
                  <textarea
                    id="cart-address"
                    rows={2}
                    required
                    value={addressText}
                    onChange={(e) => setAddressText(e.target.value)}
                    placeholder={
                      fulfilmentType === 'DELIVERY'
                        ? 'Building, Street, Area, City, PIN'
                        : PICKUP_DEFAULT_ADDRESS
                    }
                    className="glass-input w-full rounded-control px-3 py-2"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="cart-gstin" className="block font-semibold text-fg mb-1">
                      Company GSTIN (Optional)
                    </label>
                    <input
                      id="cart-gstin"
                      type="text"
                      value={gstNumber}
                      onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                      placeholder="27AABCU9603R1ZM"
                      className="glass-input w-full rounded-control px-3 py-2 font-mono"
                    />
                  </div>

                  <div>
                    <label htmlFor="cart-notes" className="block font-semibold text-fg mb-1">
                      Order Notes (Optional)
                    </label>
                    <input
                      id="cart-notes"
                      type="text"
                      value={customerNotes}
                      onChange={(e) => setCustomerNotes(e.target.value)}
                      placeholder="e.g. Pre-install RAM upgrade"
                      className="glass-input w-full rounded-control px-3 py-2"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-subtle pt-3.5 space-y-1.5 text-xs">
                <div className="flex justify-between text-muted">
                  <span>Estimated Base Amount</span>
                  <span>{formatINR(Math.round(cartTotal / 1.18))}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Included GST (18%)</span>
                  <span>
                    {formatINR(cartTotal - Math.round(cartTotal / 1.18))}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-fg pt-2 border-t border-subtle">
                  <span>Order Request Total</span>
                  <span>{formatINR(cartTotal)}</span>
                </div>
                <p className="text-[11px] text-muted pt-1">
                  No online payment is taken now. Our team confirms availability and payment options before fulfilment.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-control bg-amber-500 px-5 py-3 text-xs font-semibold text-[#0B1930] hover:bg-amber-400 disabled:opacity-50 transition-colors"
              >
                <span>
                  {submitting
                    ? 'Validating Stock & Submitting...'
                    : user
                      ? 'Confirm & Submit Order Request'
                      : 'Sign In to Place Order Request'}
                </span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
