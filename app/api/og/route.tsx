import { ImageResponse } from '@vercel/og'

export const runtime = 'nodejs'

const WIDTH = 1200
const HEIGHT = 630

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const title = (params.get('title') ?? 'Cedarwood Observatory').slice(0, 120)
  const kicker = (params.get('kicker') ?? 'Science Park').slice(0, 60)

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: 72,
          background: 'linear-gradient(135deg, #11152b 0%, #3d4a7a 100%)',
          color: '#f4f6fb',
          fontFamily: 'Georgia, serif',
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 4, textTransform: 'uppercase', color: '#f6a55c' }}>
          {kicker}
        </div>
        <div style={{ fontSize: 68, lineHeight: 1.1, marginTop: 16 }}>{title}</div>
      </div>
    ),
    { width: WIDTH, height: HEIGHT }
  )
}
