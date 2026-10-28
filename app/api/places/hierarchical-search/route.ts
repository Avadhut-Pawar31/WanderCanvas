import { NextRequest, NextResponse } from 'next/server';
import { HierarchicalGeoService } from '@/services/hierarchicalGeoService';
import { GeoEntityType, GeoPlaceCategory } from '@/types/hierarchicalGeo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query = searchParams.get('query');
    const entityId = searchParams.get('entityId');
    const browse = searchParams.get('browse');
    const entityType = searchParams.get('entityType') as GeoEntityType | null;
    const category = searchParams.get('category') as GeoPlaceCategory | null;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 20;

    // 1. Browsing mode: return children, breadcrumbs, and stats
    if (browse !== null) {
      const targetId = entityId || (browse !== 'true' && browse !== '' ? browse : undefined);
      const browseState = HierarchicalGeoService.getBrowseState(targetId);
      return NextResponse.json({
        success: true,
        mode: 'browse',
        data: browseState
      });
    }

    // 2. Specific Entity detail request
    if (entityId) {
      const entity = HierarchicalGeoService.getEntityById(entityId);
      if (!entity) {
        return NextResponse.json(
          { success: false, error: `Entity with ID '${entityId}' not found` },
          { status: 404 }
        );
      }
      const breadcrumbs = HierarchicalGeoService.getBreadcrumbs(entityId);
      const children = HierarchicalGeoService.getChildren(entityId);

      return NextResponse.json({
        success: true,
        mode: 'detail',
        data: {
          entity,
          breadcrumbs,
          children
        }
      });
    }

    // 3. Search / Autocomplete query
    if (query !== null) {
      const results = HierarchicalGeoService.search(query, {
        entityType: entityType || undefined,
        category: category || undefined,
        limit
      });

      return NextResponse.json({
        success: true,
        mode: 'search',
        query,
        count: results.length,
        results
      });
    }

    // Default: Return root continents
    const rootBrowse = HierarchicalGeoService.getBrowseState(undefined);
    return NextResponse.json({
      success: true,
      mode: 'browse',
      data: rootBrowse
    });
  } catch (err: any) {
    console.error('Hierarchical search API error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
