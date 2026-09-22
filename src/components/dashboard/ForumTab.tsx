import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Image as ImageIcon, MessageCircle, Heart, Loader2, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface ForumPost {
  id: string;
  user_id: string;
  username: string;
  content: string;
  subject?: string;
  likes: number;
  comment_count: number;
  liked_by_me?: boolean;
  created_at: string;
}

interface Comment {
  id: string;
  username: string;
  content: string;
  created_at: string;
}

export default function ForumTab() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/forum');
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch (_) {} finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const handlePost = async () => {
    if (!newPost.trim()) return;
    setPosting(true);
    try {
      const res = await fetch('/api/forum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newPost })
      });
      if (res.ok) {
        setNewPost('');
        fetchPosts();
      }
    } catch (_) {} finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await fetch('/api/forum/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId })
      });
      fetchPosts();
    } catch (_) {}
  };

  const loadComments = async (postId: string) => {
    if (expandedPost === postId) {
      setExpandedPost(null);
      return;
    }
    setExpandedPost(postId);
    try {
      const res = await fetch(`/api/forum/comment?postId=${postId}`);
      if (res.ok) {
        const data = await res.json();
        setComments(prev => ({ ...prev, [postId]: data.comments || [] }));
      }
    } catch (_) {}
  };

  const handleComment = async (postId: string) => {
    if (!commentText.trim()) return;
    setCommentLoading(true);
    try {
      await fetch('/api/forum/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, content: commentText })
      });
      setCommentText('');
      loadComments(postId);
      fetchPosts();
    } catch (_) {} finally {
      setCommentLoading(false);
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}dk`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}sa`;
    return `${Math.floor(hours / 24)}g`;
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}><Loader2 className="animate-spin" size={32} color="#a855f7" /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          💬 Sınıf Forumu
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.4)' }}>Soruları tartış, fikirlerini paylaş, birlikte öğren.</p>
      </div>

      {/* New Post */}
      <div style={{ backgroundColor: '#0f172a', borderRadius: 16, border: '1px solid #1e293b', padding: '1.25rem' }}>
        <textarea
          value={newPost}
          onChange={e => setNewPost(e.target.value)}
          placeholder="Aklındaki soruyu veya düşünceni paylaş..."
          rows={3}
          style={{ width: '100%', background: 'transparent', border: 'none', color: '#fff', fontSize: 14, resize: 'none', outline: 'none', lineHeight: 1.6 }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          <button onClick={handlePost} disabled={posting || !newPost.trim()} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: !newPost.trim() ? '#374151' : 'linear-gradient(135deg, #a855f7, #7c3aed)', color: '#fff', fontWeight: 600, cursor: newPost.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
            <Send size={16} /> {posting ? 'Paylaşılıyor...' : 'Paylaş'}
          </button>
        </div>
      </div>

      {/* Posts */}
      {posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#0f172a', borderRadius: 16, border: '1px solid #1e293b' }}>
          <MessageCircle size={48} color="#374151" style={{ margin: '0 auto 1rem' }} />
          <p style={{ color: '#6b7280', fontSize: 15 }}>Henüz hiç paylaşım yok. İlk gönderiyi sen at!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {posts.map(post => (
            <div key={post.id} style={{ backgroundColor: '#0f172a', borderRadius: 16, border: '1px solid #1e293b', padding: '1.25rem' }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #a855f7, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                  {post.username?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>{post.username}</span>
                    <span style={{ color: '#4b5563', fontSize: 12 }}>· {timeAgo(post.created_at)}</span>
                  </div>
                  <p style={{ color: '#d1d5db', fontSize: 14, margin: '6px 0 0', lineHeight: 1.6 }}>{post.content}</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', paddingLeft: 48 }}>
                <button onClick={() => handleLike(post.id)} style={{ background: 'none', border: 'none', color: post.liked_by_me ? '#ef4444' : '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 500 }}>
                  <Heart size={16} fill={post.liked_by_me ? '#ef4444' : 'none'} /> {post.likes || 0}
                </button>
                <button onClick={() => loadComments(post.id)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 500 }}>
                  <MessageCircle size={16} /> {post.comment_count || 0} Yorum
                  <ChevronDown size={14} style={{ transform: expandedPost === post.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>
              </div>

              {/* Comments */}
              <AnimatePresence>
                {expandedPost === post.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden', paddingLeft: 48, marginTop: 12 }}>
                    {(comments[post.id] || []).map(c => (
                      <div key={c.id} style={{ padding: '8px 0', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                        <span style={{ color: '#a855f7', fontWeight: 600, fontSize: 13 }}>{c.username}</span>
                        <span style={{ color: '#4b5563', fontSize: 12, marginLeft: 8 }}>{timeAgo(c.created_at)}</span>
                        <p style={{ color: '#d1d5db', fontSize: 13, margin: '4px 0 0' }}>{c.content}</p>
                      </div>
                    ))}
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <input value={commentText} onChange={e => setCommentText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleComment(post.id)} placeholder="Yorum yaz..." style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid #374151', background: '#1e293b', color: '#fff', fontSize: 13, outline: 'none' }} />
                      <button onClick={() => handleComment(post.id)} disabled={commentLoading} style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: '#a855f7', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                        <Send size={14} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
