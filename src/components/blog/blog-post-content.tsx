'use client';

import { useEffect } from 'react';
import { ProductCard } from '@/components/blog/product-card';

interface ProductLink {
  productId: number;
  productName: string;
  productImage: string | null;
  productPrice: number;
  productUrl: string;
  position: number;
}

interface BlogPostContentProps {
  content: string;
  productLinks: ProductLink[];
  postSlug: string;
}

export function BlogPostContent({ content, productLinks, postSlug }: BlogPostContentProps) {
  useEffect(() => {
    // Track pageview
    const trackPageview = async () => {
      try {
        await fetch(`/api/blog/posts/${postSlug}/analytics`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventType: 'pageview',
            eventData: { referrer: document.referrer }
          })
        });
      } catch (error) {
        console.error('Error tracking pageview:', error);
      }
    };

    trackPageview();

    // Track scroll depth
    let maxScrollDepth = 0;
    const trackScroll = () => {
      const scrollPercentage = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      
      if (scrollPercentage > maxScrollDepth && scrollPercentage % 25 === 0) {
        maxScrollDepth = scrollPercentage;
        
        fetch(`/api/blog/posts/${postSlug}/analytics`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventType: 'scroll',
            eventData: { depth: scrollPercentage }
          })
        }).catch(console.error);
      }
    };

    window.addEventListener('scroll', trackScroll);
    return () => window.removeEventListener('scroll', trackScroll);
  }, [postSlug]);

  // Parse content and insert product cards at specified positions
  const renderContent = () => {
    const paragraphs = content.split('\n\n');
    const elements: JSX.Element[] = [];

    paragraphs.forEach((paragraph, index) => {
      // Add paragraph
      elements.push(
        <div
          key={`p-${index}`}
          className="mb-6 text-foreground text-lg leading-relaxed [&_h2]:font-display [&_h2]:text-4xl [&_h2]:font-light [&_h2]:mt-12 [&_h2]:mb-6 [&_h3]:font-display [&_h3]:text-3xl [&_h3]:font-light [&_h3]:mt-8 [&_h3]:mb-4 [&_ul]:ml-6 [&_ul]:mb-6 [&_ol]:ml-6 [&_ol]:mb-6 [&_li]:mb-2 [&_a]:text-primary [&_a]:underline [&_a:hover]:text-accent [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-6 [&_blockquote]:my-8 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_img]:rounded-2xl [&_img]:my-8"
          dangerouslySetInnerHTML={{ __html: paragraph }}
        />
      );

      // Check if any product should be inserted after this paragraph
      const productsAtPosition = productLinks.filter(p => p.position === index + 1);
      productsAtPosition.forEach((product, pIndex) => {
        elements.push(
          <div key={`product-${index}-${pIndex}`} className="my-8">
            <ProductCard product={product} postSlug={postSlug} />
          </div>
        );
      });
    });

    return elements;
  };

  return (
    <div className="blog-content">
      {renderContent()}
    </div>
  );
}