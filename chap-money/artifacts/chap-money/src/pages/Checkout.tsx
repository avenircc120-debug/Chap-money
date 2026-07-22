import { useForm } from "react-hook-form";
    import { zodResolver } from "@hookform/resolvers/zod";
    import { useLocation } from "wouter";
    import { ChevronRight, Smartphone, FlaskConical } from "lucide-react";
    import { toast } from "sonner";
    import { motion, AnimatePresence } from "framer-motion";

    import { useInitiateMobilePayment } from "@workspace/api-client-react";
    import { CheckoutFormValues, checkoutSchema } from "@/lib/schemas";
    import { COUNTRIES } from "@/lib/constants";

    import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
    import { Input } from "@/components/ui/input";
    import { Button } from "@/components/ui/button";
    import { Card, CardContent } from "@/components/ui/card";

    export default function Checkout() {
    const [, setLocation] = useLocation();
    const mobileMutation = useInitiateMobilePayment();

    const form = useForm<CheckoutFormValues>({
      resolver: zodResolver(checkoutSchema),
      defaultValues: {
        amount: "" as unknown as number,
        description: "Paiement Chap Money",
        paymentMethod: "mobile",
        country: "BEN",
        operator: "",
        phoneNumber: "",
      },
    });

    const watchedAmount = form.watch("amount");
    const selectedCountryId = form.watch("country");
    const selectedCountry = COUNTRIES.find((c) => c.id === selectedCountryId) || COUNTRIES[0];
    const selectedOperator = form.watch("operator");

    const handleCountryChange = (countryId: string) => {
      form.setValue("country", countryId);
      form.setValue("operator", "");
      form.setValue("phoneNumber", "");
    };

    const onSubmit = (data: CheckoutFormValues) => {
      const paymentMeta = new URLSearchParams({
        amount: data.amount.toString(),
        description: data.description,
      }).toString();

      const countryDef = COUNTRIES.find(c => c.id === data.country);
      const countryCode = countryDef?.code || "bj";
      let cleanPhone = (data.phoneNumber || "").replace(/\D/g, "");
      const dialCode = countryDef?.dialCode ?? "";
      if (dialCode && cleanPhone.startsWith(dialCode)) {
        cleanPhone = cleanPhone.slice(dialCode.length);
      }

      mobileMutation.mutate({
        data: {
          amount: data.amount,
          description: data.description || "Paiement Chap Money",
          phoneNumber: cleanPhone,
          country: countryCode,
          operator: data.operator || "",
        }
      }, {
        onSuccess: (res) => {
          setLocation(`/status/${res.transactionId}?${paymentMeta}`);
        },
        onError: (err: unknown) => {
          const e = err as { message?: string; error?: string };
          toast.error(e.message || e.error || "Une erreur est survenue lors de l'initiation du paiement");
        }
      });
    };

    return (
      <div className="min-h-[100dvh] w-full bg-gray-50 flex items-center justify-center p-4 sm:p-6 font-sans text-foreground selection:bg-[var(--cta)] selection:text-white">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary text-primary-foreground mb-4 shadow-sm">
              <Smartphone className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Chap Money</h1>
            <p className="text-sm text-muted-foreground mt-1">Paiement simple et sécurisé</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              <Card className="border-none shadow-xl shadow-black/[0.03] overflow-hidden rounded-3xl">
                {/* ── En-tête montant ── */}
                <div className="bg-primary p-6 text-primary-foreground">
                  <div className="mb-6">
                    <div className="text-primary-foreground/70 text-sm font-medium mb-1">Montant à payer</div>
                    <div className="text-3xl font-bold flex items-baseline gap-1">
                      {(Number(watchedAmount) || 0).toLocaleString('fr-FR')}
                      <span className="text-xl font-medium text-primary-foreground/80">XOF</span>
                    </div>
                  </div>
                  <div className="bg-primary-foreground/10 rounded-xl p-3">
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-primary-foreground/70">Motif</span>
                          <span className="font-medium max-w-[200px] truncate">{field.value || "—"}</span>
                        </div>
                      )}
                    />
                  </div>
                </div>

                <CardContent className="p-6 bg-white space-y-6">
                  {/* ── Montant ── */}
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium leading-none text-foreground">Montant à payer</FormLabel>
                        <FormControl>
                          <div className="flex items-stretch h-12 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 focus-within:border-[var(--cta)] focus-within:bg-white transition-colors mt-1.5">
                            <Input
                              placeholder="Entrez le montant"
                              className="flex-1 h-full border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none text-base font-medium px-3"
                              type="number"
                              inputMode="numeric"
                              min={100}
                              {...field}
                              onChange={(e) => field.onChange(e.target.valueAsNumber || "")}
                            />
                            <div className="flex items-center px-3 bg-gray-100 border-l border-gray-200 shrink-0 select-none">
                              <span className="font-semibold text-sm text-muted-foreground">XOF</span>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* ── Pays ── */}
                  <div className="space-y-3">
                    <p className="text-sm font-medium leading-none">1. Choisissez votre pays</p>
                    <div className="grid grid-cols-4 gap-2">
                      {COUNTRIES.map(country => (
                        <button
                          key={country.id}
                          type="button"
                          onClick={() => handleCountryChange(country.id)}
                          className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all duration-200 ${
                            selectedCountryId === country.id
                              ? "border-[var(--cta)] bg-[var(--cta)]/5 ring-1 ring-[var(--cta)] text-primary"
                              : "border-gray-200 hover:border-gray-300 text-gray-600"
                          }`}
                        >
                          <span className="text-xl mb-0.5">{country.flag}</span>
                          <span className="text-[10px] font-semibold leading-tight">{country.code.toUpperCase()}</span>
                          <span className={`text-[9px] font-medium leading-tight ${selectedCountryId === country.id ? "text-[var(--cta)]" : "text-gray-400"}`}>+{country.dialCode}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ── Opérateur ── */}
                  <AnimatePresence mode="popLayout">
                    {selectedCountry && (
                      <motion.div
                        key={selectedCountry.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3"
                      >
                        <p className="text-sm font-medium leading-none">2. Sélectionnez l'opérateur</p>
                        <div className="grid grid-cols-3 gap-3">
                          {selectedCountry.operators.map(operator => (
                            <button
                              key={operator.mode}
                              type="button"
                              onClick={() => form.setValue("operator", operator.mode)}
                              style={{
                                backgroundColor: selectedOperator === operator.mode ? operator.color : "transparent",
                                borderColor: selectedOperator === operator.mode ? operator.color : operator.isTest ? "#A5B4FC" : "#E5E7EB",
                                color: selectedOperator === operator.mode ? "#fff" : operator.isTest ? "#6366F1" : "#4B5563"
                              }}
                              className={`py-3 px-2 rounded-xl border font-bold text-sm transition-all duration-200 flex flex-col items-center justify-center gap-1 shadow-sm hover:-translate-y-0.5 ${
                                selectedOperator === operator.mode ? "ring-2 ring-offset-2" : operator.isTest ? "bg-indigo-50 hover:border-indigo-400" : "hover:border-gray-300 bg-white"
                              }`}
                            >
                              {operator.isTest ? (
                                <>
                                  <FlaskConical className="w-4 h-4" />
                                  <span className="text-[10px] leading-tight">Momo Test</span>
                                </>
                              ) : (
                                operator.label
                              )}
                            </button>
                          ))}
                        </div>
                        {form.formState.errors.operator && (
                          <p className="text-sm font-medium text-destructive mt-1">
                            {form.formState.errors.operator.message}
                          </p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* ── Téléphone ── */}
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium leading-none">3. Numéro de téléphone</FormLabel>
                        <FormControl>
                          <div className="flex items-stretch h-12 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 focus-within:border-[var(--cta)] focus-within:bg-white transition-colors">
                            <div className="flex items-center px-3 gap-1 bg-gray-100 border-r border-gray-200 shrink-0 select-none">
                              <span className="text-base">{selectedCountry?.flag}</span>
                              <span className="font-semibold text-sm text-foreground">+{selectedCountry?.dialCode ?? ""}</span>
                            </div>
                            <Input
                              placeholder={selectedCountry?.phonePlaceholder ?? "Numéro local"}
                              className="flex-1 h-full border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none text-base font-medium tracking-wide px-3"
                              type="tel"
                              inputMode="numeric"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* ── Bouton PAYER ── */}
                  <Button
                    type="submit"
                    disabled={mobileMutation.isPending}
                    className="w-full h-14 rounded-full text-lg font-bold bg-[var(--cta)] hover:bg-[var(--cta)]/90 text-white shadow-lg shadow-[var(--cta)]/25 transition-all active:scale-[0.98]"
                  >
                    {mobileMutation.isPending ? "Initialisation..." : "PAYER"}
                    {!mobileMutation.isPending && <ChevronRight className="w-5 h-5 ml-1" />}
                  </Button>
                </CardContent>
              </Card>

              <div className="text-center text-xs text-muted-foreground/60 flex items-center justify-center gap-1.5">
                <span>Sécurisé par</span>
                <span className="font-bold tracking-tight text-muted-foreground">FedaPay</span>
              </div>

            </form>
          </Form>
        </div>
      </div>
    );
    }
    