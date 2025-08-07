import React, { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';

interface PriceRefreshTimerProps {
  onRefresh: () => void;
  interval?: number; // in seconds
  className?: string;
}

export function PriceRefreshTimer({ 
  onRefresh, 
  interval = 30, 
  className = "" 
}: PriceRefreshTimerProps) {
  const [timeLeft, setTimeLeft] = useState(interval);

  // Auto refresh function
  const handleAutoRefresh = useCallback(async () => {
    try {
      await onRefresh();
      setTimeLeft(interval);
    } catch (error) {
      console.error('Price refresh failed:', error);
    }
  }, [onRefresh, interval]);

  // Countdown effect
  useEffect(() => {
    if (timeLeft <= 0) {
      handleAutoRefresh();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, handleAutoRefresh]);

  // Format time display
  const formatTime = (seconds: number) => {
    return `${seconds.toString().padStart(2, '0')}s`;
  };

  // Get progress percentage
  const progressPercentage = ((interval - timeLeft) / interval) * 100;

  // Get status color
  const getStatusColor = () => {
    if (timeLeft <= 5) return 'text-red-500';
    if (timeLeft <= 10) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Countdown Timer - Smaller */}
      <Badge 
        variant="outline" 
        className={`font-mono text-sm ${getStatusColor()}`}
      >
        {formatTime(timeLeft)}
      </Badge>

      {/* Progress Bar - Extended */}
      <div className="flex items-center space-x-2 flex-1">
        <div className="w-80 h-3 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-1000"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <span className="text-sm text-gray-500 min-w-[3rem]">
          {Math.round(progressPercentage).toString().padStart(2, '0')}%
        </span>
      </div>
    </div>
  );
} 