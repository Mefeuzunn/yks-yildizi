const fs = require('fs');
const path = 'src/context/TimerContext.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace the strict 0 check to at least 1 second if it was running and time expired
content = content.replace(
  'adjustedTimeLeft = Math.max(0, parsed.timeLeft - elapsed);',
  'adjustedTimeLeft = Math.max(1, parsed.timeLeft - elapsed);'
);

fs.writeFileSync(path, content);
console.log("TimerContext patched again for seamless session completion");
