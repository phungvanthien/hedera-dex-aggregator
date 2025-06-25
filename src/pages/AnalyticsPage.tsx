import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Users, Zap } from "lucide-react"
import { TradingChart } from "@/components/trade/trading-chart"

const stats = [
  {
    title: "Total Volume (24h)",
    value: "$2.4M",
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
  },
  {
    title: "Active Traders",
    value: "1,234",
    change: "+8.2%",
    trend: "up",
    icon: Users,
  },
  {
    title: "Total Transactions",
    value: "45,678",
    change: "+15.3%",
    trend: "up",
    icon: BarChart3,
  },
  {
    title: "Avg. Trade Size",
    value: "$523",
    change: "-2.1%",
    trend: "down",
    icon: Zap,
  },
]

const topPairs = [
  { pair: "HBAR/USDC", volume: "$1.2M", change: "+5.2%" },
  { pair: "SAUCE/HBAR", volume: "$456K", change: "+12.8%" },
  { pair: "HELI/HBAR", volume: "$234K", change: "-3.1%" },
  { pair: "DOVU/HBAR", volume: "$123K", change: "+8.7%" },
]

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Comprehensive trading insights and market analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {stat.trend === "up" ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-sm ${stat.trend === "up" ? "text-green-500" : "text-red-500"}`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2">
          <Card className="h-[500px]">
            <CardHeader>
              <CardTitle>Trading Volume</CardTitle>
            </CardHeader>
            <CardContent className="h-full">
              <TradingChart />
            </CardContent>
          </Card>
        </div>

        {/* Top Trading Pairs */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Top Trading Pairs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {topPairs.map((pair, index) => (
                <div key={pair.pair} className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{pair.pair}</div>
                    <div className="text-sm text-muted-foreground">{pair.volume}</div>
                  </div>
                  <Badge variant={pair.change.startsWith("+") ? "default" : "destructive"}>{pair.change}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="mt-6">
        <Tabs defaultValue="volume" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="volume">Volume Analysis</TabsTrigger>
            <TabsTrigger value="liquidity">Liquidity Depth</TabsTrigger>
            <TabsTrigger value="fees">Fee Analysis</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="volume" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Volume Distribution by DEX</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>SaucerSwap</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="w-3/4 h-full bg-primary rounded-full" />
                      </div>
                      <span className="text-sm">75%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Pangolin</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="w-1/5 h-full bg-blue-500 rounded-full" />
                      </div>
                      <span className="text-sm">15%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>HeliSwap</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="w-1/12 h-full bg-green-500 rounded-full" />
                      </div>
                      <span className="text-sm">8%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>HSuite</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="w-1/50 h-full bg-purple-500 rounded-full" />
                      </div>
                      <span className="text-sm">2%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="liquidity" className="mt-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-muted-foreground">Liquidity depth analysis coming soon</div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fees" className="mt-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-muted-foreground">Fee analysis coming soon</div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="mt-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-muted-foreground">Performance metrics coming soon</div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
