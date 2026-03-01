import { useState } from "react";
import { api } from "../services/api";

const HashingPage = () => {
  const [hash, setHash] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const verify = async () => {
    try {
      setError("");
      const res = await api.get(`/vehicles/verify/${hash}`);
      setResult(res.data);
    } catch (err: any) {
      setResult(null);
      setError(err?.response?.data?.message || "Verification failed");
    }
  };

  return (
    <section>
      <h1>Document Hashing & Blockchain Storage</h1>
      <p className="muted">Verify SHA-256 hash uniqueness and linked blockchain transaction details.</p>
      <div className="card">
        <h3>Verify Document Hash</h3>
        <input value={hash} onChange={(e) => setHash(e.target.value)} placeholder="Paste SHA-256 hash" />
        <button onClick={verify}>Verify Hash</button>
      </div>
      {error ? <p className="error-text">{error}</p> : null}
      {result?.document ? (
        <div className="card">
          <h3>Verification Result</h3>
          <p>Vehicle UID: {result.document.vehicle_uid}</p>
          <p>Registration: {result.document.registration_number}</p>
          <p>Document Type: {result.document.type}</p>
          <p>Hash: {result.document.file_hash}</p>
          <p>Blockchain TX: {result.document.blockchain_tx_id}</p>
          <p>Timestamp: {result.document.blockchain_timestamp}</p>
        </div>
      ) : null}
    </section>
  );
};

export default HashingPage;
