import React, { useState, useEffect, DragEvent, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles,  Calendar as CalIcon, Clock, X, Trash2, Plus, Pencil, ChevronLeft, ChevronRight, FileText, Moon, Sun, Sunset  } from 'lucide-react';
import { useSchedule, ScheduleBlock } from '@/context/ScheduleContext';
import { useAuth } from '@/context/AuthContext';
import { getQuickSelectsByAlan } from '@/lib/subjectData';

// ─── Grid constants (Custom 18h: 07:00 - 00:00) ───────────────────────────────
const VISIBLE_HOURS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0];
const SLOT_COUNT = VISIBLE_HOURS.length; // 18
const SLOT_HEIGHT = 52;         // px per hour
const MAX_DURATION = 8;

function slotIndexToHour(index: number): number {
  if (index < 0 || index >= VISIBLE_HOURS.length) return 7;
  return VISIBLE_HOURS[index];
}

function hourToSlotIndex(hour: number): number {
  return VISIBLE_HOURS.indexOf(hour);
}

function formatHour(h: number): string {
  return `${String(h).padStart(2, '0')}:00`;
}

function getHourRangeStr(startHour: number, duration: number): string {
  const endHour = (startHour + duration) % 24;
  return `${formatHour(startHour)} → ${formatHour(endHour)}`;
}

// Which "period" a time slot belongs to (for visual striping)
function periodOf(hour: number): 'night' | 'morning' | 'afternoon' | 'evening' {
  if (hour >= 0 && hour < 6)  return 'night';
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  return 'evening';
}
const PERIOD_COLORS: Record<string, string> = {
  night:     'rgba(99,102,241,0.04)',
  morning:   'rgba(251,191,36,0.04)',
  afternoon: 'rgba(59,130,246,0.04)',
  evening:   'rgba(168,85,247,0.04)',
};

const PRESET_COLORS = [
  '#8b5cf6','#3b82f6','#10b981','#f59e0b',
  '#ef4444','#ec4899','#14b8a6','#f97316',
  '#6366f1','#84cc16','#06b6d4','#a855f7',
];

const DAYS = ['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'];

// ─── Sub-components ───────────────────────────────────────────────────────────
function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '8px', fontWeight: 600 }}>Renk</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', alignItems: 'center' }}>
        {PRESET_COLORS.map(c => (
          <button key={c} onClick={() => onChange(c)}
            style={{ width: '26px', height: '26px', borderRadius: '50%', background: c,
              border: value === c ? '3px solid #fff' : '2px solid transparent',
              outline: value === c ? '2px solid '+c : 'none',
              cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0 }}
          />
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ fontSize: '11px', color: '#6b7280' }}>Özel:</span>
          <input type="color" value={value} onChange={e => onChange(e.target.value)}
            style={{ width: '30px', height: '26px', border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '6px', cursor: 'pointer', background: 'transparent', padding: '2px' }} />
        </div>
      </div>
    </div>
  );
}

