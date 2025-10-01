'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Eye, Edit, Trash2, Clock, Calendar, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  status: string;
  viewCount: number;
  readTime: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author: {
    name: string;
  };
  categories: Array<{
    name: string;
  }>;
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    scheduled: 0,
  });

  useEffect(() => {
    fetchPosts();
    fetchStats();
  }, [statusFilter]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchQuery) params.append('search', searchQuery);
      params.append('limit', '50');

      const res = await fetch(`/api/blog/posts?${params}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/blog/posts?limit=1000');
      if (res.ok) {
        const data = await res.json();
        const allPosts = data.posts || [];
        setStats({
          total: allPosts.length,
          published: allPosts.filter((p: BlogPost) => p.status === 'published').length,
          draft: allPosts.filter((p: BlogPost) => p.status === 'draft').length,
          scheduled: allPosts.filter((p: BlogPost) => p.status === 'scheduled').length,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const res = await fetch(`/api/blog/posts/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchPosts();
        fetchStats();
      } else {
        alert('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('An error occurred while deleting the post');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPosts();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-4xl mb-2 text-foreground">Blog Management</h1>
              <p className="text-muted-foreground">Create and manage your blog content</p>
            </div>
            <Link
              href="/admin/blog/posts/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-accent transition-colors"
            >
              <Plus className="w-5 h-5" />
              New Post
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total Posts</p>
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-display font-light">{stats.total}</p>
          </div>
          
          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Published</p>
              <Eye className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-display font-light">{stats.published}</p>
          </div>
          
          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Drafts</p>
              <Edit className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-3xl font-display font-light">{stats.draft}</p>
          </div>
          
          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Scheduled</p>
              <Calendar className="w-5 h-5 text-accent" />
            </div>
            <p className="text-3xl font-display font-light">{stats.scheduled}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-2xl p-6 border border-border mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
            </select>
            
            <button
              type="submit"
              className="px-6 py-3 bg-foreground text-background rounded-lg font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Posts List */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-muted-foreground">
              Loading posts...
            </div>
          ) : posts.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-muted-foreground mb-4">No posts found</p>
              <Link
                href="/admin/blog/posts/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-accent transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Your First Post
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/30 border-b border-border">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Title</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Author</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Views</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Date</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {posts.map((post) => (
                    <tr key={post.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-foreground line-clamp-1">{post.title}</p>
                          <p className="text-sm text-muted-foreground">{post.slug}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {post.author.name}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs">
                          {post.categories[0]?.name || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          post.status === 'published' 
                            ? 'bg-green-100 text-green-800' 
                            : post.status === 'scheduled'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {post.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {post.viewCount}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {post.publishedAt 
                          ? new Date(post.publishedAt).toLocaleDateString()
                          : new Date(post.createdAt).toLocaleDateString()
                        }
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            className="p-2 hover:bg-secondary rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4 text-muted-foreground" />
                          </Link>
                          <Link
                            href={`/admin/blog/posts/${post.id}/edit`}
                            className="p-2 hover:bg-secondary rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4 text-muted-foreground" />
                          </Link>
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}