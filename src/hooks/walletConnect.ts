// "use client";
import { HashConnect } from "hashconnect/dist/hashconnect.js";
import { LedgerId } from "@hashgraph/sdk";

const env = "testnet";
const projectId = "0c306a1b7d3106ac56154e190058a550";
const appMetadata = {
  name: "HederaDEX",
  description: "Advanced DEX Aggregator for Hedera.",
  // icons: [window.location.origin + "/assets/tokenTicketsLogo.png"],

  icons: ["https://avatars.githubusercontent.com/u/31002956?s=200&v=4"],
  // url: window.location.origin,
  url: typeof window !== "undefined" ? window.location.origin : "",
};
export const hc = new HashConnect(
  LedgerId.fromString(env),
  projectId,
  appMetadata,
  true
);
export const getConnectedAccountIds = () => {
  return hc.connectedAccountIds;
};
export const hcInitPromise = hc.init();

async function walletConnect() {}

export default walletConnect;
