import { HashConnect } from "hashconnect/dist/hashconnect.js";
import { LedgerId } from "@hashgraph/sdk";

export interface HashConnectSession {
  isInitialized: boolean;
  isConnected: boolean;
  connectedAccountIds: string[];
  topic: string | null;
  pairingString: string | null;
  encryptionKey: string | null;
}

export class HashConnectSessionManager {
  private static instance: HashConnectSessionManager;
  private hashConnect: HashConnect | null = null;
  private session: HashConnectSession = {
    isInitialized: false,
    isConnected: false,
    connectedAccountIds: [],
    topic: null,
    pairingString: null,
    encryptionKey: null
  };

  static getInstance(): HashConnectSessionManager {
    if (!HashConnectSessionManager.instance) {
      HashConnectSessionManager.instance = new HashConnectSessionManager();
    }
    return HashConnectSessionManager.instance;
  }

  /**
   * Initialize HashConnect
   */
  async initialize(): Promise<boolean> {
    try {
      console.log("HashConnectSessionManager: Initializing HashConnect...");

      if (this.hashConnect) {
        console.log("HashConnectSessionManager: HashConnect already initialized");
        this.updateSessionStatus();
        return true;
      }

      // Check if we're in a browser environment
      if (typeof window === "undefined") {
        console.error("HashConnectSessionManager: Not in browser environment");
        return false;
      }

      const env = "mainnet";
      const projectId = "0c306a1b7d3106ac56154e190058a550";
      const appMetadata = {
        name: "HederaDEX",
        description: "Advanced DEX Aggregator for Hedera.",
        icons: ["https://avatars.githubusercontent.com/u/31002956?s=200&v=4"],
        url: window.location.origin,
      };

      console.log("HashConnectSessionManager: Creating HashConnect instance with:", {
        env,
        projectId,
        appMetadata
      });

      this.hashConnect = new HashConnect(
        LedgerId.fromString(env),
        projectId,
        appMetadata,
        true
      );

      console.log("HashConnectSessionManager: HashConnect instance created, initializing...");

      // Initialize HashConnect
      await this.hashConnect.init();
      console.log("HashConnectSessionManager: HashConnect initialized successfully");

      // Set up event listeners
      this.setupEventListeners();

      // Update session status
      this.updateSessionStatus();

      this.session.isInitialized = true;
      
      console.log("HashConnectSessionManager: Initialization complete. Session:", this.session);
      return true;

    } catch (error) {
      console.error("HashConnectSessionManager: Failed to initialize HashConnect:", error);
      this.hashConnect = null;
      this.session.isInitialized = false;
      return false;
    }
  }

  /**
   * Set up event listeners for HashConnect
   */
  private setupEventListeners(): void {
    if (!this.hashConnect) return;

    console.log("HashConnectSessionManager: Setting up event listeners...");

    try {
      // Pairing event - this is crucial for establishing full session
      if (this.hashConnect.pairingEvent) {
        this.hashConnect.pairingEvent.once((pairingData: any) => {
          console.log("HashConnectSessionManager: Pairing event received:", pairingData);
          this.session.topic = pairingData.topic || null;
          this.session.encryptionKey = pairingData.encryptionKey || null;
          this.session.pairingString = pairingData.pairingString || null;
          this.updateSessionStatus();
        });
      }

      // Connection status change event
      if (this.hashConnect.connectionStatusChangeEvent) {
        this.hashConnect.connectionStatusChangeEvent.once((connectionStatus: any) => {
          console.log("HashConnectSessionManager: Connection status changed:", connectionStatus);
          this.updateSessionStatus();
        });
      }

      // Additional event listeners for debugging
      // Note: These events may not exist in all HashConnect versions
      try {
        if ((this.hashConnect as any).foundExtensionEvent) {
          (this.hashConnect as any).foundExtensionEvent.once((walletMetadata: any) => {
            console.log("HashConnectSessionManager: Found extension:", walletMetadata);
          });
        }
      } catch (error) {
        // Ignore if event doesn't exist
      }

      try {
        if ((this.hashConnect as any).foundExtensionIframeEvent) {
          (this.hashConnect as any).foundExtensionIframeEvent.once((walletMetadata: any) => {
            console.log("HashConnectSessionManager: Found extension iframe:", walletMetadata);
          });
        }
      } catch (error) {
        // Ignore if event doesn't exist
      }

      console.log("HashConnectSessionManager: Event listeners set up successfully");
    } catch (error) {
      console.warn("HashConnectSessionManager: Some event listeners failed to set up:", error);
    }
  }

  /**
   * Update session status
   */
  private updateSessionStatus(): void {
    if (!this.hashConnect) return;

    try {
      this.session.isConnected = this.hashConnect.connectedAccountIds.length > 0;
      this.session.connectedAccountIds = this.hashConnect.connectedAccountIds.map(id => id.toString());
      
      // Try to get topic and encryption key if available
      if ((this.hashConnect as any).topic) {
        this.session.topic = (this.hashConnect as any).topic || null;
      }
      if ((this.hashConnect as any).encryptionKey) {
        this.session.encryptionKey = (this.hashConnect as any).encryptionKey || null;
      }
      if ((this.hashConnect as any).pairingString) {
        this.session.pairingString = (this.hashConnect as any).pairingString || null;
      }

      console.log("HashConnectSessionManager: Session status updated:", this.session);
    } catch (error) {
      console.warn("HashConnectSessionManager: Error updating session status:", error);
    }
  }

