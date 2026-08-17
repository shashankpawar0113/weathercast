import type { VercelRequest, VercelResponse } from '@vercel/node';
import { searchSimulatedCities } from '../server/weatherApiCore';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { q } = req.query;

  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Missing query parameter q' });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY?.trim();

  if (apiKey && apiKey !== '') {
    try {
      const geoRes = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(q)}&limit=5&appid=${apiKey}`
      );
      if (geoRes.ok) {
        const data = await geoRes.json();
        if (Array.isArray(data) && data.length > 0) {
          const seen = new Set<string>();
          const uniqueResults: any[] = [];
          for (const item of data) {
            const key = `${item.name.toLowerCase()}-${(item.state || '').toLowerCase()}-${item.country.toLowerCase()}`;
            if (!seen.has(key)) {
              seen.add(key);
              uniqueResults.push(item);
            }
          }
          return res.status(200).json(uniqueResults.slice(0, 5));
        }
      }
    } catch (err) {
      console.error('[Geocode API Error]:', err);
    }
  }

  const fallback = searchSimulatedCities(q);
  return res.status(200).json(fallback);
}
