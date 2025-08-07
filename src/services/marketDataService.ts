import { poolPriceService, PoolPrice } from './poolPriceService';

export interface MarketData {
  pair: string;
  price: string;
  change: string;
  positive: boolean;
  volume24h?: string;
  liquidity?: string;
}

export interface TokenPrice {
  symbol: string;
  price: number;
  change24h: number;
  volume24h?: number;
}

export class MarketDataService {
  private static instance: MarketDataService;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 30000; // 30 seconds

  static getInstance(): MarketDataService {
    if (!MarketDataService.instance) {
      MarketDataService.instance = new MarketDataService();
    }
    return MarketDataService.instance;
  }

  // Fetch live prices from multiple sources
  async getLivePrices(): Promise<TokenPrice[]> {
    try {
      const prices = await poolPriceService.getAllTokenPrices();
      const fallbackPrices = this.getFallbackPrices();
      const fallbackMap = new Map(fallbackPrices.map(p => [p.symbol, p]));

      return Object.entries(prices).map(([symbol, poolPrice]) => {
        // Use fallback if pool price is invalid
        const fallback = fallbackMap.get(symbol);
        const validPrice = (poolPrice.price > 0 && isFinite(poolPrice.price)) 
          ? poolPrice.price 
          : (fallback?.price || 0);

        return {
          symbol,
          price: validPrice,
          change24h: this.calculatePriceChange(symbol, validPrice),
          volume24h: this.getVolume24h(symbol)
        };
      });
    } catch (error) {
      console.error('Error fetching live prices:', error);
      return this.getFallbackPrices();
    }
  }

  // Calculate price change (simulated for now)
  private calculatePriceChange(symbol: string, currentPrice: number): number {
    // Simulate price changes based on token volatility
    const volatilityMap: { [key: string]: number } = {
      'HBAR': 0.05, // 5% volatility
      'USDC': 0.001, // 0.1% volatility
      'USDT': 0.001, // 0.1% volatility
      'ETH': 0.08, // 8% volatility
      'BTC': 0.06, // 6% volatility
      'DAI': 0.002, // 0.2% volatility
      'LINK': 0.12, // 12% volatility
      'UNI': 0.10, // 10% volatility
    };

    const volatility = volatilityMap[symbol] || 0.05;
    const change = (Math.random() - 0.5) * 2 * volatility * 100; // -volatility% to +volatility%
    return parseFloat(change.toFixed(2));
  }

  // Get 24h volume (simulated for now)
  private getVolume24h(symbol: string): number {
    const volumeMap: { [key: string]: number } = {
      'HBAR': 5000000, // $5M
      'USDC': 10000000, // $10M
      'USDT': 8000000, // $8M
      'ETH': 20000000, // $20M
      'BTC': 15000000, // $15M
      'DAI': 3000000, // $3M
      'LINK': 2000000, // $2M
      'UNI': 1500000, // $1.5M
    };

    return volumeMap[symbol] || 1000000;
  }

  // Get market data for specific pairs
  async getMarketData(): Promise<MarketData[]> {
    try {
      const prices = await this.getLivePrices();
      const priceMap = new Map(prices.map(p => [p.symbol, p]));

      const pairs = [
        { from: 'HBAR', to: 'USDC' },
        { from: 'HBAR', to: 'USDT' },
        { from: 'ETH', to: 'HBAR' },
        { from: 'WBTC', to: 'HBAR' },
        { from: 'USDC', to: 'USDT' },
        { from: 'ETH', to: 'USDC' },
        { from: 'LINK', to: 'HBAR' },
        { from: 'UNI', to: 'HBAR' },
      ];

      return pairs.map(pair => {
        const fromPrice = priceMap.get(pair.from);
        const toPrice = priceMap.get(pair.to);

        // Validate prices and use fallback if needed
        if (!fromPrice || !toPrice || fromPrice.price <= 0 || toPrice.price <= 0) {
          console.warn(`Invalid prices for ${pair.from}/${pair.to}: from=${fromPrice?.price}, to=${toPrice?.price}`);
          return this.getFallbackMarketData(pair.from, pair.to);
        }

        const exchangeRate = fromPrice.price / toPrice.price;
        
        // Validate exchange rate
        if (isNaN(exchangeRate) || !isFinite(exchangeRate)) {
          console.warn(`Invalid exchange rate for ${pair.from}/${pair.to}: ${exchangeRate}`);
          return this.getFallbackMarketData(pair.from, pair.to);
        }

        const change = fromPrice.change24h - toPrice.change24h;

        return {
          pair: `${pair.from}/${pair.to}`,
          price: this.formatPrice(exchangeRate, pair.from, pair.to),
          change: `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`,
          positive: change >= 0,
          volume24h: this.formatVolume(fromPrice.volume24h || 0),
          liquidity: this.getLiquidity(pair.from, pair.to)
        };
      });
    } catch (error) {
      console.error('Error fetching market data:', error);
      return this.getFallbackMarketDataList();
    }
  }

