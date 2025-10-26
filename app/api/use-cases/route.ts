import { NextRequest, NextResponse } from 'next/server';
import { useCaseScenarios } from '@/lib/demo-data';

/**
 * GET /api/use-cases
 * Get all use case scenarios for demo
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const scenario = searchParams.get('scenario');

    if (scenario) {
      // Return specific scenario
      const scenarioData = useCaseScenarios[scenario as keyof typeof useCaseScenarios];
      
      if (!scenarioData) {
        return NextResponse.json(
          { error: 'Scenario not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          scenario,
          ...scenarioData,
        },
      });
    }

    // Return all scenarios
    return NextResponse.json({
      success: true,
      data: {
        scenarios: useCaseScenarios,
        availableScenarios: Object.keys(useCaseScenarios),
      },
    });
  } catch (error) {
    console.error('Error fetching use cases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch use case data' },
      { status: 500 }
    );
  }
}

