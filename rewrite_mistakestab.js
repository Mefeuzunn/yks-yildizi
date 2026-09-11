const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/MistakesTab.tsx', 'utf8');

const importReplacement = `import { AlertCircle, ArrowRight, CheckCircle2, Filter, Loader2, Camera } from 'lucide-react';
import MistakeDetailModal from './MistakeDetailModal';
import ScanMistakeModal from './ScanMistakeModal';`;

content = content.replace(
  /import \{ AlertCircle, ArrowRight, CheckCircle2, Filter, Loader2 \} from 'lucide-react';\nimport MistakeDetailModal from '\.\/MistakeDetailModal';/,
  importReplacement
);

const stateReplacement = `  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [selectedMistake, setSelectedMistake] = useState<any>(null);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);`;

content = content.replace(
  /  const \[activeFilter, setActiveFilter\] = useState<string \| null>\(null\);\n  const \[selectedMistake, setSelectedMistake\] = useState<any>\(null\);/,
  stateReplacement
);

const fetchFunction = `  const fetchErrors = async () => {
    try {
      const res = await fetch('/api/user/errors');
      if (res.ok) {
        const data = await res.json();
        setMistakes(data || []);
      }
    } catch (err) {
      console.error('Failed to fetch errors', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchErrors();
  }, []);`;

content = content.replace(
  /  useEffect\(\(\) => \{\n    async function fetchErrors\(\) \{\n      try \{\n        const res = await fetch\('\/api\/user\/errors'\);\n        if \(res\.ok\) \{\n          const data = await res\.json\(\);\n          \/\/ mapped directly from student_mistakes\n          setMistakes\(data \|\| \[\]\);\n        \}\n      \} catch \(err\) \{\n        console\.error\('Failed to fetch errors', err\);\n      \} finally \{\n        setLoading\(false\);\n      \}\n    \}\n    fetchErrors\(\);\n  \}, \[\]\);/,
  fetchFunction
);

const headerReplacement = `      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            ❌ Yanlışlarım (Hata Defteri)
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.4)' }}>Deneme ve testlerde yanlış yaptığınız veya boş bıraktığınız sorular burada listelenir. Tekrar çözerek kalıcı öğrenme sağlayın.</p>
        </div>
        <button 
          onClick={() => setIsScanModalOpen(true)}
          style={{ padding: '12px 20px', backgroundColor: 'rgba(168,85,247,0.15)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.3)', borderRadius: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
          className="hover:bg-purple-500/25"
        >
          <Camera size={20} /> Fotoğraftan Ekle
        </button>
      </div>`;

content = content.replace(
  /      <div>\n        <h2 style=\{\{ fontSize: '1\.8rem', fontWeight: 800, color: '#fff', marginBottom: '0\.5rem', display: 'flex', alignItems: 'center', gap: '0\.75rem' \}\}>\n          ❌ Yanlışlarım \(Hata Defteri\)\n        <\/h2>\n        <p style=\{\{ color: 'rgba\(255,255,255,0\.4\)' \}\}>Deneme ve testlerde yanlış yaptığınız veya boş bıraktığınız sorular burada listelenir\. Tekrar çözerek kalıcı öğrenme sağlayın\.<\/p>\n      <\/div>/,
  headerReplacement
);

const modalReplacement = `      <MistakeDetailModal 
        isOpen={!!selectedMistake}
        onClose={() => setSelectedMistake(null)}
        mistakeData={selectedMistake}
      />

      <ScanMistakeModal 
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        onSaved={() => { fetchErrors(); setIsScanModalOpen(false); }}
      />`;

content = content.replace(
  /      <MistakeDetailModal \n        isOpen=\{\!\!selectedMistake\}\n        onClose=\{\(\) => setSelectedMistake\(null\)\}\n        mistakeData=\{selectedMistake\}\n      \/>/,
  modalReplacement
);

fs.writeFileSync('src/components/dashboard/MistakesTab.tsx', content);
console.log("Rewrote MistakesTab");
