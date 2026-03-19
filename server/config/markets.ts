export type MonitoredMarketConfig = {
  key: string;
  label: string;
  venue: "Limitless";
  assetSymbol: "BTC" | "ETH" | "SOL" | "XRP" | "DOGE";
  slugHint?: string;
  searchTerms: string[];
  preferredCategory?: string;
};

export const monitoredMarkets: MonitoredMarketConfig[] = [
  {
    key: "btc-threshold",
    label: "Bitcoin threshold market",
    venue: "Limitless",
    assetSymbol: "BTC",
    slugHint: process.env.LIMITLESS_MARKET_SLUG,
    searchTerms: ["bitcoin", "btc"],
    preferredCategory: "Crypto",
  },
  {
    key: "eth-threshold",
    label: "Ethereum threshold market",
    venue: "Limitless",
    assetSymbol: "ETH",
    searchTerms: ["ethereum", "eth"],
    preferredCategory: "Crypto",
  },
  {
    key: "sol-threshold",
    label: "Solana threshold market",
    venue: "Limitless",
    assetSymbol: "SOL",
    searchTerms: ["solana", "sol"],
    preferredCategory: "Crypto",
  },
  {
    key: "xrp-threshold",
    label: "XRP threshold market",
    venue: "Limitless",
    assetSymbol: "XRP",
    searchTerms: ["xrp", "ripple"],
    preferredCategory: "Crypto",
  },
  {
    key: "doge-threshold",
    label: "Dogecoin threshold market",
    venue: "Limitless",
    assetSymbol: "DOGE",
    searchTerms: ["doge", "dogecoin"],
    preferredCategory: "Crypto",
  },
];
