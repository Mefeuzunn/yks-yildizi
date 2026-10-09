'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, ThumbsUp, MessageCircle, X, Loader2, Send, 
  Image as ImageIcon, Upload, Camera, Trash2, Maximize2, Sparkles, Filter 
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/context/ToastContext';
import { triggerHaptic } from '@/lib/haptics';
import { getShopItem } from '@/lib/shop-items';

function UserIdentityBadge({ username, avatarId, badgeId }: { username: string; avatarId?: string; badgeId?: string }) {
  const avatarItem = avatarId ? getShopItem(avatarId) : null;
  const badgeItem = badgeId ? getShopItem(badgeId) : null;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
      {avatarItem && (
        <span 
          title={avatarItem.name}
          style={{ 
            fontSize: '14px', 
            background: 'rgba(255,255,255,0.08)', 
            padding: '2px 5px', 
            borderRadius: '6px',
            border: `1px solid ${avatarItem.color}55`,
            lineHeight: 1
          }}
        >
          {avatarItem.emoji}
        </span>
      )}
      <span style={{ color: '#818cf8', fontWeight: 600 }}>@{username}</span>
      {badgeItem && (
        <span 
          title={badgeItem.name}
          style={{ 
            fontSize: '11px', 
            padding: '2px 7px', 
            borderRadius: '9999px',
            background: `${badgeItem.color}22`,
            color: badgeItem.color,
            border: `1px solid ${badgeItem.color}44`,
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px'
          }}
        >
          {badgeItem.emoji} {badgeItem.name}
        </span>
      )}
    </div>
  );
}