  /**
   * Get HashConnect instance
   */
  getHashConnect(): HashConnect | null {
    return this.hashConnect;
  }

  /**
   * Get current session
   */
  getSession(): HashConnectSession {
    return { ...this.session };
  }

  /**
   * Check if HashConnect is initialized
   */
  isInitialized(): boolean {
    return this.session.isInitialized;
  }

  /**
   * Check if connected to wallet
   */
  isConnected(): boolean {
    return this.session.isConnected;
  }

  /**
   * Get connected account IDs
   */
  getConnectedAccountIds(): string[] {
    return this.session.connectedAccountIds;
  }

  /**
   * Connect to local wallet with improved session establishment
   */
  async connectToLocalWallet(): Promise<boolean> {
    try {
      if (!this.hashConnect) {
        console.error("HashConnectSessionManager: HashConnect not initialized");
        return false;
      }

      console.log("HashConnectSessionManager: Connecting to local wallet...");
      
      // First, try to find extension
      console.log("HashConnectSessionManager: Looking for HashPack extension...");
      
      // Try to connect using available methods
      let connection = false;
      
      // Method 1: Try connectToLocalWallet
      if (typeof (this.hashConnect as any).connectToLocalWallet === 'function') {
        try {
          connection = await (this.hashConnect as any).connectToLocalWallet();
          console.log("HashConnectSessionManager: connectToLocalWallet result:", connection);
        } catch (error) {
          console.warn("HashConnectSessionManager: connectToLocalWallet failed:", error);
        }
      }
      
      // Method 2: Try connect if first method failed
      if (!connection && typeof (this.hashConnect as any).connect === 'function') {
        try {
          connection = await (this.hashConnect as any).connect();
          console.log("HashConnectSessionManager: connect result:", connection);
        } catch (error) {
          console.warn("HashConnectSessionManager: connect failed:", error);
        }
      }

      // Method 3: Try to open pairing modal if no connection
      if (!connection) {
        console.log("HashConnectSessionManager: No direct connection, trying pairing modal...");
        try {
          if (typeof (this.hashConnect as any).openPairingModal === 'function') {
            (this.hashConnect as any).openPairingModal();
            console.log("HashConnectSessionManager: Pairing modal opened");
            
            // Wait for pairing to complete
            await new Promise(resolve => setTimeout(resolve, 5000));
            this.updateSessionStatus();
            
            connection = this.session.isConnected;
          }
        } catch (error) {
          console.warn("HashConnectSessionManager: Pairing modal failed:", error);
        }
      }
      
      console.log("HashConnectSessionManager: Final connection result:", connection);
      
      // Update session status
      this.updateSessionStatus();
      
      // Check if we have a proper session
      if (this.session.isConnected && this.session.topic && this.session.encryptionKey) {
        console.log("HashConnectSessionManager: Full session established successfully");
        return true;
      } else if (this.session.isConnected) {
        console.log("HashConnectSessionManager: Connected but missing session data. Attempting to establish session...");
        
        // Try to establish session by requesting pairing
        try {
          if (typeof (this.hashConnect as any).requestPairing === 'function') {
            const pairingString = await (this.hashConnect as any).requestPairing();
            console.log("HashConnectSessionManager: Pairing string generated:", pairingString);
            
            // Wait for the pairing to complete
            await new Promise(resolve => setTimeout(resolve, 3000));
            this.updateSessionStatus();
            
            if (this.session.topic && this.session.encryptionKey) {
              console.log("HashConnectSessionManager: Session established after pairing");
              return true;
            }
          }
        } catch (pairingError) {
          console.warn("HashConnectSessionManager: Pairing failed:", pairingError);
        }
        
        console.warn("HashConnectSessionManager: Connected but session not fully established");
        return false;
      }
      
      return this.session.isConnected;

    } catch (error) {
      console.error("HashConnectSessionManager: Failed to connect to local wallet:", error);
      return false;
    }
  }

  /**
   * Disconnect from wallet
   */
  async disconnect(): Promise<void> {
    try {
      if (!this.hashConnect) return;

      console.log("HashConnectSessionManager: Disconnecting from wallet...");
      
      if (typeof this.hashConnect.disconnect === 'function') {
        await this.hashConnect.disconnect();
      } else if (typeof (this.hashConnect as any).disconnect === 'function') {
        await (this.hashConnect as any).disconnect();
      }
      
      // Reset session
      this.session = {
        isInitialized: this.session.isInitialized,
        isConnected: false,
        connectedAccountIds: [],
        topic: null,
        pairingString: null,
        encryptionKey: null
      };
      
      console.log("HashConnectSessionManager: Disconnected successfully");

    } catch (error) {
      console.error("HashConnectSessionManager: Failed to disconnect:", error);
    }
  }

