const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/FocusTab.tsx', 'utf8');

// Add useTimer import
content = content.replace(
  /import \{[\s\S]*?\} from 'lucide-react';/,
  `$&
import { useTimer } from '@/context/TimerContext';`
);

// Remove duplicate type declarations and hooks that we moved to Context
// We can actually just replace the top part of FocusTab
const topRegex = /type Mode = 'pomodoro' \| 'shortBreak' \| 'longBreak';[\s\S]*?function useAmbientSound\(\) \{[\s\S]*?return \{ activeSound, volume, play, stop, changeVolume \};\n\}/;
content = content.replace(topRegex, `type Mode = 'pomodoro' | 'shortBreak' | 'longBreak';

const MODE_CONFIG: Record<Mode, { label: string; color: string; glow: string; minutes: number }> = {
  pomodoro:   { label: 'Odak',      color: '#8b5cf6', glow: 'rgba(139,92,246,0.35)', minutes: 25 },
  shortBreak: { label: 'Kısa Ara',  color: '#38bdf8', glow: 'rgba(56,189,248,0.35)', minutes: 5  },
  longBreak:  { label: 'Uzun Ara',  color: '#10b981', glow: 'rgba(16,185,129,0.35)', minutes: 15 },
};

const SUBJECTS = [
  { label: 'Matematik', emoji: '📐', color: '#3b82f6' },
  { label: 'Türkçe',    emoji: '📖', color: '#f59e0b' },
  { label: 'Fizik',     emoji: '⚡', color: '#ec4899' },
  { label: 'Kimya',     emoji: '🧪', color: '#10b981' },
  { label: 'Biyoloji',  emoji: '🔬', color: '#a78bfa' },
  { label: 'Tarih',     emoji: '🏛️', color: '#f97316' },
  { label: 'Coğrafya',  emoji: '🌍', color: '#14b8a6' },
  { label: 'Edebiyat',  emoji: '✍️', color: '#e879f9' },
];

const WEEKLY_DATA = [
  { day: 'Pzt', hours: 0 }, { day: 'Sal', hours: 0 }, { day: 'Çar', hours: 0 },
  { day: 'Per', hours: 0 }, { day: 'Cum', hours: 0 }, { day: 'Cmt', hours: 0 },
  { day: 'Paz', hours: 0 },
];

const AMBIENT_SOUNDS = [
  { id: 'rain',   label: 'Yağmur',    icon: <CloudRain size={18}/>, color: '#38bdf8', url: 'https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg' },
  { id: 'wind',   label: 'Rüzgar',    icon: <Wind size={18}/>,     color: '#a78bfa', url: 'https://actions.google.com/sounds/v1/weather/strong_wind.ogg' },
  { id: 'waves',  label: 'Dalga',     icon: <Waves size={18}/>,    color: '#06b6d4', url: 'https://actions.google.com/sounds/v1/water/waves_crashing_on_rock_beach.ogg' },
  { id: 'cafe',   label: 'Kafe',      icon: <Coffee size={18}/>,   color: '#f59e0b', url: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg' },
  { id: 'forest', label: 'Orman',     icon: <TreePine size={18}/>, color: '#10b981', url: 'https://actions.google.com/sounds/v1/ambiences/outdoor_summer_ambience.ogg' },
  { id: 'lofi',   label: 'Lofi',      icon: <Music size={18}/>,    color: '#ec4899', url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3' },
];

const MOTIVATIONAL_QUOTES = [
  "Başarı, her gün tekrarlanan küçük çabaların toplamıdır.",
  "Bugün yapacağın fedakarlıklar, yarının zaferleridir.",
  "Zorluklar, sıradan insanları sıradışı bir kadere hazırlar.",
  "En büyük rakibin, dünkü kendindir.",
  "Vazgeçme, başlangıç her zaman en zorudur.",
  "Her şey üstüne geliyorsa, belki de sen ters gidiyorsundur.",
  "Hedefsiz bir gemiye hiçbir rüzgar yardım edemez.",
  "Hayallerin, sınırların bittiği yerde başlar."
];`);

const mainFuncRegex = /export default function FocusTab\(\) \{[\s\S]*?const CIRC = 2 \* Math\.PI \* 120;/;
const newMainFunc = `export default function FocusTab() {
  const timer = useTimer();
  
  const [activeDay, setActiveDay] = useState(6);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);
  const [todayFocusMin, setTodayFocusMin] = useState(0);
  const [isZenMode, setIsZenMode] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);

  const CIRC = 2 * Math.PI * 120;`;

content = content.replace(mainFuncRegex, newMainFunc);

// Cleanup local interval/timer logic
const effectRegex = /const playBeep = useCallback\(\(\) => \{[\s\S]*?const statusMsg = \(\) => \{/;

const newEffect = `const playBeep = useCallback(() => {
    if (isMuted || typeof window === 'undefined') return;
    try {
      const ctx = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch(e){}
  }, [isMuted]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = timer.isRunning ? fmt(timer.timeLeft) + ' — ' + MODE_CONFIG[timer.mode].label : 'YKS Yıldızı — Odak';
    }
    return () => { if (typeof document !== 'undefined') document.title = 'YKS Yıldızı'; };
  }, [timer.isRunning, timer.timeLeft, timer.mode]);

  const completedTasks = tasks.filter(t => t.done).length;
  const maxWeekly = Math.max(...WEEKLY_DATA.map(d => d.hours));

  const statusMsg = () => {`;

content = content.replace(effectRegex, newEffect);

// Replace variables inside the JSX
content = content.replaceAll(/ambient\.activeSound/g, "timer.activeSound");
content = content.replaceAll(/ambient\.volume/g, "timer.volume");
content = content.replaceAll(/ambient\.changeVolume/g, "timer.setVolume");
content = content.replaceAll(/ambient\.play/g, "timer.playSound");
content = content.replaceAll(/ambient\.stop/g, "timer.stopSound");

content = content.replaceAll(/\{mode/g, "{timer.mode");
content = content.replaceAll(/mode ===/g, "timer.mode ===");
content = content.replaceAll(/mode \?/g, "timer.mode ?");
content = content.replaceAll(/cfg/g, "MODE_CONFIG[timer.mode]");

content = content.replaceAll(/isRunning/g, "timer.isRunning");
content = content.replaceAll(/timeLeft/g, "timer.timeLeft");
content = content.replaceAll(/totalSec/g, "timer.totalSec");
content = content.replaceAll(/pomodoroCount/g, "timer.pomodoroCount");
content = content.replaceAll(/selectedSubject/g, "timer.selectedSubject");
content = content.replaceAll(/setSelectedSubject/g, "timer.setSelectedSubject");
content = content.replaceAll(/durations/g, "timer.durations");
content = content.replaceAll(/switchMode/g, "timer.switchMode");
content = content.replaceAll(/toggle/g, "timer.toggle");
content = content.replaceAll(/reset/g, "timer.reset");
content = content.replaceAll(/skip/g, "timer.skip");
content = content.replaceAll(/saveSettings/g, "timer.saveSettings");
content = content.replaceAll(/MODE_CONFIG\[timer\.mode\.timer\.mode\]/g, "MODE_CONFIG[timer.mode]");
content = content.replaceAll(/MODE_CONFIG\[timer\.mode\]\.timer\.mode\]/g, "MODE_CONFIG[timer.mode]"); // clean up

fs.writeFileSync('src/components/dashboard/FocusTab.tsx', content);
console.log("Rewrote FocusTab to use context");
