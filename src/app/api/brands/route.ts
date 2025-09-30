import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { brands } from '@/db/schema';
import { eq, like, and, or, desc, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single brand by ID
    if (id) {
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
        return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
      }

      return NextResponse.json(brand[0]);
    }

    // List brands with pagination, search, and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const isFeatured = searchParams.get('isFeatured');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    let query = db.select().from(brands);

    // Build where conditions
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          like(brands.name, `%${search}%`),
          like(brands.description, `%${search}%`)
        )
      );
    }

    if (isFeatured !== null && isFeatured !== undefined) {
      const featuredValue = isFeatured === 'true';
      conditions.push(eq(brands.isFeatured, featuredValue));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    const orderColumn = sort === 'name' ? brands.name : brands.createdAt;
    const orderDirection = order === 'asc' ? asc : desc;
    query = query.orderBy(orderDirection(orderColumn));

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
    const body = await request.json();
    const { name, slug, description, logoUrl, bannerUrl, isFeatured } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json({ 
        error: "Name is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (!slug) {
      return NextResponse.json({ 
        error: "Slug is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    // Sanitize inputs
    const sanitizedName = name.trim();
    const sanitizedSlug = slug.trim().toLowerCase();
    const sanitizedDescription = description ? description.trim() : null;
    const sanitizedLogoUrl = logoUrl ? logoUrl.trim() : null;
    const sanitizedBannerUrl = bannerUrl ? bannerUrl.trim() : null;

    // Check for unique constraints
    const existingName = await db.select()
      .from(brands)
      .where(eq(brands.name, sanitizedName))
      .limit(1);

    if (existingName.length > 0) {
      return NextResponse.json({ 
        error: "Brand name already exists",
        code: "DUPLICATE_NAME" 
      }, { status: 400 });
    }

    const existingSlug = await db.select()
      .from(brands)
      .where(eq(brands.slug, sanitizedSlug))
      .limit(1);

    if (existingSlug.length > 0) {
      return NextResponse.json({ 
        error: "Brand slug already exists",
        code: "DUPLICATE_SLUG" 
      }, { status: 400 });
    }

    const newBrand = await db.insert(brands)
      .values({
        name: sanitizedName,
        slug: sanitizedSlug,
        description: sanitizedDescription,
        logoUrl: sanitizedLogoUrl,
        bannerUrl: sanitizedBannerUrl,
        isFeatured: isFeatured || false,
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newBrand[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    if (error.message?.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ 
        error: "Brand name or slug already exists",
        code: "UNIQUE_CONSTRAINT_ERROR" 
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

    const body = await request.json();
    const { name, slug, description, logoUrl, bannerUrl, isFeatured } = body;

    // Check if brand exists
    const existingBrand = await db.select()
      .from(brands)
      .where(eq(brands.id, parseInt(id)))
      .limit(1);

    if (existingBrand.length === 0) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {};

    if (name !== undefined) {
      const sanitizedName = name.trim();
      // Check for unique name constraint (excluding current record)
      const existingName = await db.select()
        .from(brands)
        .where(and(eq(brands.name, sanitizedName), eq(brands.id, parseInt(id))))
        .limit(1);

      if (existingName.length === 0) {
        const duplicateName = await db.select()
          .from(brands)
          .where(eq(brands.name, sanitizedName))
          .limit(1);

        if (duplicateName.length > 0) {
          return NextResponse.json({ 
            error: "Brand name already exists",
            code: "DUPLICATE_NAME" 
          }, { status: 400 });
        }
      }
      updateData.name = sanitizedName;
    }

    if (slug !== undefined) {
      const sanitizedSlug = slug.trim().toLowerCase();
      // Check for unique slug constraint (excluding current record)
      const existingSlug = await db.select()
        .from(brands)
        .where(and(eq(brands.slug, sanitizedSlug), eq(brands.id, parseInt(id))))
        .limit(1);

      if (existingSlug.length === 0) {
        const duplicateSlug = await db.select()
          .from(brands)
          .where(eq(brands.slug, sanitizedSlug))
          .limit(1);

        if (duplicateSlug.length > 0) {
          return NextResponse.json({ 
            error: "Brand slug already exists",
            code: "DUPLICATE_SLUG" 
          }, { status: 400 });
        }
      }
      updateData.slug = sanitizedSlug;
    }

    if (description !== undefined) {
      updateData.description = description ? description.trim() : null;
    }

    if (logoUrl !== undefined) {
      updateData.logoUrl = logoUrl ? logoUrl.trim() : null;
    }

    if (bannerUrl !== undefined) {
      updateData.bannerUrl = bannerUrl ? bannerUrl.trim() : null;
    }

    if (isFeatured !== undefined) {
      updateData.isFeatured = Boolean(isFeatured);
    }

    const updated = await db.update(brands)
      .set(updateData)
      .where(eq(brands.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('PUT error:', error);
    if (error.message?.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ 
        error: "Brand name or slug already exists",
        code: "UNIQUE_CONSTRAINT_ERROR" 
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

    // Check if brand exists
    const existingBrand = await db.select()
      .from(brands)
      .where(eq(brands.id, parseInt(id)))
      .limit(1);

    if (existingBrand.length === 0) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    const deleted = await db.delete(brands)
      .where(eq(brands.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Brand deleted successfully',
      deletedBrand: deleted[0] 
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}