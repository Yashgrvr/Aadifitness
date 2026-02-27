"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Plus, Pencil, Trash2, Loader2, X, Utensils, Dumbbell, Zap } from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const emptyWeek: any = { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [] };
const inputStyle = "bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-emerald-500/50 outline-none transition-all placeholder:text-white/20 text-white";

export default function TrainerDashboard() {
  const [trainerId, setTrainerId] = useState("");
  const [active, setActive] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [week, setWeek] = useState(emptyWeek);
  const [day, setDay] = useState("Monday");
  const [editingDiet, setEditingDiet] = useState<any>(null);
  const [showAddDiet, setShowAddDiet] = useState(false);
  const [newDiet, setNewDiet] = useState({ time: "", meal: "", calories: "" });
  const [uploadingRow, setUploadingRow] = useState<number | null>(null);
  const [syncing, setSyncing] = useState(false);

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
    if (ac.clients?.length) refreshClient(ac.clients[0].id);
  }

  async function refreshClient(id: string) {
    const r = await fetch(`/api/clients/${id}`);
    const d = await r.json();
    setSelected(d.client);

    // ✅ State load karte waqt fresh structure banao
    const organized: any = { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [] };
    d.client.workouts?.forEach((w: any) => {
      if (organized[w.day]) {
        organized[w.day].push({
          exercise: w.exercise,
          sets: w.sets,
          reps: w.reps,
          weight: w.weight,
          gifUrl: w.gifUrl,
          insight: w.insight || ""
        });
      }
    });
    setWeek(organized);
  }

  const updateRow = (i: number, key: string, val: string) => {
    const u = [...week[day]];
    u[i] = { ...u[i], [key]: val };
    setWeek({ ...week, [day]: u });
  };

  // 🔥 YE HAI ASLI GAME CHANGER LOGIC
  const commitWeek = async () => {
    if (!selected?.id) return;
    setSyncing(true);

    // 1. Data ko strictly format karo (No IDs, No junk)
    const payload: any = {};
    DAYS.forEach(d => {
      payload[d] = week[d]
        .filter((ex: any) => ex.exercise.trim() !== "") // Khali line mat bhejo
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
        alert("Mission Updated!✅");
        // 2. Refresh client taaki database se clean single copy load ho
        await refreshClient(selected.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white flex selection:bg-emerald-500/30">
      
      {/* SIDEBAR */}
      <aside className="w-80 bg-black border-r border-white/5 p-6 flex flex-col h-screen sticky top-0 overflow-y-auto">
        <div className="mb-12 flex items-center gap-3">
          <Zap size={24} className="text-emerald-500 fill-current" />
          <h1 className="text-3xl font-black italic tracking-tighter">FitVibs</h1>
        </div>

        <div className="space-y-6">
          <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">Active Warriors</p>
          {active.map(c => (
            <button key={c.id} onClick={() => refreshClient(c.id)} className={`w-full px-5 py-4 rounded-2xl border text-left transition-all ${selected?.id === c.id ? "bg-emerald-500/10 border-emerald-500 text-emerald-400" : "bg-white/5 border-white/5 hover:bg-white/10"}`}>
              <p className="font-bold text-sm">{c.name}</p>
            </button>
          ))}
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-12 overflow-y-auto space-y-12">
        {selected && (
          <div className="animate-fadeIn">
            <header className="mb-12">
              <h2 className="text-5xl font-black italic tracking-tighter">Protocol: <span className="text-emerald-500">{selected.name}</span></h2>
            </header>

            {/* WORKOUT */}
            <section className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 space-y-8 shadow-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <Dumbbell className="text-emerald-500" size={30} />
                  <h3 className="text-2xl font-black italic">Workout Planner</h3>
                </div>
                <div className="flex gap-1 bg-black p-1.5 rounded-2xl border border-white/10">
                  {DAYS.map(d => (
                    <button key={d} onClick={() => setDay(d)} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${day === d ? "bg-emerald-500 text-black" : "text-white/20"}`}>
                      {d.substring(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                {week[day].map((r: any, i: number) => (
                  <motion.div key={i} layout className="bg-white/5 p-6 rounded-[2.5rem] border border-white/5 hover:border-emerald-500/20">
                    <div className="grid grid-cols-12 gap-4 items-end">
                      <div className="col-span-5">
                        <p className="text-[10px] font-black text-emerald-500/50 uppercase mb-2">Exercise</p>
                        <input className={inputStyle + " w-full"} value={r.exercise} onChange={e => updateRow(i, "exercise", e.target.value)} />
                      </div>
                      <div className="col-span-2">
                        <p className="text-[10px] font-black text-white/20 uppercase mb-2 text-center">Sets</p>
                        <input className={inputStyle + " w-full text-center"} value={r.sets} onChange={e => updateRow(i, "sets", e.target.value)} />
                      </div>
                      <div className="col-span-2">
                        <p className="text-[10px] font-black text-white/20 uppercase mb-2 text-center">Reps</p>
                        <input className={inputStyle + " w-full text-center"} value={r.reps} onChange={e => updateRow(i, "reps", e.target.value)} />
                      </div>
                      <div className="col-span-2">
                        <p className="text-[10px] font-black text-emerald-500/40 uppercase mb-2 text-center">Weight</p>
                        <input className={inputStyle + " w-full text-center text-emerald-400"} value={r.weight} onChange={e => updateRow(i, "weight", e.target.value)} />
                      </div>
                      <div className="col-span-1 flex justify-center pb-3">
                        <button onClick={() => { const u = [...week[day]]; u.splice(i, 1); setWeek({ ...week, [day]: u }); }} className="text-white/10 hover:text-red-500"><Trash2 size={20} /></button>
                      </div>
                    </div>

                    <div className="grid grid-cols-12 gap-4 mt-6 pt-6 border-t border-white/5 items-center">
                      <div className="col-span-8">
                        <p className="text-[10px] font-black text-white/10 uppercase mb-2">Trainer's Insight</p>
                        <input className={inputStyle + " w-full italic text-white/40"} value={r.insight} onChange={e => updateRow(i, "insight", e.target.value)} placeholder="Note..." />
                      </div>
                      <div className="col-span-4 flex items-center gap-3">
                        <label className="flex-1 flex items-center justify-center gap-2 bg-emerald-500/5 border border-emerald-500/10 py-4 rounded-2xl cursor-pointer hover:bg-emerald-500/10">
                          {uploadingRow === i ? <Loader2 className="animate-spin text-emerald-400" /> : <><Upload size={16} className="text-emerald-500" /><span className="text-[10px] font-black text-emerald-500 uppercase">Media</span></>}
                          <input hidden type="file" onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if(!file) return;
                            setUploadingRow(i);
                            const form = new FormData(); form.append("file", file); form.append("upload_preset", "fitvibs");
                            const res = await fetch("https://api.cloudinary.com/v1_1/dvsfcvbam/auto/upload", { method: "POST", body: form });
                            const d = await res.json();
                            updateRow(i, "gifUrl", d.secure_url);
                            setUploadingRow(null);
                          }} />
                        </label>
                        {r.gifUrl && (
                          <div className="w-14 h-14 rounded-xl border border-emerald-500/20 overflow-hidden">
                            {r.gifUrl.includes(".mp4") ? <video src={r.gifUrl} className="w-full h-full object-cover" autoPlay loop muted playsInline /> : <img src={r.gifUrl} className="w-full h-full object-cover" />}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex gap-4 pt-4">
                <button onClick={() => setWeek({ ...week, [day]: [...week[day], { exercise: "", sets: "", reps: "", weight: "", gifUrl: "", insight: "" }] })} className="flex-1 py-5 border border-dashed border-white/10 rounded-3xl text-[10px] font-black text-white/20 hover:text-emerald-500">+ Add Protocol</button>
                <button onClick={commitWeek} disabled={syncing} className="flex-[2] bg-emerald-500 text-black py-5 rounded-3xl font-black uppercase text-xs shadow-xl active:scale-95 disabled:opacity-50">
                  {syncing ? <Loader2 className="animate-spin" /> : "Commit System Protocol"}
                </button>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}