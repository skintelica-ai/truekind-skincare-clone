import { db } from '@/db';
import { blogComments, blogPosts, user } from '@/db/schema';

async function main() {
    // Get existing post IDs and user IDs
    const posts = await db.select({ id: blogPosts.id }).from(blogPosts);
    const users = await db.select({ id: user.id }).from(user);
    
    if (posts.length === 0) {
        console.log('⚠️ No blog posts found. Please seed blog posts first.');
        return;
    }

    const sampleComments = [
        {
            postId: posts[0]?.id || 1,
            authorId: users[0]?.id || null,
            authorName: null,
            authorEmail: null,
            content: 'This article is incredibly helpful! I\'ve been struggling with my morning skincare routine, and your step-by-step guide makes so much sense. The tip about waiting between serums is something I never knew.',
            status: 'approved',
            parentCommentId: null,
            createdAt: Math.floor(new Date('2024-01-20T09:15:00Z').getTime() / 1000),
        },
        {
            postId: posts[0]?.id || 1,
            authorId: null,
            authorName: 'Sarah Mitchell',
            authorEmail: 'sarah.mitchell@email.com',
            content: 'As a dermatologist, I appreciate how well-researched this content is. You\'ve covered all the essential points about ingredient compatibility and application order.',
            status: 'approved',
            parentCommentId: null,
            createdAt: Math.floor(new Date('2024-01-21T14:30:00Z').getTime() / 1000),
        },
        {
            postId: posts[0]?.id || 1,
            authorId: users[1]?.id || null,
            authorName: null,
            authorEmail: null,
            content: 'Thank you so much for this guide! Quick question - should I apply vitamin C serum before or after niacinamide? I\'ve seen conflicting advice online.',
            status: 'approved',
            parentCommentId: null,
            createdAt: Math.floor(new Date('2024-01-22T11:45:00Z').getTime() / 1000),
        },
        {
            postId: posts[0]?.id || 1,
            authorId: null,
            authorName: 'Dr. Emily Chen',
            authorEmail: 'dr.chen@skincareclinic.com',
            content: '@Lisa Great question! I recommend using vitamin C in the morning and niacinamide in the evening to avoid any potential interactions. Both are excellent ingredients but work best when used separately.',
            status: 'approved',
            parentCommentId: 3,
            createdAt: Math.floor(new Date('2024-01-22T16:20:00Z').getTime() / 1000),
        },
        {
            postId: posts[Math.min(1, posts.length - 1)]?.id || 2,
            authorId: users[2]?.id || null,
            authorName: null,
            authorEmail: null,
            content: 'I\'ve been using retinol for 6 months now following your previous articles, and the results are amazing! My fine lines have significantly reduced. Starting slow was definitely the key.',
            status: 'approved',
            parentCommentId: null,
            createdAt: Math.floor(new Date('2024-01-25T19:30:00Z').getTime() / 1000),
        },
        {
            postId: posts[Math.min(1, posts.length - 1)]?.id || 2,
            authorId: null,
            authorName: 'Jessica Wong',
            authorEmail: 'jessica.wong@gmail.com',
            content: 'This is exactly what I needed! I\'m 35 and just starting to notice some changes in my skin. Your approach seems gentle yet effective. Can you recommend a good beginner retinol product?',
            status: 'approved',
            parentCommentId: null,
            createdAt: Math.floor(new Date('2024-01-26T08:15:00Z').getTime() / 1000),
        },
        {
            postId: posts[Math.min(1, posts.length - 1)]?.id || 2,
            authorId: null,
            authorName: 'Mark Stevens',
            authorEmail: 'mark.stevens@outlook.com',
            content: 'Great article! As a guy who\'s new to skincare, I appreciate how you explain everything without making it too complicated. The product recommendations are perfect for beginners.',
            status: 'pending',
            parentCommentId: null,
            createdAt: Math.floor(new Date('2024-01-27T12:00:00Z').getTime() / 1000),
        },
        {
            postId: posts[Math.min(2, posts.length - 1)]?.id || 3,
            authorId: users[0]?.id || null,
            authorName: null,
            authorEmail: null,
            content: 'The hydrating serum you recommended has been a game-changer for my dry skin! I\'ve been using it for 3 weeks and my skin feels so much more plump and healthy.',
            status: 'approved',
            parentCommentId: null,
            createdAt: Math.floor(new Date('2024-02-01T10:30:00Z').getTime() / 1000),
        },
        {
            postId: posts[Math.min(2, posts.length - 1)]?.id || 3,
            authorId: null,
            authorName: 'Amanda Rodriguez',
            authorEmail: 'amanda.r@email.com',
            content: 'I love how you break down the science behind hyaluronic acid! It\'s so refreshing to read content that\'s both educational and practical. My skin has never looked better.',
            status: 'approved',
            parentCommentId: null,
            createdAt: Math.floor(new Date('2024-02-02T15:45:00Z').getTime() / 1000),
        },
        {
            postId: posts[Math.min(2, posts.length - 1)]?.id || 3,
            authorId: users[3]?.id || null,
            authorName: null,
            authorEmail: null,
            content: 'Quick question about layering - should I apply hyaluronic acid on damp skin or dry skin? I\'ve heard different recommendations and want to make sure I\'m doing it right.',
            status: 'approved',
            parentCommentId: null,
            createdAt: Math.floor(new Date('2024-02-03T09:20:00Z').getTime() / 1000),
        },
        {
            postId: posts[Math.min(3, posts.length - 1)]?.id || 4,
            authorId: null,
            authorName: 'Linda Thompson',
            authorEmail: 'linda.thompson@yahoo.com',
            content: 'This SPF guide is fantastic! I had no idea about the difference between chemical and physical sunscreens. I\'ve been using the wrong type for my sensitive skin all this time.',
            status: 'approved',
            parentCommentId: null,
            createdAt: Math.floor(new Date('2024-02-05T13:10:00Z').getTime() / 1000),
        },
        {
            postId: posts[Math.min(3, posts.length - 1)]?.id || 4,
            authorId: users[1]?.id || null,
            authorName: null,
            authorEmail: null,
            content: 'The mineral sunscreen you recommended is perfect! No white cast and it plays so well under makeup. Thank you for such thorough testing and honest reviews.',
            status: 'approved',
            parentCommentId: null,
            createdAt: Math.floor(new Date('2024-02-06T16:55:00Z').getTime() / 1000),
        },
        {
            postId: posts[Math.min(4, posts.length - 1)]?.id || 5,
            authorId: null,
            authorName: 'Robert Kim',
            authorEmail: 'robert.kim@gmail.com',
            content: 'Your acne treatment guide helped me so much! I\'ve struggled with adult acne for years, and your gentle approach has finally given me clear skin. The ingredient explanations were particularly helpful.',
            status: 'pending',
            parentCommentId: null,
            createdAt: Math.floor(new Date('2024-02-08T11:30:00Z').getTime() / 1000),
        },
        {
            postId: posts[Math.min(4, posts.length - 1)]?.id || 5,
            authorId: users[2]?.id || null,
            authorName: null,
            authorEmail: null,
            content: 'The salicylic acid cleanser recommendation was spot on! My blackheads have significantly reduced, and my skin texture is so much smoother. Will definitely be trying more of your product suggestions.',
            status: 'approved',
            parentCommentId: null,
            createdAt: Math.floor(new Date('2024-02-09T14:20:00Z').getTime() / 1000),
        },
        {
            postId: posts[Math.min(0, posts.length - 1)]?.id || 1,
            authorId: null,
            authorName: 'Maria Gonzalez',
            authorEmail: 'maria.gonzalez@email.com',
            content: 'I\'ve been following your blog for months now, and every single recommendation has worked perfectly for my combination skin. Your expertise really shows in how well you understand different skin types and concerns.',
            status: 'approved',
            parentCommentId: null,
            createdAt: Math.floor(new Date('2024-02-10T18:45:00Z').getTime() / 1000),
        }
    ];

    await db.insert(blogComments).values(sampleComments);
    
    console.log('✅ Blog comments seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});