  /**
   * Send transaction with improved session handling
   */
  async sendTransaction(transaction: any): Promise<any> {
    try {
      if (!this.hashConnect) {
        throw new Error("HashConnect not initialized");
      }

      if (!this.session.isConnected) {
        throw new Error("Not connected to wallet");
      }

      // Check if we have a full session (topic and encryption key)
      if (!this.session.topic || !this.session.encryptionKey) {
        console.log("HashConnectSessionManager: Session not fully established, attempting to establish...");
        const established = await this.forceEstablishSession();
        if (!established) {
          throw new Error("Could not establish full session for transaction");
        }
      }

      console.log("HashConnectSessionManager: Sending transaction with session:", {
        topic: this.session.topic,
        encryptionKey: this.session.encryptionKey ? "present" : "missing",
        connectedAccounts: this.session.connectedAccountIds
      });
      
      let response;
      
      // Try different transaction sending methods
      const sendMethods = [
        'sendTransaction',
        'send',
        'executeTransaction',
        'submitTransaction'
      ];

      for (const method of sendMethods) {
        try {
          if (typeof (this.hashConnect as any)[method] === 'function') {
            console.log(`HashConnectSessionManager: Trying ${method}...`);
            response = await (this.hashConnect as any)[method](transaction);
            console.log(`HashConnectSessionManager: ${method} response:`, response);
            break;
          }
        } catch (methodError) {
          console.warn(`HashConnectSessionManager: ${method} failed:`, methodError);
        }
      }

      if (!response) {
        throw new Error("No transaction sending method worked");
      }
      
      return response;

    } catch (error) {
      console.error("HashConnectSessionManager: Failed to send transaction:", error);
      throw error;
    }
  }

  /**
   * Refresh session
   */
  async refreshSession(): Promise<boolean> {
    try {
      console.log("HashConnectSessionManager: Refreshing session...");
      
      // Re-initialize if needed
      if (!this.hashConnect) {
        return await this.initialize();
      }

      // Update session status
      this.updateSessionStatus();
      
      return this.session.isInitialized;

    } catch (error) {
      console.error("HashConnectSessionManager: Failed to refresh session:", error);
      return false;
    }
  }

  /**
   * Force establish session by requesting pairing
   */
  async forceEstablishSession(): Promise<boolean> {
    try {
      if (!this.hashConnect) {
        console.error("HashConnectSessionManager: HashConnect not initialized");
        return false;
      }

      console.log("HashConnectSessionManager: Force establishing session...");

      // Try different methods to establish session
      const methods = [
        'requestPairing',
        'generatePairingString',
        'createPairingString',
        'getPairingString'
      ];

      for (const method of methods) {
        try {
          if (typeof (this.hashConnect as any)[method] === 'function') {
            console.log(`HashConnectSessionManager: Trying method: ${method}`);
            const result = await (this.hashConnect as any)[method]();
            console.log(`HashConnectSessionManager: ${method} result:`, result);
            
            // Wait for pairing to complete
            await new Promise(resolve => setTimeout(resolve, 3000));
            this.updateSessionStatus();
            
            if (this.session.topic && this.session.encryptionKey) {
              console.log("HashConnectSessionManager: Session established successfully");
              return true;
            }
          }
        } catch (methodError) {
          console.warn(`HashConnectSessionManager: Method ${method} failed:`, methodError);
        }
      }

      // If all methods fail, try opening pairing modal
      try {
        if (typeof (this.hashConnect as any).openPairingModal === 'function') {
          console.log("HashConnectSessionManager: Trying openPairingModal...");
          (this.hashConnect as any).openPairingModal();
          
          // Wait for pairing to complete
          await new Promise(resolve => setTimeout(resolve, 5000));
          this.updateSessionStatus();
          
          if (this.session.topic && this.session.encryptionKey) {
            console.log("HashConnectSessionManager: Session established via pairing modal");
            return true;
          }
        }
      } catch (modalError) {
        console.warn("HashConnectSessionManager: Pairing modal failed:", modalError);
      }

      console.error("HashConnectSessionManager: All session establishment methods failed");
      return false;

    } catch (error) {
      console.error("HashConnectSessionManager: Failed to force establish session:", error);
      return false;
    }
  }

  /**
   * Check if session is ready for transactions
   */
  isSessionReady(): boolean {
    return this.session.isInitialized && 
           this.session.isConnected && 
           !!this.session.topic && 
           !!this.session.encryptionKey;
  }

  /**
   * Get Hedera client for queries
   */
  async getClient(): Promise<any> {
    if (!this.hashConnect) {
      throw new Error("HashConnect not initialized");
    }
    
    // Try to get client from HashConnect
    if ((this.hashConnect as any).getClient) {
      return (this.hashConnect as any).getClient();
    }
    
    // Fallback: create a new client
    const { Client } = await import("@hashgraph/sdk");
    return Client.forMainnet();
  }
}

export const hashConnectSessionManager = HashConnectSessionManager.getInstance(); 