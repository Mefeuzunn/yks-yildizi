const fs = require('fs');

let pageContent = fs.readFileSync('src/app/page.tsx', 'utf8');
pageContent = pageContent.replace(
  'className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10"',
  'className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none"'
);
pageContent = pageContent.replace(
  'className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-brand/20 rounded-full blur-[100px]"',
  'className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-brand/20 rounded-full blur-[100px] pointer-events-none"'
);
pageContent = pageContent.replace(
  'className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px]"',
  'className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"'
);
fs.writeFileSync('src/app/page.tsx', pageContent);

let sliderContent = fs.readFileSync('src/components/HeroMockupSlider.tsx', 'utf8');
sliderContent = sliderContent.replace(
  'className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#4F46E5]/10 rounded-full blur-3xl -z-10"',
  'className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#4F46E5]/10 rounded-full blur-3xl -z-10 pointer-events-none"'
);
fs.writeFileSync('src/components/HeroMockupSlider.tsx', sliderContent);

console.log("Added pointer-events-none to decorative elements");
