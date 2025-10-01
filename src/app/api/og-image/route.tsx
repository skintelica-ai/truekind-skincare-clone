import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const title = searchParams.get('title') || 'TrueKind Skincare';
    const subtitle = searchParams.get('subtitle') || 'Clean, Conscious, Performance Skincare';
    const type = searchParams.get('type') || 'article';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #FFDCCD 0%, #FFB89A 50%, #FF9467 100%)',
            padding: '80px',
            fontFamily: 'system-ui',
          }}
        >
          {/* Logo/Brand */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
            }}
          >
            <div
              style={{
                fontSize: 48,
                fontWeight: 700,
                color: '#2d2d2d',
                letterSpacing: '-0.02em',
              }}
            >
              TrueKind
            </div>
            <div
              style={{
                fontSize: 24,
                color: '#666666',
                fontWeight: 400,
              }}
            >
              Skincare
            </div>
          </div>

          {/* Main Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              maxWidth: '900px',
            }}
          >
            <div
              style={{
                fontSize: 72,
                fontWeight: 300,
                color: '#2d2d2d',
                lineHeight: 1.1,
                letterSpacing: '-0.03em',
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontSize: 32,
                color: '#666666',
                fontWeight: 400,
                lineHeight: 1.4,
              }}
            >
              {subtitle}
            </div>
          </div>

          {/* Footer Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
            }}
          >
            <div
              style={{
                padding: '12px 24px',
                background: '#FF7034',
                borderRadius: '50px',
                color: 'white',
                fontSize: 20,
                fontWeight: 600,
              }}
            >
              {type === 'article' ? 'JOURNAL' : 'PRODUCT'}
            </div>
            <div
              style={{
                fontSize: 20,
                color: '#666666',
              }}
            >
              Clean • Conscious • Performance
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('OG Image generation error:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}