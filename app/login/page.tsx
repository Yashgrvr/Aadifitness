"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("trainer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const demoAccounts = {
    trainer: {
      email: "trainer@aadi.com",
      password: "trainer123",
      label: "Trainer Account"
    },
    client: {
      email: "client@aadi.com",
      password: "client123",
      label: "Client Account"
    }
  };

  const handleDemoClick = (selectedRole: "trainer" | "client") => {
    setRole(selectedRole);
    setEmail(demoAccounts[selectedRole].email);
    setPassword(demoAccounts[selectedRole].password);
  };

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
      console.log("Login response:", data);

      if (!res.ok) {
        setError(data.error || "Invalid email or password");
        setLoading(false);
        return;
      }

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
        background: "linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1423 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "white",
        position: "relative",
        overflow: "hidden",
        padding: "16px",
      }}
    >
      {/* Animated gradient orbs */}
      <div
        style={{
          position: "absolute",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59,130,246,0.15), transparent 70%)",
          top: "-100px",
          right: "-100px",
          pointerEvents: "none",
          animation: "float 15s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.1), transparent 70%)",
          bottom: "-50px",
          left: "-100px",
          pointerEvents: "none",
          animation: "float 18s ease-in-out infinite reverse",
        }}
      />

      {/* Main container */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "480px",
          width: "100%",
        }}
      >
        {/* Card */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(30,40,60,0.7), rgba(20,30,50,0.7))",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(59,130,246,0.2)",
            borderRadius: 24,
            padding: 40,
            boxShadow: "0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: 32, textAlign: "center" }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
                margin: "0 auto 16px",
                boxShadow: "0 12px 40px rgba(59,130,246,0.3)",
              }}
            >
              💪
            </div>
            <h1 style={{ margin: "0 0 8px 0", fontSize: 28, fontWeight: 900 }}>
              Aadi Fitness
            </h1>
            <p style={{ margin: 0, fontSize: 14, color: "#a5b4fc" }}>
              Sign in to your account
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div
              style={{
                background: "rgba(239, 68, 68, 0.15)",
                border: "1px solid rgba(239, 68, 68, 0.4)",
                borderRadius: 12,
                padding: "12px 16px",
                marginBottom: 20,
                fontSize: 13,
                color: "#fca5a5",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: "grid", gap: "16px" }}>
            {/* Email */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 8,
                  color: "#e0e7ff",
                }}
              >
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
                  padding: "12px 16px",
                  background: "rgba(15,23,42,0.8)",
                  border: "1px solid rgba(59,130,246,0.3)",
                  borderRadius: 12,
                  color: "white",
                  fontSize: 14,
                  transition: "all 0.3s ease",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "rgba(59,130,246,0.8)";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(59,130,246,0.3)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 8,
                  color: "#e0e7ff",
                }}
              >
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
                  padding: "12px 16px",
                  background: "rgba(15,23,42,0.8)",
                  border: "1px solid rgba(59,130,246,0.3)",
                  borderRadius: 12,
                  color: "white",
                  fontSize: 14,
                  transition: "all 0.3s ease",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "rgba(59,130,246,0.8)";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(59,130,246,0.3)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Role Selection */}
            <div>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#e0e7ff",
                  margin: "0 0 12px 0",
                }}
              >
                Login as
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { key: "trainer", label: "🏋️ Trainer" },
                  { key: "client", label: "👤 Client" },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setRole(opt.key as "trainer" | "client")}
                    style={{
                      padding: "12px 16px",
                      borderRadius: 12,
                      border:
                        role === opt.key
                          ? "2px solid #3b82f6"
                          : "1px solid rgba(59,130,246,0.3)",
                      background:
                        role === opt.key
                          ? "rgba(59,130,246,0.2)"
                          : "rgba(59,130,246,0.05)",
                      color: role === opt.key ? "#60a5fa" : "#a5b4fc",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "14px 20px",
                borderRadius: 12,
                border: "none",
                background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                color: "white",
                fontSize: 15,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 8px 20px rgba(59,130,246,0.3)",
                opacity: loading ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.boxShadow =
                    "0 12px 30px rgba(59,130,246,0.5)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.boxShadow =
                    "0 8px 20px rgba(59,130,246,0.3)";
                  e.currentTarget.style.transform = "translateY(0)";
                }
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              margin: "24px 0",
              opacity: 0.5,
            }}
          >
            <div style={{ flex: 1, height: 1, background: "rgba(59,130,246,0.2)" }} />
            <span style={{ fontSize: 12 }}>Demo Credentials</span>
            <div style={{ flex: 1, height: 1, background: "rgba(59,130,246,0.2)" }} />
          </div>

          {/* Demo credential buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { role: "trainer" as const, emoji: "🏋️", title: "Trainer Demo" },
              { role: "client" as const, emoji: "👤", title: "Client Demo" },
            ].map((demo) => (
              <button
                key={demo.role}
                type="button"
                onClick={() => handleDemoClick(demo.role)}
                style={{
                  padding: "12px 16px",
                  borderRadius: 12,
                  border: "1px solid rgba(59,130,246,0.3)",
                  background: "rgba(59,130,246,0.08)",
                  color: "#a5b4fc",
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(59,130,246,0.15)";
                  e.currentTarget.style.borderColor = "rgba(59,130,246,0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(59,130,246,0.08)";
                  e.currentTarget.style.borderColor = "rgba(59,130,246,0.3)";
                }}
              >
                <span style={{ fontSize: 14, marginRight: 8 }}>{demo.emoji}</span>
                <span>{demo.title}</span>
              </button>
            ))}
          </div>

          {/* Info box */}
          <div
            style={{
              marginTop: 24,
              padding: 16,
              background: "rgba(59,130,246,0.08)",
              border: "1px solid rgba(59,130,246,0.2)",
              borderRadius: 12,
              fontSize: 12,
              color: "#cbd5e1",
              lineHeight: 1.6,
            }}
          >
            <p style={{ margin: "0 0 8px 0", fontWeight: 600, color: "#a5b4fc" }}>
              📌 Demo Accounts
            </p>
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              <li><strong>Trainer:</strong> trainer@aadi.com / trainer123</li>
              <li><strong>Client:</strong> client@aadi.com / client123</li>
              <li style={{ marginTop: 8 }}>Click "Demo" buttons to auto-fill</li>
            </ul>
          </div>

          {/* Back to home */}
          <button
            type="button"
            onClick={() => router.push("/")}
            style={{
              marginTop: 20,
              width: "100%",
              padding: "10px",
              borderRadius: 10,
              border: "none",
              background: "transparent",
              color: "#60a5fa",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#93c5fd";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#60a5fa";
            }}
          >
            ← Back to Home
          </button>
        </div>
      </div>

      {/* CSS */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-30px); }
        }

        input::placeholder {
          color: rgba(165, 180, 252, 0.5);
        }
      `}</style>
    </div>
  );
}