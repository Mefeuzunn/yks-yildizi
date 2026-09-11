const fs = require('fs');
let content = fs.readFileSync('src/app/api/user/subjects/route.ts', 'utf8');

// Update GET
content = content.replace(
  /completed: p\.completed_topics,\n\s+total: p\.total_topics,/,
  `completed: p.completed_topics,
        completedList: JSON.parse(p.completed_list || '[]'),
        total: p.total_topics,`
);

// Update POST
const newPost = `export async function POST(req: Request) {
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

    const { subjectName, action, topicName, totalTopics } = await req.json();

    const existing = db.prepare('SELECT * FROM subject_progress WHERE user_id = ? AND subject LIKE ?').get(userId, \`%\${subjectName}%\`) as any;

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
      db.prepare('UPDATE subject_progress SET completed_topics = ?, completed_list = ?, total_topics = ? WHERE id = ?')
        .run(newCompletedCount, JSON.stringify(completedList), totalTopics || existing.total_topics, existing.id);
    } else {
      db.prepare('INSERT INTO subject_progress (user_id, subject, completed_topics, completed_list, total_topics) VALUES (?, ?, ?, ?, ?)')
        .run(userId, subjectName, newCompletedCount, JSON.stringify(completedList), totalTopics || 10);
    }

    if (xpChange !== 0) {
      db.prepare('UPDATE user_stats SET league_points = MAX(0, league_points + ?) WHERE user_id = ?').run(xpChange, userId);
    }

    return NextResponse.json({ success: true, completedCount: newCompletedCount, completedList }, { status: 200 });

  } catch (error) {
    console.error('Subjects POST Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}`;

content = content.replace(/export async function POST\(req: Request\) \{[\s\S]*?\}\n\}\s*$/, newPost);

fs.writeFileSync('src/app/api/user/subjects/route.ts', content);
console.log("Rewrote POST and GET subjects API");
