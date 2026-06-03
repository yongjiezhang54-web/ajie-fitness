export type Profile = {
  id: string;
  email: string | null;
  created_at: string;
  updated_at: string;
};

export type TrainingPlan = {
  id: string;
  user_id: string;
  name: string;
  target: number;
  unit: string;
  icon: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type CheckIn = {
  id: string;
  user_id: string;
  plan_id: string;
  date: string; // YYYY-MM-DD
  completed: number;
  created_at: string;
};

export type TodayStatus = {
  plan_id: string;
  plan_name: string;
  icon: string | null;
  target: number;
  unit: string;
  completed: number;
  is_done: boolean;
};
