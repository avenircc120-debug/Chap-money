import { useLocation } from "wouter";
import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function Success() {
  const [, setLocation] = useLocation();
  const [amount, setAmount] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setAmount(searchParams.get("amount"));
    setDescription(searchParams.get("description"));
  }, []);

  return (
    <div className="min-h-[100dvh] w-full bg-[#0a1930] flex items-center justify-center p-4 sm:p-6 font-sans text-white">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-2xl text-center text-[#0a1930] relative overflow-hidden">
          
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
            className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.3 }}
            >
              <CheckCircle2 className="w-14 h-14 text-green-500" />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h1 className="text-3xl font-bold tracking-tight mb-2">Paiement réussi!</h1>
            <p className="text-gray-500 text-sm mb-8">Votre transaction a été traitée avec succès.</p>
            
            {(amount || description) && (
              <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left border border-gray-100">
                {amount && (
                  <div className="mb-4">
                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Montant Payé</div>
                    <div className="text-2xl font-bold text-[#0a1930]">{Number(amount).toLocaleString('fr-FR')} XOF</div>
                  </div>
                )}
                {description && (
                  <div>
                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Description</div>
                    <div className="text-sm font-medium text-gray-800">{description}</div>
                  </div>
                )}
              </div>
            )}

            <Button 
              onClick={() => setLocation("/")}
              className="w-full h-14 rounded-full text-lg font-bold bg-[#0a1930] hover:bg-[#0a1930]/90 text-white shadow-lg transition-all active:scale-[0.98]"
            >
              Nouveau paiement
            </Button>
          </motion.div>
          
        </div>
      </div>
    </div>
  );
}
