import { useContext } from 'react';
import { WalletContext } from '@/context/WalletContext';
import { Wallet, ArrowUp } from 'lucide-react';

export function WalletConnectionNotice() {
  const { connected } = useContext(WalletContext);

  if (connected) {
    return null; // Don't show notice when connected
  }

  return (
    <div className="mb-4 p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
      <div className="text-center">
        <div className="flex items-center justify-center mb-2">
          <Wallet className="w-5 h-5 text-blue-400 mr-2" />
          <p className="text-sm text-blue-400 font-medium">
            Connect Your Wallet to Start Trading
          </p>
        </div>
        <div className="flex items-center justify-center space-x-1">
          <ArrowUp className="w-4 h-4 text-gray-400" />
          <p className="text-xs text-gray-400">
            Use the "Connect Wallet" button in the navigation bar above
          </p>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Supports HashPack and EVM wallets
        </div>
      </div>
    </div>
  );
}

export function WalletRequiredMessage() {
  const { connected } = useContext(WalletContext);

  if (connected) {
    return null;
  }

  return (
    <div className="text-center py-8">
      <div className="mb-4">
        <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-2" />
        <h3 className="text-lg font-medium text-gray-300 mb-2">
          Wallet Connection Required
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          Please connect your Hedera wallet to access trading features
        </p>
      </div>
    </div>
  );
} 