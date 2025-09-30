import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { cartItems, products } from '@/db/schema';
import { eq, like, and, or, desc, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    // Single cart item fetch
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const cartItem = await db.select()
        .from(cartItems)
        .where(eq(cartItems.id, parseInt(id)))
        .limit(1);

      if (cartItem.length === 0) {
        return NextResponse.json({ error: 'Cart item not found' }, { status: 404 });
      }

      return NextResponse.json(cartItem[0]);
    }

    // List with pagination and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const sessionId = searchParams.get('sessionId');
    const userId = searchParams.get('userId');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    let query = db.select().from(cartItems);
    let whereConditions = [];

    // Filter by sessionId
    if (sessionId) {
      whereConditions.push(eq(cartItems.sessionId, sessionId));
    }

    // Filter by userId
    if (userId) {
      if (!isNaN(parseInt(userId))) {
        whereConditions.push(eq(cartItems.userId, parseInt(userId)));
      }
    }

    // Search functionality
    if (search) {
      whereConditions.push(
        or(
          like(cartItems.sessionId, `%${search}%`)
        )
      );
    }

    // Apply where conditions
    if (whereConditions.length > 0) {
      query = query.where(whereConditions.length === 1 ? whereConditions[0] : and(...whereConditions));
    }

    // Apply sorting
    const sortColumn = sort === 'quantity' ? cartItems.quantity : 
                      sort === 'updatedAt' ? cartItems.updatedAt : 
                      cartItems.createdAt;
    query = query.orderBy(order === 'asc' ? asc(sortColumn) : desc(sortColumn));

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
    const { sessionId, userId, productId, quantity } = requestBody;

    // Validate required fields
    if (!productId) {
      return NextResponse.json({ 
        error: "Product ID is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    // Validate productId is a valid integer
    if (isNaN(parseInt(productId))) {
      return NextResponse.json({ 
        error: "Product ID must be a valid integer",
        code: "INVALID_PRODUCT_ID" 
      }, { status: 400 });
    }

    // Validate quantity if provided
    const validatedQuantity = quantity || 1;
    if (validatedQuantity < 1 || !Number.isInteger(validatedQuantity)) {
      return NextResponse.json({ 
        error: "Quantity must be a positive integer",
        code: "INVALID_QUANTITY" 
      }, { status: 400 });
    }

    // Validate that either sessionId or userId is provided
    if (!sessionId && !userId) {
      return NextResponse.json({ 
        error: "Either session ID or user ID must be provided",
        code: "MISSING_IDENTIFIER" 
      }, { status: 400 });
    }

    // Validate userId is integer if provided
    if (userId && isNaN(parseInt(userId))) {
      return NextResponse.json({ 
        error: "User ID must be a valid integer",
        code: "INVALID_USER_ID" 
      }, { status: 400 });
    }

    // Verify product exists
    const product = await db.select()
      .from(products)
      .where(eq(products.id, parseInt(productId)))
      .limit(1);

    if (product.length === 0) {
      return NextResponse.json({ 
        error: "Product not found",
        code: "PRODUCT_NOT_FOUND" 
      }, { status: 404 });
    }

    // Prepare insert data
    const insertData = {
      sessionId: sessionId || null,
      userId: userId ? parseInt(userId) : null,
      productId: parseInt(productId),
      quantity: validatedQuantity,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newCartItem = await db.insert(cartItems)
      .values(insertData)
      .returning();

    return NextResponse.json(newCartItem[0], { status: 201 });
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
    const { sessionId, userId, productId, quantity } = requestBody;

    // Check if cart item exists
    const existingCartItem = await db.select()
      .from(cartItems)
      .where(eq(cartItems.id, parseInt(id)))
      .limit(1);

    if (existingCartItem.length === 0) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 });
    }

    // Prepare update data
    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    // Update sessionId if provided
    if (sessionId !== undefined) {
      updates.sessionId = sessionId;
    }

    // Update userId if provided
    if (userId !== undefined) {
      if (userId && isNaN(parseInt(userId))) {
        return NextResponse.json({ 
          error: "User ID must be a valid integer",
          code: "INVALID_USER_ID" 
        }, { status: 400 });
      }
      updates.userId = userId ? parseInt(userId) : null;
    }

    // Update productId if provided
    if (productId !== undefined) {
      if (isNaN(parseInt(productId))) {
        return NextResponse.json({ 
          error: "Product ID must be a valid integer",
          code: "INVALID_PRODUCT_ID" 
        }, { status: 400 });
      }

      // Verify new product exists
      const product = await db.select()
        .from(products)
        .where(eq(products.id, parseInt(productId)))
        .limit(1);

      if (product.length === 0) {
        return NextResponse.json({ 
          error: "Product not found",
          code: "PRODUCT_NOT_FOUND" 
        }, { status: 404 });
      }

      updates.productId = parseInt(productId);
    }

    // Update quantity if provided
    if (quantity !== undefined) {
      if (quantity < 1 || !Number.isInteger(quantity)) {
        return NextResponse.json({ 
          error: "Quantity must be a positive integer",
          code: "INVALID_QUANTITY" 
        }, { status: 400 });
      }
      updates.quantity = quantity;
    }

    const updated = await db.update(cartItems)
      .set(updates)
      .where(eq(cartItems.id, parseInt(id)))
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

    // Check if cart item exists
    const existingCartItem = await db.select()
      .from(cartItems)
      .where(eq(cartItems.id, parseInt(id)))
      .limit(1);

    if (existingCartItem.length === 0) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 });
    }

    const deleted = await db.delete(cartItems)
      .where(eq(cartItems.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      message: 'Cart item deleted successfully',
      deletedItem: deleted[0]
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}