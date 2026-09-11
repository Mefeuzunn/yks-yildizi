"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ThumbsUp, MessageCircle, X, Loader2, Send } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function ForumPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', tag: 'Matematik' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [activePost, setActivePost] = useState<any | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(false);

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

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.title.trim() || !user) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/forum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost)
      });
      if (res.ok) {
        await fetchPosts();
        setIsNewPostModalOpen(false);
        setNewPost({ title: '', content: '', tag: 'Matematik' });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return alert('Beğenmek için giriş yapmalısınız');
    
    // Optimistic update
    setPosts(posts.map(p => {
      if (p.id === postId) {
        return { ...p, likes_count: p.likes_count + 1 }; // Simplistic optimistic
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
        // Sync actual count
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes_count: data.likes_count } : p));
      }
    } catch (err) {
      console.error(err);
      fetchPosts(); // revert on fail
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
    try {
      const res = await fetch('/api/forum/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: activePost.id, content: newComment })
      });
      if (res.ok) {
        setNewComment('');
        // Refresh comments
        const cRes = await fetch(`/api/forum/comment?postId=${activePost.id}`);
        if (cRes.ok) setComments(await cRes.json());
        // Refresh posts for replies_count
        fetchPosts();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageSquare size={24} color="#818cf8" />
          </div>
          <div>
            <h1 style={{ fontSize: '2rem', color: '#fff', marginBottom: '0.25rem' }}>Topluluk Forumu</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Diğer öğrencilerle tartış, sorularını sor, yardımlaş.</p>
          </div>
        </div>
        <button 
          onClick={() => {
            if (!user) return alert('Konu açmak için giriş yapmalısınız!');
            setIsNewPostModalOpen(true);
          }}
          className="btn-interactive" style={{ background: 'linear-gradient(180deg, #8b5cf6 0%, #6d28d9 100%)' }}
        >
          + Yeni Konu Aç
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <Loader2 size={32} color="#8b5cf6" className="spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="premium-card" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
          Henüz hiç konu açılmamış. İlk soruyu sen sor!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <AnimatePresence>
            {posts.map((post, i) => (
              <motion.div 
                key={post.id} 
                className="premium-card" 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: 10 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => openPostDetail(post)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem', cursor: 'pointer' }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', padding: '4px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', color: '#fff' }}>{post.tag}</span>
                    <h3 style={{ fontSize: '1.125rem', color: '#fff' }}>{post.title}</h3>
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    <span style={{ color: '#818cf8', fontWeight: 600 }}>@{post.author}</span> • {formatDate(post.created_at)}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', color: 'var(--text-secondary)' }}>
                  <div 
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', borderRadius: '8px', transition: 'background 0.2s' }}
                    className="like-btn"
                    onClick={(e) => handleLike(post.id, e)}
                  >
                    <ThumbsUp size={18} /> <span>{post.likes_count}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MessageCircle size={18} /> <span>{post.replies_count}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* New Post Modal */}
      <AnimatePresence>
        {isNewPostModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(5px)' }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{ background: '#0f1015', padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '600px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', color: '#fff' }}>Yeni Konu Aç</h2>
                <button onClick={() => setIsNewPostModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={24} /></button>
              </div>
              
              <form onSubmit={handlePostSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Ders/Etiket</label>
                  <select 
                    value={newPost.tag}
                    onChange={e => setNewPost({...newPost, tag: e.target.value})}
                    className="premium-input"
                  >
                    {['Matematik', 'Fizik', 'Kimya', 'Biyoloji', 'Türkçe', 'Tarih', 'Genel', 'Rehberlik'].map(t => <option key={t} value={t} style={{background: '#0f1015'}}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Başlık</label>
                  <input 
                    type="text" 
                    value={newPost.title}
                    onChange={e => setNewPost({...newPost, title: e.target.value})}
                    className="premium-input" 
                    placeholder="Soru veya konu başlığını kısaca yazın..."
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>İçerik (Opsiyonel)</label>
                  <textarea 
                    value={newPost.content}
                    onChange={e => setNewPost({...newPost, content: e.target.value})}
                    className="premium-input" 
                    placeholder="Detayları buraya yazabilirsiniz..."
                    style={{ minHeight: '120px', resize: 'vertical' }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button type="submit" className="btn-interactive" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="spin" size={20} /> : 'Konuyu Aç'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Post Detail & Comments Modal */}
      <AnimatePresence>
        {activePost && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(5px)' }}>
            <motion.div 
              initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}
              style={{ background: '#0f1015', borderRadius: '16px', width: '100%', maxWidth: '800px', height: '90vh', display: 'flex', flexDirection: 'column', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}
            >
              {/* Header */}
              <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: 'rgba(0,0,0,0.2)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', padding: '4px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', color: '#fff' }}>{activePost.tag}</span>
                    <span style={{ fontSize: '0.875rem', color: '#818cf8', fontWeight: 600 }}>@{activePost.author}</span>
                  </div>
                  <h2 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '1rem' }}>{activePost.title}</h2>
                  {activePost.content && (
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{activePost.content}</p>
                  )}
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
                    {formatDate(activePost.created_at)}
                  </div>
                </div>
                <button onClick={() => setActivePost(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.5rem' }}><X size={24} /></button>
              </div>

              {/* Comments Area */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {commentsLoading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><Loader2 size={24} color="#8b5cf6" className="spin" /></div>
                ) : comments.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Henüz yorum yapılmamış. İlk cevaplayan sen ol!</div>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.875rem' }}>@{c.author}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{formatDate(c.created_at)}</span>
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{c.content}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Comment Input */}
              <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }}>
                {user ? (
                  <form onSubmit={handleCommentSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
                    <input 
                      type="text" 
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      placeholder="Cevap yazın..." 
                      className="premium-input"
                      style={{ flex: 1 }}
                      disabled={isSubmitting}
                    />
                    <button type="submit" className="btn-interactive" style={{ padding: '0 1.5rem' }} disabled={isSubmitting || !newComment.trim()}>
                      {isSubmitting ? <Loader2 size={18} className="spin" /> : <Send size={18} />}
                    </button>
                  </form>
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Yorum yapmak için giriş yapmalısınız.</div>
                )}
              </div>

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
