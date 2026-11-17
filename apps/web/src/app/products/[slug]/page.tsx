'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  MessageCircle,
  Send,
  ShieldCheck,
  ShoppingCart,
} from 'lucide-react';
import { apiFetch, buildWhatsAppUrl, formatINR } from '@/lib/api';
import { useApp } from '@/context/app-context';

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
        <div className="h-96 rounded-2xl bg-slate-200 animate-pulse" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Product Not Available</h1>
        <p className="text-sm text-slate-500">
          {error || 'This product may have been unpublished or archived.'}
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white"
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
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-blue-600">
          Home
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-blue-600">
          Products
        </Link>
        {product.category && (
          <>
            <span>/</span>
            <Link
              href={`/products?categorySlug=${product.category.slug}`}
              className="hover:text-blue-600"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-slate-800 font-medium truncate max-w-xs">
          {product.name}
        </span>
      </nav>

      {/* Main Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Image Gallery */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            {product.images?.[0]?.url ? (
              <img
                src={product.images[0].url}
                alt={product.name}
                className="w-full h-80 sm:h-96 object-cover"
              />
            ) : (
              <div className="h-80 flex items-center justify-center bg-slate-100 text-slate-400">
                No Image
              </div>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-md bg-blue-50 px-2.5 py-1 font-semibold text-blue-700">
                {product.brand}
              </span>
              <span className="rounded-md bg-slate-100 px-2.5 py-1 font-mono text-slate-600">
                SKU: {product.sku}
              </span>
              <span className="rounded-md bg-slate-100 px-2.5 py-1 font-medium text-slate-700">
                Condition: {product.condition}
              </span>
              <span
                className={`rounded-md px-2.5 py-1 font-semibold ${
                  product.inStock
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {product.inStock
                  ? `In Stock (${product.availableQuantity} available)`
                  : 'Currently Out of Stock'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {product.name}
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Pricing Box */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <div>
                <span className="block text-xs text-slate-500">
                  Storefront Price (Inclusive of GST)
                </span>
                <div className="flex items-baseline gap-3 mt-0.5">
                  <span className="text-3xl font-bold text-slate-900">
                    {formatINR(product.sellingPrice)}
                  </span>
                  {product.mrpPrice && product.mrpPrice > product.sellingPrice && (
                    <span className="text-sm text-slate-400 line-through">
                      MRP {formatINR(product.mrpPrice)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                <ShieldCheck className="h-4 w-4" />
                <span>
                  {product.warrantySummary ||
                    `${product.warrantyMonths} Months Official Warranty`}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
              {product.inStock && (
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-slate-600">Qty:</label>
                  <select
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                    className="rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-semibold"
                  >
                    {[...Array(Math.min(5, product.availableQuantity))].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                disabled={!product.inStock}
                onClick={() =>
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
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-40 transition"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>
                  {product.inStock ? 'Add to Order Request Cart' : 'Out of Stock'}
                </span>
              </button>

              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500 transition"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Enquire on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Technical Specifications */}
          {product.specifications?.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
                <h2 className="text-sm font-bold text-slate-900">
                  Technical Specifications
                </h2>
              </div>
              <dl className="divide-y divide-slate-100 text-xs">
                {product.specifications.map((spec: any) => (
                  <div
                    key={spec.id}
                    className="grid grid-cols-3 px-5 py-3 hover:bg-slate-50/60"
                  >
                    <dt className="font-semibold text-slate-600">{spec.key}</dt>
                    <dd className="col-span-2 text-slate-900 font-medium">
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
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 max-w-3xl">
        <div className="space-y-1 mb-5">
          <h2 className="text-lg font-bold text-slate-900">
            Submit a Product or Bulk Pricing Enquiry
          </h2>
          <p className="text-xs text-slate-500">
            Need a corporate GST quote, upgrade compatibility advice, or bulk stock confirmation? Submit an enquiry directly to our sales desk.
          </p>
        </div>

        <form onSubmit={handleEnquirySubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                required
                value={enquirySubject}
                onChange={(e) => setEnquirySubject(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Phone (Optional)
              </label>
              <input
                type="text"
                value={enquiryPhone}
                onChange={(e) => setEnquiryPhone(e.target.value)}
                placeholder={user?.phone || '+91 98765 43210'}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Your Message / Requirements
            </label>
            <textarea
              rows={3}
              required
              value={enquiryMessage}
              onChange={(e) => setEnquiryMessage(e.target.value)}
              placeholder="Ask about corporate pricing, compatibility with your laptop model, or in-store pickup timing..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {user
                ? `Submitting as ${user.name} (${user.email})`
                : 'Sign-in required to submit portal enquiry'}
            </span>
            <button
              type="submit"
              disabled={submittingEnquiry}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
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
