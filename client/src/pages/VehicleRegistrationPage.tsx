import { useEffect, useState } from "react";
import { api } from "../services/api";

type Vehicle = {
  id: string;
  vehicle_uid: string;
  vehicle_name: string;
  registration_number: string;
  engine_number: string;
  chassis_number: string;
  owner_id: string | null;
  owner_name: string | null;
  documents: { id: string; type: string; file_hash: string }[];
};

const VehicleRegistrationPage = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    vehicleName: "",
    registrationNumber: "",
    engineNumber: "",
    chassisNumber: "",
    ownerId: "",
  });
  const [upload, setUpload] = useState({
    vehicleId: "",
    type: "Registration Certificate",
    file: null as File | null,
  });
  const [transfer, setTransfer] = useState({
    vehicleId: "",
    toUserId: "",
  });

  const load = async () => {
    const res = await api.get("/vehicles");
    setVehicles(res.data.vehicles);
  };

  useEffect(() => {
    load().catch(() => setMessage("Unable to load vehicles"));
  }, []);

  const registerVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post("/vehicles", form);
      setMessage(`${res.data.message} | TX: ${res.data.blockchain.txId}`);
      setForm({
        vehicleName: "",
        registrationNumber: "",
        engineNumber: "",
        chassisNumber: "",
        ownerId: "",
      });
      await load();
    } catch (err: any) {
      const msg = err?.response?.data?.errors?.[0]?.msg || err?.response?.data?.message || "Vehicle registration failed";
      setMessage(msg);
    }
  };

  const uploadDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!upload.file) return;
    try {
      const body = new FormData();
      body.append("type", upload.type);
      body.append("document", upload.file);
      const res = await api.post(`/vehicles/${upload.vehicleId}/documents`, body);
      setMessage(`${res.data.message} | Hash: ${res.data.document.fileHash}`);
      setUpload({ ...upload, file: null });
      await load();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Document upload failed";
      setMessage(msg);
    }
  };

  const transferOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post(`/vehicles/${transfer.vehicleId}/transfer`, {
        toUserId: transfer.toUserId,
      });
      setMessage(`${res.data.message} | TX: ${res.data.blockchain.txId}`);
      setTransfer({ vehicleId: "", toUserId: "" });
      await load();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Ownership transfer failed";
      setMessage(msg);
    }
  };

  return (
    <section>
      <h1>Vehicle Registration</h1>
      <p className="muted">Register vehicles, upload validated documents, assign unique IDs, and store metadata.</p>
      {message ? <p className="success-text">{message}</p> : null}

      <div className="grid form-grid">
        <form className="card" onSubmit={registerVehicle}>
          <h3>Register Vehicle</h3>
          <input placeholder="Vehicle Name (e.g., Honda Civic)" value={form.vehicleName} onChange={(e) => setForm({ ...form, vehicleName: e.target.value })} required />
          <input placeholder="Registration Number" value={form.registrationNumber} onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })} required />
          <input placeholder="Engine Number" value={form.engineNumber} onChange={(e) => setForm({ ...form, engineNumber: e.target.value })} required />
          <input placeholder="Chassis Number" value={form.chassisNumber} onChange={(e) => setForm({ ...form, chassisNumber: e.target.value })} required />
          <input placeholder="Owner User ID (optional)" value={form.ownerId} onChange={(e) => setForm({ ...form, ownerId: e.target.value })} />
          <button type="submit">Register</button>
        </form>

        <form className="card" onSubmit={uploadDoc}>
          <h3>Upload Vehicle Document</h3>
          <select value={upload.vehicleId} onChange={(e) => setUpload({ ...upload, vehicleId: e.target.value })} required>
            <option value="">Select Vehicle</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>{`${v.vehicle_name || "Vehicle"} - ${v.registration_number}`}</option>
            ))}
          </select>
          <input placeholder="Document Type" value={upload.type} onChange={(e) => setUpload({ ...upload, type: e.target.value })} required />
          <input type="file" onChange={(e) => setUpload({ ...upload, file: e.target.files?.[0] || null })} required />
          <button type="submit">Upload + Hash</button>
        </form>

        <form className="card" onSubmit={transferOwner}>
          <h3>Ownership Transfer</h3>
          <select value={transfer.vehicleId} onChange={(e) => setTransfer({ ...transfer, vehicleId: e.target.value })} required>
            <option value="">Select Vehicle</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>{`${v.vehicle_name || "Vehicle"} - ${v.registration_number}`}</option>
            ))}
          </select>
          <input placeholder="Target User ID" value={transfer.toUserId} onChange={(e) => setTransfer({ ...transfer, toUserId: e.target.value })} required />
          <button type="submit">Transfer Ownership</button>
        </form>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>UID</th>
              <th>Name</th>
              <th>Registration</th>
              <th>Engine</th>
              <th>Chassis</th>
              <th>Owner</th>
              <th>Docs</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v.id}>
                <td>{v.vehicle_uid}</td>
                <td>{v.vehicle_name || "-"}</td>
                <td>{v.registration_number}</td>
                <td>{v.engine_number}</td>
                <td>{v.chassis_number}</td>
                <td>{v.owner_name || "-"}</td>
                <td>{v.documents.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default VehicleRegistrationPage;
