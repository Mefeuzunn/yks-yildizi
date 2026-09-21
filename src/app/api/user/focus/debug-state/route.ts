import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('yks_session')?.value;
    
    let userId = token;
    let decodedPayload = null;
    try {
      if (token) {
        decodedPayload = await verifyToken(token);
        if (decodedPayload && decodedPayload.userId) {
          userId = decodedPayload.userId;
        }
      }
    } catch(e: any) {}

    const rawSessions = await db.prepare(`SELECT * FROM focus_sessions LIMIT 20`).all();
    const countTotal = await db.prepare(`SELECT COUNT(*) as c FROM focus_sessions`).get() as any;

    return NextResponse.json({
      success: true,
      cookieToken: token ? token.substring(0, 10) + '...' : null,
      decodedUserId: userId,
      totalRowsInTable: countTotal?.c,
      allSessions: rawSessions,
    });
  } catch(e: any) {
    return NextResponse.json({ error: e.message });
  }
}
