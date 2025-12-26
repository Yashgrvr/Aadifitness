"use client";

import { useState, useEffect } from "react";

interface PendingClient {
  id: string;
  name: string;
  email: string;
  currentWeight: number;
  goalWeight: number;
  fitnessGoal: string;
  plan: string;
  paymentDate: string;
  passwordGeneratedAt: string | null;
}

interface Workout {
  id: string;
  exercise: string;
  sets: string;
  reps: string;
  weight: string;
}

interface DietItem {
  id: string;
  time: string;
  meal: string;
  calories: number;
}

interface Client {
  id: string;
  name: string;
  email: string;
  currentWeight: number;
  goalWeight: number;
  plan: string;
  progress: number;
  workouts: Workout[];
  diets: DietItem[];
  sessionsCompleted: number;
  sessionsTotal: number;
}

export default function TrainerDashboard() {
  const [trainerId, setTrainerId] = useState("");
  const [name, setName] = useState("Trainer");
  const [pendingClients, setPendingClients] = useState<PendingClient[]>([]);
  const [allClients, setAllClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [loadingPassword, setLoadingPassword] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"pending" | "all">("pending");

  // Workout form states
  const [showWorkoutForm, setShowWorkoutForm] = useState(false);
  const [workoutExercise, setWorkoutExercise] = useState("");
  const [workoutSets, setWorkoutSets] = useState("");
  const [workoutReps, setWorkoutReps] = useState("");
  const [workoutWeight, setWorkoutWeight] = useState("");
  const [savingWorkout, setSavingWorkout] = useState(false);

  // Diet form states
  const [showDietForm, setShowDietForm] = useState(false);
  const [dietTime, setDietTime] = useState("");
  const [dietMeal, setDietMeal] = useState("");
  const [dietCalories, setDietCalories] = useState("");
  const [savingDiet, setSavingDiet] = useState(false);

  // Edit states
  const [editingWorkoutId, setEditingWorkoutId] = useState<string | null>(null);
  const [editWorkoutExercise, setEditWorkoutExercise] = useState("");
  const [editWorkoutSets, setEditWorkoutSets] = useState("");
  const [editWorkoutReps, setEditWorkoutReps] = useState("");
  const [editWorkoutWeight, setEditWorkoutWeight] = useState("");
  const [savingEditWorkout, setSavingEditWorkout] = useState(false);

  const [editingDietId, setEditingDietId] = useState<string | null>(null);
  const [editDietTime, setEditDietTime] = useState("");
  const [editDietMeal, setEditDietMeal] = useState("");
  const [editDietCalories, setEditDietCalories] = useState("");
  const [savingEditDiet, setSavingEditDiet] = useState(false);

  const [isWide, setIsWide] = useState(true);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    const storedName = localStorage.getItem("name") || "Trainer";
    const storedTrainerId = localStorage.getItem("trainerId");

    if (storedRole !== "trainer" || !storedTrainerId) {
      window.location.href = "/login";
      return;
    }

    setName(storedName);
    setTrainerId(storedTrainerId);
    fetchPendingClients(storedTrainerId);
    fetchAllClients(storedTrainerId);

    // Check screen width
    const handleResize = () => setIsWide(window.innerWidth >= 900);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchPendingClients = async (id: string) => {
    try {
      const res = await fetch(`/api/trainer/pending-clients`, {
        headers: { "x-trainer-id": id },
      });
      if (res.ok) {
        const data = await res.json();
        setPendingClients(data.clients || []);
      }
    } catch (err) {
      console.error("Error fetching pending clients:", err);
    }
  };

  const fetchAllClients = async (id: string) => {
    try {
      const res = await fetch(`/api/clients?trainerId=${id}`);
      if (res.ok) {
        const data = await res.json();
        setAllClients(data.clients || []);
        if (data.clients?.length) {
          setSelectedClient(data.clients[0]);
        }
      }
    } catch (err) {
      console.error("Error fetching all clients:", err);
    }
  };

  const handleGeneratePassword = async (clientId: string) => {
    setLoadingPassword(clientId);
    try {
      const res = await fetch("/api/trainer/generate-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, trainerId }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(
          `✅ Password sent to ${data.clientId}!\nEmail sent: ${data.emailSent}`
        );
        fetchPendingClients(trainerId);
      } else {
        alert(`❌ Error: ${data.message}`);
      }
    } catch (err) {
      alert(`❌ Error generating password: ${err}`);
    } finally {
      setLoadingPassword(null);
    }
  };

  // ✅ ADD WORKOUT
  const handleAddWorkout = async () => {
    if (!selectedClient) return;
    if (!workoutExercise || !workoutSets || !workoutReps || !workoutWeight) {
      alert("Please fill all workout fields");
      return;
    }
    setSavingWorkout(true);
    try {
      const res = await fetch("/api/clients/workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClient.id,
          exercise: workoutExercise,
          sets: workoutSets,
          reps: workoutReps,
          weight: workoutWeight,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const newWorkout: Workout = data.workout ?? data;
        setSelectedClient((prev) =>
          prev ? { ...prev, workouts: [...prev.workouts, newWorkout] } : prev
        );
        setAllClients((prev) =>
          prev.map((c) =>
            c.id === selectedClient.id
              ? { ...c, workouts: [...c.workouts, newWorkout] }
              : c
          )
        );
        setWorkoutExercise("");
        setWorkoutSets("");
        setWorkoutReps("");
        setWorkoutWeight("");
        setShowWorkoutForm(false);
      } else {
        alert("Failed to add workout");
      }
    } catch (err) {
      console.error("Error adding workout:", err);
      alert("Error adding workout");
    } finally {
      setSavingWorkout(false);
    }
  };

  // ✅ EDIT WORKOUT
  const handleEditWorkout = async (workoutId: string) => {
    if (!selectedClient) return;
    if (
      !editWorkoutExercise ||
      !editWorkoutSets ||
      !editWorkoutReps ||
      !editWorkoutWeight
    ) {
      alert("Please fill all workout fields");
      return;
    }
    setSavingEditWorkout(true);
    try {
      const res = await fetch(`/api/clients/workout/${workoutId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercise: editWorkoutExercise,
          sets: editWorkoutSets,
          reps: editWorkoutReps,
          weight: editWorkoutWeight,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const updatedWorkout: Workout = data.workout ?? data;
        setSelectedClient((prev) =>
          prev
            ? {
                ...prev,
                workouts: prev.workouts.map((w) =>
                  w.id === workoutId ? updatedWorkout : w
                ),
              }
            : prev
        );
        setAllClients((prev) =>
          prev.map((c) =>
            c.id === selectedClient.id
              ? {
                  ...c,
                  workouts: c.workouts.map((w) =>
                    w.id === workoutId ? updatedWorkout : w
                  ),
                }
              : c
          )
        );
        setEditingWorkoutId(null);
      } else {
        alert("Failed to update workout");
      }
    } catch (err) {
      console.error("Error updating workout:", err);
      alert("Error updating workout");
    } finally {
      setSavingEditWorkout(false);
    }
  };

  // ✅ DELETE WORKOUT
  const handleDeleteWorkout = async (workoutId: string) => {
    if (!selectedClient || !confirm("Delete this workout?")) return;
    try {
      const res = await fetch(`/api/clients/workout/${workoutId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSelectedClient((prev) =>
          prev
            ? {
                ...prev,
                workouts: prev.workouts.filter((w) => w.id !== workoutId),
              }
            : prev
        );
        setAllClients((prev) =>
          prev.map((c) =>
            c.id === selectedClient.id
              ? { ...c, workouts: c.workouts.filter((w) => w.id !== workoutId) }
              : c
          )
        );
      } else {
        alert("Failed to delete workout");
      }
    } catch (err) {
      console.error("Error deleting workout:", err);
      alert("Error deleting workout");
    }
  };

  // ✅ ADD DIET ITEM
  const handleAddDiet = async () => {
    if (!selectedClient) return;
    if (!dietTime || !dietMeal || !dietCalories) {
      alert("Please fill all diet fields");
      return;
    }
    const caloriesNum = parseInt(dietCalories, 10);
    if (isNaN(caloriesNum) || caloriesNum <= 0) {
      alert("Calories must be a positive number");
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
          calories: caloriesNum,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const newDiet: DietItem = data.diet ?? data;
        setSelectedClient((prev) =>
          prev ? { ...prev, diets: [...prev.diets, newDiet] } : prev
        );
        setAllClients((prev) =>
          prev.map((c) =>
            c.id === selectedClient.id
              ? { ...c, diets: [...c.diets, newDiet] }
              : c
          )
        );
        setDietTime("");
        setDietMeal("");
        setDietCalories("");
        setShowDietForm(false);
      } else {
        alert("Failed to add diet item");
      }
    } catch (err) {
      console.error("Error adding diet:", err);
      alert("Error adding diet");
    } finally {
      setSavingDiet(false);
    }
  };

  // ✅ EDIT DIET ITEM
  const handleEditDiet = async (dietId: string) => {
    if (!selectedClient) return;
    if (!editDietTime || !editDietMeal || !editDietCalories) {
      alert("Please fill all diet fields");
      return;
    }
    const caloriesNum = parseInt(editDietCalories, 10);
    if (isNaN(caloriesNum) || caloriesNum <= 0) {
      alert("Calories must be a positive number");
      return;
    }
    setSavingEditDiet(true);
    try {
      const res = await fetch(`/api/clients/diet/${dietId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          time: editDietTime,
          meal: editDietMeal,
          calories: caloriesNum,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const updatedDiet: DietItem = data.diet ?? data;
        setSelectedClient((prev) =>
          prev
            ? {
                ...prev,
                diets: prev.diets.map((d) =>
                  d.id === dietId ? updatedDiet : d
                ),
              }
            : prev
        );
        setAllClients((prev) =>
          prev.map((c) =>
            c.id === selectedClient.id
              ? {
                  ...c,
                  diets: c.diets.map((d) =>
                    d.id === dietId ? updatedDiet : d
                  ),
                }
              : c
          )
        );
        setEditingDietId(null);
      } else {
        alert("Failed to update diet item");
      }
    } catch (err) {
      console.error("Error updating diet:", err);
      alert("Error updating diet");
    } finally {
      setSavingEditDiet(false);
    }
  };

  // ✅ DELETE DIET ITEM
  const handleDeleteDiet = async (dietId: string) => {
    if (!selectedClient || !confirm("Delete this diet item?")) return;
    try {
      const res = await fetch(`/api/clients/diet/${dietId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSelectedClient((prev) =>
          prev
            ? {
                ...prev,
                diets: prev.diets.filter((d) => d.id !== dietId),
              }
            : prev
        );
        setAllClients((prev) =>
          prev.map((c) =>
            c.id === selectedClient.id
              ? { ...c, diets: c.diets.filter((d) => d.id !== dietId) }
              : c
          )
        );
      } else {
        alert("Failed to delete diet item");
      }
    } catch (err) {
      console.error("Error deleting diet:", err);
      alert("Error deleting diet");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const containerStyle: React.CSSProperties = isWide
    ? {
        display: "grid",
        gridTemplateColumns: "280px 1fr",
        gap: "24px",
      }
    : {
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      };

  return (
    <div style={{ minHeight: "100vh", background: "#020617", color: "white" }}>
      {/* HEADER */}
      <header
        style={{
          padding: "20px 16px",
          borderBottom: "1px solid #1f2937",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 600 }}>
            Welcome, {name} 👋
          </h1>
          <p style={{ color: "#9ca3af", fontSize: "14px" }}>
            Manage your clients and their training plans
          </p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: "8px 16px",
            borderRadius: "6px",
            border: "1px solid #4b5563",
            background: "transparent",
            color: "white",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Logout
        </button>
      </header>

      <div style={{ padding: "16px" }}>
        {/* TABS */}
        <div style={{ marginBottom: "20px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button
            onClick={() => setActiveTab("pending")}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              background: activeTab === "pending" ? "#3b82f6" : "#1f2937",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            ⏳ Pending Clients ({pendingClients.length})
          </button>
          <button
            onClick={() => setActiveTab("all")}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              background: activeTab === "all" ? "#3b82f6" : "#1f2937",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            👥 All Clients ({allClients.length})
          </button>
        </div>

        {/* PENDING CLIENTS TAB */}
        {activeTab === "pending" && (
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>
              ⏳ Pending Password Setup
            </h2>
            {pendingClients.length === 0 ? (
              <div
                style={{
                  background: "#0b1120",
                  padding: "24px",
                  borderRadius: "8px",
                  textAlign: "center",
                  color: "#9ca3af",
                }}
              >
                <p>No pending clients. All clients have received passwords! ✅</p>
              </div>
            ) : (
              <div style={{ display: "grid", gap: "12px" }}>
                {pendingClients.map((client) => (
                  <div
                    key={client.id}
                    style={{
                      background: "#0b1120",
                      padding: "16px",
                      borderRadius: "8px",
                      borderLeft: "3px solid #ef4444",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "12px",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: "200px" }}>
                      <p style={{ fontSize: "16px", fontWeight: 600, marginBottom: "4px" }}>
                        {client.name}
                      </p>
                      <p style={{ fontSize: "13px", color: "#9ca3af", marginBottom: "8px" }}>
                        {client.email}
                      </p>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
                          gap: "8px",
                          fontSize: "12px",
                          color: "#9ca3af",
                        }}
                      >
                        <div>
                          <p style={{ color: "#60a5fa" }}>Goal: {client.fitnessGoal}</p>
                        </div>
                        <div>
                          <p>Plan: {client.plan}</p>
                        </div>
                        <div>
                          <p>Payment: {new Date(client.paymentDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleGeneratePassword(client.id)}
                      disabled={loadingPassword === client.id}
                      style={{
                        padding: "10px 16px",
                        borderRadius: "6px",
                        background:
                          loadingPassword === client.id ? "#6b7280" : "#22c55e",
                        color: "white",
                        border: "none",
                        cursor:
                          loadingPassword === client.id ? "not-allowed" : "pointer",
                        fontSize: "14px",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {loadingPassword === client.id
                        ? "Sending..."
                        : "🔐 Generate & Send"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ALL CLIENTS TAB */}
        {activeTab === "all" && (
          <div style={containerStyle}>
            {/* SIDEBAR */}
            <div style={{ width: "100%" }}>
              <h3
                style={{
                  marginBottom: "12px",
                  fontSize: "12px",
                  color: "#9ca3af",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Your Clients ({allClients.length})
              </h3>
              <div style={{ display: "grid", gap: "8px" }}>
                {allClients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => setSelectedClient(client)}
                    style={{
                      padding: "12px",
                      borderRadius: "6px",
                      background:
                        selectedClient?.id === client.id ? "#1f2937" : "transparent",
                      border:
                        selectedClient?.id === client.id
                          ? "1px solid #3b82f6"
                          : "1px solid #1f2937",
                      color: "white",
                      cursor: "pointer",
                      textAlign: "left",
                      fontSize: "14px",
                      transition: "all 0.2s",
                    }}
                  >
                    <p style={{ fontWeight: 600, marginBottom: "4px" }}>
                      {client.name}
                    </p>
                    <p style={{ fontSize: "12px", color: "#9ca3af" }}>
                      {client.plan}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* MAIN CONTENT */}
            <div style={{ width: "100%" }}>
              {selectedClient ? (
                <>
                  <h2
                    style={{
                      fontSize: "20px",
                      fontWeight: 600,
                      marginBottom: "16px",
                    }}
                  >
                    {selectedClient.name} - Training Overview
                  </h2>

                  {/* INFO CARDS */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(150px, 1fr))",
                      gap: "12px",
                      marginBottom: "24px",
                    }}
                  >
                    <InfoCard
                      label="Current Weight"
                      value={`${selectedClient.currentWeight} kg`}
                    />
                    <InfoCard
                      label="Goal Weight"
                      value={`${selectedClient.goalWeight} kg`}
                      highlight
                    />
                    <InfoCard
                      label="Progress"
                      value={`${selectedClient.progress}%`}
                      color="#22c55e"
                    />
                    <InfoCard
                      label="Sessions"
                      value={`${selectedClient.sessionsCompleted}/${selectedClient.sessionsTotal}`}
                    />
                  </div>

                  {/* WORKOUTS */}
                  <section style={{ marginBottom: "24px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "12px",
                        flexWrap: "wrap",
                        gap: "8px",
                      }}
                    >
                      <h3 style={{ fontSize: "18px", fontWeight: 600 }}>
                        💪 Workouts ({selectedClient.workouts.length})
                      </h3>
                      <button
                        onClick={() => setShowWorkoutForm((prev) => !prev)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "6px",
                          border: "none",
                          background: "#3b82f6",
                          color: "white",
                          fontSize: "13px",
                          cursor: "pointer",
                        }}
                      >
                        {showWorkoutForm ? "Close" : "Add Workout"}
                      </button>
                    </div>

                    {showWorkoutForm && (
                      <div
                        style={{
                          background: "#0b1120",
                          padding: "12px",
                          borderRadius: "8px",
                          marginBottom: "12px",
                          display: "grid",
                          gap: "8px",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(100px, 1fr))",
                        }}
                      >
                        <input
                          placeholder="Exercise"
                          value={workoutExercise}
                          onChange={(e) =>
                            setWorkoutExercise(e.target.value)
                          }
                          style={inputStyle}
                        />
                        <input
                          placeholder="Sets"
                          value={workoutSets}
                          onChange={(e) => setWorkoutSets(e.target.value)}
                          style={inputStyle}
                        />
                        <input
                          placeholder="Reps"
                          value={workoutReps}
                          onChange={(e) => setWorkoutReps(e.target.value)}
                          style={inputStyle}
                        />
                        <input
                          placeholder="Weight"
                          value={workoutWeight}
                          onChange={(e) =>
                            setWorkoutWeight(e.target.value)
                          }
                          style={inputStyle}
                        />
                        <button
                          onClick={handleAddWorkout}
                          disabled={savingWorkout}
                          style={{
                            padding: "8px 12px",
                            borderRadius: "6px",
                            border: "none",
                            background: "#22c55e",
                            color: "white",
                            fontSize: "13px",
                            cursor: savingWorkout
                              ? "not-allowed"
                              : "pointer",
                          }}
                        >
                          {savingWorkout ? "Saving..." : "Save"}
                        </button>
                      </div>
                    )}

                    <div style={{ display: "grid", gap: "8px" }}>
                      {selectedClient.workouts.length === 0 ? (
                        <p style={{ color: "#9ca3af" }}>
                          No workouts assigned yet.
                        </p>
                      ) : (
                        selectedClient.workouts.map((w) => (
                          <div key={w.id}>
                            {editingWorkoutId === w.id ? (
                              <div
                                style={{
                                  background: "#0b1120",
                                  padding: "12px",
                                  borderRadius: "6px",
                                  borderLeft: "3px solid #f59e0b",
                                  display: "grid",
                                  gap: "8px",
                                  gridTemplateColumns:
                                    "repeat(auto-fit, minmax(80px, 1fr))",
                                }}
                              >
                                <input
                                  value={editWorkoutExercise}
                                  onChange={(e) =>
                                    setEditWorkoutExercise(e.target.value)
                                  }
                                  style={inputStyle}
                                />
                                <input
                                  value={editWorkoutSets}
                                  onChange={(e) =>
                                    setEditWorkoutSets(e.target.value)
                                  }
                                  style={inputStyle}
                                />
                                <input
                                  value={editWorkoutReps}
                                  onChange={(e) =>
                                    setEditWorkoutReps(e.target.value)
                                  }
                                  style={inputStyle}
                                />
                                <input
                                  value={editWorkoutWeight}
                                  onChange={(e) =>
                                    setEditWorkoutWeight(e.target.value)
                                  }
                                  style={inputStyle}
                                />
                                <button
                                  onClick={() => handleEditWorkout(w.id)}
                                  disabled={savingEditWorkout}
                                  style={{
                                    padding: "8px 12px",
                                    borderRadius: "6px",
                                    border: "none",
                                    background: "#22c55e",
                                    color: "white",
                                    fontSize: "13px",
                                    cursor: savingEditWorkout
                                      ? "not-allowed"
                                      : "pointer",
                                  }}
                                >
                                  {savingEditWorkout ? "Saving..." : "Save"}
                                </button>
                                <button
                                  onClick={() => setEditingWorkoutId(null)}
                                  style={{
                                    padding: "8px 12px",
                                    borderRadius: "6px",
                                    border: "none",
                                    background: "#6b7280",
                                    color: "white",
                                    fontSize: "13px",
                                    cursor: "pointer",
                                  }}
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div
                                style={{
                                  background: "#0b1120",
                                  padding: "12px",
                                  borderRadius: "6px",
                                  borderLeft: "3px solid #3b82f6",
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  flexWrap: "wrap",
                                  gap: "8px",
                                }}
                              >
                                <div>
                                  <p style={{ fontWeight: 600, fontSize: "14px" }}>
                                    {w.exercise}
                                  </p>
                                  <p
                                    style={{
                                      fontSize: "12px",
                                      color: "#9ca3af",
                                    }}
                                  >
                                    {w.sets} sets × {w.reps} reps @ {w.weight}
                                  </p>
                                </div>
                                <div style={{ display: "flex", gap: "6px" }}>
                                  <button
                                    onClick={() => {
                                      setEditingWorkoutId(w.id);
                                      setEditWorkoutExercise(w.exercise);
                                      setEditWorkoutSets(w.sets);
                                      setEditWorkoutReps(w.reps);
                                      setEditWorkoutWeight(w.weight);
                                    }}
                                    style={{
                                      padding: "4px 8px",
                                      borderRadius: "4px",
                                      border: "none",
                                      background: "#f59e0b",
                                      color: "white",
                                      fontSize: "12px",
                                      cursor: "pointer",
                                    }}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteWorkout(w.id)}
                                    style={{
                                      padding: "4px 8px",
                                      borderRadius: "4px",
                                      border: "none",
                                      background: "#ef4444",
                                      color: "white",
                                      fontSize: "12px",
                                      cursor: "pointer",
                                    }}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </section>

                  {/* DIET */}
                  <section>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "12px",
                        flexWrap: "wrap",
                        gap: "8px",
                      }}
                    >
                      <h3 style={{ fontSize: "18px", fontWeight: 600 }}>
                        🍎 Diet Plan ({selectedClient.diets.length})
                      </h3>
                      <button
                        onClick={() => setShowDietForm((prev) => !prev)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "6px",
                          border: "none",
                          background: "#22c55e",
                          color: "white",
                          fontSize: "13px",
                          cursor: "pointer",
                        }}
                      >
                        {showDietForm ? "Close" : "Add Diet Item"}
                      </button>
                    </div>

                    {showDietForm && (
                      <div
                        style={{
                          background: "#0b1120",
                          padding: "12px",
                          borderRadius: "8px",
                          marginBottom: "12px",
                          display: "grid",
                          gap: "8px",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(100px, 1fr))",
                        }}
                      >
                        <input
                          placeholder="Time (e.g. 9:00 AM)"
                          value={dietTime}
                          onChange={(e) => setDietTime(e.target.value)}
                          style={inputStyle}
                        />
                        <input
                          placeholder="Meal (e.g. Oats, Eggs)"
                          value={dietMeal}
                          onChange={(e) => setDietMeal(e.target.value)}
                          style={inputStyle}
                        />
                        <input
                          placeholder="Calories"
                          value={dietCalories}
                          onChange={(e) =>
                            setDietCalories(e.target.value)
                          }
                          style={inputStyle}
                        />
                        <button
                          onClick={handleAddDiet}
                          disabled={savingDiet}
                          style={{
                            padding: "8px 12px",
                            borderRadius: "6px",
                            border: "none",
                            background: "#3b82f6",
                            color: "white",
                            fontSize: "13px",
                            cursor: savingDiet
                              ? "not-allowed"
                              : "pointer",
                          }}
                        >
                          {savingDiet ? "Saving..." : "Save"}
                        </button>
                      </div>
                    )}

                    <div style={{ display: "grid", gap: "8px" }}>
                      {selectedClient.diets.length === 0 ? (
                        <p style={{ color: "#9ca3af" }}>
                          No diet plan assigned yet.
                        </p>
                      ) : (
                        selectedClient.diets.map((d) => (
                          <div key={d.id}>
                            {editingDietId === d.id ? (
                              <div
                                style={{
                                  background: "#0b1120",
                                  padding: "12px",
                                  borderRadius: "6px",
                                  borderLeft: "3px solid #f59e0b",
                                  display: "grid",
                                  gap: "8px",
                                  gridTemplateColumns:
                                    "repeat(auto-fit, minmax(80px, 1fr))",
                                }}
                              >
                                <input
                                  value={editDietTime}
                                  onChange={(e) =>
                                    setEditDietTime(e.target.value)
                                  }
                                  style={inputStyle}
                                />
                                <input
                                  value={editDietMeal}
                                  onChange={(e) =>
                                    setEditDietMeal(e.target.value)
                                  }
                                  style={inputStyle}
                                />
                                <input
                                  value={editDietCalories}
                                  onChange={(e) =>
                                    setEditDietCalories(e.target.value)
                                  }
                                  style={inputStyle}
                                />
                                <button
                                  onClick={() => handleEditDiet(d.id)}
                                  disabled={savingEditDiet}
                                  style={{
                                    padding: "8px 12px",
                                    borderRadius: "6px",
                                    border: "none",
                                    background: "#22c55e",
                                    color: "white",
                                    fontSize: "13px",
                                    cursor: savingEditDiet
                                      ? "not-allowed"
                                      : "pointer",
                                  }}
                                >
                                  {savingEditDiet ? "Saving..." : "Save"}
                                </button>
                                <button
                                  onClick={() => setEditingDietId(null)}
                                  style={{
                                    padding: "8px 12px",
                                    borderRadius: "6px",
                                    border: "none",
                                    background: "#6b7280",
                                    color: "white",
                                    fontSize: "13px",
                                    cursor: "pointer",
                                  }}
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div
                                style={{
                                  background: "#0b1120",
                                  padding: "12px",
                                  borderRadius: "6px",
                                  borderLeft: "3px solid #22c55e",
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  flexWrap: "wrap",
                                  gap: "8px",
                                }}
                              >
                                <div>
                                  <p style={{ fontWeight: 600, fontSize: "14px" }}>
                                    {d.meal}
                                  </p>
                                  <p style={{ fontSize: "12px", color: "#9ca3af" }}>
                                    {d.time}
                                  </p>
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    gap: "8px",
                                    alignItems: "center",
                                  }}
                                >
                                  <p
                                    style={{
                                      fontWeight: 600,
                                      color: "#3b82f6",
                                      fontSize: "14px",
                                      margin: 0,
                                    }}
                                  >
                                    {d.calories} cal
                                  </p>
                                  <div style={{ display: "flex", gap: "6px" }}>
                                    <button
                                      onClick={() => {
                                        setEditingDietId(d.id);
                                        setEditDietTime(d.time);
                                        setEditDietMeal(d.meal);
                                        setEditDietCalories(String(d.calories));
                                      }}
                                      style={{
                                        padding: "4px 8px",
                                        borderRadius: "4px",
                                        border: "none",
                                        background: "#f59e0b",
                                        color: "white",
                                        fontSize: "12px",
                                        cursor: "pointer",
                                      }}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteDiet(d.id)}
                                      style={{
                                        padding: "4px 8px",
                                        borderRadius: "4px",
                                        border: "none",
                                        background: "#ef4444",
                                        color: "white",
                                        fontSize: "12px",
                                        cursor: "pointer",
                                      }}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </section>
                </>
              ) : (
                <div style={{ textAlign: "center", paddingTop: "40px" }}>
                  <p style={{ color: "#9ca3af" }}>
                    Select a client to view details
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: "6px",
  border: "1px solid #1f2937",
  background: "#020617",
  color: "white",
  fontSize: "13px",
};

function InfoCard(props: {
  label: string;
  value: string;
  highlight?: boolean;
  color?: string;
}) {
  return (
    <div
      style={{
        background: "#0b1120",
        padding: "16px",
        borderRadius: "8px",
        border: props.highlight ? "1px solid #3b82f6" : "1px solid #1f2937",
      }}
    >
      <p style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "4px" }}>
        {props.label}
      </p>
      <p
        style={{
          fontSize: "20px",
          fontWeight: 600,
          color: props.color || "white",
        }}
      >
        {props.value}
      </p>
    </div>
  );
}
