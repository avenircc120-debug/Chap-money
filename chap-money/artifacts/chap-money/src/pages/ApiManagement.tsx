import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy,
  Check,
  RefreshCw,
  Trash2,
  Plus,
  Key,
  Globe,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowLeft,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// ── Types ────────────────────────────────────────────────────────────────────
interface ApiCredential {
  id: string;
  siteName: string;
  webhookUrl: string;
  publicKey: string;
  secretKey: string;
  isActive: boolean;
  createdAt: string;
}

// ── API helpers ───────────────────────────────────────────────────────────────
const BASE = "/api";

async function apiFetch<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (res.status === 204) return null as T;
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? `Erreur ${res.status}`);
  return json as T;
}

// ── Form schema ───────────────────────────────────────────────────────────────
const formSchema = z.object({
  siteName: z.string().min(2, "Au moins 2 caractères"),
  webhookUrl: z.string().url("URL invalide (ex: https://monsite.com/webhook)"),
});
type FormValues = z.infer<typeof formSchema>;

// ── Copy button ───────────────────────────────────────────────────────────────
function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="ml-1 p-1 rounded hover:bg-white/20 transition-colors text-muted-foreground hover:text-foreground"
      title="Copier"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

// ── Secret key display ────────────────────────────────────────────────────────
function SecretKeyDisplay({
  value,
  fullKey,
}: {
  value: string;
  fullKey?: string;
}) {
  const [revealed, setRevealed] = useState(!!fullKey);
  const display = fullKey ?? value;
  return (
    <span className="flex items-center gap-1 font-mono text-xs">
      <span className="text-muted-foreground">
        {revealed ? display : value}
      </span>
      {fullKey && (
        <>
          <button
            onClick={() => setRevealed((r) => !r)}
            className="p-1 rounded hover:bg-white/20 transition-colors text-muted-foreground"
          >
            {revealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          </button>
          <CopyButton value={display} />
        </>
      )}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ApiManagement() {
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const [newlyCreated, setNewlyCreated] = useState<ApiCredential | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: creds = [], isLoading } = useQuery<ApiCredential[]>({
    queryKey: ["credentials"],
    queryFn: () => apiFetch("/credentials"),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { siteName: "", webhookUrl: "" },
  });

  const createMutation = useMutation({
    mutationFn: (data: FormValues) =>
      apiFetch<ApiCredential>("/credentials", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (cred) => {
      qc.invalidateQueries({ queryKey: ["credentials"] });
      setNewlyCreated(cred);
      setShowForm(false);
      form.reset();
      toast.success("Credential créé — copiez la clé secrète maintenant !");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/credentials/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["credentials"] });
      toast.success("Credential supprimé");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/credentials/${id}/toggle`, { method: "PATCH" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["credentials"] }),
    onError: (err: Error) => toast.error(err.message),
  });

  const regenMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch<ApiCredential>(`/credentials/${id}/regenerate`, { method: "POST" }),
    onSuccess: (cred) => {
      qc.invalidateQueries({ queryKey: ["credentials"] });
      setNewlyCreated(cred);
      toast.success("Nouvelles clés générées — copiez la clé secrète !");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="min-h-[100dvh] bg-gray-50 font-sans">
      {/* Header */}
      <div className="border-b bg-white sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => setLocation("/")}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-muted-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <Key className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight">API Management</h1>
              <p className="text-xs text-muted-foreground">Gérez vos clés et webhooks</p>
            </div>
          </div>
          <div className="ml-auto">
            <Button
              size="sm"
              onClick={() => { setShowForm((s) => !s); setNewlyCreated(null); }}
              className="gap-2 rounded-xl"
            >
              <Plus className="w-4 h-4" />
              Nouveau site
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">

        {/* New credential form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="border-primary/20 shadow-md shadow-primary/5 rounded-2xl overflow-hidden">
                <CardContent className="p-5">
                  <p className="font-semibold text-sm mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    Ajouter un site
                  </p>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit((v) => createMutation.mutate(v))}
                      className="space-y-4"
                    >
                      <FormField
                        control={form.control}
                        name="siteName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Nom du site</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Mon E-commerce"
                                className="rounded-xl h-10"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="webhookUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">URL Webhook</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://monsite.com/api/webhook"
                                className="rounded-xl h-10"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex gap-2 justify-end pt-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="rounded-xl"
                          onClick={() => setShowForm(false)}
                        >
                          Annuler
                        </Button>
                        <Button
                          type="submit"
                          size="sm"
                          className="rounded-xl gap-2"
                          disabled={createMutation.isPending}
                        >
                          {createMutation.isPending ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Key className="w-4 h-4" />
                          )}
                          Générer les clés
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Newly created / regenerated keys — show full secret once */}
        <AnimatePresence>
          {newlyCreated && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card className="border-amber-200 bg-amber-50 rounded-2xl overflow-hidden">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm text-amber-800">
                        Copiez votre clé secrète maintenant
                      </p>
                      <p className="text-xs text-amber-700 mt-0.5">
                        Elle ne sera plus visible en clair après cette session.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 bg-white/70 rounded-xl p-3 border border-amber-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-amber-700 font-medium">Clé publique</span>
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-xs text-gray-700">{newlyCreated.publicKey}</span>
                        <CopyButton value={newlyCreated.publicKey} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-amber-700 font-medium">Clé secrète</span>
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-xs text-gray-700">{newlyCreated.secretKey}</span>
                        <CopyButton value={newlyCreated.secretKey} />
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full rounded-xl text-amber-700 hover:bg-amber-100"
                    onClick={() => setNewlyCreated(null)}
                  >
                    J'ai copié mes clés
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Credentials list */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-36 bg-white rounded-2xl animate-pulse border" />
            ))}
          </div>
        ) : creds.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Key className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">Aucun site configuré</p>
            <p className="text-xs mt-1">Cliquez sur "Nouveau site" pour commencer</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {creds.map((cred, i) => (
                <motion.div
                  key={cred.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className={`rounded-2xl overflow-hidden border transition-all ${!cred.isActive ? "opacity-60" : ""}`}>
                    <CardContent className="p-5">
                      {/* Site name + status */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Globe className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{cred.siteName}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                              {cred.webhookUrl}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={cred.isActive ? "default" : "secondary"}
                          className="text-xs cursor-pointer select-none"
                          onClick={() => toggleMutation.mutate(cred.id)}
                        >
                          {cred.isActive ? "Actif" : "Inactif"}
                        </Badge>
                      </div>

                      {/* Keys */}
                      <div className="bg-gray-50 rounded-xl p-3 space-y-2 mb-3 border">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground font-medium">Clé publique</span>
                          <div className="flex items-center gap-0.5">
                            <span className="font-mono text-xs text-gray-700 truncate max-w-[180px]">
                              {cred.publicKey}
                            </span>
                            <CopyButton value={cred.publicKey} />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground font-medium">Clé secrète</span>
                          <SecretKeyDisplay value={cred.secretKey} />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5 rounded-xl text-xs flex-1"
                              disabled={regenMutation.isPending}
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              Régénérer
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-2xl">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Régénérer les clés ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Les anciennes clés seront invalidées immédiatement. Mettez à jour votre intégration avant de confirmer.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                className="rounded-xl"
                                onClick={() => regenMutation.mutate(cred.id)}
                              >
                                Régénérer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5 rounded-xl text-xs text-destructive hover:text-destructive border-destructive/20 hover:bg-destructive/5"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Supprimer
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-2xl">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer "{cred.siteName}" ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Le site ne pourra plus utiliser Chap Money. Cette action est irréversible.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                className="rounded-xl bg-destructive hover:bg-destructive/90"
                                onClick={() => deleteMutation.mutate(cred.id)}
                              >
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Webhook info box */}
        {creds.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="rounded-2xl border-dashed bg-white/50">
              <CardContent className="p-4">
                <p className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> Webhook FedaPay central
                </p>
                <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                  <span className="font-mono text-xs text-gray-700 truncate flex-1">
                    {window.location.origin}/api/webhooks/fedapay
                  </span>
                  <CopyButton value={`${window.location.origin}/api/webhooks/fedapay`} />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Configurez cette URL dans votre dashboard FedaPay. Les paiements validés seront automatiquement transmis au webhook de chaque site.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
