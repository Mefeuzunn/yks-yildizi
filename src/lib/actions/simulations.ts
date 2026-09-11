'use server';

import { cookies } from 'next/headers';
import db from '@/lib/yks-db-async';

export interface GetSimulationsParams {
  category?: 'Tümü' | 'TYT' | 'AYT';
  subject?: 'Tümü' | 'Fizik' | 'Kimya' | 'Biyoloji' | 'Genel';
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
  limit = 24
}: GetSimulationsParams = {}) {
  try {
    let query = 'SELECT * FROM simulations WHERE is_active = TRUE';
    const params: any[] = [];

    // Filtreleri SQL sorgusuna ekleme
    if (category !== 'Tümü') {
      query += ' AND category = ?';
      params.push(category);
    }
    
    if (subject !== 'Tümü') {
      query += ' AND subject = ?';
      params.push(subject);
    }
    
    if (difficulty !== 0) {
      query += ' AND difficulty_level = ?';
      params.push(difficulty);
    }

    if (search && search.trim() !== '') {
      // PostgreSQL ILIKE ile başlık, açıklama ve etiketlerde büyük/küçük harf duyarsız arama
      query += ' AND (title ILIKE ? OR description ILIKE ? OR array_to_string(related_yks_topics, \',\') ILIKE ?)';
      const searchTerm = `%${search.trim()}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Toplam sayıyı hesapla (Pagination için)
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const countResult = await db.prepare(countQuery).get(...params) as { total: number };
    const total = countResult?.total || 0;

    // Sayfalama ekle
    query += ' ORDER BY created_at ASC LIMIT ? OFFSET ?';
    params.push(limit, (page - 1) * limit);

    const simulations = await db.prepare(query).all(...params);

    return {
      success: true,
      data: simulations,
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

export async function updateSimulationProgress(simulationId: number, timeSpentToAdd: number) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('yks_session')?.value;
    
    if (!userId) {
      return { success: false, error: 'Oturum bulunamadı' };
    }

    const query = `
      INSERT INTO user_simulation_progress (user_id, simulation_id, time_spent_seconds, last_accessed)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, simulation_id) 
      DO UPDATE SET 
        time_spent_seconds = user_simulation_progress.time_spent_seconds + EXCLUDED.time_spent_seconds,
        last_accessed = CURRENT_TIMESTAMP
      RETURNING time_spent_seconds
    `;

    const result = await db.prepare(query).get(userId, simulationId, timeSpentToAdd) as any;

    return { success: true, totalTime: result?.time_spent_seconds };
  } catch (error) {
    console.error('updateSimulationProgress hatası:', error);
    return { success: false, error: 'İlerleme kaydedilemedi.' };
  }
}
