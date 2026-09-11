'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Database, CheckCircle, AlertTriangle, Cloud, FileJson, Loader2 } from 'lucide-react';

export default function YokAtlasAdminPage() {
  const [file, setFile] = useState<File | null>(null);
  const [year, setYear] = useState('2026');
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setStatus({ type: null, message: '' });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.json')) {
        setFile(droppedFile);
        setStatus({ type: null, message: '' });
      } else {
        setStatus({ type: 'error', message: 'Sadece .json uzantılı dosyalar kabul edilir.' });
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setStatus({ type: null, message: '' });

    try {
      const text = await file.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        throw new Error('Geçersiz JSON formatı. Dosyanın geçerli bir JSON olduğundan emin olun.');
      }

      if (!Array.isArray(data)) {
        throw new Error('JSON dosyası bir dizi (array) içermelidir.');
      }

      const res = await fetch('/api/admin/yokatlas-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, data })
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Bir hata oluştu.');

      setStatus({ type: 'success', message: result.message });
      setFile(null);
    } catch (e: any) {
      setStatus({ type: 'error', message: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 relative pt-24 pb-12 min-h-screen" style={{ background: '#050505', color: 'white', overflow: 'hidden' }}>
      
      {/* Background Mesh Gradients */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-sky-500/20 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
          <div className="inline-flex items-center justify-center p-4 bg-sky-500/10 rounded-2xl mb-4 border border-sky-500/20 shadow-[0_0_30px_rgba(14,165,233,0.15)]">
            <Database className="w-10 h-10 text-sky-400" />
          </div>
          <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-4 tracking-tight">
            YÖK Atlas Veri Motoru
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Sistemin belkemiği olan üniversite taban puanlarını ve bölümleri tek tıkla saniyeler içinde güncelleyin. Yüksek performanslı SQLite Batch Insert teknolojisi ile binlerce veri anında yayında.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ delay: 0.1 }}
          className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden"
        >
          {/* Subtle inner glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none" />

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
              <div className="flex-1 w-full">
                <label className="block text-sm font-bold text-gray-300 mb-2 tracking-wide uppercase">YKS Veri Yılı</label>
                <div className="relative">
                  <select 
                    value={year} onChange={(e) => setYear(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-5 py-4 appearance-none outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all font-medium"
                  >
                    <option value="2026">2026-2027 Yerleştirme Verileri</option>
                    <option value="2025">2025-2026 Yerleştirme Verileri</option>
                    <option value="2024">2024-2025 Yerleştirme Verileri</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">▼</div>
                </div>
              </div>
            </div>

            {/* Drag & Drop Zone */}
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-300 ${
                isDragging ? 'border-sky-500 bg-sky-500/10' : file ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/20 bg-black/20 hover:bg-black/40 hover:border-white/30'
              }`}
            >
              <input 
                type="file" 
                accept=".json" 
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              
              <AnimatePresence mode="wait">
                {file ? (
                  <motion.div 
                    key="file-selected"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="flex flex-col items-center text-center"
                  >
                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                      <FileJson className="w-10 h-10 text-emerald-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{file.name}</h3>
                    <p className="text-emerald-400 font-medium bg-emerald-500/10 px-4 py-1 rounded-full">
                      {(file.size / 1024 / 1024).toFixed(2)} MB Hazır
                    </p>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="no-file"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="flex flex-col items-center text-center"
                  >
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-colors ${isDragging ? 'bg-sky-500/20 text-sky-400' : 'bg-white/5 text-gray-400'}`}>
                      <Cloud className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-200 mb-2">JSON Dosyasını Sürükleyin</h3>
                    <p className="text-gray-500">veya bilgisayarınızdan seçmek için tıklayın</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {status.type && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, height: 0 }} 
                  animate={{ opacity: 1, y: 0, height: 'auto' }} 
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className={`mt-6 overflow-hidden rounded-xl border ${
                    status.type === 'success' 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                  }`}
                >
                  <div className="p-4 flex items-center gap-3">
                    {status.type === 'success' ? <CheckCircle className="w-6 h-6 flex-shrink-0" /> : <AlertTriangle className="w-6 h-6 flex-shrink-0" />}
                    <span className="font-medium text-sm md:text-base">{status.message}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-10 flex justify-end">
              <button 
                onClick={handleUpload}
                disabled={!file || loading}
                className={`relative overflow-hidden px-10 py-4 rounded-xl font-bold transition-all flex items-center gap-3 ${
                  !file || loading 
                    ? 'bg-white/5 text-gray-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white shadow-[0_0_40px_rgba(14,165,233,0.3)] hover:shadow-[0_0_60px_rgba(14,165,233,0.5)] hover:-translate-y-1'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sisteme Aktarılıyor...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Veritabanına Gönder
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }}
          className="mt-12 opacity-50 hover:opacity-100 transition-opacity"
        >
          <div className="flex items-center gap-2 mb-4 text-gray-400">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <h3 className="text-sm font-bold uppercase tracking-widest">JSON Şablonu</h3>
          </div>
          <pre className="bg-black/60 p-6 rounded-2xl text-xs text-gray-300 overflow-x-auto border border-white/5 font-mono shadow-inner">
{`[
  {
    "uni_name": "Boğaziçi Üniversitesi",
    "uni_type": "Devlet",
    "city": "İstanbul",
    "dep_name": "Bilgisayar Mühendisliği (İngilizce)",
    "faculty": "Mühendislik Fakültesi",
    "score_type": "SAY",
    "base_score": 545.123,
    "ranking": 350,
    "quota": 90
  }
]`}
          </pre>
        </motion.div>

      </div>
    </div>
  );
}
