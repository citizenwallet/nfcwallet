import { useEffect, useState } from "react";
import Link from "next/link";
import EURbIcon from "@/public/eurb.svg";
import { Config, ERC20ContractService } from "@citizenwallet/sdk";
import { JsonRpcProvider, formatUnits } from "ethers";
import { hexToRgba } from "~~/lib/colors";
import PlusIcon from "~~/public/plus.svg";

export default function CWTokenBalance({
  accountAddress,
  config,
  className,
  precision,
}: {
  accountAddress: string;
  config: Config;
  className?: string;
  precision?: number;
}) {
  const [balance, setBalance] = useState("0");

  useEffect(() => {
    const erc20token = new ERC20ContractService(
      config.token.address,
      config.node.ws_url,
      new JsonRpcProvider(config.node.url),
    );
    erc20token.balanceOf(accountAddress).then(balance => {
      const formattedBalance = formatUnits(balance, config.token.decimals);
      setBalance(parseFloat(formattedBalance).toFixed(precision || 2));
    });
  });

  const symbol = config.token.symbol;
  const communitySlug = config.community.alias;
  const profilePageUrl = `${process.env.NEXT_PUBLIC_WEBAPP_URL}/${communitySlug}/${accountAddress}`;
  const hasPlugin = (plugin: string) => {
    if (communitySlug === "wallet.regenvillage.brussels" && plugin === "poap") return true;
    if (communitySlug === "wallet.pay.brussels") return true;
    return config.plugins?.includes(plugin);
  };

  const getPlugin = (plugin: string) => {
    return config.plugins?.find((p: any) => p.name === plugin);
  };

  return (
    <div>
      <div
        style={{ backgroundColor: hexToRgba(config.community.theme.primary, 0.1) }}
        className="w-full text-center rounded-2xl box-border overflow-hidden h-16 items-center flex"
      >
        <div className={`w-full flex items-baseline justify-center mx-auto text-4xl ${className}`}>
          <div className="flex flex-row items-center gap-2">
            {symbol === "EURb" && (
              <span>
                <EURbIcon width={32} height={32} className="w-8 h-8" />
              </span>
            )}
            <span className="font-bold text-2xl">{parseFloat(balance)?.toFixed(precision || 2)}</span>
            <span className={`${symbol.length < 3 ? "text-4xl" : "text-xl"} ml-0`}>{symbol}</span>
          </div>
        </div>

        {hasPlugin("topup") && (
          <Link
            href={`${getPlugin("Top Up").url}?account=${accountAddress}&redirectUrl=${encodeURIComponent(
              profilePageUrl,
            )}`}
          >
            <div
              style={{ backgroundColor: hexToRgba(config.community.theme.primary, 0.1) }}
              className="flex-shrink-0 w-16 h-16 text-center rounded-2xl box-border overflow-hidden flex justify-center items-center active:opacity-70"
            >
              <PlusIcon />
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
