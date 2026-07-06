import { NextRequest, NextResponse } from 'next/server';
import { tmdbClient } from '@/services/tmdbClient';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  const results = await tmdbClient.searchAutocomplete(query);
  return NextResponse.json(results);
}
