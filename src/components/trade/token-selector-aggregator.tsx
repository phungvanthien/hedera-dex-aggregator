"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp } from "lucide-react";

interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  icon: string;
  price?: number;
  change24h?: number;
}

interface TokenSelectorProps {
  selectedToken: Token;
  onTokenSelect: (token: Token) => void;
  tokens: Token[];
  disabled?: boolean;
}

export function TokenSelectorAggregator({
  selectedToken,
  onTokenSelect,
  tokens,
  disabled = false,
}: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTokens = tokens.filter((token) =>
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTokenSelect = (token: Token) => {
    onTokenSelect(token);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between h-12 px-3"
          disabled={disabled}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">{selectedToken.icon}</span>
            <div className="text-left">
              <div className="font-medium">{selectedToken.symbol}</div>
              <div className="text-xs text-muted-foreground">
                {selectedToken.name}
              </div>
            </div>
          </div>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Token</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tokens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredTokens.map((token) => (
              <Button
                key={token.symbol}
                variant="ghost"
                className="w-full justify-start h-16 p-3"
                onClick={() => handleTokenSelect(token)}
              >
                <div className="flex items-center gap-3 w-full">
                  <span className="text-xl">{token.icon}</span>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{token.symbol}</div>
                    <div className="text-sm text-muted-foreground">
                      {token.name}
                    </div>
                  </div>
                  {token.price && (
                    <div className="text-right">
                      <div className="font-medium">${token.price.toFixed(4)}</div>
                      {token.change24h && (
                        <Badge
                          variant={token.change24h >= 0 ? "default" : "destructive"}
                          className="text-xs"
                        >
                          {token.change24h >= 0 ? "+" : ""}{token.change24h.toFixed(2)}%
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 