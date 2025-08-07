"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Loader2, DollarSign, Zap, Clock } from "lucide-react";
import { SwapQuote } from "@/services/swapService";

interface RouteComparisonProps {
  quote: SwapQuote | null;
  loading?: boolean;
  onSelectRoute?: (route: any) => void;
}

export function RouteComparison({ quote, loading, onSelectRoute }: RouteComparisonProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Route Comparison
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Finding best routes...</span>
          </div>
        ) : quote && quote.routes && quote.routes.length > 0 ? (
          quote.routes.map((route, index) => (
            <div
              key={route.aggregatorId || index}
              className={`p-4 rounded-lg border transition-all cursor-pointer hover:border-primary/50 ${
                route.aggregatorId === quote.bestRoute?.aggregatorId ? "border-primary bg-primary/5" : "border-muted"
              }`}
              onClick={() => onSelectRoute?.(route)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{route.dexName || 'Unknown DEX'}</span>
                  {route.aggregatorId === quote.bestRoute?.aggregatorId && <Badge className="text-xs">Best</Badge>}
                </div>
                <span className="font-bold text-green-500">{route.amountTo || '0'}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {route.fee || 0}%
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  {typeof route.priceImpact === 'number' ? route.priceImpact.toFixed(2) : '0.00'}%
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  ~15s
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                <Badge variant="outline" className="text-xs">
                  {route.dexName || 'Unknown'}
                </Badge>
              </div>

              <Button 
                size="sm" 
                className="w-full" 
                variant={route.aggregatorId === quote.bestRoute?.aggregatorId ? "default" : "outline"}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectRoute?.(route);
                }}
              >
                Select Route
              </Button>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Enter an amount to see available routes
          </div>
        )}
      </CardContent>
    </Card>
  )
}
