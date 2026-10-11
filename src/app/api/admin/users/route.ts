import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedUserId } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

// GET: List users with search, role filter, pagination
export async function GET(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const currentUser = await db.prepare('SELECT id, role FROM users WHERE id = ?').get(userId) as any;
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Bu alana sadece yöneticiler erişebilir.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const roleFilter = searchParams.get('role') || 'all';
    const limit = Math.min(Number(searchParams.get('limit')) || 25, 100);
    const offset = Number(searchParams.get('offset')) || 0;

    let query = `
      SELECT id, username, email, role, alan, sinif, brans, created_at
      FROM users
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search.trim()) {
      query += ` AND (username ILIKE ? OR email ILIKE ?)`;
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    if (roleFilter !== 'all') {
      query += ` AND role = ?`;
      params.push(roleFilter);
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const users = await db.prepare(query).all(...params) as any[];

    // Count total for pagination
    let countQuery = `SELECT COUNT(*) as count FROM users WHERE 1=1`;
    const countParams: any[] = [];
    if (search.trim()) {
      countQuery += ` AND (username ILIKE ? OR email ILIKE ?)`;
      countParams.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }
    if (roleFilter !== 'all') {
      countQuery += ` AND role = ?`;
      countParams.push(roleFilter);
    }

    const countRow = await db.prepare(countQuery).get(...countParams) as any;

    return NextResponse.json({
      success: true,
      users,
      total: Number(countRow?.count) || users.length
    });
  } catch (error: any) {
    console.error('Admin Users GET Error:', error);
    return NextResponse.json({ error: error.message || 'Sunucu hatası' }, { status: 500 });
  }
}

// PATCH: Update user role or fields
export async function PATCH(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const currentUser = await db.prepare('SELECT id, role FROM users WHERE id = ?').get(userId) as any;
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Bu alana sadece yöneticiler erişebilir.' }, { status: 403 });
    }

    const body = await req.json();
    const { targetUserId, newRole, brans } = body;

    if (!targetUserId || !newRole) {
      return NextResponse.json({ error: 'targetUserId ve newRole gereklidir' }, { status: 400 });
    }

    const allowedRoles = ['student', 'ogretmen', 'admin'];
    if (!allowedRoles.includes(newRole)) {
      return NextResponse.json({ error: 'Geçersiz rol türü' }, { status: 400 });
    }

    await db.prepare(`
      UPDATE users 
      SET role = ?, brans = COALESCE(?, brans)
      WHERE id = ?
    `).run(newRole, brans || null, targetUserId);

    return NextResponse.json({
      success: true,
      message: `Kullanıcı rolü başarıyla '${newRole}' olarak güncellendi.`
    });
  } catch (error: any) {
    console.error('Admin Users PATCH Error:', error);
    return NextResponse.json({ error: error.message || 'Sunucu hatası' }, { status: 500 });
  }
}
