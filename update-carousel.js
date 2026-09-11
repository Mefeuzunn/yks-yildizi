const fs = require('fs');

let content = fs.readFileSync('src/components/UniversityCarousel.tsx', 'utf8');

// Add group and pause logic
content = content.replace(
  'className="w-full overflow-hidden relative py-8 mt-12 border-t border-gray-200 logo-mask"',
  'className="w-full overflow-hidden relative py-8 mt-12 border-t border-gray-200 logo-mask group"'
);

content = content.replace(
  'className="flex whitespace-nowrap animate-marquee w-max items-center"',
  'className="flex whitespace-nowrap animate-marquee group-hover:[animation-play-state:paused] w-max items-center"'
);

// Add z-index to a tag
content = content.replace(
  'className="mx-12 flex items-center justify-center opacity-70 hover:opacity-100 hover:scale-110 transition-all duration-300 cursor-pointer"',
  'className="mx-12 flex items-center justify-center opacity-70 hover:opacity-100 hover:scale-110 transition-all duration-300 cursor-pointer relative z-50"'
);

fs.writeFileSync('src/components/UniversityCarousel.tsx', content);
console.log("Updated UniversityCarousel.tsx to pause on hover and ensure clickability");
