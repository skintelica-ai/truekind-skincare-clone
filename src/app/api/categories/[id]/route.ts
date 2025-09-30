import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { categories } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

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
      return NextResponse.json({ 
        error: 'Category not found' 
      }, { status: 404 });
    }

    return NextResponse.json(category[0]);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const requestBody = await request.json();

    // Validate required fields
    if (!requestBody.name) {
      return NextResponse.json({ 
        error: "Name is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (!requestBody.slug) {
      return NextResponse.json({ 
        error: "Slug is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    // Check if category exists
    const existingCategory = await db.select()
      .from(categories)
      .where(eq(categories.id, parseInt(id)))
      .limit(1);

    if (existingCategory.length === 0) {
      return NextResponse.json({ 
        error: 'Category not found' 
      }, { status: 404 });
    }

    // Validate parentId if provided
    if (requestBody.parentId !== undefined && requestBody.parentId !== null) {
      if (isNaN(parseInt(requestBody.parentId))) {
        return NextResponse.json({ 
          error: "Invalid parent ID",
          code: "INVALID_PARENT_ID" 
        }, { status: 400 });
      }

      // Check if parent category exists
      const parentCategory = await db.select()
        .from(categories)
        .where(eq(categories.id, parseInt(requestBody.parentId)))
        .limit(1);

      if (parentCategory.length === 0) {
        return NextResponse.json({ 
          error: "Parent category not found",
          code: "PARENT_NOT_FOUND" 
        }, { status: 400 });
      }

      // Prevent self-reference
      if (parseInt(requestBody.parentId) === parseInt(id)) {
        return NextResponse.json({ 
          error: "Category cannot be its own parent",
          code: "SELF_REFERENCE_NOT_ALLOWED" 
        }, { status: 400 });
      }
    }

    // Prepare update data
    const updateData: any = {
      name: requestBody.name?.trim(),
      slug: requestBody.slug?.trim(),
    };

    if (requestBody.description !== undefined) {
      updateData.description = requestBody.description?.trim() || null;
    }

    if (requestBody.parentId !== undefined) {
      updateData.parentId = requestBody.parentId ? parseInt(requestBody.parentId) : null;
    }

    if (requestBody.imageUrl !== undefined) {
      updateData.imageUrl = requestBody.imageUrl?.trim() || null;
    }

    const updated = await db.update(categories)
      .set(updateData)
      .where(eq(categories.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to update category' 
      }, { status: 500 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('PUT error:', error);
    
    // Handle unique constraint violations
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
      if (error.message.includes('slug')) {
        return NextResponse.json({ 
          error: "Category slug already exists",
          code: "SLUG_ALREADY_EXISTS" 
        }, { status: 400 });
      }
    }

    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

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
      return NextResponse.json({ 
        error: 'Category not found' 
      }, { status: 404 });
    }

    // Check if category has child categories
    const childCategories = await db.select()
      .from(categories)
      .where(eq(categories.parentId, parseInt(id)))
      .limit(1);

    if (childCategories.length > 0) {
      return NextResponse.json({ 
        error: "Cannot delete category with child categories",
        code: "HAS_CHILD_CATEGORIES" 
      }, { status: 400 });
    }

    const deleted = await db.delete(categories)
      .where(eq(categories.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to delete category' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Category deleted successfully',
      deletedCategory: deleted[0]
    });
  } catch (error) {
    console.error('DELETE error:', error);
    
    // Handle foreign key constraint violations
    if (error instanceof Error && error.message.includes('FOREIGN KEY constraint failed')) {
      return NextResponse.json({ 
        error: "Cannot delete category because it's referenced by other records",
        code: "REFERENCED_BY_OTHER_RECORDS" 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}