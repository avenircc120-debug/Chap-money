import { useEffect, useState, useCallback } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { CreditCard, RefreshCw, CheckCircle2, XCircle, Clock, ChevronDown, Search, X } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface Payment {
  id: string;
  fedapayId: number | null;
  amount: number | null;
  description: string | null;
  status: string;
  mode: string | null;
  paymentType: string | null;
  operator: string | null;
  country: string | null;
  phoneNumber: string | null;
  apiPublicKey: string | null;
  siteName: string | null;
  createdAt: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  approved: { label: "Validé",    color: "text-emerald-400 bg-emerald-900/40", icon: CheckCircle2 },
  pending:  { label: "En attente", color: "text-amber-400 bg-amber-900/40",   icon: Clock        },
  declined: { label: "Refusé",    color: "text-red-400 bg-red-900/40",        icon: XCircle      },
  cancelled:{ label: "Annulé",    color: "text-gray-400 bg-gray-800",         icon: XCircle      },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: "text-gray-400 bg-gray-800", icon: Clock };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function formatDate(raw: string | null): string {
  if (!raw) return "—";
  try {
    return format(new Date(raw), "d MMM HH:mm", { locale: fr });
  } catch {
    return "—";
  }
}

export default function Payments() {
  const { authFetch } = useAdminAuth();
  const [payments, setPayments]   = useState<Payment[]>([]);
  const [loading, setLoading]     = useState(true);
  const [offset, setOffset]       = useState(0);
  const [hasMore, setHasMore]     = useState(false);
  const [search, setSearch]       = useState("");
  const [applied, setApplied]     = useState(""); // nom effectivement envoyé à l'API
  const LIMIT = 20;

  const load = useCallback(async (reset: boolean, siteName: string) => {
    const o = reset ? 0 : offset;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit:  String(LIMIT + 1),
        offset: String(o),
      });
      if (siteName.trim()) params.set("siteName", siteName.trim());

      const res = await authFetch(`${API_BASE}/api/admin/payments?${params}`);
      if (!res.ok) throw new Error();
      const data: Payment[] = await res.json();
      const more  = data.length > LIMIT;
      const items = more ? data.slice(0, LIMIT) : data;
      if (reset) setPayments(items);
      else setPayments(prev => [...prev, ...items]);
      setHasMore(more);
      setOffset(o + items.length);
    } catch {
      toast.error("Impossible de charger les paiements");
    } finally {
      setLoading(false);
    }
  }, [offset, authFetch]);

  // Chargement initial
  useEffect(() => { load(true, ""); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setApplied(search);
    load(true, search);
  }

  function clearSearch() {
    setSearch("");
    setApplied("");
    load(true, "");
  }

  return (
    <div className="p-4 space-y-5 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-400" /> Paiements
          </h1>
          <p className="text-gray-500 text-sm">
            {payments.length} transaction{payments.length !== 1 ? "s" : ""}
            {applied ? <span className="text-emerald-500"> · {applied}</span> : ""}
          </p>
        </div>
        <button
          onClick={() => load(true, applied)}
          disabled={loading}
          className="w-9 h-9 rounded-xl bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading && payments.length === 0 ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Recherche par nom de site */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filtrer par nom de site…"
            className="w-full bg-gray-900 border border-gray-800 text-white text-sm rounded-xl pl-9 pr-4 py-2.5 placeholder:text-gray-600 focus:outline-none focus:border-emerald-600 transition-colors"
          />
          {search && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2.5 text-sm font-medium bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl transition-colors disabled:opacity-50"
        >
          OK
        </button>
      </form>

      {/* List */}
      {loading && payments.length === 0 ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl h-24 animate-pulse" />
          ))}
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-16 text-gray-600">
          <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>{applied ? `Aucun paiement pour "${applied}"` : "Aucun paiement enregistré"}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {payments.map(p => (
            <div key={p.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <p className="text-white font-semibold tabular-nums">
                    {p.amount != null ? p.amount.toLocaleString("fr-FR") : "—"} FCFA
                  </p>
                  <p className="text-gray-400 text-xs truncate">{p.description ?? "Sans description"}</p>
                </div>
                <StatusBadge status={p.status} />
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                {p.phoneNumber && <span>{p.phoneNumber}</span>}
                {p.operator && (
                  <span className="uppercase text-gray-600">{p.operator}</span>
                )}
                {p.siteName ? (
                  <span className="text-violet-400/80 font-medium">{p.siteName}</span>
                ) : p.apiPublicKey ? (
                  <span className="truncate max-w-[120px] font-mono text-violet-400/50">
                    {p.apiPublicKey.slice(0, 12)}…
                  </span>
                ) : null}
                <span className="ml-auto">{formatDate(p.createdAt)}</span>
              </div>
            </div>
          ))}

          {hasMore && (
            <button
              onClick={() => load(false, applied)}
              disabled={loading}
              className="w-full py-3 text-sm text-gray-400 hover:text-white flex items-center justify-center gap-2 transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
              {loading ? "Chargement…" : "Voir plus"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
