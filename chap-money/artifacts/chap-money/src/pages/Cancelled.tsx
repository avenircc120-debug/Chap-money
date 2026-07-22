import { useLocation } from "wouter";
import { XCircle, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function Cancelled() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-[100dvh] w-full bg-gray-50 flex items-center justify-center p-4 sm:p-6 font-sans text-foreground">
      <div className="w-full max-w-md">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-gray-100 text-center"
        >
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-14 h-14 text-red-500" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight mb-2 text-primary">Paiement échoué</h1>
          <p className="text-gray-500 text-sm mb-8">
            Le paiement a été refusé ou annulé. Aucune somme n'a été débitée de votre compte.
          </p>

          <Button 
            onClick={() => setLocation("/")}
            variant="outline"
            className="w-full h-14 rounded-full text-lg font-bold border-gray-200 text-primary hover:bg-gray-50 transition-all active:scale-[0.98]"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Réessayer
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
