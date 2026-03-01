import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

type Props = {
  onDetected: (value: string) => void;
};

const Scanner = ({ onDetected }: Props) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;
    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decodedText) => {
          onDetected(decodedText);
        },
        () => undefined
      )
      .catch((err) => {
        setError(`Camera start failed: ${err}`);
      });

    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => undefined);
      }
    };
  }, [onDetected]);

  return (
    <div>
      <div id="qr-reader" className="scanner-box" />
      {error ? <p className="error-text">{error}</p> : null}
    </div>
  );
};

export default Scanner;
