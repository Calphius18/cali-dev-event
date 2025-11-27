import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Event from '@/database/event.model';

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * GET handler to fetch event details by slug
 */
export async function GET(
  req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    // Await params Promise (required in Next.js 15+)
    const { slug } = await params;

    if (!slug || typeof slug !== 'string' || slug.trim() === '') {
      return NextResponse.json(
        { message: 'Invalid or missing slug parameter' },
        { status: 400 }
      );
    }

    // Sanitize slug: remove special characters, allow only alphanumeric and hyphens
    const sanitizedSlug = slug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, ''); // Remove anything that's not alphanumeric or hyphen

    // Validate sanitized slug format
    if (sanitizedSlug === '' || sanitizedSlug.length > 200) {
      return NextResponse.json(
        { message: 'Invalid slug format' },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Query event by sanitized slug
    const event = await Event.findOne({ slug: sanitizedSlug });

    if (!event) {
      return NextResponse.json(
        { message: 'Event not found' },
        { status: 404 }
      ); 
    }

    // Return event data
    return NextResponse.json(
      { message: 'Event retrieved successfully', event },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching event by slug:', error);

    return NextResponse.json(
      {
        message: 'Failed to fetch event',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
