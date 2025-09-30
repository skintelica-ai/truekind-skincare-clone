import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders } from '@/db/schema';
import { eq, like, and, or, desc, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');
    const sessionId = searchParams.get('sessionId');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';
    const id = searchParams.get('id');

    // If ID is provided, fetch single record
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const record = await db.select()
        .from(orders)
        .where(eq(orders.id, parseInt(id)))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      return NextResponse.json(record[0]);
    }

    // Build query with conditions
    let whereConditions = [];

    // Add filters
    if (status) {
      whereConditions.push(eq(orders.status, status));
    }
    if (userId) {
      whereConditions.push(eq(orders.userId, parseInt(userId)));
    }
    if (sessionId) {
      whereConditions.push(eq(orders.sessionId, sessionId));
    }

    // Add search conditions
    if (search) {
      whereConditions.push(
        or(
          like(orders.orderNumber, `%${search}%`),
          like(orders.paymentMethod, `%${search}%`),
          like(orders.paymentStatus, `%${search}%`),
          like(orders.shippingAddress, `%${search}%`),
          like(orders.notes, `%${search}%`)
        )
      );
    }

    // Build query
    let query = db.select().from(orders);
    
    if (whereConditions.length > 0) {
      query = query.where(and(...whereConditions));
    }

    // Add sorting
    const orderDirection = order === 'asc' ? asc : desc;
    if (sort === 'createdAt') {
      query = query.orderBy(orderDirection(orders.createdAt));
    } else if (sort === 'updatedAt') {
      query = query.orderBy(orderDirection(orders.updatedAt));
    } else if (sort === 'totalAmount') {
      query = query.orderBy(orderDirection(orders.totalAmount));
    } else if (sort === 'orderNumber') {
      query = query.orderBy(orderDirection(orders.orderNumber));
    }

    // Add pagination
    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results);

  } catch (error) {
    console.error('GET orders error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const { 
      orderNumber, 
      userId, 
      sessionId, 
      status, 
      subtotal, 
      discountAmount, 
      taxAmount, 
      shippingAmount, 
      totalAmount, 
      couponCode, 
      paymentMethod, 
      paymentStatus, 
      shippingAddress, 
      billingAddress, 
      trackingNumber, 
      notes 
    } = requestBody;

    // Validate required fields
    if (!orderNumber) {
      return NextResponse.json({ 
        error: "Order number is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (!status) {
      return NextResponse.json({ 
        error: "Status is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (subtotal === undefined || subtotal === null) {
      return NextResponse.json({ 
        error: "Subtotal is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (totalAmount === undefined || totalAmount === null) {
      return NextResponse.json({ 
        error: "Total amount is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (!paymentMethod) {
      return NextResponse.json({ 
        error: "Payment method is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (!paymentStatus) {
      return NextResponse.json({ 
        error: "Payment status is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (!shippingAddress) {
      return NextResponse.json({ 
        error: "Shipping address is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    // Prepare insert data with defaults and auto-generated fields
    const insertData = {
      orderNumber: orderNumber.trim(),
      userId: userId || null,
      sessionId: sessionId || null,
      status: status.trim(),
      subtotal: parseFloat(subtotal),
      discountAmount: parseFloat(discountAmount) || 0,
      taxAmount: parseFloat(taxAmount) || 0,
      shippingAmount: parseFloat(shippingAmount) || 0,
      totalAmount: parseFloat(totalAmount),
      couponCode: couponCode?.trim() || null,
      paymentMethod: paymentMethod.trim(),
      paymentStatus: paymentStatus.trim(),
      shippingAddress: shippingAddress.trim(),
      billingAddress: billingAddress?.trim() || null,
      trackingNumber: trackingNumber?.trim() || null,
      notes: notes?.trim() || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newOrder = await db.insert(orders)
      .values(insertData)
      .returning();

    return NextResponse.json(newOrder[0], { status: 201 });

  } catch (error) {
    console.error('POST orders error:', error);
    
    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ 
        error: "Order number already exists",
        code: "DUPLICATE_ORDER_NUMBER" 
      }, { status: 400 });
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

    const requestBody = await request.json();
    const { 
      orderNumber, 
      userId, 
      sessionId, 
      status, 
      subtotal, 
      discountAmount, 
      taxAmount, 
      shippingAmount, 
      totalAmount, 
      couponCode, 
      paymentMethod, 
      paymentStatus, 
      shippingAddress, 
      billingAddress, 
      trackingNumber, 
      notes 
    } = requestBody;

    // Check if record exists
    const existingRecord = await db.select()
      .from(orders)
      .where(eq(orders.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Prepare update data - only include provided fields
    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    if (orderNumber !== undefined) updates.orderNumber = orderNumber.trim();
    if (userId !== undefined) updates.userId = userId;
    if (sessionId !== undefined) updates.sessionId = sessionId;
    if (status !== undefined) updates.status = status.trim();
    if (subtotal !== undefined) updates.subtotal = parseFloat(subtotal);
    if (discountAmount !== undefined) updates.discountAmount = parseFloat(discountAmount);
    if (taxAmount !== undefined) updates.taxAmount = parseFloat(taxAmount);
    if (shippingAmount !== undefined) updates.shippingAmount = parseFloat(shippingAmount);
    if (totalAmount !== undefined) updates.totalAmount = parseFloat(totalAmount);
    if (couponCode !== undefined) updates.couponCode = couponCode?.trim() || null;
    if (paymentMethod !== undefined) updates.paymentMethod = paymentMethod.trim();
    if (paymentStatus !== undefined) updates.paymentStatus = paymentStatus.trim();
    if (shippingAddress !== undefined) updates.shippingAddress = shippingAddress.trim();
    if (billingAddress !== undefined) updates.billingAddress = billingAddress?.trim() || null;
    if (trackingNumber !== undefined) updates.trackingNumber = trackingNumber?.trim() || null;
    if (notes !== undefined) updates.notes = notes?.trim() || null;

    const updated = await db.update(orders)
      .set(updates)
      .where(eq(orders.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(updated[0]);

  } catch (error) {
    console.error('PUT orders error:', error);
    
    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ 
        error: "Order number already exists",
        code: "DUPLICATE_ORDER_NUMBER" 
      }, { status: 400 });
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

    // Check if record exists before deleting
    const existingRecord = await db.select()
      .from(orders)
      .where(eq(orders.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const deleted = await db.delete(orders)
      .where(eq(orders.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Order deleted successfully',
      deletedOrder: deleted[0]
    });

  } catch (error) {
    console.error('DELETE orders error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}