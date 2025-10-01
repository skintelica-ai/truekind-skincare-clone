import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { blogAnalytics, blogPosts } from '@/db/schema';
import { eq, like, and, or, desc, asc, count, sql } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

const ALLOWED_EVENTS = ['pageview', 'share', 'product_click', 'scroll_50', 'scroll_100'];

export async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const user = await getCurrentUser(request);
    
    const { slug } = params;
    if (!slug) {
      return NextResponse.json({ 
        error: "Valid post ID is required",
        code: "INVALID_POST_ID" 
      }, { status: 400 });
    }

    // Parse as ID (numeric)
    const postId = parseInt(slug);
    if (isNaN(postId)) {
      return NextResponse.json({ 
        error: "Valid numeric post ID is required",
        code: "INVALID_POST_ID" 
      }, { status: 400 });
    }

    const requestBody = await request.json();
    const { event, metadata, sessionId } = requestBody;

    // Security check: reject if userId provided in body
    if ('userId' in requestBody || 'user_id' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    // Validate required fields
    if (!event) {
      return NextResponse.json({ 
        error: "Event type is required",
        code: "MISSING_EVENT" 
      }, { status: 400 });
    }

    // Validate event type
    if (!ALLOWED_EVENTS.includes(event)) {
      return NextResponse.json({ 
        error: `Event must be one of: ${ALLOWED_EVENTS.join(', ')}`,
        code: "INVALID_EVENT_TYPE" 
      }, { status: 400 });
    }

    // Validate postId exists
    const post = await db.select()
      .from(blogPosts)
      .where(eq(blogPosts.id, postId))
      .limit(1);

    if (post.length === 0) {
      return NextResponse.json({ 
        error: 'Blog post not found',
        code: "POST_NOT_FOUND" 
      }, { status: 404 });
    }

    // Prepare analytics data
    const analyticsData = {
      postId: postId,
      event: event.trim(),
      metadata: metadata ? JSON.stringify(metadata) : null,
      userId: user?.id || null,
      sessionId: sessionId?.trim() || null,
      createdAt: Math.floor(Date.now() / 1000)
    };

    const newAnalytics = await db.insert(blogAnalytics)
      .values(analyticsData)
      .returning();

    return NextResponse.json(newAnalytics[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params;
    const { searchParams } = new URL(request.url);

    if (!slug) {
      return NextResponse.json({ 
        error: "Valid post ID is required",
        code: "INVALID_POST_ID" 
      }, { status: 400 });
    }

    // Parse as ID (numeric)
    const postId = parseInt(slug);
    if (isNaN(postId)) {
      return NextResponse.json({ 
        error: "Valid numeric post ID is required",
        code: "INVALID_POST_ID" 
      }, { status: 400 });
    }

    // Validate postId exists
    const post = await db.select()
      .from(blogPosts)
      .where(eq(blogPosts.id, postId))
      .limit(1);

    if (post.length === 0) {
      return NextResponse.json({ 
        error: 'Blog post not found',
        code: "POST_NOT_FOUND" 
      }, { status: 404 });
    }

    // Date range filtering
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    
    let whereConditions = eq(blogAnalytics.postId, postId);

    if (from || to) {
      const fromTimestamp = from ? Math.floor(new Date(from).getTime() / 1000) : 0;
      const toTimestamp = to ? Math.floor(new Date(to).getTime() / 1000) : Math.floor(Date.now() / 1000);
      
      if (from && to) {
        whereConditions = and(
          eq(blogAnalytics.postId, postId),
          sql`${blogAnalytics.createdAt} >= ${fromTimestamp}`,
          sql`${blogAnalytics.createdAt} <= ${toTimestamp}`
        );
      } else if (from) {
        whereConditions = and(
          eq(blogAnalytics.postId, postId),
          sql`${blogAnalytics.createdAt} >= ${fromTimestamp}`
        );
      } else if (to) {
        whereConditions = and(
          eq(blogAnalytics.postId, postId),
          sql`${blogAnalytics.createdAt} <= ${toTimestamp}`
        );
      }
    }

    // Get event breakdown
    const eventBreakdown = await db.select({
      event: blogAnalytics.event,
      count: count()
    })
    .from(blogAnalytics)
    .where(whereConditions)
    .groupBy(blogAnalytics.event);

    // Get unique sessions count
    const uniqueSessionsResult = await db.select({
      count: sql<number>`COUNT(DISTINCT ${blogAnalytics.sessionId})`
    })
    .from(blogAnalytics)
    .where(and(
      whereConditions,
      sql`${blogAnalytics.sessionId} IS NOT NULL`
    ));

    // Calculate metrics
    const metrics = eventBreakdown.reduce((acc, item) => {
      switch (item.event) {
        case 'pageview':
          acc.totalPageviews = item.count;
          break;
        case 'share':
          acc.totalShares = item.count;
          break;
        case 'product_click':
          acc.productClicks = item.count;
          break;
        case 'scroll_50':
          acc.scroll50Count = item.count;
          break;
        case 'scroll_100':
          acc.scroll100Count = item.count;
          break;
      }
      return acc;
    }, {
      totalPageviews: 0,
      totalShares: 0,
      productClicks: 0,
      scroll50Count: 0,
      scroll100Count: 0
    });

    const uniqueSessions = uniqueSessionsResult[0]?.count || 0;

    // Calculate scroll engagement percentages
    const scrollEngagement = {
      scroll50Percentage: metrics.totalPageviews > 0 ? 
        Math.round((metrics.scroll50Count / metrics.totalPageviews) * 100) : 0,
      scroll100Percentage: metrics.totalPageviews > 0 ? 
        Math.round((metrics.scroll100Count / metrics.totalPageviews) * 100) : 0
    };

    const summary = {
      postId: postId,
      totalPageviews: metrics.totalPageviews,
      uniqueSessions,
      totalShares: metrics.totalShares,
      productClicks: metrics.productClicks,
      scrollEngagement,
      eventBreakdown: eventBreakdown.reduce((acc, item) => {
        acc[item.event] = item.count;
        return acc;
      }, {} as Record<string, number>)
    };

    // Handle pagination for individual events if requested
    const includeEvents = searchParams.get('includeEvents');
    if (includeEvents === 'true') {
      const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
      const offset = parseInt(searchParams.get('offset') || '0');

      const events = await db.select()
        .from(blogAnalytics)
        .where(whereConditions)
        .orderBy(desc(blogAnalytics.createdAt))
        .limit(limit)
        .offset(offset);

      return NextResponse.json({
        summary,
        events
      });
    }

    return NextResponse.json(summary);

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}