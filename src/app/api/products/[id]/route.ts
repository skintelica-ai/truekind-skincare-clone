import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products, brands, categories } from '@/db/schema';
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

    const product = await db.select()
      .from(products)
      .where(eq(products.id, parseInt(id)))
      .limit(1);

    if (product.length === 0) {
      return NextResponse.json({
        error: 'Product not found'
      }, { status: 404 });
    }

    return NextResponse.json(product[0]);
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

    // Check if product exists
    const existingProduct = await db.select()
      .from(products)
      .where(eq(products.id, parseInt(id)))
      .limit(1);

    if (existingProduct.length === 0) {
      return NextResponse.json({
        error: 'Product not found'
      }, { status: 404 });
    }

    // Validate required fields if provided
    if (requestBody.name && typeof requestBody.name !== 'string') {
      return NextResponse.json({
        error: "Name must be a string",
        code: "INVALID_NAME"
      }, { status: 400 });
    }

    if (requestBody.slug && typeof requestBody.slug !== 'string') {
      return NextResponse.json({
        error: "Slug must be a string",
        code: "INVALID_SLUG"
      }, { status: 400 });
    }

    if (requestBody.description && typeof requestBody.description !== 'string') {
      return NextResponse.json({
        error: "Description must be a string",
        code: "INVALID_DESCRIPTION"
      }, { status: 400 });
    }

    if (requestBody.price && (typeof requestBody.price !== 'number' || requestBody.price < 0)) {
      return NextResponse.json({
        error: "Price must be a positive number",
        code: "INVALID_PRICE"
      }, { status: 400 });
    }

    if (requestBody.originalPrice && (typeof requestBody.originalPrice !== 'number' || requestBody.originalPrice < 0)) {
      return NextResponse.json({
        error: "Original price must be a positive number",
        code: "INVALID_ORIGINAL_PRICE"
      }, { status: 400 });
    }

    if (requestBody.sku && typeof requestBody.sku !== 'string') {
      return NextResponse.json({
        error: "SKU must be a string",
        code: "INVALID_SKU"
      }, { status: 400 });
    }

    if (requestBody.stockQuantity && (typeof requestBody.stockQuantity !== 'number' || requestBody.stockQuantity < 0)) {
      return NextResponse.json({
        error: "Stock quantity must be a non-negative integer",
        code: "INVALID_STOCK_QUANTITY"
      }, { status: 400 });
    }

    if (requestBody.rating && (typeof requestBody.rating !== 'number' || requestBody.rating < 0 || requestBody.rating > 5)) {
      return NextResponse.json({
        error: "Rating must be a number between 0 and 5",
        code: "INVALID_RATING"
      }, { status: 400 });
    }

    if (requestBody.reviewCount && (typeof requestBody.reviewCount !== 'number' || requestBody.reviewCount < 0)) {
      return NextResponse.json({
        error: "Review count must be a non-negative integer",
        code: "INVALID_REVIEW_COUNT"
      }, { status: 400 });
    }

    // Validate foreign key references if provided
    if (requestBody.brandId) {
      const brand = await db.select()
        .from(brands)
        .where(eq(brands.id, requestBody.brandId))
        .limit(1);

      if (brand.length === 0) {
        return NextResponse.json({
          error: "Brand not found",
          code: "INVALID_BRAND_ID"
        }, { status: 400 });
      }
    }

    if (requestBody.categoryId) {
      const category = await db.select()
        .from(categories)
        .where(eq(categories.id, requestBody.categoryId))
        .limit(1);

      if (category.length === 0) {
        return NextResponse.json({
          error: "Category not found",
          code: "INVALID_CATEGORY_ID"
        }, { status: 400 });
      }
    }

    // Check for unique constraints if updating slug or sku
    if (requestBody.slug && requestBody.slug !== existingProduct[0].slug) {
      const slugExists = await db.select()
        .from(products)
        .where(and(eq(products.slug, requestBody.slug), eq(products.id, parseInt(id))))
        .limit(1);

      if (slugExists.length > 0) {
        return NextResponse.json({
          error: "Slug already exists",
          code: "SLUG_EXISTS"
        }, { status: 400 });
      }
    }

    if (requestBody.sku && requestBody.sku !== existingProduct[0].sku) {
      const skuExists = await db.select()
        .from(products)
        .where(and(eq(products.sku, requestBody.sku), eq(products.id, parseInt(id))))
        .limit(1);

      if (skuExists.length > 0) {
        return NextResponse.json({
          error: "SKU already exists",
          code: "SKU_EXISTS"
        }, { status: 400 });
      }
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date().toISOString()
    };

    // Add fields to update if provided
    if (requestBody.name !== undefined) updateData.name = requestBody.name.trim();
    if (requestBody.slug !== undefined) updateData.slug = requestBody.slug.trim();
    if (requestBody.description !== undefined) updateData.description = requestBody.description.trim();
    if (requestBody.shortDescription !== undefined) updateData.shortDescription = requestBody.shortDescription?.trim() || null;
    if (requestBody.brandId !== undefined) updateData.brandId = requestBody.brandId;
    if (requestBody.categoryId !== undefined) updateData.categoryId = requestBody.categoryId;
    if (requestBody.price !== undefined) updateData.price = requestBody.price;
    if (requestBody.originalPrice !== undefined) updateData.originalPrice = requestBody.originalPrice;
    if (requestBody.sku !== undefined) updateData.sku = requestBody.sku.trim();
    if (requestBody.stockQuantity !== undefined) updateData.stockQuantity = requestBody.stockQuantity;
    if (requestBody.isFeatured !== undefined) updateData.isFeatured = requestBody.isFeatured;
    if (requestBody.isNew !== undefined) updateData.isNew = requestBody.isNew;
    if (requestBody.rating !== undefined) updateData.rating = requestBody.rating;
    if (requestBody.reviewCount !== undefined) updateData.reviewCount = requestBody.reviewCount;

    const updated = await db.update(products)
      .set(updateData)
      .where(eq(products.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({
        error: 'Product not found'
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
    const id = params.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({
        error: "Valid ID is required",
        code: "INVALID_ID"
      }, { status: 400 });
    }

    // Check if product exists
    const existingProduct = await db.select()
      .from(products)
      .where(eq(products.id, parseInt(id)))
      .limit(1);

    if (existingProduct.length === 0) {
      return NextResponse.json({
        error: 'Product not found'
      }, { status: 404 });
    }

    const deleted = await db.delete(products)
      .where(eq(products.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({
        error: 'Product not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Product deleted successfully',
      product: deleted[0]
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}