'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  MessageCircle,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { apiFetch, buildWhatsAppUrl, formatINR } from '@/lib/api';
import { useApp } from '@/context/app-context';
import { AddToCartButton } from '@/components/ui/add-to-cart-button';

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
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="h-96 rounded-2xl bg-panel/60 animate-pulse" />
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
          className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-xs font-semibold text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Hardware Catalogue
        </Link>
      </div>
    );
  }

  const waUrl = buildWhatsAppUrl(
    `Hello Kiran's Infotech, I am enquiring about "${product.name}" (SKU: ${product.sku}, Listed Price: ${formatINR(product.sellingPrice)}). Please confirm stock and best price.`,
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-muted">
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

      {/* Main Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sharp Unblurred Image Frame */}
        <div className="lg:col-span-5">
          <div className="rounded-3xl border border-subtle bg-white overflow-hidden shadow-card">
            {product.images?.[0]?.url ? (
              <img
                src={product.images[0].url}
                alt={product.name}
                className="w-full h-80 sm:h-96 object-cover"
              />
            ) : (
              <div className="h-80 flex items-center justify-center bg-panel-2 text-muted">
                No Image
              </div>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-blue-50 dark:bg-brand-600/20 px-3 py-1 font-semibold text-brand-700 dark:text-electric">
                {product.brand}
              </span>
              <span className="glass-pill rounded-full px-3 py-1 font-mono text-muted">
                SKU: {product.sku}
              </span>
              <span className="glass-pill rounded-full px-3 py-1 font-medium text-fg">
                Condition: {product.condition}
              </span>
              <span
                className={`rounded-full px-3 py-1 font-semibold ${
                  product.inStock
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                    : 'bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/30'
                }`}
              >
                {product.inStock
                  ? `In Stock (${product.availableQuantity} available)`
                  : 'Currently Out of Stock'}
              </span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-bold text-fg">
              {product.name}
            </h1>
            <p className="text-sm text-muted leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Glassmorphic Pricing & Action Box */}
          <div className="glass-card rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <div>
                <span className="block text-xs text-muted">
                  Storefront Price (Order Request Only)
                </span>
                <div className="flex items-baseline gap-3 mt-0.5">
                  <span className="font-display text-3xl font-bold text-fg">
                    {formatINR(product.sellingPrice)}
                  </span>
                  {product.mrpPrice && Number(product.mrpPrice) > Number(product.sellingPrice) && (
                    <span className="text-sm text-muted line-through">
                      MRP {formatINR(product.mrpPrice)}
                    </span>
                  )}
                </div>
              </div>

              {product.warrantyMonths > 0 && (
                <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/25">
                  <ShieldCheck className="h-4 w-4" />
                  <span>
                    {product.warrantySummary ||
                      `${product.warrantyMonths} Months Warranty`}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-subtle">
              {product.inStock && (
                <div className="flex items-center gap-2">
                  <label htmlFor="product-qty" className="text-xs font-medium text-muted">
                    Qty:
                  </label>
                  <select
                    id="product-qty"
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                    className="glass-input rounded-full px-3 py-2 text-xs font-semibold"
                  >
                    {[...Array(Math.min(5, product.availableQuantity))].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <AddToCartButton
                disabled={!product.inStock}
                label={product.inStock ? 'Add to Cart' : 'Out of Stock'}
                onAdd={() =>
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
                  )
                }
                className="px-6 py-2.5"
              />

              <Link
                href="/cart"
                className="rounded-full border border-subtle bg-panel-2/70 px-4 py-2.5 text-xs font-semibold text-fg hover:border-accent transition"
              >
                Review Order Cart
              </Link>

              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500 transition"
              >
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp Enquiry</span>
              </a>
            </div>
          </div>

          {/* Technical Specifications */}
          {product.specifications?.length > 0 && (
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="bg-panel-2/80 px-5 py-3 border-b border-subtle">
                <h2 className="font-display text-sm font-bold text-fg">
                  Technical Specifications
                </h2>
              </div>
              <dl className="divide-y divide-subtle text-xs">
                {product.specifications.map((spec: any) => (
                  <div
                    key={spec.id}
                    className="grid grid-cols-3 px-5 py-3 hover:bg-panel-2/40 transition-colors"
                  >
                    <dt className="font-semibold text-muted">{spec.key}</dt>
                    <dd className="col-span-2 text-fg font-medium">
                      {spec.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      {/* Direct Authenticated Product Enquiry Form */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 max-w-3xl">
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
              <label className="block text-xs font-semibold text-fg mb-1">
                Subject
              </label>
              <input
                type="text"
                required
                value={enquirySubject}
                onChange={(e) => setEnquirySubject(e.target.value)}
                className="glass-input w-full rounded-xl px-3.5 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-fg mb-1">
                Contact Phone (Optional)
              </label>
              <input
                type="text"
                value={enquiryPhone}
                onChange={(e) => setEnquiryPhone(e.target.value)}
                placeholder={user?.phone || '+91 98765 43210'}
                className="glass-input w-full rounded-xl px-3.5 py-2 text-xs"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-fg mb-1">
              Your Message / Requirements
            </label>
            <textarea
              rows={3}
              required
              value={enquiryMessage}
              onChange={(e) => setEnquiryMessage(e.target.value)}
              placeholder="Ask about corporate pricing, compatibility with your laptop model, or in-store pickup timing..."
              className="glass-input w-full rounded-xl px-3.5 py-2 text-xs"
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
              className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50 transition"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{submittingEnquiry ? 'Sending...' : 'Submit Enquiry'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
