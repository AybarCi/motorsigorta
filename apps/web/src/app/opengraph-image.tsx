import { ImageResponse } from 'next/og';
 
export const runtime = 'edge';
 
// Image metadata
export const alt = 'Sigomax - Hızlı Sigorta Teklifi';
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
          background: 'linear-gradient(to bottom right, #020617, #0f172a)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '40px 80px',
            borderRadius: '40px',
            border: '2px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '60px',
          }}
        >
          <span style={{ fontSize: 80, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.05em' }}>
            Sigomax<span style={{ color: '#34d399' }}>.</span>
          </span>
        </div>
        <h1
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: 'white',
            textAlign: 'center',
            lineHeight: 1.2,
            marginBottom: '30px',
            letterSpacing: '-0.02em',
          }}
        >
          Türkiye'nin En Hızlı Sigorta Teklif Ağı
        </h1>
        <p
          style={{
            fontSize: 32,
            color: '#94a3b8',
            textAlign: 'center',
            maxWidth: '800px',
          }}
        >
          Trafik, Kasko, DASK ve Sağlık sigortası tekliflerini saniyeler içinde karşılaştırın.
        </p>
      </div>
    ),
    {
      ...size,
    }
  );
}
