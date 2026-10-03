'use server';

import { cookies } from 'next/headers';
import db from '@/lib/yks-db-async';
import { MASTER_SIMULATIONS, SimulationItem } from '@/lib/simulations-catalog';
import { PHET_REGISTRY } from '@/lib/phet-registry';

export interface GetSimulationsParams {
  category?: 'Tümü' | 'TYT' | 'AYT';
  subject?: 'Tümü' | 'Fizik' | 'Kimya' | 'Biyoloji' | 'Matematik' | 'Genel';
  difficulty?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export async function getSimulations({
  category = 'Tümü',
  subject = 'Tümü',
  difficulty = 0,
  search = '',
  page = 1,
  limit = 200
}: GetSimulationsParams = {}) {
  try {
    // Primary source: rich Master Simulations catalog
    let allSims: SimulationItem[] = [...MASTER_SIMULATIONS];

    // Merge comprehensive high school PhET Registry
    PHET_REGISTRY.forEach(phet => {
      const alreadyExists = allSims.some(
        s => s.source_url === `/simulasyonlar/${phet.slug}` || s.slug === phet.slug || s.title.toLowerCase() === phet.title_tr.toLowerCase()
      );
      if (!alreadyExists) {
        allSims.push({
          id: `phet_${phet.slug.replace(/-/g, '_')}`,
          slug: phet.slug,
          title: phet.title_tr,
          description: phet.description,
          source_url: `/simulasyonlar/${phet.slug}`,
          category: phet.category === 'TYT/AYT' ? 'Tümü' : phet.category,
          subject: phet.subject,
          topic: phet.topic,
          difficulty_level: phet.difficulty_level,
          related_yks_topics: phet.related_yks_topics,
          badge: phet.badge || (phet.category === 'AYT' ? 'AYT' : 'TYT'),
          is_active: phet.is_active
        });
      }
    });

    // Optional: Also incorporate any extra custom dynamic rows from DB if exists
    try {
      const dbRows = await db.prepare('SELECT * FROM simulations WHERE is_active = TRUE').all() as any[];
      if (dbRows && dbRows.length > 0) {
        dbRows.forEach(row => {
          if (!allSims.some(s => s.title.toLowerCase() === row.title.toLowerCase() || s.source_url === row.source_url)) {
            allSims.push({
              id: `db_${row.id}`,
              title: row.title,
              description: row.description || '',
              source_url: row.source_url,
              category: row.category || 'AYT',
              subject: row.subject || 'Fizik',
              topic: row.topic || '',
              difficulty_level: row.difficulty_level || 3,
              related_yks_topics: row.related_yks_topics || [],
              badge: 'Ek Simülasyon',
              is_active: true
            });
          }
        });
      }
    } catch (_) {
      // Safe fallback to MASTER_SIMULATIONS
    }

    // Filter by Category
    if (category !== 'Tümü') {
      allSims = allSims.filter(s => s.category === category || s.category === 'Tümü');
    }
    
    // Filter by Subject (Fizik, Kimya, Biyoloji, Matematik)
    if (subject !== 'Tümü') {
      allSims = allSims.filter(s => s.subject.toLowerCase() === subject.toLowerCase());
    }
    
    // Filter by Difficulty
    if (difficulty !== 0) {
      allSims = allSims.filter(s => s.difficulty_level === difficulty);
    }

    // Filter by Search text
    if (search && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      allSims = allSims.filter(s => 
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.topic.toLowerCase().includes(q) ||
        (s.related_yks_topics && s.related_yks_topics.some(t => t.toLowerCase().includes(q)))
      );
    }

    const total = allSims.length;
    const startIndex = (page - 1) * limit;
    const paginated = allSims.slice(startIndex, startIndex + limit);

    return {
      success: true,
      data: paginated,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('getSimulations hatası:', error);
    return { success: false, error: 'Simülasyonlar çekilirken bir hata oluştu.' };
  }
}

export async function updateSimulationProgress(simulationId: string | number, timeSpentToAdd: number) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('yks_session')?.value;
    
    if (!userId) {
      return { success: false, error: 'Oturum bulunamadı' };
    }

    const numId = typeof simulationId === 'number' ? simulationId : parseInt(String(simulationId).replace(/\D/g, '')) || 1;

    const query = `
      INSERT INTO user_simulation_progress (user_id, simulation_id, time_spent_seconds, last_accessed)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, simulation_id) 
      DO UPDATE SET 
        time_spent_seconds = user_simulation_progress.time_spent_seconds + EXCLUDED.time_spent_seconds,
        last_accessed = CURRENT_TIMESTAMP
      RETURNING time_spent_seconds
    `;

    const result = await db.prepare(query).get(userId, numId, timeSpentToAdd) as any;

    return { success: true, totalTime: result?.time_spent_seconds };
  } catch (error) {
    console.error('updateSimulationProgress hatası:', error);
    return { success: false, error: 'İlerleme kaydedilemedi.' };
  }
}
