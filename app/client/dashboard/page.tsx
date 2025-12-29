"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Workout {
  id: string; exercise: string; sets: string; reps: string;
  weight: string; gifUrl?: string; day?: string; completed?: boolean;
}

interface Diet { id: string; time: string; meal: string; calories: number; completed?: boolean; }

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
  const [zoomGif, setZoomGif] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
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

  // ✅ SMART Weight Progress - Based on Initial Weight + Goal
  const calculateWeightProgress = () => {
    if (!clientData) return 0;
    
    // Get initial weight from signup (if available, else use current)
    const initialWeight = clientData.currentWeight; // Change if you track signup weight
    const currentWeight = clientData.currentWeight;
    const goalWeight = clientData.goalWeight;
    
    // Weight loss direction
    if (initialWeight > goalWeight) {
      const totalToLose = initialWeight - goalWeight;
      const alreadyLost = initialWeight - currentWeight;
      return Math.min(100, Math.round((alreadyLost / totalToLose) * 100));
    }
    // Weight gain direction
    else {
      const totalToGain = goalWeight - initialWeight;
      const alreadyGained = currentWeight - initialWeight;
      return Math.min(100, Math.round((alreadyGained / totalToGain) * 100));
    }
  };

  // ✅ Weekly Workout Completion
  const getWeeklyProgress = () => {
    const weeks = 7;
    let completed = 0;
    for (let i = 0; i < weeks; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      if (checklist[dateStr]?.workout) completed++;
    }
    return { completed, total: weeks };
  };

  const filteredWorkouts = clientData?.workouts?.filter(w => 
    w.day?.toLowerCase() === activeDayView.toLowerCase()
  ) || [];

  const filteredDiets = clientData?.diets || [];

  // ✅ Toggle Workout Checklist
  const handleToggleWorkout = async (workoutId: string) => {
    const clientId = localStorage.getItem("clientId");
    if (!clientId) return;

    const newChecklist = { ...checklist };
    if (!newChecklist[todayDate]) newChecklist[todayDate] = { workout: false, diet: false };
    
    // Mark entire workout type as done
    newChecklist[todayDate].workout = !newChecklist[todayDate].workout;
    setChecklist(newChecklist);

    try {
      await fetch(`/api/clients/${clientId}/checklist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          date: todayDate, 
          type: "workout", 
          completed: newChecklist[todayDate].workout,
          workoutId 
        }),
      });
    } catch (err) { console.error(err); }
  };

  // ✅ Toggle Diet Checklist
  const handleToggleDiet = async (dietId: string) => {
    const clientId = localStorage.getItem("clientId");
    if (!clientId) return;

    const newChecklist = { ...checklist };
    if (!newChecklist[todayDate]) newChecklist[todayDate] = { workout: false, diet: false };
    
    // Mark entire diet type as done
    newChecklist[todayDate].diet = !newChecklist[todayDate].diet;
    setChecklist(newChecklist);

    try {
      await fetch(`/api/clients/${clientId}/checklist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          date: todayDate, 
          type: "diet", 
          completed: newChecklist[todayDate].diet,
          dietId 
        }),
      });
    } catch (err) { console.error(err); }
  };

  const handleUpdateWeight = async () => {
    const clientId = localStorage.getItem("clientId");
    if (!clientId || !clientData) return;
    setSavingWeight(true);
    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateWeight", currentWeight: parseFloat(weightInput) }),
      });
      if (res.ok) {
        const data = await res.json();
        const updated = data.client || data;
        setClientData(updated);
        alert("🎉 Weight Updated! Your progress is: " + calculateWeightProgress() + "%");
      }
    } finally { setSavingWeight(false); }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) { setPasswordError("Passwords do not match"); return; }
    setSavingPassword(true);
    try {
      const res = await fetch("/api/clients/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: clientData?.id, oldPassword, newPassword }),
      });
      if (res.ok) { 
        alert("✅ Password Changed Successfully!");
        setShowPasswordModal(false);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
      else { setPasswordError("Failed to change password"); }
    } finally { setSavingPassword(false); }
  };

  if (loading) return <div style={loaderStyle}>Loading Aadi Fitness...</div>;

  const weightProgress = calculateWeightProgress();
  const weeklyProgress = getWeeklyProgress();

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f1419 0%, #1a1f2e 100%)", color: "#e5e7eb" }}>
      {/* ✅ WELCOME HEADER */}
      <header style={headerStyle}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 900, margin: 0, background: "linear-gradient(90deg, #3b82f6, #60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            💪 Welcome, {name}!
          </h1>
          <p style={{ fontSize: "12px", color: "#9ca3af", margin: "4px 0 0 0" }}>Keep grinding! Your transformation starts here 🚀</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => setShowPasswordModal(true)} style={btnSecondary}>🔐 Pass</button>
          <button onClick={() => { localStorage.clear(); router.push("/login"); }} style={btnDanger}>Logout</button>
        </div>
      </header>

      <main style={{ padding: "16px", maxWidth: "900px", margin: "0 auto" }}>
        
        {/* ✅ GOAL & PROGRESS SECTION - AUTO UPDATE */}
        <section style={sectionBox}>
          <h2 style={sectionTitle}>📈 Your Transformation Journey</h2>
          
          {/* Progress towards goal */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "13px", fontWeight: 600 }}>Goal Progress: {weightProgress}%</span>
              <span style={{ fontSize: "12px", color: "#9ca3af" }}>{clientData?.currentWeight}kg → {clientData?.goalWeight}kg</span>
            </div>
            <div style={progressBarBg}>
              <div style={{ ...progressBarFill, width: `${weightProgress}%`, background: "linear-gradient(90deg, #10b981, #34d399)" }}></div>
            </div>
            <p style={{ fontSize: "11px", color: "#9ca3af", margin: "8px 0 0 0" }}>
              {weightProgress < 50 ? "🔥 You're just getting started! Keep pushing!" : 
               weightProgress < 100 ? "💪 Halfway there! You're crushing it!" : 
               "🏆 Goal achieved! Time for a new challenge!"}
            </p>
          </div>

          {/* Weekly Workouts */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "13px", fontWeight: 600 }}>Weekly Workouts: {weeklyProgress.completed}/{weeklyProgress.total}</span>
            <span style={{ fontSize: "12px", color: "#10b981" }}>🔥 {Math.round((weeklyProgress.completed / weeklyProgress.total) * 100)}% Complete</span>
          </div>
          <div style={progressBarBg}>
            <div style={{ ...progressBarFill, width: `${(weeklyProgress.completed / weeklyProgress.total) * 100}%`, background: "linear-gradient(90deg, #10b981, #34d399)" }}></div>
          </div>

          {/* Stats Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "16px" }}>
            <InfoCard label="Current Weight" value={`${clientData?.currentWeight}kg`} color="#3b82f6" />
            <InfoCard label="Goal Weight" value={`${clientData?.goalWeight}kg`} color="#10b981" />
          </div>
        </section>

        {/* ✅ DAILY CHECKLIST - WORKOUT & DIET */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
          <CheckItem 
            title="Workouts" 
            done={checklist[todayDate]?.workout} 
            emoji="🏋️" 
            onClick={() => handleToggleWorkout("")}
            subtext={filteredWorkouts.length + " exercises"}
          />
          <CheckItem 
            title="Diet Plan" 
            done={checklist[todayDate]?.diet} 
            emoji="🥗" 
            onClick={() => handleToggleDiet("")}
            subtext={filteredDiets.length + " meals"}
          />
        </div>

        {/* ✅ WEEKLY WORKOUTS WITH CHECKBOX */}
        <section style={sectionBox}>
          <h2 style={sectionTitle}>📅 Weekly Workouts</h2>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px", overflowX: "auto", gap: "8px" }}>
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
              <button key={d} onClick={() => setActiveDayView(d)} style={activeDayView.startsWith(d) ? dayTabActive : dayTabInactive}>{d}</button>
            ))}
          </div>
          {filteredWorkouts.length > 0 ? filteredWorkouts.map(w => (
            <div key={w.id} style={workoutRow} onClick={() => w.gifUrl && setZoomGif(w.gifUrl)}>
              <input 
                type="checkbox" 
                checked={checklist[todayDate]?.workout || false}
                onChange={() => handleToggleWorkout(w.id)}
                style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "#3b82f6" }}
                onClick={(e) => e.stopPropagation()}
              />
              <img src={w.gifUrl || "/placeholder.png"} style={thumbStyle} alt={w.exercise} />
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: "14px" }}>{w.exercise}</p>
                <p style={{ fontSize: "12px", color: "#9ca3af" }}>{w.sets} Sets × {w.reps} Reps {w.weight && `@ ${w.weight}kg`}</p>
              </div>
            </div>
          )) : <p style={{ textAlign: "center", color: "#4b5563", padding: "20px" }}>🛏️ Rest Day - Recover Strong!</p>}
        </section>

        {/* ✅ MEAL PLAN WITH CHECKBOX */}
        <section style={sectionBox}>
          <h2 style={sectionTitle}>🥗 Today's Meal Plan</h2>
          {clientData?.diets && clientData.diets.length > 0 ? clientData.diets.map(d => (
            <div key={d.id} style={dietRowWithCheckbox}>
              <input 
                type="checkbox" 
                checked={checklist[todayDate]?.diet || false}
                onChange={() => handleToggleDiet(d.id)}
                style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "#10b981" }}
              />
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 500 }}>{d.time} - {d.meal}</span>
              </div>
              <span style={{ color: "#3b82f6", fontWeight: 600 }}>{d.calories} cal</span>
            </div>
          )) : <p style={{ fontSize: "12px", color: "#9ca3af" }}>No meals assigned yet</p>}
        </section>

        {/* ✅ LOG WEIGHT - AUTO UPDATES PROGRESS */}
        <section style={sectionBox}>
          <h2 style={sectionTitle}>⚖️ Update Weight</h2>
          <div style={{ display: "flex", gap: "10px" }}>
            <input 
              type="number" 
              step="0.1" 
              value={weightInput} 
              onChange={(e) => setWeightInput(e.target.value)} 
              style={inputStyle} 
              placeholder="Enter weight (kg)" 
            />
            <button onClick={handleUpdateWeight} style={btnMain}>{savingWeight ? "Saving..." : "Update"}</button>
          </div>
          <p style={{ fontSize: "11px", color: "#9ca3af", marginTop: "8px" }}>💡 Updating weight will automatically recalculate your progress!</p>
        </section>
      </main>

      {/* ✅ GIF ZOOM */}
      {zoomGif && <div style={overlay} onClick={() => setZoomGif(null)}><img src={zoomGif} style={zoomedImg} /></div>}

      {/* ✅ PASSWORD MODAL */}
      {showPasswordModal && (
        <div style={modalBg}>
          <div style={modalContent}>
            <h3 style={{ marginBottom: "15px", fontSize: "16px", fontWeight: 700 }}>🔐 Change Password</h3>
            <input type="password" placeholder="Old Password" style={inputStyle} value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
            <input type="password" placeholder="New Password" style={{...inputStyle, marginTop: "10px"}} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <input type="password" placeholder="Confirm Password" style={{...inputStyle, marginTop: "10px"}} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            {passwordError && <p style={{color: "#ef4444", fontSize: "12px", marginTop: "8px"}}>❌ {passwordError}</p>}
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button onClick={handleChangePassword} style={btnMain}>{savingPassword ? "Saving..." : "Change"}</button>
              <button onClick={() => setShowPasswordModal(false)} style={btnSecondary}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ✅ SUB COMPONENTS
function InfoCard({ label, value, color }: any) {
  return (
    <div style={{ background: "rgba(59, 130, 246, 0.1)", padding: "12px", borderRadius: "10px", border: `1px solid ${color}33` }}>
      <p style={{ fontSize: "11px", color: "#9ca3af", margin: 0, marginBottom: "4px" }}>{label}</p>
      <p style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: color }}>{value}</p>
    </div>
  );
}

