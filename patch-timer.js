const fs = require('fs');

const path = 'src/context/TimerContext.tsx';
let content = fs.readFileSync(path, 'utf8');

const HYDRATION_CODE = `
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('yks_timer_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.durations) setDurations(parsed.durations);
        if (parsed.mode) setMode(parsed.mode);
        if (parsed.pomodoroCount !== undefined) setPomodoroCount(parsed.pomodoroCount);
        if (parsed.selectedSubject !== undefined) setSelectedSubject(parsed.selectedSubject);
        if (parsed.pendingSession !== undefined) setPendingSession(parsed.pendingSession);
        
        if (parsed.timeLeft !== undefined && parsed.totalSec !== undefined) {
          // If it was running, adjust time based on how much time passed while away
          let adjustedTimeLeft = parsed.timeLeft;
          if (parsed.isRunning && parsed.lastTick) {
            const elapsed = Math.floor((Date.now() - parsed.lastTick) / 1000);
            adjustedTimeLeft = Math.max(0, parsed.timeLeft - elapsed);
          }
          setTimeLeft(adjustedTimeLeft);
          setTotalSec(parsed.totalSec);
          setIsRunning(parsed.isRunning && adjustedTimeLeft > 0);
        }
      }
    } catch (e) {
      console.error("Timer hydration error", e);
    }
    setIsHydrated(true);
  }, []);

  // Save to LocalStorage whenever state changes
  useEffect(() => {
    if (!isHydrated) return;
    const stateToSave = {
      durations,
      mode,
      pomodoroCount,
      selectedSubject,
      timeLeft,
      totalSec,
      isRunning,
      pendingSession,
      lastTick: isRunning ? Date.now() : null
    };
    localStorage.setItem('yks_timer_state', JSON.stringify(stateToSave));
  }, [durations, mode, pomodoroCount, selectedSubject, timeLeft, totalSec, isRunning, pendingSession, isHydrated]);
`;

// Insert the hydration code inside TimerProvider just before Sound State
content = content.replace('  // Sound State', HYDRATION_CODE + '\n  // Sound State');

// Wait! If `timeLeft` changes every second, it will hammer `localStorage`. Is that okay?
// Setting a small JSON string in localStorage every second is generally fine and widely used for simple timers.

// But wait, there is a bug. The setInterval updates timeLeft using functional update: setTimeLeft(prev => prev - 1).
// The `useEffect` will trigger every second and save it. This is exactly what we want.

fs.writeFileSync(path, content);
console.log("TimerContext patched");
