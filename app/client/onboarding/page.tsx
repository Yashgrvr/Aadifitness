"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";

declare global {
  interface Window {
    Razorpay: any;
  }
}

// Premium Motivational Quotes
const QUOTES = [
  "The body achieves what the mind believes.",
  "Elite results require elite planning.",
  "Your only competition is who you were yesterday.",
  "Great things never come from comfort zones."
];

export default function ClientOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Form States
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [currentWeight, setCurrentWeight] = useState("");
  const [goalWeight, setGoalWeight] = useState("");
  const [fitnessGoal, setFitnessGoal] = useState("weight_loss");
  const [plan, setPlan] = useState("1_month");
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Mouse move effect for background
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });
  const moveX = useTransform(springX, [0, 1000], [-20, 20]);
  const moveY = useTransform(springY, [0, 1000], [-20, 20]);

  const planAmounts: Record<string, number> = { "1_month": 99900, "3_months": 249900, "6_months": 449900 };
  const planPrices: Record<string, string> = { "1_month": "₹999", "3_months": "₹2,499", "6_months": "₹4,499" };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    const quoteInterval = setInterval(() => setQuoteIndex((p) => (p + 1) % QUOTES.length), 5000);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearInterval(quoteInterval);
    };
  }, [mouseX, mouseY]);

  useEffect(() => {
    if (typeof window !== "undefined") localStorage.removeItem("clientId");
  }, []);

  useEffect(() => {
    if (step === 3) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
      return () => {
        const existing = document.querySelector('script[src*="razorpay"]');
        if (existing) document.body.removeChild(existing);
      };
    }
  }, [step]);

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !firstName || !lastName || !currentWeight || !goalWeight) {
      setError("Please complete your profile to continue.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/clients/save-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: null,
          email, firstName, lastName,
          currentWeight: parseFloat(currentWeight),
          goalWeight: parseFloat(goalWeight),
          initialWeight: parseFloat(currentWeight),
          fitnessGoal: "weight_loss",
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      if (data.clientId) localStorage.setItem("clientId", data.clientId);
      setStep(2);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoalsAndPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cid = localStorage.getItem("clientId");
      const res = await fetch("/api/clients/save-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: cid, email, firstName, lastName, currentWeight, goalWeight, fitnessGoal }),
      });
      if (!res.ok) throw new Error();
      setStep(3);
    } catch {
      setError("Could not update goals. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentProcessing(true);
    try {
      const cid = localStorage.getItem("clientId");
      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: cid, plan, amount: planAmounts[plan] }),
      });
      const orderData = await orderRes.json();
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        order_id: orderData.orderId,
        amount: planAmounts[plan],
        currency: "INR",
        name: "FitVibs Elite",
        description: `${plan.replace("_", " ")} Membership`,
        handler: () => { setSuccess(true); setTimeout(() => router.push("/client/dashboard"), 3000); },
        theme: { color: "#10b981" }
      };
      new (window as any).Razorpay(options).open();
    } catch {
      setError("Payment failed to initialize.");
    } finally {
      setPaymentProcessing(false);
    }
  };

  const progressPercent = useMemo(() => Math.round((step / 3) * 100), [step]);

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Dynamic Background Blobs */}
      <motion.div style={{ x: moveX, y: moveY }} className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/10 rounded-full blur-[120px]" />
      <motion.div style={{ x: moveY, y: moveX }} className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-emerald-900/20 rounded-full blur-[120px]" />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl relative z-10">
        
        {/* Elite Badge */}
        <div className="flex justify-center mb-8">
          <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full flex items-center gap-2 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Join 500+ Elite Members</span>
          </div>
        </div>

        {/* Glassmorphism Card */}
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 shadow-[0_32px_128px_rgba(0,0,0,0.4)] rounded-[3rem] overflow-hidden">
          
          {/* Enhanced Progress Header */}
          <div className="px-10 pt-10 pb-6 flex items-center justify-between border-b border-white/5">
            <div>
              <h1 className="text-3xl font-black italic tracking-tighter">FitVibs</h1>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">Exclusive Onboarding</p>
            </div>
            <div className="text-right">
              <p className="text-emerald-400 text-2xl font-black">{progressPercent}%</p>
              <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest">To Transformation</p>
            </div>
          </div>

          <div className="p-10">
            <AnimatePresence mode="wait">
              {success ? (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
                  <div className="text-7xl mb-6">💎</div>
                  <h2 className="text-4xl font-black italic mb-4">Welcome to the Club</h2>
                  <p className="text-white/50 text-lg mb-8">Your dashboard is being personalized...</p>
                </motion.div>
              ) : (
                <motion.div layout transition={{ duration: 0.5, ease: "anticipate" }}>
                  {step === 1 && (
                    <motion.div key="step1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-8">
                      <div className="space-y-2">
                        <h2 className="text-4xl font-extrabold tracking-tight">Crafting Your <span className="text-emerald-500">Blueprint</span></h2>
                        <p className="text-white/40 text-sm">Every transformation starts with precision data.</p>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-7 py-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all outline-none" placeholder="First Name" />
                        <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-7 py-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all outline-none" placeholder="Last Name" />
                      </div>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-7 py-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all outline-none" placeholder="Elite Email Address" />

                      <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                          <input type="number" value={currentWeight} onChange={e => setCurrentWeight(e.target.value)} className="w-full px-7 py-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Current KG" />
                          <span className="absolute right-6 top-5 text-white/20 font-bold">KG</span>
                        </div>
                        <div className="relative">
                          <input type="number" value={goalWeight} onChange={e => setGoalWeight(e.target.value)} className="w-full px-7 py-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Target KG" />
                          <span className="absolute right-6 top-5 text-white/20 font-bold">KG</span>
                        </div>
                      </div>

                      <button onClick={handleSaveDetails} disabled={loading} className="group relative w-full py-6 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-2xl overflow-hidden transition-all active:scale-[0.98]">
                        <span className="relative z-10 uppercase tracking-widest">{loading ? "Processing..." : "Next Step →"}</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                      </button>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div key="step2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-8">
                      <div className="space-y-2">
                        <h2 className="text-4xl font-extrabold tracking-tight">Defining Your <span className="text-emerald-500">Mission</span></h2>
                        <p className="text-white/40 text-sm">Choose the discipline that defines your journey.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { id: "weight_loss", label: "Fat Loss", desc: "Burn & Shred", icon: "🔥" },
                          { id: "muscle_gain", label: "Muscle Gain", desc: "Build Lean Mass", icon: "💪" },
                          { id: "strength", label: "Strength", desc: "Power & Force", icon: "⚡" },
                          { id: "maintenance", label: "Athletic", desc: "Health & Vitality", icon: "🏃" },
                        ].map((g) => (
                          <button key={g.id} type="button" onClick={() => setFitnessGoal(g.id)} className={`p-6 rounded-2xl border-2 text-left transition-all ${fitnessGoal === g.id ? "border-emerald-500 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.2)]" : "border-white/5 bg-white/5 hover:bg-white/10"}`}>
                            <div className="flex justify-between items-start mb-3">
                              <span className="text-3xl">{g.icon}</span>
                              {fitnessGoal === g.id && <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-[10px] text-black">✓</div>}
                            </div>
                            <p className="font-black text-lg">{g.label}</p>
                            <p className="text-[10px] uppercase tracking-wider text-white/30 font-bold">{g.desc}</p>
                          </button>
                        ))}
                      </div>

                      <div className="flex gap-4">
                        <button type="button" onClick={() => setStep(1)} className="flex-1 py-5 text-white/40 font-bold hover:text-white transition-all">Back</button>
                        <button onClick={handleGoalsAndPayment} className="group relative flex-[2] py-5 bg-emerald-500 text-black font-black rounded-2xl overflow-hidden transition-all active:scale-[0.98]">
                          <span className="relative z-10 uppercase tracking-widest">Confirm Goal</span>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div key="step3" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-8">
                      <div className="space-y-2">
                        <h2 className="text-4xl font-extrabold tracking-tight">Finalizing <span className="text-emerald-500">Access</span></h2>
                        <p className="text-white/40 text-sm">Select your membership tier to enter the portal.</p>
                      </div>

                      <div className="space-y-4">
                        {Object.entries(planPrices).map(([key, price]) => (
                          <button key={key} type="button" onClick={() => setPlan(key)} className={`w-full p-7 rounded-3xl border-2 flex justify-between items-center transition-all ${plan === key ? "border-emerald-500 bg-emerald-500/10 shadow-lg" : "border-white/5 bg-white/5"}`}>
                            <div className="text-left">
                              <p className="text-[10px] font-black uppercase text-emerald-500 tracking-widest mb-1">{key.replace("_", " ")} Plan</p>
                              <p className="font-bold text-xl">Full Elite Portal Access</p>
                            </div>
                            <span className="text-2xl font-black">{price}</span>
                          </button>
                        ))}
                      </div>

                      <div className="bg-emerald-500/10 p-6 rounded-[2.5rem] border border-emerald-500/20">
                        <div className="flex justify-between items-center mb-6">
                          <div>
                            <p className="text-[10px] uppercase font-bold text-emerald-500">Total Investment</p>
                            <p className="text-3xl font-black">{planPrices[plan]}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-[9px] font-bold text-white/30 uppercase mb-1">Secured by Razorpay</p>
                             <div className="flex gap-2 justify-end">
                               <span className="text-xs">🛡️</span> <span className="text-[10px] font-bold text-white/60">Guarantee</span>
                             </div>
                          </div>
                        </div>
                        <button onClick={handlePayment} disabled={paymentProcessing} className="group relative w-full py-6 bg-white text-black font-black rounded-2xl overflow-hidden transition-all active:scale-[0.98]">
                          <span className="relative z-10 uppercase tracking-widest">{paymentProcessing ? "Opening Secure Portal..." : "Unlock My Dashboard"}</span>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent -translate-x-full group-hover:animate-shimmer" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Motivational Quote Footer */}
          <div className="px-10 py-8 bg-black/40 border-t border-white/5 text-center">
            <AnimatePresence mode="wait">
              <motion.p key={quoteIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-white/30 text-xs font-medium italic">
                "{QUOTES[quoteIndex]}"
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* Global Social Proof Footer */}
        <div className="mt-10 flex flex-wrap justify-center items-center gap-8 opacity-40 grayscale pointer-events-none">
          <span className="text-[10px] font-black tracking-widest">CERTIFIED COACHING</span>
          <span className="text-[10px] font-black tracking-widest">DATA ENCRYPTION</span>
          <span className="text-[10px] font-black tracking-widest">RESULTS GUARANTEED</span>
        </div>
      </motion.div>

      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
        }
      `}</style>
    </div>
  );
}