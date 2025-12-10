"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("trainer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

 const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }),
    });

    const data = await res.json();
    console.log("Login response:", data); // Debug

    // ✅ FIX: Check res.ok instead of data.success
    if (!res.ok) {
      setError(data.error || "Invalid email or password");
      setLoading(false);
      return;
    }

    // ✅ Store in localStorage
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", role);
    localStorage.setItem("name", data.name || email.split("@")[0]);

    if (role === "trainer") {
      localStorage.setItem("trainerId", data.id || data.trainerId);
      window.location.href = "/trainer/dashboard";
    } else {
      localStorage.setItem("clientId", data.id || data.clientId);
      window.location.href = "/client/dashboard";
    }
  } catch (err) {
    console.error("Login error:", err);
    setError("Login failed. Please try again.");
  } finally {
    setLoading(false);
  }
};


  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020617",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "white",
      }}
    >
      <div
        style={{
          background: "#0b1120",
          padding: "32px",
          borderRadius: "12px",
          border: "1px solid #1f2937",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        <h1 style={{ fontSize: "24px", fontWeight: 600, marginBottom: "8px" }}>
          Login
        </h1>
        <p style={{ color: "#9ca3af", marginBottom: "24px", fontSize: "14px" }}>
          Sign in to your account
        </p>

        <form onSubmit={handleLogin} style={{ display: "grid", gap: "16px" }}>
          {/* Email */}
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "8px" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "6px",
                border: "1px solid #1f2937",
                background: "#1f2937",
                color: "white",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Password */}
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "8px" }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "6px",
                border: "1px solid #1f2937",
                background: "#1f2937",
                color: "white",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Role Selection */}
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "8px" }}>
              Login as
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <button
                type="button"
                onClick={() => setRole("trainer")}
                style={{
                  padding: "10px",
                  borderRadius: "6px",
                  border: role === "trainer" ? "2px solid #3b82f6" : "1px solid #1f2937",
                  background: role === "trainer" ? "#1f2937" : "transparent",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 600,
                  transition: "all 0.2s",
                }}
              >
                🏋️ Trainer
              </button>
              <button
                type="button"
                onClick={() => setRole("client")}
                style={{
                  padding: "10px",
                  borderRadius: "6px",
                  border: role === "client" ? "2px solid #3b82f6" : "1px solid #1f2937",
                  background: role === "client" ? "#1f2937" : "transparent",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 600,
                  transition: "all 0.2s",
                }}
              >
                👤 Client
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p style={{ color: "#ef4444", fontSize: "14px", textAlign: "center" }}>
              {error}
            </p>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "12px",
              borderRadius: "6px",
              background: "#3b82f6",
              color: "white",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "14px",
              fontWeight: 600,
              opacity: loading ? 0.7 : 1,
              transition: "all 0.2s",
            }}
          >
            {loading ? "Logging in..." : "Sign In"}
          </button>

          {/* Demo Credentials */}
          <div
            style={{
              background: "#1f2937",
              padding: "12px",
              borderRadius: "6px",
              fontSize: "12px",
              color: "#9ca3af",
            }}
          >
            <p style={{ fontWeight: 600, marginBottom: "4px" }}>Demo Credentials:</p>
            <p>📧 trainer@demo.com / trainer555</p>
            <p>👤 client1@demo.com / client123</p>

          </div>
        </form>
      </div>
    </div>
  );
}
