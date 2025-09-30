import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { wishlistItems, products } from '@/db/schema';
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
        .from(wishlistItems)
        .where(eq(wishlistItems.id, parseInt(id)))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json({ error: 'Wishlist item not found' }, { status: 404 });
      }

      return NextResponse.json(record[0]);
    }

    // List with pagination and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const sessionId = searchParams.get('sessionId');
    const userId = searchParams.get('userId');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    let query = db.select().from(wishlistItems);

    // Build where conditions
    const conditions = [];

    if (sessionId) {
      conditions.push(eq(wishlistItems.sessionId, sessionId));
    }

    if (userId) {
      const userIdInt = parseInt(userId);
      if (!isNaN(userIdInt)) {
        conditions.push(eq(wishlistItems.userId, userIdInt));
      }
    }

    if (search) {
      const searchCondition = like(wishlistItems.productId, `%${search}%`);
      conditions.push(searchCondition);
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    const sortColumn = sort === 'productId' ? wishlistItems.productId : wishlistItems.createdAt;
    query = order === 'asc' ? query.orderBy(asc(sortColumn)) : query.orderBy(desc(sortColumn));

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
    const { sessionId, userId, productId } = requestBody;

    // Security check: prevent user ID injection
    if ('userId' in requestBody && requestBody.userId !== userId) {
      return NextResponse.json({ 
        error: "User ID cannot be modified",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    // Validate required fields
    if (!productId) {
      return NextResponse.json({ 
        error: "Product ID is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    // Validate that either sessionId or userId is provided
    if (!sessionId && !userId) {
      return NextResponse.json({ 
        error: "Either sessionId or userId must be provided",
        code: "MISSING_IDENTIFIER" 
      }, { status: 400 });
    }

    // Validate productId is a valid integer
    if (isNaN(parseInt(productId))) {
      return NextResponse.json({ 
        error: "Product ID must be a valid number",
        code: "INVALID_PRODUCT_ID" 
      }, { status: 400 });
    }

    // Validate foreign key relationship - check if product exists
    const productExists = await db.select()
      .from(products)
      .where(eq(products.id, parseInt(productId)))
      .limit(1);

    if (productExists.length === 0) {
      return NextResponse.json({ 
        error: "Product not found",
        code: "INVALID_PRODUCT_REFERENCE" 
      }, { status: 400 });
    }

    // Check for duplicate wishlist item
    const conditions = [eq(wishlistItems.productId, parseInt(productId))];
    
    if (sessionId) {
      conditions.push(eq(wishlistItems.sessionId, sessionId));
    }
    
    if (userId) {
      const userIdInt = parseInt(userId);
      if (!isNaN(userIdInt)) {
        conditions.push(eq(wishlistItems.userId, userIdInt));
      }
    }

    const existingItem = await db.select()
      .from(wishlistItems)
      .where(and(...conditions))
      .limit(1);

    if (existingItem.length > 0) {
      return NextResponse.json({ 
        error: "Product already in wishlist",
        code: "DUPLICATE_WISHLIST_ITEM" 
      }, { status: 400 });
    }

    // Prepare insert data
    const insertData: any = {
      productId: parseInt(productId),
      createdAt: new Date().toISOString()
    };

    if (sessionId) {
      insertData.sessionId = sessionId.trim();
    }

    if (userId) {
      const userIdInt = parseInt(userId);
      if (!isNaN(userIdInt)) {
        insertData.userId = userIdInt;
      }
    }

    const newRecord = await db.insert(wishlistItems)
      .values(insertData)
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
    const { sessionId, userId, productId } = requestBody;

    // Security check: prevent user ID injection
    if ('userId' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    // Check if record exists
    const existingRecord = await db.select()
      .from(wishlistItems)
      .where(eq(wishlistItems.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json({ error: 'Wishlist item not found' }, { status: 404 });
    }

    // Validate productId if provided
    if (productId) {
      if (isNaN(parseInt(productId))) {
        return NextResponse.json({ 
          error: "Product ID must be a valid number",
          code: "INVALID_PRODUCT_ID" 
        }, { status: 400 });
      }

      // Validate foreign key relationship
      const productExists = await db.select()
        .from(products)
        .where(eq(products.id, parseInt(productId)))
        .limit(1);

      if (productExists.length === 0) {
        return NextResponse.json({ 
          error: "Product not found",
          code: "INVALID_PRODUCT_REFERENCE" 
        }, { status: 400 });
      }
    }

    // Prepare update data
    const updateData: any = {};

    if (sessionId !== undefined) {
      updateData.sessionId = sessionId ? sessionId.trim() : null;
    }

    if (productId !== undefined) {
      updateData.productId = parseInt(productId);
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ 
        error: "No fields to update",
        code: "NO_UPDATE_FIELDS" 
      }, { status: 400 });
    }

    const updated = await db.update(wishlistItems)
      .set(updateData)
      .where(eq(wishlistItems.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Wishlist item not found' }, { status: 404 });
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

    // Check if record exists before deleting
    const existingRecord = await db.select()
      .from(wishlistItems)
      .where(eq(wishlistItems.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json({ error: 'Wishlist item not found' }, { status: 404 });
    }

    const deleted = await db.delete(wishlistItems)
      .where(eq(wishlistItems.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Wishlist item not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Wishlist item deleted successfully',
      deletedItem: deleted[0]
    });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}