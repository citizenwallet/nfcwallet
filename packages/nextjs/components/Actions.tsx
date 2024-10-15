import Link from "next/link";
import { Config } from "@citizenwallet/sdk";

const actions = {
  "wallet.commonshub.brussels": {
    actions: [
      {
        name: "mint_contribution",
        title: "Record a contribution",
        token: "CHT",
      },
      {
        name: "mint_shift",
        title: "Record a 3h shift",
        token: "CHT",
        amount: 3,
        description: "3h shift",
      },
    ],
  },
};

export default function Actions({ config, theme }: { config: Config; theme: any }) {
  const communityActions = actions[config.community.alias]?.actions;
  if (!communityActions) {
    return null;
  }
  return (
    <div className="flex flex-wrap w-full justify-center flex-col">
      {communityActions.map((action, key) => {
        return (
          <Link
            key={key}
            href={"/"}
            className="w-full max-w-md h-18 text-center flex flex-col rounded-xl p-2 mx-auto my-2 bg-[#FFCFCF] bg-opacity-10"
          >
            <div
              className="flex justify-center items-center py-1 px-3 font-semibold text-xl"
              style={{ color: theme?.primary }}
            >
              <div className="flex items-center ml-2">{action.title}</div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
