import { useContext, useState } from 'react';
import { WalletContext } from '@/context/WalletContext';
import { Input } from '@/components/ui/input';
import { ChevronDown } from 'lucide-react';
import { BalanceDisplay, SimpleBalanceDisplay, HBARBalanceDisplay, TokenBalanceDisplay } from '@/components/wallet/balance-display';
import { TokenDropdown } from './token-dropdown';

interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logoUrl: string;
  price?: number;
}

interface TokenInputProps {
  label: string;
  token: Token;
  amount: string;
  onAmountChange: (amount: string) => void;
  readOnly?: boolean;
  showMaxButton?: boolean;
  onTokenSelect?: (token: Token) => void;
  availableTokens?: Token[];
  getTokenBalance?: (symbol: string) => string;
  isLoading?: boolean;
  error?: string | null;
}

export function TokenInput({
  label,
  token,
  amount,
  onAmountChange,
  readOnly = false,
  showMaxButton = true,
  onTokenSelect,
  availableTokens = [],
  getTokenBalance,
  isLoading = false,
  error = null
}: TokenInputProps) {
  const { balance, connected } = useContext(WalletContext);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleMaxClick = () => {
    if (balance && connected) {
      onAmountChange(balance);
    }
  };

  const handleAmountChange = (value: string) => {
    // Prevent negative numbers
    const numValue = parseFloat(value);
    if (value === '' || value === '0' || (numValue >= 0 && !isNaN(numValue))) {
      onAmountChange(value);
    }
  };

  const calculateUSDValue = () => {
    if (!amount || !token.price) return "0.00";
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return "0.00";
    return (numAmount * token.price).toFixed(2);
  };

  const handleTokenSelect = (selectedToken: Token) => {
    if (onTokenSelect) {
      onTokenSelect(selectedToken);
    }
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-300">
          {label}
        </label>
        <div className="flex items-center gap-2">
          {showMaxButton && connected && Number(balance) > 0 && (
            <button
              type="button"
              className="px-2 py-0.5 rounded bg-green-500 text-black text-xs font-semibold mr-2 hover:bg-green-400 transition-colors"
              onClick={handleMaxClick}
            >
              Max
            </button>
          )}
          {getTokenBalance ? (
            <TokenBalanceDisplay 
              tokenSymbol={token.symbol} 
              getTokenBalance={getTokenBalance}
              isLoading={isLoading}
              error={error}
            />
          ) : label === "You pay" ? (
            <HBARBalanceDisplay />
          ) : (
            <SimpleBalanceDisplay />
          )}
        </div>
      </div>
      <div className="token-selector rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Input
              type="number"
              min="0"
              step="any"
              placeholder={connected ? "0" : "Connect wallet first"}
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              readOnly={readOnly}
              disabled={!connected}
              className="bg-transparent border-none text-2xl font-bold text-white placeholder-gray-400 p-0 h-auto focus:ring-0"
            />
            <div className="text-sm text-gray-400 mt-1">
              ≈ ${calculateUSDValue()}
            </div>
          </div>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-2 rounded-lg px-3 py-2 ml-4 bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center">
              <span className="text-xs font-bold text-gray-800">
                {token.symbol.charAt(0)}
              </span>
            </div>
            <span className="ml-2 font-semibold text-white">
              {token.symbol}
            </span>
            <ChevronDown className="w-4 h-4 ml-1 text-white" />
          </button>
        </div>
        
        {/* Token Dropdown */}
        {availableTokens.length > 0 && (
          <TokenDropdown
            isOpen={showDropdown}
            onClose={() => setShowDropdown(false)}
            tokens={availableTokens}
            selectedToken={token}
            onTokenSelect={handleTokenSelect}
            className="w-full"
          />
        )}
      </div>
    </div>
  );
} 