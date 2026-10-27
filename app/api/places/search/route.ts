import { NextRequest, NextResponse } from 'next/server';
import { PlacesDiscoveryService } from '@/services/placesDiscoveryService';
import { PlaceCategory } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query = searchParams.get('query') || undefined;
    const latParam = searchParams.get('lat');
    const lngParam = searchParams.get('lng');
    const radiusParam = searchParams.get('radiusKm') || searchParams.get('radius');
    const categoryParam = searchParams.get('category') as PlaceCategory | 'all' | null;
    const destinationId = searchParams.get('destinationId') || undefined;
    const verifiedOnlyParam = searchParams.get('verifiedOnly');
    const minRatingParam = searchParams.get('minRating');
    const limitParam = searchParams.get('limit');

    const lat = latParam ? parseFloat(latParam) : undefined;
    const lng = lngParam ? parseFloat(lngParam) : undefined;
    const radiusKm = radiusParam ? parseFloat(radiusParam) : 35;
    const category = (categoryParam || 'all') as PlaceCategory | 'all';
    const verifiedOnly = verifiedOnlyParam === 'true';
    const minRating = minRatingParam ? parseFloat(minRatingParam) : 0;
    const limit = limitParam ? parseInt(limitParam, 10) : 30;

    // Validate coordinates if provided
    if (latParam !== null && isNaN(lat!)) {
      return NextResponse.json(
        { error: 'Invalid latitude value provided' },
        { status: 400 }
      );
    }
    if (lngParam !== null && isNaN(lng!)) {
      return NextResponse.json(
        { error: 'Invalid longitude value provided' },
        { status: 400 }
      );
    }

    const result = await PlacesDiscoveryService.discoverPlaces({
      query,
      lat,
      lng,
      radiusKm,
      category,
      destinationId,
      verifiedOnly,
      minRating,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: result.places,
      total: result.total,
      destination: result.destination,
      appliedFilters: result.appliedFilters,
      provider: result.provider,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('API /api/places/search error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to discover places',
        data: [],
      },
      { status: 500 }
    );
  }
}
