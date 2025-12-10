"use client";

import { useState, useEffect } from "react";

interface Workout {
  id: string;
  exercise: string;
  sets: string;
  reps: string;
  weight: string;
}

interface Diet {
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
  diets: Diet[];
  sessionsCompleted: number;
  sessionsTotal: number;
}

export default function TrainerDashboard() {
  const [name, setName] = useState("Trainer");
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showWorkoutForm, setShowWorkoutForm] = useState(false);
  const [showDietForm, setShowDietForm] = useState(false);
  const [editingWorkoutId, setEditingWorkoutId] = useState<string | null>(null);
  const [editingDietId, setEditingDietId] = useState<string | null>(null);
  const [showEditStats, setShowEditStats] = useState(false);

  const [workoutForm, setWorkoutForm] = useState({
    exercise: "",
    sets: "",
    reps: "",
    weight: "",
  });

  const [dietForm, setDietForm] = useState({
    time: "",
    meal: "",
    calories: "",
  });

  const [statsForm, setStatsForm] = useState({
    currentWeight: 0,
    goalWeight: 0,
    progress: 0,
    plan: "",
    sessionsCompleted: 0,
    sessionsTotal: 0,
  });

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    const storedName = localStorage.getItem("name") || "Trainer";

    if (storedRole !== "trainer") {
      window.location.href = "/login";
      return;
    }

    setName(storedName);
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const trainerId = localStorage.getItem("trainerId");
      const token = localStorage.getItem("token");

      if (!trainerId) return;

      const res = await fetch(`/api/clients?trainerId=${trainerId}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!res.ok) {
        console.error("Failed to load clients", await res.text());
        return;
      }

      const data = await res.json();
      setClients(data.clients || []);
      if (data.clients?.length) {
        setSelectedClient(data.clients[0]);
        initStatsForm(data.clients[0]);
      }
    } catch (err) {
      console.error("Error fetching clients:", err);
    }
  };

  const initStatsForm = (client: Client) => {
    setStatsForm({
      currentWeight: client.currentWeight,
      goalWeight: client.goalWeight,
      progress: client.progress,
      plan: client.plan,
      sessionsCompleted: client.sessionsCompleted,
      sessionsTotal: client.sessionsTotal,
    });
  };

  const handleAddWorkout = async () => {
    if (!selectedClient || !workoutForm.exercise) return;

    try {
      const res = await fetch("/api/clients/workout", {
        method: editingWorkoutId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClient.id,
          ...(editingWorkoutId && { id: editingWorkoutId }),
          ...workoutForm,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSelectedClient(data.client);
        setClients((prev) =>
          prev.map((c) => (c.id === data.client.id ? data.client : c))
        );
        setWorkoutForm({ exercise: "", sets: "", reps: "", weight: "" });
        setEditingWorkoutId(null);
        setShowWorkoutForm(false);
      }
    } catch (err) {
      console.error("Error saving workout:", err);
    }
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    if (!selectedClient) return;

    try {
      const res = await fetch("/api/clients/workout", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClient.id,
          id: workoutId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSelectedClient(data.client);
        setClients((prev) =>
          prev.map((c) => (c.id === data.client.id ? data.client : c))
        );
      }
    } catch (err) {
      console.error("Error deleting workout:", err);
    }
  };

  const handleEditWorkout = (workout: Workout) => {
    setEditingWorkoutId(workout.id);
    setWorkoutForm({
      exercise: workout.exercise,
      sets: workout.sets,
      reps: workout.reps,
      weight: workout.weight,
    });
    setShowWorkoutForm(true);
  };

  const handleAddDiet = async () => {
    if (!selectedClient || !dietForm.meal) return;

    try {
      const res = await fetch("/api/clients/diet", {
        method: editingDietId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClient.id,
          ...(editingDietId && { id: editingDietId }),
          time: dietForm.time,
          meal: dietForm.meal,
          calories: parseInt(dietForm.calories) || 0,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSelectedClient(data.client);
        setClients((prev) =>
          prev.map((c) => (c.id === data.client.id ? data.client : c))
        );
        setDietForm({ time: "", meal: "", calories: "" });
        setEditingDietId(null);
        setShowDietForm(false);
      }
    } catch (err) {
      console.error("Error saving diet:", err);
    }
  };

  const handleDeleteDiet = async (dietId: string) => {
    if (!selectedClient) return;

    try {
      const res = await fetch("/api/clients/diet", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClient.id,
          id: dietId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSelectedClient(data.client);
        setClients((prev) =>
          prev.map((c) => (c.id === data.client.id ? data.client : c))
        );
      }
    } catch (err) {
      console.error("Error deleting diet:", err);
    }
  };

  const handleEditDiet = (diet: Diet) => {
    setEditingDietId(diet.id);
    setDietForm({
      time: diet.time,
      meal: diet.meal,
      calories: String(diet.calories),
    });
    setShowDietForm(true);
  };

  const handleSaveStats = async () => {
    if (!selectedClient) return;

    try {
      // Ensure values are numbers
      const currentWeight = Number(statsForm.currentWeight) || 0;
      const goalWeight = Number(statsForm.goalWeight) || 0;
      const progress = Number(statsForm.progress) || 0;
      const sessionsCompleted = Number(statsForm.sessionsCompleted) || 0;
      const sessionsTotal = Number(statsForm.sessionsTotal) || 0;

      console.log("Sending:", {
        action: "updateStats",
        currentWeight,
        goalWeight,
        progress,
        plan: statsForm.plan,
        sessionsCompleted,
        sessionsTotal,
      });
  const res = await fetch(`/api/clients/${selectedClient.id}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    action: "updateStats",
    currentWeight,
    goalWeight,
    progress,
    plan: statsForm.plan,
    sessionsCompleted,
    sessionsTotal,
  }),
});


      console.log("Response status:", res.status);

      if (res.ok) {
        const data = await res.json();
        console.log("Stats updated successfully:", data);
        setSelectedClient(data.client);
        setClients((prev) =>
          prev.map((c) => (c.id === data.client.id ? data.client : c))
        );
        setShowEditStats(false);
        alert("✅ Stats updated successfully!");
      } else {
        const errorData = await res.json();
        console.error("Update failed:", errorData);
        alert("❌ Error: " + (errorData.error || "Failed to update stats"));
      }
    } catch (err) {
      console.error("Error updating stats:", err);
      alert("❌ Network error: " + String(err));
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div style={{ minHeight: "100vh", background: "#020617", color: "white" }}>
      {/* HEADER */}
      <header
        style={{
          padding: "20px 24px",
          borderBottom: "1px solid #1f2937",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "280px 1fr",
          minHeight: "calc(100vh - 80px)",
        }}
      >
        {/* SIDEBAR */}
        <div
          style={{
            background: "#0b1120",
            padding: "16px",
            borderRight: "1px solid #1f2937",
            overflowY: "auto",
          }}
        >
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
            Your Clients ({clients.length})
          </h3>
          <div style={{ display: "grid", gap: "8px" }}>
            {clients.map((client) => (
              <button
                key={client.id}
                onClick={() => {
                  setSelectedClient(client);
                  initStatsForm(client);
                }}
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

        {/* MAIN */}
        <div style={{ padding: "24px", overflowY: "auto" }}>
          {selectedClient ? (
            <>
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

              {/* EDIT STATS BUTTON */}
              <div style={{ marginBottom: "24px", textAlign: "right" }}>
                <button
                  onClick={() => setShowEditStats(!showEditStats)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "4px",
                    background: "#f59e0b",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: 600,
                    transition: "all 0.2s",
                  }}
                >
                  {showEditStats ? "✕ Cancel" : "📝 Edit Stats"}
                </button>
              </div>

              {/* EDIT STATS FORM */}
              {showEditStats && (
                <div
                  style={{
                    background: "#0b1120",
                    padding: "16px",
                    borderRadius: "6px",
                    marginBottom: "24px",
                    display: "grid",
                    gap: "12px",
                    borderLeft: "3px solid #f59e0b",
                  }}
                >
                  <div>
                    <label style={{ fontSize: "12px", color: "#9ca3af" }}>
                      Current Weight (kg)
                    </label>
                    <input
                      type="number"
                      value={statsForm.currentWeight}
                      onChange={(e) =>
                        setStatsForm({
                          ...statsForm,
                          currentWeight: Number(e.target.value) || 0,
                        })
                      }
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", color: "#9ca3af" }}>
                      Goal Weight (kg)
                    </label>
                    <input
                      type="number"
                      value={statsForm.goalWeight}
                      onChange={(e) =>
                        setStatsForm({
                          ...statsForm,
                          goalWeight: Number(e.target.value) || 0,
                        })
                      }
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", color: "#9ca3af" }}>
                      Progress (%)
                    </label>
                    <input
                      type="number"
                      value={statsForm.progress}
                      onChange={(e) =>
                        setStatsForm({
                          ...statsForm,
                          progress: Number(e.target.value) || 0,
                        })
                      }
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", color: "#9ca3af" }}>
                      Plan
                    </label>
                    <input
                      type="text"
                      value={statsForm.plan}
                      onChange={(e) =>
                        setStatsForm({
                          ...statsForm,
                          plan: e.target.value,
                        })
                      }
                      style={inputStyle}
                    />
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "12px",
                    }}
                  >
                    <div>
                      <label style={{ fontSize: "12px", color: "#9ca3af" }}>
                        Sessions Completed
                      </label>
                      <input
                        type="number"
                        value={statsForm.sessionsCompleted}
                        onChange={(e) =>
                          setStatsForm({
                            ...statsForm,
                            sessionsCompleted: Number(e.target.value) || 0,
                          })
                        }
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "12px", color: "#9ca3af" }}>
                        Sessions Total
                      </label>
                      <input
                        type="number"
                        value={statsForm.sessionsTotal}
                        onChange={(e) =>
                          setStatsForm({
                            ...statsForm,
                            sessionsTotal: Number(e.target.value) || 0,
                          })
                        }
                        style={inputStyle}
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleSaveStats}
                    style={{
                      padding: "10px",
                      borderRadius: "4px",
                      background: "#22c55e",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: 600,
                      transition: "all 0.2s",
                    }}
                  >
                    ✓ Save Stats
                  </button>
                </div>
              )}

              {/* WORKOUTS */}
              <section style={{ marginBottom: "24px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "12px",
                  }}
                >
                  <h2 style={{ fontSize: "18px", fontWeight: 600 }}>
                    💪 Workouts
                  </h2>
                  <button
                    onClick={() => {
                      setShowWorkoutForm(!showWorkoutForm);
                      if (editingWorkoutId) {
                        setEditingWorkoutId(null);
                        setWorkoutForm({
                          exercise: "",
                          sets: "",
                          reps: "",
                          weight: "",
                        });
                      }
                    }}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "4px",
                      background: "#3b82f6",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    {showWorkoutForm ? "✕ Cancel" : "+ Add Workout"}
                  </button>
                </div>

                {showWorkoutForm && (
                  <div
                    style={{
                      background: "#0b1120",
                      padding: "12px",
                      borderRadius: "6px",
                      marginBottom: "12px",
                      display: "grid",
                      gap: "8px",
                      borderLeft: "3px solid #3b82f6",
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Exercise (e.g., Barbell Squat)"
                      value={workoutForm.exercise}
                      onChange={(e) =>
                        setWorkoutForm({
                          ...workoutForm,
                          exercise: e.target.value,
                        })
                      }
                      style={inputStyle}
                    />
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: "8px",
                      }}
                    >
                      <input
                        type="text"
                        placeholder="Sets"
                        value={workoutForm.sets}
                        onChange={(e) =>
                          setWorkoutForm({
                            ...workoutForm,
                            sets: e.target.value,
                          })
                        }
                        style={inputStyle}
                      />
                      <input
                        type="text"
                        placeholder="Reps"
                        value={workoutForm.reps}
                        onChange={(e) =>
                          setWorkoutForm({
                            ...workoutForm,
                            reps: e.target.value,
                          })
                        }
                        style={inputStyle}
                      />
                      <input
                        type="text"
                        placeholder="Weight"
                        value={workoutForm.weight}
                        onChange={(e) =>
                          setWorkoutForm({
                            ...workoutForm,
                            weight: e.target.value,
                          })
                        }
                        style={inputStyle}
                      />
                    </div>
                    <button
                      onClick={handleAddWorkout}
                      style={{
                        padding: "8px",
                        borderRadius: "4px",
                        background: "#22c55e",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: 600,
                      }}
                    >
                      {editingWorkoutId ? "✓ Update Workout" : "✓ Save Workout"}
                    </button>
                  </div>
                )}

                <div style={{ display: "grid", gap: "8px" }}>
                  {selectedClient.workouts.map((w) => (
                    <div
                      key={w.id}
                      style={{
                        background: "#0b1120",
                        padding: "12px",
                        borderRadius: "6px",
                        borderLeft: "3px solid #3b82f6",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <p style={{ fontWeight: 600, fontSize: "14px" }}>
                            {w.exercise}
                          </p>
                          <p style={{ fontSize: "12px", color: "#9ca3af" }}>
                            {w.sets} sets × {w.reps} reps @ {w.weight}
                          </p>
                        </div>

                        <div style={{ display: "flex", gap: "4px" }}>
                          <button
                            onClick={() => handleEditWorkout(w)}
                            style={{
                              padding: "4px 8px",
                              borderRadius: "4px",
                              background: "#f59e0b",
                              color: "white",
                              border: "none",
                              cursor: "pointer",
                              fontSize: "12px",
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteWorkout(w.id)}
                            style={{
                              padding: "4px 8px",
                              borderRadius: "4px",
                              background: "#ef4444",
                              color: "white",
                              border: "none",
                              cursor: "pointer",
                              fontSize: "12px",
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
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
                  }}
                >
                  <h2 style={{ fontSize: "18px", fontWeight: 600 }}>
                    🍎 Diet Plan
                  </h2>
                  <button
                    onClick={() => {
                      setShowDietForm(!showDietForm);
                      if (editingDietId) {
                        setEditingDietId(null);
                        setDietForm({
                          time: "",
                          meal: "",
                          calories: "",
                        });
                      }
                    }}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "4px",
                      background: "#3b82f6",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    {showDietForm ? "✕ Cancel" : "+ Add Meal"}
                  </button>
                </div>

                {showDietForm && (
                  <div
                    style={{
                      background: "#0b1120",
                      padding: "12px",
                      borderRadius: "6px",
                      marginBottom: "12px",
                      display: "grid",
                      gap: "8px",
                      borderLeft: "3px solid #3b82f6",
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Time (e.g., 7:00 AM)"
                      value={dietForm.time}
                      onChange={(e) =>
                        setDietForm({ ...dietForm, time: e.target.value })
                      }
                      style={inputStyle}
                    />
                    <input
                      type="text"
                      placeholder="Meal (e.g., Chicken + Rice)"
                      value={dietForm.meal}
                      onChange={(e) =>
                        setDietForm({ ...dietForm, meal: e.target.value })
                      }
                      style={inputStyle}
                    />
                    <input
                      type="number"
                      placeholder="Calories"
                      value={dietForm.calories}
                      onChange={(e) =>
                        setDietForm({
                          ...dietForm,
                          calories: e.target.value,
                        })
                      }
                      style={inputStyle}
                    />
                    <button
                      onClick={handleAddDiet}
                      style={{
                        padding: "8px",
                        borderRadius: "4px",
                        background: "#22c55e",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: 600,
                      }}
                    >
                      {editingDietId ? "✓ Update Meal" : "✓ Save Meal"}
                    </button>
                  </div>
                )}

                <div style={{ display: "grid", gap: "8px" }}>
                  {(selectedClient.diets || []).map((d) => (
                    <div
                      key={d.id}
                      style={{
                        background: "#0b1120",
                        padding: "12px",
                        borderRadius: "6px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderLeft: "3px solid #22c55e",
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
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <p
                          style={{
                            fontWeight: 600,
                            color: "#3b82f6",
                            fontSize: "14px",
                          }}
                        >
                          {d.calories} cal
                        </p>
                        <button
                          onClick={() => handleEditDiet(d)}
                          style={{
                            padding: "4px 8px",
                            borderRadius: "4px",
                            background: "#f59e0b",
                            color: "white",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "12px",
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteDiet(d.id)}
                          style={{
                            padding: "4px 8px",
                            borderRadius: "4px",
                            background: "#ef4444",
                            color: "white",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "12px",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          ) : (
            <div style={{ textAlign: "center", paddingTop: "40px" }}>
              <p style={{ color: "#9ca3af" }}>Loading clients...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "8px",
  borderRadius: "4px",
  border: "1px solid #1f2937",
  background: "#1f2937",
  color: "white",
  fontSize: "14px",
  boxSizing: "border-box",
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