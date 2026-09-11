const fs = require('fs');
let content = fs.readFileSync('src/app/api/user/subjects/route.ts', 'utf8');

const regex = /const existing = db\.prepare\('SELECT \* FROM subject_progress WHERE user_id = \? AND subject LIKE \?'\)\.get\(userId, \`%\$\{subjectName\}%\`\) as any;[\s\S]*?return NextResponse\.json\(\{ success: true, completedCount: newCompleted \}, \{ status: 200 \}\);/;

const replacement = `const existing = db.prepare('SELECT * FROM subject_progress WHERE user_id = ? AND subject LIKE ?').get(userId, \`%\${subjectName}%\`) as any;

    let newCompleted = 0;
    let oldCompleted = existing ? existing.completed_topics : 0;
    
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

    // Award or deduct XP based on difference
    const difference = newCompleted - oldCompleted;
    if (difference !== 0) {
      const xpChange = difference * 50;
      db.prepare('UPDATE user_stats SET league_points = MAX(0, league_points + ?) WHERE user_id = ?').run(xpChange, userId);
    }

    return NextResponse.json({ success: true, completedCount: newCompleted }, { status: 200 });`;

content = content.replace(regex, replacement);

fs.writeFileSync('src/app/api/user/subjects/route.ts', content);
console.log("Rewrote subjects API to calculate XP diff");
