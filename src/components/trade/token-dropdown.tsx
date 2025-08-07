import React from 'react';
import { ChevronDown } from 'lucide-react';

interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logoUrl: string;
  price?: number;
}

interface TokenDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  tokens: Token[];
  selectedToken: Token;
  onTokenSelect: (token: Token) => void;
  className?: string;
}

export function TokenDropdown({
  isOpen,
  onClose,
  tokens,
  selectedToken,
  onTokenSelect,
  className = ""
}: TokenDropdownProps) {
  if (!isOpen) return null;

  const handleTokenSelect = (token: Token) => {
    onTokenSelect(token);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* Dropdown */}
      <div className={`absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto ${className}`}>
        <div className="p-2">
          {tokens.map((token) => (
            <button
              key={token.symbol}
              onClick={() => handleTokenSelect(token)}
              className={`w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-700 transition-colors ${
                selectedToken.symbol === token.symbol ? 'bg-gray-700' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-800">
                    {token.symbol.charAt(0)}
                  </span>
                </div>
                <div className="text-left">
                  <div className="font-semibold text-white">{token.symbol}</div>
                  <div className="text-xs text-gray-400">{token.name}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-white">${token.price?.toFixed(4) || '0.0000'}</div>
                <div className="text-xs text-gray-400">{token.decimals} decimals</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
} 