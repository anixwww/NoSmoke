import { DragonRelic } from '../types';

export const DRAGON_UNLOCK_CIGS = 0; // Accessible to all travelers immediately

export interface DragonStageInfo {
  id: 'hatchling' | 'nebula' | 'astral' | 'sovereign';
  name: string;
  stageNum: number;
  minCigs: number;
  nextCigs: number;
  description: string;
  careTip: string;
  color: string;
  glowColor: string;
  icon: string;
}

export const DRAGON_STAGES: DragonStageInfo[] = [
  {
    id: 'hatchling',
    name: 'Зоряне Драконятко',
    stageNum: 1,
    minCigs: 0,
    nextCigs: 50,
    description: 'Маленький допитливий дракончик, що живиться чистим подихом вашої свободи.',
    careTip: 'Гладьте дракончика пальцем, дихайте разом та підживлюйте зоряним пилом.',
    color: '#4CC9A0',
    glowColor: '#A7F3D0',
    icon: '🐲'
  },
  {
    id: 'nebula',
    name: 'Небулярний Дракон',
    stageNum: 2,
    minCigs: 50,
    nextCigs: 200,
    description: 'Крила виблискують смарагдовим астральним вогнем. Очищає розум від тяги та тривоги.',
    careTip: 'Підтримуйте енергію спільним диханням та зануренням у глибини підземелля.',
    color: '#06B6D4',
    glowColor: '#67E8F9',
    icon: '✨'
  },
  {
    id: 'astral',
    name: 'Астральний Охоронець',
    stageNum: 3,
    minCigs: 200,
    nextCigs: 500,
    description: 'Могутній космічний хранитель. Захищає вашу рішучість і дарує незворушний спокій.',
    careTip: 'Екіпіруйте потужні артефакти та викликайте найсильніших босів розлому.',
    color: '#A855F7',
    glowColor: '#E9D5FF',
    icon: '🌌'
  },
  {
    id: 'sovereign',
    name: 'Владика Галактик',
    stageNum: 4,
    minCigs: 500,
    nextCigs: 1000,
    description: 'Верховний володар чистої свідомості. Сяє як наднова зірка на безмежному небосхилі свободи.',
    careTip: 'Ви досягли вершини астрального союзу! Повна свобода від тютюну.',
    color: '#F59E0B',
    glowColor: '#FDE68A',
    icon: '👑'
  }
];

export function getDragonStage(cigsAvoided: number): DragonStageInfo {
  for (let i = DRAGON_STAGES.length - 1; i >= 0; i--) {
    if (cigsAvoided >= DRAGON_STAGES[i].minCigs) {
      return DRAGON_STAGES[i];
    }
  }
  return DRAGON_STAGES[0];
}

export interface ConstellationMission {
  id: string;
  name: string;
  subtitle: string;
  reqCigs: number;
  rewardStardust: number;
  relic: Omit<DragonRelic, 'unlockedAt'>;
}

export const CONSTELLATIONS: ConstellationMission[] = [
  {
    id: 'lungs',
    name: 'Сузір’я Чистих Легень',
    subtitle: 'Астральні вітри, що очищають дихальні шляхи',
    reqCigs: 500,
    rewardStardust: 20,
    relic: {
      id: 'sphere_lungs',
      name: 'Сфера Вільного Подиху',
      icon: '🔮',
      description: 'Легені очищено від смол. +20% до всього зоряного пилу та +15 до бойової сили.'
    }
  },
  {
    id: 'will',
    name: 'Сузір’я Сталевої Волі',
    subtitle: 'Метеоритний пояс непохитної рішучості',
    reqCigs: 650,
    rewardStardust: 30,
    relic: {
      id: 'shield_will',
      name: 'Метеоритний Щит',
      icon: '🛡️',
      description: 'Непробивна броня проти тригерів. +20% до всього зоряного пилу та +15 до бойової сили.'
    }
  },
  {
    id: 'calm',
    name: 'Сузір’я Дзен-Тиші',
    subtitle: 'Тиха колиска космічного умиротворення',
    reqCigs: 900,
    rewardStardust: 45,
    relic: {
      id: 'lotus_calm',
      name: 'Астральний Лотос',
      icon: '🪷',
      description: 'Глибокий внутрішній спокій. +20% до всього зоряного пилу та +15 до бойової сили.'
    }
  },
  {
    id: 'revival',
    name: 'Туманність Відродження',
    subtitle: 'Космічне горнило оновлення серця й судин',
    reqCigs: 1300,
    rewardStardust: 65,
    relic: {
      id: 'feather_phoenix',
      name: 'Перо Зоряного Фенікса',
      icon: '🪶',
      description: 'Символ переродження організму. +20% до всього зоряного пилу та +15 до бойової сили.'
    }
  },
  {
    id: 'eternity',
    name: 'Галактика Вічної Свободи',
    subtitle: 'Безмежний простір остаточної перемоги',
    reqCigs: 2000,
    rewardStardust: 100,
    relic: {
      id: 'crown_sovereign',
      name: 'Корона Володаря Космосу',
      icon: '👑',
      description: 'Повна свобода та автономія духу. +20% до всього зоряного пилу та +15 до бойової сили.'
    }
  }
];

