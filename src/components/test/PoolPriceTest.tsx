import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Database, TrendingUp, AlertTriangle } from 'lucide-react';
import { poolPriceService } from '@/services/poolPriceService';

export function PoolPriceTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [poolList, setPoolList] = useState<any[]>([]);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const clearResults = () => {
    setTestResults([]);
    setPoolList([]);
  };

  const testPoolList = async () => {
    setIsLoading(true);
    addResult("🔍 Testing pool list...");

    try {
      const pools = poolPriceService.getPoolList();
      setPoolList(pools);
      addResult(`📊 Found ${pools.length} pools`);
      
      pools.slice(0, 5).forEach((pool, index) => {
        addResult(`  ${index + 1}. ${pool.name} (${pool.address})`);
        addResult(`     Tokens: ${pool.token0}/${pool.token1}`);
        if (pool.reserve0 && pool.reserve1) {
          addResult(`     Reserves: ${pool.reserve0} ${pool.token0}, ${pool.reserve1} ${pool.token1}`);
        } else {
          addResult(`     Reserves: Not available`);
        }
      });

    } catch (error) {
      addResult(`❌ Error getting pool list: ${error}`);
    } finally {
      setIsLoading(false);
    }
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
        addResult(`✅ SaucerSwap API response: ${pools.length} pools`);
        
        if (pools.length > 0) {
          const samplePool = pools[0];
          addResult(`📋 Sample pool: ${samplePool.tokenA?.symbol}/${samplePool.tokenB?.symbol}`);
          addResult(`   Reserve A: ${samplePool.tokenReserveA}`);
          addResult(`   Reserve B: ${samplePool.tokenReserveB}`);
        }
      } else {
        addResult(`❌ SaucerSwap API error: ${response.status}`);
      }

    } catch (error) {
      addResult(`❌ Error calling SaucerSwap API: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testPoolPrices = async () => {
    setIsLoading(true);
    addResult("🏊 Testing pool prices...");

    try {
      const prices = await poolPriceService.getAllOnChainPoolPrices();
      addResult(`📊 Generated ${Object.keys(prices).length} pool prices`);
      
      Object.entries(prices).slice(0, 10).forEach(([pair, price]) => {
        addResult(`  ${pair}: ${price.toFixed(6)}`);
      });

    } catch (error) {
      addResult(`❌ Error testing pool prices: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    testPoolList();
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Pool Price Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button onClick={testPoolList} disabled={isLoading} variant="outline" size="sm">
            <Database className="h-4 w-4 mr-2" />
            Test Pool List
          </Button>

          <Button onClick={testSaucerSwapAPI} disabled={isLoading} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Test SaucerSwap API
          </Button>

          <Button onClick={testPoolPrices} disabled={isLoading} variant="outline" size="sm">
            <TrendingUp className="h-4 w-4 mr-2" />
            Test Pool Prices
          </Button>

          <Button onClick={clearResults} variant="outline" size="sm">
            Clear Results
          </Button>
        </div>

        {poolList.length > 0 && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <h5 className="font-semibold mb-2">Pool List ({poolList.length} pools):</h5>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {poolList.slice(0, 10).map((pool, index) => (
                <div key={index} className="text-sm">
                  <Badge variant="outline" className="mr-2">{pool.name}</Badge>
                  <span className="text-gray-600">{pool.token0}/{pool.token1}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {testResults.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Test Results</h4>
            <div className="max-h-60 overflow-y-auto space-y-1 bg-gray-50 p-3 rounded-lg">
              {testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono">{result}</div>
              ))}
            </div>
          </div>
        )}

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Test pool price fetching and debug issues with SaucerSwap API.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
} 