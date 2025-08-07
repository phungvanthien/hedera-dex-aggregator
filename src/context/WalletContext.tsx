import { useEffect, useState, useMemo, createContext, ReactNode } from "react";
import PropTypes from "prop-types";
import { useAccount, useConnect, useDisconnect } from "wagmi";
// import { useHashConnect } from "@/hooks/useHashConnect"; // Adjust the import path as needed
interface WalletContextType {
  walletData: any;
  accountId: string | null;
  userProfile: any;
  balance: string | null;
  connectWallet: () => Promise<void>;
  connectEvmWallet: () => Promise<void>;
  disconnect: () => void;
  connected: boolean;
  isConnected?: boolean; // Alias for connected for backward compatibility
  walletType: "hedera" | "evm" | null;
  hederaAccountIds: string[];
  isPaired: boolean;
  pairingString: string;
  isEvmConnected: boolean;
}

export const WalletContext = createContext<WalletContextType>({
  walletData: null,
  accountId: null,
  userProfile: null,
  balance: null,
  connectWallet: async () => {},
  connectEvmWallet: async () => {},
  disconnect: () => {},
  connected: false,
  walletType: null,
  hederaAccountIds: [],
  isEvmConnected: false,
  isPaired: false,
  pairingString: "",
});

const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [walletData, setWalletData] = useState<any>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<"hedera" | "evm" | null>(null);
  const [hederaAccountIds, setHederaAccountIds] = useState<string[]>([]);
  const [isPaired, setIsPaired] = useState(false);
  const [pairingString, setPairingString] = useState("");

  // RainbowKit (wagmi) hooks for EVM
  const { address: evmAddress, isConnected: isEvmConnected } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { disconnectAsync: evmDisconnect } = useDisconnect();

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let isMounted = true;
    (async () => {
      if (typeof window === "undefined") return;
      try {
        if (window !== undefined) {
          const { useHashConnect } = await import("@/hooks/useHashConnect");
          const { setupHashConnectListeners } = useHashConnect();
          cleanup = setupHashConnectListeners(
            ({ accountIds, isConnected, pairingString }) => {
              if (!isMounted) return;
              setHederaAccountIds(accountIds);
              setIsPaired(isConnected);
              setPairingString(pairingString);
              if (isConnected && accountIds.length > 0) {
                setAccountId(accountIds[0]);
                setWalletType("hedera");
              }
            }
          );
        }
      } catch (e) {
        // Ignore if not available
      }
    })();
    return () => {
      isMounted = false;
      if (cleanup) cleanup();
    };
  }, []);

  // Hedera wallet connect (dynamic import)
  const connectWallet = async () => {
    if (typeof window === "undefined") return;
    
    // Use HashPack only for Hedera transactions
    try {
      const WalletConnectModule = await import("@/hooks/walletConnect");
      if (!isPaired) {
        await WalletConnectModule.hc.init();
        WalletConnectModule.hc.openPairingModal();
        // Only use HashPack - no EVM fallback
        return;
      } else {
        // If already paired, disconnect first
        WalletConnectModule.hc.disconnect();
        setHederaAccountIds([]);
        setIsPaired(false);
        setPairingString("");
        setAccountId(null);
        setWalletType(null);
        return;
      }
    } catch (e) {
      console.log("HashPack not available, trying EVM wallet");
    }
    
    // Only try EVM wallet if HashPack is not available
    try {
      if (window.ethereum) {
        const { addOrSwitchHederaMainnet } = await import(
          "@/hooks/useEvmWallet"
        );
        await window.ethereum.request({ method: "eth_requestAccounts" });
        await addOrSwitchHederaMainnet();
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts && accounts.length > 0) {
          setAccountId(accounts[0]);
          setWalletType("evm");
        }
      } else {
        console.log("No EVM wallet found");
      }
    } catch (err) {
      console.error("EVM wallet connection failed:", err);
      setAccountId(null);
      setWalletType(null);
    }
  };

  // EVM wallet connect
  const connectEvmWallet = async () => {
    const connector = connectors[0];
    await connectAsync({ connector });
    setWalletType("evm");
  };

  // Disconnect
  const disconnect = () => {
    setWalletData(null);
    setAccountId(null);
    setUserProfile(null);
    setBalance(null);
    setWalletType(null);
    if (walletType === "evm") {
      evmDisconnect();
    }
  };

  // Sync EVM wallet state
  useEffect(() => {
    const fetchHederaAccountId = async (evmAddr: string) => {
      try {
        // Use mainnet or testnet as needed
        const network = "mainnet";
        const baseUrl =
          network === "mainnet"
            ? "https://mainnet-public.mirrornode.hedera.com/api/v1/accounts/"
            : "https://testnet.mirrornode.hedera.com/api/v1/accounts/";
        const res = await fetch(`${baseUrl}${evmAddr}`);
        const data = await res.json();
        if (data.account) {
          setAccountId(data.account);
        } else {
          setAccountId(null);
        }
      } catch (e) {
        setAccountId(null);
      }
    };
    if (isEvmConnected && evmAddress) {
      fetchHederaAccountId(evmAddress);
      setWalletType("evm");
    } else if (walletType === "evm") {
      setAccountId(null);
      setWalletType(null);
    }
  }, [isEvmConnected, evmAddress]);

  useEffect(() => {
    const getUserProfile = async () => {
      if (!accountId) return;
      try {
        const request = await fetch(
          "https://api.hashpack.app/user-profile/get",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ accountId: accountId, network: "mainnet" }),
          }
        );
        if (!request.ok) {
          console.error(`Failed to fetch user profile: ${request.statusText}`);
          return;
        }
        const response = await request.json();
        setUserProfile(response);
      } catch (error) {
        console.error("Error fetching user profile data:", error);
      }
    };
    getUserProfile();
  }, [accountId]);

  // Dynamically import and use accountBalance
  useEffect(() => {
    if (!accountId) return;
    let isMounted = true;
    (async () => {
      try {
        const { default: accountBalance } = await import(
          "@/hooks/accountBalance"
        );
        const newBalance = await accountBalance(accountId);
        if (isMounted) setBalance(newBalance as string | null);
      } catch (e) {
        // Ignore if not available
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [accountId]);

  const value = useMemo(
    () => ({
      walletData,
      accountId,
      userProfile,
      balance,
      connectWallet,
      connectEvmWallet,
      disconnect,
      connected: Boolean(accountId),
      isConnected: Boolean(accountId), // Alias for backward compatibility
      isEvmConnected,
      walletType,
      hederaAccountIds,
      isPaired,
      pairingString,
    }),
    [
      walletData,
      accountId,
      userProfile,
      balance,
      connectWallet,
      connectEvmWallet,
      disconnect,
      isEvmConnected,
      walletType,
      hederaAccountIds,
      isPaired,
      pairingString,
    ]
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};

WalletProvider.propTypes = {
  children: PropTypes.node,
};

export default WalletProvider;
