"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";

interface ProductCardProps {
  id: number;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number | null;
  imageUrl: string;
  brandName?: string;
  rating?: number | null;
  reviewCount?: number;
  isNew?: boolean;
  isFeatured?: boolean;
  productLine?: string;
}

export const ProductCard = ({
  id,
  name,
  slug,
  price,
  originalPrice,
  imageUrl,
  brandName,
  rating,
  reviewCount = 0,
  isNew,
  productLine,
}: ProductCardProps) => {
  const { data: session } = useSession();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsAddingToCart(true);

    try {
      const sessionId = localStorage.getItem("session_id") || `session_${Date.now()}`;
      localStorage.setItem("session_id", sessionId);
      const userId = session?.user?.id;

      const response = await fetch("/api/cart-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          userId, // Include userId from session
          productId: id,
          quantity: 1,
        }),
      });

      if (response.ok) {
        window.dispatchEvent(new CustomEvent("cart-updated"));
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    const sessionId = localStorage.getItem("session_id") || `session_${Date.now()}`;
    localStorage.setItem("session_id", sessionId);
    const userId = session?.user?.id;

    try {
      if (isWishlisted) {
        // Remove from wishlist - would need to get wishlist item id
        setIsWishlisted(false);
      } else {
        const response = await fetch("/api/wishlist-items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            userId, // Include userId from session
            productId: id,
          }),
        });

        if (response.ok) {
          setIsWishlisted(true);
          window.dispatchEvent(new CustomEvent("wishlist-updated"));
        }
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    }
  };

  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  return (
    <Link href={`/shop/${slug}`} className="group block">
      <div className="relative overflow-hidden rounded-2xl bg-pink-accent/20 p-6 transition-all hover:shadow-lg">
        {/* Badges */}
        <div className="absolute left-4 top-4 z-10 flex flex-col gap-2">
          {isNew && (
            <Badge variant="secondary" className="bg-green-accent text-white">
              NEW
            </Badge>
          )}
          {discount > 0 && (
            <Badge variant="destructive">{discount}% OFF</Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          className="absolute right-4 top-4 z-10 rounded-full bg-white p-2 shadow-md transition-colors hover:bg-pink-accent"
        >
          <Heart
            className={`h-5 w-5 ${isWishlisted ? "fill-red-500 text-red-500" : "text-dark-gray"}`}
          />
        </button>

        {/* Product Image */}
        <div className="relative mb-4 aspect-square overflow-hidden rounded-xl">
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        </div>

        {/* Product Info */}
        <div className="space-y-2">
          {productLine && (
            <p className="text-xs font-medium uppercase tracking-wider text-medium-gray">
              {productLine}
            </p>
          )}
          {brandName && (
            <p className="text-xs text-medium-gray">{brandName}</p>
          )}
          <h3 className="line-clamp-2 text-base font-medium text-dark-gray">
            {name}
          </h3>

          {/* Rating */}
          {rating && (
            <div className="flex items-center gap-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(rating)
                        ? "fill-orange-accent text-orange-accent"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-medium-gray">
                ({reviewCount})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-semibold text-dark-gray">
              ₹{price}
            </span>
            {originalPrice && (
              <span className="text-sm text-light-gray line-through">
                ₹{originalPrice}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className="w-full rounded-full bg-dark-gray text-white hover:bg-dark-gray/90"
          >
            <ShoppingBag className="h-4 w-4" />
            {isAddingToCart ? "Adding..." : "Add to Cart"}
          </Button>
        </div>
      </div>
    </Link>
  );
};