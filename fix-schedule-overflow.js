const fs = require('fs');
const p = 'src/components/dashboard/ScheduleTab.tsx';
let content = fs.readFileSync(p, 'utf8');

// The calendar area wrapper:
// <div className="premium-card p-0" style={{flex:1,overflow:'hidden',display:'flex',flexDirection:'column'}}>
content = content.replace(
  "style={{flex:1,overflow:'hidden',display:'flex',flexDirection:'column'}}",
  "style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}"
);

// Look for the specific container for the grid:
// <div style={{display:'flex',flexDirection:'column',position:'relative',height:`${SLOT_COUNT*SLOT_HEIGHT}px`}}>
content = content.replace(
  "<div style={{flex:1,overflowY:'auto'}} className=\"custom-scrollbar\">",
  "<div style={{flex:1,overflowY:'auto',overflowX:'auto'}} className=\"custom-scrollbar\">\n          <div style={{ minWidth: '700px' }}>" // force min-width so mobile can scroll horizontally
);

// We need to close the <div style={{ minWidth: '700px' }}> right after the main grid ends.
content = content.replace(
  "            </div>\n          </div>\n        </div>\n      </div>",
  "            </div>\n          </div>\n          </div>\n        </div>\n      </div>"
);

fs.writeFileSync(p, content);
console.log("Fixed schedule horizontal overflow");
