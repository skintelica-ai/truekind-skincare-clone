import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { categories } from '@/db/schema';
import { eq, like, and, or, desc, asc, isNull } from 'drizzle-orm';

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

      const category = await db.select()
        .from(categories)
        .where(eq(categories.id, parseInt(id)))
        .limit(1);

      if (category.length === 0) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 });
      }

      return NextResponse.json(category[0]);
    }

    // List with pagination, search, and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const parentId = searchParams.get('parentId');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    let query = db.select().from(categories);
    let conditions = [];

    // Search by name
    if (search) {
      conditions.push(
        or(
          like(categories.name, `%${search}%`),
          like(categories.description, `%${search}%`)
        )
      );
    }

    // Filter by parentId (including null for root categories)
    if (parentId !== null) {
      if (parentId === 'null' || parentId === '') {
        conditions.push(isNull(categories.parentId));
      } else if (!isNaN(parseInt(parentId))) {
        conditions.push(eq(categories.parentId, parseInt(parentId)));
      }
    }

    // Apply conditions
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    const sortColumn = sort === 'name' ? categories.name : categories.createdAt;
    const sortOrder = order === 'asc' ? asc(sortColumn) : desc(sortColumn);
    query = query.orderBy(sortOrder);

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
    const requestBody = await request.json();
    const { name, slug, description, parentId, imageUrl } = requestBody;

    // Validate required fields
    if (!name) {
      return NextResponse.json({ 
        error: "Name is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (!slug) {
      return NextResponse.json({ 
        error: "Slug is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    // Validate parentId if provided
    if (parentId !== undefined && parentId !== null) {
      if (isNaN(parseInt(parentId))) {
        return NextResponse.json({ 
          error: "Parent ID must be a valid number",
          code: "INVALID_PARENT_ID" 
        }, { status: 400 });
      }

      // Check if parent category exists
      const parentCategory = await db.select()
        .from(categories)
        .where(eq(categories.id, parseInt(parentId)))
        .limit(1);

      if (parentCategory.length === 0) {
        return NextResponse.json({ 
          error: "Parent category not found",
          code: "PARENT_NOT_FOUND" 
        }, { status: 400 });
      }
    }

    // Check if slug already exists
    const existingCategory = await db.select()
      .from(categories)
      .where(eq(categories.slug, slug.trim()))
      .limit(1);

    if (existingCategory.length > 0) {
      return NextResponse.json({ 
        error: "Slug already exists",
        code: "SLUG_EXISTS" 
      }, { status: 400 });
    }

    // Prepare insert data
    const insertData = {
      name: name.trim(),
      slug: slug.trim(),
      description: description ? description.trim() : null,
      parentId: parentId ? parseInt(parentId) : null,
      imageUrl: imageUrl ? imageUrl.trim() : null,
      createdAt: new Date().toISOString()
    };

    const newCategory = await db.insert(categories)
      .values(insertData)
      .returning();

    return NextResponse.json(newCategory[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    
    // Handle unique constraint violations
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      if (error.message.includes('slug')) {
        return NextResponse.json({ 
          error: "Slug already exists",
          code: "SLUG_EXISTS" 
        }, { status: 400 });
      }
    }

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

    // Check if category exists
    const existingCategory = await db.select()
      .from(categories)
      .where(eq(categories.id, parseInt(id)))
      .limit(1);

    if (existingCategory.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const requestBody = await request.json();
    const { name, slug, description, parentId, imageUrl } = requestBody;

    // Validate parentId if provided
    if (parentId !== undefined && parentId !== null) {
      if (isNaN(parseInt(parentId))) {
        return NextResponse.json({ 
          error: "Parent ID must be a valid number",
          code: "INVALID_PARENT_ID" 
        }, { status: 400 });
      }

      // Prevent self-reference
      if (parseInt(parentId) === parseInt(id)) {
        return NextResponse.json({ 
          error: "Category cannot be its own parent",
          code: "SELF_REFERENCE" 
        }, { status: 400 });
      }

      // Check if parent category exists
      const parentCategory = await db.select()
        .from(categories)
        .where(eq(categories.id, parseInt(parentId)))
        .limit(1);

      if (parentCategory.length === 0) {
        return NextResponse.json({ 
          error: "Parent category not found",
          code: "PARENT_NOT_FOUND" 
        }, { status: 400 });
      }
    }

    // Check slug uniqueness if slug is being updated
    if (slug && slug.trim() !== existingCategory[0].slug) {
      const slugExists = await db.select()
        .from(categories)
        .where(eq(categories.slug, slug.trim()))
        .limit(1);

      if (slugExists.length > 0) {
        return NextResponse.json({ 
          error: "Slug already exists",
          code: "SLUG_EXISTS" 
        }, { status: 400 });
      }
    }

    // Prepare update data
    const updateData = {
      updatedAt: new Date().toISOString()
    };

    if (name !== undefined) updateData.name = name.trim();
    if (slug !== undefined) updateData.slug = slug.trim();
    if (description !== undefined) updateData.description = description ? description.trim() : null;
    if (parentId !== undefined) updateData.parentId = parentId ? parseInt(parentId) : null;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl ? imageUrl.trim() : null;

    const updated = await db.update(categories)
      .set(updateData)
      .where(eq(categories.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('PUT error:', error);
    
    // Handle unique constraint violations
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      if (error.message.includes('slug')) {
        return NextResponse.json({ 
          error: "Slug already exists",
          code: "SLUG_EXISTS" 
        }, { status: 400 });
      }
    }

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

    // Check if category exists
    const existingCategory = await db.select()
      .from(categories)
      .where(eq(categories.id, parseInt(id)))
      .limit(1);

    if (existingCategory.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Check if category has child categories
    const childCategories = await db.select()
      .from(categories)
      .where(eq(categories.parentId, parseInt(id)))
      .limit(1);

    if (childCategories.length > 0) {
      return NextResponse.json({ 
        error: "Cannot delete category with child categories",
        code: "HAS_CHILDREN" 
      }, { status: 400 });
    }

    const deleted = await db.delete(categories)
      .where(eq(categories.id, parseInt(id)))
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