import { AccountBalanceQuery, Client } from "@hashgraph/sdk";

// Get Account Balance Function
interface AccountBalanceResult {
  formattedBalance: string;
}

const accountBalance = async (accountId: string): Promise<string | null> => {
  try {
    // Initialize the Hedera client for testnet
    const client: Client = Client.forTestnet();

    // Execute the AccountBalanceQuery with the account ID
    const accountBalance = await new AccountBalanceQuery()
      .setAccountId(accountId)
      .execute(client);

    // Extract the HBAR balance
    const hbarBalance: string = accountBalance.hbars.toString();

    const formattedBalance: string = parseFloat(hbarBalance).toLocaleString(
      undefined,
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );

    return formattedBalance + " HBAR";
  } catch (error: unknown) {
    console.error("Error fetching account balance:", error);
    return null;
  }
};

export default accountBalance;
