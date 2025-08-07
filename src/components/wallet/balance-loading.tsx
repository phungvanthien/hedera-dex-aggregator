import { Loader2 } from 'lucide-react';

interface BalanceLoadingProps {
  className?: string;
  message?: string;
}

export function BalanceLoading({ 
  className = "", 
  message = "Loading balance..." 
}: BalanceLoadingProps) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
      <span className="text-xs text-gray-400">{message}</span>
    </div>
  );
}

interface BalanceErrorProps {
  className?: string;
  error?: string;
}

export function BalanceError({ 
  className = "", 
  error = "Failed to load balance" 
}: BalanceErrorProps) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className="text-xs text-red-400">⚠️ {error}</span>
    </div>
  );
} 