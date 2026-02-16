"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"trainer" | "client">("trainer");
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
          maxWidth: "420px",
          width: "100%",
        }}
      >
        {/* Card */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(30,40,60,0.9), rgba(20,30,50,0.9))",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(59,130,246,0.3)",
            borderRadius: 24,
            padding: "40px 32px",
            boxShadow: "0 25px 70px rgba(0,0,0,0.5)",
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: 32, textAlign: "center" }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
                margin: "0 auto 20px",
                boxShadow: "0 16px 40px rgba(59,130,246,0.4)",
              }}
            >
              💪
            </div>
            <h1 style={{ margin: "0 0 8px 0", fontSize: 32, fontWeight: 900, background: "linear-gradient(135deg, #60a5fa, #3b82f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              FitVibs
            </h1>
            <p style={{ margin: 0, fontSize: 16, color: "#a5b4fc" }}>
              Sign in to continue
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
                fontSize: 14,
                color: "#fca5a5",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: "grid", gap: "20px" }}>
            {/* Email */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 14,
                  fontWeight: 600,
                  marginBottom: 8,
                  color: "#e0e7ff",
                }}
              >
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                style={{
                  width: "100%",
                  padding: "14px 18px",
                  background: "rgba(15,23,42,0.8)",
                  border: "1px solid rgba(59,130,246,0.3)",
                  borderRadius: 14,
                  color: "white",
                  fontSize: 15,
                  transition: "all 0.3s ease",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "rgba(59,130,246,0.8)";
                  e.currentTarget.style.boxShadow = "0 0 0 4px rgba(59,130,246,0.1)";
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
                  fontSize: 14,
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
                  padding: "14px 18px",
                  background: "rgba(15,23,42,0.8)",
                  border: "1px solid rgba(59,130,246,0.3)",
                  borderRadius: 14,
                  color: "white",
                  fontSize: 15,
                  transition: "all 0.3s ease",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "rgba(59,130,246,0.8)";
                  e.currentTarget.style.boxShadow = "0 0 0 4px rgba(59,130,246,0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(59,130,246,0.3)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Role Selection */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 14,
                  fontWeight: 600,
                  marginBottom: 12,
                  color: "#e0e7ff",
                }}
              >
                Login As
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { key: "trainer" as const, label: "🏋️ Trainer", icon: "💪" },
                  { key: "client" as const, label: "👤 Client", icon: "👥" },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setRole(opt.key)}
                    style={{
                      padding: "14px 18px",
                      borderRadius: 14,
                      border: role === opt.key ? "2px solid #3b82f6" : "1px solid rgba(59,130,246,0.3)",
                      background: role === opt.key ? "rgba(59,130,246,0.2)" : "rgba(15,23,42,0.8)",
                      color: role === opt.key ? "#60a5fa" : "#a5b4fc",
                      fontSize: 15,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{opt.icon}</span>
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
                padding: "16px 24px",
                borderRadius: 14,
                border: "none",
                background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                color: "white",
                fontSize: 16,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 10px 25px rgba(59,130,246,0.4)",
                opacity: loading ? 0.8 : 1,
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.boxShadow = "0 15px 35px rgba(59,130,246,0.5)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.boxShadow = "0 10px 25px rgba(59,130,246,0.4)";
                  e.currentTarget.style.transform = "translateY(0)";
                }
              }}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {/* Back to home */}
          <button
            type="button"
            onClick={() => router.push("/")}
            style={{
              marginTop: 24,
              width: "100%",
              padding: "12px",
              borderRadius: 12,
              border: "1px solid rgba(59,130,246,0.3)",
              background: "transparent",
              color: "#60a5fa",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#93c5fd";
              e.currentTarget.style.background = "rgba(59,130,246,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#60a5fa";
              e.currentTarget.style.background = "transparent";
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
