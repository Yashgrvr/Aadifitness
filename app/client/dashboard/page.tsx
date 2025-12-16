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
  checklist?: Record<string, { workout: boolean; diet: boolean }>;
}

export default function ClientDashboard() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [clientData, setClientData] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [checklist, setChecklist] = useState<Record<string, { workout: boolean; diet: boolean }>>({});
  const [todayDate] = useState(new Date().toISOString().split("T")[0]);
  const [weightInput, setWeightInput] = useState("");
  const [savingWeight, setSavingWeight] = useState(false);

  // Last 7 days
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

  // Calculate weekly completion percentage
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

  // Calculate weight loss
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
        setChecklist(client.checklist || {});
        setWeightInput(String(client.currentWeight || ""));
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
      await fetch(`/api/clients/${clientId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateChecklist",
          date: todayDate,
          checklist: newChecklist[todayDate],
        }),
      });
    } catch (err) {
      console.error("Error updating checklist:", err);
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
      await fetch(`/api/clients/${clientId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateChecklist",
          date: todayDate,
          checklist: newChecklist[todayDate],
        }),
      });
    } catch (err) {
      console.error("Error updating checklist:", err);
    }
  };

  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", { weekday: "short" });
  };

  const getProgressColor = (dateStr: string) => {
    const dayData = checklist[dateStr];
    if (!dayData) return "#e5e7eb";
    const done = (dayData.workout ? 1 : 0) + (dayData.diet ? 1 : 0);
    if (done === 2) return "#22c55e";
    if (done === 1) return "#fbbf24";
    return "#ef4444";
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
        setClientData(data.client);
      }
    } catch (err) {
      console.error("Error updating weight:", err);
    } finally {
      setSavingWeight(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#f3f4f6", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <p style={{ color: "#6b7280" }}>Loading dashboard...</p>
      </div>
    );
  }

  const meals = clientData?.diets ?? [];
  const workouts = clientData?.workouts ?? [];
  const todayWorkout = checklist[todayDate]?.workout || false;
  const todayDiet = checklist[todayDate]?.diet || false;
  const weeklyCompletion = getWeeklyCompletion();

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6" }}>
      {/* Header */}
      <header style={{ padding: "20px 24px", background: "white", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 600, margin: 0 }}>Welcome, {name} 💪</h1>
          <p style={{ color: "#6b7280", fontSize: "14px", margin: "4px 0 0 0" }}>Track your fitness progress</p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: "8px 16px",
            borderRadius: "6px",
            border: "1px solid #d1d5db",
            background: "white",
            color: "#1f2937",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Logout
        </button>
      </header>

      <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
        {clientData ? (
          <>
            {/* Main Stats Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
              <InfoCard label="Current Weight" value={`${clientData.currentWeight} kg`} />
              <InfoCard label="Goal Weight" value={`${clientData.goalWeight} kg`} highlight />
              <InfoCard label="Weight Loss" value={`${getWeightLoss()} kg`} color="#3b82f6" />
              <InfoCard label="Weekly Completion" value={`${weeklyCompletion}%`} color="#22c55e" />
              <InfoCard label="Progress" value={`${clientData.progress}%`} color="#f59e0b" />
              <InfoCard label="Sessions" value={`${clientData.sessionsCompleted}/${clientData.sessionsTotal}`} />
            </div>

            {/* Plan Section */}
            <section style={{ background: "white", padding: "20px", borderRadius: "8px", marginBottom: "24px", borderLeft: "4px solid #3b82f6" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 600, margin: "0 0 8px 0" }}>📋 Your Plan</h2>
              <p style={{ fontSize: "14px", color: "#1f2937", margin: 0 }}>{clientData.plan || "No plan assigned"}</p>
            </section>

            {/* Weight Update Section */}
            <section style={{ background: "white", padding: "20px", borderRadius: "8px", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px" }}>⚖️ Update Weight</h2>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="number"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  placeholder="Enter weight in kg"
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                  }}
                />
                <button
                  onClick={handleUpdateWeight}
                  disabled={savingWeight}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "6px",
                    background: "#3b82f6",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                >
                  {savingWeight ? "Saving..." : "Update"}
                </button>
              </div>
            </section>

            {/* Today's Tasks */}
            <section style={{ background: "white", padding: "20px", borderRadius: "8px", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px" }}>✅ Today's Tasks</h2>
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
            <section style={{ background: "white", padding: "20px", borderRadius: "8px", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px" }}>📊 Weekly Progress</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px" }}>
                {last7Days.map((day) => {
                  const dayData = checklist[day];
                  const isDone = dayData && dayData.workout && dayData.diet;
                  return (
                    <div key={day} style={{ textAlign: "center" }}>
                      <div
                        style={{
                          width: "100%",
                          height: "60px",
                          borderRadius: "8px",
                          background: getProgressColor(day),
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          marginBottom: "8px",
                          color: "white",
                          fontWeight: 600,
                          fontSize: "20px",
                        }}
                      >
                        {isDone ? "✓" : "-"}
                      </div>
                      <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>{getDayName(day)}</p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Workouts Section */}
            <section style={{ background: "white", padding: "20px", borderRadius: "8px", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px" }}>🏋️ Assigned Workouts</h2>
              <div style={{ display: "grid", gap: "8px" }}>
                {workouts.length > 0 ? (
                  workouts.map((w) => (
                    <div
                      key={w.id}
                      style={{
                        background: "#f9fafb",
                        padding: "12px",
                        borderRadius: "6px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderLeft: "4px solid #3b82f6",
                      }}
                    >
                      <div>
                        <p style={{ fontWeight: 600, fontSize: "14px", margin: 0 }}>{w.exercise}</p>
                        <p style={{ fontSize: "12px", color: "#6b7280", margin: "4px 0 0 0" }}>
                          {w.sets} sets × {w.reps} reps @ {w.weight}
                        </p>
                      </div>
                      <input type="checkbox" style={{ width: "18px", height: "18px", cursor: "pointer" }} />
                    </div>
                  ))
                ) : (
                  <p style={{ color: "#6b7280", textAlign: "center", padding: "20px" }}>No workouts assigned yet</p>
                )}
              </div>
            </section>

            {/* Diet Section */}
            <section style={{ background: "white", padding: "20px", borderRadius: "8px", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px" }}>🍎 Today's Diet Plan</h2>
              <div style={{ display: "grid", gap: "8px" }}>
                {meals.length > 0 ? (
                  meals.map((d) => (
                    <div
                      key={d.id}
                      style={{
                        background: "#f9fafb",
                        padding: "12px",
                        borderRadius: "6px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderLeft: "4px solid #22c55e",
                      }}
                    >
                      <div>
                        <p style={{ fontWeight: 600, fontSize: "14px", margin: 0 }}>{d.meal}</p>
                        <p style={{ fontSize: "12px", color: "#6b7280", margin: "4px 0 0 0" }}>{d.time}</p>
                      </div>
                      <p style={{ fontWeight: 600, color: "#3b82f6", fontSize: "14px", margin: 0 }}>{d.calories} cal</p>
                    </div>
                  ))
                ) : (
                  <p style={{ color: "#6b7280", textAlign: "center", padding: "20px" }}>No meals assigned yet</p>
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
    </div>
  );
}

function InfoCard(props: { label: string; value: string; highlight?: boolean; color?: string }) {
  return (
    <div
      style={{
        background: "white",
        padding: "16px",
        borderRadius: "8px",
        border: props.highlight ? "2px solid #3b82f6" : "1px solid #e5e7eb",
      }}
    >
      <p style={{ fontSize: "12px", color: "#6b7280", margin: 0, marginBottom: "4px" }}>{props.label}</p>
      <p style={{ fontSize: "20px", fontWeight: 600, color: props.color || "#1f2937", margin: 0 }}>{props.value}</p>
    </div>
  );
}

function TaskCard(props: { title: string; completed: boolean; onClick: () => void; emoji: string }) {
  return (
    <button
      onClick={props.onClick}
      style={{
        padding: "16px",
        borderRadius: "8px",
        border: "2px solid " + (props.completed ? "#22c55e" : "#d1d5db"),
        background: props.completed ? "#dcfce7" : "white",
        cursor: "pointer",
        textAlign: "center",
        transition: "all 0.3s ease",
      }}
    >
      <p style={{ fontSize: "24px", margin: "0 0 8px 0" }}>{props.emoji}</p>
      <p style={{ fontSize: "14px", fontWeight: 600, color: "#1f2937", margin: 0 }}>{props.title}</p>
      <p style={{ fontSize: "12px", color: props.completed ? "#22c55e" : "#6b7280", margin: "4px 0 0 0" }}>
        {props.completed ? "✓ Completed" : "Not done yet"}
      </p>
    </button>
  );
}