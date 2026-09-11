const fs = require('fs');

let content = fs.readFileSync('src/app/page.tsx', 'utf8');

// 1. Update imports
content = content.replace(
  "import { motion } from 'framer-motion';", 
  "import { motion, AnimatePresence } from 'framer-motion';\nimport { Menu, X } from 'lucide-react';"
);

// 2. Add state and useEffect inside LandingPage
const stateCode = `  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; }
  }, [isMobileMenuOpen]);`;

content = content.replace("  const [mounted, setMounted] = useState(false);", stateCode);

// 3. Replace the header and add AnimatePresence mobile menu
const oldHeaderRegex = /\{\/\* Üst Menü \(Navbar\) \*\/\}\s*<header[\s\S]*?<\/header>/;

const newHeader = `{/* Üst Menü (Navbar) */}
      <header className="max-w-7xl w-full mx-auto px-6 py-6 flex justify-between items-center relative z-50">
        <div className="text-2xl font-heading font-extrabold text-text-heading z-50">
          YKS Yıldızı
        </div>
        
        {/* Masaüstü Menü */}
        <nav className="hidden md:flex space-x-8 font-medium">
          <Link href="/soru-coz" className="hover:text-brand transition-colors text-text-body">Soru Çöz</Link>
          <Link href="/simulasyonlar" className="hover:text-brand transition-colors text-text-body">Simülasyonlar</Link>
          <Link href="/duello" className="hover:text-brand transition-colors text-text-body">Odalar</Link>
          <Link href="/ligler" className="hover:text-brand transition-colors text-text-body">Ligler</Link>
          <Link href="/rehberlik" className="hover:text-brand transition-colors text-text-body">Rehberlik</Link>
        </nav>
        
        {/* Masaüstü Butonlar */}
        <div className="hidden md:flex items-center space-x-4">
          <Link href="/login">
            <button className="font-medium hover:text-brand transition-colors text-text-body">Giriş Yap</button>
          </Link>
          <Link href="/register">
            <button className="bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-brand/30 transition-all active:scale-95">
              Kayıt Ol
            </button>
          </Link>
        </div>

        {/* Mobil Hamburger Butonu */}
        <button 
          className="md:hidden z-50 text-text-heading p-2 focus:outline-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Menu"
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </header>

      {/* Mobil Tam Ekran Menü */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: "-100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-100%" }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed inset-0 bg-surface z-40 flex flex-col pt-24 px-6 pb-8 md:hidden"
          >
            <div className="flex flex-col space-y-6 text-xl font-heading font-semibold text-center flex-1 mt-10">
              {[
                { title: "Soru Çöz", href: "/soru-coz" },
                { title: "Simülasyonlar", href: "/simulasyonlar" },
                { title: "Odalar", href: "/duello" },
                { title: "Ligler", href: "/ligler" },
                { title: "Rehberlik", href: "/rehberlik" },
              ].map((link, index) => (
                <Link key={index} href={link.href} passHref legacyBehavior>
                  <motion.a 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + (index * 0.1) }}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-text-heading hover:text-brand transition-colors"
                  >
                    {link.title}
                  </motion.a>
                </Link>
              ))}
            </div>

            {/* Mobil Alt Butonlar */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col space-y-4 w-full mt-auto"
            >
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <button className="w-full py-4 text-text-heading font-medium border border-gray-200 rounded-xl">
                  Giriş Yap
                </button>
              </Link>
              <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                <button className="w-full py-4 bg-brand text-white font-medium rounded-xl shadow-lg shadow-brand/30">
                  Kayıt Ol
                </button>
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>`;

content = content.replace(oldHeaderRegex, newHeader);

fs.writeFileSync('src/app/page.tsx', content);
