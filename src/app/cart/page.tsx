"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useSession } from "@/lib/auth-client";

interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  product: {
    name: string;
    slug: string;
    price: number;
    stockQuantity: number;
  };
  image: string;
}

export default function CartPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);

  useEffect(() => {
    if (!isPending) {
      fetchCart();
    }
    
    const handleCartUpdate = () => fetchCart();
    window.addEventListener("cart-updated", handleCartUpdate);
    return () => window.removeEventListener("cart-updated", handleCartUpdate);
  }, [isPending]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const sessionId = localStorage.getItem("session_id");
      const userId = session?.user?.id;
      
      if (!sessionId) {
        setCartItems([]);
        return;
      }

      const url = userId 
        ? `/api/cart-items?sessionId=${sessionId}&userId=${userId}`
        : `/api/cart-items?sessionId=${sessionId}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        setCartItems([]);
        return;
      }

      // Fetch product details and images
      const productsRes = await fetch("/api/products");
      const productsData = await productsRes.json();
      
      const imagesRes = await fetch("/api/product-images");
      const imagesData = await imagesRes.json();

      const enrichedItems = data.items.map((item: any) => {
        const product = productsData.products?.find((p: any) => p.id === item.productId);
        const image = imagesData.images?.find(
          (img: any) => img.productId === item.productId && img.isPrimary
        );

        return {
          ...item,
          product: product || { name: "Unknown", slug: "", price: 0, stockQuantity: 0 },
          image: image?.imageUrl || "/placeholder-product.jpg",
        };
      });

      setCartItems(enrichedItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    setUpdatingItems((prev) => new Set(prev).add(itemId));
    try {
      const response = await fetch(`/api/cart-items/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (response.ok) {
        await fetchCart();
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  const removeItem = async (itemId: number) => {
    setUpdatingItems((prev) => new Set(prev).add(itemId));
    try {
      const response = await fetch(`/api/cart-items/${itemId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchCart();
        window.dispatchEvent(new CustomEvent("cart-updated"));
      }
    } catch (error) {
      console.error("Error removing item:", error);
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  const applyCoupon = async () => {
    try {
      const response = await fetch(`/api/coupons?code=${couponCode}`);
      const data = await response.json();
      
      if (data.coupons && data.coupons.length > 0) {
        const coupon = data.coupons[0];
        if (coupon.isActive) {
          setAppliedCoupon(coupon);
        }
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const discount = appliedCoupon
    ? appliedCoupon.discountType === "percentage"
      ? (subtotal * appliedCoupon.discountValue) / 100
      : appliedCoupon.discountValue
    : 0;

  const total = subtotal - discount;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="mb-8 h-12 w-1/3" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-medium-gray" />
        <h2 className="mb-2 font-display text-3xl font-light text-dark-gray">
          Your cart is empty
        </h2>
        <p className="mb-8 text-medium-gray">
          Add some products to get started
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
        <h1 className="mb-8 font-display text-5xl font-light text-dark-gray">
          Shopping Cart
        </h1>

        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Cart Items */}
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 rounded-xl border border-border bg-white p-4"
              >
                <Link
                  href={`/shop/${item.product.slug}`}
                  className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg"
                >
                  <Image
                    src={item.image}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                </Link>

                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <Link
                      href={`/shop/${item.product.slug}`}
                      className="font-medium text-dark-gray hover:underline"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-sm text-medium-gray">
                      ₹{item.product.price} each
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={
                          updatingItems.has(item.id) || item.quantity <= 1
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={
                          updatingItems.has(item.id) ||
                          item.quantity >= item.product.stockQuantity
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-4">
                      <p className="font-semibold text-dark-gray">
                        ₹{item.product.price * item.quantity}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                        disabled={updatingItems.has(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="h-fit rounded-xl border border-border bg-white p-6">
            <h2 className="mb-4 font-display text-2xl font-light text-dark-gray">
              Order Summary
            </h2>

            <div className="space-y-3 border-b border-border pb-4">
              <div className="flex justify-between text-sm">
                <span className="text-medium-gray">Subtotal</span>
                <span className="font-medium">₹{subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-accent">Discount</span>
                  <span className="font-medium text-green-accent">
                    -₹{discount.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-medium-gray">Shipping</span>
                <span className="font-medium">Calculated at checkout</span>
              </div>
            </div>

            <div className="my-4 flex justify-between border-b border-border pb-4">
              <span className="font-display text-xl font-medium">Total</span>
              <span className="font-display text-xl font-semibold">
                ₹{total.toFixed(2)}
              </span>
            </div>

            {/* Coupon */}
            <div className="mb-4 space-y-2">
              <label className="text-sm font-medium text-dark-gray">
                Coupon Code
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <Button onClick={applyCoupon} variant="outline">
                  Apply
                </Button>
              </div>
            </div>

            <Button
              onClick={() => router.push("/checkout")}
              className="w-full rounded-full"
              size="lg"
            >
              Proceed to Checkout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}