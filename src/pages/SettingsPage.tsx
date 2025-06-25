"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { useTheme } from "@/components/theme-provider"
import { Moon, Sun, Monitor, Bell, Shield, Zap, Palette, Volume2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

// Settings interface for type safety
interface AppSettings {
  // Appearance
  compactMode: boolean
  animations: boolean
  colorScheme: string
  fontSize: number

  // Trading
  defaultSlippage: number
  gasPrice: string
  autoApprove: boolean
  expertMode: boolean
  multiHop: boolean

  // Notifications
  priceAlerts: boolean
  tradeConfirmations: boolean
  marketUpdates: boolean
  systemMaintenance: boolean
  emailNotifications: string
  soundEnabled: boolean

  // Security
  transactionSigning: boolean
  autoDisconnect: boolean
  privacyMode: boolean
  sessionTimeout: number
}

const defaultSettings: AppSettings = {
  compactMode: false,
  animations: true,
  colorScheme: "blue",
  fontSize: 16,
  defaultSlippage: 0.5,
  gasPrice: "standard",
  autoApprove: false,
  expertMode: false,
  multiHop: true,
  priceAlerts: true,
  tradeConfirmations: true,
  marketUpdates: false,
  systemMaintenance: true,
  emailNotifications: "",
  soundEnabled: true,
  transactionSigning: true,
  autoDisconnect: false,
  privacyMode: false,
  sessionTimeout: 30,
}

const colorSchemes = [
  { id: "blue", name: "Ocean Blue", color: "#09182D" },
  { id: "purple", name: "Deep Purple", color: "#1a0b2e" },
  { id: "green", name: "Forest Green", color: "#0f2027" },
  { id: "red", name: "Dark Red", color: "#2d1b1b" },
]

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)
  const [mounted, setMounted] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Load settings from localStorage on mount
  useEffect(() => {
    setMounted(true)
    const savedSettings = localStorage.getItem("app-settings")
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings({ ...defaultSettings, ...parsed })
      } catch (error) {
        console.error("Failed to parse saved settings:", error)
      }
    }
  }, [])

  // Save settings to localStorage
  const saveSettings = () => {
    localStorage.setItem("app-settings", JSON.stringify(settings))
    setHasChanges(false)

    // Apply settings to document
    applySettings(settings)

    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
    })
  }

  // Apply settings to the document
  const applySettings = (newSettings: AppSettings) => {
    const root = document.documentElement

    // Apply color scheme
    const selectedScheme = colorSchemes.find((s) => s.id === newSettings.colorScheme)
    if (selectedScheme && theme === "dark") {
      root.style.setProperty("--background", selectedScheme.color)
    }

    // Apply font size
    root.style.setProperty("--font-size-base", `${newSettings.fontSize}px`)

    // Apply compact mode
    if (newSettings.compactMode) {
      root.classList.add("compact-mode")
    } else {
      root.classList.remove("compact-mode")
    }

    // Apply animations
    if (!newSettings.animations) {
      root.classList.add("no-animations")
    } else {
      root.classList.remove("no-animations")
    }
  }

  // Update a specific setting
  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  // Reset settings to default
  const resetSettings = () => {
    setSettings(defaultSettings)
    setHasChanges(true)
    toast({
      title: "Settings reset",
      description: "All settings have been reset to default values.",
    })
  }

  if (!mounted) return null

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Customize your trading experience and preferences</p>
        </div>
        <div className="flex gap-2">
          {hasChanges && (
            <>
              <Button variant="outline" onClick={resetSettings}>
                Reset
              </Button>
              <Button onClick={saveSettings}>Save Changes</Button>
            </>
          )}
        </div>
      </div>

      <Tabs defaultValue="appearance" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="trading">Trading</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="appearance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Theme</Label>
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    onClick={() => setTheme("light")}
                    className="flex items-center gap-2"
                  >
                    <Sun className="h-4 w-4" />
                    Light
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    onClick={() => setTheme("dark")}
                    className="flex items-center gap-2"
                  >
                    <Moon className="h-4 w-4" />
                    Dark
                  </Button>
                  <Button
                    variant={theme === "system" ? "default" : "outline"}
                    onClick={() => setTheme("system")}
                    className="flex items-center gap-2"
                  >
                    <Monitor className="h-4 w-4" />
                    System
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Color Scheme (Dark Theme)</Label>
                <p className="text-sm text-muted-foreground">Choose your preferred color scheme for dark mode</p>
                <div className="grid grid-cols-2 gap-3">
                  {colorSchemes.map((scheme) => (
                    <Button
                      key={scheme.id}
                      variant={settings.colorScheme === scheme.id ? "default" : "outline"}
                      onClick={() => updateSetting("colorScheme", scheme.id)}
                      className="flex items-center gap-3 h-auto p-3"
                    >
                      <div
                        className="w-6 h-6 rounded-full border-2 border-white/20"
                        style={{ backgroundColor: scheme.color }}
                      />
                      <span>{scheme.name}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Font Size</Label>
                <div className="space-y-2">
                  <Slider
                    value={[settings.fontSize]}
                    onValueChange={([value]) => updateSetting("fontSize", value)}
                    min={12}
                    max={20}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Small (12px)</span>
                    <span>Current: {settings.fontSize}px</span>
                    <span>Large (20px)</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Compact Mode</Label>
                  <p className="text-sm text-muted-foreground">Reduce spacing and padding for more content</p>
                </div>
                <Switch
                  checked={settings.compactMode}
                  onCheckedChange={(checked) => updateSetting("compactMode", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Animations</Label>
                  <p className="text-sm text-muted-foreground">Enable smooth transitions and animations</p>
                </div>
                <Switch
                  checked={settings.animations}
                  onCheckedChange={(checked) => updateSetting("animations", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trading" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Trading Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Default Slippage Tolerance (%)</Label>
                <div className="space-y-2">
                  <Slider
                    value={[settings.defaultSlippage]}
                    onValueChange={([value]) => updateSetting("defaultSlippage", value)}
                    min={0.1}
                    max={5.0}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>0.1%</span>
                    <span>Current: {settings.defaultSlippage}%</span>
                    <span>5.0%</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Maximum price movement you're willing to accept</p>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Gas Price Setting</Label>
                <Select value={settings.gasPrice} onValueChange={(value) => updateSetting("gasPrice", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="slow">Slow (Lower fees)</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="fast">Fast (Higher fees)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-approve Tokens</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically approve token spending for known contracts
                  </p>
                </div>
                <Switch
                  checked={settings.autoApprove}
                  onCheckedChange={(checked) => updateSetting("autoApprove", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Expert Mode</Label>
                  <p className="text-sm text-muted-foreground">Enable advanced trading features and bypass warnings</p>
                </div>
                <Switch
                  checked={settings.expertMode}
                  onCheckedChange={(checked) => updateSetting("expertMode", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Multi-hop Trading</Label>
                  <p className="text-sm text-muted-foreground">Allow trades through multiple DEXs for better rates</p>
                </div>
                <Switch checked={settings.multiHop} onCheckedChange={(checked) => updateSetting("multiHop", checked)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Price Alerts</Label>
                  <p className="text-sm text-muted-foreground">Get notified when price targets are reached</p>
                </div>
                <Switch
                  checked={settings.priceAlerts}
                  onCheckedChange={(checked) => updateSetting("priceAlerts", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Trade Confirmations</Label>
                  <p className="text-sm text-muted-foreground">Notifications for successful trades</p>
                </div>
                <Switch
                  checked={settings.tradeConfirmations}
                  onCheckedChange={(checked) => updateSetting("tradeConfirmations", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Market Updates</Label>
                  <p className="text-sm text-muted-foreground">Daily market summaries and insights</p>
                </div>
                <Switch
                  checked={settings.marketUpdates}
                  onCheckedChange={(checked) => updateSetting("marketUpdates", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>System Maintenance</Label>
                  <p className="text-sm text-muted-foreground">Important system updates and maintenance notices</p>
                </div>
                <Switch
                  checked={settings.systemMaintenance}
                  onCheckedChange={(checked) => updateSetting("systemMaintenance", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4" />
                    Sound Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">Play sounds for important notifications</p>
                </div>
                <Switch
                  checked={settings.soundEnabled}
                  onCheckedChange={(checked) => updateSetting("soundEnabled", checked)}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Email Notifications</Label>
                <Input
                  placeholder="your@email.com"
                  value={settings.emailNotifications}
                  onChange={(e) => updateSetting("emailNotifications", e.target.value)}
                />
                <p className="text-sm text-muted-foreground">Receive important alerts via email</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Transaction Signing</Label>
                  <p className="text-sm text-muted-foreground">Require wallet confirmation for all transactions</p>
                </div>
                <Switch
                  checked={settings.transactionSigning}
                  onCheckedChange={(checked) => updateSetting("transactionSigning", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-disconnect Wallet</Label>
                  <p className="text-sm text-muted-foreground">Automatically disconnect after period of inactivity</p>
                </div>
                <Switch
                  checked={settings.autoDisconnect}
                  onCheckedChange={(checked) => updateSetting("autoDisconnect", checked)}
                />
              </div>

              {settings.autoDisconnect && (
                <div className="space-y-3 ml-6">
                  <Label>Session Timeout (minutes)</Label>
                  <div className="space-y-2">
                    <Slider
                      value={[settings.sessionTimeout]}
                      onValueChange={([value]) => updateSetting("sessionTimeout", value)}
                      min={5}
                      max={120}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>5 min</span>
                      <span>Current: {settings.sessionTimeout} min</span>
                      <span>120 min</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <Label>Privacy Mode</Label>
                  <p className="text-sm text-muted-foreground">Hide wallet balances and transaction amounts</p>
                </div>
                <Switch
                  checked={settings.privacyMode}
                  onCheckedChange={(checked) => updateSetting("privacyMode", checked)}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Trusted Contracts</Label>
                <p className="text-sm text-muted-foreground">Manage your list of trusted smart contracts</p>
                <Button
                  variant="outline"
                  onClick={() =>
                    toast({
                      title: "Feature coming soon",
                      description: "Contract management will be available in the next update.",
                    })
                  }
                >
                  Manage Contracts
                </Button>
              </div>

              <div className="space-y-3">
                <Label>Session Management</Label>
                <p className="text-sm text-muted-foreground">View and manage your active sessions</p>
                <Button
                  variant="outline"
                  onClick={() =>
                    toast({
                      title: "Feature coming soon",
                      description: "Session management will be available in the next update.",
                    })
                  }
                >
                  View Sessions
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
