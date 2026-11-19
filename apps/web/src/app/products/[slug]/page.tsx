'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  HardDrive,
  MessageCircle,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { apiFetch, buildWhatsAppUrl, formatINR } from '@/lib/api';
import { useApp } from '@/context/app-context';
import { AddToCartButton } from '@/components/ui/add-to-cart-button';

interface ProductSpecification {
  id: string;
  groupName?: string | null;
  key: string;
  value: string;
}

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { user, addToCart, notify } = useApp();

  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qty, setQty] = useState(1);

  const [enquirySubject, setEnquirySubject] = useState('');
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [enquiryPhone, setEnquiryPhone] = useState('');
  const [submittingEnquiry, setSubmittingEnquiry] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await apiFetch(`/products/${slug}`);
        setProduct(data);
        setEnquirySubject(`Enquiry regarding ${data.name} (${data.sku})`);
      } catch (err: any) {
        setError(err.message || 'Product not found');
      } finally {
        setLoading(false);
      }
    }
    if (slug) load();
  }, [slug]);

  const groupedSpecs = useMemo(() => {
    const specs: ProductSpecification[] = Array.isArray(product?.specifications)
      ? product.specifications
      : [];
    const groups = new Map<string, ProductSpecification[]>();
    for (const spec of specs) {
      const group = spec.groupName?.trim() || 'Technical Specifications';
      const list = groups.get(group) || [];
      list.push(spec);
      groups.set(group, list);
    }
    return Array.from(groups.entries());
  }, [product]);

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      notify('Please sign in to submit a product enquiry', 'error');
      router.push('/login');
      return;
    }
    try {
      setSubmittingEnquiry(true);
      const res = await apiFetch('/enquiries', {
        method: 'POST',
        body: JSON.stringify({
          productId: product.id,
          subject: enquirySubject,
          message: enquiryMessage,
          contactPhone: enquiryPhone || user.phone || undefined,
        }),
      });
      notify(`Enquiry submitted! Reference: ${res.reference}`);
      setEnquiryMessage('');
    } catch (err: any) {
      notify(err.message || 'Failed to submit enquiry', 'error');
    } finally {
      setSubmittingEnquiry(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="h-96 rounded-card bg-panel animate-pulse border border-subtle" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="font-display text-2xl font-bold text-fg">Product Not Available</h1>
        <p className="text-sm text-muted">
          {error || 'This product may have been unpublished or archived.'}
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 rounded-control bg-brand-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-brand-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Hardware Catalogue
        </Link>
      </div>
    );
  }

  const waUrl = buildWhatsAppUrl(
    `Hello Kiran's Infotech, I am enquiring about "${product.name}" (SKU: ${product.sku}, Listed Price: ${formatINR(product.sellingPrice)}). Please confirm stock and best price.`,
  );

  const handleAdd = () => {
    addToCart(
      {
        id: product.id,
        type: 'PRODUCT',
        name: product.name,
        sku: product.sku,
        slug: product.slug,
        price: product.sellingPrice,
        maxStock: product.availableQuantity,
        imageUrl: product.images?.[0]?.url,
      },
      qty,
    );
  };

  const maxQty = Math.min(5, Math.max(1, Number(product.availableQuantity) || 1));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28 lg:pb-12 space-y-10">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-muted flex-wrap">
        <Link href="/" className="hover:text-accent">
          Home
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-accent">
          Products
        </Link>
        {product.category && (
          <>
            <span>/</span>
            <Link
              href={`/products?categorySlug=${product.category.slug}`}
              className="hover:text-accent"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-fg font-medium truncate max-w-xs">
          {product.name}
        </span>
      </nav>

      {/* Main 3-Zone Product Composition: Visual | Details & Grouped Specs | Sticky Buy Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Product Media */}
        <div className="lg:col-span-5 space-y-4">
          <div className="surface-card overflow-hidden bg-panel-2">
            {product.images?.[0]?.url ? (
              <img
                src={product.images[0].url}
                alt={product.name}
                className="w-full aspect-[4/3] object-cover"
              />
            ) : (
              <div className="aspect-[4/3] flex items-center justify-center bg-panel-2 text-muted">
                <HardDrive className="h-12 w-12" aria-hidden="true" />
              </div>
            )}
          </div>
        </div>

        {/* Product Info & Grouped Technical Specifications */}
        <div className="lg:col-span-4 space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-md bg-blue-50 dark:bg-brand-600/20 border border-blue-200/80 dark:border-electric/30 px-2.5 py-1 font-semibold text-brand-700 dark:text-electric">
                {product.brand}
              </span>
              <span className="rounded-md border border-subtle bg-panel px-2.5 py-1 font-mono text-muted">
                SKU: {product.sku}
              </span>
              {product.condition && (
                <span className="rounded-md border border-subtle bg-panel px-2.5 py-1 font-mono text-fg">
                  {String(product.condition).replace('_', ' ')}
                </span>
              )}
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-bold text-fg leading-tight">
              {product.name}
            </h1>

            <p className="text-sm text-muted leading-relaxed">
              {product.description || product.shortSummary}
            </p>

            {product.warrantyMonths > 0 && (
              <div className="inline-flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50/90 dark:bg-emerald-950/60 px-3 py-1.5 rounded-md border border-emerald-300/70 dark:border-emerald-500/30">
                <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  {product.warrantySummary ||
                    `${product.warrantyMonths} Months Warranty`}
                </span>
              </div>
            )}
          </div>

          {/* Grouped Technical Specifications */}
          {groupedSpecs.length > 0 && (
            <div className="space-y-4">
              {groupedSpecs.map(([groupName, specs]) => (
                <div key={groupName} className="surface-card overflow-hidden">
                  <div className="bg-panel-2 px-4 py-2.5 border-b border-subtle">
                    <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-fg">
                      {groupName}
                    </h2>
                  </div>
                  <dl className="divide-y divide-subtle text-xs">
                    {specs.map((spec) => (
                      <div
                        key={spec.id}
                        className="grid grid-cols-5 px-4 py-2.5 gap-2"
                      >
                        <dt className="col-span-2 font-medium text-muted">
                          {spec.key}
                        </dt>
                        <dd className="col-span-3 text-fg font-semibold">
                          {spec.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sticky Desktop Order Request Buy Box */}
        <aside className="lg:col-span-3">
          <div
            data-testid="desktop-buy-box"
            className="glass-stage lg:sticky lg:top-28 rounded-card p-5 space-y-4"
          >
            <div>
              <span className="block font-mono text-[10px] uppercase tracking-wider text-muted">
                Storefront Price · Order Request Only
              </span>
              <div className="flex items-baseline gap-2.5 mt-1">
                <span className="font-display text-2xl sm:text-3xl font-bold text-fg">
                  {formatINR(product.sellingPrice)}
                </span>
                {product.mrpPrice && Number(product.mrpPrice) > Number(product.sellingPrice) && (
                  <span className="text-xs text-muted line-through">
                    {formatINR(product.mrpPrice)}
                  </span>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-subtle flex items-center justify-between gap-2">
              <span
                className={`rounded-md px-2.5 py-1 font-mono text-[11px] font-semibold border ${
                  product.inStock
                    ? 'bg-emerald-50/95 text-emerald-800 border-emerald-300/80 dark:bg-emerald-950/85 dark:text-emerald-300 dark:border-emerald-400/30'
                    : 'bg-red-50 text-red-700 border-red-300 dark:bg-red-950/60 dark:text-red-300 dark:border-red-500/30'
                }`}
              >
                {product.inStock
                  ? `In Stock · ${product.availableQuantity}`
                  : 'Out of Stock'}
              </span>

              {product.inStock && (
                <div className="flex items-center gap-1.5">
                  <label htmlFor="product-qty" className="text-xs font-medium text-muted">
                    Qty
                  </label>
                  <select
                    id="product-qty"
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                    className="glass-input rounded-control px-2.5 py-1.5 text-xs font-semibold"
                  >
                    {[...Array(maxQty)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="space-y-2.5 pt-1">
              <AddToCartButton
                disabled={!product.inStock}
                label={product.inStock ? 'Add to Cart' : 'Out of Stock'}
                showCartLink
                onAdd={handleAdd}
                className="w-full py-3"
              />

              <Link
                href="/cart"
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-control border border-subtle bg-panel px-4 py-2.5 text-xs font-semibold text-fg hover:border-accent transition-colors"
              >
                <span>Proceed to Order Cart</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>

              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-control bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                <span>WhatsApp Enquiry</span>
              </a>
            </div>
          </div>
        </aside>
      </div>

      {/* Direct Authenticated Product Enquiry Form */}
      <div className="surface-card p-6 sm:p-8 max-w-3xl">
        <div className="space-y-1 mb-5">
          <h2 className="font-display text-lg font-bold text-fg">
            Submit a Product or Bulk Pricing Enquiry
          </h2>
          <p className="text-xs text-muted">
            Need a corporate GST quote, upgrade compatibility advice, or bulk stock confirmation? Submit an enquiry directly to our sales desk.
          </p>
        </div>

        <form onSubmit={handleEnquirySubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="enquiry-subject" className="block text-xs font-semibold text-fg mb-1">
                Subject
              </label>
              <input
                id="enquiry-subject"
                type="text"
                required
                value={enquirySubject}
                onChange={(e) => setEnquirySubject(e.target.value)}
                className="glass-input w-full rounded-control px-3.5 py-2 text-xs"
              />
            </div>
            <div>
              <label htmlFor="enquiry-phone" className="block text-xs font-semibold text-fg mb-1">
                Contact Phone (Optional)
              </label>
              <input
                id="enquiry-phone"
                type="text"
                value={enquiryPhone}
                onChange={(e) => setEnquiryPhone(e.target.value)}
                placeholder={user?.phone || '+91 98765 43210'}
                className="glass-input w-full rounded-control px-3.5 py-2 text-xs"
              />
            </div>
          </div>
          <div>
            <label htmlFor="enquiry-message" className="block text-xs font-semibold text-fg mb-1">
              Your Message / Requirements
            </label>
            <textarea
              id="enquiry-message"
              rows={3}
              required
              value={enquiryMessage}
              onChange={(e) => setEnquiryMessage(e.target.value)}
              placeholder="Ask about corporate pricing, compatibility with your laptop model, or in-store pickup timing..."
              className="glass-input w-full rounded-control px-3.5 py-2 text-xs"
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-muted">
              {user
                ? `Submitting as ${user.name} (${user.email})`
                : 'Sign-in required to submit portal enquiry'}
            </span>
            <button
              type="submit"
              disabled={submittingEnquiry}
              className="inline-flex items-center gap-2 rounded-control bg-brand-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50 transition-colors"
            >
              <Send className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{submittingEnquiry ? 'Sending...' : 'Submit Enquiry'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Compact Sticky Mobile Purchase Bar */}
      <div
        data-testid="mobile-buy-bar"
        className="lg:hidden fixed bottom-0 inset-x-0 z-30 glass-nav border-t border-subtle px-4 py-3 flex items-center justify-between gap-3"
      >
        <div className="min-w-0">
          <p className="font-display text-lg font-bold text-fg leading-none">
            {formatINR(product.sellingPrice)}
          </p>
          <p className="font-mono text-[10px] text-muted mt-1 truncate">
            {product.inStock ? `In Stock (${product.availableQuantity})` : 'Out of Stock'} · Order Request
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <AddToCartButton
            disabled={!product.inStock}
            label={product.inStock ? 'Add to Cart' : 'Out'}
            onAdd={handleAdd}
            className="px-4 py-2.5"
          />
          <Link
            href="/cart"
            className="rounded-control border border-subtle bg-panel px-3 py-2.5 text-xs font-semibold text-fg"
          >
            Cart
          </Link>
        </div>
      </div>
    </div>
  );
}
