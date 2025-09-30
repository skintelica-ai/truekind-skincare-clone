import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { cartItems, products } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Get cart item by ID with product details
    const cartItem = await db.select({
      id: cartItems.id,
      sessionId: cartItems.sessionId,
      userId: cartItems.userId,
      productId: cartItems.productId,
      quantity: cartItems.quantity,
      createdAt: cartItems.createdAt,
      updatedAt: cartItems.updatedAt,
      product: {
        id: products.id,
        name: products.name,
        price: products.price,
        stockQuantity: products.stockQuantity
      }
    })
      .from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.id, parseInt(id)))
      .limit(1);

    if (cartItem.length === 0) {
      return NextResponse.json({ 
        error: 'Cart item not found' 
      }, { status: 404 });
    }

    return NextResponse.json(cartItem[0]);

  } catch (error) {
    console.error('GET cart item error:', error);
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

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const body = await request.json();
    const { quantity, sessionId, productId } = body;

    // Security: Reject if userId provided in body
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    // Validate quantity if provided
    if (quantity !== undefined) {
      if (!Number.isInteger(quantity) || quantity <= 0) {
        return NextResponse.json({ 
          error: "Quantity must be a positive integer",
          code: "INVALID_QUANTITY" 
        }, { status: 400 });
      }
    }

    // Check if cart item exists
    const existingCartItem = await db.select()
      .from(cartItems)
      .where(eq(cartItems.id, parseInt(id)))
      .limit(1);

    if (existingCartItem.length === 0) {
      return NextResponse.json({ 
        error: 'Cart item not found' 
      }, { status: 404 });
    }

    // If productId is being updated, verify the product exists
    if (productId !== undefined) {
      const product = await db.select()
        .from(products)
        .where(eq(products.id, productId))
        .limit(1);

      if (product.length === 0) {
        return NextResponse.json({ 
          error: "Product not found",
          code: "PRODUCT_NOT_FOUND" 
        }, { status: 400 });
      }
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date().toISOString()
    };

    if (quantity !== undefined) updateData.quantity = quantity;
    if (sessionId !== undefined) updateData.sessionId = sessionId;
    if (productId !== undefined) updateData.productId = productId;

    // Update cart item
    const updated = await db.update(cartItems)
      .set(updateData)
      .where(eq(cartItems.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to update cart item' 
      }, { status: 500 });
    }

    return NextResponse.json(updated[0]);

  } catch (error) {
    console.error('PUT cart item error:', error);
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

    // Validate ID
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
      return NextResponse.json({ 
        error: 'Cart item not found' 
      }, { status: 404 });
    }

    // Delete cart item
    const deleted = await db.delete(cartItems)
      .where(eq(cartItems.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to delete cart item' 
      }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Cart item deleted successfully',
      deletedItem: deleted[0]
    });

  } catch (error) {
    console.error('DELETE cart item error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}