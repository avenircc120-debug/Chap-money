import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Download, X, Smartphone } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function PWAInstallPrompt() {
  const { canInstall, install, dismiss } = usePWAInstall();
  const [visible, setVisible] = useState(false);

  // Small delay before showing to avoid flash on load
  useEffect(() => {
    if (canInstall) {
      const t = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
    }
  }, [canInstall]);

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm"
      style={{ animation: 'slide-up 0.3s ease-out' }}
    >
      <style>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translate(-50%, 20px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>

      <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-emerald-700/40"
        style={{ background: 'linear-gradient(135deg, #064e3b 0%, #065f46 60%, #047857 100%)' }}>

        {/* Dismiss */}
        <button
          onClick={() => { setVisible(false); dismiss(); }}
          className="absolute top-3 right-3 text-emerald-300 hover:text-white transition-colors"
          aria-label="Fermer"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-4 p-4 pr-8">
          {/* Icon */}
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <Smartphone size={24} className="text-emerald-300" />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm leading-tight">
              Installer Chap Money
            </p>
            <p className="text-emerald-300 text-xs mt-0.5 leading-tight">
              Accès rapide depuis votre écran d'accueil
            </p>
          </div>

          {/* Install button */}
          <button
            onClick={install}
            className="flex-shrink-0 flex items-center gap-1.5 bg-white text-emerald-900 text-xs font-bold px-3 py-2 rounded-xl hover:bg-emerald-50 active:scale-95 transition-all shadow-lg"
          >
            <Download size={13} />
            Installer
          </button>
        </div>
      </div>
    </div>
  );
}
