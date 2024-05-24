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
  const [trustDevice, setTrustDevice] = useState<boolean>(true);
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
        <div className="label">
          <span className="label-text-alt">
            Without the proper password, you won&apos;t be able to edit this profile
          </span>
        </div>
      </label>
      <div className="form-control">
        <label className="label cursor-pointer">
          <span className="label-text">Trust this device</span>
          <input
            type="checkbox"
            defaultChecked
            className="toggle toggle-md"
            name="trustDevice"
            onChange={handleTrustDevice}
          />
        </label>
      </div>

      <button
        className={`btn btn-primary w-full max-w-sm my-8 ${loading ? "btn-disabled" : ""}`}
        onClick={handleSubmit}
      >
        authenticate
      </button>
      {errorMsg && <div className="text-red-500 text-center">{errorMsg}</div>}
    </form>
  );
}
