// lib/data.ts

export interface Workout {
  id: string;
  exercise: string;
  sets: string;
  reps: string;
  weight: string;
}

export interface Diet {
  id: string;
  time: string;
  meal: string;
  calories: number;
}

export interface ClientProfile {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  currentWeight: number;
  goalWeight: number;
  plan: string;
  workouts: Workout[];
  diet: Diet[];
  sessionsCompleted: number;
  sessionsTotal: number;
  progress: number;
  checklist?: Record<string, { workout: boolean; diet: boolean }>;
}

// ❌ mockClients completely removed
