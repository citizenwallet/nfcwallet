"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Theme } from "@/lib/colors";
import ScannerLogo from "@/public/nfc-scanner.svg";

const Scan = ({
  onChange,
  state,
  theme,
  ignoreRead,
  isWriting,
}: {
  isWriting: boolean;
  state: string;
  theme: Theme;
  onChange: (event: NDEFReadingEvent) => any;
  ignoreRead?: boolean;
}) => {
  const [nfcAvailable, setNfcAvailable] = useState<boolean | undefined>(undefined);
  const [errorMsg, setErrorMsg] = useState("");
  const [scanning, setScanning] = useState(state === "scanning");

  const startScanner = useCallback(async () => {
    try {
      const ndef = new NDEFReader();
      console.log("Starting scanner...", ndef.scan);
      await ndef.scan();

      console.log("Scan started successfully.");
      ndef.onreadingerror = () => {
        console.log("Cannot read data from the NFC tag. Try another one?");
      };

      ndef.onreading = event => {
        if (ignoreRead) return;
        console.log("NDEF message read.");
        onChange(event);
      };

      setScanning(true);
    } catch (error) {
      setScanning(false); // toggle
      console.log(`Error! Scan failed to start: ${error}.`);
      setErrorMsg(`Scanner failed to start: ${error}.`);
    }
  }, [ignoreRead, onChange]);

  const setScannerAvailability = useCallback(async () => {
    try {
      new NDEFReader();
      setNfcAvailable(true);
    } catch (error) {
      console.log(`Error! Scan failed to start: ${error}.`);
      // setErrorMsg(`setNfcAvailable error: ${error}.`);
      setNfcAvailable(true); // toggle
    }
  }, []);

  useEffect(() => {
    setScannerAvailability();
  }, [setScannerAvailability]);

  return (
    <center>
      {nfcAvailable && (
        <div className="flex flex-col justify-center" onClick={startScanner}>
          <div className="">
            <ScannerLogo
              src={theme.nfc?.scannerLogo || "/nfc-scanner.svg"}
              width={75}
              height={50}
              alt="NFC scanner"
              className={`${isWriting || !scanning ? "" : "heartBeatingg"}`}
            />
          </div>
          <div className=" text-sm whitespace-nowrap text-center">
            {isWriting
              ? `Hold your ${theme.nfc?.deviceName}`
              : scanning
              ? `Tap your ${theme.nfc?.deviceName}`
              : "Start scanner"}
          </div>
        </div>
      )}
      {nfcAvailable === undefined && (
        <center>
          <button className="btn disabled btn-primary w-64 rounded-md">Waiting for NFC reader...</button>
          <div className="text-red-800">{errorMsg}</div>
        </center>
      )}
      {nfcAvailable === false && (
        <center>
          <button className="btn disabled btn-primary w-64 rounded-md">NFC not available on this device</button>
          <div className="text-sm my-2">
            Requires Chrome on Android (
            <a href="https://developer.mozilla.org/en-US/docs/Web/API/Web_NFC_API#browser_compatibility">more info</a>)
          </div>
          <div className="text-red-800">{errorMsg}</div>
        </center>
      )}
    </center>
  );
};

export default Scan;
