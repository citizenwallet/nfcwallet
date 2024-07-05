import { useState } from "react";
import { getPasswordHash } from "../utils/crypto";

export default function Authenticate({
  accountAddress,
  config,
  onChange,
}: {
  accountAddress: string;
  config: any;
  onChange: (bearer: string) => void;
}) {
  const [password, setPassword] = useState("");
  const [trustDevice, setTrustDevice] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const communitySlug = config.community.alias;
  function handlePasswordChange(event: React.ChangeEvent<HTMLInputElement>) {
    event.preventDefault();
    setPassword(event.target.value);
  }

  function handleTrustDevice(event: React.ChangeEvent<HTMLInputElement>) {
    console.log(">>> setting trustDevice to", !!event.target.checked);
    setTrustDevice(!!event.target.checked);
  }

  async function handleSubmit(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/authenticate?communitySlug=${communitySlug}`, {
        method: "POST",
        body: JSON.stringify({
          account: accountAddress,
          password: getPasswordHash(password, config.node.chain_id, config.profile.address),
        }),
      });
      const data = await res.json();
      if (data.error) {
        setErrorMsg(data.error);
        setTimeout(() => {
          setErrorMsg("");
        }, 3000);
        onChange("");
        setLoading(false);
        return;
      }
      console.log(">>> authenticate response", data);
      onChange(data.bearer);
      if (trustDevice) {
        console.log(">>> trusted device, saving bearer to localStorage", data.bearer);
        window.localStorage.setItem(`${communitySlug}-${accountAddress}-bearer`, data.bearer);
      }
      setLoading(false);
    } catch (e) {
      console.error(e);
      onChange("");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <form>
        <label className="form-control w-full max-w-sm">
          <h2 className="text-lg mb-2">🔐 Password protected profile</h2>
          <div className="label mt-8">
            <span className="label-text">Password</span>
          </div>
          <input type="hidden" name="account" value={accountAddress} />
          <input
            name="password"
            onChange={handlePasswordChange}
            type="password"
            placeholder=""
            className="input input-bordered w-full max-w-sm"
          />
          <div className="info">
            <div className="label-text-alt">
              Without the proper password, you won&apos;t be able to edit this profile
            </div>
          </div>
        </label>
        <div className="form-control my-4">
          <label className="inline-flex items-center cursor-pointer">
            <input type="checkbox" value="" className="sr-only peer" name="trustDevice" onChange={handleTrustDevice} />
            <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
            <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Trust this device</span>
          </label>
        </div>

        <button
          className={`btn btn-primary bg-white bg-opacity-20 active:bg-opacity-10 w-full max-w-xs h-12 mx-auto rounded-2xl color-[#F1F5E4] font-semibold border border-white border-opacity-20 flex justify-center items-center ${
            loading ? "btn-disabled" : ""
          }`}
          onClick={handleSubmit}
        >
          authenticate
        </button>
        {errorMsg && <div className="text-red-500 text-center">{errorMsg}</div>}
      </form>
    </div>
  );
}
