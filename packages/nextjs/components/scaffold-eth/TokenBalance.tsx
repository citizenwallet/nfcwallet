"use client";

import EURbIcon from "@/public/eurb.svg";
import { Address } from "viem";
import { useContractRead } from "wagmi";
import { erc20ABI } from "wagmi";

type TokenBalanceProps = {
  address: Address;
  tokenAddress: Address;
  className?: string;
  symbol?: string;
  precision?: number;
};

/**
 * Display (ETH & USD) balance of an ETH address.
 */
export const TokenBalance = ({
  precision = 2,
  address,
  tokenAddress,
  symbol = "",
  className = "",
}: TokenBalanceProps) => {
  const {
    data: fetchedBalanceData,
    isError,
    isLoading,
  } = useContractRead({
    abi: erc20ABI,
    address: tokenAddress,
    functionName: "balanceOf",
    args: [address],
    watch: true,
  });

  if (!address || isLoading || fetchedBalanceData === null) {
    return (
      <div className="animate-pulse flex space-x-4">
        <div className="rounded-md bg-slate-300 h-6 w-6"></div>
        <div className="flex items-center space-y-6">
          <div className="h-2 w-28 bg-slate-300 rounded"></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className={`border-2 border-gray-400 rounded-md px-2 flex flex-col items-center max-w-fit cursor-pointer ${className}`}
      >
        <div className="text-warning">Error</div>
      </div>
    );
  }

  const balance = Number(fetchedBalanceData) / 10 ** 6;
  return (
    <div className={`w-full flex items-baseline justify-center mx-auto text-4xl ${className}`}>
      <div className="flex flex-row items-center gap-2">
        {symbol === "EURb" && (
          <span>
            <EURbIcon width={32} height={32} className="w-8 h-8" />
          </span>
        )}
        <span className="font-bold text-2xl">{balance?.toFixed(precision)}</span>
        <span className={`${symbol.length < 3 ? "text-4xl" : "text-xl"} ml-0`}>{symbol}</span>
      </div>
    </div>
  );
};