function CheckItem({ title, done, emoji, onClick, subtext }: any) {
  return (
    <button onClick={onClick} style={{ 
      background: done ? "linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(52, 211, 153, 0.1))" : "#1a1f2e",
      border: `2px solid ${done ? "#10b981" : "#2d3748"}`,
      borderRadius: "14px", 
      padding: "16px", 
      cursor: "pointer", 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      gap: "6px",
      transition: "all 0.3s ease"
    }}>
      <span style={{ fontSize: "24px" }}>{emoji}</span>
      <span style={{ fontSize: "13px", fontWeight: 700 }}>{title}</span>
      <span style={{ fontSize: "10px", color: "#9ca3af" }}>{subtext}</span>
      <span style={{ fontSize: "11px", color: done ? "#10b981" : "#4b5563", fontWeight: 500 }}>{done ? "✓ Completed" : "⏳ Pending"}</span>
    </button>
  );
}

// ✅ STYLES
const headerStyle = { padding: "20px 16px", background: "#1a1f2e", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #2d3748" };
const btnSecondary = { background: "none", border: "1.5px solid #3b82f6", color: "#3b82f6", padding: "6px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, cursor: "pointer" };
const btnDanger = { background: "none", border: "1.5px solid #ef4444", color: "#ef4444", padding: "6px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, cursor: "pointer" };
const sectionBox = { background: "#1a1f2e", padding: "16px", borderRadius: "16px", marginBottom: "16px", border: "1px solid #2d3748" };
const sectionTitle = { fontSize: "12px", color: "#9ca3af", fontWeight: 700, textTransform: "uppercase" as "uppercase", marginBottom: "12px", letterSpacing: "0.5px" };
const progressBarBg = { width: "100%", height: "12px", background: "#0f1419", borderRadius: "10px", overflow: "hidden" };
const progressBarFill = { height: "100%", borderRadius: "10px", transition: "width 0.5s ease" };
const dayTabActive = { background: "linear-gradient(90deg, #3b82f6, #60a5fa)", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 700, cursor: "pointer" };
const dayTabInactive = { background: "#0f1419", color: "#9ca3af", border: "1px solid #2d3748", padding: "8px 14px", borderRadius: "8px", fontSize: "12px", cursor: "pointer" };
const workoutRow = { display: "flex", alignItems: "center", gap: "12px", background: "#0f1419", padding: "12px", borderRadius: "12px", marginBottom: "10px", cursor: "pointer", transition: "all 0.2s" };
const thumbStyle = { width: "55px", height: "55px", borderRadius: "10px", objectFit: "cover" as "cover" };
const dietRowWithCheckbox = { display: "flex", alignItems: "center", gap: "10px", padding: "10px 0", borderBottom: "1px solid #ffffff08", fontSize: "13px" };
const inputStyle = { flex: 1, padding: "12px", background: "#0f1419", border: "1.5px solid #2d3748", color: "white", borderRadius: "10px", fontSize: "13px" };
const btnMain = { background: "linear-gradient(90deg, #3b82f6, #60a5fa)", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "10px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s" };
const overlay = { position: "fixed" as "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.95)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 };
const zoomedImg = { maxWidth: "90%", maxHeight: "80vh", borderRadius: "20px" };
const loaderStyle = { minHeight: "100vh", background: "#0f1419", display: "flex", justifyContent: "center", alignItems: "center", color: "#9ca3af", fontSize: "16px" };
const modalBg = { position: "fixed" as "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1001 };
const modalContent = { background: "#1a1f2e", padding: "24px", borderRadius: "16px", width: "90%", maxWidth: "400px", border: "1px solid #2d3748" };
