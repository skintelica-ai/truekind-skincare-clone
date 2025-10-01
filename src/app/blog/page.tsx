import { Suspense } from 'react';
import BlogListingClient from '@/components/blog/blog-listing-client';
import NavigationBar from '@/components/sections/navigation-bar';
import NewsletterFooter from '@/components/sections/newsletter-footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Clean Journal - Expert Skincare Tips & Guides | TrueKind',
  description: 'Discover expert skincare advice, ingredient guides, and wellness tips from our team of dermatologists and beauty experts. Learn how to achieve radiant, healthy skin naturally.',
  openGraph: {
    title: 'Clean Journal - Expert Skincare Tips & Guides',
    description: 'Expert skincare advice, ingredient guides, and wellness tips for radiant, healthy skin.',
    type: 'website',
  },
};

export const dynamic = 'force-dynamic';

export default function BlogListingPage() {
  return (
    <main className="min-h-screen bg-background">
      <NavigationBar />
      
      <Suspense fallback={<BlogListingFallback />}>
        <BlogListingClient />
      </Suspense>
      
      <NewsletterFooter />
    </main>
  );
}

function BlogListingFallback() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="animate-pulse">
        <div className="h-12 bg-muted rounded w-1/3 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-4">
              <div className="h-64 bg-muted rounded-lg"></div>
              <div className="h-6 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}