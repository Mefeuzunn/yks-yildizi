export interface Mascot {
  id: string;
  name: string;
  nickname: string;
  emoji: string;
  title: string;
  description: string;
  requiredXp: number;
  level: number;
  color: string;
  bgGradient: string;
  glow: string;
  personality: string;
  specialty: string;
  quotes: string[];
  petReactions: string[];
}

export const MASCOTS: Mascot[] = [
  {
    id: 'chick',
    name: 'Yavru Pofuduk',
    nickname: 'Pufi',
    emoji: '🐣',
    title: 'Meraklı Çırak',
    description: 'Yumurtasından yeni çıkmış, büyük hayalleri olan minik sarı tüy yumağı! Her yeni soru onun için bir keşif.',
    requiredXp: 0,
    level: 1,
    color: '#10b981',
    bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(5, 150, 105, 0.15))',
    glow: 'rgba(16, 185, 129, 0.35)',
    personality: 'Neşeli, meraklı ve daima kıpır kıpır',
    specialty: 'İlk Adım & Temel Alışkanlık',
    quotes: [
      'Bugün çalışmaya hazır mısın? Birlikte başaracağız!',
      'Minik adımlar büyük hedeflere götürür, sakın unutma!',
      'Cik cik! İlk soruyu çözdüğünde bana da haber ver!',
      'Ben senin en sadık çalışma arkadaşınım!',
      'Azimle çözülen her soru bizi bir adım daha büyütüyor!'
    ],
    petReactions: [
      'Cik cik! Gıdıklanıyorum ama çok tatlısın! 🥰',
      'Pufi sana sımsıkı sarılıyor! Çalışma enerjisi +100! ✨',
      'Tüylerim kabardı, hadi hemen bir soru patlatalım! 🚀'
    ]
  },
  {
    id: 'rabbit',
    name: 'Pamuk Tavşan',
    nickname: 'Ponçik',
    emoji: '🐰',
    title: 'Paragraf Perisi',
    description: 'Uzun kulaklarıyla her fısıltıyı duyar, paragraf ve hız sorularını göz açıp kapayıncaya kadar bitirir!',
    requiredXp: 350,
    level: 2,
    color: '#ec4899',
    bgGradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.25), rgba(219, 39, 119, 0.15))',
    glow: 'rgba(236, 72, 153, 0.35)',
    personality: 'Çevik, enerjik ve dikkatli',
    specialty: 'Hızlı Okuma & Süre Yönetimi',
    quotes: [
      'Hadi zıplayalım! Bir deneme daha bitirmeye ne dersin?',
      'Paragraflar uzun olabilir ama senin dikkatin daha keskin!',
      'Havuç yemek kadar tatlı bir net artışı hissediyorum!',
      'Hızlı ve çevik ol, zaman senin lehine işliyor!',
      'Süre baskısı mı? Bizim hızımıza yetişemezler!'
    ],
    petReactions: [
      'Burnumu oynatıyorum! Netlerin zıplayarak artıyor! 🥕',
      'Ponçik kulaklarını dikti: Odaklanma tavan yaptı! ⚡',
      'Zıp zıp! Bugün harika bir deneme günü olacak! 💖'
    ]
  },
  {
    id: 'fox',
    name: 'Kızıl Tilki',
    nickname: 'Pofuduk',
    emoji: '🦊',
    title: 'Kurnaz Stratejist',
    description: 'Zeki, sevimli ve kurnaz. Sınav taktikleri, formül ezberi ve turlama tekniğinde üstüne yoktur!',
    requiredXp: 800,
    level: 3,
    color: '#f97316',
    bgGradient: 'linear-gradient(135deg, rgba(249, 115, 22, 0.25), rgba(234, 88, 12, 0.15))',
    glow: 'rgba(249, 115, 22, 0.35)',
    personality: 'Akılcı, taktiksel ve kararlı',
    specialty: 'Turlama Tekniği & Formül Analizi',
    quotes: [
      'Zor soruları turlama tekniğiyle alt et, tilki gibi kurnaz ol!',
      'Doğru strateji, körü körüne çalışmaktan 10 kat daha etkilidir.',
      'Kuyruğum dik, hedeflerimiz net! Devam ediyoruz!',
      'Bugün formülleri su gibi ezberleyeceğiz, güven bana!',
      'Soru kökünü dikkatli oku: "Değildir" tuzaklarına düşme!'
    ],
    petReactions: [
      'Kuyruğumu sallıyorum! Bir kurnaz taktik daha cebinde! 🦊',
      'Pofuduk sana göz kırptı: O soru kekti, sırada ne var? 🎯',
      'Tilki sarılması! Başarı senin kaderinde var! 🔥'
    ]
  },
  {
    id: 'panda',
    name: 'Bambu Panda',
    nickname: 'Mochi',
    emoji: '🐼',
    title: 'Sakin Odak Ustası',
    description: 'Pomodoro sırasında asla dikkati dağılmaz. Derin bir nefes alıp zihinsel sakinliği ve dinginliği öğretir.',
    requiredXp: 1800,
    level: 4,
    color: '#06b6d4',
    bgGradient: 'linear-gradient(135deg, rgba(6, 182, 212, 0.25), rgba(8, 145, 178, 0.15))',
    glow: 'rgba(6, 182, 212, 0.35)',
    personality: 'Dingin, huzurlu ve sarsılmaz',
    specialty: 'Pomodoro Odak & Stres Yönetimi',
    quotes: [
      'Derin bir nefes al... Sakin zihin en karmaşık soruları bile çözer.',
      'Stres yok, panik yok. Yavaş ve emin adımlarla zirveye!',
      'Bambu dalı gibi esnek ol, zor sorular seni bükemez.',
      'Şimdi odaklanma zamanı. Telefonu kenara bırakalım mı?',
      'Her gün yarım saatlik düzenli çalışma dağları devirir.'
    ],
    petReactions: [
      'Mochi göbeğini okşatıyor... Zihnin pamuk gibi sakinleşti! 🍃',
      'Panda kucaklaması! Stres uçup gitti, odak %100! 🧘‍♂️',
      'Bambu yaprağı gibi ferah bir net artışı geliyor! 🎋'
    ]
  },
  {
    id: 'owl',
    name: 'Bilge Baykuş',
    nickname: 'Hokus',
    emoji: '🦉',
    title: 'Gece Nöbetçisi & Konu Bilgesi',
    description: 'Gece lambasının altında sessizce saatlerce soru çözenlerin en sadık ve derin gözcüsü.',
    requiredXp: 3500,
    level: 5,
    color: '#8b5cf6',
    bgGradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(124, 58, 237, 0.15))',
    glow: 'rgba(139, 92, 246, 0.35)',
    personality: 'Derin, bilge, gözlemci',
    specialty: 'Derinlemesine Konu Anlayışı & Gece Seansları',
    quotes: [
      'Gece yıldızlar parıldarken çalışanlar, gündüz güneşe hükmeder.',
      'Bilgi pratik yaptıkça elmas gibi parıldar.',
      'Gözlerim her detayı yakalıyor; işlem hatası yapma dikkat et!',
      'Bilgeliğin ışığı seninle olsun genç yıldız!',
      'En zor konu bile parçalara bölünürse çocuk oyuncağıdır.'
    ],
    petReactions: [
      'Hokus gözlerini kırptı: Zihninde yepyeni bir sinir ağı açıldı! 🔮',
      'Baykuş kanadı omzunda: Gece etüdü bereketli geçiyor! 🌙',
      'Huu huu! Bir konu eksiğini daha tarihe gömdük! 📚'
    ]
  },
  {
    id: 'penguin',
    name: 'Buzi Penguen',
    nickname: 'Pingu',
    emoji: '🐧',
    title: 'Soğukkanlı Sınavcı',
    description: 'Sınav heyecanını sıfıra indirir, buz gibi serin ve emin adımlarla netleri birer birer toplar!',
    requiredXp: 6000,
    level: 6,
    color: '#3b82f6',
    bgGradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(37, 99, 235, 0.15))',
    glow: 'rgba(59, 130, 246, 0.35)',
    personality: 'Sempatik, soğukkanlı ve dayanıklı',
    specialty: 'Sınav Anı Soğukkanlılığı & Rutin Takibi',
    quotes: [
      'Buz gibi sakin kal! Sınav stresini soğuk su gibi yutuyoruz.',
      'Paytak paytak ama durmadan yürüyoruz, hedef derece!',
      'Denemede panik yok! Kendine ve birikimine güven!',
      'Kutup yıldızı bile senin çalışma azmin kadar parlamıyor!',
      'Buzulları eriten güneş değil, senin içindeki azimdir!'
    ],
    petReactions: [
      'Pingu göbeği üstünde kaydı! Hararetin söndü, kafan buz gibi berrak! ❄️',
      'Paytak alkışlar! Bu denemede harika bir net çıkaracaksın! 🧊',
      'Soğuk hava dalgası: Heyecan gitti, saf odak geldi! 🎯'
    ]
  },
  {
    id: 'wolf',
    name: 'Cesur Kurt',
    nickname: 'Boran',
    emoji: '🐺',
    title: 'Sürü Lideri & Hedef Avcısı',
    description: 'Asla pes etmeyen, zorlu soruların üstüne korkusuzca atılan ve rakipleri geride bırakan lider ruh.',
    requiredXp: 10000,
    level: 7,
    color: '#6366f1',
    bgGradient: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(79, 70, 229, 0.15))',
    glow: 'rgba(99, 102, 241, 0.35)',
    personality: 'Cesur, kararlı ve hırslı',
    specialty: 'Lig Yükselme & Zor Soru Çözümü',
    quotes: [
      'Asla pes etme! Hedeflediğin amfi ve fakülte seni bekliyor.',
      'Tek başına bir ordu gibi çalışıyorsun, seninle gurur duyuyorum.',
      'Zor sorular seni korkutamaz, sen onların üstüne gidiyorsun!',
      'Rakipler uyurken biz masanın başındayız!',
      'Kurt kışı geçirir ama yediği ayazı unutmaz; bu çabaların karşılığını alacaksın!'
    ],
    petReactions: [
      'Auuu! Kurt ulumasıyla lig sıralamasında yukarı tırmanıyoruz! 🐺',
      'Boran gözlerini hedefe dikti: İlk 1000 kapısı aralandı! ⚔️',
      'Kurt pençesi çakıldı! Hiçbir soru elinden kurtulamaz! ⚡'
    ]
  },
  {
    id: 'lion',
    name: 'Altın Aslan',
    nickname: 'Leo',
    emoji: '🦁',
    title: 'Zirve Fatihi & Şampiyon',
    description: 'YKS liglerinin zirvesinde taht kurmuş, asil ve kararlı şampiyon maskot. Derece adaylarının tercihi.',
    requiredXp: 16000,
    level: 8,
    color: '#eab308',
    bgGradient: 'linear-gradient(135deg, rgba(234, 179, 8, 0.25), rgba(202, 138, 4, 0.15))',
    glow: 'rgba(234, 179, 8, 0.35)',
    personality: 'Asil, güçlü ve ilham verici',
    specialty: 'Derece Hedefi & Tam Odak Denemeler',
    quotes: [
      'Sen bir şampiyon gibi kükreyeceksin! Sahne senin!',
      'Zirvede rüzgar sert eser ama sen dimdik duruyorsun.',
      'Günde yüzlerce soru, tek bir hedef: İlk 1000!',
      'Tahtına yakışır bir çalışma sergilemeye devam et!',
      'Şampiyonlar antrenmanda doğar, sınav salonunda taç giyer!'
    ],
    petReactions: [
      'Leo kükredi! Netler zirveye fırladı, taht seni bekliyor! 👑',
      'Altın yelesini kabarttı: Saygı duruşu! Bu disiplin takdire şayan! 🦁',
      'Aslan selamı! Şampiyonluk yürüyüşü devam ediyor! 🏆'
    ]
  },
  {
    id: 'dragon',
    name: 'Alev Ejderhası',
    nickname: 'Pyros',
    emoji: '🐉',
    title: 'Efsanevi Net Canavarı',
    description: 'Masada yanan azim ateşinden doğdu. Çözülen her soruyla kanatları alev alır, denemeleri küle çevirir!',
    requiredXp: 25000,
    level: 9,
    color: '#ef4444',
    bgGradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(220, 38, 38, 0.15))',
    glow: 'rgba(239, 68, 68, 0.35)',
    personality: 'Güçlü, tutkulu ve efsanevi',
    specialty: 'Maraton Dayanıklılığı & İleri Düzey Sınav Performansı',
    quotes: [
      'İçindeki çalışma ateşiyle tüm denemeleri yakıp kül et!',
      'Bu azimle seni hiçbir soru bankası durduramaz!',
      'Ateşimiz sönmeyecek, sınav sabahına kadar tam gaz!',
      'Efsaneler masa başında yazılır, sen de tarih yazıyorsun!',
      'Yorulmak mı? Bizim kanatlarımızda rüzgar hiç dinmez!'
    ],
    petReactions: [
      'Pyros alev püskürttü! Soru kitapçığı alev aldı! 🔥🔥🔥',
      'Ejderha kanatları açıldı: YKS engelleri yerle bir oldu! 🐉',
      'Efsanevi güç damarlarında akıyor! Zirve senin! 💥'
    ]
  },
  {
    id: 'star',
    name: 'Kozmik Yıldız',
    nickname: 'Nova',
    emoji: '⭐',
    title: 'YKS Yıldızı & Evrenin Bilgesi',
    description: 'Platformun en yüce ve nihai maskotu. Evrenin yıldız tozlarından yaratılmış mutlak rehber.',
    requiredXp: 40000,
    level: 10,
    color: '#a855f7',
    bgGradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(147, 51, 234, 0.2))',
    glow: 'rgba(168, 85, 247, 0.45)',
    personality: 'Kozmik, bilge ve parıldayan',
    specialty: 'Mutlak Başarı & Üniversite Kapısı',
    quotes: [
      'Sen artık gökyüzünün en parlak yıldızısın. Zirve tamamen senin!',
      'YKS Yıldızı unvanını sonuna kadar hak ettin!',
      'Tüm evren senin başarın için bir araya geldi, parlamaya devam et!',
      'Hedefine ulaştığında arkana bakıp bu günleri gururla anacaksın!',
      'Senin ışıltın binlerce öğrenciye ilham veriyor!'
    ],
    petReactions: [
      'Nova süpernova gibi parıldadı! Kozmik enerji zihnine aktı! ✨🌟💫',
      'Yıldız tozu yağmuru! İstediğin üniversitenin amfisi seni bekliyor! 🎓',
      'Sen gerçek bir YKS YILDIZISIN! Parlamaya devam et! 🌌'
    ]
  }
];

