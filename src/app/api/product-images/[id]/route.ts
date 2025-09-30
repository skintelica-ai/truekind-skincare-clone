import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { productImages, products } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

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

    const productImage = await db.select()
      .from(productImages)
      .where(eq(productImages.id, parseInt(id)))
      .limit(1);

    if (productImage.length === 0) {
      return NextResponse.json({
        error: 'Product image not found'
      }, { status: 404 });
    }

    return NextResponse.json(productImage[0]);
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
    const { productId, imageUrl, altText, isPrimary, displayOrder } = requestBody;

    // Check if record exists
    const existingRecord = await db.select()
      .from(productImages)
      .where(eq(productImages.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json({
        error: 'Product image not found'
      }, { status: 404 });
    }

    // Validate productId if provided - check if referenced product exists
    if (productId !== undefined) {
      if (!productId || isNaN(parseInt(productId.toString()))) {
        return NextResponse.json({
          error: "Valid product ID is required",
          code: "INVALID_PRODUCT_ID"
        }, { status: 400 });
      }

      const referencedProduct = await db.select()
        .from(products)
        .where(eq(products.id, parseInt(productId.toString())))
        .limit(1);

      if (referencedProduct.length === 0) {
        return NextResponse.json({
          error: "Referenced product does not exist",
          code: "PRODUCT_NOT_FOUND"
        }, { status: 400 });
      }
    }

    // Validate isPrimary if provided
    if (isPrimary !== undefined && typeof isPrimary !== 'boolean') {
      return NextResponse.json({
        error: "isPrimary must be a boolean",
        code: "INVALID_IS_PRIMARY"
      }, { status: 400 });
    }

    // Validate displayOrder if provided
    if (displayOrder !== undefined && (isNaN(parseInt(displayOrder.toString())) || parseInt(displayOrder.toString()) < 0)) {
      return NextResponse.json({
        error: "Display order must be a non-negative integer",
        code: "INVALID_DISPLAY_ORDER"
      }, { status: 400 });
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date().toISOString()
    };

    if (productId !== undefined) updateData.productId = parseInt(productId.toString());
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl.toString().trim();
    if (altText !== undefined) updateData.altText = altText ? altText.toString().trim() : null;
    if (isPrimary !== undefined) updateData.isPrimary = isPrimary;
    if (displayOrder !== undefined) updateData.displayOrder = parseInt(displayOrder.toString());

    const updated = await db.update(productImages)
      .set(updateData)
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

    // Check if record exists
    const existingRecord = await db.select()
      .from(productImages)
      .where(eq(productImages.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json({
        error: 'Product image not found'
      }, { status: 404 });
    }

    const deleted = await db.delete(productImages)
      .where(eq(productImages.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      message: 'Product image deleted successfully',
      deleted: deleted[0]
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}