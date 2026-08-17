import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const geoRes = await fetch('https://ipapi.co/json/');
    if (geoRes.ok) {
      const data = await geoRes.json();
      return res.status(200).json({
        city: data.city || 'Delhi',
        region: data.region || '',
        country: data.country_code || 'IN',
        lat: data.latitude || 28.6139,
        lon: data.longitude || 77.209,
      });
    }
  } catch (err) {
    console.error('IP Geolocation error:', err);
  }

  // Fallback default
  return res.status(200).json({
    city: 'Delhi',
    region: 'Delhi',
    country: 'IN',
    lat: 28.6139,
    lon: 77.209,
  });
}
