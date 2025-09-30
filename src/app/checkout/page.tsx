"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  product: {
    name: string;
    price: number;
  };
  image: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    paymentMethod: "cod",
    notes: "",
  });

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const sessionId = localStorage.getItem("session_id");
      if (!sessionId) {
        router.push("/cart");
        return;
      }

      const response = await fetch(`/api/cart-items?sessionId=${sessionId}`);
      const data = await response.json();

      if (!data.items || data.items.length === 0) {
        router.push("/cart");
        return;
      }

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
          product: product || { name: "Unknown", price: 0 },
          image: image?.imageUrl || "/placeholder-product.jpg",
        };
      });

      setCartItems(enrichedItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
      router.push("/cart");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const sessionId = localStorage.getItem("session_id");
      const subtotal = cartItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );

      const shippingAddress = `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`;

      const orderData = {
        sessionId,
        status: "pending",
        subtotal,
        discountAmount: 0,
        taxAmount: 0,
        shippingAmount: 0,
        totalAmount: subtotal,
        paymentMethod: formData.paymentMethod,
        paymentStatus: "pending",
        shippingAddress,
        billingAddress: shippingAddress,
        notes: formData.notes,
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Clear cart
        await Promise.all(
          cartItems.map((item) =>
            fetch(`/api/cart-items/${item.id}`, { method: "DELETE" })
          )
        );

        localStorage.removeItem("session_id");
        window.dispatchEvent(new CustomEvent("cart-updated"));
        router.push(`/orders?success=true&orderId=${data.order.id}`);
      }
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Failed to create order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="mb-8 h-12 w-1/3" />
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 font-display text-5xl font-light text-dark-gray">
          Checkout
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
            {/* Checkout Form */}
            <div className="space-y-6">
              <div className="rounded-xl border border-border bg-white p-6">
                <h2 className="mb-4 font-display text-2xl font-light text-dark-gray">
                  Contact Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      required
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-white p-6">
                <h2 className="mb-4 font-display text-2xl font-light text-dark-gray">
                  Shipping Address
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      required
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        required
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        required
                        value={formData.state}
                        onChange={(e) =>
                          setFormData({ ...formData, state: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">ZIP Code *</Label>
                      <Input
                        id="zipCode"
                        required
                        value={formData.zipCode}
                        onChange={(e) =>
                          setFormData({ ...formData, zipCode: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-white p-6">
                <h2 className="mb-4 font-display text-2xl font-light text-dark-gray">
                  Payment Method
                </h2>
                <div className="space-y-3">
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-4 transition hover:bg-secondary">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === "cod"}
                      onChange={(e) =>
                        setFormData({ ...formData, paymentMethod: e.target.value })
                      }
                      className="h-4 w-4"
                    />
                    <span className="font-medium">Cash on Delivery</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-4 transition hover:bg-secondary">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={formData.paymentMethod === "card"}
                      onChange={(e) =>
                        setFormData({ ...formData, paymentMethod: e.target.value })
                      }
                      className="h-4 w-4"
                    />
                    <span className="font-medium">Credit/Debit Card</span>
                  </label>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-white p-6">
                <Label htmlFor="notes">Order Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Special instructions for your order..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={4}
                />
              </div>
            </div>

            {/* Order Summary */}
            <div className="h-fit rounded-xl border border-border bg-white p-6">
              <h2 className="mb-4 font-display text-2xl font-light text-dark-gray">
                Order Summary
              </h2>

              <div className="mb-4 space-y-3 border-b border-border pb-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={item.image}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-dark-gray">
                        {item.product.name}
                      </p>
                      <p className="text-sm text-medium-gray">
                        Qty: {item.quantity} × ₹{item.product.price}
                      </p>
                    </div>
                    <p className="text-sm font-semibold">
                      ₹{item.product.price * item.quantity}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-b border-border pb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-medium-gray">Subtotal</span>
                  <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-medium-gray">Shipping</span>
                  <span className="font-medium">Free</span>
                </div>
              </div>

              <div className="my-4 flex justify-between">
                <span className="font-display text-xl font-medium">Total</span>
                <span className="font-display text-xl font-semibold">
                  ₹{subtotal.toFixed(2)}
                </span>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full"
                size="lg"
              >
                {submitting ? "Placing Order..." : "Place Order"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}