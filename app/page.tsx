"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const images = ["/t1.jpg", "/t2.jpg", "/t3.jpg"];

export default function HomePage() {
  const router = useRouter();
  const [active, setActive] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Interval for image slider & Hydration Fix
  useEffect(() => {
    setIsMounted(true);
    const t = setInterval(() => {
      setActive((p) => (p + 1) % images.length);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  // Track scrolling for dynamic navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToResults = () => {
    setIsMobileMenuOpen(false);
    resultsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Prevent SSR crashing by rendering a blank matching background until ready
  if (!isMounted) return <div className="min-h-screen bg-[#050505]" />;

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden font-sans relative selection:bg-emerald-500 selection:text-black">

      {/* Dark Theme Ambient Background Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-emerald-500/10 rounded-full blur-[100px] md:blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[70vw] h-[70vw] bg-emerald-900/20 rounded-full blur-[100px] md:blur-[150px] pointer-events-none" />

      {/* ELITE NAVBAR */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          isScrolled 
            ? "bg-[#050505]/90 backdrop-blur-2xl border-b border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] py-3 md:py-4" 
            : "bg-transparent py-5 md:py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex justify-between items-center">
          
          {/* Logo */}
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-black italic tracking-tighter bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent hover:scale-105 transition-transform cursor-pointer">
              Fit<span className="text-emerald-500">Vibs</span>
            </h1>
          </div>

          {/* Desktop Center Links */}
          <div className="hidden md:flex flex-1 justify-center gap-8 items-center">
            {["Features", "Process", "Results"].map((item) => (
              <button 
                key={item}
                onClick={item === "Results" ? scrollToResults : undefined}
                className="text-white/50 hover:text-white text-[11px] font-black uppercase tracking-[0.15em] transition-colors"
              >
                {item}
              </button>
            ))}
          </div>

          {/* Action Buttons & Mobile Toggle */}
          <div className="flex-1 flex justify-end items-center gap-3 md:gap-0">
            <button
              onClick={() => router.push("/login")}
              className="hidden sm:flex group bg-emerald-500 hover:bg-emerald-400 text-black px-5 md:px-6 py-2 md:py-2.5 rounded-full font-black uppercase tracking-widest text-[10px] md:text-xs transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] items-center gap-2"
            >
              Sign In 
              <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
            </button>

            {/* Mobile Hamburger Icon */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 text-white/70 hover:text-white transition-colors"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>

        </div>
      </motion.nav>

      {/* MOBILE FULLSCREEN MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[60] bg-[#050505]/95 backdrop-blur-3xl flex flex-col items-center justify-center px-6"
          >
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-6 right-6 p-2 text-white/50 hover:text-white"
            >
              <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <div className="flex flex-col gap-8 text-center w-full">
              {["Features", "Process", "Results"].map((item) => (
                <button 
                  key={item}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (item === "Results") scrollToResults();
                  }}
                  className="text-2xl font-black uppercase tracking-widest text-white/70 hover:text-emerald-400 transition-colors"
                >
                  {item}
                </button>
              ))}
              
              <div className="w-full h-px bg-white/10 my-4" />
              
              <button
                onClick={() => router.push("/login")}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)]"
              >
                Sign In To Portal
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO SECTION - RESPONSIVE UPGRADE */}
      <section className="pt-32 md:pt-40 pb-20 md:pb-32 px-4 md:px-6 text-center relative z-10 w-full flex flex-col items-center justify-center min-h-[90vh]">
        
        {/* Subtle Tech Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

        {/* Core Text Glow Orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] md:w-[600px] h-[250px] md:h-[600px] bg-emerald-500/20 blur-[100px] md:blur-[120px] rounded-full pointer-events-none -z-10" />

        {/* Elite Performance Badge */}
        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex justify-center mb-6 md:mb-8 relative z-20"
        >
          <div className="bg-white/[0.03] border border-white/10 px-4 md:px-5 py-2 rounded-full flex items-center gap-2 md:gap-3 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
            </span>
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.25em] text-white/80">Premium Ecosystem</span>
          </div>
        </motion.div>

        {/* Main Massive Headline (Responsive Text Sizes) */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="relative text-5xl leading-[1.1] sm:text-6xl md:text-8xl lg:text-[7.5rem] font-black tracking-tighter text-white z-20"
        >
          Build your <br className="block" />
          <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-b from-emerald-300 via-emerald-400 to-emerald-600 drop-shadow-[0_0_20px_rgba(16,185,129,0.3)] md:drop-shadow-[0_0_40px_rgba(16,185,129,0.3)] pb-1 md:pb-2">
            best self
          </span>{" "}
          <br className="block" />
          with FitVibs
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-6 md:mt-10 text-base sm:text-lg md:text-2xl text-white/40 max-w-[90%] md:max-w-2xl mx-auto font-medium leading-relaxed z-20"
        >
          Elite coaching, smart tracking and real transformations — all in one premium wellness platform.
        </motion.p>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-10 md:mt-12 flex flex-col sm:flex-row gap-4 md:gap-6 justify-center w-full max-w-[90%] md:max-w-md mx-auto z-20"
        >
          <button
            onClick={() => router.push("/client/onboarding")}
            className="group relative w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-black px-8 md:px-10 py-4 md:py-5 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.2)] md:shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.5)] font-black tracking-widest uppercase text-xs md:text-sm transition-all duration-300 hover:-translate-y-1 flex justify-center items-center gap-3 overflow-hidden"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-out" />
            <span>Begin Journey</span>
            <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
          </button>

          <button
            onClick={scrollToResults}
            className="w-full sm:w-auto bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 hover:border-white/30 px-8 md:px-10 py-4 md:py-5 rounded-2xl font-black tracking-widest uppercase text-xs md:text-sm transition-all duration-300 hover:-translate-y-1 shadow-xl"
          >
            View Results
          </button>
        </motion.div>

        {/* Social Proof / Trust Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-12 md:mt-16 flex items-center justify-center gap-4 z-20"
        >
          <div className="flex -space-x-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-[#050505] bg-gradient-to-br from-slate-700 to-slate-800" />
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-[#050505] bg-gradient-to-br from-slate-600 to-slate-700" />
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-[#050505] bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-[10px] md:text-xs font-bold text-white/50 backdrop-blur-md">
              +1k
            </div>
          </div>
          <div className="text-left">
            <div className="flex gap-1 text-emerald-500 text-xs md:text-sm">
              ★★★★★
            </div>
            <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-white/30 mt-1">
              Transformations Verified
            </p>
          </div>
        </motion.div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-20 md:py-24 px-4 md:px-6 relative z-10">
        
        {/* Premium Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-black tracking-tighter text-white"
          >
            Engineered for <span className="text-emerald-500">Execution</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-white/40 text-sm md:text-base font-medium px-4"
          >
            A precise structural balance between tracking, training, and absolute transformation.
          </motion.p>
        </div>

        {/* Feature Cards Grid */}
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[
            { title: "Live Progress", icon: "📊", desc: "Real-time updates monitored directly by your personal trainer." },
            { title: "Custom Workouts", icon: "🏋️", desc: "Tailored movement modules built for your exact structural shifts." },
            { title: "Nutrition Plans", icon: "🥗", desc: "Precise macro breakdowns structured around your daily habits." },
            { title: "Growth Insights", icon: "📈", desc: "Deep analytical data assessing your overall baseline changes." },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group relative rounded-[2rem] bg-white/[0.02] backdrop-blur-xl border border-white/10 hover:border-emerald-500/50 transition-all duration-500 hover:bg-white/[0.04] overflow-hidden flex flex-col shadow-[0_10px_40px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_60px_rgba(16,185,129,0.15)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-emerald-500/0 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              
              <div className="p-6 md:p-8 relative z-10 flex-1 flex flex-col">
                <div className="relative w-12 h-12 md:w-14 md:h-14 mb-6 md:mb-8">
                  <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100" />
                  <div className="relative w-full h-full rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl md:text-2xl group-hover:scale-110 transition-transform duration-500 group-hover:border-emerald-500/40">
                    {f.icon}
                  </div>
                </div>

                <h3 className="text-lg md:text-xl font-black tracking-tight text-white mb-2 md:mb-3 group-hover:text-emerald-400 transition-colors duration-300">
                  {f.title}
                </h3>
                
                <p className="text-white/40 text-xs md:text-sm font-medium leading-relaxed flex-1">
                  {f.desc}
                </p>

                <div className="mt-6 md:mt-8 flex items-center text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white/20 group-hover:text-emerald-500 transition-colors duration-300">
                  <span>Explore</span>
                  <span className="ml-2 transform group-hover:translate-x-2 transition-transform duration-300">→</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* PROCESS SECTION (Fixed for Mobile Stacking) */}
      <section className="py-16 md:py-20 px-4 md:px-6 border-y border-white/5 bg-white/[0.02] backdrop-blur-md relative z-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-center md:justify-between items-center gap-6 md:gap-8">
          {["Consult", "Custom Plan", "Track Daily", "Transform"].map((step, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20, md: { x: -20, y: 0 } }}
              whileInView={{ opacity: 1, y: 0, md: { x: 0 } }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="flex flex-col md:flex-row items-center gap-3 md:gap-4 text-center md:text-left"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 bg-white/5 border border-white/10 text-emerald-400 rounded-full flex items-center justify-center font-black text-base md:text-lg shadow-lg">
                {i + 1}
              </div>
              <span className="font-black tracking-widest uppercase text-xs md:text-sm text-white/80">{step}</span>
              
              {/* Arrows: Down for Mobile, Right for Desktop */}
              {i < 3 && (
                <>
                  <span className="hidden md:block text-emerald-500/30 text-3xl font-light ml-4">→</span>
                  <span className="block md:hidden text-emerald-500/30 text-2xl font-light mt-2">↓</span>
                </>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* TRANSFORMATIONS SECTION */}
      <section ref={resultsRef} className="py-24 md:py-32 px-4 md:px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter">
            Transformation Journey
          </h2>
          <p className="mt-3 md:mt-4 text-xs md:text-sm font-bold uppercase tracking-widest text-white/30">
            Real people • Real discipline • Real results
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(10px)" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative rounded-[2rem] md:rounded-[3rem] p-3 md:p-4 bg-white/5 border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.5)] backdrop-blur-3xl"
            >
              <img
                src={images[active]}
                className="absolute inset-0 w-full h-full object-cover blur-[50px] md:blur-[80px] opacity-20 rounded-[2rem] md:rounded-[3rem] pointer-events-none"
                alt=""
              />

              <img
                src={images[active]}
                className="relative mx-auto max-h-[350px] md:max-h-[600px] w-auto object-contain rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl border border-white/10"
                alt="Transformation"
              />
            </motion.div>
          </AnimatePresence>

          {/* Dots Controller */}
          <div className="flex justify-center mt-8 md:mt-12 gap-2 md:gap-3">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === active
                    ? "w-10 md:w-12 h-2 md:h-2.5 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                    : "w-2 md:w-3 h-2 md:h-2.5 bg-white/20 hover:bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER SECTION */}
      <footer className="bg-[#050505] pt-16 md:pt-20 pb-8 md:pb-10 px-6 relative z-10 border-t border-white/10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 text-center md:text-left">
          
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-white text-3xl font-black italic mb-3 md:mb-4 tracking-tighter">
              Fit<span className="text-emerald-500">Vibs</span>
            </h3>
            <p className="text-white/40 leading-relaxed font-medium text-xs md:text-sm md:pr-4 max-w-[250px] md:max-w-none">
              Premium wellness & transformation platform focused on real long-term results.
            </p>
          </div>

          <div>
            <h4 className="text-white/30 uppercase tracking-widest text-[10px] font-black mb-4 md:mb-6">
              Contact
            </h4>
            <div className="space-y-2 md:space-y-3 text-white/70 font-medium text-xs md:text-sm">
              <p>Sector 8, Rohini, Delhi</p>
              <p>+91 99993 74474</p>
              <p className="text-emerald-500 font-bold mt-2 md:mt-4">ViBrations Fitness</p>
            </div>
          </div>

          <div>
            <h4 className="text-white/30 uppercase tracking-widest text-[10px] font-black mb-4 md:mb-6">
              Lead Trainer
            </h4>
            <p className="text-white text-lg md:text-xl font-black tracking-tight">Aditya Singh</p>
            <p className="text-emerald-400 text-[10px] md:text-xs font-black uppercase tracking-widest mt-2 bg-emerald-500/10 border border-emerald-500/20 inline-block px-3 py-1 rounded-md">
              Certified Trainer
            </p>
          </div>
        </div>

        <div className="mt-12 md:mt-16 border-t border-white/5 pt-6 md:pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-white/30 text-[10px] md:text-xs font-bold uppercase tracking-widest">
          <p>© {new Date().getFullYear()} FitVibs. All rights reserved.</p>
          <p> 
            Developed by{" "} 
            <span className="text-emerald-500 hover:text-emerald-400 transition cursor-pointer"> Yash Grover </span>
          </p>
        </div>
      </footer>

    </div>
  );
}