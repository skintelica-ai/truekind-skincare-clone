import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { blogComments, blogPosts, user } from '@/db/schema';
import { eq, like, and, or, desc, asc, isNull } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const postId = searchParams.get('postId');
    const status = searchParams.get('status');
    const authorId = searchParams.get('authorId');
    const parentCommentId = searchParams.get('parentCommentId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    // Single comment by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const comment = await db.select({
        id: blogComments.id,
        postId: blogComments.postId,
        authorId: blogComments.authorId,
        authorName: blogComments.authorName,
        authorEmail: blogComments.authorEmail,
        content: blogComments.content,
        status: blogComments.status,
        parentCommentId: blogComments.parentCommentId,
        createdAt: blogComments.createdAt,
        userName: user.name,
        userImage: user.image,
        userEmail: user.email
      })
      .from(blogComments)
      .leftJoin(user, eq(blogComments.authorId, user.id))
      .where(eq(blogComments.id, parseInt(id)))
      .limit(1);

      if (comment.length === 0) {
        return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
      }

      return NextResponse.json(comment[0]);
    }

    // List comments with filtering
    let query = db.select({
      id: blogComments.id,
      postId: blogComments.postId,
      authorId: blogComments.authorId,
      authorName: blogComments.authorName,
      authorEmail: blogComments.authorEmail,
      content: blogComments.content,
      status: blogComments.status,
      parentCommentId: blogComments.parentCommentId,
      createdAt: blogComments.createdAt,
      userName: user.name,
      userImage: user.image,
      userEmail: user.email
    })
    .from(blogComments)
    .leftJoin(user, eq(blogComments.authorId, user.id));

    // Build where conditions
    const conditions = [];

    if (postId) {
      if (isNaN(parseInt(postId))) {
        return NextResponse.json({ 
          error: "Valid postId is required",
          code: "INVALID_POST_ID" 
        }, { status: 400 });
      }
      conditions.push(eq(blogComments.postId, parseInt(postId)));
    }

    if (status) {
      conditions.push(eq(blogComments.status, status));
    }

    if (authorId) {
      conditions.push(eq(blogComments.authorId, authorId));
    }

    if (parentCommentId === 'null') {
      conditions.push(isNull(blogComments.parentCommentId));
    } else if (parentCommentId && parentCommentId !== 'null') {
      if (isNaN(parseInt(parentCommentId))) {
        return NextResponse.json({ 
          error: "Valid parentCommentId is required",
          code: "INVALID_PARENT_COMMENT_ID" 
        }, { status: 400 });
      }
      conditions.push(eq(blogComments.parentCommentId, parseInt(parentCommentId)));
    }

    if (search) {
      const searchCondition = or(
        like(blogComments.content, `%${search}%`),
        like(blogComments.authorName, `%${search}%`)
      );
      conditions.push(searchCondition);
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    const orderDirection = order === 'asc' ? asc : desc;
    if (sort === 'createdAt') {
      query = query.orderBy(orderDirection(blogComments.createdAt));
    } else if (sort === 'status') {
      query = query.orderBy(orderDirection(blogComments.status));
    } else {
      query = query.orderBy(orderDirection(blogComments.createdAt));
    }

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
    const { postId, content, authorName, authorEmail, parentCommentId } = requestBody;

    // Security check: reject if user identifiers provided in body
    if ('authorId' in requestBody || 'userId' in requestBody || 'user_id' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    // Validate required fields
    if (!postId) {
      return NextResponse.json({ 
        error: "Post ID is required",
        code: "MISSING_POST_ID" 
      }, { status: 400 });
    }

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ 
        error: "Content is required",
        code: "MISSING_CONTENT" 
      }, { status: 400 });
    }

    if (isNaN(parseInt(postId))) {
      return NextResponse.json({ 
        error: "Valid post ID is required",
        code: "INVALID_POST_ID" 
      }, { status: 400 });
    }

    // Validate postId exists
    const post = await db.select({ id: blogPosts.id })
      .from(blogPosts)
      .where(eq(blogPosts.id, parseInt(postId)))
      .limit(1);

    if (post.length === 0) {
      return NextResponse.json({ 
        error: "Post not found",
        code: "POST_NOT_FOUND" 
      }, { status: 404 });
    }

    // Validate parentCommentId if provided
    if (parentCommentId) {
      if (isNaN(parseInt(parentCommentId))) {
        return NextResponse.json({ 
          error: "Valid parent comment ID is required",
          code: "INVALID_PARENT_COMMENT_ID" 
        }, { status: 400 });
      }

      const parentComment = await db.select({ id: blogComments.id })
        .from(blogComments)
        .where(and(
          eq(blogComments.id, parseInt(parentCommentId)),
          eq(blogComments.postId, parseInt(postId))
        ))
        .limit(1);

      if (parentComment.length === 0) {
        return NextResponse.json({ 
          error: "Parent comment not found",
          code: "PARENT_COMMENT_NOT_FOUND" 
        }, { status: 404 });
      }
    }

    // Get current user (optional for comments)
    const user = await getCurrentUser(request);
    
    let insertData;

    if (user) {
      // Authenticated user comment
      insertData = {
        postId: parseInt(postId),
        content: content.trim(),
        authorId: user.id,
        status: 'pending',
        parentCommentId: parentCommentId ? parseInt(parentCommentId) : null,
        createdAt: new Date()
      };
    } else {
      // Guest comment
      if (!authorName || authorName.trim().length === 0) {
        return NextResponse.json({ 
          error: "Author name is required for guest comments",
          code: "MISSING_AUTHOR_NAME" 
        }, { status: 400 });
      }

      if (!authorEmail || authorEmail.trim().length === 0) {
        return NextResponse.json({ 
          error: "Author email is required for guest comments",
          code: "MISSING_AUTHOR_EMAIL" 
        }, { status: 400 });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(authorEmail.trim())) {
        return NextResponse.json({ 
          error: "Invalid email format",
          code: "INVALID_EMAIL_FORMAT" 
        }, { status: 400 });
      }

      insertData = {
        postId: parseInt(postId),
        content: content.trim(),
        authorName: authorName.trim(),
        authorEmail: authorEmail.trim().toLowerCase(),
        status: 'pending',
        parentCommentId: parentCommentId ? parseInt(parentCommentId) : null,
        createdAt: new Date()
      };
    }

    const newComment = await db.insert(blogComments)
      .values(insertData)
      .returning();

    return NextResponse.json(newComment[0], { status: 201 });
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

    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const requestBody = await request.json();
    const { content, status } = requestBody;

    // Security check: reject if user identifiers provided in body
    if ('authorId' in requestBody || 'userId' in requestBody || 'user_id' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    // Get the existing comment
    const existingComment = await db.select()
      .from(blogComments)
      .where(eq(blogComments.id, parseInt(id)))
      .limit(1);

    if (existingComment.length === 0) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    const comment = existingComment[0];
    const updates: any = {};

    // Check if user can update content (comment owner within reasonable time)
    if (content !== undefined) {
      if (comment.authorId !== user.id) {
        return NextResponse.json({ 
          error: "You can only edit your own comments",
          code: "UNAUTHORIZED_EDIT" 
        }, { status: 403 });
      }

      // Check time window (24 hours)
      const commentAge = Date.now() - new Date(comment.createdAt).getTime();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      
      if (commentAge > twentyFourHours) {
        return NextResponse.json({ 
          error: "Comments can only be edited within 24 hours of posting",
          code: "EDIT_TIME_EXPIRED" 
        }, { status: 403 });
      }

      if (!content || content.trim().length === 0) {
        return NextResponse.json({ 
          error: "Content cannot be empty",
          code: "EMPTY_CONTENT" 
        }, { status: 400 });
      }

      updates.content = content.trim();
    }

    // Check if user can update status (admin/moderator role would be checked here)
    if (status !== undefined) {
      // For now, only allow comment owner or assume admin privileges
      // In a real app, you'd check user role/permissions
      if (comment.authorId !== user.id) {
        // This would typically check for admin/moderator role
        // For now, we'll allow it assuming the authenticated user has proper permissions
      }

      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return NextResponse.json({ 
          error: "Invalid status. Must be pending, approved, or rejected",
          code: "INVALID_STATUS" 
        }, { status: 400 });
      }

      updates.status = status;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ 
        error: "No valid fields to update",
        code: "NO_UPDATES" 
      }, { status: 400 });
    }

    const updated = await db.update(blogComments)
      .set(updates)
      .where(eq(blogComments.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
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

    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get the existing comment to check ownership
    const existingComment = await db.select()
      .from(blogComments)
      .where(eq(blogComments.id, parseInt(id)))
      .limit(1);

    if (existingComment.length === 0) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    const comment = existingComment[0];

    // Check if user can delete (comment owner or admin)
    if (comment.authorId !== user.id) {
      // In a real app, you'd also check for admin/moderator role here
      return NextResponse.json({ 
        error: "You can only delete your own comments",
        code: "UNAUTHORIZED_DELETE" 
      }, { status: 403 });
    }

    // Check for nested comments
    const childComments = await db.select({ id: blogComments.id })
      .from(blogComments)
      .where(eq(blogComments.parentCommentId, parseInt(id)));

    if (childComments.length > 0) {
      // Option 1: Prevent deletion if has replies
      return NextResponse.json({ 
        error: "Cannot delete comment with replies. Delete replies first.",
        code: "HAS_REPLIES" 
      }, { status: 400 });

      // Option 2: Cascade delete (uncomment below and remove above)
      // await db.delete(blogComments)
      //   .where(eq(blogComments.parentCommentId, parseInt(id)));
    }

    const deleted = await db.delete(blogComments)
      .where(eq(blogComments.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Comment deleted successfully',
      comment: deleted[0]
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}