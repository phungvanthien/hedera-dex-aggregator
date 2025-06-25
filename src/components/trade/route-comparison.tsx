import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, Zap, DollarSign, Clock } from "lucide-react"

const routes = [
  {
    id: "best",
    title: "Best Route",
    output: "1,234.56 USDC",
    fee: "$0.12",
    slippage: "0.05%",
    time: "~15s",
    dexs: ["SaucerSwap", "Pangolin"],
    recommended: true,
  },
  {
    id: "saucer",
    title: "SaucerSwap Only",
    output: "1,230.45 USDC",
    fee: "$0.08",
    slippage: "0.12%",
    time: "~10s",
    dexs: ["SaucerSwap"],
  },
  {
    id: "multi",
    title: "Multi-DEX Split",
    output: "1,232.78 USDC",
    fee: "$0.15",
    slippage: "0.08%",
    time: "~20s",
    dexs: ["SaucerSwap", "HeliSwap", "Pangolin"],
  },
  {
    id: "lowest",
    title: "Lowest Fee",
    output: "1,225.90 USDC",
    fee: "$0.05",
    slippage: "0.18%",
    time: "~12s",
    dexs: ["HSuite"],
  },
]

export function RouteComparison() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Route Comparison
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {routes.map((route) => (
          <div
            key={route.id}
            className={`p-4 rounded-lg border transition-all cursor-pointer hover:border-primary/50 ${
              route.recommended ? "border-primary bg-primary/5" : "border-muted"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{route.title}</span>
                {route.recommended && <Badge className="text-xs">Recommended</Badge>}
              </div>
              <span className="font-bold text-green-500">{route.output}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                {route.fee}
              </div>
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                {route.slippage}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {route.time}
              </div>
            </div>

            <div className="flex flex-wrap gap-1 mb-3">
              {route.dexs.map((dex) => (
                <Badge key={dex} variant="outline" className="text-xs">
                  {dex}
                </Badge>
              ))}
            </div>

            <Button size="sm" className="w-full" variant={route.recommended ? "default" : "outline"}>
              Select Route
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
