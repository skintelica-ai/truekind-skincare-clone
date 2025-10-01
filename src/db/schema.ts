// Push existing schema to Turso database
import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

// Categories table - Main product categories
export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  parentId: integer('parent_id').references(() => categories.id),
  imageUrl: text('image_url'),
  createdAt: text('created_at').notNull(),
});

// Brands table - Brand information
export const brands = sqliteTable('brands', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  logoUrl: text('logo_url'),
  bannerUrl: text('banner_url'),
  isFeatured: integer('is_featured', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').notNull(),
});

// Products table - Main product catalog
export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  shortDescription: text('short_description'),
  brandId: integer('brand_id').references(() => brands.id),
  categoryId: integer('category_id').references(() => categories.id),
  price: real('price').notNull(),
  originalPrice: real('original_price'),
  sku: text('sku').notNull().unique(),
  stockQuantity: integer('stock_quantity').default(0),
  isFeatured: integer('is_featured', { mode: 'boolean' }).default(false),
  isNew: integer('is_new', { mode: 'boolean' }).default(false),
  rating: real('rating'),
  reviewCount: integer('review_count').default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Product Images table - Multiple images per product
export const productImages = sqliteTable('product_images', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  productId: integer('product_id').references(() => products.id),
  imageUrl: text('image_url').notNull(),
  altText: text('alt_text'),
  isPrimary: integer('is_primary', { mode: 'boolean' }).default(false),
  displayOrder: integer('display_order').default(0),
  createdAt: text('created_at').notNull(),
});

// Product Videos table - Product tutorial/demo videos
export const productVideos = sqliteTable('product_videos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  productId: integer('product_id').references(() => products.id),
  videoUrl: text('video_url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  title: text('title'),
  duration: integer('duration'),
  createdAt: text('created_at').notNull(),
});

// Product Attributes table - Product specs (ingredients, how to use, benefits)
export const productAttributes = sqliteTable('product_attributes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  productId: integer('product_id').references(() => products.id),
  attributeType: text('attribute_type').notNull(),
  attributeValue: text('attribute_value').notNull(),
  createdAt: text('created_at').notNull(),
});

// Product Tags table - For search/filtering
export const productTags = sqliteTable('product_tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  productId: integer('product_id').references(() => products.id),
  tagName: text('tag_name').notNull(),
  tagType: text('tag_type').notNull(),
  createdAt: text('created_at').notNull(),
});

// Reviews table - Customer reviews and ratings
export const reviews = sqliteTable('reviews', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  productId: integer('product_id').references(() => products.id),
  userId: text('user_id').references(() => user.id),
  rating: integer('rating').notNull(),
  title: text('title'),
  comment: text('comment').notNull(),
  isVerified: integer('is_verified', { mode: 'boolean' }).default(false),
  helpfulCount: integer('helpful_count').default(0),
  createdAt: text('created_at').notNull(),
});

// Product FAQs table
export const productFaqs = sqliteTable('product_faqs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  productId: integer('product_id').references(() => products.id),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  displayOrder: integer('display_order').default(0),
  createdAt: text('created_at').notNull(),
});

// Cart Items table - Shopping cart
export const cartItems = sqliteTable('cart_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sessionId: text('session_id'),
  userId: text('user_id').references(() => user.id),
  productId: integer('product_id').references(() => products.id),
  quantity: integer('quantity').default(1),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Wishlist Items table - Save for later
export const wishlistItems = sqliteTable('wishlist_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sessionId: text('session_id'),
  userId: text('user_id').references(() => user.id),
  productId: integer('product_id').references(() => products.id),
  createdAt: text('created_at').notNull(),
});

// Coupons table - Discount codes
export const coupons = sqliteTable('coupons', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull().unique(),
  description: text('description'),
  discountType: text('discount_type').notNull(),
  discountValue: real('discount_value').notNull(),
  minPurchaseAmount: real('min_purchase_amount'),
  maxDiscountAmount: real('max_discount_amount'),
  usageLimit: integer('usage_limit'),
  usedCount: integer('used_count').default(0),
  validFrom: text('valid_from').notNull(),
  validUntil: text('valid_until').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').notNull(),
});

