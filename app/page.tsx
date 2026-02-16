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
  ChevronRight,
  User
} from "lucide-react";

const images = ["/t1.jpg", "/t2.jpg", "/t3.jpg"];

export default function HomePage() {
  const router = useRouter();
  const [active, setActive] = useState(0);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const i = setInterval(() => {
      setActive(p => (p + 1) % images.length);
    }, 4000);
    return () => clearInterval(i);
  }, []);

  const scrollToResults = () => {
    resultsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 font-[var(--font-geist-sans)] overflow-hidden">

      {/* NAV */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <span className="text-3xl font-black italic tracking-tight">FitVibs</span>

          <button
            onClick={() => router.push("/login")}
            className="group flex items-center gap-2 bg-slate-900 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-full font-bold transition-all shadow-xl"
          >
            Sign In
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-24 text-center px-6">
        <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[1.05]">
          Build your <br />
          <span className="text-emerald-500 italic">best self</span><br />
          with FitVibs
        </h1>

        <p className="mt-10 text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Elite coaching. Smart tracking. Real body transformations.
        </p>

        <div className="mt-12 flex justify-center gap-4 flex-wrap">
          <button
            onClick={() => router.push("/client/onboarding")}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-4 rounded-2xl shadow-2xl font-bold transition-all hover:-translate-y-1"
          >
            Begin Your Journey
          </button>
          <button
            onClick={scrollToResults}
            className="bg-white border-2 border-emerald-500 text-emerald-600 px-10 py-4 rounded-2xl font-bold hover:bg-emerald-50 transition"
          >
            View Results
          </button>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
          {[
            { title: "Live Progress Tracking", icon: <Activity /> },
            { title: "Personalized Training", icon: <Dumbbell /> },
            { title: "Nutrition Planning", icon: <Apple /> },
            { title: "Transformation Analytics", icon: <TrendingUp /> },
          ].map((f, i) => (
            <div
              key={i}
              className="group p-10 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl hover:-translate-y-2 transition-all"
            >
              <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-500 group-hover:text-white transition">
                {f.icon}
              </div>
              <h3 className="text-xl font-bold">{f.title}</h3>
              <p className="text-slate-500 mt-2">Premium tools for elite results.</p>
            </div>
          ))}
        </div>
      </section>

      {/* PROCESS */}
      <section className="bg-slate-50 py-32 px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-10">
          {["Consult", "Custom Plan", "Track Daily", "Transform"].map((s, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-xl">
                {i + 1}
              </div>
              <span className="font-bold text-lg">{s}</span>
              {i < 3 && <ChevronRight className="text-emerald-400" />}
            </div>
          ))}
        </div>
      </section>

      {/* TRANSFORMATIONS */}
      <section ref={resultsRef} className="py-32 bg-white text-center px-6">
        <h2 className="text-4xl font-black mb-12">Visual Success Stories</h2>

        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.img
              key={active}
              src={images[active]}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="rounded-[2rem] shadow-2xl mx-auto"
            />
          </AnimatePresence>

          <div className="flex justify-center mt-10 gap-3">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === active ? "w-12 bg-emerald-500" : "w-3 bg-slate-300"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-300 py-24 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-16">
          <div>
            <h3 className="text-white font-black text-2xl italic">FitVibs</h3>
            <p className="mt-2">High-Performance Wellness Platform</p>
          </div>
          <div>
            <p className="text-white font-bold">Trainer</p>
            <p>Aditya Singh</p>
          </div>
          <div>
            <p className="text-white font-bold">Location</p>
            <p>Delhi, India</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
