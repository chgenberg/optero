import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Optero - Gör vardagen lättare med AI';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'white',
          position: 'relative',
        }}
      >
        {/* Background gradient */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, #f5f5f5 0%, #ffffff 50%, #f5f5f5 100%)',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Logo/Circle */}
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              border: '12px solid black',
              marginBottom: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'white',
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                backgroundColor: 'black',
              }}
            />
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 900,
              color: 'black',
              marginBottom: 20,
              letterSpacing: '-0.02em',
            }}
          >
            OPTERO
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: 36,
              color: '#666',
              fontWeight: 300,
              textAlign: 'center',
              maxWidth: 800,
            }}
          >
            Gör vardagen lättare med AI
          </div>

          {/* Stats */}
          <div
            style={{
              display: 'flex',
              gap: 60,
              marginTop: 60,
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <div style={{ fontSize: 48, fontWeight: 900, color: 'black' }}>130+</div>
              <div style={{ fontSize: 20, color: '#666' }}>Prompts</div>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <div style={{ fontSize: 48, fontWeight: 900, color: 'black' }}>5-15h</div>
              <div style={{ fontSize: 20, color: '#666' }}>Sparad tid/vecka</div>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <div style={{ fontSize: 48, fontWeight: 900, color: 'black' }}>9+</div>
              <div style={{ fontSize: 20, color: '#666' }}>Yrken</div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
