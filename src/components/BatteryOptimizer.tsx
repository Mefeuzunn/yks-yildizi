"use client";

import { useEffect, useState } from 'react';

/**
 * Battery & Power Optimizer
 * - Detects tab visibility (pauses heavy CPU/GPU operations when minimized or screen locked)
 * - Detects Battery Status API (auto-activates Eco Mode if battery < 20% and unplugged)
 * - Supports manual Battery Saver override saved in localStorage
 * - Applies [data-battery-saver="true"] and pauses CSS animations on backgrounded tabs
 */
export default function BatteryOptimizer() {
  const [batterySaver, setBatterySaver] = useState<boolean>(false);

  useEffect(() => {
    // 1. Initial check from localStorage
    const savedEco = localStorage.getItem('yks_battery_saver');
    if (savedEco === 'true') {
      setBatterySaver(true);
      document.documentElement.setAttribute('data-battery-saver', 'true');
    }

    // 2. Page Visibility Guardian: Freeze animation and loops when tab is hidden / phone screen locked
    const handleVisibilityChange = () => {
      const isHidden = document.hidden;
      if (isHidden) {
        document.body.classList.add('app-backgrounded');
        window.dispatchEvent(new CustomEvent('yks:power-state', { detail: { visible: false, eco: true } }));
      } else {
        document.body.classList.remove('app-backgrounded');
        window.dispatchEvent(new CustomEvent('yks:power-state', { detail: { visible: true, eco: batterySaver } }));
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 3. Battery API detection (Chromium, Android, supported mobile browsers)
    let batteryObj: any = null;
    const handleBatteryChange = () => {
      if (!batteryObj) return;
      const isLowBattery = batteryObj.level <= 0.20 && !batteryObj.charging;
      const isManual = localStorage.getItem('yks_battery_saver') === 'true';
      const shouldEnable = isLowBattery || isManual;
      setBatterySaver(shouldEnable);
      if (shouldEnable) {
        document.documentElement.setAttribute('data-battery-saver', 'true');
      } else {
        document.documentElement.removeAttribute('data-battery-saver');
      }
      window.dispatchEvent(new CustomEvent('yks:power-state', { detail: { visible: !document.hidden, eco: shouldEnable } }));
    };

    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        batteryObj = battery;
        handleBatteryChange();
        battery.addEventListener('levelchange', handleBatteryChange);
        battery.addEventListener('chargingchange', handleBatteryChange);
      }).catch(() => {});
    }

    // 4. Custom event listener for manual UI toggle
    const handleManualToggle = (e: CustomEvent) => {
      const active = !!e.detail;
      setBatterySaver(active);
      localStorage.setItem('yks_battery_saver', active ? 'true' : 'false');
      if (active) {
        document.documentElement.setAttribute('data-battery-saver', 'true');
      } else {
        document.documentElement.removeAttribute('data-battery-saver');
      }
      window.dispatchEvent(new CustomEvent('yks:power-state', { detail: { visible: !document.hidden, eco: active } }));
    };

    window.addEventListener('yks:toggle-battery-saver' as any, handleManualToggle);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('yks:toggle-battery-saver' as any, handleManualToggle);
      if (batteryObj) {
        batteryObj.removeEventListener('levelchange', handleBatteryChange);
        batteryObj.removeEventListener('chargingchange', handleBatteryChange);
      }
    };
  }, [batterySaver]);

  return null;
}

/**
 * React hook to observe power state (visibility and eco/battery saver status)
 */
export function usePowerState() {
  const [state, setState] = useState<{ visible: boolean; eco: boolean }>({
    visible: typeof document !== 'undefined' ? !document.hidden : true,
    eco: typeof document !== 'undefined' ? document.documentElement.getAttribute('data-battery-saver') === 'true' : false,
  });

  useEffect(() => {
    const handlePower = (e: any) => {
      if (e.detail) {
        setState({ visible: e.detail.visible, eco: e.detail.eco });
      }
    };
    window.addEventListener('yks:power-state' as any, handlePower);
    return () => window.removeEventListener('yks:power-state' as any, handlePower);
  }, []);

  return state;
}

/**
 * Helper to programmatically toggle battery saver mode
 */
export function toggleBatterySaver(enable?: boolean): boolean {
  if (typeof window === 'undefined') return false;
  const current = localStorage.getItem('yks_battery_saver') === 'true';
  const target = enable !== undefined ? enable : !current;
  window.dispatchEvent(new CustomEvent('yks:toggle-battery-saver', { detail: target }));
  return target;
}
