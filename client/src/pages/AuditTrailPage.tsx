import { useEffect, useState } from "react";
import { api } from "../services/api";

const AuditTrailPage = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.get("/audit"), api.get("/blockchain/status")])
      .then(([auditRes, statusRes]) => {
        setLogs(auditRes.data.logs);
        setStatus(statusRes.data.blockchainMode);
      })
      .catch((err) => setError(err?.response?.data?.message || "Unable to load audit data"));
  }, []);

  return (
    <section>
      <h1>Smart Contract & Audit Trail</h1>
      <p className="muted">
        Smart contract mode: <strong>{status || "Unknown"}</strong>
      </p>
      {error ? <p className="error-text">{error}</p> : null}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Action</th>
              <th>Entity</th>
              <th>Actor</th>
              <th>TX</th>
              <th>Current Hash</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{log.action}</td>
                <td>{log.entity_type}</td>
                <td>{log.actor_name || "-"}</td>
                <td>{log.tx_id || "-"}</td>
                <td className="hash-col">{log.current_hash}</td>
                <td>{new Date(log.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default AuditTrailPage;
