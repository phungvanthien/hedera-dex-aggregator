"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Bell, Plus, TrendingUp, Target, Repeat } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const mockAlerts = [
  {
    id: 1,
    pair: "HBAR/USDC",
    type: "Price Above",
    target: "$0.055",
    current: "$0.0523",
    status: "Active",
    created: "2024-01-15",
  },
  {
    id: 2,
    pair: "SAUCE/HBAR",
    type: "Price Below",
    target: "0.00045",
    current: "0.00052",
    status: "Active",
    created: "2024-01-14",
  },
]

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(mockAlerts)

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Price Alerts</h1>
          <p className="text-muted-foreground">Set up automated trading alerts and strategies</p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Alert
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>Create Price Alert</AlertDialogTitle>
              <AlertDialogDescription>Set up a new price alert for automated trading</AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Token Pair</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select pair" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hbar-usdc">HBAR/USDC</SelectItem>
                    <SelectItem value="sauce-hbar">SAUCE/HBAR</SelectItem>
                    <SelectItem value="heli-hbar">HELI/HBAR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Alert Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="above">Price Above</SelectItem>
                    <SelectItem value="below">Price Below</SelectItem>
                    <SelectItem value="range">Price Range</SelectItem>
                    <SelectItem value="change">% Change</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Target Price</Label>
                <Input placeholder="0.0" />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="auto-execute" />
                <Label htmlFor="auto-execute">Auto-execute trade</Label>
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Create Alert</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active">Active Alerts</TabsTrigger>
          <TabsTrigger value="history">Alert History</TabsTrigger>
          <TabsTrigger value="strategies">Trading Strategies</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          <div className="grid gap-4">
            {alerts.map((alert) => (
              <Card key={alert.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Bell className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold">{alert.pair}</div>
                        <div className="text-sm text-muted-foreground">
                          {alert.type} {alert.target}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{alert.current}</div>
                      <Badge variant="secondary" className="text-green-500">
                        {alert.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="strategies" className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Stop-Loss Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Automatically sell when price drops to specified level
                </p>
                <Button variant="outline" className="w-full">
                  Set Up Stop-Loss
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  Take-Profit Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Automatically sell when price reaches profit target
                </p>
                <Button variant="outline" className="w-full">
                  Set Up Take-Profit
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Repeat className="h-5 w-5 text-purple-500" />
                  Dollar-Cost Averaging
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Recurring purchases at regular intervals</p>
                <Button variant="outline" className="w-full">
                  Set Up DCA
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">No alert history available</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Alert Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive email alerts when conditions are met</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Browser notifications for price alerts</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-Execute Trades</Label>
                  <p className="text-sm text-muted-foreground">Automatically execute trades when alerts trigger</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
