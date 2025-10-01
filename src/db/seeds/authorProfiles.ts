import { db } from '@/db';
import { authorProfiles, user } from '@/db/schema';

async function main() {
    // First, get existing user IDs
    const existingUsers = await db.select({ id: user.id }).from(user).limit(2);
    
    if (existingUsers.length < 2) {
        console.log('⚠️ Warning: Less than 2 users found in database. Creating profiles for available users only.');
    }

    const sampleAuthorProfiles = [
        {
            userId: existingUsers[0]?.id || 'user_01h4kxt2e8z9y3b1n7m6q5w8r4',
            bio: 'Dr. Sarah Williams is a board-certified dermatologist with over 15 years of experience in clinical dermatology and cosmetic procedures. She specializes in anti-aging treatments, acne management, and luxury skincare formulations. Dr. Williams has published numerous research papers on skincare ingredients and their effects on various skin types. She is passionate about educating people on proper skincare routines and the science behind effective beauty products.',
            avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face',
            socialLinks: JSON.stringify({
                instagram: 'https://instagram.com/drsarahskincare',
                twitter: 'https://twitter.com/drsarahwilliams',
                linkedin: 'https://linkedin.com/in/drsarahwilliams'
            }),
            createdAt: new Date('2024-01-15').getTime(),
            updatedAt: new Date('2024-01-15').getTime(),
        },
        {
            userId: existingUsers[1]?.id || 'user_01h4kxt2e8z9y3b1n7m6q5w8r5',
            bio: 'Emma Chen is a beauty blogger and wellness content creator with a passion for natural skincare and holistic beauty approaches. With over 500K followers across social platforms, she shares honest product reviews, DIY skincare recipes, and tips for achieving radiant skin naturally. Emma believes in the power of clean ingredients and sustainable beauty practices. Her content focuses on helping people build confidence through self-care rituals and mindful beauty choices.',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
            socialLinks: JSON.stringify({
                instagram: 'https://instagram.com/emmachenbeauty',
                youtube: 'https://youtube.com/@emmachenbeauty',
                tiktok: 'https://tiktok.com/@emmachenbeauty'
            }),
            createdAt: new Date('2024-01-20').getTime(),
            updatedAt: new Date('2024-01-20').getTime(),
        }
    ];

    await db.insert(authorProfiles).values(sampleAuthorProfiles);
    
    console.log('✅ Author profiles seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});