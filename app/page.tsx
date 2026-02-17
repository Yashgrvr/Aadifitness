"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const images = ["/t1.jpg", "/t2.jpg", "/t3.jpg"];

export default function HomePage() {
  const router = useRouter();
  const [active, setActive] = useState(0);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setInterval(() => {
      setActive(p => (p + 1) % images.length);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-hidden">

      {/* NAVBAR */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <h1 className="text-3xl font-black italic">FitVibs</h1>
          <button
            onClick={() => router.push("/login")}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-full font-semibold shadow-xl transition"
          >
            Sign In →
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-36 pb-28 px-6 text-center relative">

        <div className="absolute left-1/2 top-40 -translate-x-1/2 w-[720px] h-[720px] 
          bg-emerald-300/35 rounded-full blur-[210px]" />

        <motion.h1
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative text-5xl md:text-8xl font-extrabold leading-[1.02]"
        >
          Build your{" "}
          <span className="bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
            best self
          </span>
          <br />with FitVibs
        </motion.h1>

        <p className="mt-8 text-lg md:text-xl text-slate-500 max-w-xl mx-auto">
          Elite coaching, smart tracking and real transformations — all in one premium wellness platform.
        </p>

        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push("/client/onboarding")}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-12 py-4 rounded-2xl shadow-xl font-semibold transition hover:-translate-y-1"
          >
            Begin Your Journey
          </button>

          <button
            onClick={() => resultsRef.current?.scrollIntoView({ behavior: "smooth" })}
            className="border-2 border-emerald-500 text-emerald-600 px-12 py-4 rounded-2xl font-semibold hover:bg-emerald-50 transition"
          >
            View Results
          </button>
        </div>
      </section>

      {/* FEATURE CARDS */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 md:grid-cols-4 gap-8">

          {[
            { title: "Live Progress", icon: "📊" },
            { title: "Custom Workouts", icon: "🏋️" },
            { title: "Nutrition Plans", icon: "🥗" },
            { title: "Growth Insights", icon: "📈" },
          ].map((f, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -10 }}
              className="relative group p-10 rounded-3xl bg-white border border-slate-200
              shadow-[0_15px_40px_rgba(0,0,0,0.08)] 
              hover:shadow-[0_30px_80px_rgba(16,185,129,0.25)] transition-all"
            >
              <div className="text-4xl mb-6">{f.icon}</div>
              <h3 className="text-xl font-semibold">{f.title}</h3>
              <p className="text-slate-500 mt-2 text-sm">
                Built for real results and consistency.
              </p>
            </motion.div>
          ))}

        </div>
      </section>

      {/* PROCESS */}
      <section className="bg-slate-50 py-28 px-6">
        <div className="max-w-6xl mx-auto flex flex-wrap justify-center md:justify-between items-center gap-10">

          {["Consult", "Custom Plan", "Track Daily", "Transform"].map((step, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold shadow-xl">
                {i + 1}
              </div>
              <span className="font-semibold text-lg">{step}</span>
              {i < 3 && <span className="hidden md:block text-emerald-400 text-3xl">→</span>}
            </div>
          ))}

        </div>
      </section>

      {/* PREMIUM PORTRAIT TRANSFORMATIONS */}
      <section ref={resultsRef} className="py-28 px-6 relative overflow-hidden">
        <div className="text-center mb-20 relative z-10">
  <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
    Transformation Journey
  </h2>
  <p className="mt-4 text-slate-500 max-w-xl mx-auto">
    Real people. Real discipline. Real results.
  </p>
</div>


        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
          w-[850px] h-[850px] bg-emerald-200/40 rounded-full blur-[240px]" />

        <div className="relative max-w-4xl mx-auto">

          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
              className="relative rounded-[2.5rem] p-6 bg-white shadow-[0_40px_120px_rgba(0,0,0,0.25)]"
            >
              <img
                src={images[active]}
                className="absolute inset-0 w-full h-full object-cover blur-[70px] opacity-40 rounded-[2.5rem]"
                alt=""
              />

              <img
                src={images[active]}
                className="relative mx-auto max-h-[650px] w-auto object-contain rounded-[2rem] shadow-2xl"
                alt="Transformation"
              />
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-center mt-10 gap-3">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`rounded-full transition ${
                  i === active
                    ? "w-12 h-2 bg-emerald-500"
                    : "w-3 h-2 bg-slate-300"
                }`}
              />
            ))}
          </div>

        </div>
      </section>

      {/* PREMIUM FOOTER */}
      <footer className="bg-slate-900 text-slate-300 py-24 px-6 relative overflow-hidden">

        <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-[600px] h-[600px] 
          bg-emerald-500/20 rounded-full blur-[200px]" />

        <div className="relative max-w-7xl mx-auto grid md:grid-cols-3 gap-16 text-center md:text-left">

          <div>
            <h3 className="text-white text-3xl font-extrabold italic mb-4">FitVibs</h3>
            <p className="text-slate-400 max-w-sm">
              Premium wellness & transformation platform focused on real long-term results.
            </p>
          </div>

          <div>
            <h4 className="text-white uppercase tracking-widest text-sm mb-6 opacity-70">
              Contact
            </h4>
            <p>📍 Sector 8, Rohini, Delhi</p>
            <p>📞 +91 99993 74474</p>
            <p>🏋️ ViBrations Fitness</p>
          </div>

          <div>
            <h4 className="text-white uppercase tracking-widest text-sm mb-6 opacity-70">
              Lead Trainer
            </h4>
            <p className="text-white text-xl font-semibold">Aditya Singh</p>
            <p className="text-emerald-400">Certified Personal Trainer</p>
          </div>

        </div>

        <div className="relative mt-20 border-t border-white/10 pt-8 text-center text-slate-500 text-sm space-y-3">
          <p>© {new Date().getFullYear()} FitVibs. All rights reserved.</p>
          <p className="text-slate-400">
            Designed & Developed by{" "}
            <span className="text-emerald-400 font-medium hover:text-emerald-300 transition">
              Yash Grover
            </span>
          </p>
        </div>

      </footer>

    </div>
  );
}
