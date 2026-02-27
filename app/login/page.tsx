"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

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
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* Background Ambience - Emerald Blobs matching Onboarding */}
      <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-emerald-900/15 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-md relative z-10"
      >
        {/* Elite Branding Badge */}
        <div className="flex justify-center mb-10">
          <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full flex items-center gap-2 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Elite Performance Portal</span>
          </div>
        </div>

        {/* Glassmorphism Card */}
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 shadow-[0_32px_128px_rgba(0,0,0,0.5)] rounded-[2.5rem] p-10 relative overflow-hidden">
          
          <div className="text-center mb-10">
            <h1 className="text-5xl font-black italic tracking-tighter bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              FitVibs
            </h1>
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-2">Welcome Back</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* Role Selection Tabs */}
            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
              <button
                type="button"
                onClick={() => setRole("trainer")}
                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  role === "trainer" ? "bg-emerald-500 text-black shadow-lg" : "text-white/40 hover:text-white"
                }`}
              >
                Trainer
              </button>
              <button
                type="button"
                onClick={() => setRole("client")}
                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  role === "client" ? "bg-emerald-500 text-black shadow-lg" : "text-white/40 hover:text-white"
                }`}
              >
                Client
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  required
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all outline-none placeholder:text-white/10"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all outline-none placeholder:text-white/10"
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: "auto" }} 
                  className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl"
                >
                  <p className="text-red-400 text-xs font-bold flex items-center gap-2">
                    <span className="text-base">⚠️</span> {error}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full py-5 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-2xl overflow-hidden transition-all active:scale-[0.98] shadow-[0_20px_40px_rgba(16,185,129,0.2)]"
            >
              <span className="relative z-10 uppercase tracking-widest">
                {loading ? "Authenticating..." : "Sign In →"}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
            </button>
          </form>

          {/* Secondary Actions */}
          <div className="mt-8 pt-8 border-t border-white/5 flex flex-col gap-4 items-center">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="text-white/30 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors"
            >
              ← Back to Home
            </button>
            <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest">
              Need access?{" "}
              <button 
                onClick={() => router.push("/client/onboarding")}
                className="text-emerald-500 hover:underline"
              >
                Join the journey
              </button>
            </p>
          </div>
        </div>

        {/* Global Security Footer */}
        <div className="mt-12 flex justify-center items-center gap-6 text-[9px] font-black uppercase tracking-[0.2em] text-white/20">
            <div className="flex items-center gap-2">
              <span className="w-1 h-1 bg-emerald-500 rounded-full" />
              Secure Encrypted Session
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1 h-1 bg-emerald-500 rounded-full" />
              Elite Support 24/7
            </div>
        </div>
      </motion.div>

      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}