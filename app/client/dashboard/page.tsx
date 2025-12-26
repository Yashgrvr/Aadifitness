"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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

export default function ClientDashboard() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [clientData, setClientData] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [checklist, setChecklist] = useState<
    Record<string, { workout: boolean; diet: boolean }>
  >({});
  const [todayDate] = useState(new Date().toISOString().split("T")[0]);
  const [weightInput, setWeightInput] = useState("");
  const [savingWeight, setSavingWeight] = useState(false);

  // Password change state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const getLast7Days = () => {
    const days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split("T")[0]);
    }
    return days;
  };

  const last7Days = getLast7Days();

  const getWeeklyCompletion = () => {
    let completedDays = 0;
    last7Days.forEach((day) => {
      const dayData = checklist[day];
      if (dayData && dayData.workout && dayData.diet) {
        completedDays++;
      }
    });
    return Math.round((completedDays / 7) * 100);
  };

  // ✅ Weight-based progress calculation
  const getWeightProgress = () => {
    if (!clientData) return 0;
    const startWeight = clientData.goalWeight + (clientData.currentWeight - clientData.goalWeight);
    const totalLoss = startWeight - clientData.goalWeight;
    const currentLoss = startWeight - clientData.currentWeight;
    if (totalLoss <= 0) return 100;
    return Math.round((currentLoss / totalLoss) * 100);
  };

  const getWeightLoss = () => {
    if (!clientData) return 0;
    return Math.round((clientData.currentWeight - clientData.goalWeight) * 10) / 10;
  };

  useEffect(() => {
    const storedName = localStorage.getItem("name");
    const role = localStorage.getItem("role");
    const clientId = localStorage.getItem("clientId");

    if (!role || role !== "client") {
      router.replace("/login");
      return;
    }

    setName(storedName || "Client");

    if (clientId) {
      fetchClientData(clientId);
    }
  }, [router]);

  const fetchClientData = async (clientId: string) => {
    try {
      const res = await fetch(`/api/clients/${clientId}`);
      if (res.ok) {
        const data = await res.json();
        const client = data.client ?? data;

        setClientData(client);
        setWeightInput(String(client.currentWeight || ""));

        // ✅ GET checklistItems se map bana
        const cRes = await fetch(`/api/clients/${clientId}/checklist`);
        if (cRes.ok) {
          const cData: Array<{
            date: string;
            type: string;
            completed: boolean;
          }> = await cRes.json();
          const map: Record<string, { workout: boolean; diet: boolean }> = {};
          cData.forEach((item) => {
            if (!map[item.date]) {
              map[item.date] = { workout: false, diet: false };
            }
            if (item.type === "workout" || item.type === "diet") {
              map[item.date][item.type] = item.completed;
            }
          });
          setChecklist(map);
        }
      }
    } catch (err) {
      console.error("Error fetching client data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWorkout = async () => {
    const clientId = localStorage.getItem("clientId");
    if (!clientId || !clientData) return;

    const newChecklist = { ...checklist };
    if (!newChecklist[todayDate]) {
      newChecklist[todayDate] = { workout: false, diet: false };
    }
    newChecklist[todayDate].workout = !newChecklist[todayDate].workout;

    setChecklist(newChecklist);

    try {
      const res = await fetch(`/api/clients/${clientId}/checklist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: todayDate,
          type: "workout",
          completed: newChecklist[todayDate].workout,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setClientData((old) =>
          old
            ? {
                ...old,
                sessionsCompleted: updated.stats.sessionsCompleted,
                progress: updated.stats.progress,
              }
            : old
        );
      }
    } catch (err) {
      console.error("Error updating workout checklist:", err);
    }
  };

  const handleToggleDiet = async () => {
    const clientId = localStorage.getItem("clientId");
    if (!clientId || !clientData) return;

    const newChecklist = { ...checklist };
    if (!newChecklist[todayDate]) {
      newChecklist[todayDate] = { workout: false, diet: false };
    }
    newChecklist[todayDate].diet = !newChecklist[todayDate].diet;

    setChecklist(newChecklist);

    try {
      const res = await fetch(`/api/clients/${clientId}/checklist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: todayDate,
          type: "diet",
          completed: newChecklist[todayDate].diet,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setClientData((old) =>
          old
            ? {
                ...old,
                sessionsCompleted: updated.stats.sessionsCompleted,
                progress: updated.stats.progress,
              }
            : old
        );
      }
    } catch (err) {
      console.error("Error updating diet checklist:", err);
    }
  };

  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", { weekday: "short" });
  };

  const getProgressColor = (dateStr: string) => {
    const dayData = checklist[dateStr];
    if (!dayData) return "#374151";
    const done = (dayData.workout ? 1 : 0) + (dayData.diet ? 1 : 0);
    if (done === 2) return "#3b82f6";
    if (done === 1) return "#1e40af";
    return "#111827";
  };

  const handleUpdateWeight = async () => {
    const clientId = localStorage.getItem("clientId");
    if (!clientId || !clientData) return;

    const num = parseFloat(weightInput);
    if (isNaN(num) || num <= 0) {
      alert("Please enter a valid weight.");
      return;
    }

    setSavingWeight(true);
    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateWeight",
          currentWeight: num,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setClientData(data.client || data);
        alert("Weight updated successfully!");
      } else {
        alert("Failed to update weight");
      }
    } catch (err) {
      console.error("Error updating weight:", err);
      alert("Error updating weight");
    } finally {
      setSavingWeight(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }

    setSavingPassword(true);
    const clientId = localStorage.getItem("clientId");

    try {
      const res = await fetch("/api/clients/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          oldPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setPasswordSuccess("Password changed successfully!");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setShowPasswordModal(false), 2000);
      } else {
        setPasswordError(data.message || "Failed to change password");
      }
    } catch (err) {
      console.error("Error:", err);
      setPasswordError("Server error");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0f1419",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <p style={{ color: "#9ca3af" }}>Loading dashboard...</p>
      </div>
    );
  }

  const meals = clientData?.diets ?? [];
  const workouts = clientData?.workouts ?? [];
  const todayWorkout = checklist[todayDate]?.workout || false;
  const todayDiet = checklist[todayDate]?.diet || false;
  const weeklyCompletion = getWeeklyCompletion();
  const weightProgress = getWeightProgress();

  return (
    <div style={{ minHeight: "100vh", background: "#0f1419", color: "#e5e7eb" }}>
      {/* Header */}
      <header
        style={{
          padding: "20px 16px",
          background: "#1a1f2e",
          borderBottom: "1px solid #374151",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 600, margin: 0, color: "#fff" }}>
            Welcome, {name} 💪
          </h1>
          <p style={{ color: "#9ca3af", fontSize: "13px", margin: "4px 0 0 0" }}>
            Track your fitness progress
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            onClick={() => setShowPasswordModal(true)}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid #3b82f6",
              background: "transparent",
              color: "#3b82f6",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 500,
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#3b82f6";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#3b82f6";
            }}
          >
            🔐 Password
          </button>
          <button
            onClick={handleLogout}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid #ef4444",
              background: "transparent",
              color: "#ef4444",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 500,
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#ef4444";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#ef4444";
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <div
        style={{
          padding: "16px",
          maxWidth: "1200px",
          margin: "0 auto",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {clientData ? (
          <>
            {/* Main Stats Cards - 2x2 on mobile, 3x2 on tablet, 6 on desktop */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "12px",
                marginBottom: "20px",
              }}
            >
              <InfoCard label="Current Weight" value={`${clientData.currentWeight} kg`} />
              <InfoCard
                label="Goal Weight"
                value={`${clientData.goalWeight} kg`}
                highlight
              />
              <InfoCard
                label="Weight Loss"
                value={`${getWeightLoss()} kg`}
                color="#3b82f6"
              />
              <InfoCard
                label="Weight Progress"
                value={`${weightProgress}%`}
                color="#06b6d4"
              />
              <InfoCard
                label="Weekly Done"
                value={`${weeklyCompletion}%`}
                color="#22c55e"
              />
              <InfoCard
                label="Sessions"
                value={`${clientData.sessionsCompleted}/${clientData.sessionsTotal}`}
              />
            </div>

            {/* Plan Section */}
            <section
              style={{
                background: "#1a1f2e",
                padding: "16px",
                borderRadius: "8px",
                marginBottom: "16px",
                borderLeft: "4px solid #3b82f6",
              }}
            >
              <h2 style={{ fontSize: "15px", fontWeight: 600, margin: "0 0 8px 0", color: "#fff" }}>
                📋 Your Plan
              </h2>
              <p style={{ fontSize: "13px", color: "#d1d5db", margin: 0 }}>
                {clientData.plan || "No plan assigned"}
              </p>
            </section>

            {/* Weight Update Section */}
            <section
              style={{
                background: "#1a1f2e",
                padding: "16px",
                borderRadius: "8px",
                marginBottom: "16px",
              }}
            >
              <h2 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "12px", color: "#fff" }}>
                ⚖️ Update Weight
              </h2>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <input
                  type="number"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  placeholder="Enter weight in kg"
                  style={{
                    flex: 1,
                    minWidth: "120px",
                    padding: "10px 12px",
                    border: "1px solid #374151",
                    borderRadius: "6px",
                    fontSize: "13px",
                    background: "#111827",
                    color: "#e5e7eb",
                  }}
                />
                <button
                  onClick={handleUpdateWeight}
                  disabled={savingWeight}
                  style={{
                    padding: "10px 16px",
                    borderRadius: "6px",
                    background: "#3b82f6",
                    color: "white",
                    border: "none",
                    cursor: savingWeight ? "not-allowed" : "pointer",
                    fontSize: "13px",
                    fontWeight: 500,
                    opacity: savingWeight ? 0.6 : 1,
                    transition: "all 0.3s",
                  }}
                >
                  {savingWeight ? "Saving..." : "Update"}
                </button>
              </div>
            </section>

            {/* Today's Tasks */}
            <section
              style={{
                background: "#1a1f2e",
                padding: "16px",
                borderRadius: "8px",
                marginBottom: "16px",
              }}
            >
              <h2 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "12px", color: "#fff" }}>
                ✅ Today's Tasks
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <TaskCard
                  title="Workout"
                  completed={todayWorkout}
                  onClick={handleToggleWorkout}
                  emoji="🏋️"
                />
                <TaskCard
                  title="Diet"
                  completed={todayDiet}
                  onClick={handleToggleDiet}
                  emoji="🍎"
                />
              </div>
            </section>

            {/* Weekly Progress */}
            <section
              style={{
                background: "#1a1f2e",
                padding: "16px",
                borderRadius: "8px",
                marginBottom: "16px",
                overflowX: "auto",
              }}
            >
              <h2 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "12px", color: "#fff" }}>
                📊 Weekly Progress
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, minmax(50px, 1fr))",
                  gap: "8px",
                }}
              >
                {last7Days.map((day) => {
                  const dayData = checklist[day];
                  const isDone = dayData && dayData.workout && dayData.diet;
                  return (
                    <div key={day} style={{ textAlign: "center" }}>
                      <div
                        style={{
                          width: "100%",
                          aspectRatio: "1",
                          borderRadius: "8px",
                          background: getProgressColor(day),
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          marginBottom: "6px",
                          color: "white",
                          fontWeight: 600,
                          fontSize: "18px",
                          cursor: "pointer",
                          transition: "all 0.3s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "scale(1.05)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "scale(1)";
                        }}
                      >
                        {isDone ? "✓" : "-"}
                      </div>
                      <p style={{ fontSize: "11px", color: "#9ca3af", margin: 0 }}>
                        {getDayName(day)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Progress Bars Section */}
            <section
              style={{
                background: "#1a1f2e",
                padding: "16px",
                borderRadius: "8px",
                marginBottom: "16px",
              }}
            >
              <h2 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "16px", color: "#fff" }}>
                📈 Progress Overview
              </h2>

              {/* Weight Progress Bar */}
              <div style={{ marginBottom: "16px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "6px",
                  }}
                >
                  <label style={{ fontSize: "12px", color: "#d1d5db", fontWeight: 500 }}>
                    Weight Loss Progress
                  </label>
                  <span style={{ fontSize: "12px", color: "#3b82f6", fontWeight: 600 }}>
                    {weightProgress}%
                  </span>
                </div>
                <div
                  style={{
                    width: "100%",
                    height: "8px",
                    background: "#374151",
                    borderRadius: "4px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${weightProgress}%`,
                      background:
                        "linear-gradient(90deg, #3b82f6, #06b6d4)",
                      transition: "width 0.5s ease",
                    }}
                  />
                </div>
              </div>

              {/* Sessions Progress Bar */}
              <div style={{ marginBottom: "16px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "6px",
                  }}
                >
                  <label style={{ fontSize: "12px", color: "#d1d5db", fontWeight: 500 }}>
                    Sessions Completed
                  </label>
                  <span style={{ fontSize: "12px", color: "#22c55e", fontWeight: 600 }}>
                    {clientData.sessionsCompleted}/{clientData.sessionsTotal}
                  </span>
                </div>
                <div
                  style={{
                    width: "100%",
                    height: "8px",
                    background: "#374151",
                    borderRadius: "4px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${
                        clientData.sessionsTotal > 0
                          ? (clientData.sessionsCompleted /
                              clientData.sessionsTotal) *
                            100
                          : 0
                      }%`,
                      background:
                        "linear-gradient(90deg, #22c55e, #84cc16)",
                      transition: "width 0.5s ease",
                    }}
                  />
                </div>
              </div>

              {/* Weekly Completion */}
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "6px",
                  }}
                >
                  <label style={{ fontSize: "12px", color: "#d1d5db", fontWeight: 500 }}>
                    Weekly Completion
                  </label>
                  <span style={{ fontSize: "12px", color: "#f59e0b", fontWeight: 600 }}>
                    {weeklyCompletion}%
                  </span>
                </div>
                <div
                  style={{
                    width: "100%",
                    height: "8px",
                    background: "#374151",
                    borderRadius: "4px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${weeklyCompletion}%`,
                      background:
                        "linear-gradient(90deg, #f59e0b, #f97316)",
                      transition: "width 0.5s ease",
                    }}
                  />
                </div>
              </div>
            </section>

            {/* Workouts Section */}
            <section
              style={{
                background: "#1a1f2e",
                padding: "16px",
                borderRadius: "8px",
                marginBottom: "16px",
              }}
            >
              <h2 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "12px", color: "#fff" }}>
                🏋️ Assigned Workouts
              </h2>
              <div style={{ display: "grid", gap: "8px" }}>
                {workouts.length > 0 ? (
                  workouts.map((w) => (
                    <div
                      key={w.id}
                      style={{
                        background: "#111827",
                        padding: "12px",
                        borderRadius: "6px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderLeft: "4px solid #3b82f6",
                      }}
                    >
                      <div>
                        <p
                          style={{
                            fontWeight: 600,
                            fontSize: "13px",
                            margin: 0,
                            color: "#fff",
                          }}
                        >
                          {w.exercise}
                        </p>
                        <p
                          style={{
                            fontSize: "12px",
                            color: "#9ca3af",
                            margin: "4px 0 0 0",
                          }}
                        >
                          {w.sets} sets × {w.reps} reps @ {w.weight}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        style={{
                          width: "16px",
                          height: "16px",
                          cursor: "pointer",
                        }}
                      />
                    </div>
                  ))
                ) : (
                  <p
                    style={{
                      color: "#6b7280",
                      textAlign: "center",
                      padding: "16px",
                      fontSize: "13px",
                    }}
                  >
                    No workouts assigned yet
                  </p>
                )}
              </div>
            </section>

            {/* Diet Section */}
            <section
              style={{
                background: "#1a1f2e",
                padding: "16px",
                borderRadius: "8px",
                marginBottom: "16px",
              }}
            >
              <h2 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "12px", color: "#fff" }}>
                🍎 Today's Diet Plan
              </h2>
              <div style={{ display: "grid", gap: "8px" }}>
                {meals.length > 0 ? (
                  meals.map((d) => (
                    <div
                      key={d.id}
                      style={{
                        background: "#111827",
                        padding: "12px",
                        borderRadius: "6px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderLeft: "4px solid #22c55e",
                      }}
                    >
                      <div>
                        <p
                          style={{
                            fontWeight: 600,
                            fontSize: "13px",
                            margin: 0,
                            color: "#fff",
                          }}
                        >
                          {d.meal}
                        </p>
                        <p
                          style={{
                            fontSize: "12px",
                            color: "#9ca3af",
                            margin: "4px 0 0 0",
                          }}
                        >
                          {d.time}
                        </p>
                      </div>
                      <p
                        style={{
                          fontWeight: 600,
                          color: "#3b82f6",
                          fontSize: "12px",
                          margin: 0,
                        }}
                      >
                        {d.calories} cal
                      </p>
                    </div>
                  ))
                ) : (
                  <p
                    style={{
                      color: "#6b7280",
                      textAlign: "center",
                      padding: "16px",
                      fontSize: "13px",
                    }}
                  >
                    No meals assigned yet
                  </p>
                )}
              </div>
            </section>
          </>
        ) : (
          <div style={{ textAlign: "center", paddingTop: "40px" }}>
            <p style={{ color: "#6b7280" }}>No data available</p>
          </div>
        )}
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            padding: "16px",
          }}
        >
          <div
            style={{
              background: "#1a1f2e",
              padding: "20px",
              borderRadius: "8px",
              maxWidth: "400px",
              width: "100%",
              boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
              border: "1px solid #374151",
            }}
          >
            <h2
              style={{
                fontSize: "16px",
                fontWeight: 600,
                margin: "0 0 16px 0",
                color: "#fff",
              }}
            >
              🔐 Change Password
            </h2>

            {passwordError && (
              <div
                style={{
                  background: "#7f1d1d",
                  color: "#fca5a5",
                  padding: "12px",
                  borderRadius: "6px",
                  marginBottom: "12px",
                  fontSize: "13px",
                }}
              >
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div
                style={{
                  background: "#1f2937",
                  color: "#86efac",
                  padding: "12px",
                  borderRadius: "6px",
                  marginBottom: "12px",
                  fontSize: "13px",
                }}
              >
                {passwordSuccess}
              </div>
            )}

            <div style={{ display: "grid", gap: "12px", marginBottom: "16px" }}>
              <div>
                <label
                  style={{
                    fontSize: "12px",
                    color: "#9ca3af",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  Old Password
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter old password"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #374151",
                    borderRadius: "6px",
                    fontSize: "13px",
                    boxSizing: "border-box",
                    background: "#111827",
                    color: "#e5e7eb",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    fontSize: "12px",
                    color: "#9ca3af",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 8 chars)"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #374151",
                    borderRadius: "6px",
                    fontSize: "13px",
                    boxSizing: "border-box",
                    background: "#111827",
                    color: "#e5e7eb",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    fontSize: "12px",
                    color: "#9ca3af",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #374151",
                    borderRadius: "6px",
                    fontSize: "13px",
                    boxSizing: "border-box",
                    background: "#111827",
                    color: "#e5e7eb",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={handleChangePassword}
                disabled={savingPassword}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: "6px",
                  background: "#3b82f6",
                  color: "white",
                  border: "none",
                  cursor: savingPassword ? "not-allowed" : "pointer",
                  fontSize: "13px",
                  fontWeight: 500,
                  opacity: savingPassword ? 0.6 : 1,
                }}
              >
                {savingPassword ? "Saving..." : "Change Password"}
              </button>
              <button
                onClick={() => setShowPasswordModal(false)}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: "6px",
                  background: "#374151",
                  color: "#e5e7eb",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 500,
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoCard(props: {
  label: string;
  value: string;
  highlight?: boolean;
  color?: string;
}) {
  return (
    <div
      style={{
        background: "#1a1f2e",
        padding: "16px",
        borderRadius: "8px",
        border: props.highlight ? "2px solid #3b82f6" : "1px solid #374151",
      }}
    >
      <p
        style={{
          fontSize: "11px",
          color: "#9ca3af",
          margin: 0,
          marginBottom: "6px",
          fontWeight: 500,
        }}
      >
        {props.label}
      </p>
      <p
        style={{
          fontSize: "18px",
          fontWeight: 600,
          color: props.color || "#e5e7eb",
          margin: 0,
        }}
      >
        {props.value}
      </p>
    </div>
  );
}

function TaskCard(props: {
  title: string;
  completed: boolean;
  onClick: () => void;
  emoji: string;
}) {
  return (
    <button
      onClick={props.onClick}
      style={{
        padding: "16px",
        borderRadius: "8px",
        border: "2px solid " + (props.completed ? "#3b82f6" : "#374151"),
        background: props.completed ? "#1e3a8a" : "#111827",
        cursor: "pointer",
        textAlign: "center",
        transition: "all 0.3s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#3b82f6";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = props.completed
          ? "#3b82f6"
          : "#374151";
      }}
    >
      <p style={{ fontSize: "24px", margin: "0 0 8px 0" }}>{props.emoji}</p>
      <p style={{ fontSize: "13px", fontWeight: 600, color: "#fff", margin: 0 }}>
        {props.title}
      </p>
      <p
        style={{
          fontSize: "11px",
          color: props.completed ? "#3b82f6" : "#6b7280",
          margin: "4px 0 0 0",
        }}
      >
        {props.completed ? "✓ Completed" : "Not done yet"}
      </p>
    </button>
  );
}