// Orders table - Order management
export const orders = sqliteTable('orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orderNumber: text('order_number').notNull().unique(),
  userId: text('user_id').references(() => user.id),
  sessionId: text('session_id'),
  status: text('status').notNull(),
  subtotal: real('subtotal').notNull(),
  discountAmount: real('discount_amount').default(0),
  taxAmount: real('tax_amount').default(0),
  shippingAmount: real('shipping_amount').default(0),
  totalAmount: real('total_amount').notNull(),
  couponCode: text('coupon_code'),
  paymentMethod: text('payment_method').notNull(),
  paymentStatus: text('payment_status').notNull(),
  shippingAddress: text('shipping_address').notNull(),
  billingAddress: text('billing_address'),
  trackingNumber: text('tracking_number'),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Order Items table - Items in each order
export const orderItems = sqliteTable('order_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orderId: integer('order_id').references(() => orders.id),
  productId: integer('product_id').references(() => products.id),
  quantity: integer('quantity').notNull(),
  unitPrice: real('unit_price').notNull(),
  totalPrice: real('total_price').notNull(),
  createdAt: text('created_at').notNull(),
});

// Add comprehensive blog system tables
export const blogPosts = sqliteTable('blog_posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  excerpt: text('excerpt'),
  content: text('content'),
  featuredImage: text('featured_image'),
  featuredImageAlt: text('featured_image_alt'),
  authorId: text('author_id').references(() => user.id),
  categoryId: integer('category_id').references(() => blogCategories.id),
  status: text('status').notNull().default('draft'),
  scheduledPublishAt: integer('scheduled_publish_at', { mode: 'timestamp' }),
  publishedAt: integer('published_at', { mode: 'timestamp' }),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  readTime: integer('read_time'),
  viewCount: integer('view_count').default(0),
  shareCount: integer('share_count').default(0),
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  canonicalUrl: text('canonical_url'),
  robotsMeta: text('robots_meta').default('index,follow'),
  ogTitle: text('og_title'),
  ogDescription: text('og_description'),
  ogImage: text('og_image'),
  twitterTitle: text('twitter_title'),
  twitterDescription: text('twitter_description'),
  twitterImage: text('twitter_image'),
  focusKeyword: text('focus_keyword'),
  seoScore: integer('seo_score'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const blogCategories = sqliteTable('blog_categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const blogTags = sqliteTable('blog_tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const blogPostTags = sqliteTable('blog_post_tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  postId: integer('post_id').references(() => blogPosts.id),
  tagId: integer('tag_id').references(() => blogTags.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const blogComments = sqliteTable('blog_comments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  postId: integer('post_id').references(() => blogPosts.id),
  authorId: text('author_id').references(() => user.id),
  authorName: text('author_name'),
  authorEmail: text('author_email'),
  content: text('content').notNull(),
  status: text('status').notNull().default('pending'),
  parentCommentId: integer('parent_comment_id').references(() => blogComments.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const blogRevisions = sqliteTable('blog_revisions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  postId: integer('post_id').references(() => blogPosts.id),
  title: text('title'),
  content: text('content'),
  excerpt: text('excerpt'),
  createdBy: text('created_by').references(() => user.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  changeNote: text('change_note'),
});

export const blogProductLinks = sqliteTable('blog_product_links', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  postId: integer('post_id').references(() => blogPosts.id),
  productId: integer('product_id').references(() => products.id),
  position: integer('position'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const blogAnalytics = sqliteTable('blog_analytics', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  postId: integer('post_id').references(() => blogPosts.id),
  event: text('event').notNull(),
  metadata: text('metadata', { mode: 'json' }),
  userId: text('user_id').references(() => user.id),
  sessionId: text('session_id'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const blogRedirects = sqliteTable('blog_redirects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  fromSlug: text('from_slug').notNull().unique(),
  toSlug: text('to_slug').notNull(),
  statusCode: integer('status_code').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const authorProfiles = sqliteTable('author_profiles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').references(() => user.id).unique(),
  bio: text('bio'),
  avatar: text('avatar'),
  socialLinks: text('social_links', { mode: 'json' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// Auth tables for better-auth
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  role: text("role").notNull().default("user"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});