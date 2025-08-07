import { useContext } from 'react';
import { WalletContext } from '@/context/WalletContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export function WalletDebug() {
  const walletContext = useContext(WalletContext);
  
  const {
    accountId,
    balance,
    connected,
    isConnected,
    isEvmConnected,
    walletType,
    hederaAccountIds,
    isPaired,
    pairingString
  } = walletContext;

  return (
    <Card className="hedera-card">
      <CardHeader>
        <CardTitle className="text-white text-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 text-yellow-400" />
          Wallet Debug Info
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Account ID:</span>
            <code className="text-green-400 font-mono text-xs">
              {accountId || "null"}
            </code>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Balance:</span>
            <span className="text-green-400">
              {balance || "null"}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Connected (Boolean):</span>
            <Badge className={connected ? "bg-green-500 text-white" : "bg-red-500 text-white"}>
              {connected ? "true" : "false"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-300">isConnected (Alias):</span>
            <Badge className={isConnected ? "bg-green-500 text-white" : "bg-red-500 text-white"}>
              {isConnected ? "true" : "false"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-300">isEvmConnected:</span>
            <Badge className={isEvmConnected ? "bg-green-500 text-white" : "bg-red-500 text-white"}>
              {isEvmConnected ? "true" : "false"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Wallet Type:</span>
            <Badge className="bg-blue-500 text-white">
              {walletType || "null"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-300">isPaired:</span>
            <Badge className={isPaired ? "bg-green-500 text-white" : "bg-red-500 text-white"}>
              {isPaired ? "true" : "false"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Hedera Account IDs:</span>
            <span className="text-blue-400 text-xs">
              {hederaAccountIds.length > 0 ? hederaAccountIds.join(", ") : "[]"}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Pairing String:</span>
            <span className="text-gray-400 text-xs">
              {pairingString ? `${pairingString.substring(0, 20)}...` : "null"}
            </span>
          </div>
          
          <div className="mt-4 p-2 bg-gray-800 rounded">
            <div className="text-xs text-gray-400 mb-1">Raw Context:</div>
            <pre className="text-xs text-gray-300 overflow-x-auto">
              {JSON.stringify(walletContext, null, 2)}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 