function DurationPicker({ value, onChange, color, startHour }:
  { value: number; onChange: (v: number) => void; color: string; startHour: number }) {
  const startIndex = hourToSlotIndex(startHour);
  const max = Math.min(MAX_DURATION, SLOT_COUNT - startIndex);
  
  return (
    <div>
      <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '10px', fontWeight: 600 }}>Süre</label>

      {/* Time range badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '14px', padding: '12px', background: color+'14', border: '1px solid '+color+'30', borderRadius: '12px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: 700, letterSpacing: '0.08em' }}>BAŞLANGIÇ</div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#fff', letterSpacing: '-1px' }}>{formatHour(startHour)}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: color }}>{value} Saat</div>
          <div style={{ width: '36px', height: '2px', background: 'linear-gradient(to right, '+color+', '+color+'88)', borderRadius: '99px' }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: 700, letterSpacing: '0.08em' }}>BİTİŞ</div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#fff', letterSpacing: '-1px' }}>{formatHour((startHour + value) % 24)}</div>
        </div>
      </div>

      {/* Segmented bar */}
      <div style={{ display: 'flex', gap: '3px', height: '18px', borderRadius: '6px', overflow: 'hidden', background: '#1e293b', marginBottom: '8px' }}>
        {Array.from({ length: max }).map((_, i) => (
          <div key={i} onClick={() => onChange(i+1)}
            style={{ flex: 1, background: i < value ? color : 'transparent', cursor: 'pointer',
              borderRight: i < max-1 ? '1px solid #0b0f19' : 'none', transition: 'background 0.12s' }} />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        {Array.from({ length: max }).map((_, i) => (
          <span key={i} style={{ fontSize: '9px', color: '#374151', fontWeight: 600, flex: 1, textAlign: 'center' }}>
            {formatHour(slotIndexToHour(startIndex + i + 1))}
          </span>
        ))}
      </div>

      {/* Stepper + preset pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button onClick={() => onChange(Math.max(1, value-1))} disabled={value<=1}
          style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#1e293b', border: '1px solid #374151',
            color: value>1 ? '#fff' : '#374151', cursor: value>1 ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <ChevronLeft size={16}/>
        </button>
        <div style={{ display: 'flex', flex: 1, gap: '4px' }}>
          {[1,2,3,4,5,6,7,8].filter(p => p<=max).map(p => (
            <button key={p} onClick={() => onChange(p)}
              style={{ flex: 1, padding: '7px 0', borderRadius: '8px',
                background: value===p ? color : '#1e293b',
                border: value===p ? 'none' : '1px solid #374151',
                color: value===p ? '#fff' : '#6b7280',
                fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                boxShadow: value===p ? '0 0 10px '+color+'50' : 'none',
                transition: 'all 0.15s' }}>
              {p}s
            </button>
          ))}
        </div>
        <button onClick={() => onChange(Math.min(max, value+1))} disabled={value>=max}
          style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#1e293b', border: '1px solid #374151',
            color: value<max ? '#fff' : '#374151', cursor: value<max ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <ChevronRight size={16}/>
        </button>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ScheduleTab() {
  const { blocks, addBlock, updateBlock, deleteBlock } = useSchedule();
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [currentDayView, setCurrentDayView] = useState(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);

  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth < 768) setViewMode('day');
      else setViewMode('week');
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const activeDays = viewMode === 'week' ? DAYS : [DAYS[currentDayView]];
  const cols = viewMode === 'week' ? 7 : 1;

  const { user } = useAuth();
  const QUICK_SELECTS = getQuickSelectsByAlan(user?.alan || 'Sayisal');

  const [draggedBlockId, setDraggedBlockId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen]       = useState(false);
  const [selectedCellHour, setSelectedCellHour] = useState<{ day: number; hour: number } | null>(null);
  const [customTitle, setCustomTitle]       = useState('');
  const [customNotes, setCustomNotes]       = useState('');
  const [customColor, setCustomColor]       = useState('#8b5cf6');
  const [customDuration, setCustomDuration] = useState(2);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [editBlock, setEditBlock]           = useState<ScheduleBlock | null>(null);
  const [editTitle, setEditTitle]           = useState('');
  const [editNotes, setEditNotes]           = useState('');
  const [editDuration, setEditDuration]     = useState(2);
  const [editColor, setEditColor]           = useState('#8b5cf6');
  
  // Current hour highlight
  const nowHour = new Date().getHours();
  const today   = (new Date().getDay() + 6) % 7; // 0=Pzt

  // Drag
  const handleDragStart  = (e: DragEvent<HTMLDivElement>, id: number) => { setDraggedBlockId(id); e.dataTransfer.setData('text/plain', id.toString()); e.dataTransfer.effectAllowed='move'; };
  const handleDragOver   = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.dataTransfer.dropEffect='move'; };
  const handleDrop       = (e: DragEvent<HTMLDivElement>, di: number, ti: number) => { 
    e.preventDefault(); 
    if (draggedBlockId!==null){ 
      updateBlock(draggedBlockId, {day: di, time: slotIndexToHour(ti)}); 
      setDraggedBlockId(null); 
    } 
  };
  const handleDragEnd    = () => setDraggedBlockId(null);

  const openAddModal = (di: number, ti: number) => {
    setSelectedCellHour({day: di, hour: slotIndexToHour(ti)}); 
    setCustomTitle(''); setCustomNotes(''); setCustomColor('#8b5cf6'); setCustomDuration(2); setShowCustomForm(false); setIsModalOpen(true);
  };
  const handleQuickAdd = (title: string, color: string) => {
    if (selectedCellHour) { addBlock({day:selectedCellHour.day, time:selectedCellHour.hour, duration:2, title, notes:'', color}); setIsModalOpen(false); setSelectedCellHour(null); }
  };
  const handleCustomAdd = () => {
    if (selectedCellHour && customTitle.trim()) {
      addBlock({day:selectedCellHour.day, time:selectedCellHour.hour, duration:customDuration, title:customTitle.trim(), notes:customNotes.trim(), color:customColor});
      setIsModalOpen(false); setSelectedCellHour(null); setCustomTitle(''); setCustomNotes('');
    }
  };
  const handleBlockClick = (b: ScheduleBlock) => { setEditBlock(b); setEditTitle(b.title); setEditNotes(b.notes||''); setEditDuration(b.duration); setEditColor(b.color); };

  const inputStyle: React.CSSProperties = { width:'100%', padding:'10px 14px', background:'#0b0f19', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px', color:'#fff', fontSize:'14px', outline:'none', boxSizing:'border-box' };
  const textareaStyle: React.CSSProperties = { ...inputStyle, resize:'vertical', minHeight:'80px', fontFamily:'inherit', lineHeight:1.5 };

  return (
    <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={{duration:0.2}}
      style={{display:'flex',flexDirection:'column',gap:'1.5rem',height:'100%',position:'relative'}}>

      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{fontSize:'1.8rem',fontWeight:800,color:'var(--text-primary)',marginBottom:'0.25rem',display:'flex',alignItems:'center',gap:'0.75rem'}}>
            📅 Çalışma Programı
          </h2>
          <p style={{color:'var(--text-secondary)',margin:0,fontSize:'14px'}}>
            Haftalık programını oluştur. Bloklara tıklayarak detay ekle, sürükleyerek taşı.
          </p>
        </div>
        <button 
          onClick={async () => {
            if (confirm('Yapay zeka analizlerine göre eski program silinip yepyeni bir adaptif takvim çizilecek. Onaylıyor musun?')) {
              try {
                await fetch('/api/user/calendar/generate', { method: 'POST' });
                window.location.reload();
              } catch (e) {
                alert('Hata oluştu!');
              }
            }
          }}
          style={{
            background: 'linear-gradient(135deg, #a855f7, #ec4899)',
            border: 'none', borderRadius: '12px', padding: '12px 20px',
            color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px',
            cursor: 'pointer', boxShadow: '0 4px 15px rgba(168, 85, 247, 0.4)'
          }}
        >
          <Sparkles size={18} /> Yapay Zeka Planı Çiz
        </button>
      </div>

      {/* View Toggle */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <button onClick={() => setViewMode('week')} style={{ flex: 1, padding: '8px', borderRadius: '8px', background: viewMode === 'week' ? '#3b82f6' : '#1e293b', color: '#fff', border: 'none', fontWeight: 600 }}>Haftalık Görünüm</button>
        <button onClick={() => setViewMode('day')} style={{ flex: 1, padding: '8px', borderRadius: '8px', background: viewMode === 'day' ? '#3b82f6' : '#1e293b', color: '#fff', border: 'none', fontWeight: 600 }}>Günlük Görünüm</button>
      </div>
      {viewMode === 'day' && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <button onClick={() => setCurrentDayView(prev => (prev - 1 + 7) % 7)} style={{ background: '#1e293b', border: 'none', padding: '8px 12px', borderRadius: '8px', color: '#fff' }}>Önceki Gün</button>
          <h3 style={{ margin: 0, color: '#fff' }}>{DAYS[currentDayView]}</h3>
          <button onClick={() => setCurrentDayView(prev => (prev + 1) % 7)} style={{ background: '#1e293b', border: 'none', padding: '8px 12px', borderRadius: '8px', color: '#fff' }}>Sonraki Gün</button>
        </div>
      )}



      {/* Period legend */}
      <div style={{display:'flex',gap:'16px',flexWrap:'wrap'}}>
        {[
          {label:'Sabah (06-12)', color:'#f59e0b', icon:'🌅'},
          {label:'Öğleden Sonra (12-18)', color:'#3b82f6', icon:'☀️'},
          {label:'Akşam (18-24)', color:'#a855f7', icon:'🌆'},
        ].map(p => (
          <div key={p.label} style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'11px',color:'#6b7280',fontWeight:600}}>
            <div style={{width:'10px',height:'10px',borderRadius:'3px',background:p.color+'80'}}/>
            {p.icon} {p.label}
          </div>
        ))}
      </div>

      <div className="premium-card" style={{flex:1,overflowX:'auto',userSelect:'none',padding:0}}>
        <div style={{minWidth: viewMode === 'week' ? '700px' : '100%'}}>

          {/* Header row */}
          <div style={{display:'grid',gridTemplateColumns:`52px repeat(${cols},1fr)`,borderBottom:'1px solid var(--border-strong)',position:'sticky',top:0,zIndex:20,background:'#12141c'}}>
            <div style={{borderRight:'1px solid var(--border-strong)'}}/>
            {activeDays.map((d, index) => {
              const i = viewMode === 'week' ? index : currentDayView;
              return (
              <div key={d} style={{
                padding:'10px 6px',textAlign:'center',fontWeight:700,fontSize:'12px',
                color: i===today ? '#a78bfa' : 'var(--text-primary)',
                borderRight: i<6 ? '1px solid var(--border-strong)' : 'none',
                borderBottom: i===today ? '2px solid #a78bfa' : 'none',
                background: i===today ? 'rgba(167,139,250,0.06)' : 'transparent',
              }}>
                {d}
                {i===today && <div style={{width:'5px',height:'5px',borderRadius:'50%',background:'#a78bfa',margin:'3px auto 0'}}/>}
              </div>
              );
            })}
          </div>

          {/* Scrollable body */}
          <div style={{display:'grid',gridTemplateColumns:`52px repeat(${cols},1fr)`,maxHeight:'calc(100vh - 280px)',overflowY:'auto'}} className="custom-scrollbar">

            {/* Time labels column */}
            <div style={{borderRight:'1px solid var(--border-strong)'}}>
              {VISIBLE_HOURS.map((h,i) => {
                const period = periodOf(h);
                const isNow  = h===nowHour;
                return (
                  <div key={h} style={{
                    height:`${SLOT_HEIGHT}px`,padding:'3px 6px 0',fontSize:'10px',fontWeight:700,
                    color: isNow ? '#a78bfa' : 'var(--text-secondary)',
                    textAlign:'right',
                    borderBottom: i<SLOT_COUNT-1 ? '1px solid var(--border-light)' : 'none',
                    background: PERIOD_COLORS[period],
                    position:'relative',
                  }}>
                    {formatHour(h)}
                    {isNow && <div style={{position:'absolute',right:0,top:'50%',width:'4px',height:'4px',borderRadius:'50%',background:'#a78bfa',transform:'translateY(-50%)'}}/>}
                  </div>
                );
              })}
            </div>

            {/* Grid + blocks */}
            <div style={{gridColumn:'2/-1',position:'relative',display:'grid',gridTemplateColumns:`repeat(${cols},1fr)`,gridTemplateRows:`repeat(${SLOT_COUNT},${SLOT_HEIGHT}px)`}}>

              {/* Drop zones with period coloring */}
              {Array.from({length:cols*SLOT_COUNT}).map((_,i) => {
                const di = viewMode === 'week' ? i%7 : currentDayView;
                const ti = Math.floor(i/cols);
                const hour = slotIndexToHour(ti);
                const period = periodOf(hour);
                const isCurrentHourToday = hour===nowHour && di===today;
                return (
                  <div key={i}
                    onDragOver={handleDragOver}
                    onDrop={e=>handleDrop(e,di,ti)}
                    onClick={()=>openAddModal(di,ti)}
                    style={{
                      borderBottom:'1px solid var(--border-light)',
                      borderRight:(i+1)%cols!==0?'1px solid var(--border-light)':'none',
                      cursor:'pointer',
                      background: isCurrentHourToday ? 'rgba(167,139,250,0.12)' : PERIOD_COLORS[period],
                      transition:'background 0.15s',
                    }}
                    className="hover:bg-[rgba(255,255,255,0.04)] transition-colors"
                  />
                );
              })}

              {/* "Now" indicator line (only if visible) */}
              {hourToSlotIndex(nowHour) !== -1 && (viewMode === 'week' || today === currentDayView) && (
                <div style={{
                  position:'absolute',
                  top:`${hourToSlotIndex(nowHour)*SLOT_HEIGHT + SLOT_HEIGHT/2}px`,
                  left: viewMode === 'week' ? `calc(${(today/7)*100}%)` : '0',
                  width: viewMode === 'week' ? `calc(${100/7}%)` : '100%',
                  height:'2px',
                  background:'linear-gradient(to right, #a78bfa, transparent)',
                  zIndex:15,
                  pointerEvents:'none',
                }}/>
              )}

              {/* Blocks */}
              {(viewMode === 'week' ? blocks : blocks.filter(b => b.day === currentDayView)).map(b => {
                const startIndex = hourToSlotIndex(b.time);
                if (startIndex === -1) return null; // Hide if outside visible hours
                
                return (
                  <div key={b.id} draggable
                    onDragStart={e=>handleDragStart(e,b.id)}
                    onDragEnd={handleDragEnd}
                    onClick={e=>{e.stopPropagation();handleBlockClick(b);}}
                    style={{
                      position:'absolute',
                      top:`${startIndex*SLOT_HEIGHT+3}px`,
                      left: viewMode === 'week' ? `calc(${(b.day/7)*100}% + 3px)` : '3px',
                      width: viewMode === 'week' ? `calc(${100/7}% - 6px)` : 'calc(100% - 6px)',
                      height:`${b.duration*SLOT_HEIGHT-6}px`,
                      backgroundColor:b.color+'20',
                      border:`1px solid ${b.color}45`,
                      borderLeft:`3px solid ${b.color}`,
                      borderRadius:'7px',
                      padding:'5px 7px',
                      display:'flex',flexDirection:'column',justifyContent:'space-between',
                      cursor:'grab',zIndex:10,
                      opacity:draggedBlockId===b.id?0.3:1,
                      overflow:'hidden',
                    }}
                    className="active:cursor-grabbing hover:brightness-110 transition-all"
                  >
                    <span style={{fontSize:'10px',fontWeight:700,color:'var(--text-primary)',pointerEvents:'none',lineHeight:1.3,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{b.title}</span>
                    {b.notes && b.duration>=2 && (
                      <span style={{fontSize:'9px',color:b.color,pointerEvents:'none',fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',opacity:0.85}}>
                        📝 {b.notes}
                      </span>
                    )}
                    {b.duration>=2 && (
                      <span style={{fontSize:'9px',color:b.color,display:'flex',alignItems:'center',gap:'3px',pointerEvents:'none',fontWeight:700}}>
                        <Clock size={8}/> {b.duration}s
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Add Modal ── */}
      <AnimatePresence>
        {isModalOpen && (
          <div style={{position:'fixed',inset:0,backgroundColor:'rgba(0,0,0,0.6)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(6px)'}}
            onClick={()=>setIsModalOpen(false)}>
            <motion.div initial={{scale:0.9,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.9,opacity:0}}
              onClick={e=>e.stopPropagation()}
              style={{backgroundColor:'#131827',padding:'28px',borderRadius:'24px',width:'520px',maxWidth:'95vw',border:'1px solid rgba(255,255,255,0.08)',boxShadow:'0 30px 70px rgba(0,0,0,0.5)',maxHeight:'90vh',overflowY:'auto'}}>

              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
                <h3 style={{fontSize:'18px',fontWeight:700,color:'#fff',margin:0}}>📌 Çalışma Ekle</h3>
                <button onClick={()=>setIsModalOpen(false)} style={{background:'none',border:'none',color:'#9ca3af',cursor:'pointer'}}><X size={20}/></button>
              </div>

              {selectedCellHour && (
                <div style={{color:'#9ca3af',fontSize:'13px',marginBottom:'20px',display:'flex',alignItems:'center',gap:'8px',background:'#0b0f19',padding:'10px 14px',borderRadius:'10px',border:'1px solid rgba(255,255,255,0.06)'}}>
                  <CalIcon size={13}/>
                  <span><strong style={{color:'#fff'}}>{DAYS[selectedCellHour.day]}</strong> günü <strong style={{color:'#a78bfa'}}>{formatHour(selectedCellHour.hour)}</strong> başlayarak</span>
                </div>
              )}

              {/* Quick selects */}
              <div style={{marginBottom:'20px'}}>
                <div style={{fontSize:'11px',color:'#6b7280',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'10px'}}>Hızlı Seç (2 saat)</div>
                <div style={{display:'flex',flexWrap:'wrap',gap:'7px'}}>
                  {QUICK_SELECTS.map((q,i) => (
                    <button key={i} onClick={()=>handleQuickAdd(q.title,q.color)}
                      style={{padding:'7px 12px',borderRadius:'10px',backgroundColor:q.color+'15',border:'1px solid '+q.color+'30',color:'#e2e8f0',fontSize:'12px',fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:'5px'}}>
                      <div style={{width:'7px',height:'7px',borderRadius:'50%',backgroundColor:q.color,flexShrink:0}}/>
                      {q.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'18px'}}>
                <div style={{flex:1,height:'1px',background:'rgba(255,255,255,0.07)'}}/>
                <span style={{fontSize:'11px',color:'#4b5563',fontWeight:700}}>VEYA KENDIN YAZ</span>
                <div style={{flex:1,height:'1px',background:'rgba(255,255,255,0.07)'}}/>
              </div>

              {!showCustomForm ? (
                <button onClick={()=>setShowCustomForm(true)}
                  style={{width:'100%',padding:'12px',borderRadius:'12px',background:'rgba(139,92,246,0.1)',border:'1px dashed rgba(139,92,246,0.4)',color:'#a78bfa',fontSize:'14px',fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
                  <Plus size={15}/> Özel Çalışma Ekle
                </button>
              ) : (
                <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} style={{display:'flex',flexDirection:'column',gap:'16px'}}>

                  <div>
                    <label style={{display:'block',fontSize:'12px',color:'#9ca3af',marginBottom:'7px',fontWeight:600}}>Çalışma Başlığı *</label>
                    <input type="text" placeholder="Örn: Matematik Problemler, Fizik Tekrar…"
                      value={customTitle} onChange={e=>setCustomTitle(e.target.value)}
                      onKeyDown={e=>{if(e.key==='Enter')handleCustomAdd();}} autoFocus style={inputStyle}/>
                  </div>

                  <div>
                    <label style={{display:'flex',fontSize:'12px',color:'#9ca3af',marginBottom:'7px',fontWeight:600,alignItems:'center',gap:'6px'}}>
                      <FileText size={12}/> Detay / Not <span style={{color:'#4b5563',fontWeight:500}}>(isteğe bağlı)</span>
                    </label>
                    <textarea placeholder="Konu başlıkları, sayfa aralığı, hedefler…"
                      value={customNotes} onChange={e=>setCustomNotes(e.target.value)}
                      style={textareaStyle}/>
                  </div>

                  <ColorPicker value={customColor} onChange={setCustomColor}/>

                  {selectedCellHour && (
                    <DurationPicker value={customDuration} onChange={setCustomDuration}
                      color={customColor} startHour={selectedCellHour.hour}/>
                  )}

                  <div style={{display:'flex',gap:'10px'}}>
                    <button onClick={()=>setShowCustomForm(false)}
                      style={{padding:'10px 16px',borderRadius:'12px',background:'#1e293b',border:'1px solid rgba(255,255,255,0.08)',color:'#9ca3af',cursor:'pointer',fontSize:'14px',fontWeight:600}}>İptal</button>
                    <button onClick={handleCustomAdd} disabled={!customTitle.trim()}
                      style={{flex:1,padding:'10px 16px',borderRadius:'12px',background:customTitle.trim()?customColor:'#374151',border:'none',color:'#fff',cursor:customTitle.trim()?'pointer':'not-allowed',fontSize:'14px',fontWeight:700,opacity:customTitle.trim()?1:0.5,display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',boxShadow:customTitle.trim()?'0 0 20px '+customColor+'40':'none'}}>
                      <Plus size={15}/> Ekle
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Edit Modal ── */}
      <AnimatePresence>
        {editBlock && (
          <div style={{position:'fixed',inset:0,backgroundColor:'rgba(0,0,0,0.6)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(6px)'}}
            onClick={()=>setEditBlock(null)}>
            <motion.div initial={{scale:0.9,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.9,opacity:0}}
              onClick={e=>e.stopPropagation()}
              style={{backgroundColor:'#131827',padding:'28px',borderRadius:'24px',width:'480px',maxWidth:'95vw',border:'1px solid rgba(255,255,255,0.08)',boxShadow:'0 30px 70px rgba(0,0,0,0.5)',maxHeight:'90vh',overflowY:'auto'}}>

              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
                <h3 style={{fontSize:'18px',fontWeight:700,color:'#fff',margin:0,display:'flex',alignItems:'center',gap:'8px'}}>
                  <Pencil size={14} style={{color:editColor}}/> Çalışmayı Düzenle
                </h3>
                <button onClick={()=>setEditBlock(null)} style={{background:'none',border:'none',color:'#9ca3af',cursor:'pointer'}}><X size={20}/></button>
              </div>

              {/* Time info */}
              <div style={{color:'#9ca3af',fontSize:'12px',marginBottom:'20px',padding:'10px 14px',background:'#0b0f19',borderRadius:'10px',border:'1px solid rgba(255,255,255,0.06)',display:'flex',alignItems:'center',gap:'8px'}}>
                <Clock size={13}/>
                <span>{DAYS[editBlock.day]} — <strong style={{color:'#a78bfa'}}>{getHourRangeStr(editBlock.time, editDuration)}</strong></span>
              </div>

              <div style={{display:'flex',flexDirection:'column',gap:'18px',marginBottom:'22px'}}>

                <div>
                  <label style={{display:'block',fontSize:'12px',color:'#9ca3af',marginBottom:'7px',fontWeight:600}}>Başlık</label>
                  <input type="text" value={editTitle} onChange={e=>setEditTitle(e.target.value)} style={inputStyle}/>
                </div>

                <div>
                  <label style={{display:'flex',fontSize:'12px',color:'#9ca3af',marginBottom:'7px',fontWeight:600,alignItems:'center',gap:'6px'}}>
                    <FileText size={12}/> Detay / Not <span style={{color:'#4b5563',fontWeight:500}}>(isteğe bağlı)</span>
                  </label>
                  <textarea placeholder="Konu başlıkları, sayfa aralığı, hedefler…"
                    value={editNotes} onChange={e=>setEditNotes(e.target.value)}
                    style={textareaStyle}/>
                </div>

                <DurationPicker value={editDuration} onChange={setEditDuration}
                  color={editColor} startHour={editBlock.time}/>

                <ColorPicker value={editColor} onChange={setEditColor}/>
              </div>

              <div style={{display:'flex',gap:'10px'}}>
                <button onClick={()=>{deleteBlock(editBlock.id);setEditBlock(null);}}
                  style={{padding:'10px 14px',borderRadius:'12px',backgroundColor:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.2)',color:'#ef4444',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <Trash2 size={17}/>
                </button>
                <button onClick={()=>{updateBlock(editBlock.id,{title:editTitle,duration:editDuration,color:editColor,notes:editNotes});setEditBlock(null);}}
                  style={{flex:1,padding:'10px 16px',borderRadius:'12px',backgroundColor:editColor,border:'none',color:'#fff',fontWeight:700,cursor:'pointer',fontSize:'14px',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',boxShadow:'0 0 20px '+editColor+'40'}}>
                  Kaydet
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
