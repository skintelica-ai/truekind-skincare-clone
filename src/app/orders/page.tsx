"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, Package } from "lucide-react";

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  shippingAddress: string;
}

export default function OrdersPage() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const orderId = searchParams.get("orderId");
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const sessionId = localStorage.getItem("session_id");
      
      const response = await fetch("/api/orders");
      const data = await response.json();
      
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-accent text-white";
      case "processing":
        return "bg-orange-accent text-white";
      case "pending":
        return "bg-secondary text-dark-gray";
      case "cancelled":
        return "bg-destructive text-white";
      default:
        return "bg-secondary text-dark-gray";
    }
  };

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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {success === "true" && (
          <div className="mb-8 rounded-xl border border-green-accent/20 bg-green-accent/10 p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-accent" />
              <div>
                <h3 className="font-semibold text-dark-gray">
                  Order Placed Successfully!
                </h3>
                <p className="text-sm text-medium-gray">
                  Thank you for your order. You'll receive a confirmation email shortly.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h1 className="mb-2 font-display text-5xl font-light text-dark-gray">
            My Orders
          </h1>
          <p className="text-medium-gray">
            View and track your order history
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="py-20 text-center">
            <Package className="mx-auto mb-4 h-16 w-16 text-medium-gray" />
            <h2 className="mb-2 font-display text-3xl font-light text-dark-gray">
              No orders yet
            </h2>
            <p className="mb-8 text-medium-gray">
              Start shopping to see your orders here
            </p>
            <Button asChild className="rounded-full" size="lg">
              <Link href="/shop">Browse Products</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-xl border border-border bg-white p-6"
              >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
                  <div>
                    <h3 className="font-display text-xl font-medium text-dark-gray">
                      Order #{order.orderNumber}
                    </h3>
                    <p className="text-sm text-medium-gray">
                      Placed on {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                    <span className="font-display text-xl font-semibold text-dark-gray">
                      ₹{order.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="mb-1 text-sm font-medium text-dark-gray">
                      Shipping Address
                    </p>
                    <p className="text-sm text-medium-gray">
                      {order.shippingAddress}
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-medium text-dark-gray">
                      Payment Method
                    </p>
                    <p className="text-sm text-medium-gray">
                      {order.paymentMethod === "cod"
                        ? "Cash on Delivery"
                        : "Credit/Debit Card"}
                    </p>
                    <Badge
                      variant={
                        order.paymentStatus === "paid" ? "default" : "secondary"
                      }
                      className="mt-1"
                    >
                      {order.paymentStatus.charAt(0).toUpperCase() +
                        order.paymentStatus.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}