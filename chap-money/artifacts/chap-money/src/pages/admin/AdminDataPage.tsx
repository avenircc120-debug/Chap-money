import { useCallback, useEffect, useState } from "react";
import { ArrowDownToLine, ArrowUpFromLine, RefreshCw, Users } from "lucide-react";
import { toast } from "sonner";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useAdminSite } from "./AdminSiteContext";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type Kind = "deposit" | "withdrawal" | "users";

interface AdminDataPageProps {
  kind: Kind;
}

function valueOf(row: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    if (row[key] !== null && row[key] !== undefined) return row[key];
  }
  return null;
}

function formatAmount(value: unknown) {
  const amount = Number(value);
  return Number.isFinite(amount) ? `${amount.toLocaleString("fr-FR")} FCFA` : "—";
}

function formatDate(value: unknown) {
  if (!value) return "—";
  const date = new Date(String(value));
  return Number.isNaN(date.getTime())
    ? String(value)
    : new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(date);
}

export default function AdminDataPage({ kind }: AdminDataPageProps) {
  const { authFetch } = useAdminAuth();
  const { selectedSiteName } = useAdminSite();
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = kind === "users" ? "users" : kind === "deposit" ? "deposits" : "withdrawals";
      const params = new URLSearchParams();
      if (selectedSiteName) params.set("siteName", selectedSiteName);
      const response = await authFetch(`${API_BASE}/api/admin/${endpoint}?${params}`);
      if (!response.ok) throw new Error();
      const data = await response.json();
      if (kind === "users") {
        setRows(Array.isArray(data?.users) ? data.users : []);
        setUserCount(Number(data?.count ?? 0));
      } else {
        setRows(Array.isArray(data) ? data : []);
      }
    } catch {
      toast.error("Impossible de charger ces données");
      setRows([]);
      setUserCount(0);
    } finally {
      setLoading(false);
    }
  }, [authFetch, kind, selectedSiteName]);

  useEffect(() => { void load(); }, [load]);

  const isUsers = kind === "users";
  const title = isUsers ? "Nombre de user" : kind === "deposit" ? "Dépôts" : "Retraits";
  const Icon = isUsers ? Users : kind === "deposit" ? ArrowDownToLine : ArrowUpFromLine;

  return (
    <div className="mx-auto max-w-lg space-y-4 p-4">
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <Icon className="h-5 w-5 text-orange-500" /> {title}
          </h1>
          <p className="text-sm text-gray-500">
            {isUsers ? userCount : rows.length} {isUsers ? "utilisateur(s)" : "opération(s)"}
            {selectedSiteName ? ` · ${selectedSiteName}` : " · Tous les sites"}
          </p>
        </div>
        <button onClick={() => void load()} disabled={loading} className="rounded-xl border border-gray-200 p-2.5 text-gray-500 hover:bg-gray-50 disabled:opacity-50">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((item) => <div key={item} className="h-20 animate-pulse rounded-2xl bg-white shadow-sm" />)}
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white py-16 text-center text-sm text-gray-400 shadow-sm">
          <Icon className="mx-auto mb-3 h-10 w-10 opacity-25" />
          Aucune donnée pour cette sélection.
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((row, index) => {
            const id = String(valueOf(row, "id", "user_id", "profile_id") ?? index);
            const name = valueOf(row, "name", "full_name", "email", "phone", "user_id") ?? "Utilisateur";
            return (
              <div key={`${id}-${index}`} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-gray-800">{String(name)}</p>
                    {!isUsers && (
                      <p className="mt-1 text-xs text-gray-400">
                        {String(valueOf(row, "status", "description", "reference", "transaction_id") ?? "Opération")}
                      </p>
                    )}
                    {isUsers && valueOf(row, "email", "phone") && (
                      <p className="mt-1 text-xs text-gray-400">{String(valueOf(row, "email", "phone"))}</p>
                    )}
                  </div>
                  {!isUsers && (
                    <p className="shrink-0 font-bold tabular-nums text-gray-900">
                      {formatAmount(valueOf(row, "amount", "value", "total"))}
                    </p>
                  )}
                </div>
                <div className="mt-3 flex justify-between text-xs text-gray-400">
                  <span>{selectedSiteName ?? String(valueOf(row, "site_name") ?? "Sans site")}</span>
                  <span>{formatDate(valueOf(row, "created_at", "createdAt", "date"))}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}