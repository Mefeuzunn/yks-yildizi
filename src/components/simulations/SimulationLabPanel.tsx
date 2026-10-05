'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, XCircle, HelpCircle, Award, Sparkles, Send, 
  BookOpen, Bot, Lightbulb, ChevronRight, Check
} from 'lucide-react';
import { getSimulationLabData, type LabQuest } from '@/lib/simulation-quests';
import { playMelodicChime } from '@/lib/client-notifications';
import { triggerHaptic } from '@/lib/haptics';
import type { PhetSim } from '@/lib/phet-registry';

interface Props {
  sim: PhetSim;
}

export default function SimulationLabPanel({ sim }: Props) {
  const [activeTab, setActiveTab] = useState<'quests' | 'ai'>('quests');
  const labData = getSimulationLabData(sim.slug, sim.subject, sim.topic, sim.title_tr);

  // Quest states
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [completedQuestIds, setCompletedQuestIds] = useState<string[]>([]);
  const [showExplanation, setShowExplanation] = useState<Record<string, boolean>>({});
  const [xpAwarded, setXpAwarded] = useState(false);

  // AI chat states
  const [aiMessages, setAiMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: `Merhaba! Ben AstraTutor Laboratuvar Koçun 🧪 "${sim.title_tr}" simülasyonunu incelerken takıldığın her şeyi, formülleri veya ÖSYM soru tiplerini bana sorabilirsin!`
    }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Load saved progress from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`lab_quest_${sim.slug}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setCompletedQuestIds(parsed.completed || []);
        setSelectedAnswers(parsed.answers || {});
        setXpAwarded(parsed.xpAwarded || false);
      }
    } catch (_) {}
  }, [sim.slug]);

  const handleSelectOption = (quest: LabQuest, optionIndex: number) => {
    if (completedQuestIds.includes(quest.id)) return;

    setSelectedAnswers(prev => ({ ...prev, [quest.id]: optionIndex }));
    setShowExplanation(prev => ({ ...prev, [quest.id]: true }));

    const isCorrect = optionIndex === quest.correctAnswerIndex;

    if (isCorrect) {
      playMelodicChime('success');
      triggerHaptic('success');
      const nextCompleted = Array.from(new Set([...completedQuestIds, quest.id]));
      setCompletedQuestIds(nextCompleted);

      // Save to localStorage
      try {
        localStorage.setItem(`lab_quest_${sim.slug}`, JSON.stringify({
          completed: nextCompleted,
          answers: { ...selectedAnswers, [quest.id]: optionIndex },
          xpAwarded: xpAwarded || nextCompleted.length === labData.quests.length
        }));
      } catch (_) {}

      // If all quests completed, award +50 XP
      if (nextCompleted.length === labData.quests.length && !xpAwarded) {
        setXpAwarded(true);
        if (typeof window !== 'undefined') {
          import('canvas-confetti').then(m => m.default({ particleCount: 90, spread: 60, origin: { y: 0.7 } })).catch(() => {});
        }
        fetch('/api/user/xp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: 50, reason: `Deney Görevleri: ${sim.title_tr}` })
        }).catch(() => {});
      }
    } else {
      triggerHaptic('warning');
    }
  };

  const handleSendAi = async (textToSend?: string) => {
    const q = textToSend || aiInput;
    if (!q.trim() || isAiLoading) return;

    const userMsg = { role: 'user' as const, text: q };
    setAiMessages(prev => [...prev, userMsg]);
    setAiInput('');
    setIsAiLoading(true);

    try {
      const res = await fetch('/api/ai/astratutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Sen YKS ${sim.subject} öğretmenisin. Öğrenci şu an "${sim.title_tr}" (${sim.topic}) simülasyonunu inceliyor. Soru: "${q}". Öğrenciye formülleri, kavramları ve YKS sınavında nasıl çıkacağını samimi, teşvik edici ve pedagojik olarak açıkla. KaTeX formüllerini $...$ formatında yaz.`
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAiMessages(prev => [...prev, { role: 'assistant', text: data.reply || data.response || 'Tebrikler! Deneyi keşfetmeye devam et.' }]);
      } else {
        // Fallback intelligent response
        setAiMessages(prev => [...prev, {
          role: 'assistant',
          text: `"${sim.topic}" konusunda bu deney parametrelerin birbirini nasıl etkilediğini görmen için hazırlandı. Özellikle formüldeki pay ve payda ilişkilerine dikkat et; ÖSYM genelde grafik yorumlatır!`
        }]);
      }
    } catch (_) {
      setAiMessages(prev => [...prev, {
        role: 'assistant',
        text: `Harika bir soru! ${sim.title_tr} deneyinde ana kural korunum ilkeleridir. Sınavda bu konudan soru geldiğinde her zaman önce verilenleri ve istenen değişkenin diğerlerine bağımlılığını kontrol et.`
      }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const completedCount = completedQuestIds.length;
  const totalCount = labData.quests.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      backgroundColor: '#0c1322', borderRadius: '16px',
      border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden'
    }}>
      {/* Tab Header */}
      <div style={{
        display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)',
        backgroundColor: '#0f172a'
      }}>
        <button
          onClick={() => setActiveTab('quests')}
          style={{
            flex: 1, padding: '12px 14px', border: 'none', background: 'none',
            color: activeTab === 'quests' ? '#a78bfa' : '#94a3b8',
            fontWeight: 700, fontSize: '13px', cursor: 'pointer',
            borderBottom: activeTab === 'quests' ? '2px solid #8b5cf6' : '2px solid transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
          }}
        >
          <BookOpen size={16} />
          Deney Föyü & Görevler
          {completedCount > 0 && (
            <span style={{ fontSize: '11px', background: '#8b5cf6', color: '#fff', padding: '1px 6px', borderRadius: '10px' }}>
              {completedCount}/{totalCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          style={{
            flex: 1, padding: '12px 14px', border: 'none', background: 'none',
            color: activeTab === 'ai' ? '#38bdf8' : '#94a3b8',
            fontWeight: 700, fontSize: '13px', cursor: 'pointer',
            borderBottom: activeTab === 'ai' ? '2px solid #38bdf8' : '2px solid transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
          }}
        >
          <Bot size={16} />
          AstraTutor AI Koçu
        </button>
      </div>

      {/* Tab 1: Deney Görevleri */}
      {activeTab === 'quests' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Progress Bar */}
          <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Lab İlerlemesi</span>
              <span style={{ fontSize: '12px', color: '#a78bfa', fontWeight: 700 }}>
                {completedCount === totalCount ? 'Tamamlandı! 🎉 (+50 XP)' : `${completedCount} / ${totalCount} Görev`}
              </span>
            </div>
            <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, #8b5cf6, #38bdf8)', transition: 'width 0.4s ease' }} />
            </div>
          </div>

          {/* Konu Özeti & YKS İpucu */}
          <div style={{ padding: '12px 14px', background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#c4b5fd', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
              <Lightbulb size={14} color="#fcd34d" />
              ÖSYM YKS İPUCU
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: '#e2e8f0', lineHeight: 1.5 }}>
              {labData.yksTip}
            </p>
          </div>

          {/* Görev Kartları */}
          {labData.quests.map((quest) => {
            const isCompleted = completedQuestIds.includes(quest.id);
            const userChoice = selectedAnswers[quest.id];
            const hasAnswered = userChoice !== undefined;

            return (
              <div
                key={quest.id}
                style={{
                  padding: '14px',
                  borderRadius: '12px',
                  background: isCompleted ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.02)',
                  border: isCompleted ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.07)',
                  display: 'flex', flexDirection: 'column', gap: '10px'
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      width: '22px', height: '22px', borderRadius: '50%',
                      background: isCompleted ? '#10b981' : '#8b5cf6',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', fontWeight: 800, color: '#fff'
                    }}>
                      {isCompleted ? '✓' : quest.step}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#f1f5f9' }}>
                      Görev {quest.step}
                    </span>
                  </div>
                  {isCompleted && (
                    <span style={{ fontSize: '11px', color: '#6ee7b7', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Check size={13} /> Doğru
                    </span>
                  )}
                </div>

                {/* Yönerge */}
                <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', fontStyle: 'italic', lineHeight: 1.4 }}>
                  👉 {quest.instruction}
                </p>

                {/* Soru */}
                <p style={{ margin: 0, fontSize: '13px', color: '#f8fafc', fontWeight: 600, lineHeight: 1.5 }}>
                  {quest.question}
                </p>

                {/* Şıklar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {quest.options.map((opt, oIdx) => {
                    const isSelected = userChoice === oIdx;
                    const isRight = oIdx === quest.correctAnswerIndex;
                    let btnBg = 'rgba(255,255,255,0.04)';
                    let btnBorder = 'rgba(255,255,255,0.1)';
                    let btnColor = '#cbd5e1';

                    if (hasAnswered) {
                      if (isRight) {
                        btnBg = 'rgba(16,185,129,0.15)';
                        btnBorder = 'rgba(16,185,129,0.5)';
                        btnColor = '#a7f3d0';
                      } else if (isSelected) {
                        btnBg = 'rgba(239,68,68,0.15)';
                        btnBorder = 'rgba(239,68,68,0.5)';
                        btnColor = '#fca5a5';
                      }
                    }

                    return (
                      <button
                        key={oIdx}
                        onClick={() => handleSelectOption(quest, oIdx)}
                        disabled={isCompleted}
                        style={{
                          textAlign: 'left', padding: '8px 12px', borderRadius: '8px',
                          background: btnBg, border: `1px solid ${btnBorder}`, color: btnColor,
                          fontSize: '12px', cursor: isCompleted ? 'default' : 'pointer',
                          display: 'flex', alignItems: 'center', gap: '8px',
                          transition: 'all 0.2s'
                        }}
                      >
                        <span style={{
                          width: '18px', height: '18px', borderRadius: '4px',
                          background: 'rgba(255,255,255,0.08)', display: 'flex',
                          alignItems: 'center', justifyContent: 'center', fontSize: '10px',
                          fontWeight: 700, flexShrink: 0
                        }}>
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Açıklama */}
                {showExplanation[quest.id] && (
                  <div style={{
                    padding: '8px 10px', borderRadius: '8px',
                    background: userChoice === quest.correctAnswerIndex ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                    border: userChoice === quest.correctAnswerIndex ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(239,68,68,0.2)',
                    fontSize: '11px', lineHeight: 1.4, color: userChoice === quest.correctAnswerIndex ? '#6ee7b7' : '#fca5a5'
                  }}>
                    <strong>Çözüm:</strong> {quest.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: AstraTutor AI Koçu */}
      {activeTab === 'ai' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          {/* Quick Prompts */}
          <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '6px', overflowX: 'auto' }}>
            <button
              onClick={() => handleSendAi(`Bu deneyi (${sim.title_tr}) 3 maddede YKS için özetler misin?`)}
              style={{ whiteSpace: 'nowrap', padding: '4px 10px', borderRadius: '14px', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#c4b5fd', fontSize: '11px', cursor: 'pointer' }}
            >
              ⚡ 3 Maddede Özetle
            </button>
            <button
              onClick={() => handleSendAi(`Bu deneyden ÖSYM nasıl soru tipleri sorar?`)}
              style={{ whiteSpace: 'nowrap', padding: '4px 10px', borderRadius: '14px', background: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.3)', color: '#7dd3fc', fontSize: '11px', cursor: 'pointer' }}
            >
              🎯 ÖSYM Soru Tipleri
            </button>
            <button
              onClick={() => handleSendAi(`Bu konuyla ilgili bilmem gereken en önemli formül nedir?`)}
              style={{ whiteSpace: 'nowrap', padding: '4px 10px', borderRadius: '14px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7', fontSize: '11px', cursor: 'pointer' }}
            >
              📐 Temel Formül
            </button>
          </div>

          {/* Messages List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {aiMessages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '88%',
                  padding: '10px 14px',
                  borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                  backgroundColor: m.role === 'user' ? '#7c3aed' : 'rgba(255,255,255,0.06)',
                  color: '#fff', fontSize: '12px', lineHeight: 1.6,
                  border: m.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.08)'
                }}
              >
                {m.text}
              </div>
            ))}
            {isAiLoading && (
              <div style={{ alignSelf: 'flex-start', padding: '8px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', fontSize: '11px' }}>
                AstraTutor düşünüyor... 🧠
              </div>
            )}
          </div>

          {/* Input Box */}
          <div style={{ padding: '10px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '6px' }}>
            <input
              type="text"
              value={aiInput}
              onChange={e => setAiInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendAi()}
              placeholder="Simülasyon hakkında soru sor..."
              style={{
                flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '12px', outline: 'none'
              }}
            />
            <button
              onClick={() => handleSendAi()}
              disabled={isAiLoading || !aiInput.trim()}
              style={{
                backgroundColor: '#7c3aed', border: 'none', borderRadius: '8px',
                padding: '0 12px', color: '#fff', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center'
              }}
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
