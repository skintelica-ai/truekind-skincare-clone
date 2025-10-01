import { db } from '@/db';
import { blogPostTags } from '@/db/schema';

async function main() {
    const sampleBlogPostTags = [
        // Post 1 (Anti-aging routine): Anti-Aging, Routines, Hydration
        {
            postId: 1,
            tagId: 1, // Anti-Aging
            createdAt: Math.floor(new Date('2024-01-10').getTime() / 1000),
        },
        {
            postId: 1,
            tagId: 2, // Routines
            createdAt: Math.floor(new Date('2024-01-10').getTime() / 1000),
        },
        {
            postId: 1,
            tagId: 3, // Hydration
            createdAt: Math.floor(new Date('2024-01-10').getTime() / 1000),
        },

        // Post 2 (Hydration ingredients): Hydration, Natural Beauty, Sensitive Skin
        {
            postId: 2,
            tagId: 3, // Hydration
            createdAt: Math.floor(new Date('2024-01-12').getTime() / 1000),
        },
        {
            postId: 2,
            tagId: 4, // Natural Beauty
            createdAt: Math.floor(new Date('2024-01-12').getTime() / 1000),
        },
        {
            postId: 2,
            tagId: 5, // Sensitive Skin
            createdAt: Math.floor(new Date('2024-01-12').getTime() / 1000),
        },

        // Post 3 (Sensitive skin): Sensitive Skin, Natural Beauty, Routines
        {
            postId: 3,
            tagId: 5, // Sensitive Skin
            createdAt: Math.floor(new Date('2024-01-15').getTime() / 1000),
        },
        {
            postId: 3,
            tagId: 4, // Natural Beauty
            createdAt: Math.floor(new Date('2024-01-15').getTime() / 1000),
        },
        {
            postId: 3,
            tagId: 2, // Routines
            createdAt: Math.floor(new Date('2024-01-15').getTime() / 1000),
        },

        // Post 4 (Natural ingredients): Natural Beauty, Eco-Friendly, DIY Skincare
        {
            postId: 4,
            tagId: 4, // Natural Beauty
            createdAt: Math.floor(new Date('2024-01-18').getTime() / 1000),
        },
        {
            postId: 4,
            tagId: 6, // Eco-Friendly
            createdAt: Math.floor(new Date('2024-01-18').getTime() / 1000),
        },
        {
            postId: 4,
            tagId: 7, // DIY Skincare
            createdAt: Math.floor(new Date('2024-01-18').getTime() / 1000),
        },

        // Post 5 (Vitamin C): Brightening, Anti-Aging, Product Reviews
        {
            postId: 5,
            tagId: 8, // Brightening
            createdAt: Math.floor(new Date('2024-01-20').getTime() / 1000),
        },
        {
            postId: 5,
            tagId: 1, // Anti-Aging
            createdAt: Math.floor(new Date('2024-01-20').getTime() / 1000),
        },
        {
            postId: 5,
            tagId: 9, // Product Reviews
            createdAt: Math.floor(new Date('2024-01-20').getTime() / 1000),
        },

        // Post 6 (Adult acne): Acne Care, Sensitive Skin, Routines
        {
            postId: 6,
            tagId: 10, // Acne Care
            createdAt: Math.floor(new Date('2024-01-22').getTime() / 1000),
        },
        {
            postId: 6,
            tagId: 5, // Sensitive Skin
            createdAt: Math.floor(new Date('2024-01-22').getTime() / 1000),
        },
        {
            postId: 6,
            tagId: 2, // Routines
            createdAt: Math.floor(new Date('2024-01-22').getTime() / 1000),
        },

        // Post 7 (Nighttime routine): Routines, Anti-Aging, Hydration
        {
            postId: 7,
            tagId: 2, // Routines
            createdAt: Math.floor(new Date('2024-01-25').getTime() / 1000),
        },
        {
            postId: 7,
            tagId: 1, // Anti-Aging
            createdAt: Math.floor(new Date('2024-01-25').getTime() / 1000),
        },
        {
            postId: 7,
            tagId: 3, // Hydration
            createdAt: Math.floor(new Date('2024-01-25').getTime() / 1000),
        },

        // Post 8 (Luxury guide): Product Reviews, Anti-Aging, Brightening
        {
            postId: 8,
            tagId: 9, // Product Reviews
            createdAt: Math.floor(new Date('2024-01-28').getTime() / 1000),
        },
        {
            postId: 8,
            tagId: 1, // Anti-Aging
            createdAt: Math.floor(new Date('2024-01-28').getTime() / 1000),
        },
        {
            postId: 8,
            tagId: 8, // Brightening
            createdAt: Math.floor(new Date('2024-01-28').getTime() / 1000),
        }
    ];

    await db.insert(blogPostTags).values(sampleBlogPostTags);
    
    console.log('✅ Blog post tags seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});