import { useEffect, useRef, useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Link } from "wouter";
import {
  Search, X, RefreshCw, TrendingUp, ArrowUpRight, ArrowDownLeft,
  Globe, Webhook, CheckCircle2, Clock, XCircle, AlertCircle,
  ChevronDown, Copy, ExternalLink, Wallet, Plus,
} from "lucide-react";
import { toast } from "sonner";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface Site {
  id: string;
  siteName: string;
  webhookUrl: string;
  publicKey: string;
  isActive: boolean;
  createdAt: string;
}

interface Payment {
  id: string;
  amount: number | null;
  description: string | null;
  phoneNumber: string | null;
  operator: string | null;
  siteName: string | null;
  status: string;
  createdAt: string;
  customerName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number | null | undefined) {
  if (n == null) return "—";
  return n.toLocaleString("fr-FR") + " FCFA";
}

function fmtDate(s: string) {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
    }).format(new Date(s));
  } catch {
    return s;
  }
}

function StatusChip({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string; Icon: React.ElementType }> = {
    approved:  { label: "Approuvé",  cls: "bg-green-100 text-green-700",  Icon: CheckCircle2 },
    pending:   { label: "En attente", cls: "bg-amber-100 text-amber-700",  Icon: Clock },
    declined:  { label: "Refusé",    cls: "bg-red-100 text-red-600",      Icon: XCircle },
    cancelled: { label: "Annulé",    cls: "bg-gray-100 text-gray-500",    Icon: XCircle },
  };
  const cfg = map[status] ?? { label: status, cls: "bg-gray-100 text-gray-500", Icon: AlertCircle };
  const { label, cls, Icon } = cfg;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cls}`}>
      <Icon className="w-3 h-3" /> {label}
    </span>
  );
}

// ─── component ───────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { token } = useAdminAuth() as { token: string };
  const authFetch = (url: string, opts: RequestInit = {}) =>
    fetch(url, { ...opts, headers: { ...(opts.headers ?? {}), Authorization: `Bearer ${token}` } });

  // Sites
  const [sites, setSites] = useState<Site[]>([]);
  const [siteSearch, setSiteSearch] = useState("");
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [showSiteList, setShowSiteList] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Data
  const [payments, setPayments] = useState<Payment[]>([]);
  const [balance, setBalance] = useState(0);
  const [totalTx, setTotalTx] = useState(0);
  const [approvedTx, setApprovedTx] = useState(0);
  const [loading, setLoading] = useState(false);

  // Webhook form
  const [webhookSite, setWebhookSite] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookLoading, setWebhookLoading] = useState(false);

  // ── Load sites ──────────────────────────────────────────────────────────────
  useEffect(() => {
    authFetch(`${API_BASE}/api/credentials`)
      .then(r => r.ok ? r.json() : [])
      .then((data: Site[]) => setSites(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  // ── Load data when site changes ─────────────────────────────────────────────
  useEffect(() => {
    loadData(selectedSite?.siteName ?? null);
  }, [selectedSite]);

  async function loadData(site: string | null) {
    setLoading(true);
    try {
      const q = site ? `?siteName=${encodeURIComponent(site)}&limit=30` : "?limit=30";
      const [payRes, walletRes] = await Promise.all([
        authFetch(`${API_BASE}/api/admin/payments${q}`),
        authFetch(`${API_BASE}/api/admin/wallet${site ? `?siteName=${encodeURIComponent(site)}` : ""}`),
      ]);
      const [pList, w] = await Promise.all([
        payRes.ok ? payRes.json() : [],
        walletRes.ok ? walletRes.json() : { balance: 0, totalTransactions: 0 },
      ]);
      setPayments(Array.isArray(pList) ? pList : []);
      setBalance(Number(w?.balance ?? 0));
      setTotalTx(Number(w?.totalTransactions ?? 0));
      setApprovedTx(Array.isArray(pList) ? pList.filter((p: Payment) => p.status === "approved").length : 0);
    } catch {
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }

  // ── Site selector ───────────────────────────────────────────────────────────
  const filteredSites = sites.filter(s =>
    s.siteName.toLowerCase().includes(siteSearch.toLowerCase())
  );

  function selectSite(s: Site | null) {
    setSelectedSite(s);
    setSiteSearch(s?.siteName ?? "");
    setShowSiteList(false);
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSiteList(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Webhook creation ────────────────────────────────────────────────────────
  async function createWebhook(e: React.FormEvent) {
    e.preventDefault();
    if (!webhookSite.trim() || !webhookUrl.trim()) {
      toast.error("Remplissez tous les champs");
      return;
    }
    setWebhookLoading(true);
    try {
      const res = await authFetch(`${API_BASE}/api/credentials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteName: webhookSite.trim(), webhookUrl: webhookUrl.trim() }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? "Erreur");
      }
      const newCred = await res.json();
      toast.success(`Webhook créé pour "${webhookSite.trim()}"`);
      // copy webhook key if present
      if (newCred?.webhookKey) {
        navigator.clipboard.writeText(newCred.webhookKey).catch(() => {});
        toast.success("Clé webhook copiée dans le presse-papier");
      }
      setSites(prev => [...prev, newCred]);
      setWebhookSite("");
      setWebhookUrl("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erreur création webhook");
    } finally {
      setWebhookLoading(false);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">

      {/* ① Barre de recherche globale */}
      <div ref={searchRef} className="relative">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
          <Search className="w-4 h-4 text-orange-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Rechercher ou choisir un site actif…"
            value={siteSearch}
            onFocus={() => setShowSiteList(true)}
            onChange={e => { setSiteSearch(e.target.value); setShowSiteList(true); }}
            className="flex-1 text-sm outline-none text-gray-800 placeholder-gray-400 bg-transparent"
          />
          {selectedSite && (
            <button onClick={() => selectSite(null)} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>

        {showSiteList && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-2xl shadow-xl z-20 overflow-hidden">
            {/* All sites option */}
            <button
              onClick={() => selectSite(null)}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-orange-50 text-left border-b border-gray-100"
            >
              <Globe className="w-4 h-4 text-orange-400" />
              <span className="font-medium text-gray-700">Tous les sites</span>
            </button>
            {filteredSites.length === 0 ? (
              <p className="px-4 py-3 text-sm text-gray-400">Aucun site trouvé</p>
            ) : (
              filteredSites.map(s => (
                <button
                  key={s.id}
                  onClick={() => selectSite(s)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-orange-50 text-left ${selectedSite?.id === s.id ? "bg-orange-50" : ""}`}
                >
                  <div className={`w-2 h-2 rounded-full ${s.isActive ? "bg-green-500" : "bg-gray-300"}`} />
                  <span className="text-gray-800">{s.siteName}</span>
                  {selectedSite?.id === s.id && (
                    <CheckCircle2 className="w-4 h-4 text-orange-500 ml-auto" />
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Selected site label */}
      {selectedSite && (
        <div className="flex items-center gap-2 -mt-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-xs text-gray-500">Site actif : <strong className="text-gray-800">{selectedSite.siteName}</strong></span>
        </div>
      )}

      {/* ② Portefeuille du site – orange card */}
      <div className="bg-orange-500 rounded-2xl p-5 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-orange-100 text-xs font-medium">Solde Total</p>
              {selectedSite && <p className="text-orange-200 text-[10px]">{selectedSite.siteName}</p>}
            </div>
          </div>
          <button
            onClick={() => loadData(selectedSite?.siteName ?? null)}
            disabled={loading}
            className="text-white/70 hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
        <p className="text-white text-3xl font-bold tabular-nums">{fmt(balance)}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-orange-200 text-xs bg-white/10 px-3 py-1 rounded-full">XOF</span>
          <span className="text-orange-100 text-xs">Détails →</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-orange-500" />
            </div>
            <div>
              <p className="text-gray-500 text-[10px] font-medium uppercase tracking-wide">Volume</p>
              <p className="text-gray-400 text-[9px]">HISTORIQUE</p>
            </div>
          </div>
          <p className="text-gray-900 text-xl font-bold tabular-nums">{fmt(balance)}</p>
          <p className="text-gray-400 text-xs mt-1">En 30 jours</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center">
              <ArrowUpRight className="w-3.5 h-3.5 text-orange-500" />
            </div>
            <div>
              <p className="text-gray-500 text-[10px] font-medium uppercase tracking-wide">Transactions</p>
              <p className="text-gray-400 text-[9px]">VOLUME MENSUEL</p>
            </div>
          </div>
          <p className="text-gray-900 text-xl font-bold tabular-nums">{totalTx}</p>
          <p className="text-gray-400 text-xs mt-1">{approvedTx} approuvées</p>
        </div>
      </div>

      {/* ④ Liens de Paiement & Transfert */}
      <div className="flex gap-3">
        <Link href="/demain/payments" className="flex-1">
          <button className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white rounded-2xl py-3.5 text-sm font-semibold shadow-sm hover:bg-orange-600 transition-colors">
            <ArrowDownLeft className="w-4 h-4" />
            Liens de Paiement
          </button>
        </Link>
        <button className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 rounded-2xl py-3.5 text-sm font-semibold shadow-sm hover:bg-gray-50 transition-colors">
          <ArrowUpRight className="w-4 h-4" />
          Transfert
        </button>
      </div>

      {/* ③ Transactions du site */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="font-bold text-gray-800 text-sm">
            Transactions{selectedSite ? ` · ${selectedSite.siteName}` : ""}
          </h2>
          <Link href="/demain/payments">
            <button className="text-orange-500 text-xs font-semibold">Tout voir</button>
          </Link>
        </div>
        {loading ? (
          <div className="py-10 flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-orange-400 animate-spin" />
          </div>
        ) : payments.length === 0 ? (
          <div className="py-10 text-center text-gray-400 text-sm">
            <ArrowUpRight className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>{selectedSite ? `Aucune transaction pour "${selectedSite.siteName}"` : "Aucune transaction"}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {payments.slice(0, 10).map(p => {
              const name = p.customerName ?? (p.firstName || p.lastName ? `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim() : null) ?? p.description ?? "Utilisateur";
              return (
                <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-orange-600 font-bold text-sm">
                      {name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800 text-sm font-semibold truncate">{name}</p>
                    <p className="text-gray-400 text-xs">{p.phoneNumber ?? "—"}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-gray-900 text-sm font-bold tabular-nums">{fmt(p.amount)}</p>
                    <StatusChip status={p.status} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ⑤ Créer Webhook */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
          <Webhook className="w-4 h-4 text-orange-500" />
          <h2 className="font-bold text-gray-800 text-sm">Créer Webhook</h2>
        </div>
        <form onSubmit={createWebhook} className="p-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nom du site</label>
            <input
              type="text"
              value={webhookSite}
              onChange={e => setWebhookSite(e.target.value)}
              placeholder="ex: MonSite"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">URL de votre site</label>
            <input
              type="url"
              value={webhookUrl}
              onChange={e => setWebhookUrl(e.target.value)}
              placeholder="https://monsite.com/webhook"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100 transition"
            />
          </div>
          <button
            type="submit"
            disabled={webhookLoading}
            className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white rounded-xl py-3 text-sm font-semibold hover:bg-orange-600 transition-colors disabled:opacity-60"
          >
            {webhookLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Générer le Webhook
          </button>
        </form>
        {/* Link to full site manager */}
        <div className="px-4 pb-4">
          <Link href="/demain/sites">
            <button className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-xs font-medium hover:bg-gray-50 transition-colors">
              <Globe className="w-3.5 h-3.5" />
              Gérer tous mes sites & clés
            </button>
          </Link>
        </div>
      </div>

    </div>
  );
}
