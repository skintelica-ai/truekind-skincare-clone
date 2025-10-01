'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Filter, Clock, Calendar, User, TrendingUp, Eye, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebounce } from '@/hooks/use-debounce';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string;
  featuredImageAlt: string;
  publishedAt: number;
  readTime: number;
  viewCount: number;
  authorName: string;
  authorImage: string;
  categoryName: string;
  categorySlug: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  postCount: number;
}

export default function BlogListingClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'latest');
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  
  const debouncedSearch = useDebounce(searchQuery, 500);
  const observerTarget = useRef(null);

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/blog/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    }
    fetchCategories();
  }, []);

  // Fetch posts
  const fetchPosts = useCallback(async (reset = false) => {
    try {
      const params = new URLSearchParams({
        limit: '9',
        offset: reset ? '0' : String(page * 9),
        sort: sortBy,
      });

      if (debouncedSearch) params.append('search', debouncedSearch);
      if (selectedCategory) params.append('categoryId', selectedCategory);

      const response = await fetch(`/api/blog/posts?${params}`);
      if (response.ok) {
        const newPosts = await response.json();
        setPosts(reset ? newPosts : [...posts, ...newPosts]);
        setHasMore(newPosts.length === 9);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setLoading(false);
    }
  }, [page, sortBy, debouncedSearch, selectedCategory, posts]);

  // Initial load and filter changes
  useEffect(() => {
    setPage(0);
    setPosts([]);
    setLoading(true);
    fetchPosts(true);
  }, [sortBy, debouncedSearch, selectedCategory]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading]);

  // Load more posts when page changes
  useEffect(() => {
    if (page > 0) {
      fetchPosts();
    }
  }, [page]);

  // Update URL with filters
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    if (sortBy !== 'latest') params.set('sort', sortBy);
    
    const newUrl = params.toString() ? `/blog?${params}` : '/blog';
    router.replace(newUrl, { scroll: false });
  }, [searchQuery, selectedCategory, sortBy, router]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSortBy('latest');
  };

  const hasActiveFilters = searchQuery || selectedCategory || sortBy !== 'latest';

  return (
    <div className="bg-gradient-to-b from-background via-secondary to-muted py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-display mb-4">
            clean <span className="italic text-primary">Journal</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Expert skincare tips, ingredient guides, and wellness advice from our team of
            dermatologists and beauty experts.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                placeholder="Search articles, authors, topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={String(category.id)}>
                    {category.name} ({category.postCount})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Latest</SelectItem>
                <SelectItem value="trending">Trending</SelectItem>
                <SelectItem value="mostRead">Most Read</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="ml-1 hover:text-destructive">
                    <X size={14} />
                  </button>
                </Badge>
              )}
              {selectedCategory && (
                <Badge variant="secondary" className="gap-1">
                  {categories.find(c => String(c.id) === selectedCategory)?.name}
                  <button onClick={() => setSelectedCategory('')} className="ml-1 hover:text-destructive">
                    <X size={14} />
                  </button>
                </Badge>
              )}
              {sortBy !== 'latest' && (
                <Badge variant="secondary" className="gap-1">
                  Sort: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
                  <button onClick={() => setSortBy('latest')} className="ml-1 hover:text-destructive">
                    <X size={14} />
                  </button>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-primary hover:text-primary/80"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>

        {/* Posts Grid */}
        {loading && posts.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden animate-pulse">
                <div className="h-64 bg-muted"></div>
                <CardContent className="p-6 space-y-3">
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-2xl font-display mb-2">No articles found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your filters or search terms
            </p>
            <Button onClick={clearFilters}>Clear Filters</Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 h-full group">
                    <div className="relative h-64 overflow-hidden">
                      <Image
                        src={post.featuredImage || '/placeholder-blog.jpg'}
                        alt={post.featuredImageAlt || post.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <Badge className="absolute top-4 left-4 bg-primary text-white">
                        {post.categoryName}
                      </Badge>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-display mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User size={14} />
                          <span>{post.authorName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          <span>{post.readTime} min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye size={14} />
                          <span>{post.viewCount}</span>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-2 text-sm">
                        <Calendar size={14} className="text-muted-foreground" />
                        <time className="text-muted-foreground">
                          {new Date(post.publishedAt).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </time>
                      </div>
                      <Button className="w-full mt-4 group-hover:bg-primary group-hover:text-white transition-colors">
                        Read More
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Infinite Scroll Trigger */}
            {hasMore && (
              <div ref={observerTarget} className="flex justify-center py-8">
                <div className="animate-pulse flex items-center gap-2 text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <span className="ml-2">Loading more articles...</span>
                </div>
              </div>
            )}

            {/* Load More Button (fallback) */}
            {!hasMore && posts.length > 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">You've reached the end of our journal</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}