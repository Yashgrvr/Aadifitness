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

// MOCK DATA - In-memory storage
export const mockClients: Record<string, ClientProfile> = {
  client_1: {
    id: "client_1",
    name: "Rohit Sharma",
    email: "rohit@example.com",
    joinDate: "Jan 15, 2025",
    currentWeight: 82,
    goalWeight: 75,
    plan: "Weight Loss - 12 weeks",
    workouts: [
      { id: "w1", exercise: "Barbell Squat", sets: "4", reps: "8", weight: "100 kg" },
      { id: "w2", exercise: "Leg Press", sets: "3", reps: "12", weight: "150 kg" },
      { id: "w3", exercise: "Romanian Deadlift", sets: "3", reps: "8", weight: "80 kg" },
    ],
    diet: [
      { id: "d1", time: "7:00 AM", meal: "Oats + Eggs", calories: 450 },
      { id: "d2", time: "1:00 PM", meal: "Chicken + Rice", calories: 650 },
      { id: "d3", time: "7:30 PM", meal: "Fish + Veggies", calories: 500 },
    ],
    sessionsCompleted: 8,
    sessionsTotal: 12,
    progress: 65,
    checklist: {
      "2025-12-01": { workout: false, diet: false },
      "2025-12-02": { workout: true, diet: false },
      "2025-12-03": { workout: false, diet: true },
    },
  },
  client_2: {
    id: "client_2",
    name: "Aditi Verma",
    email: "aditi@example.com",
    joinDate: "Jan 20, 2025",
    currentWeight: 68,
    goalWeight: 62,
    plan: "Glute Focus - 8 weeks",
    workouts: [
      { id: "w4", exercise: "Hip Thrust", sets: "4", reps: "10", weight: "50 kg" },
      { id: "w5", exercise: "Bulgarian Split Squat", sets: "3", reps: "12", weight: "20 kg" },
    ],
    diet: [
      { id: "d4", time: "7:30 AM", meal: "Pancakes + Berries", calories: 400 },
      { id: "d5", time: "12:00 PM", meal: "Fish + Sweet Potato", calories: 600 },
    ],
    sessionsCompleted: 3,
    sessionsTotal: 8,
    progress: 35,
    checklist: {
      "2025-12-01": { workout: true, diet: true },
    },
  },
  client_3: {
    id: "client_3",
    name: "Karan Mehta",
    email: "karan@example.com",
    joinDate: "Dec 10, 2024",
    currentWeight: 95,
    goalWeight: 85,
    plan: "Strength - 16 weeks",
    workouts: [
      { id: "w6", exercise: "Bench Press", sets: "5", reps: "5", weight: "100 kg" },
      { id: "w7", exercise: "Deadlift", sets: "3", reps: "5", weight: "150 kg" },
    ],
    diet: [
      { id: "d6", time: "6:00 AM", meal: "Protein Shake", calories: 350 },
      { id: "d7", time: "1:00 PM", meal: "Biryani + Chicken", calories: 800 },
    ],
    sessionsCompleted: 12,
    sessionsTotal: 16,
    progress: 75,
    checklist: {
      "2025-12-01": { workout: true, diet: true },
    },
  },
};
