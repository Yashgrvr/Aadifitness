"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Trash2, Loader2, Dumbbell, Zap, TrendingUp, Utensils } from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const emptyWeek: any = { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [] };
const inputStyle = "bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-emerald-500/50 outline-none transition-all placeholder:text-white/20 text-white";

export default function TrainerDashboard() {
  const [trainerId, setTrainerId] = useState("");
  const [active, setActive] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  
  // Workout State
  const [week, setWeek] = useState(emptyWeek);
  const [day, setDay] = useState("Monday");
  const [uploadingRow, setUploadingRow] = useState<number | null>(null);
  const [syncing, setSyncing] = useState(false);

  // Diet State (Yeh add kiya gaya hai)
  const [diets, setDiets] = useState<any[]>([]);
  const [syncingDiet, setSyncingDiet] = useState(false);

  useEffect(() => {
    const id = localStorage.getItem("trainerId");
    if (!id) window.location.href = "/login";
    setTrainerId(id!);
    loadSidebar(id!);
  }, []);

  async function loadSidebar(id: string) {
    const p = await fetch("/api/trainer/pending-clients", { headers: { "x-trainer-id": id } });
    const pc = await p.json();
    setPending(pc.clients || []);

    const a = await fetch(`/api/clients?trainerId=${id}`);
    const ac = await a.json();
    setActive(ac.clients || []);
    
    if (ac.clients?.length > 0) refreshClient(ac.clients[0].id);
  }

  async function refreshClient(id: string) {
    const r = await fetch(`/api/clients/${id}`);
    const d = await r.json();
    
    if (!d.client) return;
    
    setSelected(d.client);

    // Workout Data
    const organized: any = { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [] };
    if (d.client.workouts) {
      d.client.workouts.forEach((w: any) => {
        if (organized[w.day]) {
          organized[w.day].push({ ...w });
        }
      });
    }
    setWeek(organized);

    // Diet Data (Yeh add kiya gaya hai)
    setDiets(d.client.diets || []);
  }

  const updateRow = (i: number, key: string, val: string) => {
    const u = [...week[day]];
    u[i] = { ...u[i], [key]: val };
    setWeek({ ...week, [day]: u });
  };

  const updateDietRow = (i: number, key: string, val: string) => {
    const d = [...diets];
    d[i] = { ...d[i], [key]: val };
    setDiets(d);
  };

  const commitWeek = async () => {
    if (!selected?.id) return;
    setSyncing(true);

    const payload: any = {};
    DAYS.forEach(d => {
      payload[d] = week[d]
        .filter((ex: any) => ex.exercise?.trim() !== "")
        .map((ex: any) => ({
          exercise: ex.exercise,
          sets: String(ex.sets || "0"),
          reps: String(ex.reps || "0"),
          weight: String(ex.weight || "0"),
          gifUrl: ex.gifUrl || "",
          insight: ex.insight || ""
        }));
    });

    try {
      const res = await fetch("/api/clients/workout/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: selected.id, weeklyData: payload })
      });

      if (res.ok) {
        alert("Workout System Updated! ✅");
        await refreshClient(selected.id);
      }
    } catch (err) {
      console.error("Sync Error:", err);
    } finally {
      setSyncing(false);
    }
  };

  const commitDiet = async () => {
    if (!selected?.id) return;
    setSyncingDiet(true);

    const validDiets = diets
      .filter(d => d.meal?.trim() !== "")
      .map(d => ({
        time: d.time || "",
        meal: d.meal,
        calories: Number(d.calories) || 0
      }));

    try {
      const res = await fetch("/api/clients/diet/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: selected.id, dietData: validDiets })
      });

      if (res.ok) {
        alert("Nutrition Protocol Updated! 🍎");
        await refreshClient(selected.id);
      } else {
        alert("Diet Route missing! Pehle backend mein /api/clients/diet/bulk banao.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSyncingDiet(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white flex selection:bg-emerald-500/30 font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-80 bg-black border-r border-white/5 p-6 flex flex-col h-screen sticky top-0 overflow-y-auto z-50">
        <div className="mb-12 flex items-center gap-3 px-2">
          <Zap size={28} className="text-emerald-500 fill-current" />
          <h1 className="text-3xl font-black italic tracking-tighter uppercase">FitVibs</h1>
        </div>

        <div className="space-y-8">
          <section>
            <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4 px-2 opacity-70">Active Roster</p>
            <div className="space-y-2">
              {active.map(c => (
                <button 
                  key={c.id} 
                  onClick={() => refreshClient(c.id)} 
                  className={`w-full px-5 py-4 rounded-2xl border text-left transition-all duration-300 ${selected?.id === c.id ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-lg shadow-emerald-500/5" : "bg-white/[0.02] border-white/5 hover:bg-white/5"}`}
                >
                  <p className="font-bold text-sm">{c.name}</p>
                  <p className="text-[10px] text-white/40 mt-1">{c.fitnessGoal?.replace('_', ' ') || 'General'}</p>
                </button>
              ))}
            </div>
          </section>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-12 overflow-y-auto relative bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.03),_transparent)]">
        {selected ? (
          <div className="max-w-5xl mx-auto animate-in fade-in duration-700">
            <header className="mb-16 flex justify-between items-end">
              <div>
                <p className="text-emerald-500 text-xs font-black uppercase tracking-widest mb-2">Protocol Deployment</p>
                <h2 className="text-6xl font-black italic tracking-tighter uppercase">
                  Warrior: <span className="text-emerald-500">{selected.name}</span>
                </h2>
              </div>
              <div className="text-right pb-2">
                <p className="text-white/20 text-[10px] font-black uppercase">Goal Weight</p>
                <p className="text-3xl font-black text-white">{selected.goalWeight}kg</p>
              </div>
            </header>

            {/* WORKOUT INTERFACE */}
            <section className="bg-white/[0.03] border border-white/10 rounded-[3.5rem] p-10 space-y-10 shadow-2xl backdrop-blur-sm mb-12">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                    <Dumbbell className="text-emerald-500" size={24} />
                  </div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tight">System Planner</h3>
                </div>
                
                {/* DAY SELECTOR */}
                <div className="flex flex-wrap gap-1 bg-black p-1.5 rounded-2xl border border-white/10">
                  {DAYS.map(d => (
                    <button 
                      key={d} 
                      onClick={() => setDay(d)} 
                      className={`px-5 py-2.5 rounded-xl text-[10px] font-black transition-all duration-300 ${day === d ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" : "text-white/30 hover:text-white"}`}
                    >
                      {d.substring(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              {/* DYNAMIC ROWS FOR WORKOUT */}
              <div className="space-y-6">
                <AnimatePresence>
                  {week[day].map((r: any, i: number) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      className="bg-white/[0.02] p-8 rounded-[2.5rem] border border-white/5 hover:border-emerald-500/20 transition-all group"
                    >
                      <div className="grid grid-cols-12 gap-6 items-end">
                        <div className="col-span-12 lg:col-span-5">
                          <p className="text-[10px] font-black text-emerald-500/50 uppercase mb-3 ml-1 tracking-widest">Protocol Name</p>
                          <input className={inputStyle + " w-full bg-black/40"} value={r.exercise} onChange={e => updateRow(i, "exercise", e.target.value)} placeholder="e.g. Incline Bench Press" />
                        </div>
                        <div className="col-span-4 lg:col-span-2">
                          <p className="text-[10px] font-black text-white/20 uppercase mb-3 text-center tracking-widest">Sets</p>
                          <input className={inputStyle + " w-full text-center bg-black/40"} value={r.sets} onChange={e => updateRow(i, "sets", e.target.value)} />
                        </div>
                        <div className="col-span-4 lg:col-span-2">
                          <p className="text-[10px] font-black text-white/20 uppercase mb-3 text-center tracking-widest">Reps</p>
                          <input className={inputStyle + " w-full text-center bg-black/40"} value={r.reps} onChange={e => updateRow(i, "reps", e.target.value)} />
                        </div>
                        <div className="col-span-3 lg:col-span-2">
                          <p className="text-[10px] font-black text-emerald-500/40 uppercase mb-3 text-center tracking-widest">Load (kg)</p>
                          <input className={inputStyle + " w-full text-center text-emerald-400 bg-black/40 font-bold"} value={r.weight} onChange={e => updateRow(i, "weight", e.target.value)} />
                        </div>
                        <div className="col-span-1 flex justify-center pb-3">
                          <button onClick={() => { const u = [...week[day]]; u.splice(i, 1); setWeek({ ...week, [day]: u }); }} className="w-10 h-10 rounded-xl flex items-center justify-center text-white/10 hover:bg-red-500/10 hover:text-red-500 transition-all"><Trash2 size={18} /></button>
                        </div>
                      </div>

                      <div className="grid grid-cols-12 gap-6 mt-8 pt-8 border-t border-white/5 items-center">
                        <div className="col-span-12 lg:col-span-8">
                          <p className="text-[10px] font-black text-white/10 uppercase mb-3 ml-1 tracking-widest">Performance Insight</p>
                          <input className={inputStyle + " w-full italic text-white/50 bg-transparent border-dashed"} value={r.insight} onChange={e => updateRow(i, "insight", e.target.value)} placeholder="Keep elbows tucked..." />
                        </div>
                        <div className="col-span-12 lg:col-span-4 flex items-center gap-4">
                          <label className="flex-1 flex items-center justify-center gap-3 bg-emerald-500/5 border border-emerald-500/10 py-4 rounded-2xl cursor-pointer hover:bg-emerald-500/10 transition-all">
                            {uploadingRow === i ? <Loader2 className="animate-spin text-emerald-400" /> : <><Upload size={16} className="text-emerald-500" /><span className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter">Attach Media</span></>}
                            <input hidden type="file" accept="image/*,video/*" onChange={async (e) => {
                              const file = e.target.files?.[0]; if(!file) return;
                              setUploadingRow(i);
                              const form = new FormData(); form.append("file", file); form.append("upload_preset", "fitvibs");
                              const res = await fetch("https://api.cloudinary.com/v1_1/dvsfcvbam/auto/upload", { method: "POST", body: form });
                              const d = await res.json();
                              updateRow(i, "gifUrl", d.secure_url);
                              setUploadingRow(null);
                            }} />
                          </label>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="flex flex-col sm:flex-row gap-5 pt-6">
                <button 
                  onClick={() => setWeek({ ...week, [day]: [...week[day], { exercise: "", sets: "", reps: "", weight: "", gifUrl: "", insight: "" }] })} 
                  className="flex-1 py-6 border border-dashed border-white/10 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] text-white/20 hover:text-emerald-500 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all"
                >
                  + Add Protocol Row
                </button>
                <button 
                  onClick={commitWeek} 
                  disabled={syncing} 
                  className="flex-[2] bg-emerald-500 text-black py-6 rounded-3xl font-black uppercase text-sm shadow-2xl shadow-emerald-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {syncing ? <Loader2 className="animate-spin" /> : <><TrendingUp size={18} /> Update Workout Architecture</>}
                </button>
              </div>
            </section>

            {/* DIET INTERFACE */}
            <section className="bg-white/[0.03] border border-white/10 rounded-[3.5rem] p-10 space-y-10 shadow-2xl backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                  <Utensils className="text-emerald-500" size={24} />
                </div>
                <h3 className="text-2xl font-black italic uppercase tracking-tight">Nutrition Protocol</h3>
              </div>

              <div className="space-y-6">
                <AnimatePresence>
                  {diets.map((r: any, i: number) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      className="bg-white/[0.02] p-8 rounded-[2.5rem] border border-white/5 hover:border-emerald-500/20 transition-all group"
                    >
                      <div className="grid grid-cols-12 gap-6 items-end">
                        <div className="col-span-12 lg:col-span-3">
                          <p className="text-[10px] font-black text-emerald-500/50 uppercase mb-3 ml-1 tracking-widest">Time</p>
                          <input className={inputStyle + " w-full bg-black/40"} value={r.time} onChange={e => updateDietRow(i, "time", e.target.value)} placeholder="e.g. 08:00 AM" />
                        </div>
                        <div className="col-span-12 lg:col-span-6">
                          <p className="text-[10px] font-black text-white/20 uppercase mb-3 ml-1 tracking-widest">Meal Details</p>
                          <input className={inputStyle + " w-full bg-black/40"} value={r.meal} onChange={e => updateDietRow(i, "meal", e.target.value)} placeholder="e.g. 4 Egg Whites, 1 Toast" />
                        </div>
                        <div className="col-span-8 lg:col-span-2">
                          <p className="text-[10px] font-black text-emerald-500/40 uppercase mb-3 text-center tracking-widest">Calories</p>
                          <input type="number" className={inputStyle + " w-full text-center text-emerald-400 bg-black/40 font-bold"} value={r.calories} onChange={e => updateDietRow(i, "calories", e.target.value)} />
                        </div>
                        <div className="col-span-4 lg:col-span-1 flex justify-center pb-3">
                          <button onClick={() => { const d = [...diets]; d.splice(i, 1); setDiets(d); }} className="w-10 h-10 rounded-xl flex items-center justify-center text-white/10 hover:bg-red-500/10 hover:text-red-500 transition-all"><Trash2 size={18} /></button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="flex flex-col sm:flex-row gap-5 pt-6">
                <button 
                  onClick={() => setDiets([...diets, { time: "", meal: "", calories: "" }])} 
                  className="flex-1 py-6 border border-dashed border-white/10 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] text-white/20 hover:text-emerald-500 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all"
                >
                  + Add Meal
                </button>
                <button 
                  onClick={commitDiet} 
                  disabled={syncingDiet} 
                  className="flex-[2] bg-transparent border-2 border-emerald-500 text-emerald-500 py-6 rounded-3xl font-black uppercase text-sm active:scale-[0.98] transition-all hover:bg-emerald-500/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {syncingDiet ? <Loader2 className="animate-spin" /> : <><Utensils size={18} /> Sync Nutrition Data</>}
                </button>
              </div>
            </section>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-30">
            <Zap size={80} className="text-white/20 animate-pulse" />
            <p className="text-xl font-black uppercase tracking-[0.3em] italic">Awaiting Warrior Selection</p>
          </div>
        )}
      </main>
    </div>
  );
}