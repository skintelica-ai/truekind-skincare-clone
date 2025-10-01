import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { blogPosts, blogCategories, user, authorProfiles } from '@/db/schema';
import { eq, and, ne, desc } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    if (!slug) {
      return NextResponse.json({ 
        error: "Slug parameter is required",
        code: "MISSING_SLUG" 
      }, { status: 400 });
    }

    // Fetch the main blog post with author and category details
    const postQuery = await db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        excerpt: blogPosts.excerpt,
        content: blogPosts.content,
        featuredImage: blogPosts.featuredImage,
        featuredImageAlt: blogPosts.featuredImageAlt,
        status: blogPosts.status,
        publishedAt: blogPosts.publishedAt,
        updatedAt: blogPosts.updatedAt,
        readTime: blogPosts.readTime,
        viewCount: blogPosts.viewCount,
        shareCount: blogPosts.shareCount,
        metaTitle: blogPosts.metaTitle,
        metaDescription: blogPosts.metaDescription,
        canonicalUrl: blogPosts.canonicalUrl,
        robotsMeta: blogPosts.robotsMeta,
        ogTitle: blogPosts.ogTitle,
        ogDescription: blogPosts.ogDescription,
        ogImage: blogPosts.ogImage,
        twitterTitle: blogPosts.twitterTitle,
        twitterDescription: blogPosts.twitterDescription,
        twitterImage: blogPosts.twitterImage,
        focusKeyword: blogPosts.focusKeyword,
        seoScore: blogPosts.seoScore,
        createdAt: blogPosts.createdAt,
        author: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          bio: authorProfiles.bio,
          avatar: authorProfiles.avatar,
          socialLinks: authorProfiles.socialLinks
        },
        category: {
          id: blogCategories.id,
          name: blogCategories.name,
          slug: blogCategories.slug,
          description: blogCategories.description
        }
      })
      .from(blogPosts)
      .leftJoin(user, eq(blogPosts.authorId, user.id))
      .leftJoin(authorProfiles, eq(user.id, authorProfiles.userId))
      .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
      .where(
        and(
          eq(blogPosts.slug, slug),
          eq(blogPosts.status, 'published')
        )
      )
      .limit(1);

    if (postQuery.length === 0) {
      return NextResponse.json({ 
        error: 'Blog post not found or not published',
        code: 'POST_NOT_FOUND' 
      }, { status: 404 });
    }

    const post = postQuery[0];

    // Increment view count
    await db
      .update(blogPosts)
      .set({
        viewCount: (post.viewCount || 0) + 1,
        updatedAt: new Date()
      })
      .where(eq(blogPosts.id, post.id));

    // Fetch related posts (same category, exclude current post, max 4)
    let relatedPosts = [];
    if (post.category?.id) {
      const relatedQuery = await db
        .select({
          id: blogPosts.id,
          title: blogPosts.title,
          slug: blogPosts.slug,
          excerpt: blogPosts.excerpt,
          featuredImage: blogPosts.featuredImage,
          publishedAt: blogPosts.publishedAt,
          author: {
            id: user.id,
            name: user.name,
            image: user.image
          }
        })
        .from(blogPosts)
        .leftJoin(user, eq(blogPosts.authorId, user.id))
        .where(
          and(
            eq(blogPosts.categoryId, post.category.id),
            eq(blogPosts.status, 'published'),
            ne(blogPosts.id, post.id)
          )
        )
        .orderBy(desc(blogPosts.publishedAt))
        .limit(4);

      relatedPosts = relatedQuery;
    }

    // Update the post object with incremented view count
    const updatedPost = {
      ...post,
      viewCount: (post.viewCount || 0) + 1
    };

    return NextResponse.json({
      ...updatedPost,
      relatedPosts
    });

  } catch (error) {
    console.error('GET blog post error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}