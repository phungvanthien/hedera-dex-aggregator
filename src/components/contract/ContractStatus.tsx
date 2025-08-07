import { useState, useEffect } from 'react';
import { hederaContractService } from '@/services/hederaContractService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2, ExternalLink } from 'lucide-react';

export function ContractStatus() {
  const [isDeployed, setIsDeployed] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [addresses, setAddresses] = useState<any>({});

  useEffect(() => {
    const checkDeployment = async () => {
      try {
        setIsLoading(true);
        const deployed = await hederaContractService.checkContractDeployment();
        const contractAddresses = hederaContractService.getContractAddresses();
        
        setIsDeployed(deployed);
        setAddresses(contractAddresses);
      } catch (error) {
        console.error('Error checking contract deployment:', error);
        setIsDeployed(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkDeployment();
  }, []);

  const getHashScanUrl = (contractId: string) => {
    return `https://hashscan.io/mainnet/contract/${contractId}`;
  };

  if (isLoading) {
    return (
      <Card className="hedera-card">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm text-gray-400">Checking contract deployment...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hedera-card">
      <CardHeader>
        <CardTitle className="text-white text-lg flex items-center">
          Smart Contract Status
          {isDeployed ? (
            <CheckCircle className="w-5 h-5 ml-2 text-green-400" />
          ) : (
            <XCircle className="w-5 h-5 ml-2 text-red-400" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Deployment Status:</span>
            <Badge className={isDeployed ? "bg-green-500 text-white" : "bg-red-500 text-white"}>
              {isDeployed ? "Deployed" : "Not Deployed"}
            </Badge>
          </div>

          {isDeployed && (
            <div className="space-y-2">
              <div className="text-sm text-gray-300 font-medium">Contract Addresses:</div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Exchange:</span>
                  <div className="flex items-center space-x-1">
                    <code className="text-green-400">{addresses.exchange}</code>
                    <a
                      href={getHashScanUrl(addresses.exchange)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">SaucerSwap Adapter:</span>
                  <div className="flex items-center space-x-1">
                    <code className="text-green-400">{addresses.saucerswap}</code>
                    <a
                      href={getHashScanUrl(addresses.saucerswap)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">HeliSwap Adapter:</span>
                  <div className="flex items-center space-x-1">
                    <code className="text-green-400">{addresses.heliswap}</code>
                    <a
                      href={getHashScanUrl(addresses.heliswap)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Pangolin Adapter:</span>
                  <div className="flex items-center space-x-1">
                    <code className="text-green-400">{addresses.pangolin}</code>
                    <a
                      href={getHashScanUrl(addresses.pangolin)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!isDeployed && (
            <div className="text-sm text-red-400">
              Smart contracts are not deployed. Please deploy them first.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 