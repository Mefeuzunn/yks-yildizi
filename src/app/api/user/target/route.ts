import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/yks-db-async';

// Simulating YÖK Atlas Net targets for key programs
export const DEPARTMENT_NETS: Record<string, Record<string, number>> = {
  "Boğaziçi Üniv. - Bilgisayar Müh. (Sayısal)": {
    tyt_turkce: 35.5, tyt_sosyal: 15.0, tyt_mat: 38.0, tyt_fen: 18.5,
    ayt_mat: 39.0, ayt_fizik: 13.0, ayt_kimya: 13.0, ayt_biyoloji: 12.0
  },
  "Hacettepe Üniv. - Tıp Fakültesi (Sayısal)": {
    tyt_turkce: 34.0, tyt_sosyal: 14.5, tyt_mat: 37.0, tyt_fen: 17.5,
    ayt_mat: 38.0, ayt_fizik: 12.0, ayt_kimya: 12.0, ayt_biyoloji: 11.5
  },
  "ODTÜ - İktisat (Eşit Ağırlık)": {
    tyt_turkce: 32.0, tyt_sosyal: 16.0, tyt_mat: 34.0, tyt_fen: 8.0,
    ayt_mat: 32.0, ayt_edebiyat: 20.0, ayt_tarih1: 8.0, ayt_cografya1: 5.0
  },
  "Galatasaray Üniv. - Hukuk Fakültesi (Eşit Ağırlık)": {
    tyt_turkce: 36.0, tyt_sosyal: 18.0, tyt_mat: 32.5, tyt_fen: 6.0,
    ayt_mat: 30.0, ayt_edebiyat: 22.0, ayt_tarih1: 9.0, ayt_cografya1: 5.0
  },
  "İstanbul Üniv. - Coğrafya (Sözel)": {
    tyt_turkce: 30.0, tyt_sosyal: 15.0, tyt_mat: 12.0, tyt_fen: 3.0,
    ayt_edebiyat: 18.0, ayt_tarih2: 12.0, ayt_cografya2: 12.0, ayt_felsefe: 9.0
  },
  "Boğaziçi Üniv. - İngilizce Öğrt. (Dil)": {
    tyt_turkce: 35.0, tyt_sosyal: 16.0, tyt_mat: 20.0, tyt_fen: 5.0,
    ydt_dil: 76.0
  }
};

export async function GET(req: Request) {
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

    const user = await db.prepare('SELECT target_university, target_department, alan FROM users WHERE id = ?').get(userId) as any;
    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    // Get student's average nets from mock exams
    const exams = await db.prepare('SELECT * FROM mock_exams WHERE user_id = ?').all(userId) as any[];
    
    // Calculate averages (simplifying: mock_exams holds tyt/ayt results or just total nets.
    // If we have detailed subject nets, we display them, otherwise we simulate student subject nets based on their average total_net!)
    const totalNets = exams.map(e => e.total_net);
    const avgTotalNet = totalNets.length > 0 ? totalNets.reduce((acc, n) => acc + n, 0) / totalNets.length : 0;

    // Simulate individual nets for the student based on their alan and average total net
    const simulatedStudentNets: Record<string, number> = {};
    const weight = avgTotalNet / 100; // factor

    if (user.alan === 'Sayisal' || user.alan === 'Yok') {
      simulatedStudentNets.tyt_turkce = Math.min(40, Number((26 * weight).toFixed(1)));
      simulatedStudentNets.tyt_sosyal = Math.min(20, Number((11 * weight).toFixed(1)));
      simulatedStudentNets.tyt_mat = Math.min(40, Number((28 * weight).toFixed(1)));
      simulatedStudentNets.tyt_fen = Math.min(20, Number((12 * weight).toFixed(1)));
      simulatedStudentNets.ayt_mat = Math.min(40, Number((26 * weight).toFixed(1)));
      simulatedStudentNets.ayt_fizik = Math.min(14, Number((8 * weight).toFixed(1)));
      simulatedStudentNets.ayt_kimya = Math.min(13, Number((8 * weight).toFixed(1)));
      simulatedStudentNets.ayt_biyoloji = Math.min(13, Number((7 * weight).toFixed(1)));
    } else if (user.alan === 'Esit Agirlik') {
      simulatedStudentNets.tyt_turkce = Math.min(40, Number((28 * weight).toFixed(1)));
      simulatedStudentNets.tyt_sosyal = Math.min(20, Number((13 * weight).toFixed(1)));
      simulatedStudentNets.tyt_mat = Math.min(40, Number((24 * weight).toFixed(1)));
      simulatedStudentNets.tyt_fen = Math.min(20, Number((4 * weight).toFixed(1)));
      simulatedStudentNets.ayt_mat = Math.min(40, Number((22 * weight).toFixed(1)));
      simulatedStudentNets.ayt_edebiyat = Math.min(24, Number((16 * weight).toFixed(1)));
      simulatedStudentNets.ayt_tarih1 = Math.min(10, Number((6 * weight).toFixed(1)));
      simulatedStudentNets.ayt_cografya1 = Math.min(6, Number((4 * weight).toFixed(1)));
    } else {
      simulatedStudentNets.tyt_turkce = Math.min(40, Number((28 * weight).toFixed(1)));
      simulatedStudentNets.tyt_sosyal = Math.min(20, Number((14 * weight).toFixed(1)));
      simulatedStudentNets.tyt_mat = Math.min(40, Number((8 * weight).toFixed(1)));
      simulatedStudentNets.tyt_fen = Math.min(20, Number((2 * weight).toFixed(1)));
      simulatedStudentNets.ayt_edebiyat = Math.min(24, Number((18 * weight).toFixed(1)));
      simulatedStudentNets.ayt_tarih2 = Math.min(12, Number((8 * weight).toFixed(1)));
      simulatedStudentNets.ayt_cografya2 = Math.min(12, Number((8 * weight).toFixed(1)));
      simulatedStudentNets.ayt_felsefe = Math.min(12, Number((8 * weight).toFixed(1)));
    }

    const targetKey = `${user.target_university} - ${user.target_department}`;
    const targetNets = DEPARTMENT_NETS[targetKey] || DEPARTMENT_NETS["Boğaziçi Üniv. - Bilgisayar Müh. (Sayısal)"];

    return NextResponse.json({
      success: true,
      targetUniversity: user.target_university || '',
      targetDepartment: user.target_department || '',
      availableTargets: Object.keys(DEPARTMENT_NETS),
      studentNets: simulatedStudentNets,
      targetNets,
      avgTotalNet: Number(avgTotalNet.toFixed(1))
    });

  } catch (error) {
    console.error('Target GET Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

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

    const body = await req.json();
    const { targetUniversity, targetDepartment } = body;

    await db.prepare('UPDATE users SET target_university = ?, target_department = ? WHERE id = ?')
      .run(targetUniversity || null, targetDepartment || null, userId);

    return NextResponse.json({ success: true, message: 'Hedefiniz başarıyla güncellendi!' });
  } catch (error) {
    console.error('Target POST Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
