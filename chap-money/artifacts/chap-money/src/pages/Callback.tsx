import { useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

/**
 * Page de retour FedaPay après paiement carte.
 * FedaPay redirige ici avec ?id={transactionId}&token=...&status=...
 */
export default function Callback() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const transactionId = params.get("id");
    const status = params.get("status");

    if (!transactionId) {
      setLocation("/");
      return;
    }

    // Récupérer amount/description stockés avant la redirection
    const meta = sessionStorage.getItem(`payment_meta_${transactionId}`);
    const metaStr = meta ? `&${meta}` : "";

    if (status === "approved" || status === "transferred") {
      setLocation(`/success?amount=0${metaStr}`);
    } else if (status === "declined" || status === "canceled" || status === "cancelled") {
      setLocation("/cancelled");
    } else {
      // Statut inconnu ou en attente → page de polling
      setLocation(`/status/${transactionId}?${meta ?? ""}`);
    }
  }, [setLocation]);

  return (
    <div className="min-h-[100dvh] w-full bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground text-sm">Vérification du paiement...</p>
      </div>
    </div>
  );
}
