import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders } from '@/db/schema';
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

    const order = await db.select()
      .from(orders)
      .where(eq(orders.id, parseInt(id)))
      .limit(1);

    if (order.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order[0]);
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

    // Security check: reject if user identifiers provided in body
    if ('userId' in requestBody || 'user_id' in requestBody) {
      return NextResponse.json({
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED"
      }, { status: 400 });
    }

    // Check if record exists
    const existingOrder = await db.select()
      .from(orders)
      .where(eq(orders.id, parseInt(id)))
      .limit(1);

    if (existingOrder.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Validate required fields if provided
    const updates: any = {};

    if ('orderNumber' in requestBody) updates.orderNumber = requestBody.orderNumber?.toString().trim();
    if ('sessionId' in requestBody) updates.sessionId = requestBody.sessionId?.toString().trim();
    if ('status' in requestBody) updates.status = requestBody.status?.toString().trim();
    if ('subtotal' in requestBody) updates.subtotal = parseFloat(requestBody.subtotal);
    if ('discountAmount' in requestBody) updates.discountAmount = parseFloat(requestBody.discountAmount) || 0;
    if ('taxAmount' in requestBody) updates.taxAmount = parseFloat(requestBody.taxAmount) || 0;
    if ('shippingAmount' in requestBody) updates.shippingAmount = parseFloat(requestBody.shippingAmount) || 0;
    if ('totalAmount' in requestBody) updates.totalAmount = parseFloat(requestBody.totalAmount);
    if ('couponCode' in requestBody) updates.couponCode = requestBody.couponCode?.toString().trim();
    if ('paymentMethod' in requestBody) updates.paymentMethod = requestBody.paymentMethod?.toString().trim();
    if ('paymentStatus' in requestBody) updates.paymentStatus = requestBody.paymentStatus?.toString().trim();
    if ('shippingAddress' in requestBody) updates.shippingAddress = requestBody.shippingAddress?.toString().trim();
    if ('billingAddress' in requestBody) updates.billingAddress = requestBody.billingAddress?.toString().trim();
    if ('trackingNumber' in requestBody) updates.trackingNumber = requestBody.trackingNumber?.toString().trim();
    if ('notes' in requestBody) updates.notes = requestBody.notes?.toString().trim();

    // Validate required fields if they're being updated
    if ('orderNumber' in updates && !updates.orderNumber) {
      return NextResponse.json({
        error: "Order number is required",
        code: "MISSING_ORDER_NUMBER"
      }, { status: 400 });
    }

    if ('status' in updates && !updates.status) {
      return NextResponse.json({
        error: "Status is required",
        code: "MISSING_STATUS"
      }, { status: 400 });
    }

    if ('subtotal' in updates && (isNaN(updates.subtotal) || updates.subtotal < 0)) {
      return NextResponse.json({
        error: "Valid subtotal is required",
        code: "INVALID_SUBTOTAL"
      }, { status: 400 });
    }

    if ('totalAmount' in updates && (isNaN(updates.totalAmount) || updates.totalAmount < 0)) {
      return NextResponse.json({
        error: "Valid total amount is required",
        code: "INVALID_TOTAL_AMOUNT"
      }, { status: 400 });
    }

    if ('paymentMethod' in updates && !updates.paymentMethod) {
      return NextResponse.json({
        error: "Payment method is required",
        code: "MISSING_PAYMENT_METHOD"
      }, { status: 400 });
    }

    if ('paymentStatus' in updates && !updates.paymentStatus) {
      return NextResponse.json({
        error: "Payment status is required",
        code: "MISSING_PAYMENT_STATUS"
      }, { status: 400 });
    }

    if ('shippingAddress' in updates && !updates.shippingAddress) {
      return NextResponse.json({
        error: "Shipping address is required",
        code: "MISSING_SHIPPING_ADDRESS"
      }, { status: 400 });
    }

    // Always update updatedAt timestamp
    updates.updatedAt = new Date().toISOString();

    const updated = await db.update(orders)
      .set(updates)
      .where(eq(orders.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
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

    // Check if record exists
    const existingOrder = await db.select()
      .from(orders)
      .where(eq(orders.id, parseInt(id)))
      .limit(1);

    if (existingOrder.length === 0) {
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
    console.error('DELETE error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}