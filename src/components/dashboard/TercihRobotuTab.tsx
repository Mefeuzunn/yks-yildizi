import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Target, Plus, Check, Loader2, Sparkles } from 'lucide-react';

export default function TercihRobotuTab() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [scoreType, setScoreType] = useState('');
  const [prefList, setPrefList] = useState<any[]>([]);

  useEffect(() => {
    fetchPreferences();
    search();
  }, []);

  async function search() {
    setLoading(true);
    try {
      const res = await fetch(`/api/universities/search?q=${q}&scoreType=${scoreType}`);
      const data = await res.json();
      setDepartments(data.departments || []);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  async function fetchPreferences() {
    try {
      const res = await fetch('/api/user/preferences');
      const data = await res.json();
      if (data.list?.items) setPrefList(data.list.items);
    } catch (e) {
      console.log(e);
    }
  };

  const addToPreferences = async (deptId: string) => {
    const existingIds = prefList.map(p => p.id || p.department_id);
    if (existingIds.includes(deptId)) return;
    if (existingIds.length >= 24) return alert('En fazla 24 tercih yapabilirsiniz.');

    const newIds = [...existingIds, deptId];
    
    // Optimistic UI Update
    const dept = departments.find(d => d.id === deptId);
    if (dept) setPrefList([...prefList, { department_id: deptId, ...dept }]);

    await fetch('/api/user/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ departmentIds: newIds })
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -10 }} 
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <div className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] bg-sky-500/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <span className="text-4xl">🎓</span> YÖK Atlas Tercih Robotu
          </h2>
          <p className="text-gray-400 mt-2">Hedeflediğin bölümleri filtrele ve kendi premium tercih listeni oluştur.</p>
        </div>
        <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3 shadow-lg backdrop-blur-sm">
          <Sparkles className="w-5 h-5 text-sky-400" />
          <div className="font-bold">
            Listeniz: <span className="text-sky-400">{prefList.length}</span><span className="text-gray-500">/24</span>
          </div>
        </div>
      </div>

      {/* Modern Search Bar */}
      <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-4 mb-8 flex flex-col md:flex-row items-center gap-4 shadow-xl backdrop-blur-md">
        <div className="flex-1 w-full relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input 
            type="text" 
            placeholder="Üniversite veya Bölüm adı ara..." 
            value={q} onChange={e => setQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
            className="w-full bg-black/40 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-sky-500/50 focus:bg-sky-500/5 transition-all"
          />
        </div>
        <div className="w-full md:w-48 relative">
          <Target className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input 
            type="text" 
            placeholder="SAY, EA..." 
            value={scoreType} onChange={e => setScoreType(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
            className="w-full bg-black/40 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-sky-500/50 focus:bg-sky-500/5 transition-all uppercase"
          />
        </div>
        <button 
          onClick={search} 
          disabled={loading}
          className="w-full md:w-auto px-10 py-4 bg-sky-500 hover:bg-sky-400 text-white rounded-2xl font-bold transition-all shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_30px_rgba(14,165,233,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Filtrele'}
        </button>
      </div>

      {/* Premium Data Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {loading ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="col-span-full flex flex-col items-center justify-center py-20 text-sky-500">
              <Loader2 className="w-10 h-10 animate-spin mb-4" />
              <p className="font-bold">Bölümler Taranıyor...</p>
            </motion.div>
          ) : departments.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="col-span-full text-center py-20 text-gray-500">
              <div className="text-6xl mb-4">🏜️</div>
              <p className="text-xl font-medium">Sonuç bulunamadı, farklı kelimeler deneyin.</p>
            </motion.div>
          ) : (
            departments.map((dep, idx) => {
              const isAdded = prefList.some(p => p.department_id === dep.id);
              return (
                <motion.div 
                  key={dep.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -5 }}
                  className="bg-white/[0.03] border border-white/10 hover:border-sky-500/30 rounded-3xl p-6 transition-all shadow-lg flex flex-col relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                  
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div>
                      <span className="px-3 py-1 bg-white/10 text-gray-300 text-xs font-bold rounded-lg mb-2 inline-block">
                        {dep.score_type}
                      </span>
                      <h3 className="font-bold text-lg leading-tight mt-1">{dep.name}</h3>
                    </div>
                  </div>

                  <div className="mb-6 relative z-10">
                    <p className="text-sky-400 font-medium mb-1">{dep.uni_name}</p>
                    <p className="text-gray-500 text-sm flex items-center gap-1">
                      <MapPin className="w-4 h-4" /> {dep.city} • {dep.faculty}
                    </p>
                  </div>

                  <div className="flex justify-between items-center mb-6 relative z-10 p-4 bg-black/40 rounded-2xl border border-white/5">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Taban Puan</p>
                      <p className="font-extrabold text-emerald-400 text-lg">{dep.base_score.toFixed(1)}</p>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div className="text-center">
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Sıralama</p>
                      <p className="font-extrabold text-purple-400 text-lg">{dep.ranking.toLocaleString('tr-TR')}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => addToPreferences(dep.id)}
                    disabled={isAdded}
                    className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 relative z-10 ${
                      isAdded 
                        ? 'bg-white/5 text-gray-500 border border-white/5 cursor-not-allowed' 
                        : 'bg-sky-500/10 text-sky-400 hover:bg-sky-500 hover:text-white border border-sky-500/30'
                    }`}
                  >
                    {isAdded ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    {isAdded ? 'Listede Ekli' : 'Listeye Ekle'}
                  </button>
                </motion.div>
              )
            })
          )}
        </AnimatePresence>
      </div>

    </motion.div>
  );
}
