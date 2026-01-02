"use client";

import { useState, useEffect } from "react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function TrainerDashboard() {
  const [trainerId, setTrainerId] = useState("");
  const [name, setName] = useState("Trainer");
  const [pendingClients, setPendingClients] = useState<any[]>([]);
  const [allClients, setAllClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [loadingPassword, setLoadingPassword] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"pending" | "all">("pending");

  // Weekly Planner States
  const [activeWorkoutDay, setActiveWorkoutDay] = useState("Monday");
  const [weeklyWorkout, setWeeklyWorkout] = useState<any>({
    Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: []
  });
  const [isBulkSaving, setIsBulkSaving] = useState(false);

  // Diet States
  const [showDietForm, setShowDietForm] = useState(false);
  const [dietTime, setDietTime] = useState("");
  const [dietMeal, setDietMeal] = useState("");
  const [dietCalories, setDietCalories] = useState("");
  const [savingDiet, setSavingDiet] = useState(false);

  // ✅ NEW: Edit Diet State
  const [editingDiet, setEditingDiet] = useState<any>(null);
  const [editTime, setEditTime] = useState("");
  const [editMeal, setEditMeal] = useState("");
  const [editCalories, setEditCalories] = useState("");
  const [savingEditDiet, setSavingEditDiet] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("role");
    const tId = localStorage.getItem("trainerId");
    if (role !== "trainer" || !tId) { 
      window.location.href = "/login"; 
      return; 
    }
    setTrainerId(tId);
    setName(localStorage.getItem("name") || "Trainer");
    fetchPendingClients(tId);
    fetchAllClients(tId);
  }, []);

  useEffect(() => {
    if (selectedClient && activeTab === "all") {
      fetchClientWorkout(selectedClient.id);
    }
  }, [selectedClient, activeTab]);

  const fetchPendingClients = async (id: string) => {
    const res = await fetch(`/api/trainer/pending-clients`, { 
      headers: { "x-trainer-id": id } 
    });
    if (res.ok) { 
      const data = await res.json(); 
      setPendingClients(data.clients || []); 
    }
  };

  const fetchAllClients = async (id: string) => {
    const res = await fetch(`/api/clients?trainerId=${id}`);
    if (res.ok) { 
      const data = await res.json(); 
      setAllClients(data.clients || []); 
      if (data.clients?.length && selectedClient) {
        const updatedClient = data.clients.find((c: any) => c.id === selectedClient.id);
        if (updatedClient) setSelectedClient(updatedClient);
      } else if (data.clients?.length && !selectedClient) {
        setSelectedClient(data.clients[0]);
      }
    }
  };

  const fetchClientWorkout = async (clientId: string) => {
    const res = await fetch(`/api/clients/workout?clientId=${clientId}`);
    const data = await res.json();
    if (data.success) {
      const organized: any = { 
        Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [] 
      };
      data.workouts.forEach((w: any) => { 
        if (organized[w.day]) organized[w.day].push({
          id: w.id, 
          exercise: w.exercise, 
          sets: w.sets, 
          reps: w.reps, 
          weight: w.weight || "0",
          gifUrl: w.gifUrl 
        }); 
      });
      setWeeklyWorkout(organized);
    }
  };

  const handleGeneratePassword = async (clientId: string) => {
    setLoadingPassword(clientId);
    const res = await fetch("/api/trainer/generate-password", {
      method: "POST", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, trainerId }),
    });
    if (res.ok) { 
      alert("Sent! ✅"); 
      fetchPendingClients(trainerId); 
    }
    setLoadingPassword(null);
  };

  const handleSaveWeeklyPlan = async () => {
    setIsBulkSaving(true);
    const res = await fetch("/api/clients/workout/bulk", {
      method: "POST", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: selectedClient.id, weeklyData: weeklyWorkout }),
    });
    if (res.ok) alert("Workout Saved! ✅");
    setIsBulkSaving(false);
  };

  const handleAddDiet = async () => {
    if (!selectedClient || !dietTime || !dietMeal || !dietCalories) {
      alert("Fill all fields! ⚠️");
      return;
    }

    setSavingDiet(true);
    try {
      const res = await fetch("/api/clients/diet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          clientId: selectedClient.id, 
          time: dietTime, 
          meal: dietMeal, 
          calories: parseInt(dietCalories) 
        }),
      });
      
      if (res.ok) {
        await fetchAllClients(trainerId);
        setShowDietForm(false);
        setDietTime(""); 
        setDietMeal(""); 
        setDietCalories("");
        alert("✅ Diet added successfully!");
      } else {
        const errorData = await res.json();
        alert(`❌ Failed: ${errorData.error || "Server error"}`);
      }
    } catch (error) {
      console.error("Diet add error:", error);
      alert("❌ Network error!");
    } finally {
      setSavingDiet(false);
    }
  };

  // ✅ NEW: Handle Edit Diet - Open form with current values
  const handleOpenEditDiet = (diet: any) => {
    setEditingDiet(diet);
    setEditTime(diet.time);
    setEditMeal(diet.meal);
    setEditCalories(diet.calories.toString());
  };

  // ✅ NEW: Update Diet
  const handleUpdateDiet = async () => {
    if (!editingDiet || !editTime || !editMeal || !editCalories) {
      alert("Fill all fields! ⚠️");
      return;
    }

    setSavingEditDiet(true);
    try {
      const res = await fetch(`/api/clients/diet/${editingDiet.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClient.id,
          time: editTime,
          meal: editMeal,
          calories: parseInt(editCalories),
        }),
      });

      if (res.ok) {
        await fetchAllClients(trainerId);
        setEditingDiet(null);
        setEditTime("");
        setEditMeal("");
        setEditCalories("");
        alert("✅ Diet updated successfully!");
      } else {
        const errorData = await res.json();
        alert(`❌ Failed: ${errorData.error || "Server error"}`);
      }
    } catch (error) {
      console.error("Diet update error:", error);
      alert("❌ Network error!");
    } finally {
      setSavingEditDiet(false);
    }
  };

  // ✅ NEW: Delete Diet
  const handleDeleteDiet = async (dietId: string) => {
    if (!confirm("Delete this diet?")) return;

    try {
      const res = await fetch(`/api/clients/diet/${dietId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: selectedClient.id }),
      });

      if (res.ok) {
        await fetchAllClients(trainerId);
        alert("✅ Diet deleted successfully!");
      } else {
        const errorData = await res.json();
        alert(`❌ Failed: ${errorData.error || "Server error"}`);
      }
    } catch (error) {
      console.error("Diet delete error:", error);
      alert("❌ Network error!");
    }
  };

  const handleGifUpload = async (e: any, index: number) => {
    const file = e.target.files[0];
    if (!file) return;
    const updated = [...weeklyWorkout[activeWorkoutDay]];
    updated[index].uploading = true;
    setWeeklyWorkout({ ...weeklyWorkout, [activeWorkoutDay]: updated });
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "fitvibs");
    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/dvsfcvbam/image/upload", { 
        method: "POST", 
        body: formData 
      });
      const data = await res.json();
      updated[index].gifUrl = data.secure_url;
    } finally {
      updated[index].uploading = false;
      setWeeklyWorkout({ ...weeklyWorkout, [activeWorkoutDay]: updated });
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#020617", color: "white" }}>
      <header style={headerStyle}>
        <h1>FitVibs Trainer 👋</h1>
        <button onClick={() => { localStorage.clear(); window.location.href = "/login"; }} style={btnSecondary}>
          Logout
        </button>
      </header>

      <div style={{ padding: "16px" }}>
        <div style={{ marginBottom: "20px", display: "flex", gap: "12px" }}>
          <button 
            onClick={() => setActiveTab("pending")} 
            style={activeTab === "pending" ? tabActive : tabInactive}
          >
            ⏳ Pending ({pendingClients.length})
          </button>
          <button 
            onClick={() => setActiveTab("all")} 
            style={activeTab === "all" ? tabActive : tabInactive}
          >
            👥 All Clients
          </button>
        </div>

        {activeTab === "pending" && (
          <div style={{ display: "grid", gap: "10px" }}>
            {pendingClients.map(c => (
              <div key={c.id} style={pendingCard}>
                <span>{c.name} ({c.email})</span>
                <button 
                  onClick={() => handleGeneratePassword(c.id)} 
                  disabled={loadingPassword === c.id} 
                  style={btnSuccess}
                >
                  Send Pass
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === "all" && (
          <div style={{ display: "grid", gridTemplateColumns: "250px 1fr", gap: "20px" }}>
            <aside>
              {allClients.map(c => (
                <button 
                  key={c.id} 
                  onClick={() => setSelectedClient(c)} 
                  style={selectedClient?.id === c.id ? clientBtnActive : clientBtnInactive}
                >
                  {c.name}
                </button>
              ))}
            </aside>

            <main>
              {selectedClient && (
                <>
                  {/* Info Cards */}
                  <div style={infoGrid}>
                    <InfoCard 
                      label="Initial Weight" 
                      value={`${selectedClient.initialWeight || "—"}kg`} 
                      color="#9ca3af"
                      readOnly
                    />
                    <InfoCard 
                      label="Current Weight" 
                      value={`${selectedClient.currentWeight || 0}kg`} 
                      color="#3b82f6"
                    />
                    <InfoCard 
                      label="Goal Weight" 
                      value={`${selectedClient.goalWeight || 0}kg`} 
                      color="#22c55e"
                      highlight
                    />
                  </div>

                  {/* Workout Section */}
                  <section style={sectionCard}>
                    <h3>💪 Weekly Workout Planner</h3>
                    <div style={daySelector}>
                      {DAYS.map(d => (
                        <button 
                          key={d} 
                          onClick={() => setActiveWorkoutDay(d)} 
                          style={activeWorkoutDay === d ? dayTabActive : dayTabInactive}
                        >
                          {d.substring(0, 3)}
                        </button>
                      ))}
                    </div>
                    <div style={{ display: "grid", gap: "10px" }}>
                      {weeklyWorkout[activeWorkoutDay].map((ex: any, idx: number) => (
                        <div key={idx} style={exerciseRow}>
                          <input 
                            placeholder="Exercise" 
                            value={ex.exercise} 
                            style={{ ...inputStyle, flex: 2 }} 
                            onChange={e => { 
                              const u = [...weeklyWorkout[activeWorkoutDay]]; 
                              u[idx].exercise = e.target.value; 
                              setWeeklyWorkout({ ...weeklyWorkout, [activeWorkoutDay]: u });
                            }} 
                          />
                          <input 
                            placeholder="Sets" 
                            value={ex.sets} 
                            style={{ ...inputStyle, width: "50px" }} 
                            onChange={e => { 
                              const u = [...weeklyWorkout[activeWorkoutDay]]; 
                              u[idx].sets = e.target.value; 
                              setWeeklyWorkout({ ...weeklyWorkout, [activeWorkoutDay]: u });
                            }} 
                          />
                          <input 
                            placeholder="Reps" 
                            value={ex.reps} 
                            style={{ ...inputStyle, width: "50px" }} 
                            onChange={e => { 
                              const u = [...weeklyWorkout[activeWorkoutDay]]; 
                              u[idx].reps = e.target.value; 
                              setWeeklyWorkout({ ...weeklyWorkout, [activeWorkoutDay]: u });
                            }} 
                          />
                          <input 
                            placeholder="Weight" 
                            value={ex.weight || ""} 
                            style={{ ...inputStyle, width: "60px" }} 
                            onChange={e => { 
                              const u = [...weeklyWorkout[activeWorkoutDay]]; 
                              u[idx].weight = e.target.value; 
                              setWeeklyWorkout({ ...weeklyWorkout, [activeWorkoutDay]: u });
                            }} 
                          />
                          <input 
                            type="file" 
                            onChange={e => handleGifUpload(e, idx)} 
                            style={{ fontSize: "8px", width: "70px" }} 
                          />
                          {ex.gifUrl && (
                            <img 
                              src={ex.gifUrl} 
                              style={{ width: "25px", height: "25px", borderRadius: "4px" }} 
                              alt="gif" 
                            />
                          )}
                          <button 
                            onClick={() => { 
                              const u = [...weeklyWorkout[activeWorkoutDay]]; 
                              u.splice(idx, 1); 
                              setWeeklyWorkout({ ...weeklyWorkout, [activeWorkoutDay]: u });
                            }} 
                            style={{ color: "red", background: "none", border: "none", cursor: "pointer" }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <button 
                        onClick={() => setWeeklyWorkout({
                          ...weeklyWorkout, 
                          [activeWorkoutDay]: [...weeklyWorkout[activeWorkoutDay], {
                            exercise: "", sets: "", reps: "", weight: "0", gifUrl: ""
                          }]
                        })} 
                        style={btnAddSmall}
                      >
                        + Add Row
                      </button>
                    </div>
                    <button 
                      onClick={handleSaveWeeklyPlan} 
                      disabled={isBulkSaving} 
                      style={btnBulkSave}
                    >
                      {isBulkSaving ? "Saving..." : "Save Week"}
                    </button>
                  </section>

                  {/* Diet Plan Section */}
                  <section style={{ ...sectionCard, marginTop: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px", alignItems: "center" }}>
                      <h3>🍎 Diet Plan</h3>
                      <button 
                        onClick={() => {
                          setShowDietForm(!showDietForm);
                          setEditingDiet(null);
                        }} 
                        style={btnAddSmall}
                      >
                        {showDietForm ? "Cancel" : "+ Add Meal"}
                      </button>
                    </div>

                    {/* ✅ NEW: Add Diet Form */}
                    {showDietForm && (
                      <div style={quickForm}>
                        <input 
                          placeholder="Time" 
                          value={dietTime} 
                          onChange={e => setDietTime(e.target.value)} 
                          style={inputStyle} 
                        />
                        <input 
                          placeholder="Meal" 
                          value={dietMeal} 
                          onChange={e => setDietMeal(e.target.value)} 
                          style={inputStyle} 
                        />
                        <input 
                          placeholder="Cals" 
                          type="number" 
                          value={dietCalories} 
                          onChange={e => setDietCalories(e.target.value)} 
                          style={inputStyle} 
                        />
                        <button 
                          onClick={handleAddDiet} 
                          disabled={savingDiet} 
                          style={btnSuccess}
                        >
                          {savingDiet ? "..." : "Save"}
                        </button>
                      </div>
                    )}

                    {/* ✅ NEW: Edit Diet Form */}
                    {editingDiet && (
                      <div style={quickForm}>
                        <input 
                          placeholder="Time" 
                          value={editTime} 
                          onChange={e => setEditTime(e.target.value)} 
                          style={inputStyle} 
                        />
                        <input 
                          placeholder="Meal" 
                          value={editMeal} 
                          onChange={e => setEditMeal(e.target.value)} 
                          style={inputStyle} 
                        />
                        <input 
                          placeholder="Cals" 
                          type="number" 
                          value={editCalories} 
                          onChange={e => setEditCalories(e.target.value)} 
                          style={inputStyle} 
                        />
                        <button 
                          onClick={handleUpdateDiet} 
                          disabled={savingEditDiet} 
                          style={btnSuccess}
                        >
                          {savingEditDiet ? "..." : "Update"}
                        </button>
                        <button 
                          onClick={() => {
                            setEditingDiet(null);
                            setEditTime("");
                            setEditMeal("");
                            setEditCalories("");
                          }} 
                          style={{ ...btnSecondary, padding: "8px 12px" }}
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    {/* Diet List */}
                    {selectedClient.diets && selectedClient.diets.length > 0 ? (
                      selectedClient.diets.map((d: any) => (
                        <div key={d.id} style={{ ...dietRow, alignItems: "center" }}>
                          <div style={{ flex: 1 }}>
                            <span>{d.time} - <b>{d.meal}</b></span>
                            <span style={{ color: "#3b82f6", marginLeft: "12px" }}>{d.calories} cals</span>
                          </div>
                          <div style={{ display: "flex", gap: "6px" }}>
                            {/* ✅ NEW: Edit Button */}
                            <button
                              onClick={() => handleOpenEditDiet(d)}
                              style={{
                                background: "none",
                                border: "none",
                                color: "#3b82f6",
                                cursor: "pointer",
                                fontSize: "16px",
                                padding: "4px 8px"
                              }}
                              title="Edit diet"
                            >
                              ✏️
                            </button>
                            {/* ✅ NEW: Delete Button */}
                            <button
                              onClick={() => handleDeleteDiet(d.id)}
                              style={{
                                background: "none",
                                border: "none",
                                color: "#ef4444",
                                cursor: "pointer",
                                fontSize: "16px",
                                padding: "4px 8px"
                              }}
                              title="Delete diet"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ textAlign: "center", padding: "20px", color: "#9ca3af" }}>
                        No diets added yet. Add your first meal! 🍎
                      </div>
                    )}
                  </section>
                </>
              )}
            </main>
          </div>
        )}
      </div>
    </div>
  );
}

// Styles
const headerStyle = { padding: "16px", borderBottom: "1px solid #1f2937", display: "flex", justifyContent: "space-between", alignItems: "center" };
const tabActive = { background: "#3b82f6", color: "white", padding: "8px 16px", borderRadius: "8px", border: "none", cursor: "pointer" };
const tabInactive = { background: "#1f2937", color: "white", padding: "8px 16px", borderRadius: "8px", border: "none", cursor: "pointer" };
const pendingCard = { background: "#0b1120", padding: "12px", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center", borderLeft: "4px solid #ef4444" };
const clientBtnActive = { width: "100%", padding: "12px", background: "#1f2937", border: "1px solid #3b82f6", color: "#3b82f6", borderRadius: "8px", textAlign: "left" as "left", marginBottom: "5px", cursor: "pointer" };
const clientBtnInactive = { width: "100%", padding: "12px", background: "transparent", border: "1px solid #1f2937", color: "white", borderRadius: "8px", textAlign: "left" as "left", marginBottom: "5px", cursor: "pointer" };
const sectionCard = { background: "#0b1120", padding: "20px", borderRadius: "12px", border: "1px solid #1f2937" };
const infoGrid = { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "20px" };
const daySelector = { display: "flex", gap: "5px", marginBottom: "15px", overflowX: "auto" as "auto" };
const dayTabActive = { background: "#3b82f6", border: "none", padding: "5px 12px", borderRadius: "15px", color: "white", cursor: "pointer", fontSize: "12px" };
const dayTabInactive = { background: "#1f2937", border: "none", padding: "5px 12px", borderRadius: "15px", color: "#9ca3af", cursor: "pointer", fontSize: "12px" };
const exerciseRow = { display: "flex", gap: "5px", alignItems: "center", background: "#020617", padding: "8px", borderRadius: "8px" };
const inputStyle = { padding: "8px", background: "#0b1120", color: "white", border: "1px solid #1f2937", borderRadius: "6px", fontSize: "11px" };
const btnAddSmall = { background: "none", border: "1px dashed #3b82f6", color: "#3b82f6", padding: "5px 10px", borderRadius: "6px", cursor: "pointer" };
const btnBulkSave = { width: "100%", marginTop: "20px", background: "linear-gradient(to r, #2563eb, #0891b2)", color: "white", padding: "12px", borderRadius: "8px", fontWeight: "bold" as "bold", border: "none", cursor: "pointer" };
const btnSuccess = { background: "#22c55e", color: "white", border: "none", padding: "8px 12px", borderRadius: "6px", cursor: "pointer" };
const btnSecondary = { background: "none", border: "1px solid #4b5563", color: "white", padding: "5px 10px", borderRadius: "5px", cursor: "pointer" };
const quickForm = { display: "flex", gap: "8px", background: "#020617", padding: "10px", borderRadius: "8px", marginBottom: "15px" };
const dietRow = { display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #ffffff08", fontSize: "13px" };

function InfoCard({ label, value, highlight, color, readOnly }: any) {
  return (
    <div style={{ 
      background: "#0b1120", 
      padding: "12px", 
      borderRadius: "8px", 
      border: highlight ? "1px solid #3b82f6" : readOnly ? "1px solid #4b5563" : "1px solid #1f2937",
      opacity: readOnly ? 0.7 : 1
    }}>
      <p style={{ fontSize: "10px", color: "#9ca3af", marginBottom: "4px" }}>{label}</p>
      <p style={{ fontSize: "16px", fontWeight: "bold", color: color || "white" }}>{value}</p>
    </div>
  );
}
