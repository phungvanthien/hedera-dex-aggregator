import { useContext } from 'react';
import { WalletContext } from '@/context/WalletContext';

interface BalanceDisplayProps {
  tokenSymbol?: string;
  showDebug?: boolean;
  className?: string;
  showTokenSymbol?: boolean;
  prefix?: string;
}

export function BalanceDisplay({ 
  tokenSymbol = "HBAR", 
  showDebug = false, 
  className = "",
  showTokenSymbol = true,
  prefix = "Balance:"
}: BalanceDisplayProps) {
  const { balance, connected } = useContext(WalletContext);

  if (!connected) {
    return (
      <span className={`text-xs text-gray-400 ${className}`}>
        Connect Wallet
      </span>
    );
  }

  const displayBalance = balance || "0.00";
  
  return (
    <span className={`text-xs text-gray-400 ${className}`}>
      {prefix} {displayBalance}{showTokenSymbol ? ` ${tokenSymbol}` : ''}
    </span>
  );
}

export function BalanceValue({ 
  tokenSymbol = "HBAR", 
  showDebug = false, 
  className = "",
  showTokenSymbol = true
}: BalanceDisplayProps) {
  const { balance, connected } = useContext(WalletContext);

  if (!connected) {
    return (
      <span className={`text-sm text-gray-400 ${className}`}>
        0.00{showTokenSymbol ? ` ${tokenSymbol}` : ''}
      </span>
    );
  }

  const displayBalance = balance || "0.00";
  
  return (
    <span className={`text-sm text-gray-400 ${className}`}>
      {displayBalance}{showTokenSymbol ? ` ${tokenSymbol}` : ''}
    </span>
  );
}

// Simple balance display without token symbol (for use in components that already show token)
export function SimpleBalanceDisplay({ 
  className = "",
  prefix = "Balance:"
}: Omit<BalanceDisplayProps, 'tokenSymbol' | 'showDebug' | 'showTokenSymbol'>) {
  const { balance, connected } = useContext(WalletContext);

  if (!connected) {
    return (
      <span className={`text-xs text-gray-400 ${className}`}>
        Connect Wallet
      </span>
    );
  }

  const displayBalance = balance || "0.00";
  
  return (
    <span className={`text-xs text-gray-400 ${className}`}>
      {prefix} {displayBalance}
    </span>
  );
}

// Specific HBAR balance display (always shows HBAR symbol)
export function HBARBalanceDisplay({ 
  className = "",
  prefix = "Balance:"
}: Omit<BalanceDisplayProps, 'tokenSymbol' | 'showDebug' | 'showTokenSymbol'>) {
  const { balance, connected } = useContext(WalletContext);

  if (!connected) {
    return (
      <span className={`text-xs text-gray-400 ${className}`}>
        Connect Wallet
      </span>
    );
  }

  const displayBalance = balance || "0.00";
  
  return (
    <span className={`text-xs text-gray-400 ${className}`}>
      {prefix} {displayBalance} HBAR
    </span>
  );
}

// Token-specific balance display
interface TokenBalanceDisplayProps {
  tokenSymbol: string;
  className?: string;
  prefix?: string;
  getTokenBalance: (symbol: string) => string;
  isLoading?: boolean;
  error?: string | null;
}

export function TokenBalanceDisplay({ 
  tokenSymbol,
  className = "",
  prefix = "Balance:",
  getTokenBalance,
  isLoading = false,
  error = null
}: TokenBalanceDisplayProps) {
  const { connected } = useContext(WalletContext);

  if (!connected) {
    return (
      <span className={`text-xs text-gray-400 ${className}`}>
        Connect Wallet
      </span>
    );
  }

  if (isLoading) {
    return (
      <span className={`text-xs text-gray-400 ${className}`}>
        {prefix} Loading... {tokenSymbol}
      </span>
    );
  }

  if (error) {
    return (
      <span className={`text-xs text-red-400 ${className}`}>
        {prefix} Error {tokenSymbol}
      </span>
    );
  }

  const displayBalance = getTokenBalance(tokenSymbol);
  
  return (
    <span className={`text-xs text-gray-400 ${className}`}>
      {prefix} {displayBalance} {tokenSymbol}
    </span>
  );
} 