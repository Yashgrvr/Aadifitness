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
  diets: Diet[]; // 👈 important
  sessionsCompleted: number;
  sessionsTotal: number;
  checklist?: Record<string, { workout: boolean; diet: boolean }>;
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

  // last 7 days
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
        setClientData(data);
        setChecklist(data.checklist || {});
        setWeightInput(String(data.currentWeight || ""));
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
      <div
        style={{
          minHeight: "100vh",
          background: "#f3f4f6",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <p style={{ color: "#6b7280" }}>Loading dashboard...</p>
      </div>
    );
  }

  const meals = clientData?.diets ?? [];

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6" }}>
      <header
        style={{
          padding: "20px 24px",
          background: "white",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 600, margin: 0 }}>
            Welcome, {name} 💪
          </h1>
          <p
            style={{
              color: "#6b7280",
              fontSize: "14px",
              margin: "4px 0 0 0",
            }}
          >
            Track your fitness progress
          </p>
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
            {/* Stats cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "16px",
                marginBottom: "24px",
              }}
            >
              <InfoCard
                label="Current Weight"
                value={`${clientData.currentWeight} kg`}
              />
              <InfoCard
                label="Goal Weight"
                value={`${clientData.goalWeight} kg`}
                highlight
              />
              <InfoCard
                label="Progress"
                value={`${clientData.progress}%`}
                color="#22c55e"
              />
              <InfoCard
                label="Sessions"
                value={`${clientData.sessionsCompleted}/${clientData.sessionsTotal}`}
              />
            </div>

            {/* ... baaki sections same rahte hain ... */}

            {/* Diet section */}
            <section>
              <h2
                style={{
                  fontSize: "18px",
                  fontWeight: 600,
                  marginBottom: "12px",
                }}
              >
                🍎 Today&apos;s Diet Plan
              </h2>
              <div style={{ display: "grid", gap: "8px" }}>
                {meals.length > 0 ? (
                  meals.map((d) => (
                    <div
                      key={d.id}
                      style={{
                        background: "white",
                        padding: "12px",
                        borderRadius: "6px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderLeft: "4px solid #22c55e",
                        border: "1px solid #e5e7eb",
                      }}
                    >
                      <div>
                        <p
                          style={{
                            fontWeight: 600,
                            fontSize: "14px",
                            margin: 0,
                          }}
                        >
                          {d.meal}
                        </p>
                        <p
                          style={{
                            fontSize: "12px",
                            color: "#6b7280",
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
                          fontSize: "14px",
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
                      padding: "20px",
                    }}
                  >
                    No meals yet
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
        background: "white",
        padding: "16px",
        borderRadius: "8px",
        border: props.highlight ? "2px solid #3b82f6" : "1px solid #e5e7eb",
      }}
    >
      <p
        style={{
          fontSize: "12px",
          color: "#6b7280",
          marginBottom: "4px",
          margin: 0,
        }}
      >
        {props.label}
      </p>
      <p
        style={{
          fontSize: "20px",
          fontWeight: 600,
          color: props.color || "#1f2937",
          margin: "4px 0 0 0",
        }}
      >
        {props.value}
      </p>
    </div>
  );
}