export function getDragonLevelTitle(level: number): { title: string; icon: string; color: string } {
  if (level <= 3) return { title: 'Зоряне Драконятко', icon: '🥚', color: '#10B981' };
  if (level <= 8) return { title: 'Небулярний Летун', icon: '🐲', color: '#4CC9A0' };
  if (level <= 15) return { title: 'Астральний Охоронець', icon: '✨', color: '#06B6D4' };
  if (level <= 25) return { title: 'Владика Небес', icon: '🌌', color: '#A855F7' };
  if (level <= 40) return { title: 'Космічний Титан', icon: '⭐', color: '#EC4899' };
  return { title: 'Древній Зоряний Бог', icon: '👑', color: '#F59E0B' };
}

export function getLevelUpCost(level: number): number {
  return level * 15;
}

export function getRelicsDustMultiplier(relicsCount: number): number {
  // Кожна відкрита реліквія дає +20% до всього отриманого зоряного пилу
  return 1 + (relicsCount * 0.20);
}

export function calculateCombatPower(stardust: number, level: number, relicsCount: number = 0): number {
  // Зоряний пил - це бойова сила; рівень дає 10 очок за рівень; реліквії дають +15 до сили
  return Math.floor(stardust + (level * 10) + (relicsCount * 15));
}

export interface DungeonEnemy {
  floor: number;
  name: string;
  title: string;
  isBoss: boolean;
  hp: number;
  maxHp: number;
  power: number;
  icon: string;
  color: string;
  description: string;
  rewardStardust: number;
  rewardInfernalDust: number;
}

export const DUNGEON_PRESET_ENEMIES: Record<number, Omit<DungeonEnemy, 'maxHp'>> = {
  1: {
    floor: 1,
    name: 'Димний Шепіт',
    title: 'Первісна спокуса',
    isBoss: false,
    hp: 40,
    power: 20,
    icon: '🌫️',
    color: '#94A3B8',
    description: 'Легкий клубок тютюнового диму, що намагається затьмарити ваш подих.',
    rewardStardust: 20,
    rewardInfernalDust: 0
  },
  2: {
    floor: 2,
    name: 'Попільний Змій',
    title: 'Слід старих звичок',
    isBoss: false,
    hp: 75,
    power: 35,
    icon: '🐍',
    color: '#A8A29E',
    description: 'Звивається серед попелу колишніх сигарет, шиплячи отруйними думками.',
    rewardStardust: 30,
    rewardInfernalDust: 0
  },
  3: {
    floor: 3,
    name: 'Смоляний Ґолем',
    title: 'Тягар токсинів',
    isBoss: false,
    hp: 125,
    power: 55,
    icon: '🗿',
    color: '#475569',
    description: 'Важка істота із смоли, що колись забивала бронхи та забирала витривалість.',
    rewardStardust: 45,
    rewardInfernalDust: 0
  },
  4: {
    floor: 4,
    name: 'Нікотиновий Фантом',
    title: 'Фантом тривоги',
    isBoss: false,
    hp: 190,
    power: 80,
    icon: '👻',
    color: '#818CF8',
    description: 'Невидима тяга, яка підступно шепотіла при найменшому стресі.',
    rewardStardust: 60,
    rewardInfernalDust: 0
  },
  5: {
    floor: 5,
    name: 'Лорд Смоли та Спраги',
    title: 'Бос Першого Розлому',
    isBoss: true,
    hp: 290,
    power: 125,
    icon: '👹',
    color: '#EF4444',
    description: 'Грізний володар смолистого мороку. Знищіть його, щоб зібрати рідкісний Пекельний Пил!',
    rewardStardust: 100,
    rewardInfernalDust: 10 // 10 пекельного пилу!
  },
  6: {
    floor: 6,
    name: 'Ілюзія Затяжки',
    title: 'Міраж розслаблення',
    isBoss: false,
    hp: 380,
    power: 170,
    icon: '🌪️',
    color: '#C084FC',
    description: 'Оманливе відчуття, ніби дим заспокоював нерви.',
    rewardStardust: 120,
    rewardInfernalDust: 0
  },
  7: {
    floor: 7,
    name: 'Тінь Соціального Тиску',
    title: 'Курилка спокуси',
    isBoss: false,
    hp: 480,
    power: 220,
    icon: '👥',
    color: '#F59E0B',
    description: 'Колективний шепіт старих звичок «ходімо на хвилинку».',
    rewardStardust: 150,
    rewardInfernalDust: 0
  },
  8: {
    floor: 8,
    name: 'Пожирач Спокою',
    title: 'Хвиля роздратування',
    isBoss: false,
    hp: 600,
    power: 280,
    icon: '⚡',
    color: '#E11D48',
    description: 'Внутрішній неспокій, який ви тепер приборкуєте глибоким диханням.',
    rewardStardust: 180,
    rewardInfernalDust: 0
  },
  9: {
    floor: 9,
    name: 'Хмара Абстиненції',
    title: 'Бар’єр звільнення',
    isBoss: false,
    hp: 750,
    power: 340,
    icon: '🌋',
    color: '#7C3AED',
    description: 'Величезний темний смерч, у якому догорають залишки хімічної прив’язки.',
    rewardStardust: 220,
    rewardInfernalDust: 0
  },
  10: {
    floor: 10,
    name: 'Пекельний Архідемон Тютюну',
    title: 'Владика Тліючої Безодні',
    isBoss: true,
    hp: 980,
    power: 420,
    icon: '👿',
    color: '#DC2626',
    description: 'Верховний тиран тютюнового полону. Перемога над ним дарує колосальний тріумф і пекельну спадщину!',
    rewardStardust: 350,
    rewardInfernalDust: 20 // 20 пекельного пилу!
  }
};

