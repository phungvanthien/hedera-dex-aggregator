import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, AlertTriangle, Wallet, Info, RefreshCw } from 'lucide-react';
import { hashConnectSessionManager } from '@/services/hashConnectSessionManager';
import { autoSessionRefreshService } from '@/services/autoSessionRefreshService';

export function HashPackDiagnostic() {
  const [diagnostics, setDiagnostics] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<any>(null);

  const addDiagnostic = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    setDiagnostics(prev => [...prev, {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setDiagnostics([]);
    
    addDiagnostic("🔍 Starting HashPack diagnostic...", "info");

    try {
      // Step 1: Check browser environment
      addDiagnostic("📱 Checking browser environment...", "info");
      if (typeof window === "undefined") {
        addDiagnostic("❌ Not in browser environment", "error");
        return;
      }
      addDiagnostic("✅ Browser environment detected", "success");

      // Step 2: Check HashPack extension
      addDiagnostic("🔌 Checking for HashPack extension...", "info");
      const hasHashPack = typeof window !== "undefined" && (window as any).HashPack;
      if (hasHashPack) {
        addDiagnostic("✅ HashPack extension detected", "success");
      } else {
        addDiagnostic("⚠️ HashPack extension not detected", "warning");
        addDiagnostic("💡 Install HashPack extension from https://hashpack.app", "info");
      }

      // Step 3: Initialize HashConnect
      addDiagnostic("🚀 Initializing HashConnect...", "info");
      const initialized = await hashConnectSessionManager.initialize();
      if (initialized) {
        addDiagnostic("✅ HashConnect initialized", "success");
      } else {
        addDiagnostic("❌ HashConnect initialization failed", "error");
        return;
      }

      // Step 4: Check current session
      addDiagnostic("📊 Checking current session...", "info");
      const session = hashConnectSessionManager.getSession();
      setSessionInfo(session);
      
      addDiagnostic(`📈 Session Status:`, "info");
      addDiagnostic(`   - Initialized: ${session.isInitialized ? '✅' : '❌'}`, session.isInitialized ? 'success' : 'error');
      addDiagnostic(`   - Connected: ${session.isConnected ? '✅' : '❌'}`, session.isConnected ? 'success' : 'error');
      addDiagnostic(`   - Accounts: ${session.connectedAccountIds.length}`, session.connectedAccountIds.length > 0 ? 'success' : 'warning');
      addDiagnostic(`   - Topic: ${session.topic ? '✅' : '❌'}`, session.topic ? 'success' : 'error');
      addDiagnostic(`   - Encryption Key: ${session.encryptionKey ? '✅' : '❌'}`, session.encryptionKey ? 'success' : 'error');

      // Step 5: Try to connect if not connected
      if (!session.isConnected) {
        addDiagnostic("🔗 Attempting to connect to HashPack...", "info");
        const connected = await hashConnectSessionManager.connectToLocalWallet();
        if (connected) {
          addDiagnostic("✅ Successfully connected to HashPack", "success");
        } else {
          addDiagnostic("❌ Failed to connect to HashPack", "error");
          addDiagnostic("💡 Make sure HashPack is unlocked and try again", "info");
        }
      }

      // Step 6: Check session readiness
      addDiagnostic("🔍 Checking session readiness for transactions...", "info");
      const isReady = hashConnectSessionManager.isSessionReady();
      if (isReady) {
        addDiagnostic("✅ Session is ready for transactions", "success");
      } else {
        addDiagnostic("⚠️ Session is not ready for transactions", "warning");
        addDiagnostic("💡 Session needs topic and encryption key for signing", "info");
      }

      // Step 7: Auto-refresh check
      addDiagnostic("🔄 Checking auto-refresh service...", "info");
      const refreshStatus = await autoSessionRefreshService.checkAndRefreshSession();
      addDiagnostic(`📊 Auto-refresh status:`, "info");
      addDiagnostic(`   - Needs refresh: ${refreshStatus.needsRefresh ? '⚠️ Yes' : '✅ No'}`, refreshStatus.needsRefresh ? 'warning' : 'success');
      addDiagnostic(`   - Connected accounts: ${refreshStatus.connectedAccounts.length}`, refreshStatus.connectedAccounts.length > 0 ? 'success' : 'warning');

      addDiagnostic("🎉 Diagnostic completed!", "success");

    } catch (error) {
      addDiagnostic(`❌ Diagnostic error: ${error}`, "error");
    } finally {
      setIsRunning(false);
    }
  };

  const clearDiagnostics = () => {
    setDiagnostics([]);
    setSessionInfo(null);
  };

  const getDiagnosticIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          HashPack Diagnostic Tool
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={runDiagnostics}
            disabled={isRunning}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {isRunning ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Run Diagnostics
          </Button>

          <Button
            onClick={clearDiagnostics}
            variant="outline"
            className="border-gray-500 text-gray-700 hover:bg-gray-50"
          >
            Clear Results
          </Button>
        </div>

        {/* Session Info */}
        {sessionInfo && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Current Session Info</h4>
            <div className="space-y-1 text-sm text-blue-700">
              <div>Initialized: {sessionInfo.isInitialized ? "✅ Yes" : "❌ No"}</div>
              <div>Connected: {sessionInfo.isConnected ? "✅ Yes" : "❌ No"}</div>
              <div>Accounts: {sessionInfo.connectedAccountIds.join(", ") || "None"}</div>
              <div>Topic: {sessionInfo.topic ? "✅ Present" : "❌ Missing"}</div>
              <div>Encryption Key: {sessionInfo.encryptionKey ? "✅ Present" : "❌ Missing"}</div>
              <div>Pairing String: {sessionInfo.pairingString ? "✅ Present" : "❌ Missing"}</div>
            </div>
          </div>
        )}

        {/* Diagnostic Results */}
        {diagnostics.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Diagnostic Results</h4>
            <div className="max-h-80 overflow-y-auto space-y-2 bg-gray-50 p-3 rounded-lg">
              {diagnostics.map((diagnostic) => (
                <div key={diagnostic.id} className="flex items-start gap-2 text-sm">
                  {getDiagnosticIcon(diagnostic.type)}
                  <span className="flex-1">
                    <span className="text-gray-500 text-xs">{diagnostic.timestamp}</span>
                    <span className="ml-2">{diagnostic.message}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This diagnostic tool will help identify HashPack connection issues.
            <br />• Run diagnostics to check your HashPack setup
            <br />• Follow the recommendations to fix any issues
            <br />• Make sure HashPack extension is installed and unlocked
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
} 