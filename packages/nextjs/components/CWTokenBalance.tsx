import { useEffect } from "react";
import EURbIcon from "@/public/eurb.svg";
import { useAccount } from "@/state/account/actions";
import { useProfiles } from "@/state/profiles/actions";

export default function CWTokenBalance({
  accountAddress,
  config,
  className,
  precision,
}: {
  accountAddress: string;
  config: any;
  className?: string;
  precision?: number;
}) {
  const [state, actions] = useAccount(config);
  const [profilesState, profilesActions] = useProfiles(config);
  const account = state(state => state.account);

  useEffect(() => {
    profilesActions.loadProfile(accountAddress);
    let unsubscribe: () => void | undefined;
    if (account) {
      actions.fetchBalance();
      unsubscribe = actions.listen(account);
    }

    return () => {
      unsubscribe?.();
    };
  }, [account, actions]);
  const balance = state(state => state.balance);
  const profile = profilesState(state => state.profiles[account]);
  const symbol = config.token.symbol;
  console.log(">>> account", account);
  console.log(">>> profile", profile);
  console.log(">>> balance", balance, symbol);
  return (
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
  );
}
