import { useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { Loader2 } from "lucide-react";
import { useGetPaymentStatus, getGetPaymentStatusQueryKey } from "@workspace/api-client-react";

export default function Status() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const transactionId = params.transactionId as string;

  const { data: statusData, error } = useGetPaymentStatus(transactionId, {
    query: {
      enabled: !!transactionId,
      refetchInterval: 3000,
      queryKey: getGetPaymentStatusQueryKey(transactionId),
    }
  });

  useEffect(() => {
    if (statusData) {
      if (statusData.status === "approved" || statusData.status === "transferred") {
        const queryStr = window.location.search;
        setLocation(`/success${queryStr}`);
      } else if (statusData.status === "declined" || statusData.status === "cancelled") {
        setLocation(`/cancelled`);
      }
    }
    if (error) {
      setLocation(`/cancelled`);
    }
  }, [statusData, error, setLocation]);

  return (
    <div className="min-h-[100dvh] w-full bg-gray-50 flex items-center justify-center p-4 sm:p-6 font-sans text-foreground selection:bg-[var(--cta)] selection:text-white">
      <div className="w-full max-w-md text-center flex flex-col items-center">
        <div className="relative w-24 h-24 mb-8 flex items-center justify-center">
          <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping"></div>
          <div className="relative bg-white rounded-full p-4 shadow-xl border border-gray-100">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold tracking-tight text-primary mb-2">
          Vérification en cours...
        </h1>
        <p className="text-muted-foreground text-sm max-w-[280px] mx-auto">
          Veuillez consulter votre téléphone et confirmer le paiement. Ne fermez pas cette page.
        </p>
      </div>
    </div>
  );
}
