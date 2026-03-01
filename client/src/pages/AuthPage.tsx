import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AuthPage = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "OWNER",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (isLogin) {
        await login(form.email, form.password);
        navigate("/dashboard");
      } else {
        await register({
          fullName: form.fullName,
          email: form.email,
          password: form.password,
          role: form.role as "ADMIN" | "OWNER" | "BUYER" | "TRAFFIC_POLICE",
        });
        setIsLogin(true);
      }
    } catch (err: any) {
      const apiError =
        err?.response?.data?.errors?.[0]?.msg ||
        err?.response?.data?.message ||
        "Operation failed";
      setError(apiError);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-logo">
          <img src="/c1.png" alt="BLOCK-C logo" />
          <h1>Blockchain Car Document Verification</h1>
        </div>
        <div className="auth-switch">
          <button className={isLogin ? "active" : ""} onClick={() => setIsLogin(true)}>
            Login
          </button>
          <button className={!isLogin ? "active" : ""} onClick={() => setIsLogin(false)}>
            Sign Up
          </button>
        </div>
        <form onSubmit={submit}>
          {!isLogin ? (
            <input
              placeholder="Full Name"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              required
            />
          ) : null}
          <input
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          {!isLogin ? (
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="OWNER">Owner</option>
              <option value="BUYER">Buyer</option>
              <option value="TRAFFIC_POLICE">Traffic Police</option>
              <option value="ADMIN">Admin</option>
            </select>
          ) : null}
          {error ? <p className="error-text">{error}</p> : null}
          <button type="submit">{isLogin ? "Enter Dashboard" : "Create Account"}</button>
        </form>
        {!isLogin ? (
          <p className="hint">Password must be at least 8 characters. After signup, switch to Login.</p>
        ) : null}
      </div>
    </div>
  );
};

export default AuthPage;
