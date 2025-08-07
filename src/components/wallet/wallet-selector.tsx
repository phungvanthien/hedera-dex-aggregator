"use client";

import { useState } from "react";
import { useContext } from "react";
import { WalletContext } from "@/context/WalletContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Wallet, Smartphone, Monitor } from "lucide-react";

export function WalletSelector() {
  const { connectWallet, connectEvmWallet } = useContext(WalletContext);
  const [isOpen, setIsOpen] = useState(false);

  const handleHashPackConnect = async () => {
    setIsOpen(false);
    try {
      await connectWallet();
    } catch (error) {
      console.error("HashPack connection failed:", error);
    }
  };

  const handleEvmConnect = async () => {
    setIsOpen(false);
    try {
      await connectEvmWallet();
    } catch (error) {
      console.error("EVM wallet connection failed:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 text-lg px-8 py-6">
          <Wallet className="h-5 w-5" />
          Connect Wallet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose Your Wallet</DialogTitle>
          <DialogDescription>
            Select your preferred wallet to connect to HederaDEX
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Button
            onClick={handleHashPackConnect}
            className="w-full justify-start h-16 text-left"
            variant="outline"
          >
            <div className="flex items-center gap-3">
              <Smartphone className="h-6 w-6 text-blue-500" />
              <div>
                <div className="font-semibold">HashPack</div>
                <div className="text-sm text-muted-foreground">
                  Recommended for Hedera
                </div>
              </div>
            </div>
          </Button>
          
          <Button
            onClick={handleEvmConnect}
            className="w-full justify-start h-16 text-left"
            variant="outline"
          >
            <div className="flex items-center gap-3">
              <Monitor className="h-6 w-6 text-orange-500" />
              <div>
                <div className="font-semibold">MetaMask / EVM</div>
                <div className="text-sm text-muted-foreground">
                  Connect via MetaMask or other EVM wallets
                </div>
              </div>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 