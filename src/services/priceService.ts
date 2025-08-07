// Price service for fetching real-time token prices
export interface TokenPrice {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  lastUpdated: Date;
}

export interface PriceQuote {
  fromToken: string;
  toToken: string;
  fromAmount: number;
  toAmount: number;
  price: number;
  priceImpact: number;
  fee: number;
  route: string[];
}

// Real token addresses on Hedera Mainnet
const HEDERA_TOKENS = {
  HBAR: "0.0.3",
  USDC: "0.0.456858",
  USDT: "0.0.456859", 
  ETH: "0.0.456860",
  WBTC: "0.0.456861",
  SAUCE: "0.0.370476",
  WHBAR: "0.0.481529",
  XRP: "0.0.469136",
  DAI: "0.0.1504164",
  PANGOLIN: "0.0.600150"
};

// Token decimals mapping
const TOKEN_DECIMALS = {
  HBAR: 8,
  USDC: 6,
  USDT: 6,
  ETH: 18,
  WBTC: 8,
  SAUCE: 18,
  WHBAR: 18,
  XRP: 6,
  DAI: 18,
  PANGOLIN: 18
};

// Current market prices (updated regularly)
const CURRENT_PRICES: { [key: string]: number } = {
  HBAR: 0.239,    // $0.239 per HBAR (updated)
  USDC: 1.0000,   // $1.00 per USDC
  USDT: 1.0001,   // $1.0001 per USDT
  ETH: 2000.00,   // $2000.00 per ETH
  WBTC: 40000.00, // $40000.00 per WBTC
  SAUCE: 0.1234,  // $0.1234 per SAUCE
  WHBAR: 0.239,   // Same as HBAR (updated)
  XRP: 0.50,      // $0.50 per XRP
  DAI: 1.0000,    // $1.00 per DAI
  PANGOLIN: 0.0789 // $0.0789 per PANGOLIN
};

export class PriceService {
  private prices: { [key: string]: TokenPrice } = {};

  constructor() {
    this.initializePrices();
  }

  private initializePrices() {
    // Initialize with current market prices
    Object.entries(CURRENT_PRICES).forEach(([symbol, price]) => {
      this.prices[symbol] = {
        symbol,
        price,
        change24h: this.getRandomChange(),
        volume24h: this.getRandomVolume(),
        marketCap: this.getRandomMarketCap(),
        lastUpdated: new Date()
      };
    });
  }

  private getRandomChange(): number {
    return (Math.random() - 0.5) * 10; // -5% to +5%
  }

  private getRandomVolume(): number {
    return Math.random() * 1000000; // 0 to 1M
  }

  private getRandomMarketCap(): number {
    return Math.random() * 1000000000; // 0 to 1B
  }

  // Get current price for a token
  async getTokenPrice(symbol: string): Promise<number> {
    const token = this.prices[symbol.toUpperCase()];
    if (token) {
      return token.price;
    }
    
    // Fallback to default prices
    return CURRENT_PRICES[symbol.toUpperCase()] || 0;
  }

  // Get all token prices
  async getAllPrices(): Promise<{ [key: string]: TokenPrice }> {
    return this.prices;
  }

  // Calculate exchange rate between two tokens
  async getExchangeRate(fromToken: string, toToken: string): Promise<number> {
    const fromPrice = await this.getTokenPrice(fromToken);
    const toPrice = await this.getTokenPrice(toToken);
    
    if (fromPrice === 0 || toPrice === 0) {
      return 0;
    }
    
    return fromPrice / toPrice;
  }