  // Format price based on token pair
  private formatPrice(rate: number, from: string, to: string): string {
    if (to === 'USDC' || to === 'USDT' || to === 'DAI') {
      return `$${rate.toFixed(4)}`;
    } else if (from === 'HBAR') {
      return rate.toFixed(2);
    } else {
      return rate.toFixed(4);
    }
  }

  // Format volume
  private formatVolume(volume: number): string {
    if (volume >= 1000000) {
      return `$${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `$${(volume / 1000).toFixed(1)}K`;
    } else {
      return `$${volume.toFixed(0)}`;
    }
  }

  // Get liquidity (simulated)
  private getLiquidity(from: string, to: string): string {
    const liquidityMap: { [key: string]: number } = {
      'HBAR/USDC': 2000000,
      'HBAR/USDT': 1800000,
      'ETH/HBAR': 1500000,
      'BTC/HBAR': 1200000,
      'USDC/USDT': 5000000,
      'ETH/USDC': 3000000,
      'LINK/HBAR': 800000,
      'UNI/HBAR': 600000,
    };

    const key = `${from}/${to}`;
    const liquidity = liquidityMap[key] || 1000000;
    return this.formatVolume(liquidity);
  }

  // Fallback prices when API fails
  private getFallbackPrices(): TokenPrice[] {
    return [
      { symbol: 'HBAR', price: 0.0523, change24h: 2.5, volume24h: 5000000 },
      { symbol: 'USDC', price: 1.0000, change24h: 0.01, volume24h: 10000000 },
      { symbol: 'USDT', price: 1.0001, change24h: 0.02, volume24h: 8000000 },
      { symbol: 'ETH', price: 2000.00, change24h: 3.2, volume24h: 20000000 },
      { symbol: 'BTC', price: 42000.00, change24h: 1.2, volume24h: 15000000 },
      { symbol: 'DAI', price: 1.0000, change24h: 0.01, volume24h: 3000000 },
      { symbol: 'LINK', price: 15.50, change24h: -1.5, volume24h: 2000000 },
      { symbol: 'UNI', price: 8.20, change24h: 0.8, volume24h: 1500000 },
      // Add WBTC as alias for BTC
      { symbol: 'WBTC', price: 42000.00, change24h: 1.2, volume24h: 15000000 },
    ];
  }

  // Fallback market data
  private getFallbackMarketData(from: string, to: string): MarketData {
    const fallbackData: { [key: string]: MarketData } = {
      'HBAR/USDC': { pair: 'HBAR/USDC', price: '$0.0523', change: '+2.5%', positive: true },
      'HBAR/USDT': { pair: 'HBAR/USDT', price: '$0.0523', change: '+1.8%', positive: true },
      'ETH/HBAR': { pair: 'ETH/HBAR', price: '38,240', change: '-0.5%', positive: false },
      'BTC/HBAR': { pair: 'BTC/HBAR', price: '803,440', change: '+1.2%', positive: true },
      'WBTC/HBAR': { pair: 'WBTC/HBAR', price: '803,440', change: '+1.2%', positive: true },
      'USDC/USDT': { pair: 'USDC/USDT', price: '$1.0000', change: '+0.01%', positive: true },
      'ETH/USDC': { pair: 'ETH/USDC', price: '$2,000.00', change: '+3.2%', positive: true },
      'LINK/HBAR': { pair: 'LINK/HBAR', price: '296.4', change: '-1.5%', positive: false },
      'UNI/HBAR': { pair: 'UNI/HBAR', price: '156.8', change: '+0.8%', positive: true },
    };

    return fallbackData[`${from}/${to}`] || {
      pair: `${from}/${to}`,
      price: '$0.00',
      change: '0.00%',
      positive: true
    };
  }

  // Fallback market data list
  private getFallbackMarketDataList(): MarketData[] {
    return [
      { pair: 'HBAR/USDC', price: '$0.0523', change: '+2.5%', positive: true },
      { pair: 'HBAR/USDT', price: '$0.0523', change: '+1.8%', positive: true },
      { pair: 'ETH/HBAR', price: '38,240', change: '-0.5%', positive: false },
      { pair: 'BTC/HBAR', price: '803,440', change: '+1.2%', positive: true },
      { pair: 'USDC/USDT', price: '$1.0000', change: '+0.01%', positive: true },
      { pair: 'ETH/USDC', price: '$2,000.00', change: '+3.2%', positive: true },
      { pair: 'LINK/HBAR', price: '296.4', change: '-1.5%', positive: false },
      { pair: 'UNI/HBAR', price: '156.8', change: '+0.8%', positive: true },
    ];
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }
}

export const marketDataService = MarketDataService.getInstance(); 