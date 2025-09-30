import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reviews, products } from '@/db/schema';
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
        .from(reviews)
        .where(eq(reviews.id, parseInt(id)))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json({ error: 'Review not found' }, { status: 404 });
      }

      return NextResponse.json(record[0]);
    }

    // List with pagination, filtering, and sorting
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const productId = searchParams.get('productId');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    let query = db.select().from(reviews);

    // Build where conditions
    const conditions = [];

    // Filter by productId
    if (productId) {
      if (isNaN(parseInt(productId))) {
        return NextResponse.json({ 
          error: "Valid product ID is required",
          code: "INVALID_PRODUCT_ID" 
        }, { status: 400 });
      }
      conditions.push(eq(reviews.productId, parseInt(productId)));
    }

    // Search across text fields
    if (search) {
      conditions.push(
        or(
          like(reviews.title, `%${search}%`),
          like(reviews.comment, `%${search}%`)
        )
      );
    }

    // Apply where conditions
    if (conditions.length > 0) {
      query = query.where(conditions.length === 1 ? conditions[0] : and(...conditions));
    }

    // Apply sorting
    if (sort === 'rating') {
      query = query.orderBy(order === 'asc' ? asc(reviews.rating) : desc(reviews.rating));
    } else if (sort === 'createdAt') {
      query = query.orderBy(order === 'asc' ? asc(reviews.createdAt) : desc(reviews.createdAt));
    } else if (sort === 'helpfulCount') {
      query = query.orderBy(order === 'asc' ? asc(reviews.helpfulCount) : desc(reviews.helpfulCount));
    } else {
      query = query.orderBy(desc(reviews.createdAt));
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
    const { productId, rating, title, comment } = requestBody;

    // Security check: reject if userId provided in body
    if ('userId' in requestBody || 'user_id' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    // Validate required fields
    if (!productId) {
      return NextResponse.json({ 
        error: "Product ID is required",
        code: "MISSING_PRODUCT_ID" 
      }, { status: 400 });
    }

    if (!rating) {
      return NextResponse.json({ 
        error: "Rating is required",
        code: "MISSING_RATING" 
      }, { status: 400 });
    }

    if (!comment || comment.trim() === '') {
      return NextResponse.json({ 
        error: "Comment is required",
        code: "MISSING_COMMENT" 
      }, { status: 400 });
    }

    // Validate productId is valid integer
    if (isNaN(parseInt(productId))) {
      return NextResponse.json({ 
        error: "Valid product ID is required",
        code: "INVALID_PRODUCT_ID" 
      }, { status: 400 });
    }

    // Validate rating is between 1-5
    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json({ 
        error: "Rating must be between 1 and 5",
        code: "INVALID_RATING" 
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
      productId: parseInt(productId),
      rating: ratingNum,
      title: title ? title.trim() : null,
      comment: comment.trim(),
      isVerified: false,
      helpfulCount: 0,
      createdAt: new Date().toISOString()
    };

    const newRecord = await db.insert(reviews)
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

    // Security check: reject if userId provided in body
    if ('userId' in requestBody || 'user_id' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    // Check if record exists
    const existingRecord = await db.select()
      .from(reviews)
      .where(eq(reviews.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Prepare update data
    const updates: any = {};

    if (requestBody.productId !== undefined) {
      if (isNaN(parseInt(requestBody.productId))) {
        return NextResponse.json({ 
          error: "Valid product ID is required",
          code: "INVALID_PRODUCT_ID" 
        }, { status: 400 });
      }

      // Verify product exists
      const product = await db.select()
        .from(products)
        .where(eq(products.id, parseInt(requestBody.productId)))
        .limit(1);

      if (product.length === 0) {
        return NextResponse.json({ 
          error: "Product not found",
          code: "PRODUCT_NOT_FOUND" 
        }, { status: 404 });
      }

      updates.productId = parseInt(requestBody.productId);
    }

    if (requestBody.rating !== undefined) {
      const ratingNum = parseInt(requestBody.rating);
      if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        return NextResponse.json({ 
          error: "Rating must be between 1 and 5",
          code: "INVALID_RATING" 
        }, { status: 400 });
      }
      updates.rating = ratingNum;
    }

    if (requestBody.title !== undefined) {
      updates.title = requestBody.title ? requestBody.title.trim() : null;
    }

    if (requestBody.comment !== undefined) {
      if (!requestBody.comment || requestBody.comment.trim() === '') {
        return NextResponse.json({ 
          error: "Comment cannot be empty",
          code: "EMPTY_COMMENT" 
        }, { status: 400 });
      }
      updates.comment = requestBody.comment.trim();
    }

    if (requestBody.isVerified !== undefined) {
      updates.isVerified = Boolean(requestBody.isVerified);
    }

    if (requestBody.helpfulCount !== undefined) {
      const helpfulCountNum = parseInt(requestBody.helpfulCount);
      if (isNaN(helpfulCountNum) || helpfulCountNum < 0) {
        return NextResponse.json({ 
          error: "Helpful count must be a non-negative number",
          code: "INVALID_HELPFUL_COUNT" 
        }, { status: 400 });
      }
      updates.helpfulCount = helpfulCountNum;
    }

    // Always update updatedAt (if the field exists in schema)
    // Note: The schema doesn't include updatedAt, so we won't add it

    const updated = await db.update(reviews)
      .set(updates)
      .where(eq(reviews.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
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

    // Check if record exists
    const existingRecord = await db.select()
      .from(reviews)
      .where(eq(reviews.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    const deleted = await db.delete(reviews)
      .where(eq(reviews.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Review deleted successfully',
      deletedRecord: deleted[0]
    });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}