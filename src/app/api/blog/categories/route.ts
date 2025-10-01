import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { blogCategories, blogPosts } from '@/db/schema';
import { eq, like, and, or, desc, asc, count, sql } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'name';
    const order = searchParams.get('order') || 'asc';

    // Single category fetch
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const categoryWithCount = await db
        .select({
          id: blogCategories.id,
          name: blogCategories.name,
          slug: blogCategories.slug,
          description: blogCategories.description,
          createdAt: blogCategories.createdAt,
          postCount: count(blogPosts.id)
        })
        .from(blogCategories)
        .leftJoin(blogPosts, and(
          eq(blogPosts.categoryId, blogCategories.id),
          eq(blogPosts.status, 'published')
        ))
        .where(eq(blogCategories.id, parseInt(id)))
        .groupBy(blogCategories.id)
        .limit(1);

      if (categoryWithCount.length === 0) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 });
      }

      return NextResponse.json(categoryWithCount[0]);
    }

    // List categories with post counts
    let query = db
      .select({
        id: blogCategories.id,
        name: blogCategories.name,
        slug: blogCategories.slug,
        description: blogCategories.description,
        createdAt: blogCategories.createdAt,
        postCount: count(blogPosts.id)
      })
      .from(blogCategories)
      .leftJoin(blogPosts, and(
        eq(blogPosts.categoryId, blogCategories.id),
        eq(blogPosts.status, 'published')
      ))
      .groupBy(blogCategories.id);

    // Apply search filter
    if (search) {
      query = query.where(
        like(blogCategories.name, `%${search}%`)
      );
    }

    // Apply sorting
    if (sort === 'postCount') {
      query = order === 'desc' 
        ? query.orderBy(desc(count(blogPosts.id)))
        : query.orderBy(asc(count(blogPosts.id)));
    } else {
      query = order === 'desc' 
        ? query.orderBy(desc(blogCategories.name))
        : query.orderBy(asc(blogCategories.name));
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
    const { name, slug, description } = requestBody;

    // Security check: reject if user ID provided in body
    if ('userId' in requestBody || 'user_id' in requestBody || 'authorId' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    // Validate required fields
    if (!name) {
      return NextResponse.json({ 
        error: "Name is required",
        code: "MISSING_NAME" 
      }, { status: 400 });
    }

    if (!slug) {
      return NextResponse.json({ 
        error: "Slug is required",
        code: "MISSING_SLUG" 
      }, { status: 400 });
    }

    // Sanitize inputs
    const sanitizedName = name.trim();
    const sanitizedSlug = slug.trim().toLowerCase();

    // Check name uniqueness
    const existingName = await db.select()
      .from(blogCategories)
      .where(eq(blogCategories.name, sanitizedName))
      .limit(1);

    if (existingName.length > 0) {
      return NextResponse.json({ 
        error: "Category name already exists",
        code: "NAME_EXISTS" 
      }, { status: 400 });
    }

    // Check slug uniqueness
    const existingSlug = await db.select()
      .from(blogCategories)
      .where(eq(blogCategories.slug, sanitizedSlug))
      .limit(1);

    if (existingSlug.length > 0) {
      return NextResponse.json({ 
        error: "Category slug already exists",
        code: "SLUG_EXISTS" 
      }, { status: 400 });
    }

    const newCategory = await db.insert(blogCategories)
      .values({
        name: sanitizedName,
        slug: sanitizedSlug,
        description: description?.trim() || null,
        createdAt: Math.floor(Date.now() / 1000)
      })
      .returning();

    return NextResponse.json(newCategory[0], { status: 201 });

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
    const { name, slug, description } = requestBody;

    // Security check: reject if user ID provided in body
    if ('userId' in requestBody || 'user_id' in requestBody || 'authorId' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    // Check if category exists
    const existingCategory = await db.select()
      .from(blogCategories)
      .where(eq(blogCategories.id, parseInt(id)))
      .limit(1);

    if (existingCategory.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const updates: any = {};

    // Validate and prepare updates
    if (name !== undefined) {
      if (!name.trim()) {
        return NextResponse.json({ 
          error: "Name cannot be empty",
          code: "INVALID_NAME" 
        }, { status: 400 });
      }

      const sanitizedName = name.trim();

      // Check name uniqueness if changed
      if (sanitizedName !== existingCategory[0].name) {
        const existingName = await db.select()
          .from(blogCategories)
          .where(and(
            eq(blogCategories.name, sanitizedName),
            sql`${blogCategories.id} != ${parseInt(id)}`
          ))
          .limit(1);

        if (existingName.length > 0) {
          return NextResponse.json({ 
            error: "Category name already exists",
            code: "NAME_EXISTS" 
          }, { status: 400 });
        }
      }

      updates.name = sanitizedName;
    }

    if (slug !== undefined) {
      if (!slug.trim()) {
        return NextResponse.json({ 
          error: "Slug cannot be empty",
          code: "INVALID_SLUG" 
        }, { status: 400 });
      }

      const sanitizedSlug = slug.trim().toLowerCase();

      // Check slug uniqueness if changed
      if (sanitizedSlug !== existingCategory[0].slug) {
        const existingSlug = await db.select()
          .from(blogCategories)
          .where(and(
            eq(blogCategories.slug, sanitizedSlug),
            sql`${blogCategories.id} != ${parseInt(id)}`
          ))
          .limit(1);

        if (existingSlug.length > 0) {
          return NextResponse.json({ 
            error: "Category slug already exists",
            code: "SLUG_EXISTS" 
          }, { status: 400 });
        }
      }

      updates.slug = sanitizedSlug;
    }

    if (description !== undefined) {
      updates.description = description?.trim() || null;
    }

    // If no updates provided
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(existingCategory[0]);
    }

    const updated = await db.update(blogCategories)
      .set(updates)
      .where(eq(blogCategories.id, parseInt(id)))
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

    // Check if category exists
    const existingCategory = await db.select()
      .from(blogCategories)
      .where(eq(blogCategories.id, parseInt(id)))
      .limit(1);

    if (existingCategory.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Check if category has posts
    const postsInCategory = await db.select()
      .from(blogPosts)
      .where(eq(blogPosts.categoryId, parseInt(id)))
      .limit(1);

    if (postsInCategory.length > 0) {
      return NextResponse.json({ 
        error: "Cannot delete category that contains blog posts. Please reassign or delete the posts first.",
        code: "CATEGORY_IN_USE" 
      }, { status: 400 });
    }

    const deleted = await db.delete(blogCategories)
      .where(eq(blogCategories.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      message: "Category deleted successfully",
      deletedCategory: deleted[0]
    });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}