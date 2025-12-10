"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"trainer" | "client">("trainer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      if (!res.ok) {
        // Yahi line error text set karegi
        setError("Galat email / password / role");
        setLoading(false);
        return;
      }

      const data = await res.json();

      if (typeof window !== "undefined") {
        localStorage.setItem("role", data.role);
        localStorage.setItem("name", data.name);
      }

      if (data.role === "trainer") {
        router.push("/trainer/dashboard");
      } else {
        router.push("/client/dashboard");
      }
    } catch (err) {
      console.error(err);
      setError("Server error, thodi der baad try karo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f3f4f6",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "white",
          padding: "24px",
          borderRadius: "8px",
          width: "100%",
          maxWidth: "400px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ marginBottom: "16px", textAlign: "center" }}>Login</h2>

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", marginBottom: "12px", padding: "8px" }}
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%", marginBottom: "12px", padding: "8px" }}
        />

        <label>Role</label>
        <select
          value={role}
          onChange={(e) =>
            setRole(e.target.value as "trainer" | "client")
          }
          style={{ width: "100%", marginBottom: "16px", padding: "8px" }}
        >
          <option value="trainer">Trainer</option>
          <option value="client">Client</option>
        </select>

        {/* Error message yahan render hoga */}
        {error && (
          <p
            style={{
              color: "red",
              marginBottom: "8px",
              fontSize: "14px",
            }}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px",
            background: loading ? "#9ca3af" : "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p style={{ marginTop: "12px", fontSize: "12px", color: "#6b7280" }}>
          Trainer: trainer@pt.com / trainer123
          <br />
          Client: client@demo.com / client123
        </p>
      </form>
    </div>
  );
}
