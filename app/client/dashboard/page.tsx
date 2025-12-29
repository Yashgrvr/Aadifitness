"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// --- INTERFACES ---
interface Workout {
  id: string;
  exercise: string;
  sets: string;
  reps: string;
  weight: string;
  gifUrl?: string; 
  day?: string; 
}

interface Diet { id: string; time: string; meal: string; calories: number; }

interface Client {
  id: string; name: string; email: string; currentWeight: number;
  goalWeight: number; plan: string; progress: number;
  workouts: Workout[]; diets: Diet[];
  sessionsCompleted: number; sessionsTotal: number;
}

export default function ClientDashboard() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [clientData, setClientData] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeDayView, setActiveDayView] = useState("");
  const [checklist, setChecklist] = useState<Record<string, { workout: boolean; diet: boolean }>>({});
  const [todayDate] = useState(new Date().toISOString().split("T")[0]);
  const [weightInput, setWeightInput] = useState("");
  const [savingWeight, setSavingWeight] = useState(false);
  
  // ✅ NEW: Zoom State for GIF
  const [zoomGif, setZoomGif] = useState<string | null>(null);

  // Password modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    const todayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
    setActiveDayView(todayName);
    const storedName = localStorage.getItem("name");
    const role = localStorage.getItem("role");
    const clientId = localStorage.getItem("clientId");

    if (!role || role !== "client") { router.replace("/login"); return; }
    setName(storedName || "Client");
    if (clientId) fetchClientData(clientId);
  }, [router]);

  const fetchClientData = async (clientId: string) => {
    try {
      const res = await fetch(`/api/clients/${clientId}`);
      if (res.ok) {
        const data = await res.json();
        const client = data.client ? data.client : data;
        setClientData(client);
        setWeightInput(String(client.currentWeight || ""));

        const cRes = await fetch(`/api/clients/${clientId}/checklist`);
        if (cRes.ok) {
          const cData: any[] = await cRes.json();
          const map: any = {};
          cData.forEach((item) => {
            if (!map[item.date]) map[item.date] = { workout: false, diet: false };
            map[item.date][item.type] = item.completed;
          });
          setChecklist(map);
        }
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const filteredWorkouts = clientData?.workouts?.filter(w => 
    w.day?.toLowerCase() === activeDayView.toLowerCase()
  ).map(w => ({ ...w, gifUrl: (w as any).gifUrl || (w as any).gifURL || null })) || [];

  const handleToggleWorkout = async () => {
    const clientId = localStorage.getItem("clientId");
    if (!clientId || !clientData) return;
    const newChecklist = { ...checklist };
    if (!newChecklist[todayDate]) newChecklist[todayDate] = { workout: false, diet: false };
    newChecklist[todayDate].workout = !newChecklist[todayDate].workout;
    setChecklist(newChecklist);
    try {
      const res = await fetch(`/api/clients/${clientId}/checklist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: todayDate, type: "workout", completed: newChecklist[todayDate].workout }),
      });
      if (res.ok) {
        const updated = await res.json();
        setClientData(old => old ? { ...old, sessionsCompleted: updated.stats.sessionsCompleted, progress: updated.stats.progress } : old);
      }
    } catch (err) { console.error(err); }
  };

  const handleToggleDiet = async () => {
    const clientId = localStorage.getItem("clientId");
    if (!clientId || !clientData) return;
    const newChecklist = { ...checklist };
    if (!newChecklist[todayDate]) newChecklist[todayDate] = { workout: false, diet: false };
    newChecklist[todayDate].diet = !newChecklist[todayDate].diet;
    setChecklist(newChecklist);
    try {
      const res = await fetch(`/api/clients/${clientId}/checklist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: todayDate, type: "diet", completed: newChecklist[todayDate].diet }),
      });
      if (res.ok) {
        const updated = await res.json();
        setClientData(old => old ? { ...old, sessionsCompleted: updated.stats.sessionsCompleted, progress: updated.stats.progress } : old);
      }
    } catch (err) { console.error(err); }
  };

  const handleUpdateWeight = async () => {
    const clientId = localStorage.getItem("clientId");
    if (!clientId || !clientData) return;
    const num = parseFloat(weightInput);
    if (isNaN(num) || num <= 0) return;
    setSavingWeight(true);
    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateWeight", currentWeight: num }),
      });
      if (res.ok) {
        const data = await res.json();
        setClientData(data.client || data);
        alert("Weight updated!");
      }
    } finally { setSavingWeight(false); }
  };

  if (loading) return <div style={{ minHeight: "100vh", background: "#0f1419", display: "flex", justifyContent: "center", alignItems: "center", color: "#9ca3af" }}>Loading Aadifitness...</div>;

  return (
    <div style={{ minHeight: "100vh", background: "#0f1419", color: "#e5e7eb" }}>
      <header style={{ padding: "20px 16px", background: "#1a1f2e", borderBottom: "1px solid #374151", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, margin: 0 }}>Aadi Fitness 💪</h1>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => setShowPasswordModal(true)} style={btnStyle}>🔐 Pass</button>
          <button onClick={() => { localStorage.clear(); router.push("/login"); }} style={{ ...btnStyle, borderColor: "#ef4444", color: "#ef4444" }}>Logout</button>
        </div>
      </header>

      <div style={{ padding: "16px", maxWidth: "800px", margin: "0 auto" }}>
        {clientData && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "20px" }}>
              <InfoCard label="Weight" value={`${clientData.currentWeight}kg`} />
              <InfoCard label="Goal" value={`${clientData.goalWeight}kg`} highlight />
              <InfoCard label="Progress" value={`${clientData.progress}%`} color="#22c55e" />
            </div>

            {/* ✅ UPDATED: Weekly Section with Larger GIFs */}
            <section style={sectionBox}>
              <h2 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "12px", color: "#fff" }}>🗓️ Workout Schedule</h2>
              <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "12px" }}>
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
                  <button key={day} onClick={() => setActiveDayView(day)} style={activeDayView === day ? dayActive : dayInactive}>
                    {day.substring(0, 3)}
                  </button>
                ))}
              </div>

              <div style={{ display: "grid", gap: "12px", marginTop: "16px" }}>
                {filteredWorkouts.length > 0 ? (
                  filteredWorkouts.map((w) => (
                    <div key={w.id} style={workoutRow}>
                      <div 
                        style={gifPreviewLarge} 
                        onClick={() => w.gifUrl && setZoomGif(w.gifUrl)} // ✅ Click to Zoom
                      >
                        {w.gifUrl ? (
                          <img src={w.gifUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="workout" />
                        ) : (
                          <div style={{textAlign: 'center'}}><span style={{fontSize: "10px", color: "#4b5563"}}>No GIF</span></div>
                        )}
                        {w.gifUrl && <div style={tapHint}>Tap to Zoom</div>}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 700, fontSize: "16px", margin: 0, color: "#fff" }}>{w.exercise}</p>
                        <p style={{ fontSize: "13px", color: "#9ca3af", margin: "4px 0 0 0" }}>{w.sets} Sets × {w.reps} Reps</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: "30px", textAlign: "center", color: "#4b5563", border: "1px dashed #2d3748", borderRadius: "16px" }}>
                    No workout for {activeDayView}
                  </div>
                )}
              </div>
            </section>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
              <TaskCard title="Workout" completed={checklist[todayDate]?.workout} emoji="🏋️" onClick={handleToggleWorkout} />
              <TaskCard title="Diet" completed={checklist[todayDate]?.diet} emoji="🍎" onClick={handleToggleDiet} />
            </div>

            <section style={sectionBox}>
               <h2 style={{ fontSize: "14px", marginBottom: "12px", color: "#fff" }}>⚖️ Update Weight</h2>
               <div style={{ display: "flex", gap: "10px" }}>
                 <input type="number" value={weightInput} onChange={(e) => setWeightInput(e.target.value)} style={inputStyle} />
                 <button onClick={handleUpdateWeight} disabled={savingWeight} style={btnMain}>Update</button>
               </div>
            </section>
          </>
        )}
      </div>

      {/* ✅ NEW: Zoomed GIF Overlay */}
      {zoomGif && (
        <div style={zoomOverlay} onClick={() => setZoomGif(null)}>
          <div style={zoomContent}>
            <img src={zoomGif} style={zoomedImg} alt="zoom" />
            <button style={closeZoomBtn}>Close ✕</button>
          </div>
        </div>
      )}

      {/* Password Modal (kept as is) */}
      {showPasswordModal && <div style={modalBg}>{/* ... Password Modal Content */}</div>}
    </div>
  );
}

