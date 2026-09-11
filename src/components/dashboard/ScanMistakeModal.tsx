import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, X, Loader2, Save, Type, CheckCircle } from 'lucide-react';
import Tesseract from 'tesseract.js';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function ScanMistakeModal({ isOpen, onClose, onSaved }: Props) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [ocrText, setOcrText] = useState('');
  
  // Form fields
  const [subject, setSubject] = useState('Matematik');
  const [topic, setTopic] = useState('');
  const [options, setOptions] = useState(['', '', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('A');
  const [selectedAnswer, setSelectedAnswer] = useState('B');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const resetState = () => {
    setImageSrc(null);
    setOcrText('');
    setSubject('Matematik');
    setTopic('');
    setOptions(['', '', '', '', '']);
    setCorrectAnswer('A');
    setSelectedAnswer('B');
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setImageSrc(base64);
      await processImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const processImage = async (base64: string) => {
    setIsProcessing(true);
    try {
      // Offline OCR using Tesseract.js
      const result = await Tesseract.recognize(base64, 'tur', {
        logger: m => console.log(m)
      });
      setOcrText(result.data.text);
    } catch (error) {
      console.error('OCR Error:', error);
      alert('Fotoğraf okunurken bir hata oluştu.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!topic || !ocrText) {
      alert('Lütfen konu ve soru metnini doldurun.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        subject,
        topic,
        icerik: ocrText,
        secenekler_json: JSON.stringify(options),
        dogru_cevap: correctAnswer,
        secilen_cevap: selectedAnswer,
        cozum: '',
        image_data: imageSrc
      };

      const res = await fetch('/api/user/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        onSaved();
        handleClose();
      } else {
        alert('Kaydedilirken hata oluştu.');
      }
    } catch (err) {
      console.error(err);
      alert('Kaydedilirken hata oluştu.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ backgroundColor: '#0f172a', width: '90%', maxWidth: '600px', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e293b' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Camera size={20} color="#a855f7" /> Fotoğraftan Soru Ekle
          </h3>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="custom-scrollbar" style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          
          {!imageSrc ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', padding: '40px 20px', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '16px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(168,85,247,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7' }}>
                <Camera size={32} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: '#fff', fontWeight: 600, fontSize: '1.1rem', margin: '0 0 8px 0' }}>Soru Fotoğrafı Yükle</p>
                <p style={{ color: '#9ca3af', fontSize: '0.9rem', margin: 0 }}>Cihazının kamerasını kullan veya galeriden seç.</p>
              </div>
              <input 
                type="file" 
                accept="image/*" 
                capture="environment"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                style={{ padding: '12px 24px', backgroundColor: '#a855f7', color: '#fff', borderRadius: '12px', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Upload size={18} /> Resim Seç / Çek
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {isProcessing ? (
                <div style={{ padding: '40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', backgroundColor: 'rgba(168,85,247,0.05)', borderRadius: '16px', border: '1px solid rgba(168,85,247,0.1)' }}>
                  <Loader2 className="animate-spin" size={40} color="#a855f7" />
                  <div>
                    <h4 style={{ color: '#fff', margin: '0 0 4px 0' }}>Yapay Zeka Soruyu Okuyor...</h4>
                    <p style={{ color: '#9ca3af', fontSize: '0.85rem', margin: 0 }}>Bu işlem cihazınızda (çevrimdışı) gerçekleştiği için birkaç saniye sürebilir.</p>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <img src={imageSrc} alt="Soru" style={{ width: '100%', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#9ca3af', fontSize: '0.85rem' }}>
                        Ders
                        <select value={subject} onChange={e => setSubject(e.target.value)} style={{ padding: '10px', backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}>
                          <option value="Türkçe">Türkçe</option>
                          <option value="Matematik">Matematik</option>
                          <option value="Fizik">Fizik</option>
                          <option value="Kimya">Kimya</option>
                          <option value="Biyoloji">Biyoloji</option>
                          <option value="Tarih">Tarih</option>
                          <option value="Coğrafya">Coğrafya</option>
                        </select>
                      </label>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#9ca3af', fontSize: '0.85rem' }}>
                        Konu
                        <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="Örn: Türev" style={{ padding: '10px', backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }} />
                      </label>
                    </div>

                    <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#9ca3af', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Soru Metni (OCR ile Çıkarıldı)</span>
                      </div>
                      <textarea value={ocrText} onChange={e => setOcrText(e.target.value)} rows={5} style={{ padding: '12px', backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', fontFamily: 'inherit', resize: 'vertical' }} />
                    </label>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#9ca3af', fontSize: '0.85rem' }}>
                        Doğru Cevap
                        <select value={correctAnswer} onChange={e => setCorrectAnswer(e.target.value)} style={{ padding: '10px', backgroundColor: '#1e293b', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', borderRadius: '8px', fontWeight: 600 }}>
                          {['A', 'B', 'C', 'D', 'E'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </label>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#9ca3af', fontSize: '0.85rem' }}>
                        Senin Cevabın
                        <select value={selectedAnswer} onChange={e => setSelectedAnswer(e.target.value)} style={{ padding: '10px', backgroundColor: '#1e293b', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: '8px', fontWeight: 600 }}>
                          {['A', 'B', 'C', 'D', 'E', 'Boş'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </label>
                    </div>

                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {imageSrc && !isProcessing && (
          <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'flex-end', gap: '12px', backgroundColor: '#1e293b' }}>
            <button onClick={() => setImageSrc(null)} style={{ padding: '10px 20px', borderRadius: '10px', background: 'transparent', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.1)', fontWeight: 600, cursor: 'pointer' }}>
              Yeniden Çek
            </button>
            <button onClick={handleSave} disabled={isSaving} style={{ padding: '10px 24px', borderRadius: '10px', background: 'linear-gradient(to right, #a855f7, #8b5cf6)', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {isSaving ? 'Kaydediliyor...' : 'Deftere Kaydet'}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
