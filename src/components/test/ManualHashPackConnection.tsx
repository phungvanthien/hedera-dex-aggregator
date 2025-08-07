import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, AlertTriangle, Wallet, QrCode, Copy } from 'lucide-react';
import { hashConnectSessionManager } from '@/services/hashConnectSessionManager';

export function ManualHashPackConnection() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [pairingString, setPairingString] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('');
  const [sessionInfo, setSessionInfo] = useState<any>(null);

  const forceManualConnection = async () => {
    setIsConnecting(true);
    setConnectionStatus('Initializing HashConnect...');
    
    try {
      // Step 1: Initialize
      const initialized = await hashConnectSessionManager.initialize();
      if (!initialized) {
        setConnectionStatus('❌ Failed to initialize HashConnect');
        return;
      }
      setConnectionStatus('✅ HashConnect initialized');

      // Step 2: Get HashConnect instance
      const hashConnect = hashConnectSessionManager.getHashConnect();
      if (!hashConnect) {
        setConnectionStatus('❌ HashConnect instance not available');
        return;
      }

      // Step 3: Try to get pairing string
      setConnectionStatus('🔗 Requesting pairing string...');
      
      let pairingStr = null;
      
      // Try different methods to get pairing string
      const methods = [
        'requestPairing',
        'generatePairingString', 
        'createPairingString',
        'getPairingString'
      ];

      for (const method of methods) {
        try {
          if (typeof (hashConnect as any)[method] === 'function') {
            console.log(`Trying method: ${method}`);
            pairingStr = await (hashConnect as any)[method]();
            if (pairingStr) {
              console.log(`Success with method: ${method}`);
              break;
            }
          }
        } catch (error) {
          console.warn(`Method ${method} failed:`, error);
        }
      }

      if (!pairingStr) {
        // Try opening pairing modal
        try {
          if (typeof (hashConnect as any).openPairingModal === 'function') {
            setConnectionStatus('📱 Opening pairing modal...');
            (hashConnect as any).openPairingModal();
            setConnectionStatus('📱 Pairing modal opened - please scan QR code or enter pairing string in HashPack');
            
            // Wait for pairing to complete
            await new Promise(resolve => setTimeout(resolve, 10000));
            
            // Check if session was established
            const session = hashConnectSessionManager.getSession();
            setSessionInfo(session);
            
            if (session.topic && session.encryptionKey) {
              setConnectionStatus('✅ Session established successfully!');
            } else {
              setConnectionStatus('⚠️ Pairing modal opened but session not established. Please try scanning the QR code.');
            }
            return;
          }
        } catch (error) {
          console.warn('Pairing modal failed:', error);
        }
        
        setConnectionStatus('❌ Could not generate pairing string or open modal');
        return;
      }

      setPairingString(pairingStr);
      setConnectionStatus('📱 Pairing string generated - please enter this in HashPack');

      // Step 4: Wait for pairing to complete
      setConnectionStatus('⏳ Waiting for pairing to complete...');
      
      // Check session every 2 seconds for up to 30 seconds
      for (let i = 0; i < 15; i++) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const session = hashConnectSessionManager.getSession();
        setSessionInfo(session);
        
        if (session.topic && session.encryptionKey) {
          setConnectionStatus('✅ Session established successfully!');
          return;
        }
        
        setConnectionStatus(`⏳ Waiting for pairing... (${(i + 1) * 2}/30 seconds)`);
      }
      
      setConnectionStatus('⚠️ Pairing timeout - please try again or check HashPack');

    } catch (error) {
      console.error('Manual connection error:', error);
      setConnectionStatus(`❌ Connection error: ${error}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const copyPairingString = () => {
    if (pairingString) {
      navigator.clipboard.writeText(pairingString);
      setConnectionStatus('📋 Pairing string copied to clipboard!');
    }
  };

  const checkSessionStatus = () => {
    const session = hashConnectSessionManager.getSession();
    setSessionInfo(session);
    
    if (session.topic && session.encryptionKey) {
      setConnectionStatus('✅ Session is ready!');
    } else {
      setConnectionStatus('❌ Session not ready - missing topic or encryption key');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Manual HashPack Connection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={forceManualConnection}
            disabled={isConnecting}
            className="bg-green-500 hover:bg-green-600"
          >
            {isConnecting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <QrCode className="h-4 w-4 mr-2" />
            )}
            Force Manual Connection
          </Button>

          <Button
            onClick={checkSessionStatus}
            variant="outline"
            className="border-blue-500 text-blue-700 hover:bg-blue-50"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Check Session
          </Button>

          {pairingString && (
            <Button
              onClick={copyPairingString}
              variant="outline"
              className="border-purple-500 text-purple-700 hover:bg-purple-50"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Pairing String
            </Button>
          )}
        </div>

        {/* Status */}
        {connectionStatus && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Connection Status</h4>
            <div className="text-sm text-blue-700">{connectionStatus}</div>
          </div>
        )}

        {/* Pairing String */}
        {pairingString && (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">Pairing String</h4>
            <div className="text-sm text-green-700 break-all font-mono bg-white p-2 rounded border">
              {pairingString}
            </div>
            <p className="text-xs text-green-600 mt-2">
              📱 Enter this string in your HashPack app to establish the connection
            </p>
          </div>
        )}

        {/* Session Info */}
        {sessionInfo && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-2">Session Information</h4>
            <div className="space-y-1 text-sm text-gray-700">
              <div>Initialized: {sessionInfo.isInitialized ? "✅ Yes" : "❌ No"}</div>
              <div>Connected: {sessionInfo.isConnected ? "✅ Yes" : "❌ No"}</div>
              <div>Accounts: {sessionInfo.connectedAccountIds.join(", ") || "None"}</div>
              <div>Topic: {sessionInfo.topic ? "✅ Present" : "❌ Missing"}</div>
              <div>Encryption Key: {sessionInfo.encryptionKey ? "✅ Present" : "❌ Missing"}</div>
              <div>Session Ready: {hashConnectSessionManager.isSessionReady() ? "✅ Yes" : "❌ No"}</div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This tool forces a manual connection to HashPack.
            <br />• Click "Force Manual Connection" to start
            <br />• If a pairing string appears, enter it in HashPack
            <br />• If a QR code appears, scan it with HashPack
            <br />• Wait for the connection to establish
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
} 