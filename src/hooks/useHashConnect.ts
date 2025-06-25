import { getConnectedAccountIds, hc } from "./walletConnect";

export function useHashConnect() {
  function setupHashConnectListeners(
    onChange: (data: {
      accountIds: string[];
      isConnected: boolean;
      pairingString: string;
    }) => void
  ) {
    // Handler for pairing event
    const handlePairing = (pairingData: any) => {
      const accountIds = getConnectedAccountIds().map((id) => id.toString());
      onChange({
        accountIds,
        isConnected: true,
        pairingString: pairingData?.pairingString || "",
      });
    };

    // Handler for disconnect event
    const handleDisconnect = () => {
      onChange({
        accountIds: [],
        isConnected: false,
        pairingString: "",
      });
    };

    hc.pairingEvent.on(handlePairing);
    hc.disconnectionEvent.on(handleDisconnect);

    // Initial state
    onChange({
      accountIds: getConnectedAccountIds().map((id) => id.toString()),
      isConnected: getConnectedAccountIds().length > 0,
      pairingString: "",
    });

    // Cleanup function
    return () => {
      hc.pairingEvent.off(handlePairing);
      hc.disconnectionEvent.off(handleDisconnect);
    };
  }

  return { setupHashConnectListeners };
}
