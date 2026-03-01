import { useEffect, useState } from "react";
import { api } from "../services/api";

type User = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
};

const UserManagementPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/auth/users")
      .then((res) => setUsers(res.data.users))
      .catch((err) => setError(err?.response?.data?.message || "Unable to load users"));
  }, []);

  return (
    <section>
      <h1>User Management</h1>
      <p className="muted">Includes secure signup/login, role-based control, session handling, and recovery APIs.</p>
      {error ? <p className="error-text">{error}</p> : null}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.full_name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{new Date(u.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default UserManagementPage;
