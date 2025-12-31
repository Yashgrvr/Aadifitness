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
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              boxShadow: "0 8px 32px rgba(59,130,246,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
            }}
          >
            💪
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 950, letterSpacing: -0.8 }}>
              FitVibs
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: 10,
                color: "#3b82f6",
                letterSpacing: 2,
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
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
