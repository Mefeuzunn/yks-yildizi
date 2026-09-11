const fs = require('fs');

let content = fs.readFileSync('src/app/page.tsx', 'utf8');

// Add the import
if (!content.includes('import UniversityCarousel')) {
  content = content.replace("import FadeInUp from '@/components/FadeInUp';", "import FadeInUp from '@/components/FadeInUp';\nimport UniversityCarousel from '@/components/UniversityCarousel';");
}

// Extract the exact block to replace
const startMarker = "{/* Sosyal Kanıt Bölümü (Marquee) */}";
const startIndex = content.indexOf(startMarker);
const endMarker = "        </motion.div>\n\n        {/* Sağ Sütun";
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  const toReplace = content.substring(startIndex, endIndex);
  
  const newBlock = `{/* Sosyal Kanıt Bölümü (Marquee) */}
          <div className="w-full">
            <p className="text-sm text-text-muted mt-8 font-medium">
              Türkiye'nin en iyi üniversitelerine yerleşen öğrencilerin tercihi.
            </p>
            <UniversityCarousel />
          </div>
`;
  content = content.replace(toReplace, newBlock);
  fs.writeFileSync('src/app/page.tsx', content);
  console.log("Updated page.tsx with UniversityCarousel");
} else {
  console.log("Could not find block");
}

