import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { wishlistItems } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Get wishlist item by ID
    const wishlistItem = await db.select()
      .from(wishlistItems)
      .where(eq(wishlistItems.id, parseInt(id)))
      .limit(1);

    if (wishlistItem.length === 0) {
      return NextResponse.json({ 
        error: 'Wishlist item not found' 
      }, { status: 404 });
    }

    return NextResponse.json(wishlistItem[0]);
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
    const { id } = params;
    
    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const requestBody = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in requestBody || 'user_id' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    // Check if wishlist item exists
    const existingItem = await db.select()
      .from(wishlistItems)
      .where(eq(wishlistItems.id, parseInt(id)))
      .limit(1);

    if (existingItem.length === 0) {
      return NextResponse.json({ 
        error: 'Wishlist item not found' 
      }, { status: 404 });
    }

    // Extract valid fields for update
    const { sessionId, productId } = requestBody;
    const updates: any = {};

    // Validate and prepare update data
    if (sessionId !== undefined) {
      if (typeof sessionId !== 'string') {
        return NextResponse.json({ 
          error: "Session ID must be a string",
          code: "INVALID_SESSION_ID" 
        }, { status: 400 });
      }
      updates.sessionId = sessionId.trim() || null;
    }

    if (productId !== undefined) {
      if (!productId || isNaN(parseInt(productId))) {
        return NextResponse.json({ 
          error: "Valid product ID is required",
          code: "INVALID_PRODUCT_ID" 
        }, { status: 400 });
      }
      updates.productId = parseInt(productId);
    }

    // Update the wishlist item
    const updated = await db.update(wishlistItems)
      .set(updates)
      .where(eq(wishlistItems.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to update wishlist item' 
      }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('PUT error:', error);
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
    const { id } = params;
    
    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if wishlist item exists
    const existingItem = await db.select()
      .from(wishlistItems)
      .where(eq(wishlistItems.id, parseInt(id)))
      .limit(1);

    if (existingItem.length === 0) {
      return NextResponse.json({ 
        error: 'Wishlist item not found' 
      }, { status: 404 });
    }

    // Delete the wishlist item
    const deleted = await db.delete(wishlistItems)
      .where(eq(wishlistItems.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to delete wishlist item' 
      }, { status: 404 });
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