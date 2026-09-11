import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete('yks_session');
  cookieStore.delete('yks_role');
  return NextResponse.json({ success: true });
}
