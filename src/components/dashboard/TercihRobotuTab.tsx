import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Target, 
  Plus, 
  Check, 
  Loader2, 
  Sparkles, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Copy, 
  X, 
  Building2, 
  SlidersHorizontal,
  RotateCcw,
  ListOrdered,
  Users
} from 'lucide-react';
import { toast } from '@/context/ToastContext';

const CITIES = [
  'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Aksaray', 'Amasya', 'Ankara', 'Antalya', 'Ardahan', 'Artvin',
  'Aydın', 'Balıkesir', 'Bartın', 'Batman', 'Bayburt', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur',
  'Bursa', 'Çanakkale', 'Çankırı', 'Çorum', 'Denizli', 'Diyarbakır', 'Düzce', 'Edirne', 'Elazığ', 'Erzincan',
  'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari', 'Hatay', 'Iğdır', 'Isparta', 'İstanbul',
  'İzmir', 'Kahramanmaraş', 'Karabük', 'Karaman', 'Kars', 'Kastamonu', 'Kayseri', 'Kilis', 'Kırıkkale', 'Kırklareli',
  'Kırşehir', 'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Mardin', 'Mersin', 'Muğla', 'Muş',
  'Nevşehir', 'Niğde', 'Ordu', 'Osmaniye', 'Rize', 'Sakarya', 'Samsun', 'Şanlıurfa', 'Siirt', 'Sinop',
  'Sivas', 'Şırnak', 'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli', 'Uşak', 'Van', 'Yalova', 'Yozgat', 'Zonguldak'
];

