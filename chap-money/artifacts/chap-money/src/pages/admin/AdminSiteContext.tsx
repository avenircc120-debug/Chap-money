import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Check, ChevronDown, Globe, Search, X } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const SELECTED_SITE_KEY = "chap_admin_selected_site";

export interface AdminSite {
  id: string;
  siteName: string;
  isActive: boolean;
}

interface SiteContextValue {
  sites: AdminSite[];
  selectedSiteName: string;
  setSelectedSiteName: (siteName: string) => void;
}

const SiteContext = createContext<SiteContextValue | null>(null);

export function AdminSiteProvider({ children }: { children: ReactNode }) {
  const { authFetch } = useAdminAuth();
  const [sites, setSites] = useState<AdminSite[]>([]);
  const [selectedSiteName, setSelectedState] = useState(
    () => localStorage.getItem(SELECTED_SITE_KEY) ?? "",
  );

  useEffect(() => {
    authFetch(`${API_BASE}/api/credentials`)
      .then((response) => (response.ok ? response.json() : []))
      .then((data: AdminSite[]) => setSites(Array.isArray(data) ? data : []))
      .catch(() => setSites([]));
  }, [authFetch]);

  function setSelectedSiteName(siteName: string) {
    setSelectedState(siteName);
    if (siteName) localStorage.setItem(SELECTED_SITE_KEY, siteName);
    else localStorage.removeItem(SELECTED_SITE_KEY);
  }

  return (
    <SiteContext.Provider value={{ sites, selectedSiteName, setSelectedSiteName }}>
      {children}
    </SiteContext.Provider>
  );
}

export function useAdminSite() {
  const context = useContext(SiteContext);
  if (!context) throw new Error("useAdminSite doit être utilisé dans AdminSiteProvider");
  return context;
}

export function AdminSiteSelector() {
  const { sites, selectedSiteName, setSelectedSiteName } = useAdminSite();
  const [query, setQuery] = useState(selectedSiteName);
  const [open, setOpen] = useState(false);
  const filtered = useMemo(
    () => sites.filter((site) => site.siteName.toLowerCase().includes(query.toLowerCase())),
    [sites, query],
  );

  function choose(siteName: string) {
    setSelectedSiteName(siteName);
    setQuery(siteName);
    setOpen(false);
  }

  return (
    <div className="relative w-full max-w-xs">
      <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/15 px-3 py-2">
        <Search className="h-4 w-4 shrink-0 text-white/75" />
        <input
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(event) => { setQuery(event.target.value); setOpen(true); }}
          placeholder="Rechercher un site…"
          className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/65"
          aria-label="Sélectionner un site"
        />
        {selectedSiteName && (
          <button onClick={() => choose("")} className="text-white/70 hover:text-white" aria-label="Tous les sites">
            <X className="h-4 w-4" />
          </button>
        )}
        <ChevronDown className="h-4 w-4 shrink-0 text-white/75" />
      </div>
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
          <button
            onClick={() => choose("")}
            className="flex w-full items-center gap-2 border-b border-gray-100 px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-orange-50"
          >
            <Globe className="h-4 w-4 text-orange-500" /> Tous les sites
            {!selectedSiteName && <Check className="ml-auto h-4 w-4 text-orange-500" />}
          </button>
          {filtered.length === 0 ? (
            <p className="px-3 py-3 text-xs text-gray-400">Aucun site trouvé</p>
          ) : filtered.map((site) => (
            <button
              key={site.id}
              onClick={() => choose(site.siteName)}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-orange-50"
            >
              <span className={`h-2 w-2 rounded-full ${site.isActive ? "bg-green-500" : "bg-gray-300"}`} />
              {site.siteName}
              {selectedSiteName === site.siteName && <Check className="ml-auto h-4 w-4 text-orange-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}