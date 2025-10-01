import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { blogTags, blogPostTags, blogPosts } from '@/db/schema';
import { eq, like, and, or, desc, asc, count, sql } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'name';
    const order = searchParams.get('order') || 'asc';
    const id = searchParams.get('id');

    // Single record fetch
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const tag = await db
        .select({
          id: blogTags.id,
          name: blogTags.name,
          slug: blogTags.slug,
          createdAt: blogTags.createdAt,
          postCount: sql<number>`COALESCE(COUNT(CASE WHEN ${blogPosts.status} = 'published' THEN 1 END), 0)`
        })
        .from(blogTags)
        .leftJoin(blogPostTags, eq(blogTags.id, blogPostTags.tagId))
        .leftJoin(blogPosts, eq(blogPostTags.postId, blogPosts.id))
        .where(eq(blogTags.id, parseInt(id)))
        .groupBy(blogTags.id)
        .limit(1);

      if (tag.length === 0) {
        return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
      }

      return NextResponse.json(tag[0]);
    }

    // List with search and pagination
    let query = db
      .select({
        id: blogTags.id,
        name: blogTags.name,
        slug: blogTags.slug,
        createdAt: blogTags.createdAt,
        postCount: sql<number>`COALESCE(COUNT(CASE WHEN ${blogPosts.status} = 'published' THEN 1 END), 0)`
      })
      .from(blogTags)
      .leftJoin(blogPostTags, eq(blogTags.id, blogPostTags.tagId))
      .leftJoin(blogPosts, eq(blogPostTags.postId, blogPosts.id))
      .groupBy(blogTags.id);

    if (search) {
      const searchCondition = like(blogTags.name, `%${search}%`);
      query = query.having(searchCondition);
    }

    // Apply sorting
    if (sort === 'postCount') {
      query = order === 'desc' 
        ? query.orderBy(desc(sql`COALESCE(COUNT(CASE WHEN ${blogPosts.status} = 'published' THEN 1 END), 0)`))
        : query.orderBy(asc(sql`COALESCE(COUNT(CASE WHEN ${blogPosts.status} = 'published' THEN 1 END), 0)`));
    } else {
      query = order === 'desc' 
        ? query.orderBy(desc(blogTags.name))
        : query.orderBy(asc(blogTags.name));
    }

    const results = await query.limit(limit).offset(offset);

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
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const requestBody = await request.json();
    const { name, slug } = requestBody;

    // Security check: reject if userId provided in body
    if ('userId' in requestBody || 'user_id' in requestBody || 'authorId' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json({ 
        error: "Name and slug are required",
        code: "MISSING_REQUIRED_FIELDS" 
      }, { status: 400 });
    }

    // Sanitize inputs
    const sanitizedName = name.trim();
    const sanitizedSlug = slug.trim().toLowerCase();

    if (!sanitizedName || !sanitizedSlug) {
      return NextResponse.json({ 
        error: "Name and slug cannot be empty",
        code: "EMPTY_REQUIRED_FIELDS" 
      }, { status: 400 });
    }

    // Check name uniqueness
    const existingNameTag = await db.select()
      .from(blogTags)
      .where(eq(blogTags.name, sanitizedName))
      .limit(1);

    if (existingNameTag.length > 0) {
      return NextResponse.json({ 
        error: "Tag name already exists",
        code: "DUPLICATE_NAME" 
      }, { status: 400 });
    }

    // Check slug uniqueness
    const existingSlugTag = await db.select()
      .from(blogTags)
      .where(eq(blogTags.slug, sanitizedSlug))
      .limit(1);

    if (existingSlugTag.length > 0) {
      return NextResponse.json({ 
        error: "Tag slug already exists",
        code: "DUPLICATE_SLUG" 
      }, { status: 400 });
    }

    const newTag = await db.insert(blogTags)
      .values({
        name: sanitizedName,
        slug: sanitizedSlug,
        createdAt: new Date().getTime()
      })
      .returning();

    return NextResponse.json(newTag[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const requestBody = await request.json();
    const { name, slug } = requestBody;

    // Security check: reject if userId provided in body
    if ('userId' in requestBody || 'user_id' in requestBody || 'authorId' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    // Check if tag exists
    const existingTag = await db.select()
      .from(blogTags)
      .where(eq(blogTags.id, parseInt(id)))
      .limit(1);

    if (existingTag.length === 0) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    const updates: any = {};

    // Validate and prepare name update
    if (name !== undefined) {
      const sanitizedName = name.trim();
      if (!sanitizedName) {
        return NextResponse.json({ 
          error: "Name cannot be empty",
          code: "EMPTY_NAME" 
        }, { status: 400 });
      }

      // Check name uniqueness if changed
      if (sanitizedName !== existingTag[0].name) {
        const duplicateName = await db.select()
          .from(blogTags)
          .where(eq(blogTags.name, sanitizedName))
          .limit(1);

        if (duplicateName.length > 0) {
          return NextResponse.json({ 
            error: "Tag name already exists",
            code: "DUPLICATE_NAME" 
          }, { status: 400 });
        }
      }

      updates.name = sanitizedName;
    }

    // Validate and prepare slug update
    if (slug !== undefined) {
      const sanitizedSlug = slug.trim().toLowerCase();
      if (!sanitizedSlug) {
        return NextResponse.json({ 
          error: "Slug cannot be empty",
          code: "EMPTY_SLUG" 
        }, { status: 400 });
      }

      // Check slug uniqueness if changed
      if (sanitizedSlug !== existingTag[0].slug) {
        const duplicateSlug = await db.select()
          .from(blogTags)
          .where(eq(blogTags.slug, sanitizedSlug))
          .limit(1);

        if (duplicateSlug.length > 0) {
          return NextResponse.json({ 
            error: "Tag slug already exists",
            code: "DUPLICATE_SLUG" 
          }, { status: 400 });
        }
      }

      updates.slug = sanitizedSlug;
    }

    // If no updates provided, return error
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ 
        error: "No valid updates provided",
        code: "NO_UPDATES" 
      }, { status: 400 });
    }

    const updated = await db.update(blogTags)
      .set(updates)
      .where(eq(blogTags.id, parseInt(id)))
      .returning();

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
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if tag exists
    const existingTag = await db.select()
      .from(blogTags)
      .where(eq(blogTags.id, parseInt(id)))
      .limit(1);

    if (existingTag.length === 0) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    // Check if tag is used in posts
    const tagUsage = await db.select()
      .from(blogPostTags)
      .where(eq(blogPostTags.tagId, parseInt(id)))
      .limit(1);

    if (tagUsage.length > 0) {
      return NextResponse.json({ 
        error: "Cannot delete tag that is used in blog posts. Remove tag from all posts first.",
        code: "TAG_IN_USE" 
      }, { status: 400 });
    }

    const deleted = await db.delete(blogTags)
      .where(eq(blogTags.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      message: "Tag deleted successfully",
      deletedTag: deleted[0]
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}