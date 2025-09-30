import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { coupons } from '@/db/schema';
import { eq } from 'drizzle-orm';

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

    const coupon = await db.select()
      .from(coupons)
      .where(eq(coupons.id, parseInt(id)))
      .limit(1);

    if (coupon.length === 0) {
      return NextResponse.json({ 
        error: 'Coupon not found' 
      }, { status: 404 });
    }

    return NextResponse.json(coupon[0]);
  } catch (error) {
    console.error('GET coupon error:', error);
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
    
    // Check if record exists
    const existingCoupon = await db.select()
      .from(coupons)
      .where(eq(coupons.id, parseInt(id)))
      .limit(1);

    if (existingCoupon.length === 0) {
      return NextResponse.json({ 
        error: 'Coupon not found' 
      }, { status: 404 });
    }

    // Validate discount type if provided
    if (requestBody.discountType && !['percentage', 'fixed'].includes(requestBody.discountType)) {
      return NextResponse.json({ 
        error: "Discount type must be 'percentage' or 'fixed'",
        code: "INVALID_DISCOUNT_TYPE" 
      }, { status: 400 });
    }

    // Validate date format and logic if provided
    if (requestBody.validFrom || requestBody.validUntil) {
      const validFrom = requestBody.validFrom || existingCoupon[0].validFrom;
      const validUntil = requestBody.validUntil || existingCoupon[0].validUntil;
      
      const fromDate = new Date(validFrom);
      const untilDate = new Date(validUntil);
      
      if (isNaN(fromDate.getTime()) || isNaN(untilDate.getTime())) {
        return NextResponse.json({ 
          error: "Invalid date format. Use ISO string format",
          code: "INVALID_DATE_FORMAT" 
        }, { status: 400 });
      }
      
      if (fromDate >= untilDate) {
        return NextResponse.json({ 
          error: "Valid from date must be before valid until date",
          code: "INVALID_DATE_RANGE" 
        }, { status: 400 });
      }
    }

    // Validate numeric fields if provided
    if (requestBody.discountValue !== undefined && (isNaN(requestBody.discountValue) || requestBody.discountValue < 0)) {
      return NextResponse.json({ 
        error: "Discount value must be a positive number",
        code: "INVALID_DISCOUNT_VALUE" 
      }, { status: 400 });
    }

    if (requestBody.minPurchaseAmount !== undefined && (isNaN(requestBody.minPurchaseAmount) || requestBody.minPurchaseAmount < 0)) {
      return NextResponse.json({ 
        error: "Minimum purchase amount must be a positive number",
        code: "INVALID_MIN_PURCHASE" 
      }, { status: 400 });
    }

    if (requestBody.maxDiscountAmount !== undefined && (isNaN(requestBody.maxDiscountAmount) || requestBody.maxDiscountAmount < 0)) {
      return NextResponse.json({ 
        error: "Maximum discount amount must be a positive number",
        code: "INVALID_MAX_DISCOUNT" 
      }, { status: 400 });
    }

    if (requestBody.usageLimit !== undefined && (isNaN(requestBody.usageLimit) || requestBody.usageLimit < 0)) {
      return NextResponse.json({ 
        error: "Usage limit must be a positive number",
        code: "INVALID_USAGE_LIMIT" 
      }, { status: 400 });
    }

    if (requestBody.usedCount !== undefined && (isNaN(requestBody.usedCount) || requestBody.usedCount < 0)) {
      return NextResponse.json({ 
        error: "Used count must be a positive number",
        code: "INVALID_USED_COUNT" 
      }, { status: 400 });
    }

    // Validate code uniqueness if provided and different from current
    if (requestBody.code && requestBody.code.trim() !== existingCoupon[0].code) {
      const codeExists = await db.select()
        .from(coupons)
        .where(eq(coupons.code, requestBody.code.trim().toUpperCase()))
        .limit(1);

      if (codeExists.length > 0) {
        return NextResponse.json({ 
          error: "Coupon code already exists",
          code: "DUPLICATE_CODE" 
        }, { status: 400 });
      }
    }

    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    if (requestBody.code !== undefined) {
      updates.code = requestBody.code.trim().toUpperCase();
    }
    if (requestBody.description !== undefined) {
      updates.description = requestBody.description.trim();
    }
    if (requestBody.discountType !== undefined) {
      updates.discountType = requestBody.discountType;
    }
    if (requestBody.discountValue !== undefined) {
      updates.discountValue = requestBody.discountValue;
    }
    if (requestBody.minPurchaseAmount !== undefined) {
      updates.minPurchaseAmount = requestBody.minPurchaseAmount;
    }
    if (requestBody.maxDiscountAmount !== undefined) {
      updates.maxDiscountAmount = requestBody.maxDiscountAmount;
    }
    if (requestBody.usageLimit !== undefined) {
      updates.usageLimit = requestBody.usageLimit;
    }
    if (requestBody.usedCount !== undefined) {
      updates.usedCount = requestBody.usedCount;
    }
    if (requestBody.validFrom !== undefined) {
      updates.validFrom = requestBody.validFrom;
    }
    if (requestBody.validUntil !== undefined) {
      updates.validUntil = requestBody.validUntil;
    }
    if (requestBody.isActive !== undefined) {
      updates.isActive = requestBody.isActive;
    }

    const updatedCoupon = await db.update(coupons)
      .set(updates)
      .where(eq(coupons.id, parseInt(id)))
      .returning();

    return NextResponse.json(updatedCoupon[0]);
  } catch (error) {
    console.error('PUT coupon error:', error);
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
    const existingCoupon = await db.select()
      .from(coupons)
      .where(eq(coupons.id, parseInt(id)))
      .limit(1);

    if (existingCoupon.length === 0) {
      return NextResponse.json({ 
        error: 'Coupon not found' 
      }, { status: 404 });
    }

    const deletedCoupon = await db.delete(coupons)
      .where(eq(coupons.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      message: 'Coupon deleted successfully',
      deletedCoupon: deletedCoupon[0]
    });
  } catch (error) {
    console.error('DELETE coupon error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}