'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function CategorySlugRedirectPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  useEffect(() => {
    if (slug) {
      router.replace(`/products?categorySlug=${encodeURIComponent(slug)}`);
    }
  }, [slug, router]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 text-center text-sm text-muted">
      Loading category products...
    </div>
  );
}
