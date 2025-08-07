import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, AlertTriangle, RefreshCw, Wifi, WifiOff, RotateCcw } from 'lucide-react';
import { autoSessionRefreshService, SessionStatus } from '@/services/autoSessionRefreshService';
import { hashConnectSessionManager } from '@/services/hashConnectSessionManager';

export function SessionRefreshTest() {
  const [sessionStatus, setSessionStatus] = useState<SessionStatus | null>(null);
  const [refreshStatus, setRefreshStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [testResults, setTestResults] = useState<string[]>([]);

  // Auto-refresh session status every 5 seconds
  useEffect(() => {
    const checkSession = async () => {
      try {
        const status = await autoSessionRefreshService.checkAndRefreshSession();
        setSessionStatus(status);
        setRefreshStatus(autoSessionRefreshService.getRefreshStatus());
        setLastUpdate(new Date());
      } catch (error) {
        console.error("Session check failed:", error);
        setTestResults(prev => [...prev, `❌ Session check failed: ${error}`]);
      }
    };

    // Initial check
    checkSession();

    // Set up interval
    const interval = setInterval(checkSession, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = async () => {
    setIsLoading(true);
    setTestResults(prev => [...prev, "🔄 Manual refresh started..."]);
    
    try {
      const status = await autoSessionRefreshService.forceRefresh();
      setSessionStatus(status);
      setRefreshStatus(autoSessionRefreshService.getRefreshStatus());
      setLastUpdate(new Date());
      setTestResults(prev => [...prev, "✅ Manual refresh completed"]);
    } catch (error) {
      console.error("Manual refresh failed:", error);
      setTestResults(prev => [...prev, `❌ Manual refresh failed: ${error}`]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetAttempts = () => {
    autoSessionRefreshService.resetRefreshAttempts();
    setRefreshStatus(autoSessionRefreshService.getRefreshStatus());
    setTestResults(prev => [...prev, "🔄 Reset refresh attempts"]);
  };

  const handleEmergencyReset = async () => {
    setIsLoading(true);
    setTestResults(prev => [...prev, "🚨 Emergency reset started..."]);
    
    try {
      autoSessionRefreshService.emergencyReset();
      const status = await autoSessionRefreshService.forceRefresh();
      setSessionStatus(status);
      setRefreshStatus(autoSessionRefreshService.getRefreshStatus());
      setLastUpdate(new Date());
      setTestResults(prev => [...prev, "✅ Emergency reset completed"]);
    } catch (error) {
      console.error("Emergency reset failed:", error);
      setTestResults(prev => [...prev, `❌ Emergency reset failed: ${error}`]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestSwapWithRefresh = async () => {
    setIsLoading(true);
    setTestResults(prev => [...prev, "🔄 Testing swap with auto-refresh..."]);
    
    try {
      // Simulate a swap attempt that might trigger session refresh
      const status = await autoSessionRefreshService.checkAndRefreshSession();
      
      if (status.isConnected && status.connectedAccounts.length > 0) {
        setTestResults(prev => [...prev, "✅ Swap test with auto-refresh successful"]);
      } else {
        setTestResults(prev => [...prev, "❌ Swap test failed - no connected accounts"]);
      }
    } catch (error) {
      setTestResults(prev => [...prev, `❌ Swap test failed: ${error}`]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (!sessionStatus) return <Loader2 className="h-4 w-4 animate-spin" />;
    
    if (sessionStatus.isConnected && sessionStatus.connectedAccounts.length > 0) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (sessionStatus.needsRefresh) {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    } else {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    if (!sessionStatus) return "bg-gray-100";
    
    if (sessionStatus.isConnected && sessionStatus.connectedAccounts.length > 0) {
      return "bg-green-50 border-green-200";
    } else if (sessionStatus.needsRefresh) {
      return "bg-yellow-50 border-yellow-200";
    } else {
      return "bg-red-50 border-red-200";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Session Auto-Refresh Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Session Status */}
        <div className={`p-4 rounded-lg border ${getStatusColor()}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className="font-semibold">Session Status</span>
            </div>
            {lastUpdate && (
              <span className="text-sm text-gray-500">
                Last update: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>
          
          {sessionStatus && (
            <div className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Initialized:</span>
                <span className={sessionStatus.isInitialized ? "text-green-600" : "text-red-600"}>
                  {sessionStatus.isInitialized ? "✅ Yes" : "❌ No"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Connected:</span>
                <span className={sessionStatus.isConnected ? "text-green-600" : "text-red-600"}>
                  {sessionStatus.isConnected ? "✅ Yes" : "❌ No"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Accounts:</span>
                <span className={sessionStatus.connectedAccounts.length > 0 ? "text-green-600" : "text-red-600"}>
                  {sessionStatus.connectedAccounts.length} connected
                </span>
              </div>
              <div className="flex justify-between">
                <span>Needs Refresh:</span>
                <span className={sessionStatus.needsRefresh ? "text-yellow-600" : "text-green-600"}>
                  {sessionStatus.needsRefresh ? "⚠️ Yes" : "✅ No"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Refresh Status */}
        {refreshStatus && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Auto-Refresh Status</h4>
            <div className="space-y-1 text-sm text-blue-700">
              <div className="flex justify-between">
                <span>Attempts:</span>
                <span>{refreshStatus.attempts}/{refreshStatus.maxAttempts}</span>
              </div>
              <div className="flex justify-between">
                <span>Currently Refreshing:</span>
                <span>{refreshStatus.isRefreshing ? "🔄 Yes" : "✅ No"}</span>
              </div>
              {refreshStatus.cooldownRemaining > 0 && (
                <div className="flex justify-between">
                  <span>Cooldown:</span>
                  <span>{Math.ceil(refreshStatus.cooldownRemaining / 1000)}s remaining</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Can Attempt:</span>
                <span>{autoSessionRefreshService.canAttemptRefresh() ? "✅ Yes" : "❌ No"}</span>
              </div>
            </div>
          </div>
        )}

        {/* Connected Accounts */}
        {sessionStatus?.connectedAccounts && sessionStatus.connectedAccounts.length > 0 && (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">Connected Accounts</h4>
            <div className="space-y-1">
              {sessionStatus.connectedAccounts.map((account, index) => (
                <div key={index} className="text-sm text-green-700 font-mono">
                  {account}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleManualRefresh}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Manual Refresh
          </Button>
          
          <Button
            onClick={handleResetAttempts}
            variant="outline"
            className="border-yellow-500 text-yellow-700 hover:bg-yellow-50"
          >
            Reset Attempts
          </Button>
          
          <Button
            onClick={handleEmergencyReset}
            disabled={isLoading}
            variant="destructive"
            className="bg-red-500 hover:bg-red-600"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RotateCcw className="h-4 w-4 mr-2" />
            )}
            Emergency Reset
          </Button>
          
          <Button
            onClick={handleTestSwapWithRefresh}
            disabled={isLoading}
            className="bg-green-500 hover:bg-green-600"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Wifi className="h-4 w-4 mr-2" />
            )}
            Test Swap with Refresh
          </Button>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Test Results</h4>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {testResults.slice(-10).map((result, index) => (
                <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alerts */}
        {sessionStatus?.needsRefresh && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Session needs refresh. Auto-refresh will attempt to reconnect HashPack.
            </AlertDescription>
          </Alert>
        )}

        {refreshStatus && refreshStatus.attempts >= refreshStatus.maxAttempts && (
          <Alert>
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              Maximum refresh attempts reached. Please manually reconnect HashPack.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
} 