"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowUpDown, Settings, Wallet, TrendingUp } from "lucide-react"
import { TokenSelector } from "@/components/trade/token-selector"
import { RouteComparison } from "@/components/trade/route-comparison"
import { TradingChart } from "@/components/trade/trading-chart"
import { WalletConnection } from "@/components/wallet/wallet-connection"

export default function TradePage() {
  const [fromToken, setFromToken] = useState("HBAR")
  const [toToken, setToToken] = useState("USDC")
  const [fromAmount, setFromAmount] = useState("")
  const [toAmount, setToAmount] = useState("")
  const [slippage, setSlippage] = useState("0.5")

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Trading Interface */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Swap</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
                <WalletConnection />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* From Token */}
              <div className="space-y-2">
                <Label>From</Label>
                <div className="flex gap-2">
                  <TokenSelector value={fromToken} onChange={setFromToken} balance="1,234.56" />
                  <Input
                    placeholder="0.0"
                    value={fromAmount}
                    onChange={(e) => setFromAmount(e.target.value)}
                    className="text-right"
                  />
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Balance: 1,234.56 HBAR</span>
                  <Button variant="ghost" size="sm" className="h-auto p-0">
                    MAX
                  </Button>
                </div>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full"
                  onClick={() => {
                    const temp = fromToken
                    setFromToken(toToken)
                    setToToken(temp)
                  }}
                >
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>

              {/* To Token */}
              <div className="space-y-2">
                <Label>To</Label>
                <div className="flex gap-2">
                  <TokenSelector value={toToken} onChange={setToToken} balance="0.00" />
                  <Input
                    placeholder="0.0"
                    value={toAmount}
                    onChange={(e) => setToAmount(e.target.value)}
                    className="text-right"
                    readOnly
                  />
                </div>
                <div className="text-sm text-muted-foreground">Balance: 0.00 USDC</div>
              </div>

              {/* Price Impact */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Price Impact</span>
                <span className="text-green-500">{"<0.01%"}</span>
              </div>

              {/* Slippage */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Slippage Tolerance</span>
                <Badge variant="secondary">{slippage}%</Badge>
              </div>

              {/* Swap Button */}
              <Button className="w-full" size="lg">
                <Wallet className="mr-2 h-4 w-4" />
                Connect Wallet
              </Button>
            </CardContent>
          </Card>

          {/* Route Comparison */}
          <RouteComparison />
        </div>

        {/* Chart */}
        <div className="lg:col-span-2">
          <Card className="h-[600px]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>HBAR/USDC</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-green-500">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    +2.34%
                  </Badge>
                  <span className="text-2xl font-bold">$0.0523</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-full">
              <TradingChart />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Additional Features */}
      <div className="mt-6">
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="orders">Open Orders</TabsTrigger>
            <TabsTrigger value="history">Trade History</TabsTrigger>
            <TabsTrigger value="alerts">Price Alerts</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          </TabsList>
          <TabsContent value="orders" className="mt-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-muted-foreground">No open orders</div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="history" className="mt-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-muted-foreground">No trade history</div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="alerts" className="mt-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-muted-foreground">No price alerts set</div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="portfolio" className="mt-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-muted-foreground">Connect wallet to view portfolio</div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
