"use client";

import React, { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

export default function AnimatedCounter({ targetValue }: { targetValue: number }) {
  // Rakamın yazılacağı HTML elementini referans alıyoruz
  const ref = useRef<HTMLSpanElement>(null);
  
  // Rakamın 0'dan başlayacağını belirtiyoruz
  const motionValue = useMotionValue(0);
  
  // Sayma işleminin hızını ve akıcılığını (yaylanma hissini) ayarlıyoruz
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 100,
  });
  
  // Bileşenin ekranda görünüp görünmediğini takip ediyoruz (sadece 1 kez çalışır)
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) {
      motionValue.set(targetValue);
    }
  }, [motionValue, isInView, targetValue]);

  useEffect(() => {
    springValue.on("change", (latest) => {
      if (ref.current) {
        // Rakamları binlik ayraçlarla (örn: 8.800) formatlıyoruz
        ref.current.textContent = Intl.NumberFormat("tr-TR").format(
          Number(latest.toFixed(0))
        );
      }
    });
  }, [springValue]);

  return <span ref={ref} />;
}
