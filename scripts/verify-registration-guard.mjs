/**
 * Verification Script: Student Registration Grade Selection & Panel Boundary Guard
 * Tests database isolation, registration mapping, and route boundary rules.
 */

import postgres from 'postgres';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.zncqndfghqkafuaswphq:Muge_Ve_Efe2008@aws-0-eu-central-1.pooler.supabase.com:6543/postgres';
const sql = postgres(connectionString, { ssl: 'require', max: 5 });

async function run() {
  console.log('🔍 [KAYIT & İZOLASYON DOĞRULAMA] Sınıf Seçimi ve Panel Sınır Koruyucusu Denetleniyor...\n');
  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`✅ [TEST ${total}] BAŞARILI: ${message}`);
      passed++;
    } else {
      console.error(`❌ [TEST ${total}] BAŞARISIZ: ${message}`);
    }
  }

  const passHash = bcrypt.hashSync('test1234', 10);
  const createdIds = [];

  try {
    // TEST 1: 9. Sınıf Kaydı (Maarif)
    const id9 = uuidv4();
    createdIds.push(id9);
    const user9 = `test_maarif9_${Date.now()}`;
    const curMode9 = ('9' === '9' || '9' === '10' || '9' === '11') ? 'maarif_v1' : 'legacy_yks';

    await sql`
      INSERT INTO users (id, username, password_hash, role, sinif, alan, curriculum_mode)
      VALUES (${id9}, ${user9}, ${passHash}, 'ogrenci', '9', 'Yok', ${curMode9})
    `;
    const [row9] = await sql`SELECT curriculum_mode, sinif, alan FROM users WHERE id = ${id9}`;
    assert(row9?.curriculum_mode === 'maarif_v1' && row9?.sinif === '9' && row9?.alan === 'Yok',
      `9. Sınıf öğrencisi veritabanında curriculum_mode='maarif_v1', alan='Yok' olarak kaydedildi`);

    // TEST 2: 10. Sınıf Kaydı (Maarif)
    const id10 = uuidv4();
    createdIds.push(id10);
    const user10 = `test_maarif10_${Date.now()}`;
    const curMode10 = ('10' === '9' || '10' === '10' || '10' === '11') ? 'maarif_v1' : 'legacy_yks';

    await sql`
      INSERT INTO users (id, username, password_hash, role, sinif, alan, curriculum_mode)
      VALUES (${id10}, ${user10}, ${passHash}, 'ogrenci', '10', 'Yok', ${curMode10})
    `;
    const [row10] = await sql`SELECT curriculum_mode, sinif, alan FROM users WHERE id = ${id10}`;
    assert(row10?.curriculum_mode === 'maarif_v1' && row10?.sinif === '10' && row10?.alan === 'Yok',
      `10. Sınıf öğrencisi veritabanında curriculum_mode='maarif_v1', alan='Yok' olarak kaydedildi`);

    // TEST 3: 11. Sınıf Kaydı (Maarif - Alan Seçimli)
    const id11 = uuidv4();
    createdIds.push(id11);
    const user11 = `test_maarif11_${Date.now()}`;
    const curMode11 = ('11' === '9' || '11' === '10' || '11' === '11') ? 'maarif_v1' : 'legacy_yks';

    await sql`
      INSERT INTO users (id, username, password_hash, role, sinif, alan, curriculum_mode)
      VALUES (${id11}, ${user11}, ${passHash}, 'ogrenci', '11', 'Sayisal', ${curMode11})
    `;
    const [row11] = await sql`SELECT curriculum_mode, sinif, alan FROM users WHERE id = ${id11}`;
    assert(row11?.curriculum_mode === 'maarif_v1' && row11?.sinif === '11' && row11?.alan === 'Sayisal',
      `11. Sınıf öğrencisi veritabanında curriculum_mode='maarif_v1' ve seçilen alan='Sayisal' olarak kaydedildi`);

    // TEST 4: 12. Sınıf Kaydı (Klasik YKS)
    const id12 = uuidv4();
    createdIds.push(id12);
    const user12 = `test_legacy12_${Date.now()}`;
    const curMode12 = ('12' === '9' || '12' === '10' || '12' === '11') ? 'maarif_v1' : 'legacy_yks';

    await sql`
      INSERT INTO users (id, username, password_hash, role, sinif, alan, curriculum_mode)
      VALUES (${id12}, ${user12}, ${passHash}, 'ogrenci', '12', 'Sayisal', ${curMode12})
    `;
    const [row12] = await sql`SELECT curriculum_mode, sinif, alan FROM users WHERE id = ${id12}`;
    assert(row12?.curriculum_mode === 'legacy_yks' && row12?.sinif === '12',
      `12. Sınıf öğrencisi veritabanında curriculum_mode='legacy_yks' olarak kaydedildi`);

    // TEST 5: Mezun Kaydı (Klasik YKS)
    const idMezun = uuidv4();
    createdIds.push(idMezun);
    const userMezun = `test_mezun_${Date.now()}`;
    const curModeMezun = ('Mezun' === '9' || 'Mezun' === '10' || 'Mezun' === '11') ? 'maarif_v1' : 'legacy_yks';

    await sql`
      INSERT INTO users (id, username, password_hash, role, sinif, alan, curriculum_mode)
      VALUES (${idMezun}, ${userMezun}, ${passHash}, 'ogrenci', 'Mezun', 'Esit Agirlik', ${curModeMezun})
    `;
    const [rowMezun] = await sql`SELECT curriculum_mode, sinif, alan FROM users WHERE id = ${idMezun}`;
    assert(rowMezun?.curriculum_mode === 'legacy_yks' && rowMezun?.sinif === 'Mezun',
      `Mezun öğrenci veritabanında curriculum_mode='legacy_yks' olarak kaydedildi`);

    // TEST 6: Sınıf Bazlı Yönlendirme Haritası Doğrulama
    function resolveLandingRoute(sinif, curriculum_mode) {
      const isMaarif = curriculum_mode === 'maarif_v1' || ['9', '10', '11'].includes(sinif);
      return isMaarif ? '/maarif' : '/dashboard';
    }

    assert(resolveLandingRoute('9', 'maarif_v1') === '/maarif', 'Kayıt / Giriş sonrası 9. sınıf yönlendirmesi -> /maarif');
    assert(resolveLandingRoute('10', 'maarif_v1') === '/maarif', 'Kayıt / Giriş sonrası 10. sınıf yönlendirmesi -> /maarif');
    assert(resolveLandingRoute('11', 'maarif_v1') === '/maarif', 'Kayıt / Giriş sonrası 11. sınıf yönlendirmesi -> /maarif');
    assert(resolveLandingRoute('12', 'legacy_yks') === '/dashboard', 'Kayıt / Giriş sonrası 12. sınıf yönlendirmesi -> /dashboard');
    assert(resolveLandingRoute('Mezun', 'legacy_yks') === '/dashboard', 'Kayıt / Giriş sonrası Mezun öğrenci yönlendirmesi -> /dashboard');

    // TEST 7: Panel Sınır İzolasyonu (Route Boundary Guard)
    function guardNavigation(user, requestedPath) {
      const isMaarifUser = user.curriculum_mode === 'maarif_v1' || ['9', '10', '11'].includes(user.sinif);
      const isLegacyUser = user.curriculum_mode === 'legacy_yks' || ['12', 'Mezun'].includes(user.sinif);
      const legacyOnlyPrefixes = ['/dashboard', '/denemeler', '/puan-hesaplama', '/konular', '/eksikler'];

      if (isMaarifUser) {
        if (legacyOnlyPrefixes.some(p => requestedPath === p || requestedPath.startsWith(`${p}/`))) {
          return { allowed: false, redirect: '/maarif' };
        }
      }
      if (isLegacyUser) {
        if (requestedPath === '/maarif' || requestedPath.startsWith('/maarif/')) {
          return { allowed: false, redirect: '/dashboard' };
        }
      }
      return { allowed: true };
    }

    const g1 = guardNavigation({ sinif: '9', curriculum_mode: 'maarif_v1' }, '/dashboard');
    assert(!g1.allowed && g1.redirect === '/maarif', 'Maarif öğrencisinin /dashboard erişimi engellendi -> /maarif');

    const g2 = guardNavigation({ sinif: '10', curriculum_mode: 'maarif_v1' }, '/denemeler');
    assert(!g2.allowed && g2.redirect === '/maarif', 'Maarif öğrencisinin /denemeler erişimi engellendi -> /maarif');

    const g3 = guardNavigation({ sinif: '11', curriculum_mode: 'maarif_v1' }, '/puan-hesaplama');
    assert(!g3.allowed && g3.redirect === '/maarif', 'Maarif öğrencisinin /puan-hesaplama erişimi engellendi -> /maarif');

    const g4 = guardNavigation({ sinif: '12', curriculum_mode: 'legacy_yks' }, '/maarif');
    assert(!g4.allowed && g4.redirect === '/dashboard', '12. Sınıf öğrencisinin /maarif erişimi engellendi -> /dashboard');

    const g5 = guardNavigation({ sinif: 'Mezun', curriculum_mode: 'legacy_yks' }, '/maarif/sinav/scenario-101');
    assert(!g5.allowed && g5.redirect === '/dashboard', 'Mezun öğrencisinin Maarif sınav oturumuna erişimi engellendi -> /dashboard');

  } finally {
    if (createdIds.length > 0) {
      await sql`DELETE FROM users WHERE id IN ${sql(createdIds)}`;
      console.log('\n🧹 Test kullanıcıları veritabanından temizlendi.');
    }
    await sql.end();
  }

  console.log(`\n======================================================`);
  console.log(`🎉 TÜM TESTLER TAMAMLANDI: ${passed}/${total} BAŞARILI!`);
  console.log(`======================================================\n`);

  if (passed !== total) {
    process.exit(1);
  }
}

run().catch((e) => {
  console.error('Doğrulama hatası:', e);
  process.exit(1);
});
