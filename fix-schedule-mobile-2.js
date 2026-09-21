const fs = require('fs');
const p = 'src/components/dashboard/ScheduleTab.tsx';
let content = fs.readFileSync(p, 'utf8');

// Insert viewMode states
content = content.replace(
  "  const { blocks, addBlock, updateBlock, deleteBlock } = useSchedule();",
  "  const { blocks, addBlock, updateBlock, deleteBlock } = useSchedule();\n  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');\n  const [currentDayView, setCurrentDayView] = useState(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);\n\n  useEffect(() => {\n    const checkMobile = () => {\n      if (window.innerWidth < 768) setViewMode('day');\n      else setViewMode('week');\n    };\n    checkMobile();\n    window.addEventListener('resize', checkMobile);\n    return () => window.removeEventListener('resize', checkMobile);\n  }, []);\n\n  const activeDays = viewMode === 'week' ? DAYS : [DAYS[currentDayView]];\n  const cols = viewMode === 'week' ? 7 : 1;\n"
);

// We need to inject the View Toggle Buttons next to the Generate Plan button
content = content.replace(
  "<Sparkles size={18} /> Yapay Zeka Planı Çiz\n        </button>\n      </div>",
  "<Sparkles size={18} /> Yapay Zeka Planı Çiz\n        </button>\n      </div>\n\n      {/* View Toggle */}\n      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>\n        <button onClick={() => setViewMode('week')} style={{ flex: 1, padding: '8px', borderRadius: '8px', background: viewMode === 'week' ? '#3b82f6' : '#1e293b', color: '#fff', border: 'none', fontWeight: 600 }}>Haftalık Görünüm</button>\n        <button onClick={() => setViewMode('day')} style={{ flex: 1, padding: '8px', borderRadius: '8px', background: viewMode === 'day' ? '#3b82f6' : '#1e293b', color: '#fff', border: 'none', fontWeight: 600 }}>Günlük Görünüm</button>\n      </div>\n" + 
  "      {viewMode === 'day' && (\n        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>\n          <button onClick={() => setCurrentDayView(prev => (prev - 1 + 7) % 7)} style={{ background: '#1e293b', border: 'none', padding: '8px 12px', borderRadius: '8px', color: '#fff' }}>Önceki Gün</button>\n          <h3 style={{ margin: 0, color: '#fff' }}>{DAYS[currentDayView]}</h3>\n          <button onClick={() => setCurrentDayView(prev => (prev + 1) % 7)} style={{ background: '#1e293b', border: 'none', padding: '8px 12px', borderRadius: '8px', color: '#fff' }}>Sonraki Gün</button>\n        </div>\n      )}\n"
);

// Fix the header row mapping
content = content.replace(
  "gridTemplateColumns:'52px repeat(7,1fr)'",
  "gridTemplateColumns:`52px repeat(${cols},1fr)`"
);
// Replace both instances of gridTemplateColumns:'52px repeat(7,1fr)'
content = content.replace(
  "gridTemplateColumns:'52px repeat(7,1fr)'",
  "gridTemplateColumns:`52px repeat(${cols},1fr)`"
);

content = content.replace(
  "{DAYS.map((d,i) => (",
  "{activeDays.map((d, index) => {\n              const i = viewMode === 'week' ? index : currentDayView;\n              return ("
);
content = content.replace(
  "</div>\n            ))}",
  "</div>\n              );\n            })}"
);

// Fix minWidth for the calendar body (only apply 700px on week view)
content = content.replace(
  "<div style={{minWidth:'700px'}}>",
  "<div style={{minWidth: viewMode === 'week' ? '700px' : '100%'}}>"
);

// Fix Grid body columns mapping
content = content.replace(
  "gridTemplateColumns:'repeat(7,1fr)'",
  "gridTemplateColumns:`repeat(${cols},1fr)`"
);

// Fix Drop Zones Loop
content = content.replace(
  "Array.from({length:7*SLOT_COUNT}).map((_,i) => {",
  "Array.from({length:cols*SLOT_COUNT}).map((_,i) => {"
);

content = content.replace(
  "const di = i%7;",
  "const di = viewMode === 'week' ? i%7 : currentDayView;"
);
content = content.replace(
  "const ti = Math.floor(i/7);",
  "const ti = Math.floor(i/cols);"
);
content = content.replace(
  "borderRight:(i+1)%7!==0?'1px solid var(--border-light)':'none',",
  "borderRight:(i+1)%cols!==0?'1px solid var(--border-light)':'none',"
);

// Fix blocks left & width calculations
content = content.replace(
  "left:`calc(${(b.day/7)*100}% + 3px)`",
  "left: viewMode === 'week' ? `calc(${(b.day/7)*100}% + 3px)` : '3px'"
);
content = content.replace(
  "width:`calc(${100/7}% - 6px)`",
  "width: viewMode === 'week' ? `calc(${100/7}% - 6px)` : 'calc(100% - 6px)'"
);

// Hide blocks that are not on current day in day view
content = content.replace(
  "{blocks.map(b => {",
  "{(viewMode === 'week' ? blocks : blocks.filter(b => b.day === currentDayView)).map(b => {"
);

// "Now" indicator line calculation
content = content.replace(
  "left:`calc(${(today/7)*100}%)`",
  "left: viewMode === 'week' ? `calc(${(today/7)*100}%)` : '0'"
);
content = content.replace(
  "width:`calc(${100/7}%)`",
  "width: viewMode === 'week' ? `calc(${100/7}%)` : '100%'"
);
content = content.replace(
  "hourToSlotIndex(nowHour) !== -1 && (",
  "hourToSlotIndex(nowHour) !== -1 && (viewMode === 'week' || today === currentDayView) && ("
);

// Ensure useEffect is imported from React
content = content.replace(
  "import React, { useState, DragEvent, useRef } from 'react';",
  "import React, { useState, useEffect, DragEvent, useRef } from 'react';"
);

fs.writeFileSync(p, content);
console.log("Schedule mobile fixed version 2");
