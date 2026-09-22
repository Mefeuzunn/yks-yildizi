import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedUserId } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const progress = await db.prepare('SELECT * FROM subject_progress WHERE user_id = ?').all(userId) as any[];

    // Group by category (TYT / AYT) - assuming subject names indicate this or we can deduce
    const subjects = progress.map(p => {
      // Mock category deduction
      let category = 'TYT';
      if (p.subject.includes('AYT') || p.subject.includes('Edebiyat') || p.subject.includes('Tarih 2')) {
        category = 'AYT';
      }
      return {
        id: p.id,
        name: p.subject.replace('TYT ', '').replace('AYT ', ''), // cleanup name
        category,
        completed: p.completed_topics,
        completedList: JSON.parse(p.completed_list || '[]'),
        total: p.total_topics,
        percentage: p.total_topics > 0 ? Math.round((p.completed_topics / p.total_topics) * 100) : 0
      };
    });

    return NextResponse.json({ success: true, subjects }, { status: 200 });

  } catch (error) {
    console.error('Subjects GET Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}


export async function POST(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { subjectName, action, topicName, totalTopics } = await req.json();

    const existing = await db.prepare('SELECT * FROM subject_progress WHERE user_id = ? AND subject LIKE ?').get(userId, `%${subjectName}%`) as any;

    let completedList = [];
    if (existing && existing.completed_list) {
      try {
        completedList = JSON.parse(existing.completed_list);
      } catch(e) {}
    }

    let xpChange = 0;

    if (action === 'toggle' && topicName) {
      if (completedList.includes(topicName)) {
        completedList = completedList.filter((t: string) => t !== topicName);
        xpChange = -50;
      } else {
        completedList.push(topicName);
        xpChange = 50;
      }
    }

    const newCompletedCount = completedList.length;

    if (existing) {
      await db.prepare('UPDATE subject_progress SET completed_topics = ?, completed_list = ?, total_topics = ? WHERE id = ?')
        .run(newCompletedCount, JSON.stringify(completedList), totalTopics || existing.total_topics, existing.id);
    } else {
      await db.prepare('INSERT INTO subject_progress (user_id, subject, completed_topics, completed_list, total_topics) VALUES (?, ?, ?, ?, ?)')
        .run(userId, subjectName, newCompletedCount, JSON.stringify(completedList), totalTopics || 10);
    }

    if (xpChange !== 0) {
      await db.prepare('UPDATE user_stats SET league_points = MAX(0, league_points + ?) WHERE user_id = ?').run(xpChange, userId);
    }

    return NextResponse.json({ success: true, completedCount: newCompletedCount, completedList }, { status: 200 });

  } catch (error) {
    console.error('Subjects POST Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}