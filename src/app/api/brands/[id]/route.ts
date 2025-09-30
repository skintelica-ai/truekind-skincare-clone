import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { brands } from '@/db/schema';
import { eq } from 'drizzle-orm';

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

    const brand = await db.select()
      .from(brands)
      .where(eq(brands.id, parseInt(id)))
      .limit(1);

    if (brand.length === 0) {
      return NextResponse.json({ 
        error: 'Brand not found' 
      }, { status: 404 });
    }

    return NextResponse.json(brand[0]);

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

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const requestBody = await request.json();

    // Validate required fields
    if (!requestBody.name) {
      return NextResponse.json({ 
        error: "Name is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    // Check if brand exists
    const existingBrand = await db.select()
      .from(brands)
      .where(eq(brands.id, parseInt(id)))
      .limit(1);

    if (existingBrand.length === 0) {
      return NextResponse.json({ 
        error: 'Brand not found' 
      }, { status: 404 });
    }

    // Prepare update data
    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    if (requestBody.name) {
      updates.name = requestBody.name.trim();
    }

    if (requestBody.slug) {
      updates.slug = requestBody.slug.trim();
    }

    if (requestBody.description !== undefined) {
      updates.description = requestBody.description?.trim() || null;
    }

    if (requestBody.logoUrl !== undefined) {
      updates.logoUrl = requestBody.logoUrl?.trim() || null;
    }

    if (requestBody.bannerUrl !== undefined) {
      updates.bannerUrl = requestBody.bannerUrl?.trim() || null;
    }

    if (requestBody.isFeatured !== undefined) {
      updates.isFeatured = Boolean(requestBody.isFeatured);
    }

    const updatedBrand = await db.update(brands)
      .set(updates)
      .where(eq(brands.id, parseInt(id)))
      .returning();

    if (updatedBrand.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to update brand' 
      }, { status: 500 });
    }

    return NextResponse.json(updatedBrand[0]);

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

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if brand exists
    const existingBrand = await db.select()
      .from(brands)
      .where(eq(brands.id, parseInt(id)))
      .limit(1);

    if (existingBrand.length === 0) {
      return NextResponse.json({ 
        error: 'Brand not found' 
      }, { status: 404 });
    }

    const deletedBrand = await db.delete(brands)
      .where(eq(brands.id, parseInt(id)))
      .returning();

    if (deletedBrand.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to delete brand' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Brand deleted successfully',
      deletedBrand: deletedBrand[0] 
    });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}