"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Zap, Lock, ChevronLeft, ChevronRight, CheckCircle2, Timer, Flame, Utensils, Scale, Dumbbell, X, Activity, Target, PlayCircle, Crown, CreditCard, Shield } from "lucide-react";

// --- INTERFACES ---
interface Workout { id: string; exercise: string; sets: string; reps: string; weight: string; gifUrl?: string; day?: string; insight?: string; }
interface Diet { id: string; time: string; meal: string; calories: number; }
interface Client { id: string; name: string; email: string; initialWeight?: number; currentWeight: number; goalWeight: number; plan: string; progress: number; workouts: Workout[]; diets: Diet[]; }
type DayName = "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";
const DAYS: DayName[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
type Checklist = Record<string, { workouts: Record<string, boolean>; diets: Record<string, boolean>; }>;

export default function ClientDashboard() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [clientData, setClientData] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  // Core State
  const [activeDayView, setActiveDayView] = useState<DayName>("Monday");
  const [activeDate, setActiveDate] = useState("");
  const [checklist, setChecklist] = useState<Checklist>({});

  // Elite Player State
  const [activeWorkoutIdx, setActiveWorkoutIdx] = useState(0);
  const [restTimer, setRestTimer] = useState(0); 
  const [expandedVideo, setExpandedVideo] = useState<string | null>(null);

  // Update State
  const [weightInput, setWeightInput] = useState("");
  const [initialWeightInput, setInitialWeightInput] = useState("");
  const [savingWeight, setSavingWeight] = useState(false);
  const [savingInitialWeight, setSavingInitialWeight] = useState(false);
  
  // Password State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  // --- REST TIMER LOGIC ---
  useEffect(() => {
    let interval: any;
    if (restTimer > 0) interval = setInterval(() => setRestTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [restTimer]);

  const formatTime = (timeInSecs: number) => {
    const m = Math.floor(timeInSecs / 60).toString().padStart(2, "0");
    const s = (timeInSecs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // --- CORE LOGIC ---
  const ensureDate = (date: string, data: Checklist) => { if (!data[date]) data[date] = { workouts: {}, diets: {} }; };
  const getISODateForWeekdayInCurrentWeek = (targetDay: DayName): string => {
    const now = new Date();
    const diff = DAYS.indexOf(targetDay) - now.getDay();
    const d = new Date(now); d.setDate(now.getDate() + diff);
    return d.toISOString().split("T")[0];
  };

  const saveChecklist = (data: Checklist) => localStorage.setItem("client_checklist_backup", JSON.stringify(data));
  const loadChecklistBackup = () => {
    const backup = localStorage.getItem("client_checklist_backup");
    if (backup) { try { const parsed = JSON.parse(backup); setChecklist(parsed); return parsed; } catch (err) {} }
    return {};
  };

  useEffect(() => {
    const todayName = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(new Date()) as DayName;
    const todayISO = new Date().toISOString().split("T")[0];
    setActiveDayView(todayName); setActiveDate(todayISO);
    
    const storedName = localStorage.getItem("name");
    const role = localStorage.getItem("role");
    const clientId = localStorage.getItem("clientId");

    if (!role || role !== "client") return router.replace("/login");
    setName(storedName || "Warrior");
    loadChecklistBackup();
    if (clientId) fetchClientData(clientId);
  }, [router]);

  const fetchClientData = async (clientId: string) => {
    try {
      const res = await fetch(`/api/clients/${clientId}`);
      if (res.ok) {
        const data = await res.json();
        const client = data.client ? data.client : data;
        setClientData({ ...client, currentWeight: client.currentWeight || 0, goalWeight: client.goalWeight || 0, initialWeight: client.initialWeight || 0 });
        setWeightInput(String(client.currentWeight || 0));
        setInitialWeightInput(String(client.initialWeight || 0));

        const cRes = await fetch(`/api/clients/${clientId}/checklist`);
        if (cRes.ok) {
          const cData: any[] = await cRes.json();
          const map: Checklist = {};
          cData.forEach((item) => {
            if (!map[item.date]) map[item.date] = { workouts: {}, diets: {} };
            if (item.type === "workout" && item.workoutId) map[item.date].workouts[item.workoutId] = item.completed;
            if (item.type === "diet" && item.dietId) map[item.date].diets[item.dietId] = item.completed;
          });
          setChecklist(map);
        }
      }
    } catch (err) {} finally { setLoading(false); }
  };

  const handleToggleItem = async (itemId: string, type: "workout" | "diet") => {
    const clientId = localStorage.getItem("clientId");
    if (!clientId || !itemId) return;

    const newChecklist = { ...checklist };
    ensureDate(activeDate, newChecklist);

    let isNowCompleted = false;
    if (type === "workout") {
      isNowCompleted = !(newChecklist[activeDate].workouts[itemId] ?? false);
      newChecklist[activeDate].workouts[itemId] = isNowCompleted;
      if (isNowCompleted) setRestTimer(60); 
    } else {
      newChecklist[activeDate].diets[itemId] = !(newChecklist[activeDate].diets[itemId] ?? false);
    }

    setChecklist(newChecklist); saveChecklist(newChecklist);

    try {
      await fetch(`/api/clients/${clientId}/checklist`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: activeDate, type,
          workoutId: type === "workout" ? itemId : undefined,
          dietId: type === "diet" ? itemId : undefined,
          completed: type === "workout" ? newChecklist[activeDate].workouts[itemId] : newChecklist[activeDate].diets[itemId],
        }),
      });
    } catch (err) {}
  };

  const handleUpdateWeight = async () => { 
    const clientId = localStorage.getItem("clientId");
    if (!clientId || !clientData) return;
    setSavingWeight(true);
    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateWeight", currentWeight: parseFloat(weightInput) }),
      });
      if (res.ok) {
        setClientData(prev => prev ? { ...prev, currentWeight: parseFloat(weightInput) } : null);
      }
    } finally { setSavingWeight(false); }
  };

  const handleSetInitialWeight = async () => { 
    const clientId = localStorage.getItem("clientId");
    if (!clientId || !clientData || !initialWeightInput) return;
    setSavingInitialWeight(true);
    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateInitialWeight", initialWeight: parseFloat(initialWeightInput) }),
      });
      if (res.ok) {
        setClientData(prev => prev ? { ...prev, initialWeight: parseFloat(initialWeightInput) } : null);
      }
    } finally { setSavingInitialWeight(false); }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match!");
      return;
    }
    setSavingPassword(true); setPasswordError("");
    try {
      const res = await fetch("/api/clients/change-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: clientData?.id, oldPassword, newPassword }),
      });
      if (res.ok) {
        alert("✅ Security Vault Updated Successfully!");
        setShowPasswordModal(false); setOldPassword(""); setNewPassword(""); setConfirmPassword("");
      } else {
        const data = await res.json(); setPasswordError(data.error || "Failed to update password");
      }
    } catch (e) {
      setPasswordError("System error. Try again later.");
    } finally { setSavingPassword(false); }
  };

  // --- STREAK & PROGRESS LOGIC ---
  const calculateStreak = () => {
    let currentStreak = 0; let streakBroken = false;
    for(let i=0; i<365; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const dayData = checklist[d.toISOString().split("T")[0]];
      let workedOutToday = false;
      if (dayData) {
        const wCount = Object.values(dayData.workouts).filter(Boolean).length;
        if (wCount > 0) workedOutToday = true;
      }
      if (workedOutToday) { if (!streakBroken) currentStreak++; } 
      else { if (i !== 0) streakBroken = true; }
    }
    return currentStreak;
  };

  const calculateWeightProgress = () => {
    if (!clientData) return 0;
    const initial = clientData.initialWeight || clientData.currentWeight;
    const current = clientData.currentWeight;
    const goal = clientData.goalWeight;
    if (initial === 0 || goal === 0 || initial === goal) return 0;
    if (initial > goal) return Math.min(100, Math.max(0, Math.round(((initial - current) / (initial - goal)) * 100)));
    return Math.min(100, Math.max(0, Math.round(((current - initial) / (goal - initial)) * 100)));
  };

  const generateWeeklyGraph = () => {
    return Array.from({length: 7}, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i)); 
      const dateStr = d.toISOString().split("T")[0];
      const dayName = DAYS[d.getDay()].substring(0, 3);
      
      const dayChecks = checklist[dateStr] || { workouts: {}, diets: {} };
      const wCompleted = Object.values(dayChecks.workouts).filter(Boolean).length;
      const wAssigned = clientData?.workouts?.filter(w => w.day === DAYS[d.getDay()]).length || 0;
      let wPercent = wAssigned > 0 ? Math.min(100, (wCompleted / wAssigned) * 100) : (wCompleted > 0 ? 100 : 0);

      const dCompleted = Object.values(dayChecks.diets).filter(Boolean).length;
      const dAssigned = clientData?.diets?.length || 0; 
      let dPercent = dAssigned > 0 ? Math.min(100, (dCompleted / dAssigned) * 100) : (dCompleted > 0 ? 100 : 0);

      return { dayName, wPercent, dPercent, isToday: i === 6 };
    });
  };

  const filteredWorkouts = clientData?.workouts?.filter((w) => (w.day || "").toLowerCase() === activeDayView.toLowerCase()) || [];
  const filteredDiets = clientData?.diets || [];
  
  const completedWorkoutsCount = filteredWorkouts.filter((w) => checklist[activeDate]?.workouts?.[w.id]).length;
  const completedDietsCount = filteredDiets.filter((d) => checklist[activeDate]?.diets?.[d.id]).length;
  const workoutProgressPercent = filteredWorkouts.length > 0 ? Math.round((completedWorkoutsCount / filteredWorkouts.length) * 100) : 0;
  const dietProgressPercent = filteredDiets.length > 0 ? Math.round((completedDietsCount / filteredDiets.length) * 100) : 0;

  const weightProgress = calculateWeightProgress();
  const weeklyGraphData = generateWeeklyGraph();
  const currentStreak = calculateStreak();

  // 💥 NEW MOCK LOGIC FOR PLAN EXPIRY 💥
  // Replace this with actual DB logic later (e.g. clientData.planExpiryDate)
  const daysLeftInPlan = 4; // Example: Only 4 days left
  const isExpiringSoon = daysLeftInPlan <= 5;

  if (loading) return <div className="h-screen bg-[#020202] flex items-center justify-center text-emerald-500 font-black animate-pulse tracking-widest">CONNECTING TO HQ...</div>;

  const currentEx = filteredWorkouts[activeWorkoutIdx];

  return (
    <div className="min-h-screen bg-[#020202] text-white font-sans selection:bg-emerald-500/30 pb-24 overflow-x-hidden relative">
      
      {/* 🎬 CINEMATIC VIDEO MODAL */}
      <AnimatePresence>
        {expandedVideo && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} 
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center p-6">
            <button onClick={() => setExpandedVideo(null)} className="absolute top-8 right-8 text-white/50 hover:text-white transition-all bg-white/5 p-4 rounded-full"><X size={28} /></button>
            <div className="w-full max-w-3xl rounded-[3rem] overflow-hidden border border-emerald-500/30 shadow-[0_0_80px_rgba(16,185,129,0.2)] bg-black">
               {expandedVideo.includes(".mp4") ? <video src={expandedVideo} autoPlay loop controls playsInline className="w-full h-full object-cover max-h-[70vh]" /> : <img src={expandedVideo} className="w-full h-full object-contain max-h-[70vh]" />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🛑 REST TIMER OVERLAY */}
      <AnimatePresence>
        {restTimer > 0 && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} 
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center">
            <Timer size={60} className="text-emerald-500 mb-6 animate-pulse" />
            <h2 className="text-2xl font-black uppercase tracking-widest text-white/50 mb-2">Recovery Phase</h2>
            <div className="text-[120px] font-black italic text-emerald-500 leading-none tracking-tighter mb-10">{formatTime(restTimer)}</div>
            <button onClick={() => setRestTimer(0)} className="border border-white/20 text-white/50 hover:bg-white/10 hover:text-white px-10 py-4 rounded-full font-black uppercase tracking-widest transition-all">Skip Recovery</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER */}
      <header className="p-6 md:px-12 pt-10 flex justify-between items-start z-50 relative">
        <div>
          <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">
            Welcome, <span className="text-emerald-500">{name}</span>
          </h1>
          <p className="text-[10px] md:text-xs font-bold text-white/30 uppercase tracking-[0.4em] mt-2">Elite Command Center</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowPasswordModal(true)} className="p-3 bg-white/5 rounded-2xl border border-white/10 hover:border-emerald-500 transition-all"><Lock size={20} /></button>
          <button onClick={() => { localStorage.clear(); router.push("/login"); }} className="p-3 bg-white/5 rounded-2xl border border-white/10 hover:border-red-500 transition-all"><LogOut size={20} /></button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 md:px-12 space-y-8 mt-6">
        
        {/* 🚀 TOP ROW: COMPACT STREAK, PLAN & GOAL */}
        <section className="grid lg:grid-cols-12 gap-4">
          
          {/* Box 1: Compact Streak */}
          <div className={`lg:col-span-3 bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 shadow-xl relative flex flex-col items-center justify-center text-center group overflow-hidden ${currentStreak >= 3 ? 'border-emerald-500/30' : ''}`}>
             {currentStreak >= 3 && <div className="absolute inset-0 bg-emerald-500/5 blur-3xl rounded-full scale-150 animate-pulse" />}
             <Flame size={36} className={`${currentStreak >= 3 ? 'text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.8)]' : 'text-white/20'} mb-2 transition-all duration-500 group-hover:scale-110`} />
             <h3 className="text-3xl font-black italic tracking-tighter">{currentStreak} <span className="text-sm">DAYS</span></h3>
             <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mt-1">Active Streak</p>
          </div>

          {/* Box 2: Smart Plan Card (COMPACT & CONDITIONAL RENEW) */}
          <div className="lg:col-span-4 bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 shadow-xl flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute -top-4 -right-4 p-6 opacity-5 group-hover:scale-110 transition-transform"><Shield size={80}/></div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-white/50 flex items-center gap-2"><CreditCard size={12} className="text-emerald-500"/> Membership</h3>
                {/* Dynamic Tag based on expiry */}
                <span className={`text-[9px] font-bold px-2 py-1 rounded-md uppercase tracking-widest ${isExpiringSoon ? 'bg-red-500/20 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                  {isExpiringSoon ? `${daysLeftInPlan} Days Left` : 'Active'}
                </span>
              </div>
              <p className="text-xl font-black italic mt-1 truncate">{clientData?.plan || "Standard Access"}</p>
              <p className="text-[9px] text-white/40 mt-1 uppercase tracking-widest font-bold">Valid till: <span className="text-white/70">15 Mar, 2026</span></p>
            </div>
            {/* Conditional Button: Glows only if expiring soon */}
            <button 
              disabled={!isExpiringSoon}
              onClick={() => alert("Redirecting to secure payment gateway...")} 
              className={`w-full mt-4 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${isExpiringSoon ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:bg-emerald-400 active:scale-95' : 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'}`}
            >
              {isExpiringSoon ? "Renew Plan Now" : "Plan Secured"}
            </button>
          </div>

          {/* Box 3: Compact Goal Trajectory */}
          <div className="lg:col-span-5 bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 shadow-xl flex flex-col justify-between">
            <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-white/50 mb-2 flex items-center gap-2"><Target size={12} className="text-emerald-500"/> Goal Trajectory</h3>
            <div className="mt-4 mb-6 relative">
              <div className="flex justify-between text-[9px] font-black text-white/30 uppercase tracking-widest mb-2">
                <span>Start: {clientData?.initialWeight || 0}kg</span><span>Goal: {clientData?.goalWeight || 0}kg</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full relative border border-white/10">
                <motion.div initial={{ width: 0 }} animate={{ width: `${weightProgress}%` }} transition={{ duration: 1.5, ease: "easeOut" }} className="absolute top-0 left-0 h-full bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)]" />
                <motion.div initial={{ left: 0 }} animate={{ left: `calc(${weightProgress}% - 6px)` }} transition={{ duration: 1.5, ease: "easeOut" }} className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_white] border-2 border-emerald-500" />
              </div>
            </div>
            <div className="flex gap-3">
              <input type="number" value={weightInput} onChange={(e) => setWeightInput(e.target.value)} className="w-1/2 bg-black/40 border border-white/10 rounded-xl p-3 text-lg font-bold italic outline-none focus:border-emerald-500 transition-all text-white" placeholder="Mass KG" />
              <button onClick={handleUpdateWeight} disabled={savingWeight} className="flex-1 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-black border border-emerald-500/30 rounded-xl font-black uppercase text-[9px] tracking-widest transition-all">
                {savingWeight ? "Logging..." : "Log Mass"}
              </button>
            </div>
          </div>
        </section>

        {/* 💥 MID ROW: DUAL-METRIC GRAPH & TODAY'S EXECUTION HUD 💥 */}
        <section className="grid lg:grid-cols-12 gap-6">
          
          {/* Equalizer Graph */}
          <div className="lg:col-span-7 bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform"><Activity size={100}/></div>
            
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50 flex items-center gap-2"><Activity size={14} className="text-emerald-500"/> Protocol Execution</h3>
              <div className="flex gap-3">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]"></div><span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Workout</span></div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-white/70 shadow-[0_0_5px_white]"></div><span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Diet</span></div>
              </div>
            </div>
            
            <div className="flex justify-between items-end h-32 mt-4 gap-2 relative z-10">
              {weeklyGraphData.map((day, i) => (
                <div key={i} className="flex flex-col items-center gap-3 w-full">
                  <div className="flex gap-1.5 w-full justify-center h-28 items-end">
                    <div className="w-2.5 h-full bg-white/5 rounded-t-full relative overflow-hidden flex items-end">
                      <motion.div initial={{ height: 0 }} animate={{ height: `${day.wPercent}%` }} transition={{ duration: 1, delay: i * 0.1 }}
                        className={`w-full rounded-t-full ${day.wPercent === 100 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]' : day.wPercent > 0 ? 'bg-emerald-500/50' : 'bg-transparent'}`} 
                      />
                    </div>
                    <div className="w-2.5 h-full bg-white/5 rounded-t-full relative overflow-hidden flex items-end">
                      <motion.div initial={{ height: 0 }} animate={{ height: `${day.dPercent}%` }} transition={{ duration: 1, delay: i * 0.1 + 0.2 }}
                        className={`w-full rounded-t-full ${day.dPercent === 100 ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]' : day.dPercent > 0 ? 'bg-white/40' : 'bg-transparent'}`} 
                      />
                    </div>
                  </div>
                  <p className={`text-[9px] font-black uppercase tracking-widest ${day.isToday ? 'text-emerald-500' : 'text-white/30'}`}>{day.dayName}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Execution Rings */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <CircularHUD percent={workoutProgressPercent} color="#10b981" icon={<Dumbbell size={24}/>} label="Workout Execution" value={completedWorkoutsCount} subValue={`/ ${filteredWorkouts.length}`} />
            <CircularHUD percent={dietProgressPercent} color="#ffffff" icon={<Utensils size={24}/>} label="Diet Protocol" value={completedDietsCount} subValue={`/ ${filteredDiets.length}`} />
          </div>

        </section>

        {/* INITIAL WEIGHT OVERRIDE */}
        {!clientData?.initialWeight && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-[2rem] flex gap-4 items-center justify-between">
            <p className="text-xs font-bold text-emerald-500">Initialize starting weight to activate trajectory.</p>
            <div className="flex gap-2">
              <input type="number" value={initialWeightInput} onChange={e => setInitialWeightInput(e.target.value)} className="w-24 bg-black/50 border border-emerald-500/20 rounded-xl p-2 text-center font-bold outline-none text-white" placeholder="KG" />
              <button onClick={handleSetInitialWeight} disabled={savingInitialWeight} className="bg-emerald-500 text-black px-4 rounded-xl font-black text-[10px] uppercase">Set</button>
            </div>
          </div>
        )}

        {/* 📅 MISSION SCHEDULER */}
        <section>
          <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
            {DAYS.map((day) => (
              <button key={day} onClick={() => { setActiveDayView(day); setActiveDate(getISODateForWeekdayInCurrentWeek(day)); setActiveWorkoutIdx(0); }}
                className={`px-8 py-4 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 ${
                  activeDayView === day ? "bg-emerald-500 text-black border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]" : "bg-white/5 text-white/30 border-transparent hover:border-white/10"
                }`}>
                {day}
              </button>
            ))}
          </div>
        </section>

        {/* 🏋️ ELITE WORKOUT PLAYER */}
        {filteredWorkouts.length > 0 ? (
          <section className="bg-white/[0.02] border border-white/5 p-6 md:p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
             <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-3"><Zap className="text-emerald-500"/><h3 className="text-2xl font-black italic uppercase tracking-tight">Active Protocol</h3></div>
                <div className="bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20"><p className="text-[10px] font-black tracking-widest text-emerald-500">{activeWorkoutIdx + 1} OF {filteredWorkouts.length}</p></div>
             </div>

             <div className="grid lg:grid-cols-12 gap-10 items-start relative z-10">
                <div className="lg:col-span-7 relative group cursor-pointer" onClick={() => currentEx.gifUrl && setExpandedVideo(currentEx.gifUrl)}>
                   <div className="aspect-square md:aspect-video rounded-[2.5rem] overflow-hidden bg-black border border-white/10 relative shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all group-hover:border-emerald-500/50">
                      <AnimatePresence mode="wait">
                         <motion.div key={currentEx.id} initial={{opacity:0, filter:"blur(10px)"}} animate={{opacity:1, filter:"blur(0px)"}} exit={{opacity:0}} className="w-full h-full">
                           {currentEx.gifUrl ? (
                             currentEx.gifUrl.includes(".mp4") ? <video src={currentEx.gifUrl} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" /> : <img src={currentEx.gifUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                           ) : (
                             <div className="w-full h-full flex items-center justify-center text-white/5"><Dumbbell size={100}/></div>
                           )}
                         </motion.div>
                      </AnimatePresence>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
                      {currentEx.gifUrl && (
                         <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-black/50 p-4 rounded-full backdrop-blur-md border border-white/20 text-white"><PlayCircle size={40} className="text-emerald-500" /></div>
                         </div>
                      )}
                      <div className="absolute bottom-8 left-8 right-8 pointer-events-none">
                         <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter leading-none">{currentEx.exercise}</h2>
                      </div>
                   </div>
                </div>

                <div className="lg:col-span-5 flex flex-col h-full justify-between space-y-6">
                   <div className="grid grid-cols-3 gap-3">
                     <div className="bg-white/5 border border-white/10 rounded-[1.5rem] p-5 text-center"><p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Sets</p><p className="text-3xl font-black italic text-emerald-500">{currentEx.sets}</p></div>
                     <div className="bg-white/5 border border-white/10 rounded-[1.5rem] p-5 text-center"><p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Reps</p><p className="text-3xl font-black italic text-emerald-500">{currentEx.reps}</p></div>
                     <div className="bg-white/5 border border-white/10 rounded-[1.5rem] p-5 text-center"><p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Weight</p><p className="text-3xl font-black italic text-white">{currentEx.weight || "-"}</p></div>
                   </div>

                   {currentEx.insight && (
                     <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-[1.5rem]">
                       <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2"><Flame size={12} className="inline mr-1 -mt-1"/> Trainer's Note</p>
                       <p className="text-white/60 italic text-sm">"{currentEx.insight}"</p>
                     </div>
                   )}

                   <div className="space-y-4 pt-4">
                     <button onClick={() => handleToggleItem(currentEx.id, "workout")} className={`w-full py-6 rounded-3xl font-black uppercase text-sm tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${checklist[activeDate]?.workouts?.[currentEx.id] ? "bg-white/5 text-emerald-500 border border-emerald-500/30" : "bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_20px_40px_rgba(16,185,129,0.3)] active:scale-95"}`}>
                        <CheckCircle2 size={24} /> {checklist[activeDate]?.workouts?.[currentEx.id] ? "Done" : "Mark as Done"}
                     </button>
                     <div className="flex gap-4">
                        <button onClick={() => setActiveWorkoutIdx(prev => prev - 1)} disabled={activeWorkoutIdx === 0} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 py-5 rounded-3xl flex justify-center disabled:opacity-20 transition-all"><ChevronLeft /></button>
                        <button onClick={() => setActiveWorkoutIdx(prev => prev + 1)} disabled={activeWorkoutIdx === filteredWorkouts.length - 1} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 py-5 rounded-3xl flex justify-center disabled:opacity-20 transition-all"><ChevronRight /></button>
                     </div>
                   </div>
                </div>
             </div>
          </section>
        ) : (
          <div className="text-center py-24 bg-white/[0.02] border border-white/5 rounded-[3rem] shadow-2xl">
             <h2 className="text-3xl font-black italic text-white/30 uppercase tracking-widest">Rest & Recover</h2>
          </div>
        )}

        {/* 🥗 NUTRITION FUEL */}
        <section className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-8 shadow-2xl">
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50 mb-6 flex items-center gap-2"><Utensils size={14} className="text-emerald-500"/> Diet Protocol</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {filteredDiets.map((d) => {
              const isDone = checklist[activeDate]?.diets?.[d.id] || false;
              return (
                <div key={d.id} onClick={() => handleToggleItem(d.id, "diet")} className={`p-5 rounded-[1.5rem] border flex items-center justify-between cursor-pointer transition-all ${isDone ? "bg-emerald-500/5 border-emerald-500/20" : "bg-white/5 border-white/10 hover:border-emerald-500/50"}`}>
                    <div>
                      <p className="text-[10px] font-black uppercase text-emerald-500 tracking-widest mb-1">{d.time}</p>
                      <p className={`font-bold ${isDone ? "text-white/40 line-through" : "text-white"}`}>{d.meal}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-black italic text-white/30">{d.calories} KCAL</span>
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${isDone ? "border-emerald-500 bg-emerald-500" : "border-white/20"}`}>
                        {isDone && <CheckCircle2 size={16} className="text-black" />}
                      </div>
                    </div>
                </div>
              )
            })}
          </div>
        </section>

      </main>

      {/* 🔐 SECRETS MODAL */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-6">
             <div className="bg-[#0b0b0b] border border-emerald-500/30 p-10 rounded-[3rem] w-full max-w-md shadow-[0_0_50px_rgba(16,185,129,0.1)]">
               <div className="flex justify-between items-center mb-8">
                 <h3 className="text-2xl font-black italic text-emerald-500 uppercase tracking-tighter">Security Vault</h3>
                 <button onClick={() => setShowPasswordModal(false)} className="text-white/50 hover:text-white"><X/></button>
               </div>
               <div className="space-y-4">
                 <input type="password" placeholder="Current Password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} className="w-full p-5 bg-white/5 rounded-2xl outline-none focus:border-emerald-500 border border-white/10 text-white" />
                 <input type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full p-5 bg-white/5 rounded-2xl outline-none focus:border-emerald-500 border border-white/10 text-white" />
                 <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full p-5 bg-white/5 rounded-2xl outline-none focus:border-emerald-500 border border-white/10 text-white" />
                 
                 {passwordError && <p className="text-red-500 text-xs font-bold uppercase tracking-widest">{passwordError}</p>}
                 
                 <button onClick={handleChangePassword} disabled={savingPassword} className="w-full py-5 mt-4 bg-emerald-500 text-black font-black uppercase rounded-2xl tracking-widest active:scale-95 transition-all shadow-[0_10px_30px_rgba(16,185,129,0.2)] disabled:opacity-50">
                   {savingPassword ? "Updating..." : "Update Vault"}
                 </button>
               </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

// 🟢 CUSTOM COMPONENT: CIRCULAR HUD
function CircularHUD({ percent, color, icon, label, value, subValue }: any) {
  const dashArray = 126; 
  const dashOffset = dashArray - (dashArray * percent) / 100;
  return (
    <div className="flex flex-1 items-center gap-6 bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 shadow-xl relative overflow-hidden group">
      <div className="absolute inset-0 opacity-10 blur-2xl transition-all group-hover:opacity-20" style={{ backgroundColor: color }} />
      <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
        <svg className="absolute w-full h-full -rotate-90 drop-shadow-xl" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="20" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
          <circle cx="24" cy="24" r="20" fill="transparent" stroke={color} strokeWidth="4" strokeDasharray={dashArray} strokeDashoffset={dashOffset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
        </svg>
        <div className="absolute" style={{ color }}>{icon}</div>
      </div>
      <div>
        <h4 className="text-white/50 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{label}</h4>
        <p className="text-3xl font-black italic text-white">{value} <span className="text-sm not-italic text-white/30">{subValue}</span></p>
      </div>
    </div>
  );
}