export type TabType = 'counter' | 'health' | 'money' | 'state' | 'tree' | 'sand' | 'more';

export interface MoneySettings {
  perDay: number;
  packPrice: number;
  packSize: number;
  cur: string;
}

export interface DayRating {
  mood: number; // 1..5
  craving: number; // 1..5
  anxiety: number; // 1..5
  tags?: string[];
  note?: string;
}

export interface Streak {
  from: number;
  to: number;
  note?: string;
}

export interface CravingLog {
  t: number;
  sec: number;
}

export type GoalCategory = 'gadget' | 'travel' | 'clothing' | 'experience' | 'gift' | 'health' | 'hobby' | 'other';

export interface SavingsGoal {
  id: string;
  name: string;
  amount: number;
  category?: GoalCategory;
  icon?: string;
  notes?: string;
  createdAt?: number;
}

export interface CompletedGoal extends SavingsGoal {
  at: number;
  total: number;
}

export interface CustomMilestoneGoal {
  id: string;
  title: string;
  targetDays?: number;
  targetDate?: number;
  icon?: string;
  createdAt: number;
}

export interface GoalsState {
  base: number;
  queue: SavingsGoal[];
  done: CompletedGoal[];
  customMilestones?: CustomMilestoneGoal[];
}

export type TreeSpeciesId = 'oak' | 'sakura' | 'pine' | 'apple' | 'maple';

export interface TreeSpeciesInfo {
  id: TreeSpeciesId;
  name: string;
  botanicalName: string;
  symbol: string;
  description: string;
  icon: string;
  accentColor: string;
  leafColor: string;
  leafColor2: string;
  trunkColor: string;
  specialDetail?: string; // flowers, apples, pinecones
  growDaysRealistic: number; // ~14-21 days of continuous smoke-free care
}

export interface TreeWeed {
  id: string;
  slot: number;
}

export interface CurrentTree {
  speciesId: TreeSpeciesId;
  plantedAt: number;
  growth: number; // 0..100%
  water: number; // 0..100%
  sun: number; // 0..100%
  food: number; // 0..100%
  lastTick: number;
  nextWeedAt: number;
  weeds: TreeWeed[];
}

export interface ForestTree {
  id: string;
  speciesId: TreeSpeciesId;
  plantedAt: number;
  grownAt: number;
}

export interface TreeState {
  forest: ForestTree[];
  current: CurrentTree | null;
}

export interface HealthMilestone {
  id: string;
  t: number; // ms
  title: string;
  category: 'cardio' | 'detox' | 'lungs' | 'senses' | 'immunity';
  icon: string;
  color: string;
  description: string;
  medicalFact: string;
}

export interface BodySystemStatus {
  name: string;
  icon: string;
  color: string;
  progress: number; // 0..100%
  description: string;
  timeRemainingText: string;
}