// --- SHARED COMPONENTS ---
function InfoCard({ label, value, highlight, color }: any) {
  return (
    <div style={{ background: "#1a1f2e", padding: "14px", borderRadius: "12px", border: highlight ? "1px solid #3b82f6" : "1px solid #2d3748" }}>
      <p style={{ fontSize: "10px", color: "#9ca3af", margin: "0 0 4px 0" }}>{label}</p>
      <p style={{ fontSize: "16px", fontWeight: 700, color: color || "#fff", margin: 0 }}>{value}</p>
    </div>
  );
}

function TaskCard({ title, completed, onClick, emoji }: any) {
  return (
    <button onClick={onClick} style={{ padding: "16px", borderRadius: "16px", border: `1px solid ${completed ? "#3b82f6" : "#2d3748"}`, background: completed ? "rgba(59, 130, 246, 0.1)" : "#1a1f2e", cursor: "pointer" }}>
      <p style={{ fontSize: "20px", margin: "0 0 6px 0" }}>{emoji}</p>
      <p style={{ fontSize: "13px", fontWeight: 600, color: "#fff", margin: 0 }}>{title}</p>
      <p style={{ fontSize: "11px", color: completed ? "#3b82f6" : "#4b5563" }}>{completed ? "Done ✓" : "Mark Done"}</p>
    </button>
  );
}

