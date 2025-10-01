import { db } from '@/db';
import { blogCategories } from '@/db/schema';

async function main() {
    const sampleCategories = [
        {
            name: 'Skincare Tips',
            slug: 'skincare-tips',
            description: 'Expert advice and proven techniques for maintaining healthy, glowing skin. From daily routines to targeted treatments for specific skin concerns.',
            createdAt: Math.floor(new Date('2024-01-15').getTime() / 1000),
        },
        {
            name: 'Ingredients Guide',
            slug: 'ingredients-guide',
            description: 'Comprehensive insights into skincare ingredients and their benefits. Learn about active compounds, natural extracts, and how they work to improve your skin.',
            createdAt: Math.floor(new Date('2024-01-20').getTime() / 1000),
        },
        {
            name: 'Wellness & Lifestyle',
            slug: 'wellness-lifestyle',
            description: 'Holistic approach to beauty and wellness. Explore how lifestyle choices, nutrition, and self-care practices contribute to overall skin health and well-being.',
            createdAt: Math.floor(new Date('2024-01-25').getTime() / 1000),
        }
    ];

    await db.insert(blogCategories).values(sampleCategories);
    
    console.log('✅ Blog categories seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});