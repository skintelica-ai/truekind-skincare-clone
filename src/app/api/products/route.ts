import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products, brands, categories } from '@/db/schema';
import { eq, like, and, or, desc, asc, gte, lte, isNotNull } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Pagination parameters
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Search parameters
    const search = searchParams.get('search');
    const brandId = searchParams.get('brandId');
    const categoryId = searchParams.get('categoryId');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const isFeatured = searchParams.get('isFeatured');
    const isNew = searchParams.get('isNew');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';
    
    // Single product by ID
    const id = searchParams.get('id');
    if (id) {
      const productId = parseInt(id);
      if (isNaN(productId)) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const product = await db.select()
        .from(products)
        .where(eq(products.id, productId))
        .limit(1);

      if (product.length === 0) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }

      return NextResponse.json(product[0]);
    }

    // Build query conditions
    let conditions = [];

    // Search in name and description
    if (search) {
      conditions.push(
        or(
          like(products.name, `%${search}%`),
          like(products.description, `%${search}%`)
        )
      );
    }

    // Filter by brandId
    if (brandId) {
      const brandIdInt = parseInt(brandId);
      if (!isNaN(brandIdInt)) {
        conditions.push(eq(products.brandId, brandIdInt));
      }
    }

    // Filter by categoryId
    if (categoryId) {
      const categoryIdInt = parseInt(categoryId);
      if (!isNaN(categoryIdInt)) {
        conditions.push(eq(products.categoryId, categoryIdInt));
      }
    }

    // Filter by price range
    if (minPrice) {
      const minPriceFloat = parseFloat(minPrice);
      if (!isNaN(minPriceFloat)) {
        conditions.push(gte(products.price, minPriceFloat));
      }
    }

    if (maxPrice) {
      const maxPriceFloat = parseFloat(maxPrice);
      if (!isNaN(maxPriceFloat)) {
        conditions.push(lte(products.price, maxPriceFloat));
      }
    }

    // Filter by isFeatured
    if (isFeatured === 'true') {
      conditions.push(eq(products.isFeatured, true));
    } else if (isFeatured === 'false') {
      conditions.push(eq(products.isFeatured, false));
    }

    // Filter by isNew
    if (isNew === 'true') {
      conditions.push(eq(products.isNew, true));
    } else if (isNew === 'false') {
      conditions.push(eq(products.isNew, false));
    }

    // Build the base query
    let query = db.select().from(products);

    // Apply conditions
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    switch (sort) {
      case 'price_asc':
        query = query.orderBy(asc(products.price));
        break;
      case 'price_desc':
        query = query.orderBy(desc(products.price));
        break;
      case 'rating':
        query = query.orderBy(desc(products.rating));
        break;
      case 'createdAt':
        if (order === 'asc') {
          query = query.orderBy(asc(products.createdAt));
        } else {
          query = query.orderBy(desc(products.createdAt));
        }
        break;
      default:
        query = query.orderBy(desc(products.createdAt));
    }

    // Apply pagination
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
    const { 
      name, 
      slug, 
      description, 
      shortDescription,
      brandId, 
      categoryId, 
      price, 
      originalPrice,
      sku,
      stockQuantity,
      isFeatured,
      isNew,
      rating,
      reviewCount
    } = requestBody;

    // Validate required fields
    if (!name) {
      return NextResponse.json({ 
        error: "Product name is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (!slug) {
      return NextResponse.json({ 
        error: "Product slug is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (!description) {
      return NextResponse.json({ 
        error: "Product description is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (!brandId) {
      return NextResponse.json({ 
        error: "Brand ID is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (!categoryId) {
      return NextResponse.json({ 
        error: "Category ID is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (price === undefined || price === null) {
      return NextResponse.json({ 
        error: "Product price is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (!sku) {
      return NextResponse.json({ 
        error: "Product SKU is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    // Validate price is a positive number
    const priceFloat = parseFloat(price);
    if (isNaN(priceFloat) || priceFloat < 0) {
      return NextResponse.json({ 
        error: "Price must be a valid positive number",
        code: "INVALID_PRICE" 
      }, { status: 400 });
    }

    // Validate originalPrice if provided
    let originalPriceFloat = null;
    if (originalPrice !== undefined && originalPrice !== null) {
      originalPriceFloat = parseFloat(originalPrice);
      if (isNaN(originalPriceFloat) || originalPriceFloat < 0) {
        return NextResponse.json({ 
          error: "Original price must be a valid positive number",
          code: "INVALID_ORIGINAL_PRICE" 
        }, { status: 400 });
      }
    }

    // Validate brandId exists
    const brandIdInt = parseInt(brandId);
    if (isNaN(brandIdInt)) {
      return NextResponse.json({ 
        error: "Brand ID must be a valid integer",
        code: "INVALID_BRAND_ID" 
      }, { status: 400 });
    }

    const existingBrand = await db.select()
      .from(brands)
      .where(eq(brands.id, brandIdInt))
      .limit(1);

    if (existingBrand.length === 0) {
      return NextResponse.json({ 
        error: "Brand not found",
        code: "BRAND_NOT_FOUND" 
      }, { status: 400 });
    }

    // Validate categoryId exists
    const categoryIdInt = parseInt(categoryId);
    if (isNaN(categoryIdInt)) {
      return NextResponse.json({ 
        error: "Category ID must be a valid integer",
        code: "INVALID_CATEGORY_ID" 
      }, { status: 400 });
    }

    const existingCategory = await db.select()
      .from(categories)
      .where(eq(categories.id, categoryIdInt))
      .limit(1);

    if (existingCategory.length === 0) {
      return NextResponse.json({ 
        error: "Category not found",
        code: "CATEGORY_NOT_FOUND" 
      }, { status: 400 });
    }

    // Validate stockQuantity if provided
    let stockQuantityInt = 0;
    if (stockQuantity !== undefined && stockQuantity !== null) {
      stockQuantityInt = parseInt(stockQuantity);
      if (isNaN(stockQuantityInt) || stockQuantityInt < 0) {
        return NextResponse.json({ 
          error: "Stock quantity must be a valid non-negative integer",
          code: "INVALID_STOCK_QUANTITY" 
        }, { status: 400 });
      }
    }

    // Validate rating if provided
    let ratingFloat = null;
    if (rating !== undefined && rating !== null) {
      ratingFloat = parseFloat(rating);
      if (isNaN(ratingFloat) || ratingFloat < 0 || ratingFloat > 5) {
        return NextResponse.json({ 
          error: "Rating must be a number between 0 and 5",
          code: "INVALID_RATING" 
        }, { status: 400 });
      }
    }

    // Validate reviewCount if provided
    let reviewCountInt = 0;
    if (reviewCount !== undefined && reviewCount !== null) {
      reviewCountInt = parseInt(reviewCount);
      if (isNaN(reviewCountInt) || reviewCountInt < 0) {
        return NextResponse.json({ 
          error: "Review count must be a valid non-negative integer",
          code: "INVALID_REVIEW_COUNT" 
        }, { status: 400 });
      }
    }

    // Prepare insert data with defaults and sanitization
    const insertData = {
      name: name.toString().trim(),
      slug: slug.toString().trim(),
      description: description.toString().trim(),
      shortDescription: shortDescription ? shortDescription.toString().trim() : null,
      brandId: brandIdInt,
      categoryId: categoryIdInt,
      price: priceFloat,
      originalPrice: originalPriceFloat,
      sku: sku.toString().trim(),
      stockQuantity: stockQuantityInt,
      isFeatured: isFeatured === true || isFeatured === 'true',
      isNew: isNew === true || isNew === 'true',
      rating: ratingFloat,
      reviewCount: reviewCountInt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Insert the product
    const newProduct = await db.insert(products)
      .values(insertData)
      .returning();

    return NextResponse.json(newProduct[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    
    // Handle unique constraint violations
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      if (error.message.includes('slug')) {
        return NextResponse.json({ 
          error: "Product slug already exists",
          code: "DUPLICATE_SLUG" 
        }, { status: 400 });
      }
      if (error.message.includes('sku')) {
        return NextResponse.json({ 
          error: "Product SKU already exists",
          code: "DUPLICATE_SKU" 
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

    const productId = parseInt(id);
    
    // Check if product exists
    const existingProduct = await db.select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (existingProduct.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const requestBody = await request.json();
    const { 
      name, 
      slug, 
      description, 
      shortDescription,
      brandId, 
      categoryId, 
      price, 
      originalPrice,
      sku,
      stockQuantity,
      isFeatured,
      isNew,
      rating,
      reviewCount
    } = requestBody;

    // Validate brandId if provided
    if (brandId !== undefined) {
      const brandIdInt = parseInt(brandId);
      if (isNaN(brandIdInt)) {
        return NextResponse.json({ 
          error: "Brand ID must be a valid integer",
          code: "INVALID_BRAND_ID" 
        }, { status: 400 });
      }

      const existingBrand = await db.select()
        .from(brands)
        .where(eq(brands.id, brandIdInt))
        .limit(1);

      if (existingBrand.length === 0) {
        return NextResponse.json({ 
          error: "Brand not found",
          code: "BRAND_NOT_FOUND" 
        }, { status: 400 });
      }
    }

    // Validate categoryId if provided
    if (categoryId !== undefined) {
      const categoryIdInt = parseInt(categoryId);
      if (isNaN(categoryIdInt)) {
        return NextResponse.json({ 
          error: "Category ID must be a valid integer",
          code: "INVALID_CATEGORY_ID" 
        }, { status: 400 });
      }

      const existingCategory = await db.select()
        .from(categories)
        .where(eq(categories.id, categoryIdInt))
        .limit(1);

      if (existingCategory.length === 0) {
        return NextResponse.json({ 
          error: "Category not found",
          code: "CATEGORY_NOT_FOUND" 
        }, { status: 400 });
      }
    }

    // Validate price if provided
    if (price !== undefined && price !== null) {
      const priceFloat = parseFloat(price);
      if (isNaN(priceFloat) || priceFloat < 0) {
        return NextResponse.json({ 
          error: "Price must be a valid positive number",
          code: "INVALID_PRICE" 
        }, { status: 400 });
      }
    }

    // Validate originalPrice if provided
    if (originalPrice !== undefined && originalPrice !== null) {
      const originalPriceFloat = parseFloat(originalPrice);
      if (isNaN(originalPriceFloat) || originalPriceFloat < 0) {
        return NextResponse.json({ 
          error: "Original price must be a valid positive number",
          code: "INVALID_ORIGINAL_PRICE" 
        }, { status: 400 });
      }
    }

    // Validate stockQuantity if provided
    if (stockQuantity !== undefined && stockQuantity !== null) {
      const stockQuantityInt = parseInt(stockQuantity);
      if (isNaN(stockQuantityInt) || stockQuantityInt < 0) {
        return NextResponse.json({ 
          error: "Stock quantity must be a valid non-negative integer",
          code: "INVALID_STOCK_QUANTITY" 
        }, { status: 400 });
      }
    }

    // Validate rating if provided
    if (rating !== undefined && rating !== null) {
      const ratingFloat = parseFloat(rating);
      if (isNaN(ratingFloat) || ratingFloat < 0 || ratingFloat > 5) {
        return NextResponse.json({ 
          error: "Rating must be a number between 0 and 5",
          code: "INVALID_RATING" 
        }, { status: 400 });
      }
    }

    // Validate reviewCount if provided
    if (reviewCount !== undefined && reviewCount !== null) {
      const reviewCountInt = parseInt(reviewCount);
      if (isNaN(reviewCountInt) || reviewCountInt < 0) {
        return NextResponse.json({ 
          error: "Review count must be a valid non-negative integer",
          code: "INVALID_REVIEW_COUNT" 
        }, { status: 400 });
      }
    }

    // Prepare update data
    const updateData = {
      updatedAt: new Date().toISOString()
    };

    if (name !== undefined) updateData.name = name.toString().trim();
    if (slug !== undefined) updateData.slug = slug.toString().trim();
    if (description !== undefined) updateData.description = description.toString().trim();
    if (shortDescription !== undefined) updateData.shortDescription = shortDescription ? shortDescription.toString().trim() : null;
    if (brandId !== undefined) updateData.brandId = parseInt(brandId);
    if (categoryId !== undefined) updateData.categoryId = parseInt(categoryId);
    if (price !== undefined) updateData.price = parseFloat(price);
    if (originalPrice !== undefined) updateData.originalPrice = originalPrice ? parseFloat(originalPrice) : null;
    if (sku !== undefined) updateData.sku = sku.toString().trim();
    if (stockQuantity !== undefined) updateData.stockQuantity = parseInt(stockQuantity);
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured === true || isFeatured === 'true';
    if (isNew !== undefined) updateData.isNew = isNew === true || isNew === 'true';
    if (rating !== undefined) updateData.rating = rating ? parseFloat(rating) : null;
    if (reviewCount !== undefined) updateData.reviewCount = parseInt(reviewCount);

    // Update the product
    const updated = await db.update(products)
      .set(updateData)
      .where(eq(products.id, productId))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('PUT error:', error);
    
    // Handle unique constraint violations
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      if (error.message.includes('slug')) {
        return NextResponse.json({ 
          error: "Product slug already exists",
          code: "DUPLICATE_SLUG" 
        }, { status: 400 });
      }
      if (error.message.includes('sku')) {
        return NextResponse.json({ 
          error: "Product SKU already exists",
          code: "DUPLICATE_SKU" 
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

    const productId = parseInt(id);
    
    // Check if product exists before deleting
    const existingProduct = await db.select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (existingProduct.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Delete the product
    const deleted = await db.delete(products)
      .where(eq(products.id, productId))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
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