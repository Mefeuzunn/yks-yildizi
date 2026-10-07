import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { MAARIF_CATALOG, getMaarifCatalogNodes } from '@/lib/maarif-catalog';
import { MaarifGrade, MaarifSubject } from '@/types/maarif';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const gradeParam = searchParams.get('grade');
    const subjectParam = searchParams.get('subject') as MaarifSubject | null;

    const grade = gradeParam ? (parseInt(gradeParam, 10) as MaarifGrade) : undefined;

    // 1. Önce PostgreSQL veritabanından çek
    try {
      let query = 'SELECT * FROM maarif_curriculum_nodes WHERE 1=1';
      const params: any[] = [];

      if (grade) {
        query += ' AND grade = ?';
        params.push(grade);
      }
      if (subjectParam) {
        query += ' AND subject = ?';
        params.push(subjectParam);
      }
      query += ' ORDER BY grade ASC, subject ASC, code ASC';

      const rows = await db.prepare(query).all(...params) as any[];

      if (rows && rows.length > 0) {
        // Temaları grupla
        const themesMap: Record<string, any[]> = {};
        rows.forEach(node => {
          if (!themesMap[node.theme_name]) {
            themesMap[node.theme_name] = [];
          }
          themesMap[node.theme_name].push(node);
        });

        return NextResponse.json({
          success: true,
          count: rows.length,
          themes: Object.keys(themesMap).map(themeName => ({
            name: themeName,
            subject: themesMap[themeName][0]?.subject,
            nodes: themesMap[themeName],
          })),
          nodes: rows,
        });
      }
    } catch (dbErr) {
      console.warn('Maarif DB sorgusu fallback moduna geçti:', dbErr);
    }

    // 2. Fallback: Statik Katalog
    const fallbackNodes = getMaarifCatalogNodes(grade, subjectParam || undefined);
    const fallbackThemesMap: Record<string, any[]> = {};
    fallbackNodes.forEach(node => {
      if (!fallbackThemesMap[node.theme_name]) {
        fallbackThemesMap[node.theme_name] = [];
      }
      fallbackThemesMap[node.theme_name].push(node);
    });

    return NextResponse.json({
      success: true,
      count: fallbackNodes.length,
      themes: Object.keys(fallbackThemesMap).map(themeName => ({
        name: themeName,
        subject: fallbackThemesMap[themeName][0]?.subject,
        nodes: fallbackThemesMap[themeName],
      })),
      nodes: fallbackNodes,
    });
  } catch (error: any) {
    console.error('Maarif Curriculum API Error:', error);
    return NextResponse.json({ error: 'Müfredat yüklenirken bir hata oluştu' }, { status: 500 });
  }
}
