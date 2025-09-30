import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { coupons } from '@/db/schema';
import { eq, like, and, or, desc, asc, gte, lte } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single coupon fetch
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const coupon = await db.select()
        .from(coupons)
        .where(eq(coupons.id, parseInt(id)))
        .limit(1);

      if (coupon.length === 0) {
        return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
      }

      return NextResponse.json(coupon[0]);
    }

    // List coupons with pagination and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const isActiveFilter = searchParams.get('isActive');
    const validDateFilter = searchParams.get('validDate');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    let query = db.select().from(coupons);
    const conditions = [];

    // Search filter
    if (search) {
      conditions.push(
        or(
          like(coupons.code, `%${search}%`),
          like(coupons.description, `%${search}%`)
        )
      );
    }

    // Active status filter
    if (isActiveFilter !== null) {
      const isActive = isActiveFilter === 'true';
      conditions.push(eq(coupons.isActive, isActive));
    }

    // Valid date filter - check if coupon is valid on specific date
    if (validDateFilter) {
      const validDate = validDateFilter;
      conditions.push(
        and(
          lte(coupons.validFrom, validDate),
          gte(coupons.validUntil, validDate)
        )
      );
    }

    // Apply all conditions
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Sorting
    const sortField = sort === 'validFrom' ? coupons.validFrom :
                     sort === 'validUntil' ? coupons.validUntil :
                     sort === 'code' ? coupons.code :
                     sort === 'usedCount' ? coupons.usedCount :
                     coupons.createdAt;

    query = order === 'asc' ? 
      query.orderBy(asc(sortField)) : 
      query.orderBy(desc(sortField));

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
      code, 
      description, 
      discountType, 
      discountValue, 
      minPurchaseAmount,
      maxDiscountAmount,
      usageLimit,
      validFrom, 
      validUntil 
    } = requestBody;

    // Validate required fields
    if (!code) {
      return NextResponse.json({ 
        error: "Code is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (!discountType) {
      return NextResponse.json({ 
        error: "Discount type is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (discountValue === undefined || discountValue === null) {
      return NextResponse.json({ 
        error: "Discount value is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (!validFrom) {
      return NextResponse.json({ 
        error: "Valid from date is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (!validUntil) {
      return NextResponse.json({ 
        error: "Valid until date is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    // Validate discount type
    if (discountType !== 'percentage' && discountType !== 'fixed') {
      return NextResponse.json({ 
        error: "Discount type must be 'percentage' or 'fixed'",
        code: "INVALID_DISCOUNT_TYPE" 
      }, { status: 400 });
    }

    // Validate discount value
    if (typeof discountValue !== 'number' || discountValue <= 0) {
      return NextResponse.json({ 
        error: "Discount value must be a positive number",
        code: "INVALID_DISCOUNT_VALUE" 
      }, { status: 400 });
    }

    // Validate percentage discount value
    if (discountType === 'percentage' && discountValue > 100) {
      return NextResponse.json({ 
        error: "Percentage discount cannot exceed 100%",
        code: "INVALID_PERCENTAGE_VALUE" 
      }, { status: 400 });
    }

    // Validate date range
    if (new Date(validFrom) >= new Date(validUntil)) {
      return NextResponse.json({ 
        error: "Valid until date must be after valid from date",
        code: "INVALID_DATE_RANGE" 
      }, { status: 400 });
    }

    // Check for existing coupon code
    const existingCoupon = await db.select()
      .from(coupons)
      .where(eq(coupons.code, code.trim().toUpperCase()))
      .limit(1);

    if (existingCoupon.length > 0) {
      return NextResponse.json({ 
        error: "Coupon code already exists",
        code: "DUPLICATE_COUPON_CODE" 
      }, { status: 400 });
    }

    // Prepare insert data
    const insertData = {
      code: code.trim().toUpperCase(),
      description: description?.trim() || null,
      discountType,
      discountValue,
      minPurchaseAmount: minPurchaseAmount || null,
      maxDiscountAmount: maxDiscountAmount || null,
      usageLimit: usageLimit || null,
      usedCount: 0,
      validFrom,
      validUntil,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    const newCoupon = await db.insert(coupons)
      .values(insertData)
      .returning();

    return NextResponse.json(newCoupon[0], { status: 201 });

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
    const { 
      code, 
      description, 
      discountType, 
      discountValue, 
      minPurchaseAmount,
      maxDiscountAmount,
      usageLimit,
      validFrom, 
      validUntil,
      isActive
    } = requestBody;

    // Check if coupon exists
    const existingCoupon = await db.select()
      .from(coupons)
      .where(eq(coupons.id, parseInt(id)))
      .limit(1);

    if (existingCoupon.length === 0) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }

    // Validate discount type if provided
    if (discountType && discountType !== 'percentage' && discountType !== 'fixed') {
      return NextResponse.json({ 
        error: "Discount type must be 'percentage' or 'fixed'",
        code: "INVALID_DISCOUNT_TYPE" 
      }, { status: 400 });
    }

    // Validate discount value if provided
    if (discountValue !== undefined && (typeof discountValue !== 'number' || discountValue <= 0)) {
      return NextResponse.json({ 
        error: "Discount value must be a positive number",
        code: "INVALID_DISCOUNT_VALUE" 
      }, { status: 400 });
    }

    // Validate percentage discount value
    if (discountType === 'percentage' && discountValue && discountValue > 100) {
      return NextResponse.json({ 
        error: "Percentage discount cannot exceed 100%",
        code: "INVALID_PERCENTAGE_VALUE" 
      }, { status: 400 });
    }

    // Validate date range if both dates provided
    if (validFrom && validUntil && new Date(validFrom) >= new Date(validUntil)) {
      return NextResponse.json({ 
        error: "Valid until date must be after valid from date",
        code: "INVALID_DATE_RANGE" 
      }, { status: 400 });
    }

    // Check for duplicate coupon code if code is being updated
    if (code && code.trim().toUpperCase() !== existingCoupon[0].code) {
      const duplicateCoupon = await db.select()
        .from(coupons)
        .where(eq(coupons.code, code.trim().toUpperCase()))
        .limit(1);

      if (duplicateCoupon.length > 0) {
        return NextResponse.json({ 
          error: "Coupon code already exists",
          code: "DUPLICATE_COUPON_CODE" 
        }, { status: 400 });
      }
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date().toISOString()
    };

    if (code !== undefined) updateData.code = code.trim().toUpperCase();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (discountType !== undefined) updateData.discountType = discountType;
    if (discountValue !== undefined) updateData.discountValue = discountValue;
    if (minPurchaseAmount !== undefined) updateData.minPurchaseAmount = minPurchaseAmount || null;
    if (maxDiscountAmount !== undefined) updateData.maxDiscountAmount = maxDiscountAmount || null;
    if (usageLimit !== undefined) updateData.usageLimit = usageLimit || null;
    if (validFrom !== undefined) updateData.validFrom = validFrom;
    if (validUntil !== undefined) updateData.validUntil = validUntil;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updated = await db.update(coupons)
      .set(updateData)
      .where(eq(coupons.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
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

    // Check if coupon exists
    const existingCoupon = await db.select()
      .from(coupons)
      .where(eq(coupons.id, parseInt(id)))
      .limit(1);

    if (existingCoupon.length === 0) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }

    const deleted = await db.delete(coupons)
      .where(eq(coupons.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Coupon deleted successfully',
      deletedCoupon: deleted[0]
    });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}