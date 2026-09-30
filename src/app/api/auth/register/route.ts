import { signToken } from "@/lib/jwt";
import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let {
      username,
      password,
      role = 'ogrenci',
      alan = 'Yok',
      sinif = 'Mezun',
      brans,
      kurum,
      classCode,
      email,
      fullName,
      veliCode
    } = body;

    // Email ve fullName desteği ile username otomatik türetme
    if (!username && email) {
      username = email.split('@')[0].trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    } else if (!username && fullName) {
      username = fullName.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
    }

    if (!username || !password) {
      return NextResponse.json({ error: 'Kullanıcı adı/e-posta ve şifre zorunludur.' }, { status: 400 });
    }

    username = username.trim();

    // E-posta kontrolü
    if (email) {
      const existingEmail = await db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)').get(email.trim());
      if (existingEmail) {
        return NextResponse.json({ error: 'Bu e-posta adresiyle zaten kayıtlı bir hesap bulunmaktadır.' }, { status: 400 });
      }
    }

    // Öğretmen ve veliler için DB kısıtlamalarına uyması adına varsayılan alan/sinif
    if (role !== 'ogrenci') {
      alan = 'Yok';
      sinif = 'Mezun';
    }

    // Kullanıcı adının zaten var olup olmadığını kontrol et - çakışma varsa benzersizleştir
    let finalUsername = username;
    const existingUser = await db.prepare('SELECT id FROM users WHERE LOWER(username) = LOWER(?)').get(finalUsername);
    if (existingUser) {
      finalUsername = `${username}_${Math.floor(100 + Math.random() * 900)}`;
    }

    // Şifreyi hash'le
    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(password, salt);
    const id = uuidv4();
    const parentCode = role === 'veli' && veliCode ? veliCode.trim().toUpperCase() : crypto.randomBytes(4).toString('hex').toUpperCase();

    // Veritabanına kaydet
    await db.transaction(async () => {
      await db.prepare(`
        INSERT INTO users (id, username, password_hash, role, alan, sinif, brans, kurum, parent_code, email) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, finalUsername, password_hash, role, alan, sinif, brans || null, kurum || null, parentCode, email || null);

      if (role === 'ogretmen') {
        // Öğretmen için otomatik ilk sınıf oluştur
        const classId = uuidv4();
        const autoClassCode = crypto.randomBytes(3).toString('hex').toUpperCase();
        const className = `${brans || 'Genel'} Sınıfı`;
        await db.prepare('INSERT INTO teacher_classes (id, teacher_id, class_name, class_code) VALUES (?, ?, ?, ?)')
          .run(classId, id, className, autoClassCode);
      }

      if (role === 'ogrenci') {
        // Başlangıç istatistikleri
        await db.prepare(`
          INSERT INTO user_stats (user_id, solved_questions, success_rate, league, league_points, streak_days)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(id, 0, 0, 'Bronz', 0, 0);

        // Sınıf koduna göre sınıfa katıl
        if (classCode && classCode.trim()) {
          const teacherClass = await db.prepare('SELECT id FROM teacher_classes WHERE class_code = ?').get(classCode.trim().toUpperCase()) as any;
          if (teacherClass) {
            await db.prepare('INSERT INTO class_students (class_id, student_id) VALUES (?, ?) ON CONFLICT DO NOTHING')
              .run(teacherClass.id, id);
          }
        }

        // Alan bazlı ders ilerlemesi
        const progressStmt = await db.prepare(
          'INSERT INTO subject_progress (user_id, subject, completed_topics, total_topics) VALUES (?, ?, ?, ?)'
        );

        if (alan === 'Sayisal' || alan === 'Yok') {
          progressStmt.run(id, 'Matematik (TYT-AYT)', 0, 42);
          progressStmt.run(id, 'Fizik (TYT-AYT)', 0, 28);
          progressStmt.run(id, 'Kimya (TYT-AYT)', 0, 24);
          progressStmt.run(id, 'Biyoloji (TYT-AYT)', 0, 30);
        } else if (alan === 'Esit Agirlik') {
          progressStmt.run(id, 'Matematik (TYT-AYT)', 0, 42);
          progressStmt.run(id, 'Edebiyat (AYT)', 0, 25);
          progressStmt.run(id, 'Tarih-1 (AYT)', 0, 15);
          progressStmt.run(id, 'Coğrafya-1 (AYT)', 0, 12);
        } else if (alan === 'Sozel') {
          progressStmt.run(id, 'Edebiyat (AYT)', 0, 25);
          progressStmt.run(id, 'Tarih-2 (AYT)', 0, 20);
          progressStmt.run(id, 'Coğrafya-2 (AYT)', 0, 15);
          progressStmt.run(id, 'Felsefe Grubu (AYT)', 0, 12);
        } else if (alan === 'Dil') {
          progressStmt.run(id, 'Yabancı Dil (YDT)', 0, 30);
          progressStmt.run(id, 'Türkçe (TYT)', 0, 40);
        }
      }
    })();

    // Oturum JWT oluştur ve çerezleri kaydet (anında giriş)
    const token = await signToken({ userId: id, role });
    const cookieStore = await cookies();
    cookieStore.set('yks_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 gün
      path: '/'
    });
    cookieStore.set('yks_role', role, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 gün
      path: '/'
    });

    return NextResponse.json({
      success: true,
      message: 'Kayıt başarılı!',
      token: id,
      user: { id, username: finalUsername, role, email: email || null }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Register API Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası oluştu.' }, { status: 500 });
  }
}
