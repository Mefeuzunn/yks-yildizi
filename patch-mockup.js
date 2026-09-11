const fs = require('fs');

let content = fs.readFileSync('src/app/page.tsx', 'utf8');

// Add Import
if (!content.includes('import HeroMockupSlider')) {
  content = content.replace(
    "import UniversityCarousel from '@/components/UniversityCarousel';",
    "import UniversityCarousel from '@/components/UniversityCarousel';\nimport HeroMockupSlider from '@/components/HeroMockupSlider';"
  );
}

// Find start and end
const startMarker = "{/* Sağ Sütun: Animasyonlu Arayüz Kartı (Mockup) */}";
const endMarker = "</main>";

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  const toReplace = content.substring(startIndex, endIndex);
  
  const newBlock = `{/* Sağ Sütun: Animasyonlu Arayüz Kartı (Mockup) */}
        <div className="relative w-full">
          <HeroMockupSlider />
        </div>

      `;
      
  content = content.replace(toReplace, newBlock);
  fs.writeFileSync('src/app/page.tsx', content);
  console.log("Mockup replaced with HeroMockupSlider in page.tsx");
} else {
  console.log("Markers not found");
}
