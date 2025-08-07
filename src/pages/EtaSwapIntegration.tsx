import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Wallet, 
  Zap, 
  TrendingUp, 
  ArrowRight, 
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowUpDown,
  Settings,
  ChevronDown,
  ExternalLink
} from 'lucide-react';

// Import EtaSwap components
import { HashPackConnectionTest } from '@/components/test/HashPackConnectionTest';
import { HashPackDiagnostic } from '@/components/test/HashPackDiagnostic';
import { ManualHashPackConnection } from '@/components/test/ManualHashPackConnection';
import { SessionStatusFix } from '@/components/test/SessionStatusFix';

// Mock data for EtaSwap
const MOCK_TOKENS = [
  { symbol: 'HBAR', name: 'Hedera', address: '0.0.3', decimals: 8, logoUrl: '/hedera-logo.svg', price: 0.0523 },
  { symbol: 'USDC', name: 'USD Coin', address: '0.0.456858', decimals: 6, logoUrl: '/usdc-logo.svg', price: 1.0000 },
  { symbol: 'USDT', name: 'Tether', address: '0.0.456859', decimals: 6, logoUrl: '/usdt-logo.svg', price: 1.0001 },
  { symbol: 'ETH', name: 'Ethereum', address: '0.0.456860', decimals: 18, logoUrl: '/eth-logo.svg', price: 2000.00 },
  { symbol: 'WBTC', name: 'Wrapped Bitcoin', address: '0.0.456861', decimals: 8, logoUrl: '/wbtc-logo.svg', price: 40000.00 },
];

const MOCK_PROVIDERS = [
  { name: 'SaucerSwap', fee: '0.28%', price: 0.0523, route: 'HBAR → USDC' },
  { name: 'HeliSwap', fee: '0.32%', price: 0.0522, route: 'HBAR → USDC' },
  { name: 'Pangolin', fee: '0.22%', price: 0.0524, route: 'HBAR → USDC' },
];

export function EtaSwapIntegration() {
  const [activeTab, setActiveTab] = useState('swap');
  const [fromToken, setFromToken] = useState(MOCK_TOKENS[0]);
  const [toToken, setToToken] = useState(MOCK_TOKENS[1]);
  const [fromAmount, setFromAmount] = useState('100');
  const [toAmount, setToAmount] = useState('5.23');
  const [slippage, setSlippage] = useState(1);
  const [selectedProvider, setSelectedProvider] = useState(MOCK_PROVIDERS[0]);
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  const handleSwitchTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const handleConnectWallet = () => {
    setIsConnected(true);
    setWalletAddress('0.0.9451398');
  };

  const handleSwap = () => {
    // Mock swap functionality
    console.log('Executing swap...');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">EtaSwap</h1>
              <p className="text-gray-600">Advanced DEX Aggregator</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {!isConnected ? (
              <Button onClick={handleConnectWallet} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                <Wallet className="h-4 w-4 mr-2" />
                Connect Wallet
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
                <span className="text-sm text-gray-600 font-mono">{walletAddress}</span>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Swap Interface */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-xl font-semibold">Swap</span>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* From Token */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">From</label>
                    <span className="text-sm text-gray-500">Balance: 1,000 {fromToken.symbol}</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{fromToken.symbol[0]}</span>
                      </div>
                      <div className="flex-1">
                        <Input
                          type="number"
                          value={fromAmount}
                          onChange={(e) => setFromAmount(e.target.value)}
                          className="border-0 bg-transparent text-2xl font-semibold p-0 h-auto"
                          placeholder="0.0"
                        />
                        <p className="text-sm text-gray-500">≈ ${(parseFloat(fromAmount) * fromToken.price).toFixed(2)}</p>
                      </div>
                    </div>
                    <Button variant="outline" className="flex items-center gap-2">
                      {fromToken.symbol}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Switch Button */}
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSwitchTokens}
                    className="rounded-full w-10 h-10 p-0"
                  >
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </div>

                {/* To Token */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">To</label>
                    <span className="text-sm text-gray-500">Balance: 50 {toToken.symbol}</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{toToken.symbol[0]}</span>
                      </div>
                      <div className="flex-1">
                        <Input
                          type="number"
                          value={toAmount}
                          onChange={(e) => setToAmount(e.target.value)}
                          className="border-0 bg-transparent text-2xl font-semibold p-0 h-auto"
                          placeholder="0.0"
                        />
                        <p className="text-sm text-gray-500">≈ ${(parseFloat(toAmount) * toToken.price).toFixed(2)}</p>
                      </div>
                    </div>
                    <Button variant="outline" className="flex items-center gap-2">
                      {toToken.symbol}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Swap Button */}
                <Button
                  onClick={handleSwap}
                  disabled={!isConnected}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 h-12 text-lg font-semibold"
                >
                  {!isConnected ? 'Connect Wallet to Swap' : 'Swap'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Provider Selection */}
          <div className="space-y-6">
            {/* Best Route */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">Best Route</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {MOCK_PROVIDERS.map((provider, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedProvider(provider)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedProvider.name === provider.name
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{provider.name[0]}</span>
                        </div>
                        <span className="font-semibold">{provider.name}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {provider.fee}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{provider.route}</span>
                      <span className="font-mono font-semibold">${provider.price}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Swap Details */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">Swap Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Rate</span>
                  <span className="font-mono">1 {fromToken.symbol} = {toToken.price / fromToken.price} {toToken.symbol}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Provider Fee</span>
                  <span className="font-mono">{selectedProvider.fee}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Network Fee</span>
                  <span className="font-mono">~$0.001</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Minimum Received</span>
                  <span className="font-mono">{(parseFloat(toAmount) * (1 - slippage / 100)).toFixed(6)} {toToken.symbol}</span>
                </div>
              </CardContent>
            </Card>

            {/* Slippage Settings */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">Slippage Tolerance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  {[0.5, 1, 2].map((value) => (
                    <Button
                      key={value}
                      variant={slippage === value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSlippage(value)}
                      className="flex-1"
                    >
                      {value}%
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Testing Section */}
        <div className="mt-12">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Testing & Debug Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <HashPackConnectionTest />
                <HashPackDiagnostic />
                <ManualHashPackConnection />
                <SessionStatusFix />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
