import { NextResponse } from 'next/server';
import { getCurrentUser, type TokenPayload } from '@/lib/auth/jwt';

export async function requireAuth(): Promise<TokenPayload | NextResponse> {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return user;
}

export function isAuthError(result: TokenPayload | NextResponse): result is NextResponse {
  return result instanceof NextResponse;
}
