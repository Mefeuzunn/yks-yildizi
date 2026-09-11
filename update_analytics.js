const fs = require('fs');
let code = fs.readFileSync('src/app/api/ogretmen/analytics/route.ts', 'utf8');

const insightCode = `
    // ── AI Insights (Faz 3) - Zayıf Konular ──
    const weakTopics = db.prepare(\`
      SELECT sm.subject, COUNT(*) as fail_count
      FROM student_mistakes sm
      JOIN class_students cs ON sm.user_id = cs.student_id
      JOIN teacher_classes tc ON cs.class_id = tc.id
      WHERE tc.teacher_id = ?
      GROUP BY sm.subject
      ORDER BY fail_count DESC
      LIMIT 1
    \`).get(teacherId) as any;

    const topClass = db.prepare(\`
      SELECT tc.class_name, ROUND(AVG(COALESCE(us.success_rate, 0)), 1) as avg_success
      FROM teacher_classes tc
      LEFT JOIN class_students cs ON tc.id = cs.class_id
      LEFT JOIN user_stats us ON cs.student_id = us.user_id
      WHERE tc.teacher_id = ?
      GROUP BY tc.id
      ORDER BY avg_success DESC
      LIMIT 1
    \`).get(teacherId) as any;

    let aiInsightText = "Sınıflarınızın verileri henüz analiz ediliyor.";
    if (weakTopics && topClass) {
      aiInsightText = \`AI Sınıf Asistanı: Öğrencilerinizin en çok zorlandığı ders "\${weakTopics.subject}" (\${weakTopics.fail_count} hata kaydedildi). Gelecek hafta bu derse ağırlık vermeniz önerilir. En başarılı sınıfınız ise %\${topClass.avg_success} ortalama ile \${topClass.class_name}.\`;
    }
`;

code = code.replace("return NextResponse.json({", insightCode + "\n    return NextResponse.json({\n      aiInsight: aiInsightText,");

fs.writeFileSync('src/app/api/ogretmen/analytics/route.ts', code);
