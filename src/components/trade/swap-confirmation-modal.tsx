import React, { useEffect } from 'react';
import { X, ArrowRight, AlertTriangle, CheckCircle, Info, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Token, Quote } from '@/services/hederaContractService';

interface SwapConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  toAmount: string;
  quote: Quote;
  isSwapping: boolean;
  gasEstimate?: {
    estimatedCost: string;
    gasLimit: number;
    confidence: 'high' | 'medium' | 'low';
  };
  slippage: number;
}

export const SwapConfirmationModal: React.FC<SwapConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  fromToken,
  toToken,
  fromAmount,
  toAmount,
  quote,
  isSwapping,
  gasEstimate,
  slippage
}) => {
  if (!isOpen) return null;

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      return () => {
        document.removeEventListener('keydown', handleEscKey);
      };
    }
  }, [isOpen, onClose]);

  const formatUSD = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numValue);
  };

  const formatNumber = (value: number | string, decimals: number = 6) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    }).format(numValue);
  };

  const calculatePriceImpact = () => {
    const fromValue = parseFloat(fromAmount) * (fromToken.price || 0);
    const toValue = parseFloat(toAmount) * (toToken.price || 0);
    const impact = ((fromValue - toValue) / fromValue) * 100;
    return Math.abs(impact);
  };

  const priceImpact = calculatePriceImpact();
  const isHighImpact = priceImpact > 5;
  const isMediumImpact = priceImpact > 2 && priceImpact <= 5;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Container */}
        <Card className="bg-gray-900/95 border border-gray-700 shadow-2xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-white flex items-center">
                <Shield className="w-5 h-5 mr-2 text-blue-400" />
                Confirm Swap
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                disabled={isSwapping}
                className="text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Swap Summary */}
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{fromToken.symbol}</span>
                  </div>
                  <div>
                    <div className="text-white font-semibold">{formatNumber(fromAmount, fromToken.decimals)}</div>
                    <div className="text-gray-400 text-sm">{fromToken.name}</div>
                  </div>
                </div>
                
                <ArrowRight className="w-5 h-5 text-gray-400" />
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{toToken.symbol}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">{formatNumber(toAmount, toToken.decimals)}</div>
                    <div className="text-gray-400 text-sm">{toToken.name}</div>
                  </div>
                </div>
              </div>

              {/* USD Values */}
              <div className="flex justify-between text-sm text-gray-400 border-t border-gray-700 pt-3">
                <span>≈ {formatUSD(parseFloat(fromAmount) * (fromToken.price || 0))}</span>
                <span>≈ {formatUSD(parseFloat(toAmount) * (toToken.price || 0))}</span>
              </div>
            </div>

            {/* Route Information */}
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-300 text-sm font-medium">Best Route</span>
                <Badge variant="outline" className="border-blue-500 text-blue-400">
                  {quote.dex}
                </Badge>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Exchange Rate</span>
                  <span className="text-white">
                    1 {fromToken.symbol} = {formatNumber(parseFloat(toAmount) / parseFloat(fromAmount), 6)} {toToken.symbol}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Price Impact</span>
                  <span className={`font-medium ${
                    isHighImpact ? 'text-red-400' : 
                    isMediumImpact ? 'text-yellow-400' : 
                    'text-green-400'
                  }`}>
                    {priceImpact.toFixed(2)}%
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Slippage Tolerance</span>
                  <span className="text-white">{slippage}%</span>
                </div>

                {quote.fee && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Protocol Fee</span>
                    <span className="text-white">{formatNumber(quote.fee, 6)} {fromToken.symbol}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Gas Estimation */}
            {gasEstimate && (
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-300 text-sm font-medium">Gas Estimation</span>
                  <Badge 
                    variant="outline" 
                    className={`${
                      gasEstimate.confidence === 'high' ? 'border-green-500 text-green-400' :
                      gasEstimate.confidence === 'medium' ? 'border-yellow-500 text-yellow-400' :
                      'border-red-500 text-red-400'
                    }`}
                  >
                    {gasEstimate.confidence.toUpperCase()}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Estimated Cost</span>
                    <span className="text-white font-medium">{gasEstimate.estimatedCost} HBAR</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Gas Limit</span>
                    <span className="text-white">{gasEstimate.gasLimit.toLocaleString()}</span>
                  </div>
                </div>

                {/* Confidence Warnings */}
                {gasEstimate.confidence === 'low' && (
                  <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded">
                    <div className="flex items-center text-xs text-red-400">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Low confidence estimation. Transaction may cost more.
                    </div>
                  </div>
                )}
                
                {gasEstimate.confidence === 'medium' && (
                  <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded">
                    <div className="flex items-center text-xs text-yellow-400">
                      <Info className="w-3 h-3 mr-1" />
                      Medium confidence estimation. Review before proceeding.
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Price Impact Warning */}
            {isHighImpact && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <div className="flex items-start">
                  <AlertTriangle className="w-4 h-4 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-400">
                    <div className="font-medium mb-1">High Price Impact</div>
                    <div className="text-xs">
                      This swap has a {priceImpact.toFixed(2)}% price impact. Consider using a smaller amount or waiting for better liquidity.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-2">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isSwapping}
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                Cancel
              </Button>
              
              <Button
                onClick={onConfirm}
                disabled={isSwapping}
                className={`flex-1 font-semibold ${
                  isSwapping 
                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                    : isHighImpact
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white'
                }`}
              >
                {isSwapping ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Swapping...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Zap className="w-4 h-4 mr-2" />
                    {isHighImpact ? 'Swap Anyway' : 'Confirm Swap'}
                  </div>
                )}
              </Button>
            </div>

            {/* Disclaimer */}
            <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-700">
              By confirming this swap, you agree to the terms and acknowledge that cryptocurrency transactions are irreversible.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 