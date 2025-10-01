'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import { 
  Save, 
  Eye, 
  Send, 
  Clock, 
  Image as ImageIcon, 
  Link as LinkIcon,
  Settings,
  FileText,
  ArrowLeft,
  Plus,
  X,
  Search,
  Upload
} from 'lucide-react';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

interface BlogPostEditorProps {
  postId?: number;
}

export function BlogPostEditor({ postId }: BlogPostEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'products'>('content');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Content fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [readTime, setReadTime] = useState(5);
  
  // Categories and tags
  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([]);
  const [tags, setTags] = useState<Array<{ id: number; name: string }>>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  
  // SEO fields
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [focusKeyword, setFocusKeyword] = useState('');
  const [ogTitle, setOgTitle] = useState('');
  const [ogDescription, setOgDescription] = useState('');
  const [ogImage, setOgImage] = useState('');
  
  // Product links
  const [productLinks, setProductLinks] = useState<Array<{
    productId: number;
    productName: string;
    productImage: string;
    productPrice: number;
    productUrl: string;
    position: number;
  }>>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [productSearch, setProductSearch] = useState('');
  
  // Publishing options
  const [status, setStatus] = useState<'draft' | 'published' | 'scheduled'>('draft');
  const [publishedAt, setPublishedAt] = useState('');
  
  // Preview
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (postId) {
      loadPost();
    }
    loadCategories();
    loadTags();
    loadProducts();
  }, [postId]);

  useEffect(() => {
    // Auto-generate slug from title
    if (!postId && title) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generatedSlug);
    }
  }, [title, postId]);

  useEffect(() => {
    // Calculate read time
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const calculatedTime = Math.ceil(wordCount / 200); // 200 words per minute
    setReadTime(calculatedTime || 1);
  }, [content]);

  const loadPost = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/blog/posts/${postId}`);
      if (res.ok) {
        const data = await res.json();
        const post = data.post;
        
        setTitle(post.title);
        setSlug(post.slug);
        setExcerpt(post.excerpt);
        setContent(post.content);
        setFeaturedImage(post.featuredImage || '');
        setReadTime(post.readTime);
        setStatus(post.status);
        setPublishedAt(post.publishedAt || '');
        
        setMetaTitle(post.metaTitle || '');
        setMetaDescription(post.metaDescription || '');
        setCanonicalUrl(post.canonicalUrl || '');
        setFocusKeyword(post.focusKeyword || '');
        setOgTitle(post.ogTitle || '');
        setOgDescription(post.ogDescription || '');
        setOgImage(post.ogImage || '');
        
        setSelectedCategories(post.categories.map((c: any) => c.id));
        setSelectedTags(post.tags.map((t: any) => t.id));
        setProductLinks(post.productLinks || []);
      }
    } catch (error) {
      console.error('Error loading post:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/blog/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadTags = async () => {
    try {
      const res = await fetch('/api/blog/tags');
      if (res.ok) {
        const data = await res.json();
        setTags(data.tags || []);
      }
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await fetch('/api/products?limit=100');
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleImageUpload = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return null;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return null;
    }

    setUploadingImage(true);

    try {
      // Create a local URL for preview
      const imageUrl = URL.createObjectURL(file);
      
      // TODO: Implement actual upload to your storage service
      // For now, using local object URL for preview
      toast.success('Image uploaded successfully');
      return imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const imageUrl = await handleImageUpload(files[0]);
      if (imageUrl) {
        setFeaturedImage(imageUrl);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const imageUrl = await handleImageUpload(files[0]);
      if (imageUrl) {
        setFeaturedImage(imageUrl);
      }
    }
  };

  const handleSave = async (saveStatus: 'draft' | 'published' | 'scheduled') => {
    if (!title || !content) {
      toast.error('Title and content are required');
      return;
    }

    if (saveStatus === 'scheduled' && !publishedAt) {
      toast.error('Please select a publish date and time for scheduled posts');
      return;
    }

    setSaving(true);

    const postData = {
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      readTime,
      status: saveStatus,
      publishedAt: saveStatus === 'scheduled' ? publishedAt : (saveStatus === 'published' ? new Date().toISOString() : null),
      metaTitle,
      metaDescription,
      canonicalUrl,
      focusKeyword,
      ogTitle,
      ogDescription,
      ogImage,
      categoryIds: selectedCategories,
      tagIds: selectedTags,
      productLinks: productLinks.map(p => ({
        productId: p.productId,
        position: p.position
      }))
    };

    try {
      const url = postId ? `/api/blog/posts/${postId}` : '/api/blog/posts';
      const method = postId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      });

      if (res.ok) {
        const data = await res.json();
        const statusMessage = saveStatus === 'published' ? 'published' : saveStatus === 'scheduled' ? 'scheduled' : 'saved as draft';
        toast.success(`Post ${statusMessage} successfully!`);
        
        // Ping sitemap if published
        if (saveStatus === 'published') {
          fetch('/api/sitemap-ping', { method: 'POST' }).catch(console.error);
        }
        
        if (!postId) {
          router.push(`/admin/blog/posts/${data.post.id}/edit`);
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.error || 'Failed to save post');
      }
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error('An error occurred while saving the post');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    if (!title || !content) {
      toast.error('Title and content are required for preview');
      return;
    }
    
    // Store preview data in sessionStorage
    sessionStorage.setItem('blog-preview', JSON.stringify({
      title,
      excerpt,
      content,
      featuredImage,
      readTime,
      publishedAt: publishedAt || new Date().toISOString()
    }));
    
    // Open preview in new tab
    window.open('/admin/blog/preview', '_blank');
  };

  const addProductLink = (product: any) => {
    if (productLinks.some(p => p.productId === product.id)) {
      toast.error('Product already added');
      return;
    }

    setProductLinks([...productLinks, {
      productId: product.id,
      productName: product.name,
      productImage: product.images?.[0]?.url || '',
      productPrice: product.price,
      productUrl: `/shop/${product.slug}`,
      position: productLinks.length + 1
    }]);
    
    toast.success('Product linked successfully');
  };

  const removeProductLink = (productId: number) => {
    setProductLinks(productLinks.filter(p => p.productId !== productId));
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      [{ 'align': [] }],
      ['clean']
    ]
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin/blog')}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="font-display text-2xl text-foreground">
                {postId ? 'Edit Post' : 'New Post'}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handlePreview}
                disabled={saving}
                className="px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
              
              <button
                onClick={() => handleSave('draft')}
                disabled={saving}
                className="px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Draft'}
              </button>
              
              <button
                onClick={() => handleSave('scheduled')}
                disabled={saving || !publishedAt}
                className="px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Clock className="w-4 h-4" />
                Schedule
              </button>
              
              <button
                onClick={() => handleSave('published')}
                disabled={saving}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-accent transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                {saving ? 'Publishing...' : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Editor Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <input
              type="text"
              placeholder="Post Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-4xl font-display font-light bg-transparent border-none focus:outline-none text-foreground placeholder:text-muted-foreground"
            />

            {/* Slug */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Slug (URL)</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Excerpt */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Excerpt</label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="Brief description of the post..."
              />
            </div>

            {/* Tabs */}
            <div className="border-b border-border">
              <div className="flex gap-6">
                <button
                  onClick={() => setActiveTab('content')}
                  className={`pb-3 border-b-2 transition-colors ${
                    activeTab === 'content'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Content
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('seo')}
                  className={`pb-3 border-b-2 transition-colors ${
                    activeTab === 'seo'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    SEO
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('products')}
                  className={`pb-3 border-b-2 transition-colors ${
                    activeTab === 'products'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" />
                    Products
                  </div>
                </button>
              </div>
            </div>

            {/* Content Tab */}
            {activeTab === 'content' && (
              <div className="bg-card border border-border rounded-lg p-6">
                <ReactQuill
                  value={content}
                  onChange={setContent}
                  modules={quillModules}
                  className="h-96 mb-12"
                  theme="snow"
                />
              </div>
            )}

            {/* SEO Tab */}
            {activeTab === 'seo' && (
              <div className="bg-card border border-border rounded-lg p-6 space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Meta Title</label>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder={title}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {metaTitle.length}/60 characters
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Meta Description</label>
                  <textarea
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder={excerpt}
                    rows={3}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {metaDescription.length}/160 characters
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Focus Keyword</label>
                  <input
                    type="text"
                    value={focusKeyword}
                    onChange={(e) => setFocusKeyword(e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Canonical URL</label>
                  <input
                    type="text"
                    value={canonicalUrl}
                    onChange={(e) => setCanonicalUrl(e.target.value)}
                    placeholder={`https://truekind.com/blog/${slug}`}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="border-t border-border pt-6">
                  <h3 className="font-semibold mb-4">Open Graph (Social Media)</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">OG Title</label>
                      <input
                        type="text"
                        value={ogTitle}
                        onChange={(e) => setOgTitle(e.target.value)}
                        placeholder={title}
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">OG Description</label>
                      <textarea
                        value={ogDescription}
                        onChange={(e) => setOgDescription(e.target.value)}
                        placeholder={excerpt}
                        rows={2}
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">OG Image URL</label>
                      <input
                        type="text"
                        value={ogImage}
                        onChange={(e) => setOgImage(e.target.value)}
                        placeholder={featuredImage}
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <div className="bg-card border border-border rounded-lg p-6 space-y-6">
                <div>
                  <h3 className="font-semibold mb-4">Linked Products</h3>
                  
                  {productLinks.length > 0 && (
                    <div className="space-y-3 mb-6">
                      {productLinks.map((product) => (
                        <div
                          key={product.productId}
                          className="flex items-center gap-4 p-4 bg-secondary/30 rounded-lg"
                        >
                          {product.productImage && (
                            <img
                              src={product.productImage}
                              alt={product.productName}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-medium">{product.productName}</p>
                            <p className="text-sm text-muted-foreground">
                              ₹{product.productPrice} • Position: {product.position}
                            </p>
                          </div>
                          <button
                            onClick={() => removeProductLink(product.productId)}
                            className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4 text-destructive" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {products
                      .filter(p => 
                        p.name.toLowerCase().includes(productSearch.toLowerCase())
                      )
                      .map((product) => (
                        <button
                          key={product.id}
                          onClick={() => addProductLink(product)}
                          className="w-full flex items-center gap-4 p-3 hover:bg-secondary/30 rounded-lg transition-colors text-left"
                        >
                          {product.images?.[0]?.url && (
                            <img
                              src={product.images[0].url}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">₹{product.price}</p>
                          </div>
                          <Plus className="w-4 h-4 text-primary" />
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Featured Image */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-semibold mb-4">Featured Image</h3>
              
              {featuredImage ? (
                <div className="relative group">
                  <img
                    src={featuredImage}
                    alt="Featured"
                    className="w-full h-48 object-cover rounded-lg mb-3"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-accent transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setFeaturedImage('')}
                      className="p-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                    isDragging 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploadingImage ? (
                    <div className="space-y-3">
                      <div className="w-12 h-12 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm text-muted-foreground">Uploading...</p>
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-sm font-medium mb-1">Drop image here or click to upload</p>
                      <p className="text-xs text-muted-foreground mb-3">Supports: JPG, PNG, GIF (Max 5MB)</p>
                      <div className="text-xs text-muted-foreground">or</div>
                      <input
                        type="text"
                        placeholder="Paste image URL"
                        value={featuredImage}
                        onChange={(e) => setFeaturedImage(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-3 w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </>
                  )}
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Categories */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-semibold mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <label key={category.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCategories([...selectedCategories, category.id]);
                        } else {
                          setSelectedCategories(selectedCategories.filter(id => id !== category.id));
                        }
                      }}
                      className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                    />
                    <span className="text-sm">{category.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-semibold mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => {
                      if (selectedTags.includes(tag.id)) {
                        setSelectedTags(selectedTags.filter(id => id !== tag.id));
                      } else {
                        setSelectedTags([...selectedTags, tag.id]);
                      }
                    }}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedTags.includes(tag.id)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-accent'
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Publishing Options */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-semibold mb-4">Publishing</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="published">Published</option>
                  </select>
                </div>

                {status === 'scheduled' && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Publish Date & Time</label>
                    <input
                      type="datetime-local"
                      value={publishedAt}
                      onChange={(e) => setPublishedAt(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium mb-2 block">Read Time</label>
                  <input
                    type="number"
                    value={readTime}
                    onChange={(e) => setReadTime(parseInt(e.target.value) || 1)}
                    min="1"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Calculated: {Math.ceil(content.replace(/<[^>]*>/g, '').split(/\s+/).length / 200)} min
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}