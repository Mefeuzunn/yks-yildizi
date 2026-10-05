export interface LabQuest {
  id: string;
  step: number;
  instruction: string;
  question: string;
  hint: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface SimulationLabData {
  conceptSummary: string;
  yksTip: string;
  quests: LabQuest[];
}

export const LAB_QUESTS_REGISTRY: Record<string, SimulationLabData> = {
  'egik-atis': {
    conceptSummary: 'İki boyutta sabit ivmeli hareket: Yatay hız bileşeni sürtünmesiz ortamda sabittir ($v_x = v_0 \\cdot \\cos\\alpha$), düşeyde ise yerçekimi ivmesi ($g$) ile hareket eder ($v_y = v_0 \\cdot \\sin\\alpha - g \\cdot t$).',
    yksTip: 'ÖSYM, birbirini 90 dereceye tamamlayan iki açıyla (ör. 30° ve 60°) aynı hızla atılan cisimlerin yatay menzillerinin eşit olduğunu sıkça sorar!',
    quests: [
      {
        id: 'q1',
        step: 1,
        instruction: 'Atış açısını 45°, ilk hızı 15 m/s yapın ve atış yapın. Ardından açıları 30° ve 60° olarak deneyin.',
        question: 'İlk hızı sabit tutulan bir eğik atışta maksimum yatay menzil ($X_{max}$) hangi atış açısında elde edilir?',
        hint: 'Sinüs fonksiyonunun maksimum değerini aldığı ($2\\alpha = 90^\\circ$) durumu düşünün.',
        options: ['30°', '45°', '60°', '90°'],
        correctAnswerIndex: 1,
        explanation: 'Menzil formülü $X = \\frac{v_0^2 \\cdot \\sin(2\\alpha)}{g}$ olduğundan, $\\sin(2\\alpha)$ fonksiyonu $2\\alpha = 90^\\circ$ yani $\\alpha = 45^\\circ$ açısında 1 değerini alarak maksimum menzili verir.'
      },
      {
        id: 'q2',
        step: 2,
        instruction: 'Aynı hızda 30° ve 60° açıyla iki atış yapın ve menzillerini cetvelle karşılaştırın.',
        question: 'Birbirini 90°ye tamamlayan iki farklı açıyla (örneğin 30° ve 60°) aynı hızla atılan iki cismin menzilleri nasıldır?',
        hint: '$\\sin(2 \\cdot 30^\\circ) = \\sin(60^\\circ)$ ve $\\sin(2 \\cdot 60^\\circ) = \\sin(120^\\circ)$ değerlerini karşılaştırın.',
        options: ['Birbirine eşittir', '60° olanın menzili 2 katıdır', '30° olanın menzili daha büyüktür', 'Yerçekimi ivmesine bağlı olarak değişir'],
        correctAnswerIndex: 0,
        explanation: 'Trigonometrik olarak $\\sin(2\\alpha) = \\sin(180^\\circ - 2\\alpha)$ olduğundan, toplamları 90° olan açıların ($\alpha + \\beta = 90^\\circ$) yatay menzilleri birebir eşittir.'
      },
      {
        id: 'q3',
        step: 3,
        instruction: 'Simülasyonda kütleyi 1 kg\'dan 10 kg\'a çıkarın ve hava direnci kapalıyken atış yapın.',
        question: 'Hava direncinin ihmal edildiği ortamda atılan cismin kütlesi 10 katına çıkarılırsa uçuş süresi ve menzili nasıl değişir?',
        hint: 'Düşey ivme yerçekimi ivmesidir ($g$). Yerçekimi ivmesi kütleden bağımsız mıdır?',
        options: ['10 katına çıkar', 'Değişmez', '10 kat azalır', 'Kareköküyle orantılı artar'],
        correctAnswerIndex: 1,
        explanation: 'Hava direnci yokken yerçekimi ivmesi $g$ her kütle için aynıdır. $F_{net} = m \\cdot a \\Rightarrow m \\cdot g = m \\cdot a \\Rightarrow a = g$. Kütle formüllerde sadeleştiği için uçuş süresi ve menzil değişmez.'
      }
    ]
  },

  'fotoelektrik': {
    conceptSummary: 'Einstein Fotoelektrik Denklemi: $E_{foton} = E_b (\\text{bağlanma}) + E_{kinetik}$. Işığın dalga değil foton (tanecik) modeliyle açıklanır. Bir foton yalnızca bir elektron sökebilir.',
    yksTip: 'Gelen ışığın frekansı ve dalga boyu sökülen elektronların kinetik enerjisini belirler; ışık şiddeti (foton sayısı) ise fotoelektrik akımı belirler!',
    quests: [
      {
        id: 'q1',
        step: 1,
        instruction: 'Işık kaynağının dalga boyunu kırmızıdan mora ve morötesine doğru kaydırın.',
        question: 'Işığın dalga boyu küçüldükçe (mor ve UV) kopan elektronların maksimum kinetik enerjisi nasıl değişir?',
        hint: '$E_{foton} = \\frac{h \\cdot c}{\\lambda}$ bağıntısını hatırlayın.',
        options: ['Artar', 'Azalır', 'Değişmez', 'Önce artar sonra azalır'],
        correctAnswerIndex: 0,
        explanation: 'Dalga boyu küçüldükçe fotonun enerjisi ($E = hc/\\lambda$) artar. Metalin bağlanma enerjisi sabit kaldığından ($E_{foton} = E_0 + E_k$), artan foton enerjisi elektronun kinetik enerjisine aktarılır.'
      },
      {
        id: 'q2',
        step: 2,
        instruction: 'Dalga boyunu eşik değerinin üzerinde tutarken ışık şiddetini (Intensity) %20\'den %100\'e çıkarın.',
        question: 'Işığın rengi sabitken sadece ışık şiddetini artırmak kopan elektronların kinetik enerjisini nasıl etkiler?',
        hint: 'Işık şiddeti foton sayısını artırır, tek bir fotonun enerjisini değil.',
        options: ['Kinetik enerjiyi 5 kat artırır', 'Kinetik enerjiyi etkilemez, sadece akımı artırır', 'Elektron kopmasını engeller', 'Durdurma gerilimini artırır'],
        correctAnswerIndex: 1,
        explanation: 'Işık şiddeti birim zamanda gelen foton sayısıdır. Tek bir foton tek bir elektronla etkileştiği için kinetik enerjiyi değiştirmez; kopan elektron sayısını (akımı) artırır.'
      },
      {
        id: 'q3',
        step: 3,
        instruction: 'Ters gerilim kaynağını açın ve akımı sıfırlayan gerilimi (Durdurma Gerilimi $V_d$) gözlemleyin.',
        question: 'Elektronları durdurmak için uygulanan durdurma gerilimi ($V_d$) hangisine bağlı DEĞİLDİR?',
        hint: '$e \\cdot V_d = E_k = h \\cdot f - E_0$ formülünü inceleyin.',
        options: ['Gelen fotonun frekansına', 'Metalin bağlanma enerjisine', 'Gelen ışığın şiddetine (foton sayısına)', 'Metalin cinsine'],
        correctAnswerIndex: 2,
        explanation: 'Durdurma gerilimi sökülen en hızlı elektronun kinetik enerjisine bağlıdır ($e \\cdot V_d = E_k$). Işık şiddeti tekil elektron enerjisini değiştirmediğinden durdurma gerilimine etki etmez.'
      }
    ]
  },

  'sigac-kondansator': {
    conceptSummary: 'Kondansatör sığası: $C = \\varepsilon \\cdot \\frac{A}{d}$. Depolanan yük $Q = C \\cdot V$, depolanan enerji $U = \\frac{1}{2} C V^2$. Pile bağlıyken gerilim ($V$), pilden ayrılmışken yük ($Q$) sabittir!',
    yksTip: 'AYT\'de pile bağlı bir sığacın levhaları arasına yalıtkan madde (dielektrik) konulduğunda V sabit kalırken C, Q ve E artışını mutlaka sorarlar.',
    quests: [
      {
        id: 'q1',
        step: 1,
        instruction: 'Levha alanını artırın ve levhalar arası mesafeyi ($d$) azaltın.',
        question: 'Kondansatörün sığasını ($C$) artırmak için aşağıdaki işlemlerden hangisi yapılmalıdır?',
        hint: '$C = \\varepsilon_0 \\cdot \\frac{A}{d}$ formülünü inceleyin.',
        options: ['Levhalar arası mesafeyi artırmak', 'Levha alanını büyütmek ve mesafeyi azaltmak', 'Uygulanan gerilimi artırmak', 'Plakaları pilden sökmek'],
        correctAnswerIndex: 1,
        explanation: 'Sığa geometrik bir özelliktir. Plaka alanı ($A$) ile doğru, levhalar arası mesafe ($d$) ile ters orantılıdır.'
      },
      {
        id: 'q2',
        step: 2,
        instruction: 'Kondansatörü pile bağlayıp şarj edin. Pil bağlıyken araya dielektrik blok yerleştirin.',
        question: 'Pile bağlı olan bir sığacın levhaları arasına dielektrik katsayısı daha büyük bir yalıtkan konulursa ne olur?',
        hint: 'Pil bağlıyken potansiyel fark ($V$) sabit kalmak zorundadır.',
        options: ['Gerilim ($V$) artar', 'Sığa ($C$) ve yük ($Q$) artar, gerilim ($V$) sabit kalır', 'Yük ($Q$) azalır', 'Elektrik alan sıfır olur'],
        correctAnswerIndex: 1,
        explanation: 'Pil devredeyken $V$ sabit kalır. $\\varepsilon$ arttığı için $C = \\varepsilon A / d$ artar. $Q = C \\cdot V$ olduğundan levhalarda biriken yük miktarı da artar.'
      },
      {
        id: 'q3',
        step: 3,
        instruction: 'Kondansatörü şarj ettikten sonra pilden ayırın (Disconnect Battery). Ardından levhaları birbirinden uzaklaştırın.',
        question: 'Pilden ayrılmış bir kondansatörün levhaları birbirinden uzaklaştırılırsa levhalardaki yük ($Q$) ve gerilim ($V$) nasıl değişir?',
        hint: 'Pilden ayrılmış devrede yükün gidebileceği hiçbir yer yoktur!',
        options: ['Yük ($Q$) sabit kalır, gerilim ($V$) artar', 'Yük ($Q$) azalır, gerilim ($V$) sabit kalır', 'Her ikisi de azalır', 'Her ikisi de sabit kalır'],
        correctAnswerIndex: 0,
        explanation: 'Pilden ayrılan sığacın yükü korunur ($Q = \\text{sabit}$). Levhalar uzaklaşınca $d$ artar, $C$ azalır. $Q = C \\cdot V$ bağıntısından $C$ azaldığı için $V$ artar.'
      }
    ]
  },

  'atom-olustur': {
    conceptSummary: 'Atom çekirdeğinde proton ve nötron, yörüngelerde elektron bulunur. Elementin kimliğini proton sayısı (Atom Numarası) belirler. Kütle Numarası = Proton + Nötron.',
    yksTip: 'İzotop atomların proton sayıları aynı, nötron sayıları farklıdır. Kimyasal özellikleri aynı, fiziksel özellikleri farklıdır!',
    quests: [
      {
        id: 'q1',
        step: 1,
        instruction: 'Çekirdeğe 6 proton, 6 nötron ve 6 elektron ekleyin. Ardından 1 proton daha ekleyin.',
        question: 'Bir atomun hangi tanecik sayısı değiştiğinde atomun kimyasal element türü kesinlikle değişir?',
        hint: 'Periyodik tablodaki sıralama neye göre yapılmıştır?',
        options: ['Elektron sayısı', 'Nötron sayısı', 'Proton sayısı', 'Yörünge sayısı'],
        correctAnswerIndex: 2,
        explanation: 'Bir atomun kimliğini (element türünü) proton sayısı belirler. Proton sayısı değiştiğinde atom farklı bir elemente dönüşür.'
      },
      {
        id: 'q2',
        step: 2,
        instruction: 'Çekirdeğe 1 proton ekleyin. Nötron sayısını önce 0, sonra 1, sonra 2 yapın (Hidrojen, Döteryum, Trityum).',
        question: 'Proton sayıları aynı, nötron sayıları farklı olan taneciklere ne ad verilir?',
        hint: 'Son harfi \'p\' olan kavrama dikkat edin.',
        options: ['İzobar', 'İzoton', 'İzotop', 'İzoelektronik'],
        correctAnswerIndex: 2,
        explanation: 'Proton sayıları aynı, nötron sayıları (ve dolayısıyla kütle numaraları) farklı olan atomlara İZOTOP atomlar denir.'
      },
      {
        id: 'q3',
        step: 3,
        instruction: 'Nötr bir atomdan 1 elektron çıkarın ve net yüke bakın.',
        question: 'Nötr bir atom dışarıya 1 elektron verdiğinde net yükü ve tanecik türü ne olur?',
        hint: 'Proton sayısı elektron sayısından fazla kalır.',
        options: ['-1 yüklü anyon', '+1 yüklü katyon', 'Nötr kalır', 'Kütle numarası 1 azalır'],
        correctAnswerIndex: 1,
        explanation: 'Elektron negatif yüklüdür. Elektron veren atomda pozitif protonlar üstün geleceğinden tanecik +1 yüklü katyona dönüşür.'
      }
    ]
  },

  'isigin-kirilmasi': {
    conceptSummary: 'Snell Yasası: $n_1 \\cdot \\sin\\theta_1 = n_2 \\cdot \\sin\\theta_2$. Işık az yoğun ortamdan çok yoğun ortama geçerken normale yaklaşır ve hızı azalır ($v = c/n$). Çok yoğundan az yoğuna geçerken sınır açısı aşılırsa tam yansıma gerçekleşir.',
    yksTip: 'Optikte ışığın rengi (dalga boyu) kırılma indisini etkiler: Mor ışık en çok, kırmızı ışık en az kırılır!',
    quests: [
      {
        id: 'q1',
        step: 1,
        instruction: 'Işığı havadan ($n=1.00$) suya ($n=1.33$) 45° açıyla gönderin. Kırılma açısını ölçün.',
        question: 'Işık az kırıcı (az yoğun) ortamdan çok kırıcı (çok yoğun) ortama geçerken ışın ve hızı nasıl davranır?',
        hint: 'Normal eksenine yaklaşıyor mu, uzaklaşıyor mu?',
        options: ['Normale yaklaşarak kırılır, hızı azalır', 'Normalden uzaklaşarak kırılır, hızı artar', 'Kırılmadan doğrusal geçer', 'Tam yansımaya uğrar'],
        correctAnswerIndex: 0,
        explanation: 'Çok yoğun ortama giren ışığın yayılma hızı $v = c/n$ azaldığı için ışın normale yaklaşarak kırılır.'
      },
      {
        id: 'q2',
        step: 2,
        instruction: 'Işık kaynağını suyun içine koyun ve havaya doğru açıyı yavaşça büyütün.',
        question: 'Çok yoğun ortamdan az yoğun ortama geçen ışının sınır açısından daha büyük bir açıyla gelmesi sonucu ne gerçekleşir?',
        hint: 'Fiber optik kablolar ve serap olayının temel mekanizmasıdır.',
        options: ['Işığın soğurulması', 'Kırınım', 'Tam yansıma', 'Girişim saçakları'],
        correctAnswerIndex: 2,
        explanation: 'Çok yoğun ortamdan sınır açısından ($\theta_k$) daha büyük bir açıyla gelen ışın diğer ortama geçemez; açısına eşit olacak şekilde kendi ortamına geri döner (Tam Yansıma).'
      },
      {
        id: 'q3',
        step: 3,
        instruction: 'Gelen açıyı 0° (yüzeye dik, normal doğrultusunda) yapın.',
        question: 'Ortamların kırılma indisleri ne olursa olsun, yüzey normali üzerinden (90° dik) gelen ışın nasıl kırılır?',
        hint: '$\\sin(0^\\circ) = 0$ değerini Snell denkleminde yerine koyun.',
        options: ['Kırılmadan doğrultusunu değiştirmeden geçer', 'Yüzeye teğet gider', 'Tam yansır', '45° sapar'],
        correctAnswerIndex: 0,
        explanation: 'Normal doğrultusunda gelen ışın için gelme açısı sıfırdır ($0^\\circ$). Snell denklemine göre kırılma açısı da $0^\\circ$ olur; hız değişse bile doğrultu değişmez.'
      }
    ]
  },

  'denge-oyunu': {
    conceptSummary: 'Denge ve Tork Şartları: 1. $\\sum \\vec{F} = 0$ (Öteleme dengesi), 2. $\\sum \\vec{\\tau} = 0$ (Dönme dengesi). Tork = Kuvvet $\\times$ Dönme noktasına dik uzaklık ($\\tau = F \\cdot d$).',
    yksTip: 'Kaldıraç sorularında destek noktasına olan uzaklık ile ağırlığın çarpımları sağ ve sol kolda eşitlenmelidir ($m_1 \\cdot d_1 = m_2 \\cdot d_2$).',
    quests: [
      {
        id: 'q1',
        step: 1,
        instruction: 'Destekten 2 birim sola 10 kg koyun. Dengeyi sağlamak için 1 birim sağa kaç kg koymalısınız?',
        question: 'Tork eşitliği ($m_1 \\cdot d_1 = m_2 \\cdot d_2$) gereği, destekten 1 birim uzaklığa konulacak kütle ne olmalıdır?',
        hint: '$10 \\text{ kg} \\times 2 = m_2 \\times 1$',
        options: ['5 kg', '10 kg', '20 kg', '40 kg'],
        correctAnswerIndex: 2,
        explanation: 'Sol kol torku: $10 \\times 2 = 20$. Sağ kol torkunun eşit olması için: $m_2 \\times 1 = 20 \\Rightarrow m_2 = 20\\text{ kg}$ olmalıdır.'
      },
      {
        id: 'q2',
        step: 2,
        instruction: 'Kaldıraç dengedeyken destek ayağının kaldırdığı toplam düşey kuvvete bakın.',
        question: 'Sol kolda 10 kg, sağ kolda 20 kg varken kaldıraç dengedeyse, desteğin tepki kuvveti kaç kg kütleye eşittir?',
        hint: '$\\sum F_y = 0$ düşey kuvvet dengesini düşünün.',
        options: ['10 kg', '20 kg', '30 kg (toplam kütle)', '0 kg'],
        correctAnswerIndex: 2,
        explanation: 'Öteleme dengesi gereği yukarı yönlü destek tepki kuvveti, aşağı yönlü ağırlıkların toplamına ($10 + 20 = 30\\text{ kg}$) eşit olmalıdır.'
      },
      {
        id: 'q3',
        step: 3,
        instruction: 'Bilinmeyen gizemli objeler sekmesine geçip nesnelerin kütlesini tork dengesiyle tahmin edin.',
        question: 'Kuvvet kolu yük kolundan daha uzun olan bir kaldıraç tipi için hangisi kesinlikle doğrudur?',
        hint: 'Yoldan kayıp varken kuvvetten ne sağlanır?',
        options: ['Kuvvetten kazanç sağlar', 'Yoldan kazanç sağlar', 'İşten kazanç sağlar', 'Enerji üretir'],
        correctAnswerIndex: 0,
        explanation: 'Kuvvet kolu uzadıkça daha küçük kuvvetle daha büyük yükler dengelenebilir (Kuvvet Kazancı > 1). Hiçbir basit makine işten veya enerjiden kazanç sağlamaz.'
      }
    ]
  }
};

/**
 * Registry'de özel föyü olmayan diğer tüm simülasyonlar için
 * konu ve üniteye göre dinamik akıllı deney görevleri üretir.
 */
export function getSimulationLabData(slug: string, subject: string, topic: string, titleTr: string): SimulationLabData {
  if (LAB_QUESTS_REGISTRY[slug]) {
    return LAB_QUESTS_REGISTRY[slug];
  }

  return {
    conceptSummary: `${titleTr} simülasyonu, YKS ${subject} müfredatındaki "${topic}" konusunu interaktif olarak kavramak için tasarlanmıştır.`,
    yksTip: `ÖSYM, "${topic}" konusunda değişkenlerin birbirine etkisini grafik ve deney düzenekleri üzerinden yorumlatmayı çok sever.`,
    quests: [
      {
        id: 'gen_q1',
        step: 1,
        instruction: `Simülasyon sahnesindeki temel kontrolleri kullanarak "${topic}" parametrelerini değiştirin ve sistemdeki ilk tepkiyi gözlemleyin.`,
        question: `Bu simülasyondaki ana değişken artırıldığında sistemin fiziksel/kimyasal davranışı nasıl değişir?`,
        hint: 'Konunun temel formülünü ve değişkenler arasındaki orantıyı hatırlayın.',
        options: [
          'Değişkenle doğru orantılı olarak artış gösterir',
          'Sistem hiçbir değişiklik göstermez',
          'Ters orantılı olarak azalır',
          'Önce artar, kritik eşikten sonra doymuş hale gelir'
        ],
        correctAnswerIndex: 0,
        explanation: `İlgili konudaki bağıntılar incelendiğinde ana parametre ile sonuç değişkeni arasında doğrudan bir ilişki bulunmaktadır.`
      },
      {
        id: 'gen_q2',
        step: 2,
        instruction: 'Değişkeni sıfırlayın veya zıt yönde değiştirerek sınır durumları (uç değerleri) test edin.',
        question: 'Sınır şartlarda (minimum veya maksimum değer) sistemin kararlılığı için hangisi söylenebilir?',
        hint: 'Korunum yasalarını (Kütle, Enerji, Yük vb.) göz önünde bulundurun.',
        options: [
          'Doğa yasaları gereği toplam büyüklük korunur',
          'Sistem enerjisi yok olur',
          'Bütün parametreler sıfırlanır',
          'Sonsuz bir büyüklüğe ulaşır'
        ],
        correctAnswerIndex: 0,
        explanation: 'Tüm YKS müfredatında olduğu gibi kapalı sistemlerde temel korunum kanunları eksiksiz geçerlidir.'
      },
      {
        id: 'gen_q3',
        step: 3,
        instruction: 'ÖSYM tarzı kavramsal çıkarım yapmak üzere deneyin genel sonucunu analiz edin.',
        question: `"${topic}" ünitesinden YKS sınavında gelebilecek yeni nesil bir soruda en kritik nokta nedir?`,
        hint: 'Ezber formüllerden ziyade kavramsal mantığı düşünün.',
        options: [
          'Formül ezberlemekten ziyade neden-sonuç ilişkisini ve grafikleri doğru okumak',
          'Yalnızca sayısal hesaplama yapmak',
          'Birimleri dikkate almamak',
          'Soruları şıklardan giderek çözmek'
        ],
        correctAnswerIndex: 0,
        explanation: 'ÖSYM\'nin son yıllardaki yaklaşımı, deney düzeneğindeki bağımsız değişkenin bağımlı değişken üzerindeki etkisini kavrama becerisini ölçmektedir.'
      }
    ]
  };
}