export function getMascotById(id: string): Mascot {
  return MASCOTS.find(m => m.id === id) || MASCOTS[2]; // Default: fox (Kızıl Tilki Pofuduk)
}

export function getUnlockedMascots(xp: number): Mascot[] {
  return MASCOTS.filter(m => xp >= m.requiredXp);
}

export function getNextMascot(xp: number): { mascot: Mascot; remainingXp: number; progressPercent: number } | null {
  const next = MASCOTS.find(m => xp < m.requiredXp);
  if (!next) return null;
  
  // Find the previous mascot to calculate relative percentage
  const currentIdx = MASCOTS.findIndex(m => m.id === next.id);
  const prevRequired = currentIdx > 0 ? MASCOTS[currentIdx - 1].requiredXp : 0;
  
  const span = next.requiredXp - prevRequired;
  const currentProgress = Math.max(0, xp - prevRequired);
  const progressPercent = Math.min(100, Math.round((currentProgress / span) * 100));
  const remainingXp = Math.max(0, next.requiredXp - xp);

  return {
    mascot: next,
    remainingXp,
    progressPercent
  };
}

export function getEquippedMascot(activeId: string | null | undefined, xp: number): Mascot {
  if (activeId) {
    const found = MASCOTS.find(m => m.id === activeId);
    if (found) return found;
  }
  // If not explicitly equipped, pick the highest unlocked mascot by XP
  const unlocked = getUnlockedMascots(xp);
  return unlocked[unlocked.length - 1] || MASCOTS[0];
}
