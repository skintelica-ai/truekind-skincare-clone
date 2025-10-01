import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BlogPostContent } from '@/components/blog/blog-post-content';
import { AuthorCard } from '@/components/blog/author-card';
import { RelatedPosts } from '@/components/blog/related-posts';
import { SocialShare } from '@/components/blog/social-share';
import { CommentSection } from '@/components/blog/comment-section';
import { ScrollProgress } from '@/components/blog/scroll-progress';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  twitterTitle: string | null;
  twitterDescription: string | null;
  twitterImage: string | null;
  focusKeyword: string | null;
  status: string;
  publishedAt: string | null;
  viewCount: number;
  readTime: number;
  createdAt: string;
  updatedAt: string;
  authorId: number;
  author: {
    id: number;
    userId: number;
    name: string;
    bio: string | null;
    avatar: string | null;
    socialLinks: any;
  };
  categories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  tags: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  productLinks: Array<{
    productId: number;
    productName: string;
    productImage: string | null;
    productPrice: number;
    productUrl: string;
    position: number;
  }>;
}

async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/blog/posts/${slug}`, {
      next: { revalidate: 60 } // ISR: revalidate every 60 seconds
    });
    
    if (!res.ok) return null;
    
    const data = await res.json();
    return data.post;
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

async function getRelatedPosts(slug: string): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/blog/posts?limit=3&exclude=${slug}`, {
      next: { revalidate: 60 }
    });
    
    if (!res.ok) return [];
    
    const data = await res.json();
    return data.posts || [];
  } catch (error) {
    return [];
  }
}

export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/blog/posts?limit=100&status=published`);
    
    if (!res.ok) return [];
    
    const data = await res.json();
    const posts = data.posts || [];
    
    return posts.map((post: any) => ({
      slug: post.slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug);
  
  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'The requested blog post could not be found.'
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://truekind.com';
  const postUrl = `${siteUrl}/blog/${post.slug}`;
  
  // Generate dynamic OG image URL
  const ogImageUrl = post.ogImage || post.featuredImage || 
    `${siteUrl}/api/og-image?title=${encodeURIComponent(post.title)}&subtitle=${encodeURIComponent(post.excerpt.substring(0, 100))}&type=article`;

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    alternates: {
      canonical: post.canonicalUrl || postUrl,
    },
    openGraph: {
      title: post.ogTitle || post.title,
      description: post.ogDescription || post.excerpt,
      url: postUrl,
      siteName: 'TrueKind Skincare',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        }
      ],
      locale: 'en_US',
      type: 'article',
      publishedTime: post.publishedAt || post.createdAt,
      modifiedTime: post.updatedAt,
      authors: [post.author.name],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.twitterTitle || post.title,
      description: post.twitterDescription || post.excerpt,
      images: [post.twitterImage || ogImageUrl],
      creator: '@truekind',
    },
    robots: {
      index: post.status === 'published',
      follow: true,
    }
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  
  if (!post || post.status !== 'published') {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(params.slug);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://truekind.com';
  const postUrl = `${siteUrl}/blog/${post.slug}`;

  // JSON-LD Schema for Article
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.featuredImage || `${siteUrl}/default-image.jpg`,
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Person',
      name: post.author.name,
      image: post.author.avatar,
    },
    publisher: {
      '@type': 'Organization',
      name: 'TrueKind Skincare',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl
    },
    wordCount: post.content.split(' ').length,
    keywords: post.tags.map(tag => tag.name).join(', '),
  };

  // JSON-LD Schema for embedded Products
  const productSchemas = post.productLinks.map(product => ({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.productName,
    image: product.productImage,
    url: `${siteUrl}${product.productUrl}`,
    offers: {
      '@type': 'Offer',
      price: product.productPrice,
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      url: `${siteUrl}${product.productUrl}`
    }
  }));

  // Breadcrumb Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Journal',
        item: `${siteUrl}/blog`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: postUrl
      }
    ]
  };

  return (
    <>
      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {productSchemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <ScrollProgress />

      <main className="min-h-screen bg-background">
        {/* Breadcrumbs */}
        <nav className="container py-6">
          <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
            <li><a href="/" className="hover:text-foreground transition-colors">Home</a></li>
            <li>/</li>
            <li><a href="/blog" className="hover:text-foreground transition-colors">Journal</a></li>
            <li>/</li>
            <li className="text-foreground font-medium">{post.title}</li>
          </ol>
        </nav>

        {/* Article Header */}
        <article className="container max-w-4xl mx-auto px-4 pb-12">
          <header className="mb-12">
            <div className="flex flex-wrap gap-2 mb-4">
              {post.categories.map((category) => (
                <a
                  key={category.id}
                  href={`/blog?category=${category.slug}`}
                  className="inline-block px-4 py-1 bg-secondary text-secondary-foreground rounded-full text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  {category.name}
                </a>
              ))}
            </div>

            <h1 className="text-5xl md:text-6xl font-display font-light mb-6 text-foreground">
              {post.title}
            </h1>

            <p className="text-xl text-muted-foreground mb-8">
              {post.excerpt}
            </p>

            <div className="flex items-center justify-between flex-wrap gap-4 pb-8 border-b border-border">
              <div className="flex items-center gap-4">
                {post.author.avatar && (
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="font-medium text-foreground">{post.author.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })} · {post.readTime} min read
                  </p>
                </div>
              </div>

              <SocialShare 
                url={postUrl} 
                title={post.title}
                description={post.excerpt}
              />
            </div>
          </header>

          {/* Featured Image */}
          {post.featuredImage && (
            <div className="mb-12 rounded-2xl overflow-hidden">
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          {/* Article Content */}
          <BlogPostContent 
            content={post.content} 
            productLinks={post.productLinks}
            postSlug={post.slug}
          />

          {/* Tags */}
          <div className="mt-12 pt-8 border-t border-border">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <a
                  key={tag.id}
                  href={`/blog?tag=${tag.slug}`}
                  className="inline-block px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  #{tag.name}
                </a>
              ))}
            </div>
          </div>
        </article>

        {/* Author Card */}
        <div className="container max-w-4xl mx-auto px-4 pb-12">
          <AuthorCard author={post.author} />
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="bg-secondary/30 py-16">
            <div className="container max-w-6xl mx-auto px-4">
              <RelatedPosts posts={relatedPosts} />
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="container max-w-4xl mx-auto px-4 py-12">
          <CommentSection postId={post.id} />
        </div>
      </main>
    </>
  );
}