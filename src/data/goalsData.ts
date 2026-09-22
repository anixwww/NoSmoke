import { GoalCategory } from '../types';

export interface GoalCategoryOption {
  id: GoalCategory;
  label: string;
  icon: string;
  color: string;
}

export const GOAL_CATEGORIES: GoalCategoryOption[] = [
  { id: 'gadget', label: 'Гаджети', icon: '🎧', color: '#3B82F6' },
  { id: 'travel', label: 'Подорожі', icon: '✈️', color: '#0EA5E9' },
  { id: 'clothing', label: 'Одяг & Взуття', icon: '👟', color: '#8B5CF6' },
  { id: 'experience', label: 'Враження', icon: '🍽️', color: '#EC4899' },
  { id: 'health', label: 'Здоров’я & Спорт', icon: '🏃', color: '#10B981' },
  { id: 'gift', label: 'Подарунки', icon: '🎁', color: '#F59E0B' },
  { id: 'hobby', label: 'Хобі & Книги', icon: '📚', color: '#6366F1' },
  { id: 'other', label: 'Інше', icon: '🎯', color: '#1E8A69' },
];

export interface GoalPreset {
  name: string;
  amount: number;
  category: GoalCategory;
  icon: string;
  description: string;
}

export const GOAL_PRESETS: GoalPreset[] = [
  {
    name: 'Святкова вечеря без сигарет',
    amount: 1000,
    category: 'experience',
    icon: '🍽️',
    description: 'Нагородити себе улюбленою вечерею в затишному закладі',
  },
  {
    name: 'Якісні бездротові навушники',
    amount: 3500,
    category: 'gadget',
    icon: '🎧',
    description: 'Слухати улюблену музику та подкасти на чистих прогулянках',
  },
  {
    name: 'Брендові бігові кросівки',
    amount: 4200,
    category: 'clothing',
    icon: '👟',
    description: 'Для легкого дихання і спорту без задишки',
  },
  {
    name: 'Абонемент у спортзал або басейн',
    amount: 5500,
    category: 'health',
    icon: '🏊',
    description: 'Відновлення форми та легень на повну силу',
  },
  {
    name: 'Смарт-годинник з пульсометром',
    amount: 7500,
    category: 'gadget',
    icon: '⌚',
    description: 'Слідкувати за серцем та здоровим ритмом сну',
  },
  {
    name: 'Вікенд у Карпатах на двох',
    amount: 9500,
    category: 'travel',
    icon: '🌲',
    description: 'Чисте гірське повітря та відпочинок для легень',
  },
  {
    name: 'Новий смартфон',
    amount: 25000,
    category: 'gadget',
    icon: '📱',
    description: 'Велике досягнення замість спалювання грошей у дим',
  },
  {
    name: 'Подорож за кордон до моря',
    amount: 35000,
    category: 'travel',
    icon: '🏖️',
    description: 'Мрія, профінансована відмовою від тютюну',
  },
];

export interface TimeMilestone {
  days: number;
  label: string;
  icon: string;
  achievement: string;
  fact: string;
}

export const TIME_MILESTONES: TimeMilestone[] = [
  {
    days: 1,
    label: '24 години',
    icon: '🌱',
    achievement: 'Перший день свободи',
    fact: 'Рівень чадного газу в крові повернувся до норми. Кисень насичує всі органи.',
  },
  {
    days: 3,
    label: '3 дні (72 години)',
    icon: '⚡',
    achievement: 'Фізичний пік подолано',
    fact: 'Нікотин повністю вийшов з тіла! Бронхіоли розслабляються, дихати стає легше.',
  },
  {
    days: 7,
    label: '1 тиждень',
    icon: '🌿',
    achievement: 'Повернення смаків та запахів',
    fact: 'Закінчення нюхових і смакових нервів відновили чутливість. Їжа має насичений смак.',
  },
  {
    days: 14,
    label: '2 тижні',
    icon: '🫁',
    achievement: 'Поліпшення кровообігу',
    fact: 'Кровообіг кінцівок поліпшується на 20-30%, ходьба і підйом сходами даються легше.',
  },
  {
    days: 21,
    label: '21 день (3 тижні)',
    icon: '🧠',
    achievement: 'Нова нейронна звичка',
    fact: 'Дофамінові рецептори починають працювати природно без нікотинового стимулу.',
  },
  {
    days: 30,
    label: '1 місяць',
    icon: '🏆',
    achievement: 'Місяць чистоти',
    fact: 'Кашель курця помітно стихає, клітини легеневого епітелію починають самоочищення.',
  },
  {
    days: 60,
    label: '2 місяці',
    icon: '🛡️',
    achievement: 'Психологічний щит',
    fact: 'Стресостійкість організму помітно вища, ніж під час постійних нікотинових "гойдалок".',
  },
  {
    days: 90,
    label: '3 місяці (100 днів)',
    icon: '✨',
    achievement: 'Оновлені легені',
    fact: 'Функція легень зросла на 10-15%. Ризик респіраторних інфекцій впав у рази.',
  },
  {
    days: 180,
    label: '6 місяців (пів року)',
    icon: '💎',
    achievement: 'Півроку абсолютного тріумфу',
    fact: 'Вії в легенях повністю відновили свою здатність очищати дихальні шляхи від інфекцій.',
  },
  {
    days: 365,
    label: '1 рік',
    icon: '👑',
    achievement: 'Золотий рік свободи',
    fact: 'Надвисоке досягнення: ризик ішемічної хвороби серця знижено вдвічі порівняно з курцем!',
  },
];

export interface CigaretteMilestone {
  count: number;
  label: string;
  icon: string;
  description: string;
}

export const CIGARETTE_MILESTONES: CigaretteMilestone[] = [
  { count: 50, label: '50 сигарет', icon: '🚭', description: '2.5 пачки не отруїли організм' },
  { count: 100, label: '100 сигарет', icon: '🥉', description: '5 пачок зберегли здоров’я і гаманець' },
  { count: 300, label: '300 сигарет', icon: '🌲', description: 'Висаджено 1 повне дерево у Саду свободи!' },
  { count: 500, label: '500 сигарет', icon: '🥈', description: 'Цілий блок сигарет (25 пачок) не торкнувся губ' },
  { count: 1000, label: '1 000 сигарет', icon: '🥇', description: '1000 отруйних димів оминули ваші легені' },
  { count: 2500, label: '2 500 сигарет', icon: '🌟', description: 'Легендарний показник залізної волі!' },
];
