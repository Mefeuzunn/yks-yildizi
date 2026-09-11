const fs = require('fs');

let content = fs.readFileSync('src/app/api/user/subjects/route.ts', 'utf8');

const postLogic = `
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    let userId = cookieStore.get('yks_session')?.value;

    if (!userId) {
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        userId = authHeader.substring(7);
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { subjectName, action, totalTopics } = await req.json();

    // The frontend sends short names like "Türkçe". The DB might expect "Türkçe (TYT)".
    // So let's match by a LIKE query if possible, or just insert/update the exact name sent.
    // If we use 'Türkçe (TYT)', we can store it directly. Let's just insert what the frontend sends if it doesn't exist.

    const existing = db.prepare('SELECT * FROM subject_progress WHERE user_id = ? AND subject LIKE ?').get(userId, \`%\${subjectName}%\`) as any;

    let newCompleted = 0;
    if (existing) {
      if (action === 'increment') {
        newCompleted = Math.min(existing.completed_topics + 1, existing.total_topics || totalTopics || 999);
      } else if (action === 'decrement') {
        newCompleted = Math.max(existing.completed_topics - 1, 0);
      } else if (typeof action === 'number') {
        newCompleted = action; // Set directly
      }
      db.prepare('UPDATE subject_progress SET completed_topics = ?, total_topics = ? WHERE id = ?').run(newCompleted, totalTopics || existing.total_topics, existing.id);
    } else {
      if (action === 'increment') newCompleted = 1;
      else if (typeof action === 'number') newCompleted = action;
      db.prepare('INSERT INTO subject_progress (user_id, subject, completed_topics, total_topics) VALUES (?, ?, ?, ?)').run(userId, subjectName, newCompleted, totalTopics || 10);
    }

    // Award XP if incremented
    if (action === 'increment') {
      db.prepare('UPDATE user_stats SET league_points = league_points + 50 WHERE user_id = ?').run(userId);
    }

    return NextResponse.json({ success: true, completedCount: newCompleted }, { status: 200 });

  } catch (error) {
    console.error('Subjects POST Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
`;

if (!content.includes('export async function POST')) {
  fs.writeFileSync('src/app/api/user/subjects/route.ts', content + "\n" + postLogic);
  console.log("Added POST to subjects API");
} else {
  console.log("POST already exists");
}