export default function ForumPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string>('Tümü');

  // New Post Form State
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', tag: 'Matematik', image_url: '' });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active Post & Comments State
  const [activePost, setActivePost] = useState<any | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/forum');
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Image Upload / Compression to Base64
  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Lütfen geçerli bir görsel dosyası seçin (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      toast.warning('Görsel 8MB\'dan küçük olmalıdır. Sıkıştırılıyor...');
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 1200;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          setImagePreview(compressedDataUrl);
          setNewPost(prev => ({ ...prev, image_url: compressedDataUrl }));
          toast.success('Soru görseli eklendi!');
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.title.trim() || !user) return;
    setIsSubmitting(true);
    triggerHaptic();

    try {
      const res = await fetch('/api/forum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost)
      });
      if (res.ok) {
        toast.success('Konunuz başarıyla paylaşıldı!');
        await fetchPosts();
        setIsNewPostModalOpen(false);
        setNewPost({ title: '', content: '', tag: 'Matematik', image_url: '' });
        setImagePreview(null);
      } else {
        toast.error('Konu oluşturulurken bir hata oluştu.');
      }
    } catch (e) {
      console.error(e);
      toast.error('Bağlantı hatası.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast.warning('Beğenmek için lütfen giriş yapın.');
      return;
    }
    triggerHaptic();
    
    // Optimistic update
    setPosts(posts.map(p => {
      if (p.id === postId) {
        return { ...p, likes_count: (p.likes_count || 0) + 1 };
      }
      return p;
    }));

    try {
      const res = await fetch('/api/forum/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId })
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes_count: data.likes_count } : p));
      }
    } catch (err) {
      console.error(err);
      fetchPosts();
    }
  };

  const openPostDetail = async (post: any) => {
    setActivePost(post);
    setCommentsLoading(true);
    setComments([]);
    try {
      const res = await fetch(`/api/forum/comment?postId=${post.id}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user || !activePost) return;
    setIsSubmitting(true);
    triggerHaptic();

    try {
      const res = await fetch('/api/forum/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: activePost.id, content: newComment })
      });
      if (res.ok) {
        setNewComment('');
        toast.success('Cevabınız iletildi!');
        const cRes = await fetch(`/api/forum/comment?postId=${activePost.id}`);
        if (cRes.ok) setComments(await cRes.json());
        fetchPosts();
      }
    } catch (err) {
      console.error(err);
      toast.error('Yorum gönderilemedi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const filteredPosts = selectedTag === 'Tümü' 
    ? posts 
    : posts.filter(p => p.tag === selectedTag);

  const TAGS = ['Tümü', 'Matematik', 'Fizik', 'Kimya', 'Biyoloji', 'Türkçe', 'Tarih', 'Genel', 'Rehberlik'];

  return (
    <div style={{ maxWidth: '1050px', margin: '0 auto', padding: '2rem 1rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ 
            width: '52px', height: '52px', borderRadius: '14px', 
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(168, 85, 247, 0.2))', 
            border: '1px solid rgba(139, 92, 246, 0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 24px rgba(99, 102, 241, 0.3)'
          }}>
            <MessageSquare size={26} color="#a5b4fc" />
          </div>
          <div>
            <h1 style={{ fontSize: '2rem', color: '#fff', marginBottom: '0.25rem', fontWeight: 900, letterSpacing: '-0.02em' }}>
              Topluluk Forumu
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              Çözemediğin soru fotoğraflarını yükle, arkadaşlarından yardım al ve tartış.
            </p>
          </div>
        </div>

        <button 
          onClick={() => {
            if (!user) {
              toast.warning('Konu açmak için lütfen giriş yapın.');
              return;
            }
            setIsNewPostModalOpen(true);
          }}
          className="active:scale-[0.98]"
          style={{ 
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.65rem 1.4rem', borderRadius: '12px',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
            color: '#fff', fontWeight: 800, fontSize: '0.9rem',
            border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 18px rgba(139, 92, 246, 0.45)',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          <Camera size={18} /> + Yeni Soru / Konu Aç
        </button>
      </div>

      {/* Kategori Filtreleme Çubuğu */}
      <div style={{ 
        display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.75rem', 
        marginBottom: '1.75rem', WebkitOverflowScrolling: 'touch' 
      }}>
        {TAGS.map(t => (
          <button
            key={t}
            onClick={() => setSelectedTag(t)}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '10px',
              fontSize: '0.825rem',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              border: selectedTag === t ? '1px solid rgba(139, 92, 246, 0.6)' : '1px solid rgba(255, 255, 255, 0.08)',
              background: selectedTag === t ? 'rgba(139, 92, 246, 0.25)' : 'rgba(15, 21, 35, 0.6)',
              color: selectedTag === t ? '#c084fc' : '#94a3b8',
              transition: 'all 0.2s ease'
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* İçerik Listesi */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
          <Loader2 size={36} color="#8b5cf6" className="spin" />
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="premium-card" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
          {selectedTag === 'Tümü' ? 'Henüz hiç konu açılmamış. İlk soruyu sen sor!' : `"${selectedTag}" kategorisinde henüz soru bulunmuyor.`}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <AnimatePresence>
            {filteredPosts.map((post, i) => (
              <motion.div 
                key={post.id} 
                className="premium-card" 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: 10 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => openPostDetail(post)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '1.25rem 1.5rem', 
                  cursor: 'pointer',
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(15, 21, 35, 0.75)',
                  backdropFilter: 'blur(16px)',
                  borderRadius: '16px',
                  gap: '1rem'
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                    <span style={{ 
                      fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', 
                      background: 'rgba(139, 92, 246, 0.18)', color: '#c084fc', 
                      borderRadius: '6px', border: '1px solid rgba(139, 92, 246, 0.3)' 
                    }}>
                      {post.tag}
                    </span>
                    {post.image_url && (
                      <span style={{ 
                        fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', 
                        background: 'rgba(16, 185, 129, 0.18)', color: '#34d399', 
                        borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.3)',
                        display: 'inline-flex', alignItems: 'center', gap: '4px'
                      }}>
                        <Camera size={12} /> Soru Fotoğraflı
                      </span>
                    )}
                    <h3 style={{ fontSize: '1.05rem', color: '#fff', fontWeight: 700, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {post.title}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                    <UserIdentityBadge 
                      username={post.author} 
                      avatarId={post.equipped_avatar} 
                      badgeId={post.equipped_badge} 
                    />
                    <span>•</span>
                    <span style={{ color: '#64748b' }}>{formatDate(post.created_at)}</span>
                  </div>
                </div>

                {/* Soru Görseli Küçük Önizleme (Varsa) */}
                {post.image_url && (
                  <div 
                    style={{ 
                      width: '56px', height: '56px', borderRadius: '10px', overflow: 'hidden', 
                      flexShrink: 0, border: '1px solid rgba(255,255,255,0.15)', background: '#000' 
                    }}
                  >
                    <img 
                      src={post.image_url} 
                      alt="Soru" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', color: 'var(--text-secondary)', flexShrink: 0 }}>
                  <div 
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.6rem', borderRadius: '8px', transition: 'background 0.2s' }}
                    className="like-btn"
                    onClick={(e) => handleLike(post.id, e)}
                  >
                    <ThumbsUp size={16} /> <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{post.likes_count || 0}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MessageCircle size={16} /> <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{post.replies_count || 0}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Yeni Soru / Konu Aç Modalı (Görsel Yükleme Desteği ile) */}
      <AnimatePresence>
        {isNewPostModalOpen && (
          <div style={{ 
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            background: 'rgba(0,0,0,0.85)', zIndex: 100, 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            padding: '1rem', backdropFilter: 'blur(8px)' 
          }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{ 
                background: '#0c101d', padding: '2rem', borderRadius: '20px', 
                width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto',
                border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 25px 50px rgba(0,0,0,0.7)' 
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc' }}>
                    <Camera size={20} />
                  </div>
                  <h2 style={{ fontSize: '1.35rem', color: '#fff', margin: 0, fontWeight: 800 }}>Yeni Soru / Konu Aç</h2>
                </div>
                <button onClick={() => setIsNewPostModalOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                  <X size={22} />
                </button>
              </div>
              
              <form onSubmit={handlePostSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>Ders / Branş</label>
                  <select 
                    value={newPost.tag}
                    onChange={e => setNewPost({...newPost, tag: e.target.value})}
                    className="premium-input"
                    style={{ width: '100%', background: '#131b2e', color: '#fff', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '0.6rem' }}
                  >
                    {['Matematik', 'Fizik', 'Kimya', 'Biyoloji', 'Türkçe', 'Tarih', 'Genel', 'Rehberlik'].map(t => (
                      <option key={t} value={t} style={{background: '#0f1015'}}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>Başlık</label>
                  <input 
                    type="text" 
                    value={newPost.title}
                    onChange={e => setNewPost({...newPost, title: e.target.value})}
                    className="premium-input" 
                    placeholder="Örn: 2024 AYT Türev sorusundaki bu adımı anlayamadım..."
                    required
                    style={{ width: '100%', background: '#131b2e', color: '#fff', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '0.7rem' }}
                  />
                </div>

                {/* Soru Fotoğrafı Yükleme Alanı */}
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>
                    Soru Fotoğrafı (Opsiyonel ama Tavsiye Edilir)
                  </label>
                  
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    accept="image/*" 
                    onChange={e => e.target.files?.[0] && handleImageFile(e.target.files[0])} 
                    style={{ display: 'none' }} 
                  />

                  {imagePreview ? (
                    <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(139, 92, 246, 0.4)', background: '#000' }}>
                      <img 
                        src={imagePreview} 
                        alt="Yüklenen Soru" 
                        style={{ width: '100%', maxHeight: '220px', objectFit: 'contain', display: 'block' }} 
                      />
                      <button
                        type="button"
                        onClick={() => { setImagePreview(null); setNewPost(p => ({ ...p, image_url: '' })); }}
                        style={{
                          position: 'absolute', top: '10px', right: '10px',
                          background: 'rgba(239, 68, 68, 0.85)', border: 'none',
                          color: '#fff', borderRadius: '8px', padding: '6px 10px',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700
                        }}
                      >
                        <Trash2 size={14} /> Kaldır
                      </button>
                    </div>
                  ) : (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        padding: '1.5rem', borderRadius: '12px',
                        border: '2px dashed rgba(139, 92, 246, 0.35)',
                        background: 'rgba(139, 92, 246, 0.05)',
                        textAlign: 'center', cursor: 'pointer',
                        transition: 'border-color 0.2s'
                      }}
                    >
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.15)', margin: '0 auto 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc' }}>
                        <Upload size={20} />
                      </div>
                      <div style={{ color: '#e2e8f0', fontSize: '0.875rem', fontWeight: 600 }}>Fotoğraf Seç veya Sürükle</div>
                      <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '4px' }}>PNG, JPG, WebP (Maks 8MB)</div>
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>Açıklama / Detaylar</label>
                  <textarea 
                    value={newPost.content}
                    onChange={e => setNewPost({...newPost, content: e.target.value})}
                    className="premium-input" 
                    placeholder="Soru hakkında takıldığın yeri, denediğin adımları veya fikirlerini buraya yazabilirsin..."
                    style={{ minHeight: '100px', resize: 'vertical', width: '100%', background: '#131b2e', color: '#fff', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '0.7rem' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button 
                    type="button" 
                    onClick={() => setIsNewPostModalOpen(false)}
                    style={{ padding: '0.7rem 1.25rem', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Vazgeç
                  </button>
                  <button 
                    type="submit" 
                    className="active:scale-[0.98]"
                    disabled={isSubmitting}
                    style={{ 
                      padding: '0.7rem 1.6rem', borderRadius: '10px', 
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', 
                      color: '#fff', fontWeight: 800, border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '0.5rem'
                    }}
                  >
                    {isSubmitting ? <Loader2 className="spin" size={18} /> : <Send size={18} />}
                    <span>{isSubmitting ? 'Yayınlanıyor...' : 'Konuyu Paylaş'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Soru Detayı & Yorumlar Modalı */}
      <AnimatePresence>
        {activePost && (
          <div style={{ 
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            background: 'rgba(0,0,0,0.85)', zIndex: 100, 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            padding: '1rem', backdropFilter: 'blur(8px)' 
          }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ 
                background: '#0c101d', borderRadius: '20px', 
                width: '100%', maxWidth: '820px', height: '90vh', 
                display: 'flex', flexDirection: 'column', 
                border: '1px solid rgba(255,255,255,0.12)', overflow: 'hidden',
                boxShadow: '0 25px 60px rgba(0,0,0,0.8)'
              }}
            >
              {/* Header */}
              <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: 'rgba(15, 21, 35, 0.8)' }}>
                <div style={{ flex: 1, paddingRight: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.75rem', padding: '3px 8px', background: 'rgba(139, 92, 246, 0.2)', borderRadius: '6px', color: '#c084fc', fontWeight: 800 }}>
                      {activePost.tag}
                    </span>
                    <UserIdentityBadge 
                      username={activePost.author} 
                      avatarId={activePost.equipped_avatar} 
                      badgeId={activePost.equipped_badge} 
                    />
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {formatDate(activePost.created_at)}
                    </span>
                  </div>
                  <h2 style={{ fontSize: '1.4rem', color: '#fff', margin: '0 0 0.75rem', fontWeight: 800 }}>
                    {activePost.title}
                  </h2>
                  {activePost.content && (
                    <p style={{ color: '#cbd5e1', lineHeight: 1.6, whiteSpace: 'pre-wrap', fontSize: '0.925rem', margin: 0 }}>
                      {activePost.content}
                    </p>
                  )}
                </div>
                <button 
                  onClick={() => setActivePost(null)} 
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.4rem' }}
                >
                  <X size={24} />
                </button>
              </div>

              {/* Soru Görseli Gösterimi (Varsa) */}
              {activePost.image_url && (
                <div style={{ padding: '1rem 1.5rem', background: '#060810', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#a5b4fc', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Camera size={14} /> Soru Fotoğrafı (Büyütmek için tıklayın)
                    </span>
                    <button 
                      onClick={() => setLightboxImage(activePost.image_url)}
                      style={{ background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
                    >
                      <Maximize2 size={13} /> Tam Ekran
                    </button>
                  </div>
                  <div 
                    onClick={() => setLightboxImage(activePost.image_url)}
                    style={{ 
                      maxHeight: '260px', overflow: 'hidden', borderRadius: '12px', 
                      cursor: 'zoom-in', border: '1px solid rgba(255,255,255,0.1)', background: '#000',
                      display: 'flex', justifyContent: 'center' 
                    }}
                  >
                    <img 
                      src={activePost.image_url} 
                      alt="Soru Görseli" 
                      style={{ maxHeight: '260px', width: 'auto', maxWidth: '100%', objectFit: 'contain' }} 
                    />
                  </div>
                </div>
              )}

              {/* Yorumlar Listesi */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Cevaplar & Çözümler ({comments.length})
                </div>

                {commentsLoading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                    <Loader2 size={28} color="#8b5cf6" className="spin" />
                  </div>
                ) : comments.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#64748b', padding: '3rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                    Henüz cevap yazılmamış. İlk çözümü veya ipucunu sen paylaş!
                  </div>
                ) : (
                  comments.map((c) => (
                    <div 
                      key={c.id} 
                      style={{ 
                        padding: '1.1rem 1.25rem', 
                        background: 'rgba(255,255,255,0.03)', 
                        borderRadius: '14px', 
                        border: '1px solid rgba(255,255,255,0.07)' 
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <UserIdentityBadge 
                          username={c.author} 
                          avatarId={c.equipped_avatar} 
                          badgeId={c.equipped_badge} 
                        />
                        <span style={{ color: '#64748b', fontSize: '0.75rem' }}>{formatDate(c.created_at)}</span>
                      </div>
                      <p style={{ color: '#cbd5e1', fontSize: '0.925rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', margin: 0 }}>
                        {c.content}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Yorum Yazma Formu */}
              <div style={{ padding: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15, 21, 35, 0.9)' }}>
                {user ? (
                  <form onSubmit={handleCommentSubmit} style={{ display: 'flex', gap: '0.75rem' }}>
                    <input 
                      type="text" 
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      placeholder="Sorunun çözümünü veya fikrini yaz..." 
                      className="premium-input"
                      style={{ 
                        flex: 1, background: '#131b2e', color: '#fff', 
                        border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '0.75rem 1rem' 
                      }}
                      disabled={isSubmitting}
                    />
                    <button 
                      type="submit" 
                      className="active:scale-[0.98]"
                      style={{ 
                        padding: '0 1.5rem', borderRadius: '12px', 
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', 
                        color: '#fff', fontWeight: 800, border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '0.5rem'
                      }} 
                      disabled={isSubmitting || !newComment.trim()}
                    >
                      {isSubmitting ? <Loader2 size={18} className="spin" /> : <Send size={18} />}
                      <span style={{ fontSize: '0.875rem' }}>Gönder</span>
                    </button>
                  </form>
                ) : (
                  <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>
                    Soruyu yanıtlamak ve çözüm yazmak için lütfen giriş yapın.
                  </div>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Lightbox / Tam Ekran Fotoğraf Görüntüleyici */}
      <AnimatePresence>
        {lightboxImage && (
          <div 
            onClick={() => setLightboxImage(null)}
            style={{ 
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
              background: 'rgba(0,0,0,0.92)', zIndex: 110, 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              padding: '2rem', backdropFilter: 'blur(10px)', cursor: 'zoom-out' 
            }}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.9 }}
              style={{ position: 'relative', maxWidth: '95vw', maxHeight: '95vh' }}
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setLightboxImage(null)}
                style={{ 
                  position: 'absolute', top: '-40px', right: 0, 
                  background: 'none', border: 'none', color: '#fff', cursor: 'pointer' 
                }}
              >
                <X size={28} />
              </button>
              <img 
                src={lightboxImage} 
                alt="Tam Ekran Soru" 
                style={{ maxWidth: '95vw', maxHeight: '85vh', borderRadius: '12px', boxShadow: '0 25px 60px rgba(0,0,0,0.9)', objectFit: 'contain' }} 
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .like-btn:hover { background: rgba(255,255,255,0.1) !important; color: #fff; }
      `}</style>
    </div>
  );
}
