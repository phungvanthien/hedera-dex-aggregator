"use client";

import { useContext, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Menu,
  BarChart3,
  Bell,
  Settings,
  Home,
  TrendingUp,
  Zap,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WalletConnection } from "../wallet/wallet-connection";
import { WalletContext } from "@/context/WalletContext";
const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Trade", href: "/trade", icon: TrendingUp },
  { name: "Aggregator", href: "/aggregator", icon: Zap },
  { name: "Hedera Aggregator", href: "/hedera-aggregator", icon: Layers },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Alerts", href: "/alerts", icon: Bell },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Navbar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { accountId } = useContext(WalletContext);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl">HederaDEX</span>
          </Link>

          {accountId && (
            <nav className="hidden md:flex items-center gap-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                    location.pathname === item.href
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              ))}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          <WalletConnection />

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <div className="flex flex-col gap-4 mt-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 text-sm font-medium transition-colors hover:text-primary p-2 rounded-lg",
                      location.pathname === item.href
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
