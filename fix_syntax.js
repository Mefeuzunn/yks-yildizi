const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/FocusTab.tsx', 'utf8');

content = content.replace(/timer\.durations: Record<Mode, number>;/g, 'durations: Record<Mode, number>;');
content = content.replace(/function SettingsModal\(\{\n\s+timer\.durations, onSave, onClose/g, 'function SettingsModal({\n  durations, onSave, onClose');
content = content.replace(/const \[local, setLocal\] = useState\(\{ \.\.\.timer\.durations \}\);/g, 'const [local, setLocal] = useState({ ...durations });');

// Fix ZenModeOverlay
const zenRegex = /function ZenModeOverlay\(\{\n\s+timer\.timeLeft, timer\.totalSec, MODE_CONFIG\[timer\.mode\], timer\.isRunning, onToggle, onExit\n\}\: \{\n\s+timer\.timeLeft\: number; timer\.totalSec\: number; MODE_CONFIG\[timer\.mode\]\: typeof MODE_CONFIG\.pomodoro;\n\s+timer\.isRunning\: boolean; onToggle\: \(\) => void; onExit\: \(\) => void;\n\}\)/;
const zenFix = `function ZenModeOverlay({
  timeLeft, totalSec, cfg, isRunning, onToggle, onExit
}: {
  timeLeft: number; totalSec: number; cfg: typeof MODE_CONFIG.pomodoro;
  isRunning: boolean; onToggle: () => void; onExit: () => void;
})`;
content = content.replace(zenRegex, zenFix);

// Restore the usage of these props inside ZenModeOverlay
const zenBodyRegex = /const progress = \(\(timer\.totalSec - timer\.timeLeft\) \/ timer\.totalSec\) \* 100;/;
content = content.replace(zenBodyRegex, `const progress = ((totalSec - timeLeft) / totalSec) * 100;`);

content = content.replace(/timer\.timeLeft/g, 'timeLeft');
content = content.replace(/timer\.totalSec/g, 'totalSec');
content = content.replace(/timer\.isRunning/g, 'isRunning');
content = content.replace(/MODE_CONFIG\[timer\.mode\]/g, 'cfg');

// In FocusTab itself, I need to restore the timer variables
content = content.replace(/const timer = useTimer\(\);/g, `const timer = useTimer();
  const { timeLeft, totalSec, isRunning, mode, pomodoroCount, selectedSubject, setSelectedSubject, durations, switchMode, toggle, reset, skip, saveSettings, activeSound, volume, playSound, stopSound, setVolume } = timer;
  const cfg = MODE_CONFIG[mode];`);

fs.writeFileSync('src/components/dashboard/FocusTab.tsx', content);
console.log("Syntax fixed");
