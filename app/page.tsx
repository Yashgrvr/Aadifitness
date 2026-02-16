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