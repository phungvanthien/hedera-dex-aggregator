import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Loader2, RotateCcw } from 'lucide-react';
import { autoSessionRefreshService, SessionStatus } from '@/services/autoSessionRefreshService';

export function SessionStatusIndicator() {
  const [sessionStatus, setSessionStatus] = useState<SessionStatus | null>(null);
  const [refreshStatus, setRefreshStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const status = await autoSessionRefreshService.checkAndRefreshSession();
        setSessionStatus(status);
        setRefreshStatus(autoSessionRefreshService.getRefreshStatus());
      } catch (error) {
        console.error("Session check failed:", error);
      }
    };

    // Initial check
    checkSession();

    // Check every 3 seconds
    const interval = setInterval(checkSession, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = async () => {
    setIsLoading(true);
    try {
      const status = await autoSessionRefreshService.forceRefresh();
      setSessionStatus(status);
      setRefreshStatus(autoSessionRefreshService.getRefreshStatus());
    } catch (error) {
      console.error("Manual refresh failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmergencyReset = async () => {
    setIsLoading(true);
    try {
      // Emergency reset the service
      autoSessionRefreshService.emergencyReset();
      
      // Force a fresh refresh
      const status = await autoSessionRefreshService.forceRefresh();
      setSessionStatus(status);
      setRefreshStatus(autoSessionRefreshService.getRefreshStatus());
    } catch (error) {
      console.error("Emergency reset failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!sessionStatus) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Checking session...</span>
      </div>
    );
  }

  const isHealthy = sessionStatus.isConnected && sessionStatus.connectedAccounts.length > 0;
  const needsRefresh = sessionStatus.needsRefresh;
  const maxAttemptsReached = refreshStatus && refreshStatus.attempts >= refreshStatus.maxAttempts;
  const canAttemptRefresh = autoSessionRefreshService.canAttemptRefresh();

  return (
    <div className="space-y-3">
      {/* Status Badge */}
      <div className="flex items-center gap-2">
        {isHealthy ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : needsRefresh ? (
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
        ) : (
          <XCircle className="h-4 w-4 text-red-500" />
        )}
        
        <Badge 
          variant={isHealthy ? "default" : needsRefresh ? "secondary" : "destructive"}
          className={isHealthy ? "bg-green-100 text-green-800" : needsRefresh ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}
        >
          {isHealthy ? "Connected" : needsRefresh ? "Needs Refresh" : "Disconnected"}
        </Badge>

        {refreshStatus && (
          <span className="text-xs text-gray-500">
            ({refreshStatus.attempts}/{refreshStatus.maxAttempts} attempts)
          </span>
        )}
      </div>

      {/* Account Info */}
      {sessionStatus.connectedAccounts.length > 0 && (
        <div className="text-xs text-gray-600">
          Account: {sessionStatus.connectedAccounts[0]}
        </div>
      )}

      {/* Cooldown Info */}
      {refreshStatus && refreshStatus.cooldownRemaining > 0 && (
        <div className="text-xs text-blue-600">
          Cooldown: {Math.ceil(refreshStatus.cooldownRemaining / 1000)}s remaining
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {needsRefresh && canAttemptRefresh && (
          <Button
            onClick={handleManualRefresh}
            disabled={isLoading}
            size="sm"
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            {isLoading ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
            ) : (
              <RefreshCw className="h-3 w-3 mr-1" />
            )}
            Refresh Session
          </Button>
        )}
        
        {maxAttemptsReached && (
          <Button
            onClick={handleEmergencyReset}
            disabled={isLoading}
            size="sm"
            variant="destructive"
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            {isLoading ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
            ) : (
              <RotateCcw className="h-3 w-3 mr-1" />
            )}
            Emergency Reset
          </Button>
        )}
      </div>

      {/* Alerts */}
      {needsRefresh && !maxAttemptsReached && (
        <Alert className="py-2">
          <AlertTriangle className="h-3 w-3" />
          <AlertDescription className="text-xs">
            Session needs refresh. Auto-refresh will attempt to reconnect.
          </AlertDescription>
        </Alert>
      )}

      {maxAttemptsReached && (
        <Alert className="py-2 border-red-200 bg-red-50">
          <XCircle className="h-3 w-3 text-red-500" />
          <AlertDescription className="text-xs text-red-700">
            Maximum refresh attempts reached. Click "Emergency Reset" to try again, or manually reconnect HashPack.
          </AlertDescription>
        </Alert>
      )}

      {refreshStatus && refreshStatus.cooldownRemaining > 0 && (
        <Alert className="py-2 border-blue-200 bg-blue-50">
          <AlertTriangle className="h-3 w-3 text-blue-500" />
          <AlertDescription className="text-xs text-blue-700">
            Refresh cooldown active. Please wait {Math.ceil(refreshStatus.cooldownRemaining / 1000)} seconds before next attempt.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
} 