export function getDungeonEnemy(floor: number): DungeonEnemy {
  const safeFloor = Math.max(1, floor);
  if (DUNGEON_PRESET_ENEMIES[safeFloor]) {
    const preset = DUNGEON_PRESET_ENEMIES[safeFloor];
    return {
      ...preset,
      maxHp: preset.hp
    };
  }

  // Нескінченна процедурна генерація після 10 поверху
  const isBoss = safeFloor % 5 === 0;
  const baseHp = Math.floor(safeFloor * 105);
  const basePower = Math.floor(safeFloor * 46);
  const rewardStardust = Math.floor(safeFloor * 25);
  const rewardInfernalDust = isBoss ? Math.floor(safeFloor * 2.5) : 0;

  return {
    floor: safeFloor,
    name: isBoss ? `Космічний Бегемот Розлому [Рівень ${safeFloor}]` : `Тіньовий Згубник [Рівень ${safeFloor}]`,
    title: isBoss ? `Пекельний Бос ${safeFloor} поверху` : `Вартовий ${safeFloor} поверху`,
    isBoss,
    hp: baseHp,
    maxHp: baseHp,
    power: basePower,
    icon: isBoss ? '👑' : '👾',
    color: isBoss ? '#EF4444' : '#8B5CF6',
    description: isBoss
      ? 'Могутній володар глибин розлому, що концентрує темну енергію токсинів.'
      : 'Астральна тіньова сутність, загартована глибинами підземелля.',
    rewardStardust,
    rewardInfernalDust
  };
}

// ==========================================
// ASTRAL ARTIFACTS SYSTEM (АРТЕФАКТИ ДРАКОНА)
// ==========================================
export interface AstralArtifact {
  id: string;
  name: string;
  icon: string;
  rarity: 'rare' | 'epic' | 'legendary';
  description: string;
  perkText: string;
  costStardust: number;
  costInfernalDust: number;
  effectType: 'stardust_boost' | 'defense' | 'energy_cost' | 'crit_power' | 'combat_power' | 'regen';
  effectValue: number;
}

