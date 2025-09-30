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
  userId: integer('user_id'),
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
  userId: integer('user_id'),
  productId: integer('product_id').references(() => products.id),
  quantity: integer('quantity').default(1),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Wishlist Items table - Save for later
export const wishlistItems = sqliteTable('wishlist_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sessionId: text('session_id'),
  userId: integer('user_id'),
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
  userId: integer('user_id'),
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