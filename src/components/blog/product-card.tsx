'use client';

import { ShoppingBag } from 'lucide-react';

interface ProductCardProps {
  product: {
    productId: number;
    productName: string;
    productImage: string | null;
    productPrice: number;
    productUrl: string;
  };
  postSlug: string;
}

export function ProductCard({ product, postSlug }: ProductCardProps) {
  const handleClick = async () => {
    // Track product click
    try {
      await fetch(`/api/blog/posts/${postSlug}/analytics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'product_click',
          eventData: { 
            productId: product.productId,
            productName: product.productName 
          }
        })
      });
    } catch (error) {
      console.error('Error tracking product click:', error);
    }
  };

  return (
    <a
      href={product.productUrl}
      onClick={handleClick}
      className="block group"
    >
      <div className="bg-secondary/50 rounded-2xl p-6 border border-border hover:shadow-lg hover:border-primary transition-all duration-300">
        <div className="flex gap-6 items-center">
          {product.productImage && (
            <div className="flex-shrink-0 w-32 h-32 rounded-xl overflow-hidden bg-background">
              <img
                src={product.productImage}
                alt={product.productName}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
          )}
          
          <div className="flex-1">
            <div className="inline-block px-3 py-1 bg-primary text-primary-foreground rounded-full text-xs font-medium mb-2">
              Featured Product
            </div>
            <h3 className="font-display text-2xl mb-2 text-foreground group-hover:text-primary transition-colors">
              {product.productName}
            </h3>
            <p className="text-2xl font-semibold text-primary mb-4">
              ₹{product.productPrice}
            </p>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-full font-medium group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
              <ShoppingBag className="w-4 h-4" />
              Shop Now
            </div>
          </div>
        </div>
      </div>
    </a>
  );
}