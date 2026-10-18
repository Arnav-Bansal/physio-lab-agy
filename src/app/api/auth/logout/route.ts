import { NextResponse } from 'next/server';
import { clearAllSessions } from '@/lib/auth/session';

export async function POST(request: Request) {
  await clearAllSessions();
  const url = new URL('/', request.url);
  return NextResponse.json({ success: true, redirectTo: url.pathname });
}

export async function GET(request: Request) {
  await clearAllSessions();
  const { searchParams } = new URL(request.url);
  const next = searchParams.get('next') || '/';
  return NextResponse.redirect(new URL(next, request.url));
}
