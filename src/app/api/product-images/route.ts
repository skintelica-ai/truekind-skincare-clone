import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { productImages, products } from '@/db/schema';
import { eq, like, and, or, desc, asc } from 'drizzle-orm';

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

      const record = await db.select()
        .from(productImages)
        .where(eq(productImages.id, parseInt(id)))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json({ error: 'Product image not found' }, { status: 404 });
      }

      return NextResponse.json(record[0]);
    }

    // List with pagination and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const productId = searchParams.get('productId');
    const sort = searchParams.get('sort') || 'displayOrder';
    const order = searchParams.get('order') || 'asc';

    let query = db.select().from(productImages);

    // Filter by productId
    if (productId) {
      if (isNaN(parseInt(productId))) {
        return NextResponse.json({ 
          error: "Valid product ID is required",
          code: "INVALID_PRODUCT_ID" 
        }, { status: 400 });
      }
      query = query.where(eq(productImages.productId, parseInt(productId)));
    }

    // Apply sorting
    const sortField = sort === 'createdAt' ? productImages.createdAt : productImages.displayOrder;
    const sortDirection = order === 'desc' ? desc(sortField) : asc(sortField);
    query = query.orderBy(sortDirection);

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
    const { productId, imageUrl, altText, isPrimary, displayOrder } = requestBody;

    // Validate required fields
    if (!productId) {
      return NextResponse.json({ 
        error: "Product ID is required",
        code: "MISSING_PRODUCT_ID" 
      }, { status: 400 });
    }

    if (!imageUrl) {
      return NextResponse.json({ 
        error: "Image URL is required",
        code: "MISSING_IMAGE_URL" 
      }, { status: 400 });
    }

    // Validate productId is a valid integer
    if (isNaN(parseInt(productId))) {
      return NextResponse.json({ 
        error: "Valid product ID is required",
        code: "INVALID_PRODUCT_ID" 
      }, { status: 400 });
    }

    // Validate foreign key relationship exists
    const existingProduct = await db.select()
      .from(products)
      .where(eq(products.id, parseInt(productId)))
      .limit(1);

    if (existingProduct.length === 0) {
      return NextResponse.json({ 
        error: "Product not found",
        code: "PRODUCT_NOT_FOUND" 
      }, { status: 400 });
    }

    // Sanitize inputs
    const sanitizedData = {
      productId: parseInt(productId),
      imageUrl: imageUrl.trim(),
      altText: altText ? altText.trim() : null,
      isPrimary: isPrimary !== undefined ? Boolean(isPrimary) : false,
      displayOrder: displayOrder !== undefined ? parseInt(displayOrder) : 0,
      createdAt: new Date().toISOString()
    };

    const newRecord = await db.insert(productImages)
      .values(sanitizedData)
      .returning();

    return NextResponse.json(newRecord[0], { status: 201 });
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

    const requestBody = await request.json();
    const { productId, imageUrl, altText, isPrimary, displayOrder } = requestBody;

    // Check if record exists
    const existing = await db.select()
      .from(productImages)
      .where(eq(productImages.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Product image not found' }, { status: 404 });
    }

    // Validate foreign key relationship if productId is being updated
    if (productId !== undefined) {
      if (isNaN(parseInt(productId))) {
        return NextResponse.json({ 
          error: "Valid product ID is required",
          code: "INVALID_PRODUCT_ID" 
        }, { status: 400 });
      }

      const existingProduct = await db.select()
        .from(products)
        .where(eq(products.id, parseInt(productId)))
        .limit(1);

      if (existingProduct.length === 0) {
        return NextResponse.json({ 
          error: "Product not found",
          code: "PRODUCT_NOT_FOUND" 
        }, { status: 400 });
      }
    }

    // Build update object with only provided fields
    const updates: any = {};

    if (productId !== undefined) updates.productId = parseInt(productId);
    if (imageUrl !== undefined) updates.imageUrl = imageUrl.trim();
    if (altText !== undefined) updates.altText = altText ? altText.trim() : null;
    if (isPrimary !== undefined) updates.isPrimary = Boolean(isPrimary);
    if (displayOrder !== undefined) updates.displayOrder = parseInt(displayOrder);

    const updated = await db.update(productImages)
      .set(updates)
      .where(eq(productImages.id, parseInt(id)))
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if record exists
    const existing = await db.select()
      .from(productImages)
      .where(eq(productImages.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Product image not found' }, { status: 404 });
    }

    const deleted = await db.delete(productImages)
      .where(eq(productImages.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      message: 'Product image deleted successfully',
      deletedRecord: deleted[0]
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}