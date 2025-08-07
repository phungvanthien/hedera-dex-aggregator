import { useContext } from 'react';
import { WalletContext } from '@/context/WalletContext';
import { CheckCircle, XCircle } from 'lucide-react';
import { SimpleBalanceDisplay } from './balance-display';

interface WalletStatusIndicatorProps {
  showDetails?: boolean;
  className?: string;
}

export function WalletStatusIndicator({ showDetails = false, className = "" }: WalletStatusIndicatorProps) {
  const { accountId, balance, connected } = useContext(WalletContext);

  if (!connected || !accountId) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <XCircle className="w-4 h-4 text-red-400" />
        <span className="text-sm text-red-400 font-medium">Not Connected</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <CheckCircle className="w-4 h-4 text-green-400" />
      <span className="text-sm text-green-400 font-medium">Connected</span>
      
      {showDetails && (
        <div className="ml-2 text-xs text-gray-400">
          {balance ? `${balance} HBAR` : 'Loading...'}
        </div>
      )}
    </div>
  );
}

export function WalletStatusCard() {
  const { accountId, balance, connected } = useContext(WalletContext);

  if (!connected || !accountId) {
    return (
      <div className="wallet-status disconnected p-3 rounded-lg">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <XCircle className="w-4 h-4 text-red-400" />
            <span className="text-sm text-red-400 font-medium">
              Wallet not connected
            </span>
          </div>
          <p className="text-xs text-gray-400 mb-3">
            Connect your Hedera wallet using the button in the navigation bar to start trading
          </p>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            <span className="text-xs text-gray-400">Please connect wallet</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wallet-status connected p-3 rounded-lg">
      <div className="flex items-center space-x-2 mb-2">
        <CheckCircle className="w-4 h-4 text-green-400" />
        <span className="text-sm font-medium text-white">
          Hedera Wallet Connected
        </span>
      </div>
      <div className="w-full flex justify-center">
        <code className="text-xs text-gray-400 font-mono text-center break-all">
          {accountId}
        </code>
      </div>
      <div className="text-center mt-2">
        <SimpleBalanceDisplay className="text-sm text-green-400" />
      </div>
      <div className="text-center mt-1">
        <span className="text-xs text-gray-400">
          Ready to trade
        </span>
      </div>
    </div>
  );
} 