import { NextRequest, NextResponse } from 'next/server';

interface GeolocationResponse {
  country: string;
  currency: 'INR' | 'USD';
  source: 'vercel' | 'ip-api' | 'fallback';
  timezone?: string;
}

export async function GET(req: NextRequest) {
  try {
    // Method 1: Try Vercel geo first (most reliable when available)
    const { geo } = req;
    if (geo?.country) {
      return NextResponse.json({
        country: geo.country,
        currency: geo.country === 'IN' ? 'INR' : 'USD',
        source: 'vercel'
      } as GeolocationResponse);
    }

    // Method 2: Fallback to IP geolocation API
    try {
      const response = await fetch('http://ip-api.com/json/', {
        headers: {
          'User-Agent': 'TrulyBot/1.0'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success' && data.countryCode) {
          return NextResponse.json({
            country: data.countryCode,
            currency: data.countryCode === 'IN' ? 'INR' : 'USD',
            source: 'ip-api',
            timezone: data.timezone
          } as GeolocationResponse);
        }
      }
    } catch (ipError) {
      console.warn('IP geolocation failed:', ipError);
    }

    // Method 3: Final fallback - default to US
    return NextResponse.json({
      country: 'US',
      currency: 'USD',
      source: 'fallback'
    } as GeolocationResponse);

  } catch (error) {
    console.error('Geolocation API error:', error);
    return NextResponse.json({
      country: 'US',
      currency: 'USD',
      source: 'fallback'
    } as GeolocationResponse, { status: 500 });
  }
}
