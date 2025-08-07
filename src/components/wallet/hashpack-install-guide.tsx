import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Download, CheckCircle, AlertCircle } from 'lucide-react';

interface HashPackInstallGuideProps {
  className?: string;
}

export function HashPackInstallGuide({ className = "" }: HashPackInstallGuideProps) {
  const openHashPackWebsite = () => {
    window.open('https://www.hashpack.app/', '_blank');
  };

  const openChromeStore = () => {
    window.open('https://chrome.google.com/webstore/detail/hashpack/xckblfkhkhhhaljjnmmcoplmekbjfcejp', '_blank');
  };

  const openFirefoxStore = () => {
    window.open('https://addons.mozilla.org/en-US/firefox/addon/hashpack/', '_blank');
  };

  return (
    <Card className={`hashpack-guide ${className}`}>
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 text-yellow-500" />
          Install HashPack Wallet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-300">
          <p className="mb-3">
            HashPack is the recommended wallet for Hedera DEX operations. 
            It provides native support for Hedera tokens and smart contracts.
          </p>
          
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
            <div className="flex items-start">
              <CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
              <div className="text-xs text-blue-300">
                <strong>Why HashPack?</strong>
                <ul className="mt-1 space-y-1">
                  <li>• Native Hedera support</li>
                  <li>• Better transaction signing</li>
                  <li>• Optimized for Hedera DEX</li>
                  <li>• Lower gas fees</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Installation:</span>
            <Badge variant="outline" className="text-xs">
              Recommended
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <Button
              onClick={openChromeStore}
              size="sm"
              className="w-full justify-start"
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Install for Chrome
              <ExternalLink className="w-3 h-3 ml-auto" />
            </Button>

            <Button
              onClick={openFirefoxStore}
              size="sm"
              className="w-full justify-start"
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Install for Firefox
              <ExternalLink className="w-3 h-3 ml-auto" />
            </Button>

            <Button
              onClick={openHashPackWebsite}
              size="sm"
              className="w-full justify-start"
              variant="outline"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Visit HashPack Website
            </Button>
          </div>
        </div>

        <div className="text-xs text-gray-400 border-t border-gray-700 pt-3">
          <p className="mb-2">
            <strong>After Installation:</strong>
          </p>
          <ol className="list-decimal list-inside space-y-1 text-gray-500">
            <li>Install HashPack extension</li>
            <li>Create or import your wallet</li>
            <li>Connect to Hedera Mainnet</li>
            <li>Add some HBAR for gas fees</li>
            <li>Return here and connect wallet</li>
          </ol>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
          <div className="flex items-start">
            <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-xs text-yellow-300">
              <strong>Note:</strong> MetaMask is also supported as a fallback, 
              but HashPack provides better Hedera integration and user experience.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 