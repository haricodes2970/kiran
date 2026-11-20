'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useApp } from '@/context/app-context';
import { Hero } from '@/components/home/hero';
import { CategoryRail, CategoryItem } from '@/components/home/category-rail';
import { FeaturedProducts, ProductCardItem } from '@/components/home/featured-products';
import { RefurbishedShowcase, RefurbishedItem } from '@/components/home/refurbished-showcase';
import { ServicesGrid, ServiceItem } from '@/components/home/services-grid';
import { WhyUs } from '@/components/home/why-us';
import { FinalCta } from '@/components/home/final-cta';

export default function HomePage() {
  const { addToCart } = useApp();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ProductCardItem[]>([]);
  const [latestProducts, setLatestProducts] = useState<ProductCardItem[]>([]);
  const [laptopSystems, setLaptopSystems] = useState<ProductCardItem[]>([]);
  const [refurbished, setRefurbished] = useState<RefurbishedItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [siteContent, setSiteContent] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadHome() {
      try {
        setLoading(true);
        setError(null);
        const [catsRes, featRes, latestRes, laptopsRes, refurbRes, svcRes, contentRes] =
          await Promise.all([
            apiFetch('/categories'),
            apiFetch('/products?featured=true&limit=4'),
            apiFetch('/products?sortBy=newest&limit=8'),
            apiFetch('/products?categorySlug=laptops&limit=4'),
            apiFetch('/refurbished?limit=4'),
            apiFetch('/services'),
            apiFetch('/site-content'),
          ]);

        if (!active) return;
        setCategories(Array.isArray(catsRes) ? catsRes : []);
        setFeaturedProducts(Array.isArray(featRes?.data) ? featRes.data : []);
        setLatestProducts(Array.isArray(latestRes?.data) ? latestRes.data : []);
        setLaptopSystems(Array.isArray(laptopsRes?.data) ? laptopsRes.data : []);
        setRefurbished(Array.isArray(refurbRes?.data) ? refurbRes.data : []);
        setServices(
          Array.isArray(svcRes?.services) ? svcRes.services.slice(0, 6) : [],
        );
        setSiteContent(contentRes || {});
      } catch (err: any) {
        if (active) {
          setError(err?.message || 'Unable to load storefront data.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadHome();
    return () => {
      active = false;
    };
  }, []);

  const showcaseProducts =
    featuredProducts.length > 0 ? featuredProducts : latestProducts.slice(0, 4);

  // Prioritize an in-stock real laptop/desktop for the Hero stage instead of peripherals
  const heroProduct =
    laptopSystems.find((p) => p.inStock && Boolean(p.images?.[0]?.url)) ||
    laptopSystems.find((p) => Boolean(p.images?.[0]?.url)) ||
    null;

  const handleAddToCart = (prod: ProductCardItem) => {
    addToCart({
      id: prod.id,
      type: 'PRODUCT',
      name: prod.name,
      sku: prod.sku,
      slug: prod.slug,
      price: Number(prod.sellingPrice),
      maxStock: prod.availableQuantity,
      imageUrl: prod.images?.[0]?.url,
    });
  };

  return (
    <div>
      {/* Section B: Product-Focused Hero (Laptop/Desktop real showcase) */}
      <Hero
        content={siteContent?.hero_banner}
        heroProduct={heroProduct}
        onAddToCart={handleAddToCart}
      />

      {/* Section C: Product Category Discovery (immediately after hero) */}
      <CategoryRail categories={categories} loading={loading} error={error} />

      {/* Section D: Featured Products */}
      <FeaturedProducts
        products={showcaseProducts}
        loading={loading}
        error={error}
        onAddToCart={handleAddToCart}
      />

      {/* Section E: Refurbished Laptops */}
      <RefurbishedShowcase
        devices={refurbished}
        loading={loading}
        error={error}
      />

      {/* Section F: Services */}
      <ServicesGrid services={services} loading={loading} error={error} />

      {/* Section G: Why Kiran's Infotech */}
      <WhyUs />

      {/* Section H: Final Call to Action */}
      <FinalCta whatsappNumber={siteContent?.business_info?.whatsappNumber} />
    </div>
  );
}
