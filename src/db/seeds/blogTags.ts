import { db } from '@/db';
import { blogTags } from '@/db/schema';

async function main() {
    const sampleTags = [
        {
            name: 'Anti-Aging',
            slug: 'anti-aging',
            createdAt: Math.floor(new Date('2024-01-10').getTime() / 1000),
        },
        {
            name: 'Hydration',
            slug: 'hydration',
            createdAt: Math.floor(new Date('2024-01-12').getTime() / 1000),
        },
        {
            name: 'Natural Beauty',
            slug: 'natural-beauty',
            createdAt: Math.floor(new Date('2024-01-15').getTime() / 1000),
        },
        {
            name: 'Sensitive Skin',
            slug: 'sensitive-skin',
            createdAt: Math.floor(new Date('2024-01-18').getTime() / 1000),
        },
        {
            name: 'Acne Care',
            slug: 'acne-care',
            createdAt: Math.floor(new Date('2024-01-20').getTime() / 1000),
        },
        {
            name: 'Brightening',
            slug: 'brightening',
            createdAt: Math.floor(new Date('2024-01-22').getTime() / 1000),
        },
        {
            name: 'Eco-Friendly',
            slug: 'eco-friendly',
            createdAt: Math.floor(new Date('2024-01-25').getTime() / 1000),
        },
        {
            name: 'DIY Skincare',
            slug: 'diy-skincare',
            createdAt: Math.floor(new Date('2024-01-28').getTime() / 1000),
        },
        {
            name: 'Product Reviews',
            slug: 'product-reviews',
            createdAt: Math.floor(new Date('2024-02-01').getTime() / 1000),
        },
        {
            name: 'Routines',
            slug: 'routines',
            createdAt: Math.floor(new Date('2024-02-03').getTime() / 1000),
        },
    ];

    await db.insert(blogTags).values(sampleTags);
    
    console.log('✅ Blog tags seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});