export const DRAGON_ARTIFACTS: AstralArtifact[] = [
  {
    id: 'sphere_lungs',
    name: 'Сфера Вільного Подиху',
    icon: '🔮',
    rarity: 'rare',
    description: 'Астральна сфера, що вбирає чисте повітря і множить зоряну енергію.',
    perkText: '+25% до всього отриманого Зоряного пилу',
    costStardust: 50,
    costInfernalDust: 0,
    effectType: 'stardust_boost',
    effectValue: 0.25
  },
  {
    id: 'shield_will',
    name: 'Метеоритна Егіда',
    icon: '🛡️',
    rarity: 'rare',
    description: 'Сталевий щит з уламка комети, що відбиває темні токсичні імпульси.',
    perkText: '-30% шкоди від ворогів у Данжі',
    costStardust: 80,
    costInfernalDust: 0,
    effectType: 'defense',
    effectValue: 0.30
  },
  {
    id: 'phoenix_feather',
    name: 'Перо Зоряного Фенікса',
    icon: '🪶',
    rarity: 'epic',
    description: 'Легке вогняне перо переродження. Надає атакам дракона нищівного розмаху.',
    perkText: '+35% до критичного удару (Наднова)',
    costStardust: 140,
    costInfernalDust: 5,
    effectType: 'crit_power',
    effectValue: 0.35
  },
  {
    id: 'lotus_zen',
    name: 'Астральний Лотос Спокою',
    icon: '🪷',
    rarity: 'epic',
    description: 'Квітка глибокого дзену, що відновлює сили від простого дотику.',
    perkText: '+60 Max HP дракона та +15% відновлення енергії',
    costStardust: 180,
    costInfernalDust: 10,
    effectType: 'regen',
    effectValue: 0.15
  },
  {
    id: 'crown_sovereign',
    name: 'Корона Галактичного Владики',
    icon: '👑',
    rarity: 'legendary',
    description: 'Верховна реліквія переможців, викувана з тисячі невикурених сигарет.',
    perkText: '+50 постійної Бойової сили ⚔️',
    costStardust: 260,
    costInfernalDust: 20,
    effectType: 'combat_power',
    effectValue: 50
  },
  {
    id: 'heart_star',
    name: 'Серце Зорі',
    icon: '💎',
    rarity: 'legendary',
    description: 'Ядро надзвичайної чистоти, що живить усі бафи та подвоює їх силу.',
    perkText: 'Подвоює тривалість усіх бафів дракона',
    costStardust: 350,
    costInfernalDust: 30,
    effectType: 'stardust_boost',
    effectValue: 0.50
  }
];

// ==========================================
// ASTRAL BUFFS SYSTEM (БАФИ ТА БЛАГОСЛОВЕННЯ)
// ==========================================
export interface AstralBuffDef {
  id: string;
  name: string;
  icon: string;
  description: string;
  durationMinutes: number;
  costEnergy: number;
  effectType: 'stardust_multiplier' | 'power_boost' | 'shield_defense';
  effectValue: number;
}

export const DRAGON_BUFFS: AstralBuffDef[] = [
  {
    id: 'will_light',
    name: 'Сяйво Волі',
    icon: '🌟',
    description: 'Дракон огортає вас зоряним німбом, прискорюючи синтез пилу.',
    durationMinutes: 15,
    costEnergy: 15,
    effectType: 'stardust_multiplier',
    effectValue: 0.50 // +50% dust
  },
  {
    id: 'serenity_shield',
    name: 'Щит Спокою',
    icon: '🛡️',
    description: 'Знижує будь-яку тривогу та поглинає удари в битвах Данжу.',
    durationMinutes: 20,
    costEnergy: 20,
    effectType: 'shield_defense',
    effectValue: 0.40 // -40% damage taken
  },
  {
    id: 'dragon_fury',
    name: 'Астральна Лють',
    icon: '🔥',
    description: 'Дракон палає благородним полум’ям, значно збільшуючи шкоду.',
    durationMinutes: 10,
    costEnergy: 25,
    effectType: 'power_boost',
    effectValue: 0.35 // +35% combat power
  }
];

// ==========================================
// MEDITATIVE AUDIO SYNTHESIZER FOR DRAGON
// ==========================================
export class DragonSoundSynthesizer {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Soft purr / chime on petting
  playPet() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.18);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.35);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch {
      // Audio fallback
    }
  }

  // Sparkling stardust chime on feeding
  playFeed() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [392, 523.25, 659.25, 783.99]; // G4, C5, E5, G5

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const noteOsc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();
        const startTime = now + idx * 0.07;

        noteOsc.type = 'sine';
        noteOsc.frequency.setValueAtTime(freq, startTime);

        noteGain.gain.setValueAtTime(0.001, startTime);
        noteGain.gain.linearRampToValueAtTime(0.06, startTime + 0.03);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.35);

        noteOsc.connect(noteGain);
        noteGain.connect(this.ctx.destination);

        noteOsc.start(startTime);
        noteOsc.stop(startTime + 0.38);
      });
    } catch {
      // Audio fallback
    }
  }

  // Soft breathing chime
  playBreathSwell() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(261.63, now + 2); // Inhale up to C4

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, now);
      filter.frequency.linearRampToValueAtTime(600, now + 2);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.07, now + 1.2);
      gain.gain.linearRampToValueAtTime(0.0001, now + 2.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 2.6);
    } catch {}
  }

  // Level up fanfare
  playLevelUp() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const chord = [261.63, 329.63, 392.00, 523.25, 659.25]; // C major pentatonic

      chord.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = now + idx * 0.08;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(0.08, start + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(start);
        osc.stop(start + 0.65);
      });
    } catch {}
  }

  // Dungeon attack sound
  playAttack() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.18);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.24);
    } catch {}
  }
}

export const dragonAudio = new DragonSoundSynthesizer();

