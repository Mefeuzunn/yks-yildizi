import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, ArrowDown, X, Save, Target, Loader2, Sparkles } from 'lucide-react';

export default function TercihListemTab() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userScores, setUserScores] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const prefRes = await fetch('/api/user/preferences');
      const prefData = await prefRes.json();
      if (prefData.list?.items) setList(prefData.list.items);

      const scoreRes = await fetch('/api/scores');
      const scoreData = await scoreRes.json();
      if (scoreData.scores?.length > 0) setUserScores(scoreData.scores[0]);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newList = [...list];
    if (direction === 'up' && index > 0) {
      const temp = newList[index - 1];
      newList[index - 1] = newList[index];
      newList[index] = temp;
    } else if (direction === 'down' && index < newList.length - 1) {
      const temp = newList[index + 1];
      newList[index + 1] = newList[index];
      newList[index] = temp;
    }
    setList(newList);
  };

  const removeItem = (index: number) => {
    setList(list.filter((_, i) => i !== index));
  };

  const saveList = async () => {
    setSaving(true);
    try {
      const departmentIds = list.map(item => item.department_id || item.id);
      await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ departmentIds })
      });
      // Optionally show a success toast here
    } catch (e) {
      console.log(e);
      alert('Hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const getChance = (dep: any) => {
    if (!userScores) return { text: 'Puan Yok', width: '0%', color: 'bg-gray-500', glow: '' };
    
    let myScore = 0;
    if (dep.score_type === 'SAY') myScore = userScores.say_score;
    else if (dep.score_type === 'EA') myScore = userScores.ea_score;
    else if (dep.score_type === 'SÖZ') myScore = userScores.soz_score;
    else if (dep.score_type === 'TYT') myScore = userScores.tyt_score;

    if (myScore === 0) return { text: 'Hesaplanmadı', width: '0%', color: 'bg-gray-500', glow: '' };

    const diff = myScore - dep.base_score;
    if (diff > 15) return { text: 'Yüksek İhtimal', width: '90%', color: 'bg-emerald-500', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.5)]' };
    if (diff > -5) return { text: 'Sınırda', width: '50%', color: 'bg-amber-500', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.5)]' };
    return { text: 'Zor', width: '20%', color: 'bg-rose-500', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.5)]' };
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -10 }} 
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <div className="absolute top-[-50px] right-[-50px] w-[300px] h-[300px] bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <span className="text-4xl">📋</span> Tercih Listem
          </h2>
          <p className="text-gray-400 mt-2">Tercihlerini sırala, yapay zeka ile kazanma şansını analiz et.</p>
        </div>
        <button 
          onClick={saveList} 
          disabled={saving || list.length === 0}
          className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {saving ? 'Kaydediliyor...' : 'Listeyi Kaydet'}
        </button>
      </div>

      {/* User Scores Banner */}
      {userScores && (
        <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 mb-8 flex flex-wrap gap-8 backdrop-blur-md shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-sky-500/20 rounded-2xl flex items-center justify-center border border-sky-500/30">
              <Target className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <div className="text-sm text-gray-400 font-bold uppercase tracking-wider mb-1">Sayısal Puanınız</div>
              <div className="text-2xl font-black text-sky-400">{userScores.say_score.toFixed(2)}</div>
            </div>
          </div>
          <div className="w-px bg-white/10 hidden md:block" />
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center border border-purple-500/30">
              <Target className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <div className="text-sm text-gray-400 font-bold uppercase tracking-wider mb-1">EA Puanınız</div>
              <div className="text-2xl font-black text-purple-400">{userScores.ea_score.toFixed(2)}</div>
            </div>
          </div>
        </div>
      )}

      {/* List Container */}
      <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 backdrop-blur-md shadow-xl min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-emerald-500">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="font-bold">Listeniz Yükleniyor...</p>
          </div>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 text-center">
            <div className="text-6xl mb-4">🪹</div>
            <p className="text-xl font-medium text-white mb-2">Listeniz şu an boş.</p>
            <p className="max-w-sm">YÖK Atlas Tercih Robotu üzerinden hedeflediğiniz bölümleri aratarak listenize ekleyebilirsiniz.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {list.map((dep, index) => {
                const chance = getChance(dep);
                return (
                  <motion.div 
                    layout
                    key={`${dep.department_id || dep.id}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col md:flex-row items-start md:items-center gap-6 p-5 bg-black/40 border border-white/5 rounded-2xl hover:bg-white/[0.04] hover:border-white/10 transition-all group"
                  >
                    {/* Rank Badge */}
                    <div className="w-12 h-12 flex-shrink-0 rounded-2xl bg-white/10 flex items-center justify-center font-black text-xl text-gray-300 border border-white/5 shadow-inner">
                      {index + 1}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="px-2 py-1 bg-white/10 text-gray-300 text-[10px] font-bold rounded uppercase tracking-wider">
                          {dep.score_type}
                        </span>
                        <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Taban: {dep.base_score.toFixed(1)}</span>
                      </div>
                      <h3 className="font-bold text-lg text-white leading-tight mb-1">{dep.name}</h3>
                      <p className="text-sky-400 text-sm font-medium">{dep.uni_name} <span className="text-gray-600 px-1">•</span> {dep.city}</p>
                    </div>

                    {/* AI Prediction Bar */}
                    <div className="w-full md:w-64">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Kazanma İhtimali</span>
                        <span className={`text-xs font-black uppercase ${chance.color.replace('bg-', 'text-')}`}>{chance.text}</span>
                      </div>
                      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: chance.width }}
                          transition={{ duration: 1, delay: 0.2 }}
                          className={`h-full rounded-full ${chance.color} ${chance.glow}`}
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-auto w-full md:w-auto justify-end mt-4 md:mt-0">
                      <div className="flex flex-row md:flex-col gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
                        <button 
                          onClick={() => moveItem(index, 'up')}
                          disabled={index === 0}
                          className={`p-2 rounded-lg transition-colors ${index === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/10 text-white'}`}
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => moveItem(index, 'down')}
                          disabled={index === list.length - 1}
                          className={`p-2 rounded-lg transition-colors ${index === list.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/10 text-white'}`}
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>
                      <button 
                        onClick={() => removeItem(index)}
                        className="p-4 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all ml-2 border border-rose-500/20 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

    </motion.div>
  );
}
