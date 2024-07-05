"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";

const Scan = ({
  onChange,
  ignoreRead,
  isWriting,
}: {
  isWriting: boolean;
  onChange: (event: NDEFReadingEvent) => any;
  ignoreRead?: boolean;
}) => {
  const [nfcAvailable, setNfcAvailable] = useState(undefined);
  const [errorMsg, setErrorMsg] = useState("");
  const [scanning, setScanning] = useState(false);

  const startScanner = async () => {
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
      console.log(`Error! Scan failed to start: ${error}.`);
      setErrorMsg(`Scanner failed to start: ${error}.`);
    }
  };

  const scan = useCallback(async () => {
    try {
      new NDEFReader();
      setNfcAvailable(true);
      startScanner();
    } catch (error) {
      console.log(`Error! Scan failed to start: ${error}.`);
      // setErrorMsg(`setNfcAvailable error: ${error}.`);
      setNfcAvailable(true); // toggle
      setScanning(true); // remove
    }
  }, []);

  useEffect(() => {
    scan();
  }, [scan]);

  return (
    <center>
      {nfcAvailable && (
        <div className="flex flex-col justify-center">
          <div className="mt-16 mb-8">
            <Image
              src="/heart-nfc.png"
              width={254}
              height={140}
              alt="heart NFC"
              className={`${isWriting ? "heartBeating" : ""}`}
            />
          </div>
          <div className="pb-4 font-bold text-4xl whitespace-nowrap text-center">
            {isWriting ? "Hold your wristband" : scanning ? "Tap your wristband" : "Start scanning"}
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
