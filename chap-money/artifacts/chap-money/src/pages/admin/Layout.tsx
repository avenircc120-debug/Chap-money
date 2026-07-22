import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import {
  Menu, X, LayoutDashboard, Globe, CreditCard, LogOut,
  Coins, Bell, HelpCircle, WalletCards, ArrowDownToLine, ArrowUpFromLine,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminSiteSelector } from "./AdminSiteContext";

const nav = [
  { href: "/demain/dashboard", icon: LayoutDashboard, label: "Tableau de Bord" },
  { href: "/demain/sites",     icon: Globe,           label: "Sites & Webhooks" },
  { href: "/demain/payments",  icon: CreditCard,      label: "Liens de Paiement" },
];

const bottomNav = [
  { href: "/demain/dashboard",  icon: WalletCards,    label: "Site" },
  { href: "/demain/deposits",   icon: ArrowDownToLine, label: "Dépôt" },
  { href: "/demain/withdrawals", icon: ArrowUpFromLine, label: "Retrait" },
  { href: "/demain/users",      icon: Users,          label: "Nombre de user" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { logout } = useAdminAuth();
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar drawer */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-2xl transition-transform duration-300 flex flex-col",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Drawer header – orange */}
        <div className="bg-orange-500 px-5 pt-10 pb-5 relative">
          <button
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mt-1">
            <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center">
              <Coins className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-base leading-tight">Chap Money</p>
              <p className="text-orange-100 text-xs mt-0.5">COMPTE: MARCHAND</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 overflow-y-auto">
          {nav.map(({ href, icon: Icon, label }) => {
            const active = location.startsWith(href);
            return (
              <Link key={href} href={href}>
                <button
                  onClick={() => setOpen(false)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all mb-1 text-sm font-medium",
                    active
                      ? "bg-orange-500 text-white shadow-sm"
                      : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{label}</span>
                </button>
              </Link>
            );
          })}

          <div className="mt-2 border-t border-gray-100 pt-2">
            <button
              onClick={() => setOpen(false)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600"
            >
              <HelpCircle className="w-5 h-5 flex-shrink-0" />
              <span>Centre d'aide</span>
            </button>
          </div>
        </nav>

        {/* Déconnexion */}
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all text-sm font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Top header – orange */}
      <header className="bg-orange-500 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <button onClick={() => setOpen(true)} className="text-white p-1">
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex min-w-0 flex-1 items-center justify-center px-3">
          <AdminSiteSelector />
        </div>
        <div className="flex items-center gap-3">
          <button className="text-white/90 hover:text-white">
            <Bell className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
            A
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="pb-24">{children}</main>

      {/* Bottom navigation — the selected site is carried through the URL/local storage. */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-200 bg-white/95 px-2 py-2 shadow-[0_-4px_16px_rgba(15,23,42,0.06)] backdrop-blur">
        <div className="mx-auto grid max-w-lg grid-cols-4 gap-1">
          {bottomNav.map(({ href, icon: Icon, label }) => {
            const active = href === "/demain/dashboard"
              ? location.startsWith("/demain/dashboard")
              : location.startsWith(href);
            return (
              <Link key={href} href={href}>
                <button
                  className={cn(
                    "flex w-full flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-semibold transition-colors",
                    active ? "bg-orange-50 text-orange-600" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="truncate">{label}</span>
                </button>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
