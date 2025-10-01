PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_cart_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`session_id` text,
	`user_id` text,
	`product_id` integer,
	`quantity` integer DEFAULT 1,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_cart_items`("id", "session_id", "user_id", "product_id", "quantity", "created_at", "updated_at") SELECT "id", "session_id", "user_id", "product_id", "quantity", "created_at", "updated_at" FROM `cart_items`;--> statement-breakpoint
DROP TABLE `cart_items`;--> statement-breakpoint
ALTER TABLE `__new_cart_items` RENAME TO `cart_items`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_number` text NOT NULL,
	`user_id` text,
	`session_id` text,
	`status` text NOT NULL,
	`subtotal` real NOT NULL,
	`discount_amount` real DEFAULT 0,
	`tax_amount` real DEFAULT 0,
	`shipping_amount` real DEFAULT 0,
	`total_amount` real NOT NULL,
	`coupon_code` text,
	`payment_method` text NOT NULL,
	`payment_status` text NOT NULL,
	`shipping_address` text NOT NULL,
	`billing_address` text,
	`tracking_number` text,
	`notes` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_orders`("id", "order_number", "user_id", "session_id", "status", "subtotal", "discount_amount", "tax_amount", "shipping_amount", "total_amount", "coupon_code", "payment_method", "payment_status", "shipping_address", "billing_address", "tracking_number", "notes", "created_at", "updated_at") SELECT "id", "order_number", "user_id", "session_id", "status", "subtotal", "discount_amount", "tax_amount", "shipping_amount", "total_amount", "coupon_code", "payment_method", "payment_status", "shipping_address", "billing_address", "tracking_number", "notes", "created_at", "updated_at" FROM `orders`;--> statement-breakpoint
DROP TABLE `orders`;--> statement-breakpoint
ALTER TABLE `__new_orders` RENAME TO `orders`;--> statement-breakpoint
CREATE UNIQUE INDEX `orders_order_number_unique` ON `orders` (`order_number`);--> statement-breakpoint
CREATE TABLE `__new_reviews` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_id` integer,
	`user_id` text,
	`rating` integer NOT NULL,
	`title` text,
	`comment` text NOT NULL,
	`is_verified` integer DEFAULT false,
	`helpful_count` integer DEFAULT 0,
	`created_at` text NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_reviews`("id", "product_id", "user_id", "rating", "title", "comment", "is_verified", "helpful_count", "created_at") SELECT "id", "product_id", "user_id", "rating", "title", "comment", "is_verified", "helpful_count", "created_at" FROM `reviews`;--> statement-breakpoint
DROP TABLE `reviews`;--> statement-breakpoint
ALTER TABLE `__new_reviews` RENAME TO `reviews`;--> statement-breakpoint
CREATE TABLE `__new_wishlist_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`session_id` text,
	`user_id` text,
	`product_id` integer,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_wishlist_items`("id", "session_id", "user_id", "product_id", "created_at") SELECT "id", "session_id", "user_id", "product_id", "created_at" FROM `wishlist_items`;--> statement-breakpoint
DROP TABLE `wishlist_items`;--> statement-breakpoint
ALTER TABLE `__new_wishlist_items` RENAME TO `wishlist_items`;