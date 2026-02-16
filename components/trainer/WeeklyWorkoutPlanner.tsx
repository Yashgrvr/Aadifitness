"use client";
import { useState } from "react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function WeeklyWorkoutPlanner({ clientId }: { clientId: string }) {
  const [activeDay, setActiveDay] = useState("Monday");
  const [loading, setLoading] = useState(false);
  const [weeklyData, setWeeklyData] = useState<any>({
    Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: []
  });

  // Nayi row add karne ke liye
  const addExercise = () => {
    setWeeklyData({
      ...weeklyData,
      [activeDay]: [...weeklyData[activeDay], { exercise: "", sets: "", reps: "", weight: "", gifUrl: "", uploading: false }]
    });
  };

  // Cloudinary Upload Logic
  const handleUpload = async (e: any, index: number) => {
    const file = e.target.files[0];
    if (!file) return;

    const updatedDay = [...weeklyData[activeDay]];
    updatedDay[index].uploading = true;
    setWeeklyData({ ...weeklyData, [activeDay]: updatedDay });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "fitvibs"); 
    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/dvsfcvbam/image/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      
      updatedDay[index].gifUrl = data.secure_url;
      updatedDay[index].uploading = false;
      setWeeklyData({ ...weeklyData, [activeDay]: updatedDay });
    } catch (err) {
      alert("Upload failed!");
      updatedDay[index].uploading = false;
      setWeeklyData({ ...weeklyData, [activeDay]: updatedDay });
    }
  };

  const saveAll = async () => {
    setLoading(true);
    const res = await fetch("/api/clients/workout/bulk", {
      method: "POST",
      body: JSON.stringify({ clientId, weeklyData })
    });
    if (res.ok) alert("Poora hafta save ho gaya!");
    setLoading(false);
  };

  return (
    <div className="bg-slate-900 border border-blue-500/20 p-6 rounded-2xl">
      {/* Day Tabs */}
      <div className="flex space-x-2 overflow-x-auto mb-6 pb-2">
        {DAYS.map(day => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`px-4 py-2 rounded-lg text-sm transition ${activeDay === day ? 'bg-blue-600 text-white' : 'bg-slate-800 text-gray-400'}`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Exercise Rows */}
      <div className="space-y-4">
        {weeklyData[activeDay].map((ex: any, i: number) => (
          <div key={i} className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-slate-800/50 p-4 rounded-xl items-end">
            <div>
              <label className="text-[10px] text-gray-500 uppercase">Exercise Name</label>
              <input 
                className="w-full bg-transparent border-b border-gray-700 text-white focus:border-blue-500 outline-none"
                value={ex.exercise}
                onChange={(e) => {
                  const updated = [...weeklyData[activeDay]];
                  updated[i].exercise = e.target.value;
                  setWeeklyData({ ...weeklyData, [activeDay]: updated });
                }}
              />
            </div>
            <input placeholder="Sets" className="bg-transparent border-b border-gray-700 text-white outline-none" 
                   onChange={(e) => { const updated = [...weeklyData[activeDay]]; updated[i].sets = e.target.value; setWeeklyData({ ...weeklyData, [activeDay]: updated }); }} />
            <input placeholder="Reps" className="bg-transparent border-b border-gray-700 text-white outline-none" 
                   onChange={(e) => { const updated = [...weeklyData[activeDay]]; updated[i].reps = e.target.value; setWeeklyData({ ...weeklyData, [activeDay]: updated }); }} />
            
            <div className="flex flex-col">
              <label className="text-[10px] text-blue-400 mb-1">Upload GIF</label>
              <input type="file" className="text-xs text-gray-500" onChange={(e) => handleUpload(e, i)} />
            </div>

            <div className="flex justify-center">
              {ex.uploading ? <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent" /> : 
               ex.gifUrl && <img src={ex.gifUrl} className="h-10 w-10 rounded border border-blue-500" />}
            </div>
          </div>
        ))}
      </div>

      <button onClick={addExercise} className="mt-6 text-blue-400 text-sm hover:underline">+ Add Exercise to {activeDay}</button>
      
      <button 
        onClick={saveAll}
        disabled={loading}
        className="w-full mt-10 bg-gradient-to-r from-blue-600 to-cyan-500 py-3 rounded-xl font-bold hover:scale-[1.02] transition disabled:opacity-50"
      >
        {loading ? "Updating..." : "Save Entire Weekly Plan"}
      </button>
    </div>
  );
}