"use client";
import { useState } from "react";
import { Upload, Plus, Trash2, Loader2 } from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function WeeklyWorkoutPlanner({ clientId }: { clientId: string }) {
  const [activeDay, setActiveDay] = useState("Monday");
  const [loading, setLoading] = useState(false);
  const [uploadingRow, setUploadingRow] = useState<number | null>(null);
  const [weeklyData, setWeeklyData] = useState<any>({
    Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: []
  });

  const updateRow = (index: number, key: string, val: string) => {
    const updated = [...weeklyData[activeDay]];
    updated[index][key] = val;
    setWeeklyData({ ...weeklyData, [activeDay]: updated });
  };

  const addExercise = () => {
    setWeeklyData({
      ...weeklyData,
      [activeDay]: [...weeklyData[activeDay], { exercise: "", sets: "", reps: "", weight: "", gifUrl: "", insight: "" }]
    });
  };

  const deleteRow = (index: number) => {
    const updated = [...weeklyData[activeDay]];
    updated.splice(index, 1);
    setWeeklyData({ ...weeklyData, [activeDay]: updated });
  };

  const handleUpload = async (e: any, index: number) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingRow(index);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "fitvibs"); 

    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/dvsfcvbam/auto/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      updateRow(index, "gifUrl", data.secure_url);
    } catch (err) {
      alert("Upload failed!");
    } finally {
      setUploadingRow(null);
    }
  };

  const saveAll = async () => {
    setLoading(true);
    const res = await fetch("/api/clients/workout/bulk", {
      method: "POST",
      body: JSON.stringify({ clientId, weeklyData })
    });
    if (res.ok) alert("Protocol Synced! No duplicates. ✅");
    setLoading(false);
  };

  const inputStyle = "bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-emerald-500 outline-none transition-all placeholder:text-white/20 text-white";

  return (
    <div className="bg-[#050505] border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-3xl">
      {/* Day Tabs - Emerald Theme */}
      <div className="flex space-x-2 overflow-x-auto mb-8 pb-2">
        {DAYS.map(day => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeDay === day ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'bg-white/5 text-white/40 hover:text-white'
            }`}
          >
            {day.substring(0, 3)}
          </button>
        ))}
      </div>

      {/* Exercise Rows */}
      <div className="space-y-4">
        {weeklyData[activeDay].map((ex: any, i: number) => (
          <div key={i} className="grid grid-cols-12 gap-3 bg-black/40 p-5 rounded-2xl border border-white/5 items-center group hover:border-emerald-500/30 transition-all">
            <div className="col-span-3">
              <input 
                className={inputStyle + " w-full"}
                placeholder="Exercise Name"
                value={ex.exercise}
                onChange={(e) => updateRow(i, "exercise", e.target.value)}
              />
            </div>
            <input placeholder="S" className={inputStyle + " col-span-1 text-center"} value={ex.sets} onChange={(e) => updateRow(i, "sets", e.target.value)} />
            <input placeholder="R" className={inputStyle + " col-span-1 text-center"} value={ex.reps} onChange={(e) => updateRow(i, "reps", e.target.value)} />
            <input placeholder="KG" className={inputStyle + " col-span-1 text-center"} value={ex.weight} onChange={(e) => updateRow(i, "weight", e.target.value)} />
            
            <input 
                className={inputStyle + " col-span-4 italic text-white/60"}
                placeholder="Trainer's Insight (cues, breathing...)"
                value={ex.insight}
                onChange={(e) => updateRow(i, "insight", e.target.value)}
            />

            <div className="col-span-1 flex flex-col items-center gap-1">
              <label className="p-3 bg-white/5 rounded-xl cursor-pointer hover:text-emerald-500 transition-colors">
                {uploadingRow === i ? <Loader2 className="animate-spin text-emerald-400" size={16}/> : <Upload size={16}/>}
                <input hidden type="file" onChange={(e) => handleUpload(e, i)} />
              </label>
              {ex.gifUrl && (
                ex.gifUrl.includes(".mp4") 
                ? <video src={ex.gifUrl} className="w-10 h-10 rounded object-cover border border-emerald-500/30" autoPlay loop muted playsInline />
                : <img src={ex.gifUrl} className="w-10 h-10 rounded object-cover border border-emerald-500/30" />
              )}
            </div>

            <button onClick={() => deleteRow(i)} className="col-span-1 text-red-500/40 hover:text-red-500 flex justify-center">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-4 mt-8">
        <button onClick={addExercise} className="flex-1 py-4 border border-dashed border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white/30 hover:border-emerald-500 hover:text-emerald-500 transition-all">
          + Expand {activeDay} Protocol
        </button>
        <button 
          onClick={saveAll}
          disabled={loading}
          className="flex-[2] bg-emerald-500 text-black py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-[0_20px_40px_rgba(16,185,129,0.3)] transition-all disabled:opacity-50"
        >
          {loading ? "Syncing..." : "Commit Weekly Protocol"}
        </button>
      </div>
    </div>
  );
}