export default function TercihRobotuTab() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [scoreType, setScoreType] = useState('');
  const [city, setCity] = useState('');
  const [uniType, setUniType] = useState('');
  const [sortBy, setSortBy] = useState('base_score_desc');
  const [prefList, setPrefList] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchPreferences();
    search('', '', '', '', 'base_score_desc');
  }, []);

  async function search(
    searchQuery = q, 
    selectedType = scoreType, 
    selectedCity = city, 
    selectedUniType = uniType,
    selectedSort = sortBy
  ) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('q', searchQuery);
      if (selectedType) params.set('scoreType', selectedType);
      if (selectedCity) params.set('city', selectedCity);
      if (selectedUniType) params.set('uniType', selectedUniType);
      if (selectedSort) params.set('sortBy', selectedSort);
      params.set('limit', '60');

      const res = await fetch(`/api/universities/search?${params.toString()}`);
      const data = await res.json();
      setDepartments(data.departments || []);
    } catch (e) {
      console.error('Arama hatası:', e);
      toast.error('Bölümler listelenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }

  async function fetchPreferences() {
    try {
      const res = await fetch('/api/user/preferences');
      const data = await res.json();
      if (data.list?.items) setPrefList(data.list.items);
    } catch (e) {
      console.error('Tercih listesi yüklenemedi:', e);
    }
  }

  const savePreferences = async (newItems: any[]) => {
    setPrefList(newItems);
    const departmentIds = newItems.map(p => p.department_id || p.id);
    try {
      await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ departmentIds })
      });
    } catch (e) {
      console.error('Tercih kaydetme hatası:', e);
      toast.error('Tercihler kaydedilirken hata oluştu.');
    }
  };

  const addToPreferences = async (dept: any) => {
    const existingIds = prefList.map(p => p.department_id || p.id);
    if (existingIds.includes(dept.id)) {
      toast.info('Bu bölüm zaten tercih listenizde.');
      return;
    }
    if (existingIds.length >= 24) {
      toast.warning('YKS kuralları gereği en fazla 24 tercih yapabilirsiniz.');
      return;
    }

    const newItem = {
      ...dept,
      department_id: dept.id,
      order_index: prefList.length + 1
    };

    const updated = [...prefList, newItem];
    await savePreferences(updated);
    toast.success(`${dept.name} (${dept.uni_name}) tercih listenize #${updated.length} olarak eklendi.`);
  };

  const removeFromPreferences = async (deptId: string) => {
    const updated = prefList.filter(p => (p.department_id || p.id) !== deptId).map((item, idx) => ({
      ...item,
      order_index: idx + 1
    }));
    await savePreferences(updated);
    toast.info('Bölüm tercih listenizden kaldırıldı.');
  };

  const movePreference = async (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= prefList.length) return;

    const copy = [...prefList];
    const temp = copy[index];
    copy[index] = copy[newIndex];
    copy[newIndex] = temp;

    const reordered = copy.map((item, idx) => ({ ...item, order_index: idx + 1 }));
    await savePreferences(reordered);
  };

  const clearAllPreferences = async () => {
    if (prefList.length === 0) return;
    if (!confirm('Tüm tercih listenizi temizlemek istediğinize emin misiniz?')) return;
    await savePreferences([]);
    toast.info('Tercih listeniz tamamen temizlendi.');
  };

  const copyListToClipboard = () => {
    if (prefList.length === 0) {
      toast.warning('Kopyalanacak tercih bulunmuyor.');
      return;
    }

    const text = prefList.map((p, idx) => {
      const score = p.base_score && Number(p.base_score) > 0 ? `${Number(p.base_score).toFixed(1)} Puan` : 'Dolmadı';
      const rank = p.ranking && Number(p.ranking) > 0 ? `Sıra: ${Number(p.ranking).toLocaleString('tr-TR')}` : 'Sıralama yok';
      return `${idx + 1}. ${p.uni_name} - ${p.name} [${p.score_type}] (${p.city || ''}) | ${score} | ${rank}`;
    }).join('\n');

    const fullMessage = `📋 2026 YKS TERCİH LİSTEM (${prefList.length}/24 Tercih)\n\n${text}\n\n✨ YKS Yıldızı Tercih Robotu ile hazırlandı.`;

    navigator.clipboard.writeText(fullMessage);
    setCopied(true);
    toast.success('Tercih listeniz panoya kopyalandı!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleResetFilters = () => {
    setQ('');
    setScoreType('');
    setCity('');
    setUniType('');
    setSortBy('base_score_desc');
    search('', '', '', '', 'base_score_desc');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -10 }} 
      transition={{ duration: 0.3 }}
      className="relative pb-24 md:pb-0"
    >
      <div className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] bg-sky-500/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <span className="text-4xl">🎓</span> YÖK Atlas Tercih Robotu
          </h2>
          <p className="text-gray-400 mt-2">
            189 Üniversite ve 11.700+ lisans/önlisans programı arasında filtrele, 24 tercihini stratejik olarak yönet.
          </p>
        </div>

        {/* Interactive Preference Badge / Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className={`px-5 py-3.5 rounded-2xl flex items-center gap-3 shadow-lg backdrop-blur-sm transition-all text-left group border ${
            prefList.length > 0
              ? 'bg-gradient-to-r from-sky-500/20 via-indigo-500/15 to-purple-500/20 border-sky-400/40 hover:border-sky-400 hover:shadow-[0_0_25px_rgba(56,189,248,0.35)]'
              : 'bg-white/5 border-white/10 hover:border-white/20'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
            <ListOrdered className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
              <span>Tercih Listeniz</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            </div>
            <div className="text-sm font-bold text-white">
              <span className="text-sky-400 text-base">{prefList.length}</span>
              <span className="text-gray-500">/24 Tercih</span>
              <span className="text-xs text-sky-300 ml-2 font-normal group-hover:underline">Düzenle →</span>
            </div>
          </div>
        </button>
      </div>

      {/* Modern Search & Multi-Filter Bar */}
      <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-5 mb-8 shadow-xl backdrop-blur-md space-y-4">
        {/* Search Input */}
        <div className="flex-1 w-full relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input 
            type="text" 
            placeholder="Üniversite veya Bölüm adı ara (örn: Bilgisayar, Tıp, ODTÜ, Boğaziçi, Hukuk, Mimarlık)..." 
            value={q} 
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search(q, scoreType, city, uniType, sortBy)}
            className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-white outline-none focus:border-sky-500/60 focus:bg-sky-500/5 transition-all text-base"
          />
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Score Type */}
          <div className="relative">
            <Target className="w-4 h-4 text-sky-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select 
              value={scoreType} 
              onChange={e => {
                const val = e.target.value;
                setScoreType(val);
                search(q, val, city, uniType, sortBy);
              }}
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-8 py-3 text-white text-sm outline-none focus:border-sky-500/50 appearance-none cursor-pointer"
            >
              <option value="" className="bg-[#0b1329] text-white">Tüm Puan Türleri</option>
              <option value="SAY" className="bg-[#0b1329] text-white">SAY (Sayısal)</option>
              <option value="EA" className="bg-[#0b1329] text-white">EA (Eşit Ağırlık)</option>
              <option value="SÖZ" className="bg-[#0b1329] text-white">SÖZ (Sözel)</option>
              <option value="DİL" className="bg-[#0b1329] text-white">DİL (Yabancı Dil)</option>
              <option value="TYT" className="bg-[#0b1329] text-white">TYT (Önlisans 2 Yıllık)</option>
            </select>
          </div>

          {/* City */}
          <div className="relative">
            <MapPin className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select 
              value={city} 
              onChange={e => {
                const val = e.target.value;
                setCity(val);
                search(q, scoreType, val, uniType, sortBy);
              }}
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-8 py-3 text-white text-sm outline-none focus:border-sky-500/50 appearance-none cursor-pointer"
            >
              <option value="" className="bg-[#0b1329] text-white">Tüm Şehirler (81 İl)</option>
              {CITIES.map(c => (
                <option key={c} value={c} className="bg-[#0b1329] text-white">{c}</option>
              ))}
            </select>
          </div>

          {/* Uni Type */}
          <div className="relative">
            <Building2 className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select 
              value={uniType} 
              onChange={e => {
                const val = e.target.value;
                setUniType(val);
                search(q, scoreType, city, val, sortBy);
              }}
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-8 py-3 text-white text-sm outline-none focus:border-sky-500/50 appearance-none cursor-pointer"
            >
              <option value="" className="bg-[#0b1329] text-white">Tüm Kurumlar</option>
              <option value="Devlet" className="bg-[#0b1329] text-white">Devlet Üniversiteleri</option>
              <option value="Vakıf" className="bg-[#0b1329] text-white">Vakıf Üniversiteleri</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="relative">
            <SlidersHorizontal className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select 
              value={sortBy} 
              onChange={e => {
                const val = e.target.value;
                setSortBy(val);
                search(q, scoreType, city, uniType, val);
              }}
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-8 py-3 text-white text-sm outline-none focus:border-sky-500/50 appearance-none cursor-pointer"
            >
              <option value="base_score_desc" className="bg-[#0b1329] text-white">Taban Puan (Azalan)</option>
              <option value="ranking_asc" className="bg-[#0b1329] text-white">Başarı Sırası (En İyi Önce)</option>
              <option value="name_asc" className="bg-[#0b1329] text-white">Bölüm Adı (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="text-xs text-gray-400 flex items-center gap-2">
            <span>Listelenen: <strong className="text-white">{departments.length}</strong> sonuç</span>
            {(q || scoreType || city || uniType || sortBy !== 'base_score_desc') && (
              <span className="px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/30 text-[11px]">
                Filtre Aktif
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {(q || scoreType || city || uniType || sortBy !== 'base_score_desc') && (
              <button 
                onClick={handleResetFilters}
                className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border border-white/5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Sıfırla
              </button>
            )}
            <button 
              onClick={() => search(q, scoreType, city, uniType, sortBy)} 
              disabled={loading}
              className="px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-white rounded-xl font-bold text-sm transition-all shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_25px_rgba(14,165,233,0.45)] disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sonuçları Getir'}
            </button>
          </div>
        </div>
      </div>

      {/* Premium Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {loading ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="col-span-full flex flex-col items-center justify-center py-20 text-sky-500">
              <Loader2 className="w-10 h-10 animate-spin mb-4" />
              <p className="font-bold">YÖK Atlas Bölümleri Taranıyor...</p>
            </motion.div>
          ) : departments.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="col-span-full text-center py-20 text-gray-500 bg-white/[0.02] border border-white/5 rounded-3xl p-8">
              <div className="text-6xl mb-4">🏜️</div>
              <p className="text-xl font-bold text-gray-300">Aramanıza uygun bölüm bulunamadı</p>
              <p className="text-sm text-gray-500 mt-2">Filtrelerinizi genişletmeyi veya farklı arama terimleri kullanmayı deneyin.</p>
              <button 
                onClick={handleResetFilters}
                className="mt-5 px-6 py-2.5 bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-xl font-semibold hover:bg-sky-500/30 transition-all text-sm inline-flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Tüm Filtreleri Sıfırla
              </button>
            </motion.div>
          ) : (
            departments.map((dep, idx) => {
              const prefIndex = prefList.findIndex(p => (p.department_id || p.id) === dep.id);
              const isAdded = prefIndex !== -1;
              const baseScoreVal = Number(dep.base_score) || 0;
              const rankingVal = Number(dep.ranking) || 0;

              return (
                <motion.div 
                  key={dep.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: Math.min(idx * 0.03, 0.4) }}
                  whileHover={{ y: -4 }}
                  className={`bg-white/[0.03] border rounded-3xl p-6 transition-all shadow-lg flex flex-col relative overflow-hidden group ${
                    isAdded ? 'border-sky-500/50 bg-sky-500/[0.04]' : 'border-white/10 hover:border-sky-500/30'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                  
                  {/* Top Badges */}
                  <div className="flex justify-between items-start mb-3 relative z-10 gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2.5 py-1 bg-white/10 text-gray-200 text-xs font-bold rounded-lg inline-block">
                        {dep.score_type}
                      </span>
                      {dep.uni_type && (
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg inline-block ${
                          dep.uni_type === 'Devlet' 
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/20'
                        }`}>
                          {dep.uni_type}
                        </span>
                      )}
                      {dep.quota && (
                        <span className="px-2 py-1 bg-white/5 text-gray-400 text-[11px] rounded-lg inline-flex items-center gap-1">
                          <Users className="w-3 h-3" /> {dep.quota}
                        </span>
                      )}
                    </div>

                    {isAdded && (
                      <span className="px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/40 text-xs font-bold flex items-center gap-1 shadow-sm">
                        <Check className="w-3.5 h-3.5" /> #{prefIndex + 1}
                      </span>
                    )}
                  </div>

                  {/* Program Title */}
                  <div className="mb-4 relative z-10">
                    <h3 className="font-bold text-lg text-white leading-snug group-hover:text-sky-300 transition-colors">
                      {dep.name}
                    </h3>
                    <p className="text-sky-400 font-medium text-sm mt-1">{dep.uni_name}</p>
                    <p className="text-gray-400 text-xs flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-500" /> {dep.city || 'Belirtilmemiş'} • {dep.faculty || 'Fakülte'}
                    </p>
                  </div>

                  {/* Score & Ranking Grid */}
                  <div className="flex justify-between items-center mb-5 relative z-10 p-3.5 bg-black/40 rounded-2xl border border-white/5 mt-auto">
                    <div className="text-center flex-1">
                      <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Taban Puan</p>
                      <p className="font-extrabold text-emerald-400 text-base">
                        {baseScoreVal > 0 ? baseScoreVal.toFixed(1) : 'Dolmadı'}
                      </p>
                    </div>
                    <div className="w-px h-7 bg-white/10" />
                    <div className="text-center flex-1">
                      <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Sıralama</p>
                      <p className="font-extrabold text-purple-400 text-base">
                        {rankingVal > 0 ? rankingVal.toLocaleString('tr-TR') : '-'}
                      </p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="relative z-10 flex gap-2">
                    {isAdded ? (
                      <>
                        <button
                          onClick={() => setIsModalOpen(true)}
                          className="flex-1 py-3 px-3 rounded-2xl font-bold transition-all text-xs flex items-center justify-center gap-1.5 bg-sky-500/20 text-sky-300 border border-sky-500/40 hover:bg-sky-500/30"
                        >
                          <Check className="w-4 h-4 text-sky-400" />
                          <span>#{prefIndex + 1}. Tercihinizde</span>
                        </button>
                        <button
                          onClick={() => removeFromPreferences(dep.id)}
                          title="Listeden Kaldır"
                          className="p-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all flex items-center justify-center"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => addToPreferences(dep)}
                        className="w-full py-3.5 rounded-2xl font-bold transition-all text-sm flex items-center justify-center gap-2 bg-sky-500/10 text-sky-400 hover:bg-sky-500 hover:text-white border border-sky-500/30 hover:shadow-[0_0_20px_rgba(14,165,233,0.35)]"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Listeye Ekle</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* 24-Preference Drawer / Interactive Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl max-h-[90vh] bg-[#0c1222] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden z-10"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400 text-2xl">
                    📋
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                      2026 YKS Tercih Listem
                      <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-400 text-xs font-bold border border-sky-500/30">
                        {prefList.length} / 24
                      </span>
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Sıralamayı oklar ile değiştirebilir, listenizi panoya kopyalayabilirsiniz.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {prefList.length > 0 && (
                    <>
                      <button
                        onClick={copyListToClipboard}
                        className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-200 flex items-center gap-1.5 transition-all"
                      >
                        <Copy className="w-3.5 h-3.5 text-sky-400" />
                        {copied ? 'Kopyalandı!' : 'Kopyala'}
                      </button>
                      <button
                        onClick={clearAllPreferences}
                        className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-semibold text-rose-400 flex items-center gap-1.5 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Temizle
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Progress & Strategy Guide */}
              <div className="px-6 py-3.5 bg-black/40 border-b border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="flex-1 sm:w-48 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (prefList.length / 24) * 100)}%` }}
                    />
                  </div>
                  <span className="text-gray-400 font-medium">%{Math.round((prefList.length / 24) * 100)} Dolu</span>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-gray-400">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> 1-6 Hayal
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" /> 7-18 İdeal
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> 19-24 Garanti
                  </span>
                </div>
              </div>

              {/* Preferences List Items */}
              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {prefList.length === 0 ? (
                  <div className="text-center py-16 text-gray-500">
                    <div className="text-5xl mb-3">📝</div>
                    <p className="text-lg font-bold text-gray-300">Listeniz Henüz Boş</p>
                    <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
                      Arama ve filtreleme araçlarını kullanarak hedeflediğiniz üniversite ve bölümleri 
                      <strong className="text-sky-400"> '+ Listeye Ekle'</strong> butonuyla buraya ekleyin.
                    </p>
                  </div>
                ) : (
                  prefList.map((item, index) => {
                    const baseScore = Number(item.base_score) || 0;
                    const ranking = Number(item.ranking) || 0;
                    const deptId = item.department_id || item.id;

                    // Strategic tier badge
                    let tierColor = 'border-amber-400/40 text-amber-300 bg-amber-400/10';
                    let tierLabel = 'Hayal';
                    if (index >= 6 && index < 18) {
                      tierColor = 'border-sky-400/40 text-sky-300 bg-sky-400/10';
                      tierLabel = 'İdeal';
                    } else if (index >= 18) {
                      tierColor = 'border-emerald-400/40 text-emerald-300 bg-emerald-400/10';
                      tierLabel = 'Garanti';
                    }

                    return (
                      <motion.div
                        key={deptId}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                      >
                        {/* Left: Index & Department details */}
                        <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                          {/* Order Index */}
                          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center font-black text-white shrink-0 group-hover:border-sky-400/40 transition-colors">
                            <span className="text-xs text-gray-400">#</span>
                            <span className="text-sm leading-none">{index + 1}</span>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-bold text-white text-sm truncate">
                                {item.name}
                              </h4>
                              <span className="px-2 py-0.5 rounded bg-white/10 text-gray-300 text-[11px] font-bold">
                                {item.score_type}
                              </span>
                              <span className={`px-2 py-0.5 rounded border text-[10px] font-semibold ${tierColor}`}>
                                {tierLabel}
                              </span>
                            </div>
                            <p className="text-xs text-sky-400 truncate mt-0.5">{item.uni_name}</p>
                            <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-1">
                              <span>📍 {item.city || 'Şehir Yok'}</span>
                              <span>•</span>
                              <span>Puan: <strong className="text-emerald-400">{baseScore > 0 ? baseScore.toFixed(1) : 'Dolmadı'}</strong></span>
                              <span>•</span>
                              <span>Sıra: <strong className="text-purple-400">{ranking > 0 ? ranking.toLocaleString('tr-TR') : '-'}</strong></span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Controls (Up, Down, Delete) */}
                        <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                          <button
                            onClick={() => movePreference(index, -1)}
                            disabled={index === 0}
                            title="Yukarı Taşı"
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-25 disabled:cursor-not-allowed text-gray-300 hover:text-white transition-all border border-white/5"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => movePreference(index, 1)}
                            disabled={index === prefList.length - 1}
                            title="Aşağı Taşı"
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-25 disabled:cursor-not-allowed text-gray-300 hover:text-white transition-all border border-white/5"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeFromPreferences(deptId)}
                            title="Listeden Kaldır"
                            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-all border border-rose-500/20 ml-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 px-6 border-t border-white/10 bg-white/[0.02] flex items-center justify-between gap-4">
                <span className="text-xs text-gray-400">
                  Toplam {prefList.length} tercih kayıtlı
                </span>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs transition-all shadow-[0_0_15px_rgba(14,165,233,0.3)]"
                >
                  Tamam / Kapat
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
