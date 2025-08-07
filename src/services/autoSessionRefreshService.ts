import { hashConnectSessionManager } from "./hashConnectSessionManager";
import { realHashConnectService } from "./realHashConnectService";

export interface SessionStatus {
  isInitialized: boolean;
  isConnected: boolean;
  connectedAccounts: string[];
  needsRefresh: boolean;
}

export class AutoSessionRefreshService {
  private static instance: AutoSessionRefreshService;
  private refreshAttempts: number = 0;
  private maxRefreshAttempts: number = 5; // Increased from 3 to 5
  private isRefreshing: boolean = false;
  private lastRefreshTime: number = 0;
  private refreshCooldown: number = 10000; // 10 seconds cooldown

  static getInstance(): AutoSessionRefreshService {
    if (!AutoSessionRefreshService.instance) {
      AutoSessionRefreshService.instance = new AutoSessionRefreshService();
    }
    return AutoSessionRefreshService.instance;
  }

  /**
   * Check session status and auto-refresh if needed
   */
  async checkAndRefreshSession(): Promise<SessionStatus> {
    try {
      console.log("AutoSessionRefreshService: Checking session status...");

      // Get current session status
      const session = hashConnectSessionManager.getSession();
      const isConnected = hashConnectSessionManager.isConnected();
      const connectedAccounts = hashConnectSessionManager.getConnectedAccountIds();

      console.log("AutoSessionRefreshService: Current session:", {
        isInitialized: session.isInitialized,
        isConnected,
        connectedAccounts: connectedAccounts.length
      });

      // Check if session needs refresh
      const needsRefresh = !session.isInitialized || !isConnected || connectedAccounts.length === 0;

      // Check if we can attempt refresh (cooldown and attempts)
      const canAttemptRefresh = needsRefresh && 
        this.refreshAttempts < this.maxRefreshAttempts && 
        !this.isRefreshing &&
        (Date.now() - this.lastRefreshTime) > this.refreshCooldown;

      if (canAttemptRefresh) {
        console.log("AutoSessionRefreshService: Session needs refresh, attempting auto-refresh...");
        return await this.performAutoRefresh();
      }

      return {
        isInitialized: session.isInitialized,
        isConnected,
        connectedAccounts,
        needsRefresh
      };

    } catch (error) {
      console.error("AutoSessionRefreshService: Error checking session:", error);
      return {
        isInitialized: false,
        isConnected: false,
        connectedAccounts: [],
        needsRefresh: true
      };
    }
  }

  /**
   * Perform automatic session refresh with improved logic
   */
  private async performAutoRefresh(): Promise<SessionStatus> {
    if (this.isRefreshing) {
      console.log("AutoSessionRefreshService: Already refreshing, skipping...");
      return this.getCurrentStatus();
    }

    this.isRefreshing = true;
    this.refreshAttempts++;
    this.lastRefreshTime = Date.now();

    try {
      console.log(`AutoSessionRefreshService: Auto-refresh attempt ${this.refreshAttempts}/${this.maxRefreshAttempts}`);

      // Step 1: Disconnect first if needed
      console.log("AutoSessionRefreshService: Step 1 - Disconnecting if needed...");
      try {
        await hashConnectSessionManager.disconnect();
        console.log("AutoSessionRefreshService: Disconnected successfully");
      } catch (disconnectError) {
        console.log("AutoSessionRefreshService: Disconnect failed (this is okay):", disconnectError);
      }

      // Step 2: Wait a bit before reconnecting
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 3: Initialize HashConnect
      console.log("AutoSessionRefreshService: Step 2 - Initializing HashConnect...");
      const initialized = await hashConnectSessionManager.initialize();
      
      if (!initialized) {
        throw new Error("Failed to initialize HashConnect");
      }

      // Step 4: Wait a bit before connecting
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 5: Try to connect to local wallet
      console.log("AutoSessionRefreshService: Step 3 - Connecting to local wallet...");
      const connected = await hashConnectSessionManager.connectToLocalWallet();

      if (!connected) {
        throw new Error("Failed to connect to HashPack wallet");
      }

      // Step 6: Wait for connection to stabilize
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 7: Verify connection
      console.log("AutoSessionRefreshService: Step 4 - Verifying connection...");
      const session = hashConnectSessionManager.getSession();
      const connectedAccounts = hashConnectSessionManager.getConnectedAccountIds();

      console.log("AutoSessionRefreshService: Auto-refresh successful:", {
        isInitialized: session.isInitialized,
        isConnected: session.isConnected,
        connectedAccounts: connectedAccounts.length
      });

      // Reset refresh attempts on success
      this.refreshAttempts = 0;

      return {
        isInitialized: session.isInitialized,
        isConnected: session.isConnected,
        connectedAccounts,
        needsRefresh: false
      };

    } catch (error) {
      console.error("AutoSessionRefreshService: Auto-refresh failed:", error);
      
      return {
        isInitialized: false,
        isConnected: false,
        connectedAccounts: [],
        needsRefresh: true
      };

    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Get current session status
   */
  private getCurrentStatus(): SessionStatus {
    const session = hashConnectSessionManager.getSession();
    const connectedAccounts = hashConnectSessionManager.getConnectedAccountIds();

    return {
      isInitialized: session.isInitialized,
      isConnected: session.isConnected,
      connectedAccounts,
      needsRefresh: !session.isInitialized || !session.isConnected || connectedAccounts.length === 0
    };
  }

  /**
   * Reset refresh attempts
   */
  resetRefreshAttempts(): void {
    this.refreshAttempts = 0;
    this.lastRefreshTime = 0;
    console.log("AutoSessionRefreshService: Reset refresh attempts");
  }

  /**
   * Force manual refresh with reset
   */
  async forceRefresh(): Promise<SessionStatus> {
    console.log("AutoSessionRefreshService: Force refresh requested");
    this.refreshAttempts = 0;
    this.lastRefreshTime = 0;
    return await this.performAutoRefresh();
  }

  /**
   * Check if session is healthy
   */
  isSessionHealthy(): boolean {
    const session = hashConnectSessionManager.getSession();
    const connectedAccounts = hashConnectSessionManager.getConnectedAccountIds();
    
    return session.isInitialized && 
           session.isConnected && 
           connectedAccounts.length > 0 &&
           this.refreshAttempts < this.maxRefreshAttempts;
  }

  /**
   * Get refresh status
   */
  getRefreshStatus(): {
    attempts: number;
    maxAttempts: number;
    isRefreshing: boolean;
    lastRefreshTime: number;
    cooldownRemaining: number;
  } {
    const cooldownRemaining = Math.max(0, this.refreshCooldown - (Date.now() - this.lastRefreshTime));
    
    return {
      attempts: this.refreshAttempts,
      maxAttempts: this.maxRefreshAttempts,
      isRefreshing: this.isRefreshing,
      lastRefreshTime: this.lastRefreshTime,
      cooldownRemaining
    };
  }

  /**
   * Emergency reset - completely reset the service
   */
  emergencyReset(): void {
    console.log("AutoSessionRefreshService: Emergency reset");
    this.refreshAttempts = 0;
    this.lastRefreshTime = 0;
    this.isRefreshing = false;
  }

  /**
   * Check if we can attempt refresh (considering cooldown)
   */
  canAttemptRefresh(): boolean {
    const timeSinceLastRefresh = Date.now() - this.lastRefreshTime;
    return this.refreshAttempts < this.maxRefreshAttempts && 
           !this.isRefreshing && 
           timeSinceLastRefresh > this.refreshCooldown;
  }
}

export const autoSessionRefreshService = AutoSessionRefreshService.getInstance(); 