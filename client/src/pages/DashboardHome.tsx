import { Link } from "react-router-dom";

const modules = [
  { name: "User Management", desc: "Registration, authentication, RBAC, session control", to: "/dashboard/users" },
  { name: "Vehicle Registration", desc: "Vehicle details, document upload, metadata", to: "/dashboard/vehicles" },
  { name: "Hashing & Blockchain Storage", desc: "SHA-256 hash, uniqueness, blockchain TX records", to: "/dashboard/hash" },
  { name: "Smart Contract & Audit Trail", desc: "Smart contract history and immutable activity logs", to: "/dashboard/audit" },
];

const DashboardHome = () => {
  return (
    <section>
      <h1>Dashboard</h1>
      <p className="muted">All four modules are integrated and available below.</p>
      <div className="grid">
        {modules.map((module) => (
          <Link key={module.name} to={module.to} className="card">
            <h3>{module.name}</h3>
            <p>{module.desc}</p>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default DashboardHome;
