export type TabType = 'counter' | 'health' | 'money' | 'state' | 'tree' | 'sand' | 'dragon' | 'zen' | 'orbit' | 'more';

export interface DailyMicroStep {
  id: string;
  title: string;
  isCustom?: boolean;
  createdAt?: number;
}

export interface TriggerPlan {
  id: string;
  trigger: string; // "Якщо..."
  action: string;  // "То..."
  icon?: string;
  isCustom?: boolean;
}

export interface PriceTier {
  timestamp: number; // ms when this price started
  packPrice: number;
  note?: string;
}

export interface MoneySettings {
  perDay: number;
  packPrice: number;
  packSize: number;
  cur: string;
  minutesPerCig?: number;
  priceHistory?: PriceTier[];
}

export interface StateEntry {
  id: string;
  time: string; // "HH:MM"
  energy?: number; // 1..5 Енергія
  sleepQuality?: number; // 1..5 Виспаність
  focus?: number; // 1..5 Концентрація
  intrusiveThoughts?: number; // 1..5 Нав'язливі думки
  craving?: number; // 1..5 Тяга
  anxiety?: number; // 1..5 Тривожність
  balance?: number; // 1..5 Рівновага
  note?: string;
  // backward compatibility fields
  mood?: number;
  tags?: string[];
}

export interface MealLog {
  id: string;
  time: string; // "HH:MM"
  title: string; // "Сніданок", "Обід", "Вечеря", "Перекус" тощо
  note?: string;
}

export interface DrinkLog {
  id: string;
  time: string; // "HH:MM"
  type: 'coffee' | 'tea' | 'other' | string;
  title: string; // "Кава", "Чай" тощо
  note?: string;
}

export interface SleepLog {
  bedtime: string; // час коли заснув, e.g. "23:30"
  wakeTime?: string; // час пробудження, e.g. "07:30"
  hours: number; // тривалість сну в годинах, e.g. 8
  note?: string;
}

export interface DayRating {
  sleep?: SleepLog;
  meals?: MealLog[];
  drinks?: DrinkLog[];
  surveys?: StateEntry[]; // що30хвилинні опитування
  // backward compatibility
  mood?: number;
  craving?: number;
  anxiety?: number;
  tags?: string[];
  note?: string;
  entries?: StateEntry[];
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
  amount?: number;
  targetDate?: string;
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
  nickname?: string;
  oxygenProducedKg?: number;
}

export interface TreeState {
  forest: ForestTree[];
  current: CurrentTree | null;
  spentTimeSands?: number;
  ambienceTheme?: 'morning' | 'twilight' | 'night';
  ambientSoundEnabled?: boolean;
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

export interface DragonRelic {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlockedAt: number;
}

export interface DragonActiveBuff {
  id: string;
  name: string;
  icon: string;
  expiresAt: number; // timestamp
}

export interface DragonState {
  name: string;
  level: number;
  energy: number; // 0..100
  stardust: number;
  infernalDust: number;
  dungeonFloor: number;
  dungeonWins: number;
  totalBreaths: number;
  unlockedConstellations: string[];
  relics: DragonRelic[];
  activeBuffs?: DragonActiveBuff[];
  equippedArtifacts?: string[];
  affinity?: number; // 0..100 bonding with dragon
  lastFed?: number;
  lastBreathed?: number;
}

export interface ZenPlacedStone {
  id: string;
  typeId: string;
  xOffset: number; // horizontal displacement from tower center (-40 to 40)
  width: number;
  height: number;
  rotation: number; // degrees
  color: string;
  name: string;
  shape: 'oval' | 'pill' | 'crystal' | 'gem' | 'round' | 'trapezoid' | 'wedge' | 'slab' | 'pyramid' | 'hex' | 'crescent' | 'boulder';
  surfaceTilt?: number; // inherent slope of the top surface (-8 to +8 degrees)
  placedAt: number;
}

export interface ZenIslandState {
  totalSounds: number; // Лічильник звуків загалом
  heardInTime: number; // Звуків які юзер вчасно почув
  harmonyScore: number; // Zen points earned from mindful bell strikes
  bestStreak?: number; // Best consecutive strikes in presence
  cravingsDefeated?: number; // Total cravings overcome by mindfulness
  tremorsCalmed?: number; // Trembling stones calmed
  butterfliesMet?: number; // Butterflies welcomed
  ghostsDispelled?: number; // Craving phantoms dispelled
  soundEnabled: boolean;
  // legacy optional fields for backward compatibility
  currentTower?: ZenPlacedStone[];
  highestTower?: number;
  totalStonesPlaced?: number;
  unlockedStoneTypes?: string[];
}

export interface OrbitVoyageState {
  highScoreDistance: number; // max meters travelled in single flight
  totalFlights: number;
  cravingsCleared: number; // total orbital laps completed to bust craving
  oxygenCollected: number;
  stardustCollected: number;
  unlockedShips: string[];
  selectedShipId: string;
  soundEnabled: boolean;
}

