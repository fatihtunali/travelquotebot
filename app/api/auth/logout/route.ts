import { NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, CLEAR_AUTH_COOKIE_OPTIONS } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: '',
    ...CLEAR_AUTH_COOKIE_OPTIONS,
  });
  return response;
}
