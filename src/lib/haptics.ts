/**
 * Safe mobile haptic feedback helper
 * Triggers subtle vibration on supporting devices (Android, PWA, Chrome/Firefox mobile)
 */
export function triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light') {
  if (typeof window === 'undefined' || !('vibrate' in navigator)) return;
  try {
    switch (type) {
      case 'light':
        navigator.vibrate(10);
        break;
      case 'medium':
        navigator.vibrate(20);
        break;
      case 'heavy':
        navigator.vibrate(35);
        break;
      case 'success':
        navigator.vibrate([15, 40, 20]);
        break;
      case 'warning':
      case 'error':
        navigator.vibrate([30, 50, 30]);
        break;
    }
  } catch (_) {
    // Ignore devices that block vibration without user gesture
  }
}

export const haptics = {
  selection: () => triggerHaptic('light'),
  impact: (style: 'light' | 'medium' | 'heavy' = 'medium') => triggerHaptic(style),
  notification: (type: 'success' | 'warning' | 'error' = 'success') => triggerHaptic(type),
};
