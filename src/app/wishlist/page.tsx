"use client";

import { useState, useEffect } from "react";
import { ProductCard } from "@/components/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import Link from "next/link";

interface WishlistItem {
  id: number;
  productId: number;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  originalPrice: number | null;
  brandId: number | null;
  rating: number | null;
  reviewCount: number;
  isNew: boolean;
}

interface ProductImage {
  productId: number;
  imageUrl: string;
  isPrimary: boolean;
}

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();

    const handleWishlistUpdate = () => fetchWishlist();
    window.addEventListener("wishlist-updated", handleWishlistUpdate);
    return () => window.removeEventListener("wishlist-updated", handleWishlistUpdate);
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const sessionId = localStorage.getItem("session_id");
      if (!sessionId) {
        setWishlistItems([]);
        return;
      }

      const [wishlistRes, productsRes, imagesRes] = await Promise.all([
        fetch(`/api/wishlist-items?sessionId=${sessionId}`),
        fetch("/api/products"),
        fetch("/api/product-images"),
      ]);

      const wishlistData = await wishlistRes.json();
      const productsData = await productsRes.json();
      const imagesData = await imagesRes.json();

      setWishlistItems(wishlistData.items || []);
      setProducts(productsData.products || []);
      setProductImages(imagesData.images || []);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  const getProductImage = (productId: number) => {
    const image = productImages.find(
      (img) => img.productId === productId && img.isPrimary
    );
    return image?.imageUrl || "/placeholder-product.jpg";
  };

  const wishlistProducts = wishlistItems
    .map((item) => products.find((p) => p.id === item.productId))
    .filter((p): p is Product => p !== undefined);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="mb-8 h-12 w-1/3" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="aspect-square w-full rounded-2xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (wishlistProducts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Heart className="mx-auto mb-4 h-16 w-16 text-medium-gray" />
        <h2 className="mb-2 font-display text-3xl font-light text-dark-gray">
          Your wishlist is empty
        </h2>
        <p className="mb-8 text-medium-gray">
          Save your favorite products for later
        </p>
        <Button asChild className="rounded-full" size="lg">
          <Link href="/shop">Browse Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 font-display text-5xl font-light text-dark-gray">
            My Wishlist
          </h1>
          <p className="text-medium-gray">
            {wishlistProducts.length} {wishlistProducts.length === 1 ? "item" : "items"} saved
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {wishlistProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              slug={product.slug}
              price={product.price}
              originalPrice={product.originalPrice}
              imageUrl={getProductImage(product.id)}
              rating={product.rating}
              reviewCount={product.reviewCount}
              isNew={product.isNew}
            />
          ))}
        </div>
      </div>
    </div>
  );
}