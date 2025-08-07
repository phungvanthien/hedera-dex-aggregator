import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Database, TrendingUp } from 'lucide-react';

export function SimplePoolTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const addResult = (result: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testSaucerSwapAPI = async () => {
    setIsLoading(true);
    addResult("🌐 Testing SaucerSwap API...");

    try {
      const response = await fetch('https://api.saucerswap.finance/pools/full', {
        headers: {
          'x-api-key': '875e1017-87b8-4b12-8301-6aa1f1aa073b'
        }
      });
      
      if (response.ok) {
        const pools = await response.json();
        addResult(`✅ API Response: ${pools.length} pools`);
        
        if (pools.length > 0) {
          const pool = pools[0];
          addResult(`📋 Sample: ${pool.tokenA?.symbol}/${pool.tokenB?.symbol}`);
          addResult(`   Reserve A: ${pool.tokenReserveA}`);
          addResult(`   Reserve B: ${pool.tokenReserveB}`);
        }
      } else {
        addResult(`❌ API Error: ${response.status}`);
      }
    } catch (error) {
      addResult(`❌ Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testCoinGecko = async () => {
    setIsLoading(true);
    addResult("💰 Testing CoinGecko API...");

    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=hedera-hashgraph&vs_currencies=usd');
      const data = await response.json();
      addResult(`✅ HBAR Price: $${data['hedera-hashgraph']?.usd || 'N/A'}`);
    } catch (error) {
      addResult(`❌ CoinGecko Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Simple Pool Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={testSaucerSwapAPI} disabled={isLoading} variant="outline" size="sm">
            <Database className="h-4 w-4 mr-2" />
            Test SaucerSwap API
          </Button>
          <Button onClick={testCoinGecko} disabled={isLoading} variant="outline" size="sm">
            <TrendingUp className="h-4 w-4 mr-2" />
            Test CoinGecko
          </Button>
          <Button onClick={clearResults} variant="outline" size="sm">
            Clear
          </Button>
        </div>

        {results.length > 0 && (
          <div className="max-h-60 overflow-y-auto space-y-1 bg-gray-50 p-3 rounded-lg">
            {results.map((result, index) => (
              <div key={index} className="text-sm font-mono">{result}</div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 