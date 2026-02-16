"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowRight, 
  Activity, 
  Dumbbell, 
  Apple, 
  TrendingUp, 
  MapPin, 
  User,
  ChevronRight
} from "lucide-react";

// Updated to 3 transformations as requested
const images = ["/t1.jpg", "/t2.jpg", "/t3.jpg"];

export default function HomePage() {
  const router = useRouter();
  const [active, setActive] = useState(0);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Auto-slide logic
  useEffect(() => {
    const i = setInterval(() => {
      setActive(p => (p + 1) % images.length);
    }, 4000);
    return () => clearInterval(i);
  }, []);

  // Smooth scroll handler
  const scrollToResults = () => {
    resultsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 font-[var(--font-geist-sans)]">
      
      {/* AMBIENT BACKGROUND GLOW */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[700px] h-[700px] bg-emerald-100/30 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -right-20 w-[600px] h-[600px] bg-slate-100 rounded-full blur-[100px]" />
      </div>

      {/* NAVIGATION */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200 transition-transform group-hover:rotate-12">
              <Dumbbell size={20} />
            </div>
            <span className="text-2xl font-black tracking-tighter italic">FitVibs</span>
          </div>

          <button
            onClick={() => router.push("/login")}
            className="group flex items-center gap-2 bg-slate-900 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-full font-bold transition-all duration-300 shadow-xl"
          >
            Sign In
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-24 text-center px-6 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[1.05] text-slate-900">
            Build your <br />
            <span className="text-emerald-500 italic">best self</span>
            <br /> with FitVibs
          </h1>

          <p className="mt-10 text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Elite coaching. Smart tracking. Real body transformations.
          </p>

          <div className="mt-12 flex justify-center gap-4 flex-wrap">
            <button
              onClick={() => router.push("/client/onboarding")}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-4 rounded-2xl shadow-2xl shadow-emerald-200 font-bold transition-all hover:-translate-y-1"
            >
              Begin Your Journey
            </button>
            <button 
              onClick={scrollToResults}
              className="bg-white border-2 border-emerald-500 text-emerald-600 px-10 py-4 rounded-2xl font-bold hover:bg-emerald-50 transition-all"
            >
              View Results
            </button>
          </div>
        </motion.div>
      </section>

      {/* FEATURE GRID */}
      <section className="py-24 px-6 bg-white relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-4 gap-8"
          >
            {[
              { title: "Live Progress Tracking", icon: <Activity /> },
              { title: "Personalized Training", icon: <Dumbbell /> },
              { title: "Nutrition Planning", icon: <Apple /> },
              { title: "Transformation Analytics", icon: <TrendingUp /> },
            ].map((f, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="group p-10 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-all duration-500"
              >
                <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 leading-tight">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Premium tools designed for elite results.
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* PROCESS SECTION */}
      <section className="bg-slate-50/80 py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4">
            {["Consult", "Custom Plan", "Track Daily", "Transform"].map((s, i) => (
              <div key={i} className="flex flex-col md:flex-row items-center flex-1 w-full">
                <div className="flex flex-col items-center flex-1">
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-xl mb-4 relative z-10"
                  >
                    {i + 1}
                  </motion.div>
                  <h4 className="font-bold text-lg text-slate-800 tracking-tight uppercase text-center">{s}</h4>
                </div>

                {i < 3 && (
                  <div className="hidden md:flex items-center justify-center flex-1 text-emerald-300">
                    <motion.div animate={{ x: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                      <ChevronRight size={48} strokeWidth={3} />
                    </motion.div>
                  </div>
                )}
                
                {i < 3 && (
                  <div className="flex md:hidden items-center justify-center py-4 text-emerald-300">
                    <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                      <ChevronRight size={32} className="rotate-90" />
                    </motion.div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRANSFORMATION SLIDER (Linked to View Results) */}
      <section ref={resultsRef} className="py-32 bg-white overflow-hidden scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 text-center mb-16">
          <h2 className="text-4xl font-black tracking-tight text-slate-900 mb-4">Visual Success Stories</h2>
          <p className="text-slate-500">Evidence of discipline and consistency.</p>
        </div>

        <div className="max-w-4xl mx-auto px-6">
          <div className="relative group">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.6 }}
                className="relative flex items-center justify-center min-h-[500px] md:min-h-[600px]"
              >
                {/* BLUR EFFECT */}
                <div className="absolute inset-0 flex items-center justify-center">
                   <motion.img
                    src={images[active]}
                    className="w-full h-full max-w-[500px] object-cover blur-[80px] opacity-40 scale-125 transition-all duration-1000"
                    alt="glow"
                  />
                </div>

                {/* MAIN IMAGE */}
                <div className="relative z-10 bg-white p-2 rounded-[2rem] shadow-2xl border border-white/50">
                  <img
                    src={images[active]}
                    className="rounded-[1.8rem] max-h-[600px] w-auto object-contain transition-transform duration-700 group-hover:scale-[1.01]"
                    alt="Transformation"
                  />
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md text-white px-6 py-2 rounded-full text-[10px] font-bold tracking-widest uppercase border border-white/10 shadow-xl whitespace-nowrap">
                    FitVibs Transformation
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-center mt-12 gap-3">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`h-1.5 transition-all duration-500 rounded-full ${
                    i === active ? "w-12 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" : "w-3 bg-slate-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-300 py-24 px-6 relative">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-16 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-black italic">V</div>
              <h3 className="text-white font-black text-2xl italic tracking-tighter">FitVibs</h3>
            </div>
            <p className="text-slate-400">High-Performance Wellness Platform</p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 flex items-center gap-2 uppercase tracking-widest text-xs opacity-60">
              <User size={14} className="text-emerald-500" /> Lead Trainer
            </h4>
            <p className="text-white font-bold text-lg">Aditya Singh</p>
            <p className="text-emerald-500 text-sm mt-1">99993 74474</p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 flex items-center gap-2 uppercase tracking-widest text-xs opacity-60">
            
            </h4>
            <p className="text-white font-bold"> Sector 8 Rohini Delhi, India</p>
            <p className="text-slate-400 text-sm mt-1">ViBrations Fitness</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [isHovering, setIsHovering] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: "📊",
      title: "Live Dashboard",
      desc: "Real-time progress tracking with weight, workouts, and diet status.",
    },
    {
      icon: "🏋️",
      title: "Custom Workouts",
      desc: "Personalized exercises with sets, reps, and progressive overload.",
    },
    {
      icon: "🍎",
      title: "Meal Planning",
      desc: "Daily nutrition tracking with calorie and macro monitoring.",
    },
    {
      icon: "📈",
      title: "Progress Charts",
      desc: "Visual weekly completion rates and achievement milestones.",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1423 100%)",
        color: "white",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated gradient orbs */}
      <div
        style={{
          position: "absolute",
          width: "700px",
          height: "700px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59,130,246,0.12), transparent 70%)",
          top: "-150px",
          left: "-100px",
          pointerEvents: "none",
          animation: "float 15s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.08), transparent 70%)",
          bottom: "-100px",
          right: "-50px",
          pointerEvents: "none",
          animation: "float 18s ease-in-out infinite reverse",
        }}
      />

      {/* Navigation */}
      <nav
        style={{
          width: "100%",
          padding: "24px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "relative",
          zIndex: 2,
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(59,130,246,0.08)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img
    src="/logo.png"  // tumhara naya logo [file:353]
    alt="FitVibs"
    style={{
      width: 90,
      height: 70,
      borderRadius: "50%",
      objectFit: "cover"
    }}
  />
  
  <div>
    <h1 style={{ margin: 0, fontSize: 30, fontWeight: 950, letterSpacing: -0.8 }}>
      FitVibs
    </h1>
    <p style={{
      margin: 0,
      fontSize: 15,
      color: "#3b82f6",
      letterSpacing: 2,
      textTransform: "uppercase",
      fontWeight: 600,
    }}>
      Training Platform
    </p>
  </div>
</div>

        <button
          onClick={() => router.push("/login")}
          style={{
            padding: "10px 24px",
            borderRadius: "999px",
            border: "1px solid rgba(59,130,246,0.5)",
            background: "rgba(59,130,246,0.1)",
            color: "#3b82f6",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.3s ease",
            backdropFilter: "blur(10px)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(59,130,246,0.2)";
            e.currentTarget.style.borderColor = "rgba(59,130,246,0.8)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(59,130,246,0.1)";
            e.currentTarget.style.borderColor = "rgba(59,130,246,0.5)";
          }}
        >
          Sign in
        </button>
      </nav>

      {/* Hero section */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 16px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Tagline */}
        <p
          style={{
            fontSize: 12,
            color: "#3b82f6",
            fontWeight: 700,
            letterSpacing: 3,
            textTransform: "uppercase",
            marginBottom: 24,
            opacity: 0.9,
          }}
        >
          Train Smart. Track Everything.
        </p>

        {/* Main headline */}
        <h1
          style={{
            fontSize: 60,
            fontWeight: 950,
            margin: "0 0 20px 0",
            lineHeight: 1.05,
            maxWidth: 900,
            color: "#f8fafc",
            textShadow: "0 20px 40px rgba(59,130,246,0.15)",
          }}
        >
          Transform with{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            FitVibs.
          </span>
          <br />
          Your personal training platform.
        </h1>

        {/* Subheading */}
        <p
          style={{
            fontSize: 17,
            color: "#cbd5e1",
            margin: "0 0 28px 0",
            maxWidth: 600,
            lineHeight: 1.7,
            fontWeight: 400,
          }}
        >
          Connect with expert trainers. Customize your workouts. Track your nutrition. Achieve your goals—all in one place.
        </p>

        {/* CTA Buttons */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 48,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <button
            onClick={() => router.push("/client/onboarding")}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            style={{
              padding: "16px 36px",
              borderRadius: "999px",
              border: "none",
              background: isHovering
                ? "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)"
                : "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
              color: "white",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: isHovering
                ? "0 20px 60px rgba(59,130,246,0.5)"
                : "0 12px 30px rgba(59,130,246,0.3)",
              transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
              transform: isHovering ? "translateY(-2px)" : "translateY(0)",
              letterSpacing: 0.3,
            }}
          >
            Begin Your Journey
          </button>

          <button
            onClick={() => router.push("/login")}
            style={{
              padding: "16px 36px",
              borderRadius: "999px",
              border: "1.5px solid rgba(59,130,246,0.4)",
              background: "rgba(59,130,246,0.05)",
              color: "#60a5fa",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.3s ease",
              letterSpacing: 0.3,
              backdropFilter: "blur(10px)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(59,130,246,0.15)";
              e.currentTarget.style.borderColor = "rgba(59,130,246,0.6)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(59,130,246,0.05)";
              e.currentTarget.style.borderColor = "rgba(59,130,246,0.4)";
            }}
          >
            Sign in
          </button>
        </div>

        {/* Feature showcase - 2x2 GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 20,
            maxWidth: 900,
            width: "100%",
            marginBottom: 40,
          }}
        >
          {features.map((feature, idx) => (
            <div
              key={idx}
              onMouseEnter={() => setActiveFeature(idx)}
              style={{
                padding: 28,
                borderRadius: 16,
                background:
                  activeFeature === idx
                    ? "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.1))"
                    : "rgba(30,40,60,0.5)",
                border:
                  activeFeature === idx
                    ? "1px solid rgba(59,130,246,0.4)"
                    : "1px solid rgba(59,130,246,0.1)",
                backdropFilter: "blur(10px)",
                transition: "all 0.3s ease",
                cursor: "pointer",
                transform: activeFeature === idx ? "translateY(-4px)" : "translateY(0)",
                boxShadow:
                  activeFeature === idx
                    ? "0 16px 40px rgba(59,130,246,0.2)"
                    : "0 8px 16px rgba(0,0,0,0.3)",
              }}
            >
              <p style={{ fontSize: 40, margin: "0 0 12px 0" }}>{feature.icon}</p>
              <h3
                style={{
                  margin: "0 0 8px 0",
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#e0e7ff",
                }}
              >
                {feature.title}
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  color: "#a5b4fc",
                  lineHeight: 1.5,
                }}
              >
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        {/* ✅ COMPACT Visit Us Section */}
        <div
          style={{
            background: "rgba(30,40,60,0.4)",
            border: "1px solid rgba(59,130,246,0.2)",
            borderRadius: 16,
            padding: "24px",
            maxWidth: 500,
            width: "100%",
            textAlign: "center",
            backdropFilter: "blur(10px)",
            marginBottom: 20,
          }}
        >
          <h3 style={{ margin: "0 0 16px 0", fontSize: 18, fontWeight: 700, color: "#e0e7ff" }}>
            🏢 ViBration Fitness
          </h3>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, alignItems: "center" }}>
            {/* Left - Gym & Address */}
            <div>
              <p style={{ fontSize: 14, color: "#a5b4fc", margin: "0 0 4px 0", fontWeight: 600 }}>
                A-1/10, 4th Floor
              </p>
              <p style={{ fontSize: 13, color: "#cbd5e1", margin: 0 }}>
                Sector 8, Delhi
              </p>
            </div>
            
            {/* Right - Contact */}
            <div style={{ textAlign: "right" }}>
              <a
                href="tel:+919999374474"
                style={{ 
                  fontSize: 16, 
                  color: "#60a5fa", 
                  fontWeight: 700, 
                  textDecoration: "none",
                  display: "block",
                  marginBottom: 4
                }}
              >
                📱 99993 74474
              </a>
              <p style={{ fontSize: 13, color: "#e0e7ff", margin: 0, fontWeight: 600 }}>
                Aditya Singh
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ DETAILED FOOTER */}
      <footer
        style={{
          padding: "32px 32px",
          textAlign: "center",
          background: "rgba(15,23,42,0.8)",
          borderTop: "1px solid rgba(59,130,246,0.2)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <p style={{ margin: "0 0 8px 0", fontSize: 14, fontWeight: 600, color: "#e0e7ff" }}>
            © {new Date().getFullYear()} FitVibs
          </p>
          <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>
            Powered by ViBrations Fitness
          </p>
        </div>
        
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
          gap: 20, 
          maxWidth: 800, 
          margin: "0 auto" 
        }}>
          <div>
            <p style={{ fontSize: 13, color: "#9ca3af", margin: "0 0 8px 0", fontWeight: 600 }}>
              📍 Location
            </p>
            <p style={{ fontSize: 14, color: "#e0e7ff", margin: 0 }}>
              A-1/10, 4th Floor<br/>
              Sector 8, Delhi
            </p>
          </div>
          
          <div>
            <p style={{ fontSize: 13, color: "#9ca3af", margin: "0 0 8px 0", fontWeight: 600 }}>
              📱 Contact
            </p>
            <a 
              href="tel:+919999374474"
              style={{ fontSize: 15, color: "#60a5fa", fontWeight: 700, textDecoration: "none" }}
            >
              +91 99993 74474
            </a>
          </div>
          
          <div>
            <p style={{ fontSize: 13, color: "#9ca3af", margin: "0 0 8px 0", fontWeight: 600 }}>
              👨‍🏫 Trainer
            </p>
            <p style={{ fontSize: 15, color: "#e0e7ff", margin: 0, fontWeight: 700 }}>
              Aditya Singh
            </p>
          </div>
        </div>
      </footer>

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-30px) translateX(15px); }
          50% { transform: translateY(-60px) translateX(0px); }
          75% { transform: translateY(-30px) translateX(-15px); }
        }
      `}</style>
    </div>
  );
}
