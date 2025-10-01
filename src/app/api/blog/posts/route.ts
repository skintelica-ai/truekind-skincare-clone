import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { blogPosts, blogCategories, user, blogComments } from '@/db/schema';
import { eq, like, and, or, desc, asc, count, isNull } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single record fetch
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const post = await db.select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        excerpt: blogPosts.excerpt,
        content: blogPosts.content,
        featuredImage: blogPosts.featuredImage,
        featuredImageAlt: blogPosts.featuredImageAlt,
        authorId: blogPosts.authorId,
        categoryId: blogPosts.categoryId,
        status: blogPosts.status,
        publishedAt: blogPosts.publishedAt,
        updatedAt: blogPosts.updatedAt,
        readTime: blogPosts.readTime,
        viewCount: blogPosts.viewCount,
        shareCount: blogPosts.shareCount,
        metaTitle: blogPosts.metaTitle,
        metaDescription: blogPosts.metaDescription,
        focusKeyword: blogPosts.focusKeyword,
        createdAt: blogPosts.createdAt,
        authorName: user.name,
        authorEmail: user.email,
        authorImage: user.image,
        categoryName: blogCategories.name,
        categorySlug: blogCategories.slug,
        commentCount: count(blogComments.id)
      })
      .from(blogPosts)
      .leftJoin(user, eq(blogPosts.authorId, user.id))
      .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
      .leftJoin(blogComments, eq(blogPosts.id, blogComments.postId))
      .where(eq(blogPosts.id, parseInt(id)))
      .groupBy(blogPosts.id)
      .limit(1);

      if (post.length === 0) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
      }

      return NextResponse.json(post[0]);
    }

    // List with filtering, searching, sorting, and pagination
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const categoryId = searchParams.get('categoryId');
    const tagId = searchParams.get('tagId');
    const authorId = searchParams.get('authorId');
    const status = searchParams.get('status') || 'published';
    const sort = searchParams.get('sort') || 'latest';
    const order = searchParams.get('order') || 'desc';

    let query = db.select({
      id: blogPosts.id,
      title: blogPosts.title,
      slug: blogPosts.slug,
      excerpt: blogPosts.excerpt,
      featuredImage: blogPosts.featuredImage,
      featuredImageAlt: blogPosts.featuredImageAlt,
      authorId: blogPosts.authorId,
      categoryId: blogPosts.categoryId,
      status: blogPosts.status,
      publishedAt: blogPosts.publishedAt,
      updatedAt: blogPosts.updatedAt,
      readTime: blogPosts.readTime,
      viewCount: blogPosts.viewCount,
      shareCount: blogPosts.shareCount,
      createdAt: blogPosts.createdAt,
      authorName: user.name,
      authorEmail: user.email,
      authorImage: user.image,
      categoryName: blogCategories.name,
      categorySlug: blogCategories.slug,
      commentCount: count(blogComments.id)
    })
    .from(blogPosts)
    .leftJoin(user, eq(blogPosts.authorId, user.id))
    .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
    .leftJoin(blogComments, eq(blogPosts.id, blogComments.postId))
    .groupBy(blogPosts.id);

    // Build filters
    const filters = [];
    
    // Default to published posts only
    filters.push(eq(blogPosts.status, status));

    if (categoryId) {
      filters.push(eq(blogPosts.categoryId, parseInt(categoryId)));
    }

    if (authorId) {
      filters.push(eq(blogPosts.authorId, authorId));
    }

    if (search) {
      const searchCondition = or(
        like(blogPosts.title, `%${search}%`),
        like(blogPosts.excerpt, `%${search}%`),
        like(blogPosts.content, `%${search}%`),
        like(blogPosts.focusKeyword, `%${search}%`)
      );
      filters.push(searchCondition);
    }

    if (filters.length > 0) {
      query = query.where(and(...filters));
    }

    // Apply sorting
    let orderBy;
    switch (sort) {
      case 'trending':
        orderBy = order === 'desc' 
          ? desc(blogPosts.viewCount + blogPosts.shareCount)
          : asc(blogPosts.viewCount + blogPosts.shareCount);
        break;
      case 'mostRead':
        orderBy = order === 'desc' ? desc(blogPosts.viewCount) : asc(blogPosts.viewCount);
        break;
      case 'oldest':
        orderBy = asc(blogPosts.publishedAt);
        break;
      case 'latest':
      default:
        orderBy = order === 'desc' ? desc(blogPosts.publishedAt) : asc(blogPosts.publishedAt);
        break;
    }

    const results = await query.orderBy(orderBy).limit(limit).offset(offset);

    return NextResponse.json(results);

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const requestBody = await request.json();
    
    // Security check: reject if userId provided in body
    if ('userId' in requestBody || 'user_id' in requestBody || 'authorId' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const { title, slug, content, categoryId, excerpt, featuredImage, featuredImageAlt, metaTitle, metaDescription, focusKeyword } = requestBody;

    // Validate required fields
    if (!title) {
      return NextResponse.json({ 
        error: "Title is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (!slug) {
      return NextResponse.json({ 
        error: "Slug is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (!content) {
      return NextResponse.json({ 
        error: "Content is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (!categoryId) {
      return NextResponse.json({ 
        error: "Category ID is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    // Validate slug uniqueness
    const existingPost = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug.trim())).limit(1);
    if (existingPost.length > 0) {
      return NextResponse.json({ 
        error: "Slug already exists",
        code: "SLUG_EXISTS" 
      }, { status: 400 });
    }

    // Validate category exists
    const category = await db.select().from(blogCategories).where(eq(blogCategories.id, parseInt(categoryId))).limit(1);
    if (category.length === 0) {
      return NextResponse.json({ 
        error: "Invalid category ID",
        code: "INVALID_CATEGORY" 
      }, { status: 400 });
    }

    // Calculate read time (average 200 words per minute)
    const wordCount = content.trim().split(/\s+/).length;
    const readTime = Math.ceil(wordCount / 200);

    const now = new Date();
    const newPost = await db.insert(blogPosts).values({
      title: title.trim(),
      slug: slug.trim(),
      content: content.trim(),
      excerpt: excerpt?.trim(),
      featuredImage: featuredImage?.trim(),
      featuredImageAlt: featuredImageAlt?.trim(),
      authorId: user.id,
      categoryId: parseInt(categoryId),
      status: 'draft',
      readTime,
      viewCount: 0,
      shareCount: 0,
      metaTitle: metaTitle?.trim(),
      metaDescription: metaDescription?.trim(),
      focusKeyword: focusKeyword?.trim(),
      createdAt: now,
      updatedAt: now
    }).returning();

    return NextResponse.json(newPost[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const requestBody = await request.json();
    
    // Security check: reject if userId provided in body
    if ('userId' in requestBody || 'user_id' in requestBody || 'authorId' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    // Check if post exists and belongs to user
    const existingPost = await db.select().from(blogPosts)
      .where(and(eq(blogPosts.id, parseInt(id)), eq(blogPosts.authorId, user.id)))
      .limit(1);

    if (existingPost.length === 0) {
      return NextResponse.json({ error: 'Post not found or access denied' }, { status: 404 });
    }

    const { title, slug, content, categoryId, excerpt, featuredImage, featuredImageAlt, status, metaTitle, metaDescription, focusKeyword } = requestBody;

    // If slug is being updated, check uniqueness
    if (slug && slug !== existingPost[0].slug) {
      const slugExists = await db.select().from(blogPosts)
        .where(and(eq(blogPosts.slug, slug.trim()), eq(blogPosts.id, parseInt(id))))
        .limit(1);
      
      if (slugExists.length > 0) {
        return NextResponse.json({ 
          error: "Slug already exists",
          code: "SLUG_EXISTS" 
        }, { status: 400 });
      }
    }

    // If categoryId is being updated, validate it exists
    if (categoryId) {
      const category = await db.select().from(blogCategories).where(eq(blogCategories.id, parseInt(categoryId))).limit(1);
      if (category.length === 0) {
        return NextResponse.json({ 
          error: "Invalid category ID",
          code: "INVALID_CATEGORY" 
        }, { status: 400 });
      }
    }

    const updates: any = {
      updatedAt: new Date()
    };

    // Add fields that are being updated
    if (title !== undefined) updates.title = title.trim();
    if (slug !== undefined) updates.slug = slug.trim();
    if (content !== undefined) {
      updates.content = content.trim();
      // Recalculate read time if content changes
      const wordCount = content.trim().split(/\s+/).length;
      updates.readTime = Math.ceil(wordCount / 200);
    }
    if (categoryId !== undefined) updates.categoryId = parseInt(categoryId);
    if (excerpt !== undefined) updates.excerpt = excerpt.trim();
    if (featuredImage !== undefined) updates.featuredImage = featuredImage.trim();
    if (featuredImageAlt !== undefined) updates.featuredImageAlt = featuredImageAlt.trim();
    if (metaTitle !== undefined) updates.metaTitle = metaTitle.trim();
    if (metaDescription !== undefined) updates.metaDescription = metaDescription.trim();
    if (focusKeyword !== undefined) updates.focusKeyword = focusKeyword.trim();

    // Handle status change to published
    if (status !== undefined) {
      updates.status = status;
      if (status === 'published' && !existingPost[0].publishedAt) {
        updates.publishedAt = new Date();
      }
    }

    const updated = await db.update(blogPosts)
      .set(updates)
      .where(and(eq(blogPosts.id, parseInt(id)), eq(blogPosts.authorId, user.id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Post not found or access denied' }, { status: 404 });
    }

    return NextResponse.json(updated[0]);

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check if post exists and belongs to user
    const existingPost = await db.select().from(blogPosts)
      .where(and(eq(blogPosts.id, parseInt(id)), eq(blogPosts.authorId, user.id)))
      .limit(1);

    if (existingPost.length === 0) {
      return NextResponse.json({ error: 'Post not found or access denied' }, { status: 404 });
    }

    const deleted = await db.delete(blogPosts)
      .where(and(eq(blogPosts.id, parseInt(id)), eq(blogPosts.authorId, user.id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Post not found or access denied' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Post deleted successfully',
      deletedPost: deleted[0]
    });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}