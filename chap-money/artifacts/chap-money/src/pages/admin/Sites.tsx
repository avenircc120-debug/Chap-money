import { useEffect, useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import {
  Globe, Plus, Trash2, RefreshCw, Copy, ToggleLeft, ToggleRight,
  Eye, EyeOff, Search, X, Key, Lock, Webhook,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface Credential {
  id: string;
  siteName: string;
  webhookUrl: string;
  publicKey: string;
  secretKey?: string;
  webhookKey?: string;
  isActive: boolean;
  createdAt: string;
}

interface NewKeys {
  secretKey: string;
  webhookKey: string;
  publicKey: string;
  siteName: string;
}

function cp(text: string, label: string) {
  navigator.clipboard.writeText(text);
  toast.success(`${label} copié !`);
}

function KeyRow({
  label, value, icon: Icon, color, masked,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  masked?: boolean;
}) {
  const [show, setShow] = useState(!masked);
  return (
    <div className="space-y-1">
      <p className="text-gray-500 text-xs flex items-center gap-1">
        <Icon className={`w-3 h-3 ${color}`} /> {label}
      </p>
      <div className="flex items-center gap-2 bg-gray-800 rounded-xl px-3 py-2">
        <code className={`text-xs flex-1 font-mono ${show ? color : "text-gray-500"} truncate`}>
          {show ? value : "••••••••••••••••••••"}
        </code>
        {masked && (
          <button onClick={() => setShow(v => !v)} className="text-gray-500 hover:text-white flex-shrink-0">
            {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        )}
        <button onClick={() => cp(value, label)} className="text-gray-500 hover:text-white flex-shrink-0">
          <Copy className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function Sites() {
  const { authFetch } = useAdminAuth();
  const [creds, setCreds]         = useState<Credential[]>([]);
  const [filtered, setFiltered]   = useState<Credential[]>([]);
  const [loading, setLoading]     = useState(true);
  const [creating, setCreating]   = useState(false);
  const [newName, setNewName]     = useState("");
  const [newWebhook, setNewWebhook] = useState("");
  const [showForm, setShowForm]   = useState(false);
  const [search, setSearch]       = useState("");
  const [newKeys, setNewKeys]     = useState<NewKeys | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE}/api/credentials`);
      if (!res.ok) throw new Error();
      const data: Credential[] = await res.json();
      setCreds(data);
      setFiltered(data);
    } catch {
      toast.error("Impossible de charger les sites");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Filtre local en temps réel
  useEffect(() => {
    const q = search.trim().toLowerCase();
    setFiltered(q ? creds.filter(c => c.siteName.toLowerCase().includes(q)) : creds);
  }, [search, creds]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim() || !newWebhook.trim()) return;
    setCreating(true);
    try {
      const res = await authFetch(`${API_BASE}/api/credentials`, {
        method: "POST",
        body: JSON.stringify({ siteName: newName.trim(), webhookUrl: newWebhook.trim() }),
      });
      if (!res.ok) { const { error } = await res.json(); throw new Error(error); }
      const cred: Credential = await res.json();
      setNewKeys({
        siteName:   cred.siteName,
        publicKey:  cred.publicKey,
        secretKey:  cred.secretKey  ?? "",
        webhookKey: cred.webhookKey ?? "",
      });
      setNewName(""); setNewWebhook(""); setShowForm(false);
      await load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erreur création");
    } finally {
      setCreating(false);
    }
  }

  async function remove(id: string) {
    try {
      const res = await authFetch(`${API_BASE}/api/credentials/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      await load();
      toast.success("Site supprimé");
    } catch {
      toast.error("Erreur suppression");
    }
  }

  async function toggle(id: string) {
    try {
      const res = await authFetch(`${API_BASE}/api/credentials/${id}/toggle`, { method: "PATCH" });
      if (!res.ok) throw new Error();
      await load();
    } catch {
      toast.error("Erreur modification");
    }
  }

  async function regenerate(id: string) {
    try {
      const res = await authFetch(`${API_BASE}/api/credentials/${id}/regenerate`, { method: "POST" });
      if (!res.ok) throw new Error();
      const cred: Credential = await res.json();
      setNewKeys({
        siteName:   cred.siteName,
        publicKey:  cred.publicKey,
        secretKey:  cred.secretKey  ?? "",
        webhookKey: cred.webhookKey ?? "",
      });
      await load();
      toast.success("Clés régénérées");
    } catch {
      toast.error("Erreur régénération");
    }
  }

  return (
    <div className="p-4 space-y-5 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-400" /> Sites & Clés API
          </h1>
          <p className="text-gray-500 text-sm">
            {filtered.length} / {creds.length} site{creds.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => { setShowForm(!showForm); setNewKeys(null); }}
          className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 rounded-xl"
        >
          <Plus className="w-4 h-4" /> Ajouter
        </Button>
      </div>

      {/* Barre de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher un site…"
          className="w-full bg-gray-900 border border-gray-800 text-white text-sm rounded-xl pl-9 pr-9 py-2.5 placeholder:text-gray-600 focus:outline-none focus:border-emerald-600 transition-colors"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Nouvelles clés générées */}
      {newKeys && (
        <div className="bg-amber-950/50 border border-amber-700/40 rounded-2xl p-4 space-y-3">
          <p className="text-amber-300 text-sm font-semibold">
            ⚠️ Copiez les clés secrète et webhook maintenant — elles ne seront plus affichées
          </p>
          <p className="text-amber-400/70 text-xs font-medium">{newKeys.siteName}</p>

          <div className="space-y-2">
            <div className="flex items-center gap-2 bg-amber-950/60 rounded-xl px-3 py-2">
              <span className="text-amber-500 text-xs w-16 flex-shrink-0 flex items-center gap-1">
                <Key className="w-3 h-3" /> Public
              </span>
              <code className="text-amber-200 text-xs flex-1 break-all font-mono">{newKeys.publicKey}</code>
              <button onClick={() => cp(newKeys.publicKey, "Clé publique")} className="text-amber-400 hover:text-white flex-shrink-0">
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2 bg-amber-950/60 rounded-xl px-3 py-2">
              <span className="text-amber-500 text-xs w-16 flex-shrink-0 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Secrète
              </span>
              <code className="text-amber-200 text-xs flex-1 break-all font-mono">{newKeys.secretKey}</code>
              <button onClick={() => cp(newKeys.secretKey, "Clé secrète")} className="text-amber-400 hover:text-white flex-shrink-0">
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2 bg-amber-950/60 rounded-xl px-3 py-2">
              <span className="text-amber-500 text-xs w-16 flex-shrink-0 flex items-center gap-1">
                <Webhook className="w-3 h-3" /> Webhook
              </span>
              <code className="text-amber-200 text-xs flex-1 break-all font-mono">{newKeys.webhookKey}</code>
              <button onClick={() => cp(newKeys.webhookKey, "Clé webhook")} className="text-amber-400 hover:text-white flex-shrink-0">
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <Button size="sm" variant="outline"
            onClick={() => setNewKeys(null)}
            className="border-amber-700 text-amber-400 hover:bg-amber-900 text-xs w-full">
            J'ai copié toutes les clés ✓
          </Button>
        </div>
      )}

      {/* Formulaire création */}
      {showForm && (
        <form onSubmit={create} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-3">
          <p className="text-white font-semibold text-sm">Nouveau site</p>
          <Input
            placeholder="Nom du site (ex: MonShop)"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            required
            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
          />
          <Input
            placeholder="URL webhook (https://...)"
            type="url"
            value={newWebhook}
            onChange={e => setNewWebhook(e.target.value)}
            required
            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
          />
          <div className="flex gap-2">
            <Button type="submit" disabled={creating}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 rounded-xl gap-1.5">
              <Key className="w-4 h-4" />
              {creating ? "Génération…" : "Générer les 3 clés"}
            </Button>
            <Button type="button" variant="outline"
              onClick={() => setShowForm(false)}
              className="border-gray-700 text-gray-400 rounded-xl">
              Annuler
            </Button>
          </div>
        </form>
      )}

      {/* Liste */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl h-56 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-600">
          <Globe className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>{search ? `Aucun site pour "${search}"` : "Aucun site enregistré"}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => (
            <div key={c.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-3">
              {/* En-tête site */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-white font-semibold truncate">{c.siteName}</p>
                  <p className="text-gray-500 text-xs truncate">{c.webhookUrl}</p>
                </div>
                <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${c.isActive ? "bg-emerald-900/60 text-emerald-400" : "bg-gray-800 text-gray-500"}`}>
                  {c.isActive ? "Actif" : "Inactif"}
                </span>
              </div>

              {/* Les 3 clés */}
              <KeyRow label="Clé publique"  value={c.publicKey}               icon={Key}     color="text-emerald-300" />
              <KeyRow label="Clé secrète"   value={c.secretKey  ?? "sk_••••"} icon={Lock}    color="text-rose-300"    masked />
              <KeyRow label="Clé webhook"   value={c.webhookKey ?? "wk_••••"} icon={Webhook} color="text-violet-300"  masked />

              {/* Actions */}
              <div className="flex gap-2 pt-1 border-t border-gray-800">
                <button onClick={() => toggle(c.id)}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors">
                  {c.isActive
                    ? <ToggleRight className="w-4 h-4 text-emerald-400" />
                    : <ToggleLeft className="w-4 h-4" />}
                  {c.isActive ? "Désactiver" : "Activer"}
                </button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors">
                      <RefreshCw className="w-3.5 h-3.5" /> Régénérer
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-gray-900 border-gray-800">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-white">Régénérer les 3 clés ?</AlertDialogTitle>
                      <AlertDialogDescription className="text-gray-400">
                        Les 3 clés (publique, secrète, webhook) seront invalidées immédiatement.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-gray-700 text-gray-400">Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={() => regenerate(c.id)} className="bg-amber-600 hover:bg-amber-500">
                        Régénérer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-400 transition-colors ml-auto">
                      <Trash2 className="w-3.5 h-3.5" /> Supprimer
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-gray-900 border-gray-800">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-white">Supprimer {c.siteName} ?</AlertDialogTitle>
                      <AlertDialogDescription className="text-gray-400">
                        Action irréversible. Les paiements liés ne seront plus forwardés.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-gray-700 text-gray-400">Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={() => remove(c.id)} className="bg-red-700 hover:bg-red-600">
                        Supprimer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
