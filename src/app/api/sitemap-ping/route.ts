import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://truekind.com';
    const sitemapUrl = `${SITE_URL}/sitemap.xml`;
    
    // Ping Google
    const googlePingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
    await fetch(googlePingUrl);
    
    // Ping Bing
    const bingPingUrl = `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
    await fetch(bingPingUrl);
    
    return NextResponse.json({ 
      success: true,
      message: 'Sitemap pinged to search engines successfully',
      sitemapUrl 
    });
  } catch (error) {
    console.error('Sitemap ping error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to ping sitemap' 
    }, { status: 500 });
  }
}