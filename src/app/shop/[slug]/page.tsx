"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Heart, ShoppingBag, Minus, Plus, Check } from "lucide-react";
import { useSession } from "@/lib/auth-client";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice: number | null;
  stockQuantity: number;
  rating: number | null;
  reviewCount: number;
  isNew: boolean;
}

interface ProductImage {
  imageUrl: string;
  altText: string | null;
}

interface Review {
  id: number;
  rating: number;
  title: string | null;
  comment: string;
  isVerified: boolean;
  createdAt: string;
}

interface ProductAttribute {
  attributeType: string;
  attributeValue: string;
}

interface ProductFaq {
  question: string;
  answer: string;
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [attributes, setAttributes] = useState<ProductAttribute[]>([]);
  const [faqs, setFaqs] = useState<ProductFaq[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    fetchProductData();
  }, [slug]);

  const fetchProductData = async () => {
    try {
      setLoading(true);
      
      // Fetch all products to find the one with matching slug
      const productsRes = await fetch("/api/products");
      const productsData = await productsRes.json();
      const foundProduct = productsData.products?.find(
        (p: any) => p.slug === slug
      );

      if (!foundProduct) {
        router.push("/shop");
        return;
      }

      setProduct(foundProduct);

      // Fetch related data
      const [imagesRes, reviewsRes, attributesRes, faqsRes] = await Promise.all([
        fetch(`/api/product-images?productId=${foundProduct.id}`),
        fetch(`/api/reviews?productId=${foundProduct.id}`),
        fetch(`/api/products/${foundProduct.id}`),
        fetch(`/api/products/${foundProduct.id}`),
      ]);

      const imagesData = await imagesRes.json();
      const reviewsData = await reviewsRes.json();

      setImages(imagesData.images || []);
      setReviews(reviewsData.reviews || []);
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
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
          productId: product?.id,
          quantity,
        }),
      });

      if (response.ok) {
        setAddedToCart(true);
        window.dispatchEvent(new CustomEvent("cart-updated"));
        setTimeout(() => setAddedToCart(false), 2000);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleAddToWishlist = async () => {
    setIsAddingToWishlist(true);
    try {
      const sessionId = localStorage.getItem("session_id") || `session_${Date.now()}`;
      localStorage.setItem("session_id", sessionId);
      const userId = session?.user?.id;

      const response = await fetch("/api/wishlist-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          userId, // Include userId from session
          productId: product?.id,
        }),
      });

      if (response.ok) {
        window.dispatchEvent(new CustomEvent("wishlist-updated"));
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error);
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <Skeleton className="aspect-square w-full" />
          <div className="space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Product Details */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-secondary">
              <Image
                src={images[selectedImage]?.imageUrl || "/placeholder-product.jpg"}
                alt={product.name}
                fill
                className="object-cover"
              />
              {product.isNew && (
                <Badge className="absolute left-4 top-4 bg-green-accent text-white">
                  NEW
                </Badge>
              )}
              {discount > 0 && (
                <Badge variant="destructive" className="absolute left-4 top-16">
                  {discount}% OFF
                </Badge>
              )}
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-square overflow-hidden rounded-lg border-2 transition ${
                      selectedImage === index
                        ? "border-dark-gray"
                        : "border-transparent"
                    }`}
                  >
                    <Image
                      src={image.imageUrl}
                      alt={image.altText || product.name}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="mb-2 font-display text-4xl font-light text-dark-gray">
                {product.name}
              </h1>

              {/* Rating */}
              {product.rating && (
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(product.rating!)
                            ? "fill-orange-accent text-orange-accent"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-medium-gray">
                    {product.rating.toFixed(1)} ({product.reviewCount} reviews)
                  </span>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="font-display text-4xl font-medium text-dark-gray">
                ₹{product.price}
              </span>
              {product.originalPrice && (
                <span className="text-xl text-light-gray line-through">
                  ₹{product.originalPrice}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-medium-gray leading-relaxed">
              {product.description}
            </p>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {product.stockQuantity > 0 ? (
                <>
                  <Check className="h-5 w-5 text-green-accent" />
                  <span className="text-sm text-green-accent">
                    In Stock ({product.stockQuantity} available)
                  </span>
                </>
              ) : (
                <span className="text-sm text-destructive">Out of Stock</span>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-dark-gray">
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center text-lg font-medium">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setQuantity(Math.min(product.stockQuantity, quantity + 1))
                  }
                  disabled={quantity >= product.stockQuantity}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                onClick={handleAddToCart}
                disabled={isAddingToCart || product.stockQuantity === 0 || addedToCart}
                className="flex-1 rounded-full bg-dark-gray text-white hover:bg-dark-gray/90"
                size="lg"
              >
                <ShoppingBag className="h-5 w-5" />
                {addedToCart ? "Added to Cart!" : isAddingToCart ? "Adding..." : "Add to Cart"}
              </Button>
              <Button
                onClick={handleAddToWishlist}
                disabled={isAddingToWishlist}
                variant="outline"
                size="lg"
                className="rounded-full"
              >
                <Heart className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="reviews" className="w-full">
            <TabsList className="w-full justify-start border-b">
              <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
              <TabsTrigger value="description">Description</TabsTrigger>
            </TabsList>

            <TabsContent value="reviews" className="mt-8">
              {reviews.length === 0 ? (
                <p className="text-center text-medium-gray">No reviews yet.</p>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="border-b border-border pb-6"
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? "fill-orange-accent text-orange-accent"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        {review.isVerified && (
                          <Badge variant="secondary" className="text-xs">
                            Verified Purchase
                          </Badge>
                        )}
                      </div>
                      {review.title && (
                        <h4 className="mb-2 font-medium text-dark-gray">
                          {review.title}
                        </h4>
                      )}
                      <p className="text-medium-gray">{review.comment}</p>
                      <p className="mt-2 text-xs text-light-gray">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="description" className="mt-8">
              <div className="prose max-w-none">
                <p className="text-medium-gray leading-relaxed">
                  {product.description}
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}