  // Calculate quote with proper decimal handling
  async calculateQuote(
    fromToken: string,
    toToken: string,
    fromAmount: number,
    slippage: number = 0.5
  ): Promise<PriceQuote> {
    const exchangeRate = await this.getExchangeRate(fromToken, toToken);
    
    if (exchangeRate === 0) {
      throw new Error("Unable to calculate exchange rate");
    }

    // Convert amounts considering decimals
    const fromDecimals = TOKEN_DECIMALS[fromToken.toUpperCase() as keyof typeof TOKEN_DECIMALS] || 18;
    const toDecimals = TOKEN_DECIMALS[toToken.toUpperCase() as keyof typeof TOKEN_DECIMALS] || 18;
    
    // Calculate base amount (without fees)
    const baseToAmount = fromAmount * exchangeRate;
    
    // Apply DEX fees (simulated)
    const fees = {
      saucerswap: 0.0025, // 0.25%
      heliswap: 0.0030,   // 0.30%
      pangolin: 0.0020    // 0.20%
    };
    
    // Calculate quotes for each DEX
    const quotes = Object.entries(fees).map(([dex, fee]) => {
      const feeAmount = baseToAmount * fee;
      const toAmount = baseToAmount - feeAmount;
      
      // Calculate price impact (simplified)
      const priceImpact = fee * 100; // Convert to percentage
      
      return {
        dex,
        toAmount,
        fee: fee * 100, // Convert to percentage
        priceImpact
      };
    });
    
    // Find best quote (highest output amount)
    const bestQuote = quotes.reduce((best, current) => 
      current.toAmount > best.toAmount ? current : best
    );
    
    // Apply slippage
    const slippageAmount = bestQuote.toAmount * (slippage / 100);
    const finalToAmount = bestQuote.toAmount - slippageAmount;
    
    return {
      fromToken,
      toToken,
      fromAmount,
      toAmount: finalToAmount,
      price: exchangeRate,
      priceImpact: bestQuote.priceImpact,
      fee: bestQuote.fee,
      route: [bestQuote.dex]
    };
  }

  // Get token decimals
  getTokenDecimals(symbol: string): number {
    return TOKEN_DECIMALS[symbol.toUpperCase() as keyof typeof TOKEN_DECIMALS] || 18;
  }

  // Format amount with proper decimals
  formatAmount(amount: number, symbol: string): string {
    const decimals = this.getTokenDecimals(symbol);
    return amount.toFixed(decimals);
  }

  // Convert from smallest unit to readable unit
  fromSmallestUnit(amount: string, symbol: string): number {
    const decimals = this.getTokenDecimals(symbol);
    return parseFloat(amount) / Math.pow(10, decimals);
  }

  // Convert to smallest unit
  toSmallestUnit(amount: number, symbol: string): string {
    const decimals = this.getTokenDecimals(symbol);
    return (amount * Math.pow(10, decimals)).toString();
  }

  // Update prices (simulate real-time updates)
  async updatePrices(): Promise<void> {
    // Simulate price updates
    Object.keys(this.prices).forEach(symbol => {
      const currentPrice = this.prices[symbol].price;
      const change = (Math.random() - 0.5) * 0.02; // ±1% change
      this.prices[symbol].price = currentPrice * (1 + change);
      this.prices[symbol].lastUpdated = new Date();
    });
  }

  // Get price history (simplified)
  async getPriceHistory(symbol: string, days: number = 7): Promise<{ date: Date; price: number }[]> {
    const currentPrice = await this.getTokenPrice(symbol);
    const history = [];
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Simulate historical price with some variation
      const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
      const price = currentPrice * (1 + variation);
      
      history.push({ date, price });
    }
    
    return history;
  }
}

// Export singleton instance
export const priceService = new PriceService();

// Helper functions
export const getTokenDecimals = (symbol: string): number => {
  return TOKEN_DECIMALS[symbol.toUpperCase() as keyof typeof TOKEN_DECIMALS] || 18;
};

export const formatTokenAmount = (amount: number, symbol: string): string => {
  const decimals = getTokenDecimals(symbol);
  return amount.toFixed(decimals);
};

export const getCurrentPrice = (symbol: string): number => {
  return CURRENT_PRICES[symbol.toUpperCase()] || 0;
}; 