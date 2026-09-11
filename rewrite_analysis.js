const fs = require('fs');

let content = fs.readFileSync('src/components/dashboard/AnalysisTab.tsx', 'utf8');

const startStr = "  const [examsData, setExamsData] = useState({";
const endStr = "    ]\n  });";

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr, startIndex) + endStr.length;

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `
  const [examsData, setExamsData] = useState({ TYT: [], AYT: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchExams() {
      try {
        const res = await fetch('/api/user/exams');
        if (res.ok) {
          const data = await res.json();
          // Separate into TYT and AYT
          const formatted = { TYT: [], AYT: [] };
          data.forEach(exam => {
             const net = exam.totalNet || 0;
             const mapped = {
               id: exam.id,
               name: exam.name || 'Deneme Sınavı',
               date: new Date(exam.date).toLocaleDateString('tr-TR'),
               net: net,
               breakdown: { turkce: exam.turkishNet, mat: exam.mathNet, fen: exam.scienceNet, sosyal: exam.socialNet, fizik: exam.scienceNet/3, kimya: exam.scienceNet/3, biyo: exam.scienceNet/3 }
             };
             if (exam.type === 'TYT') formatted.TYT.push(mapped);
             else formatted.AYT.push(mapped);
          });
          setExamsData(formatted);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchExams();
  }, []);
  `;
  content = content.substring(0, startIndex) + replacement + content.substring(endIndex);
  fs.writeFileSync('src/components/dashboard/AnalysisTab.tsx', content);
  console.log("Successfully replaced deep mock data.");
} else {
  console.log("Could not find start or end index.");
}
