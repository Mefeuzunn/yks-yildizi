const fs = require('fs');
const p = 'src/components/dashboard/AnalysisTab.tsx';
let content = fs.readFileSync(p, 'utf8');

// KPI Cards
content = content.replace(
  "gridTemplateColumns: 'repeat(4, 1fr)'",
  "gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'"
);

// Main Charts Area
content = content.replace(
  "<div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>",
  "<div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>\n" + 
  "        {/* Inside we need to fix the children, but we'll do that using flex basis. */}"
);

// We need to inject flex styles into the children of the Main Charts Area
// 1st child: <div className="premium-card"> containing Line Chart
content = content.replace(
  "        {/* Interactive Line Chart */}\n        <div className=\"premium-card\">",
  "        {/* Interactive Line Chart */}\n        <div className=\"premium-card\" style={{ flex: '1 1 400px', minWidth: 0 }}>"
);

// 2nd child: <div className="premium-card"> containing Radial Bar Chart
content = content.replace(
  "        {/* Subject Radar/Composition */}\n        <div className=\"premium-card\">",
  "        {/* Subject Radar/Composition */}\n        <div className=\"premium-card\" style={{ flex: '1 1 300px', minWidth: 0 }}>"
);

// Bottom Area
content = content.replace(
  "<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>",
  "<div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>"
);

// AI Report child
content = content.replace(
  "        {/* AI Educator Report */}\n        <div className=\"premium-card\"",
  "        {/* AI Educator Report */}\n        <div className=\"premium-card\" style={{ flex: '1 1 300px' }}"
);

// Mistake Categories child
content = content.replace(
  "        {/* Mistake Categories */}\n        <div className=\"premium-card\">",
  "        {/* Mistake Categories */}\n        <div className=\"premium-card\" style={{ flex: '1 1 300px' }}>"
);

// Modal grids
content = content.replace(
  "gridTemplateColumns: '2fr 1fr'",
  "gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'"
);

// The remaining 'repeat(4, 1fr)' for modal inputs
content = content.replace(
  "gridTemplateColumns: 'repeat(4, 1fr)'",
  "gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))'"
);
content = content.replace(
  "gridTemplateColumns: 'repeat(4, 1fr)'",
  "gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))'"
);

fs.writeFileSync(p, content);
console.log("Fixed AnalysisTab layout");
