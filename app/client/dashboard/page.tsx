"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Workout {
  id: string;
  exercise: string;
  sets: string;
  reps: string;
  weight: string;
  gifUrl?: string;
  day?: string;
  completed?: boolean;
}

interface Diet {
  id: string;
  time: string;
  meal: string;
  calories: number;
  completed?: boolean;
}

interface Client {
  id: string;
  name: string;
  email: string;
  initialWeight?: number;
  currentWeight: number;
  goalWeight: number;
  plan: string;
  progress: number;
  workouts: Workout[];
  diets: Diet[];
  sessionsCompleted: number;
  sessionsTotal: number;
}

// Days
const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;
type DayName = (typeof DAYS)[number];

// Checklist type: date -> { workouts: {workoutId: bool}, diets: {dietId: bool} }
type Checklist = Record<
  string,
  {
    workouts: Record<string, boolean>;
    diets: Record<string, boolean>;
  }
>;

export default function ClientDashboard() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [clientData, setClientData] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  const [activeDayView, setActiveDayView] = useState<DayName>("Monday");
  const [activeDate, setActiveDate] = useState("");

  const [checklist, setChecklist] = useState<Checklist>({});
  const [weightInput, setWeightInput] = useState("");
  const [initialWeightInput, setInitialWeightInput] = useState("");
  const [savingWeight, setSavingWeight] = useState(false);
  const [savingInitialWeight, setSavingInitialWeight] = useState(false);
  const [zoomGif, setZoomGif] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  // Helper to ensure date entry exists
  const ensureDate = (date: string, data: Checklist) => {
    if (!data[date]) {
      data[date] = { workouts: {}, diets: {} };
    }
  };

  // Helper: exact date for weekday
  const getISODateForWeekdayInCurrentWeek = (targetDay: DayName): string => {
    const now = new Date();
    const todayIdx = now.getDay();
    const targetIdx = DAYS.indexOf(targetDay);
    const diff = targetIdx - todayIdx;
    const d = new Date(now);
    d.setDate(now.getDate() + diff);
    return d.toISOString().split("T")[0];
  };

  // Save checklist
  const saveChecklist = (data: Checklist) => {
    localStorage.setItem("client_checklist_backup", JSON.stringify(data));
  };

  // Load checklist
  const loadChecklistBackup = () => {
    const backup = localStorage.getItem("client_checklist_backup");
    if (backup) {
      try {
        const parsed: Checklist = JSON.parse(backup);
        setChecklist(parsed);
        return parsed;
      } catch (err) {
        console.error("Backup load error:", err);
      }
    }
    return {};
  };

  useEffect(() => {
    const todayName = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
    }).format(new Date()) as DayName;
    const todayISO = new Date().toISOString().split("T")[0];

    setActiveDayView(todayName);
    setActiveDate(todayISO);

    const storedName = localStorage.getItem("name");
    const role = localStorage.getItem("role");
    const clientId = localStorage.getItem("clientId");

    if (!role || role !== "client") {
      router.replace("/login");
      return;
    }
    setName(storedName || "Client");
    loadChecklistBackup();

    if (clientId) fetchClientData(clientId);
  }, [router]);

  // Fetch client data + checklist
  const fetchClientData = async (clientId: string) => {
    try {
      const res = await fetch(`/api/clients/${clientId}`);
      if (res.ok) {
        const data = await res.json();
        const client = data.client ? data.client : data;

        setClientData({
          ...client,
          currentWeight: client.currentWeight || 0,
          goalWeight: client.goalWeight || 0,
          initialWeight: client.initialWeight || 0,
        });
        setWeightInput(String(client.currentWeight || 0));
        setInitialWeightInput(String(client.initialWeight || 0));

        // load checklist rows
        const cRes = await fetch(`/api/clients/${clientId}/checklist`);
        if (cRes.ok) {
          const cData: any[] = await cRes.json();
          const map: Checklist = {};
          cData.forEach((item) => {
            if (!map[item.date]) {
              map[item.date] = { workouts: {}, diets: {} };
            }
            if (item.type === "workout" && item.workoutId) {
              map[item.date].workouts[item.workoutId] = item.completed;
            }
            if (item.type === "diet" && item.dietId) {
              map[item.date].diets[item.dietId] = item.completed;
            }
          });
          setChecklist(map);
        }
      } else {
        console.error("Failed to fetch client:", res.status);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Weight progress calculation
  const calculateWeightProgress = () => {
    if (!clientData) return 0;

    const initialWeight = clientData.initialWeight || clientData.currentWeight;
    const currentWeight = clientData.currentWeight;
    const goalWeight = clientData.goalWeight;

    if (initialWeight === 0 || goalWeight === 0 || initialWeight === goalWeight)
      return 0;

    if (initialWeight > goalWeight) {
      const totalToLose = initialWeight - goalWeight;
      const alreadyLost = initialWeight - currentWeight;
      return Math.min(100, Math.round((alreadyLost / totalToLose) * 100));
    } else {
      const totalToGain = goalWeight - initialWeight;
      const alreadyGained = currentWeight - initialWeight;
      return Math.min(100, Math.round((alreadyGained / totalToGain) * 100));
    }
  };

  // Weekly completion (per day: any workout done)
  const getWeeklyProgress = () => {
    const weeks = 7;
    let completed = 0;
    for (let i = 0; i < weeks; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const dayChecks = checklist[dateStr];
      if (dayChecks && Object.values(dayChecks.workouts || {}).some(Boolean)) {
        completed++;
      }
    }
    return { completed, total: weeks };
  };

  // Filter workouts and diets by active day
  const filteredWorkouts =
    clientData?.workouts?.filter(
      (w) => (w.day || "").toLowerCase() === activeDayView.toLowerCase()
    ) || [];

  const filteredDiets = clientData?.diets || [];

  // Universal toggle
  const handleToggleItem = async (itemId: string, type: "workout" | "diet") => {
    const clientId = localStorage.getItem("clientId");
    if (!clientId || !itemId) return;

    const newChecklist: Checklist = { ...checklist };
    ensureDate(activeDate, newChecklist);

    if (type === "workout") {
      const current =
        newChecklist[activeDate].workouts[itemId] ?? false;
      newChecklist[activeDate].workouts[itemId] = !current;
    } else {
      const current = newChecklist[activeDate].diets[itemId] ?? false;
      newChecklist[activeDate].diets[itemId] = !current;
    }

    setChecklist(newChecklist);
    saveChecklist(newChecklist);

    try {
      await fetch(`/api/clients/${clientId}/checklist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: activeDate,
          type,
          workoutId: type === "workout" ? itemId : undefined,
          dietId: type === "diet" ? itemId : undefined,
          completed:
            type === "workout"
              ? newChecklist[activeDate].workouts[itemId]
              : newChecklist[activeDate].diets[itemId],
        }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Set initial weight
  const handleSetInitialWeight = async () => {
    const clientId = localStorage.getItem("clientId");
    if (!clientId || !clientData || !initialWeightInput) return;

    setSavingInitialWeight(true);
    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateInitialWeight",
          initialWeight: parseFloat(initialWeightInput),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const updated = data.client || data;
        setClientData({
          ...updated,
          currentWeight: updated.currentWeight || 0,
          goalWeight: updated.goalWeight || 0,
          initialWeight: updated.initialWeight || 0,
        });
        alert("✅ Initial weight set! Progress tracking started 🚀");
      } else {
        alert("❌ Error setting initial weight");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Server error");
    } finally {
      setSavingInitialWeight(false);
    }
  };

  // Update current weight
  const handleUpdateWeight = async () => {
    const clientId = localStorage.getItem("clientId");
    if (!clientId || !clientData) return;
    setSavingWeight(true);
    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateWeight",
          currentWeight: parseFloat(weightInput),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const updated = data.client || data;
        setClientData({
          ...updated,
          currentWeight: updated.currentWeight || 0,
          goalWeight: updated.goalWeight || 0,
          initialWeight: updated.initialWeight || 0,
        });
        alert(
          "🎉 Weight Updated! Your progress is: " +
            calculateWeightProgress() +
            "%"
        );
      }
    } finally {
      setSavingWeight(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
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
      } else {
        setPasswordError("Failed to change password");
      }
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) return <div style={loaderStyle}>Loading FitVibs...</div>;

  const weightProgress = calculateWeightProgress();
  const weeklyProgress = getWeeklyProgress();
  const showInitialWeightForm =
    !clientData?.initialWeight || clientData.initialWeight === 0;

  // Summary counts
  const completedWorkoutsCount = filteredWorkouts.filter(
    (w) => checklist[activeDate]?.workouts?.[w.id]
  ).length;
  const completedDietsCount = filteredDiets.filter(
    (d) => checklist[activeDate]?.diets?.[d.id]
  ).length;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f1419 0%, #1a1f2e 100%)",
        color: "#e5e7eb",
      }}
    >
      {/* HEADER */}
      <header style={headerStyle}>
        <div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 900,
              margin: 0,
              background: "linear-gradient(90deg, #3b82f6, #60a5fa)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            💪 Welcome, {name}!
          </h1>
          <p
            style={{
              fontSize: "12px",
              color: "#9ca3af",
              margin: "4px 0 0 0",
            }}
          >
            Keep grinding! Your transformation starts here 🚀
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => setShowPasswordModal(true)} style={btnSecondary}>
            🔐 Pass
          </button>
          <button
            onClick={() => {
              localStorage.removeItem("name");
              localStorage.removeItem("role");
              localStorage.removeItem("clientId");
              router.push("/login");
            }}
            style={btnDanger}
          >
            Logout
          </button>
        </div>
      </header>

      <main style={{ padding: "16px", maxWidth: "900px", margin: "0 auto" }}>
        {/* INITIAL WEIGHT */}
        {showInitialWeightForm && (
          <section
            style={{
              ...sectionBox,
              background: "rgba(16, 185, 129, 0.1)",
              border: "2px solid #10b981",
            }}
          >
            <h2 style={sectionTitle}>🎯 Set Your Starting Weight</h2>
            <p
              style={{
                fontSize: "12px",
                color: "#9ca3af",
                marginBottom: "12px",
              }}
            >
              💡 Your starting weight is crucial to track real progress!
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              <input
                type="number"
                step="0.1"
                placeholder="Starting Weight (kg)"
                value={initialWeightInput}
                onChange={(e) => setInitialWeightInput(e.target.value)}
                style={inputStyle}
              />
              <button
                onClick={handleSetInitialWeight}
                style={btnMain}
                disabled={savingInitialWeight}
              >
                {savingInitialWeight ? "Setting..." : "Set Initial"}
              </button>
            </div>
          </section>
        )}

        {/* PROGRESS SECTION */}
        <section style={sectionBox}>
          <h2 style={sectionTitle}>📈 Your Transformation Journey</h2>

          {/* Goal Progress */}
          <div style={{ marginBottom: "20px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <span style={{ fontSize: "13px", fontWeight: 600 }}>
                Goal Progress: {weightProgress}%
              </span>
              <span style={{ fontSize: "12px", color: "#9ca3af" }}>
                {clientData?.currentWeight || 0}kg →{" "}
                {clientData?.goalWeight || 0}kg
              </span>
            </div>
            <div style={progressBarBg}>
              <div
                style={{
                  ...progressBarFill,
                  width: `${weightProgress}%`,
                  background: "linear-gradient(90deg, #10b981, #34d399)",
                }}
              ></div>
            </div>
            <p
              style={{
                fontSize: "11px",
                color: "#9ca3af",
                margin: "8px 0 0 0",
              }}
            >
              {weightProgress === 0
                ? "⏳ Set initial weight to start tracking!"
                : weightProgress < 50
                ? "🔥 You're just getting started! Keep pushing!"
                : weightProgress < 100
                ? "💪 Halfway there! You're crushing it!"
                : "🏆 Goal achieved! Time for a new challenge!"}
            </p>
          </div>

          {/* Weekly Workouts */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "8px",
            }}
          >
            <span style={{ fontSize: "13px", fontWeight: 600 }}>
              Weekly Workouts: {weeklyProgress.completed}/
              {weeklyProgress.total}
            </span>
            <span style={{ fontSize: "12px", color: "#10b981" }}>
              🔥{" "}
              {Math.round(
                (weeklyProgress.completed / weeklyProgress.total) * 100
              )}
              % Complete
            </span>
          </div>
          <div style={progressBarBg}>
            <div
              style={{
                ...progressBarFill,
                width: `${
                  (weeklyProgress.completed / weeklyProgress.total) * 100
                }%`,
                background: "linear-gradient(90deg, #10b981, #34d399)",
              }}
            ></div>
          </div>

          {/* 3 cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "12px",
              marginTop: "16px",
            }}
          >
            <InfoCard
              label="Initial Weight"
              value={`${clientData?.initialWeight || 0}kg`}
              color="#9ca3af"
            />
            <InfoCard
              label="Current Weight"
              value={`${clientData?.currentWeight || 0}kg`}
              color="#3b82f6"
            />
            <InfoCard
              label="Goal Weight"
              value={`${clientData?.goalWeight || 0}kg`}
              color="#10b981"
            />
          </div>
        </section>

        {/* DAILY SUMMARY CARDS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
            marginBottom: "16px",
          }}
        >
          <CheckItem
            title="Workouts"
            done={completedWorkoutsCount === filteredWorkouts.length && filteredWorkouts.length > 0}
            emoji="🏋️"
            onClick={() => {}}
            subtext={`${completedWorkoutsCount}/${filteredWorkouts.length} Done`}
          />
          <CheckItem
            title="Diet Plan"
            done={completedDietsCount === filteredDiets.length && filteredDiets.length > 0}
            emoji="🥗"
            onClick={() => {}}
            subtext={`${completedDietsCount}/${filteredDiets.length} Done`}
          />
        </div>

        {/* WEEKLY WORKOUTS */}
        <section style={sectionBox}>
          <h2 style={sectionTitle}>📅 Weekly Workouts</h2>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "15px",
              overflowX: "auto",
              gap: "8px",
            }}
          >
            {DAYS.map((day) => (
              <button
                key={day}
                onClick={() => {
                  setActiveDayView(day);
                  setActiveDate(getISODateForWeekdayInCurrentWeek(day));
                }}
                style={activeDayView === day ? dayTabActive : dayTabInactive}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>
          {filteredWorkouts.length > 0 ? (
            filteredWorkouts.map((w) => {
              const completed =
                checklist[activeDate]?.workouts?.[w.id] || false;
              return (
                <div
                  key={w.id}
                  style={workoutRow}
                  onClick={() => w.gifUrl && setZoomGif(w.gifUrl)}
                >
                  <input
                    type="checkbox"
                    checked={completed}
                    onChange={() => handleToggleItem(w.id, "workout")}
                    style={{
                      width: "18px",
                      height: "18px",
                      cursor: "pointer",
                      accentColor: "#3b82f6",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <img
                    src={w.gifUrl || "/placeholder.png"}
                    style={thumbStyle}
                    alt={w.exercise}
                  />
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        fontWeight: 600,
                        fontSize: "14px",
                        color: completed ? "#64748b" : "#e5e7eb",
                      }}
                    >
                      {w.exercise}
                    </p>
                    <p
                      style={{
                        fontSize: "12px",
                        color: completed ? "#4b5563" : "#9ca3af",
                      }}
                    >
                      {w.sets} Sets × {w.reps} Reps{" "}
                      {w.weight && `@ ${w.weight}kg`}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <p
              style={{
                textAlign: "center",
                color: "#4b5563",
                padding: "20px",
              }}
            >
              🛏️ Keep Growing your Workout will be Updated Tomorrow
            </p>
          )}
        </section>

        {/* MEAL PLAN */}
        <section style={sectionBox}>
          <h2 style={sectionTitle}>🥗 Today's Meal Plan</h2>
          {clientData?.diets && clientData.diets.length > 0 ? (
            clientData.diets.map((d) => {
              const completed =
                checklist[activeDate]?.diets?.[d.id] || false;
              return (
                <div key={d.id} style={dietRowWithCheckbox}>
                  <input
                    type="checkbox"
                    checked={completed}
                    onChange={() => handleToggleItem(d.id, "diet")}
                    style={{
                      width: "18px",
                      height: "18px",
                      cursor: "pointer",
                      accentColor: "#10b981",
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <span
                      style={{
                        fontWeight: 500,
                        color: completed ? "#64748b" : "#e5e7eb",
                      }}
                    >
                      {d.time} - {d.meal}
                    </span>
                  </div>
                  <span
                    style={{
                      color: completed ? "#1d4ed8" : "#3b82f6",
                      fontWeight: 600,
                    }}
                  >
                    {d.calories} cal
                  </span>
                </div>
              );
            })
          ) : (
            <p style={{ fontSize: "12px", color: "#9ca3af" }}>
              No meals assigned yet
            </p>
          )}
        </section>

        {/* WEIGHT UPDATE */}
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
            <button
              onClick={handleUpdateWeight}
              style={btnMain}
              disabled={savingWeight}
            >
              {savingWeight ? "Saving..." : "Update"}
            </button>
          </div>
          <p
            style={{
              fontSize: "11px",
              color: "#9ca3af",
              marginTop: "8px",
            }}
          >
            💡 Updating weight will automatically recalculate your progress!
          </p>
        </section>
      </main>

      {/* GIF ZOOM */}
      {zoomGif && (
        <div style={overlay} onClick={() => setZoomGif(null)}>
          <img src={zoomGif} style={zoomedImg} alt="workout" />
        </div>
      )}

      {/* PASSWORD MODAL */}
      {showPasswordModal && (
        <div style={modalBg}>
          <div style={modalContent}>
            <h3
              style={{
                marginBottom: "15px",
                fontSize: "16px",
                fontWeight: 700,
              }}
            >
              🔐 Change Password
            </h3>
            <input
              type="password"
              placeholder="Old Password"
              style={inputStyle}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="New Password"
              style={{ ...inputStyle, marginTop: "10px" }}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirm Password"
              style={{ ...inputStyle, marginTop: "10px" }}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {passwordError && (
              <p
                style={{
                  color: "#ef4444",
                  fontSize: "12px",
                  marginTop: "8px",
                }}
              >
                ❌ {passwordError}
              </p>
            )}
            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "20px",
              }}
            >
              <button
                onClick={handleChangePassword}
                style={btnMain}
                disabled={savingPassword}
              >
                {savingPassword ? "Saving..." : "Change"}
              </button>
              <button
                onClick={() => setShowPasswordModal(false)}
                style={btnSecondary}
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

// Sub components
function InfoCard({ label, value, color }: any) {
  return (
    <div
      style={{
        background: "rgba(59, 130, 246, 0.1)",
        padding: "12px",
        borderRadius: "10px",
        border: `1px solid ${color}33`,
      }}
    >
      <p
        style={{
          fontSize: "11px",
          color: "#9ca3af",
          margin: 0,
          marginBottom: "4px",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: "16px",
          fontWeight: 700,
          margin: 0,
          color: color,
        }}
      >
        {value}
      </p>
    </div>
  );
}

function CheckItem({ title, done, emoji, onClick, subtext }: any) {
  return (
    <button
      onClick={onClick}
      style={{
        background: done
          ? "linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(52, 211, 153, 0.1))"
          : "#1a1f2e",
        border: `2px solid ${done ? "#10b981" : "#2d3748"}`,
        borderRadius: "14px",
        padding: "16px",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "6px",
        transition: "all 0.3s ease",
      }}
    >
      <span style={{ fontSize: "24px" }}>{emoji}</span>
      <span style={{ fontSize: "13px", fontWeight: 700 }}>{title}</span>
      <span style={{ fontSize: "10px", color: "#9ca3af" }}>{subtext}</span>
      <span
        style={{
          fontSize: "11px",
          color: done ? "#10b981" : "#4b5563",
          fontWeight: 500,
        }}
      >
        {done ? "✓ Completed" : "⏳ Pending"}
      </span>
    </button>
  );
}

// Styles
const headerStyle = {
  padding: "20px 16px",
  background: "#1a1f2e",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderBottom: "2px solid #2d3748",
};
const btnSecondary = {
  background: "none",
  border: "1.5px solid #3b82f6",
  color: "#3b82f6",
  padding: "6px 12px",
  borderRadius: "8px",
  fontSize: "12px",
  fontWeight: 600,
  cursor: "pointer",
};
const btnDanger = {
  background: "none",
  border: "1.5px solid #ef4444",
  color: "#ef4444",
  padding: "6px 12px",
  borderRadius: "8px",
  fontSize: "12px",
  fontWeight: 600,
  cursor: "pointer",
};
const sectionBox = {
  background: "#1a1f2e",
  padding: "16px",
  borderRadius: "16px",
  marginBottom: "16px",
  border: "1px solid #2d3748",
};
const sectionTitle = {
  fontSize: "12px",
  color: "#9ca3af",
  fontWeight: 700,
  textTransform: "uppercase" as "uppercase",
  marginBottom: "12px",
  letterSpacing: "0.5px",
};
const progressBarBg = {
  width: "100%",
  height: "12px",
  background: "#0f1419",
  borderRadius: "10px",
  overflow: "hidden",
};
const progressBarFill = {
  height: "100%",
  borderRadius: "10px",
  transition: "width 0.5s ease",
};
const dayTabActive = {
  background: "linear-gradient(90deg, #3b82f6, #60a5fa)",
  color: "#fff",
  border: "none",
  padding: "8px 14px",
  borderRadius: "8px",
  fontSize: "12px",
  fontWeight: 700,
  cursor: "pointer",
};
const dayTabInactive = {
  background: "#0f1419",
  color: "#9ca3af",
  border: "1px solid #2d3748",
  padding: "8px 14px",
  borderRadius: "8px",
  fontSize: "12px",
  cursor: "pointer",
};
const workoutRow = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  background: "#0f1419",
  padding: "12px",
  borderRadius: "12px",
  marginBottom: "10px",
  cursor: "pointer",
  transition: "all 0.2s",
};
const thumbStyle = {
  width: "55px",
  height: "55px",
  borderRadius: "10px",
  objectFit: "cover" as "cover",
};
const dietRowWithCheckbox = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "10px 0",
  borderBottom: "1px solid #ffffff08",
  fontSize: "13px",
};
const inputStyle = {
  flex: 1,
  padding: "12px",
  background: "#0f1419",
  border: "1.5px solid #2d3748",
  color: "white",
  borderRadius: "10px",
  fontSize: "13px",
};
const btnMain = {
  background: "linear-gradient(90deg, #3b82f6, #60a5fa)",
  color: "#fff",
  border: "none",
  padding: "10px 20px",
  borderRadius: "10px",
  fontWeight: 700,
  cursor: "pointer",
  transition: "all 0.2s",
};
const overlay = {
  position: "fixed" as "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.95)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};
const zoomedImg = {
  maxWidth: "90%",
  maxHeight: "80vh",
  borderRadius: "20px",
};
const loaderStyle = {
  minHeight: "100vh",
  background: "#0f1419",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  color: "#9ca3af",
  fontSize: "16px",
};
const modalBg = {
  position: "fixed" as "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.85)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1001,
};
const modalContent = {
  background: "#1a1f2e",
  padding: "24px",
  borderRadius: "16px",
  width: "90%",
  maxWidth: "400px",
  border: "1px solid #2d3748",
};
