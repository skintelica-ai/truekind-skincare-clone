import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { authorProfiles, user } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid author ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const authorId = parseInt(id);

    // Query authorProfiles with LEFT JOIN to user table
    const authorData = await db
      .select({
        id: authorProfiles.id,
        userId: authorProfiles.userId,
        name: user.name,
        email: user.email,
        bio: authorProfiles.bio,
        avatar: authorProfiles.avatar,
        socialLinks: authorProfiles.socialLinks,
        createdAt: authorProfiles.createdAt,
        updatedAt: authorProfiles.updatedAt,
      })
      .from(authorProfiles)
      .leftJoin(user, eq(authorProfiles.userId, user.id))
      .where(eq(authorProfiles.id, authorId))
      .limit(1);

    if (authorData.length === 0) {
      return NextResponse.json({ 
        error: 'Author not found',
        code: 'AUTHOR_NOT_FOUND' 
      }, { status: 404 });
    }

    const author = authorData[0];

    // Parse socialLinks JSON if it exists
    let parsedSocialLinks = null;
    if (author.socialLinks) {
      try {
        parsedSocialLinks = typeof author.socialLinks === 'string' 
          ? JSON.parse(author.socialLinks) 
          : author.socialLinks;
      } catch (error) {
        console.error('Error parsing socialLinks JSON:', error);
        parsedSocialLinks = null;
      }
    }

    // Return complete author object
    return NextResponse.json({
      id: author.id,
      userId: author.userId,
      name: author.name,
      email: author.email,
      bio: author.bio,
      avatar: author.avatar,
      socialLinks: parsedSocialLinks,
      createdAt: author.createdAt,
      updatedAt: author.updatedAt,
    });

  } catch (error) {
    console.error('GET author error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error,
      code: 'INTERNAL_SERVER_ERROR' 
    }, { status: 500 });
  }
}