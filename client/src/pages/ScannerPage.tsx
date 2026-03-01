import { useState } from "react";
import Scanner from "../components/Scanner";
import { api } from "../services/api";

const ScannerPage = () => {
  const [scanValue, setScanValue] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const verifyValue = async (value: string) => {
    if (!value) return;
    setScanValue(value);
    try {
      const hash = value.includes("|") ? value.split("|").pop() || value : value;
      const res = await api.get(`/vehicles/verify/${hash}`);
      setResult(res.data.document);
      setError("");
    } catch (err: any) {
      setResult(null);
      setError(err?.response?.data?.message || "Scanned hash verification failed");
    }
  };

  return (
    <section>
      <h1>Camera Scanner</h1>
      <p className="muted">Scan a QR code containing document hash to validate instantly.</p>
      <div className="grid">
        <div className="card">
          <Scanner onDetected={verifyValue} />
          <p>Scanned: {scanValue || "-"}</p>
        </div>
        <div className="card">
          <h3>Manual Verify</h3>
          <div className="inline-verify">
            <input
              className="small-input"
              value={scanValue}
              onChange={(e) => setScanValue(e.target.value)}
              placeholder="Enter hash or payload"
            />
            <button className="small-btn" onClick={() => verifyValue(scanValue)}>
              Verify
            </button>
          </div>
          {error ? <p className="error-text">{error}</p> : null}
          {result ? (
            <div>
              <p>Verified Vehicle UID: {result.vehicle_uid}</p>
              <p>Registration: {result.registration_number}</p>
              <p>Document Type: {result.type}</p>
              <p>TX: {result.blockchain_tx_id}</p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default ScannerPage;