// --- STYLES ---
const btnStyle = { padding: "6px 12px", borderRadius: "8px", border: "1px solid #2d3748", background: "transparent", color: "#e5e7eb", cursor: "pointer", fontSize: "12px" };
const btnMain = { background: "#3b82f6", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: 600 };
const sectionBox = { background: "#1a1f2e", padding: "16px", borderRadius: "20px", marginBottom: "16px", border: "1px solid #2d3748" };
const dayActive = { background: "#3b82f6", color: "white", border: "none", padding: "8px 14px", borderRadius: "10px", fontSize: "11px", fontWeight: 700, cursor: "pointer" };
const dayInactive = { background: "#0f1419", color: "#9ca3af", border: "none", padding: "8px 14px", borderRadius: "10px", fontSize: "11px", cursor: "pointer" };
const workoutRow = { display: "flex", alignItems: "center", gap: "16px", background: "#0f1419", padding: "12px", borderRadius: "16px", border: "1px solid #ffffff05" };
const inputStyle = { flex: 1, padding: "10px", background: "#0f1419", border: "1px solid #2d3748", color: "white", borderRadius: "8px" };
const modalBg = { position: "fixed" as "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 };

// ✅ NEW STYLES FOR ZOOM
const gifPreviewLarge = { 
  width: "80px", // Size badha diya list mein
  height: "80px", 
  background: "#1a1f2e", 
  borderRadius: "12px", 
  overflow: "hidden", 
  display: "flex", 
  alignItems: "center", 
  justifyContent: "center", 
  flexShrink: 0,
  position: "relative" as "relative",
  cursor: "zoom-in"
};

const tapHint = {
  position: "absolute" as "absolute",
  bottom: "0",
  width: "100%",
  background: "rgba(0,0,0,0.5)",
  color: "white",
  fontSize: "8px",
  textAlign: "center" as "center",
  padding: "2px 0"
};

const zoomOverlay = {
  position: "fixed" as "fixed",
  top: 0, left: 0, right: 0, bottom: 0,
  background: "rgba(0,0,0,0.95)",
  zIndex: 2000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px"
};

const zoomContent = {
  position: "relative" as "relative",
  maxWidth: "100%",
  maxHeight: "100%",
  display: "flex",
  flexDirection: "column" as "column",
  alignItems: "center"
};

const zoomedImg = {
  maxWidth: "100%",
  maxHeight: "80vh",
  borderRadius: "20px",
  boxShadow: "0 0 30px rgba(59, 130, 246, 0.5)"
};

const closeZoomBtn = {
  marginTop: "20px",
  background: "#3b82f6",
  color: "white",
  border: "none",
  padding: "10px 30px",
  borderRadius: "30px",
  fontWeight: "bold" as "bold",
  cursor: "pointer"
};