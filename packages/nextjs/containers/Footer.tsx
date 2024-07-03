import CitizenWalletText from "../public/citizenwallet-logo-text.svg";

export function Footer() {
  return (
    <div>
      <footer className="">
        <div className="text-center p-4 mt-8 flex justify-center items-center">
          <a href="https://citizenwallet.xyz">
            <div className="text-xs text-[#2FA087]">Powered by</div>
            <div className="flex justify-center items-center">
              <CitizenWalletText className="w-32 h-6 mr-2 text-white" />
            </div>
          </a>
        </div>
      </footer>
      <div className="text-center text-xs dark:text-gray-100 p-4">
        <a href="https://github.com/citizenwallet/nfcwallet/issues/new">report an issue</a>
      </div>
    </div>
  );
}
