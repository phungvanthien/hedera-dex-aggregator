"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Search } from "lucide-react";

interface TokenSelectorProps {
  value: string;
  onChange: (value: string) => void;
  balance: string;
}

export function TokenSelector({
  value,
  onChange,
  balance,
}: TokenSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [tokens, setTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTokens = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          "https://mainnet-public.mirrornode.hedera.com/api/v1/tokens?limit=10"
        );
        const data = await res.json();
        console.log("Fetched tokens:", data.tokens);
        setTokens(data.tokens || []);
      } catch (err) {
        setError("Failed to fetch tokens");
      } finally {
        setLoading(false);
      }
    };
    fetchTokens();
  }, []);

  const selectedToken = tokens.find((token) => token.symbol === value);
  const filteredTokens = tokens.filter(
    (token) =>
      token.symbol?.toLowerCase().includes(search.toLowerCase()) ||
      token.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 min-w-[120px]"
        >
          {selectedToken && (
            <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold">
              {selectedToken.logo}
            </div>
          )}
          <span>{value}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select Token</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tokens..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {loading && <div className="text-center">Loading tokens...</div>}
            {error && <div className="text-center text-red-500">{error}</div>}
            {!loading &&
              !error &&
              filteredTokens.map((token) => (
                <Button
                  key={token.token_id || token.symbol}
                  variant="ghost"
                  className="w-full justify-between h-auto p-3"
                  onClick={() => {
                    onChange(token.symbol);
                    setOpen(false);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold">
                      {token.symbol?.[0] || "?"}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">{token.symbol}</div>
                      <div className="text-sm text-muted-foreground">
                        {token.name}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">-</div>
                    <Badge variant="secondary" className="text-xs">
                      Balance
                    </Badge>
                  </div>
                </Button>
              ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
