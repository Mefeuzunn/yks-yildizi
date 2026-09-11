const fs = require('fs');
let content = fs.readFileSync('src/app/simulasyonlar/page.tsx', 'utf8');

if (!content.includes("import { useRouter }")) {
  content = content.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\nimport { useRouter } from 'next/navigation';");
}

if (!content.includes("const router = useRouter();")) {
  content = content.replace("export default function SimulationsPage() {", "export default function SimulationsPage() {\n  const router = useRouter();");
}

content = content.replace(
  "onClick={() => setActiveSimulation(sim)}",
  "onClick={() => { if (sim.source_url.startsWith('/')) { window.location.href = sim.source_url; } else { setActiveSimulation(sim); } }}"
);

fs.writeFileSync('src/app/simulasyonlar/page.tsx', content);
console.log("Updated Simulasyonlar Page routing");
