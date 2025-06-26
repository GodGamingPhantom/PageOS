// This API route is obsolete and has been replaced by the general-purpose proxy
// in /api/proxy. It returns a 410 Gone status to indicate it is deprecated.

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ error: 'This endpoint is deprecated.' }, { status: 410 });
}
