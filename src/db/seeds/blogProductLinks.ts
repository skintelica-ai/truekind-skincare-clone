import { db } from '@/db';
import { blogProductLinks } from '@/db/schema';

async function main() {
    const sampleBlogProductLinks = [
        // Anti-aging post (post ID 1) - link to anti-aging serums, moisturizers
        {
            postId: 1,
            productId: 3,
            position: 1,
            createdAt: Math.floor(new Date('2024-01-15T10:30:00Z').getTime() / 1000),
        },
        {
            postId: 1,
            productId: 7,
            position: 2,
            createdAt: Math.floor(new Date('2024-01-15T10:30:00Z').getTime() / 1000),
        },
        {
            postId: 1,
            productId: 15,
            position: 3,
            createdAt: Math.floor(new Date('2024-01-15T10:30:00Z').getTime() / 1000),
        },

        // Hydration post (post ID 2) - link to hydrating serums, moisturizers
        {
            postId: 2,
            productId: 5,
            position: 1,
            createdAt: Math.floor(new Date('2024-01-20T14:15:00Z').getTime() / 1000),
        },
        {
            postId: 2,
            productId: 11,
            position: 2,
            createdAt: Math.floor(new Date('2024-01-20T14:15:00Z').getTime() / 1000),
        },
        {
            postId: 2,
            productId: 18,
            position: 3,
            createdAt: Math.floor(new Date('2024-01-20T14:15:00Z').getTime() / 1000),
        },

        // Sensitive skin post (post ID 3) - link to gentle cleansers, soothing products
        {
            postId: 3,
            productId: 2,
            position: 1,
            createdAt: Math.floor(new Date('2024-01-25T09:45:00Z').getTime() / 1000),
        },
        {
            postId: 3,
            productId: 8,
            position: 2,
            createdAt: Math.floor(new Date('2024-01-25T09:45:00Z').getTime() / 1000),
        },
        {
            postId: 3,
            productId: 14,
            position: 3,
            createdAt: Math.floor(new Date('2024-01-25T09:45:00Z').getTime() / 1000),
        },
        {
            postId: 3,
            productId: 19,
            position: 4,
            createdAt: Math.floor(new Date('2024-01-25T09:45:00Z').getTime() / 1000),
        },

        // Natural beauty post (post ID 4) - link to natural/organic products
        {
            postId: 4,
            productId: 6,
            position: 1,
            createdAt: Math.floor(new Date('2024-02-01T16:20:00Z').getTime() / 1000),
        },
        {
            postId: 4,
            productId: 12,
            position: 2,
            createdAt: Math.floor(new Date('2024-02-01T16:20:00Z').getTime() / 1000),
        },
        {
            postId: 4,
            productId: 17,
            position: 3,
            createdAt: Math.floor(new Date('2024-02-01T16:20:00Z').getTime() / 1000),
        },

        // Vitamin C post (post ID 5) - link to vitamin C serums, brightening products
        {
            postId: 5,
            productId: 4,
            position: 1,
            createdAt: Math.floor(new Date('2024-02-05T11:00:00Z').getTime() / 1000),
        },
        {
            postId: 5,
            productId: 9,
            position: 2,
            createdAt: Math.floor(new Date('2024-02-05T11:00:00Z').getTime() / 1000),
        },
        {
            postId: 5,
            productId: 16,
            position: 3,
            createdAt: Math.floor(new Date('2024-02-05T11:00:00Z').getTime() / 1000),
        },

        // Acne post (post ID 6) - link to acne treatment products, gentle cleansers
        {
            postId: 6,
            productId: 1,
            position: 1,
            createdAt: Math.floor(new Date('2024-02-10T13:30:00Z').getTime() / 1000),
        },
        {
            postId: 6,
            productId: 10,
            position: 2,
            createdAt: Math.floor(new Date('2024-02-10T13:30:00Z').getTime() / 1000),
        },
        {
            postId: 6,
            productId: 20,
            position: 3,
            createdAt: Math.floor(new Date('2024-02-10T13:30:00Z').getTime() / 1000),
        },

        // Nighttime routine post (post ID 7) - link to night creams, serums
        {
            postId: 7,
            productId: 13,
            position: 1,
            createdAt: Math.floor(new Date('2024-02-15T18:45:00Z').getTime() / 1000),
        },
        {
            postId: 7,
            productId: 21,
            position: 2,
            createdAt: Math.floor(new Date('2024-02-15T18:45:00Z').getTime() / 1000),
        },

        // Luxury guide post (post ID 8) - link to premium/luxury products
        {
            postId: 8,
            productId: 22,
            position: 1,
            createdAt: Math.floor(new Date('2024-02-20T12:15:00Z').getTime() / 1000),
        },
        {
            postId: 8,
            productId: 23,
            position: 2,
            createdAt: Math.floor(new Date('2024-02-20T12:15:00Z').getTime() / 1000),
        },
        {
            postId: 8,
            productId: 24,
            position: 3,
            createdAt: Math.floor(new Date('2024-02-20T12:15:00Z').getTime() / 1000),
        }
    ];

    await db.insert(blogProductLinks).values(sampleBlogProductLinks);
    
    console.log('✅ Blog product links seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});