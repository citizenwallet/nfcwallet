import LeftArrowIcon from "@/public/leftarrow.svg";
import QRCode from "react-qr-code";
import { hexToRgba } from "~~/lib/colors";

export default function EditProfileQRModal({
  editProfileUrl,
  theme,
  onClose,
}: {
  editProfileUrl: string;
  theme: any;
  onClose: () => void;
}) {
  return (
    <div
      className="absolute top-0 left-0 w-full h-full bg-[#F8F7F3] flex justify-center items-center flex-col px-16 pt-16"
      style={{ backgroundColor: theme.secondary }}
    >
      <h1 className="font-bold text-4xl text-center">Scan QR to edit your profile</h1>
      <div className="w-fit mx-auto my-4 flex justify-center items-center bg-white p-4 rounded-2xl" onClick={onClose}>
        <QRCode value={editProfileUrl} size={256} style={{ height: "auto", maxWidth: "300px", width: "100%" }} />
      </div>
      <button
        style={{ backgroundColor: hexToRgba(theme.primary, 0.1) }}
        className="active:opacity-70 border-2 h-32 w-full rounded-2xl text-center font-bold text-4xl my-16"
        onClick={onClose}
      >
        <div className="flex flex-row gap-6 justify-center">
          <LeftArrowIcon />
          <span>Go back</span>
        </div>
      </button>
    </div>
  );
}
