import React, { useState, useEffect, useRef } from 'react';
import {
  Brain,
  Zap,
  Sparkles,
  RotateCcw,
  Plus,
  Trash2,
  CheckCircle2,
  HelpCircle,
  Award,
  ChevronRight,
  Workflow
} from 'lucide-react';

interface NeuroNode {
  id: string;
  label: string;
  emoji: string;
  description: string;
  // Node coordinate positions in percentage of the board
  x: number;
  y: number;
  type: 'start' | 'intermediate' | 'target';
}

interface NeuroLevel {
  id: string;
  title: string;
  startEmoji: string;
  targetEmoji: string;
  description: string;
  nodes: NeuroNode[];
  insight: string;
}

const INITIAL_LEVELS: NeuroLevel[] = [
  {
    id: 'lvl-coffee',
    title: 'Ранкова кава ☕ ➔ Зубна щітка 🪥',
    startEmoji: '☕',
    targetEmoji: '🪥',
    description: 'Знайдіть корисну заміну автоматичному ритуалу куріння після ранкової кави.',
    insight: 'Чудово! Коли ви замість сигарети випиваєте прохолодну воду та чистите зуби свіжою пастою, ваші смакові рецептори перезапускаються. Мозок створює новий міцний зв\'язок «Кава ➔ Чистота».',
    nodes: [
      { id: 'start', label: 'Ранкова кава', emoji: '☕', description: 'Твій основний ранковий тригер', x: 10, y: 50, type: 'start' },
      { id: 'water', label: 'Склянка води', emoji: '💧', description: 'Прохолодна вода омиває рецептори', x: 40, y: 20, type: 'intermediate' },
      { id: 'breath', label: 'Глибокі зітхання', emoji: '🌬️', description: '5 глибоких вдихів для насичення киснем', x: 40, y: 80, type: 'intermediate' },
      { id: 'mint', label: 'М\'ятна жуйка', emoji: '🌿', description: 'Свіжий м\'ятний смак вбиває бажання затяжки', x: 70, y: 50, type: 'intermediate' },
      { id: 'target', label: 'Зубна щітка', emoji: '🪥', description: 'Фінал: ідеально чисті зуби та свіжий подих', x: 90, y: 50, type: 'target' }
    ]
  },
  {
    id: 'lvl-stress',
    title: 'Гострий стрес ⚡ ➔ Присідання 🏃',
    startEmoji: '⚡',
    targetEmoji: '🏃',
    description: 'Перемкніть раптовий спалах адреналіну з куріння на корисну фізичну активність.',
    insight: 'Супер! Сплеск адреналіну під час стресу вимагає дії. Фізичне навантаження (присідання чи розминка) спалює кортизол і вивільняє природні ендорфіни замість штучного дофаміну від нікотину.',
    nodes: [
      { id: 'start', label: 'Гострий стрес', emoji: '⚡', description: 'Раптовий тригер: дзвінок чи конфлікт', x: 10, y: 50, type: 'start' },
      { id: 'sigh', label: 'Зітхання Губермана', emoji: '🌬️', description: 'Подвійний вдих носом, довгий видих ротом', x: 40, y: 20, type: 'intermediate' },
      { id: 'cold-water', label: 'Холодне вмивання', emoji: '❄️', description: 'Вмикає рефлекс нирця та уповільнює пульс', x: 40, y: 80, type: 'intermediate' },
      { id: 'stretch', label: 'Швидка розминка', emoji: '🧘', description: 'Зняття м\'язових затисків у плечах', x: 70, y: 50, type: 'intermediate' },
      { id: 'target', label: '15 присідань', emoji: '🏃', description: 'Викид ендорфінів та зняття напруги', x: 90, y: 50, type: 'target' }
    ]
  },
  {
    id: 'lvl-boredom',
    title: 'Нудьга / Пауза ⏳ ➔ Тест легень 🌬️',
    startEmoji: '⏳',
    targetEmoji: '🌬️',
    description: 'Заповніть вільну хвилинку під час очікування дихальним челенджем.',
    insight: 'Чудово! Нудьга — це просто пошук швидкого дофаміну. Замість сигарети ви тепер тренуєте свої легені тестом Штанге. Це перетворює порожню паузу на інструмент оздоровлення.',
    nodes: [
      { id: 'start', label: 'Пауза чи нудьга', emoji: '⏳', description: 'Очікування або перерва у роботі', x: 10, y: 50, type: 'start' },
      { id: 'tea', label: 'Зелений чай', emoji: '🍵', description: 'Повільне чаювання, що займає руки', x: 40, y: 20, type: 'intermediate' },
      { id: 'puzzle', label: 'Швидкий пазл', emoji: '🧩', description: 'Інтелектуальне фокусування на 1 хвилину', x: 40, y: 80, type: 'intermediate' },
      { id: 'stretching', label: 'Потягування', emoji: '💪', description: 'Насичення м\'язів киснем', x: 70, y: 50, type: 'intermediate' },
      { id: 'target', label: 'Тест Штанге', emoji: '🌬️', description: 'Затримка дихання на витривалість', x: 90, y: 50, type: 'target' }
    ]
  }
];

const STARDUST_KEY = 'quit-smoking:neuro-stardust';
const COMPLETED_LEVELS_KEY = 'quit-smoking:completed-neuro-levels';

export const TriggerActionPlans: React.FC = () => {
  const [levels, setLevels] = useState<NeuroLevel[]>(() => {
    try {
      const saved = localStorage.getItem('quit-smoking:custom-neuro-levels');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return [...INITIAL_LEVELS, ...parsed];
      }
    } catch {}
    return INITIAL_LEVELS;
  });

  const [activeLevelIdx, setActiveLevelIdx] = useState(0);
  const activeLevel = levels[activeLevelIdx] || levels[0];

  const [selectedPath, setSelectedPath] = useState<string[]>(['start']);
  const [synapticEnergy, setSynapticEnergy] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STARDUST_KEY);
      if (saved) return Number(saved);
    } catch {}
    return 150;
  });

  const [completedLevels, setCompletedLevels] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(COMPLETED_LEVELS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successCelebration, setSuccessCelebration] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<NeuroNode | null>(null);

  // Custom connection form
  const [showCreator, setShowCreator] = useState(false);
  const [customTrigger, setCustomTrigger] = useState('');
  const [customSubstitute, setCustomSubstitute] = useState('');
  const [customEmojiStart, setCustomEmojiStart] = useState('☕');
  const [customEmojiEnd, setCustomEmojiEnd] = useState('🪥');

  useEffect(() => {
    localStorage.setItem(STARDUST_KEY, String(synapticEnergy));
  }, [synapticEnergy]);

  useEffect(() => {
    localStorage.setItem(COMPLETED_LEVELS_KEY, JSON.stringify(completedLevels));
  }, [completedLevels]);

  const handleNodeClick = (node: NeuroNode) => {
    if (successCelebration) return;
    setErrorMsg(null);

    // If start node, reset to just start
    if (node.id === 'start') {
      setSelectedPath(['start']);
      return;
    }

    // Check if node is already selected
    if (selectedPath.includes(node.id)) {
      // Allow deselecting the last selected item
      if (selectedPath[selectedPath.length - 1] === node.id) {
        setSelectedPath((prev) => prev.filter((id) => id !== node.id));
      }
      return;
    }

    // Business Logic Rule: Cannot jump straight to target!
    if (node.type === 'target') {
      if (selectedPath.length < 3) {
        setErrorMsg('❌ Прямий зв\'язок занадто слабкий! Мозку потрібні проміжні корисні дії-замінники, щоб розірвати стару звичку.');
        return;
      }
      
      // Successfully complete connection!
      setSelectedPath((prev) => [...prev, node.id]);
      setSuccessCelebration(true);
      
      // Reward points if not already completed
      const alreadyWon = completedLevels.includes(activeLevel.id);
      if (!alreadyWon) {
        setCompletedLevels((prev) => [...prev, activeLevel.id]);
        setSynapticEnergy((prev) => prev + 50);
      }
      return;
    }

    // Add intermediate node to connection
    setSelectedPath((prev) => [...prev, node.id]);
  };

  const handleResetLevel = () => {
    setSelectedPath(['start']);
    setSuccessCelebration(false);
    setErrorMsg(null);
  };

  const handleNextLevel = () => {
    setSuccessCelebration(false);
    setSelectedPath(['start']);
    setErrorMsg(null);
    setActiveLevelIdx((prev) => (prev + 1) % levels.length);
  };

  const handleCreateCustomLevel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTrigger.trim() || !customSubstitute.trim()) return;

    const newLevelId = `lvl-custom-${Date.now()}`;
    const newLevel: NeuroLevel = {
      id: newLevelId,
      title: `${customTrigger.trim()} ${customEmojiStart} ➔ ${customSubstitute.trim()} ${customEmojiEnd}`,
      startEmoji: customEmojiStart,
      targetEmoji: customEmojiEnd,
      description: `Створіть свій здоровий ланцюжок від тригера "${customTrigger.trim()}" до корисної заміни.`,
      insight: `Чудово! Твій унікальний нейронний зв'язок створено. Кожного разу під час тригера "${customTrigger.trim()}" виконуй обрані дії замість куріння!`,
      nodes: [
        { id: 'start', label: customTrigger.trim(), emoji: customEmojiStart, description: 'Твій кастомний тригер', x: 10, y: 50, type: 'start' },
        { id: 'water', label: 'Випити води', emoji: '💧', description: 'Зволоження та перезапуск рецепторів', x: 40, y: 20, type: 'intermediate' },
        { id: 'breath', label: 'Подихати', emoji: '🌬️', description: 'Антистресове дихання заспокоює тягу', x: 40, y: 80, type: 'intermediate' },
        { id: 'walk', label: 'Змінити місце', emoji: '🚶', description: 'Рухове перемикання уваги', x: 70, y: 50, type: 'intermediate' },
        { id: 'target', label: customSubstitute.trim(), emoji: customEmojiEnd, description: 'Твоя корисна дія-замінник', x: 90, y: 50, type: 'target' }
      ]
    };

    const updatedLevels = [...levels, newLevel];
    setLevels(updatedLevels);
    
    // Save custom levels to storage (filtering initial levels)
    const customOnly = updatedLevels.filter(lvl => lvl.id.startsWith('lvl-custom-'));
    localStorage.setItem('quit-smoking:custom-neuro-levels', JSON.stringify(customOnly));

    setCustomTrigger('');
    setCustomSubstitute('');
    setShowCreator(false);
    setActiveLevelIdx(updatedLevels.length - 1);
    setSelectedPath(['start']);
    setSuccessCelebration(false);
  };

  const handleDeleteLevel = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!id.startsWith('lvl-custom-')) return;
    
    if (confirm('Видалити цей кастомний нейрошлях?')) {
      const updatedLevels = levels.filter(lvl => lvl.id !== id);
      setLevels(updatedLevels);
      
      const customOnly = updatedLevels.filter(lvl => lvl.id.startsWith('lvl-custom-'));
      localStorage.setItem('quit-smoking:custom-neuro-levels', JSON.stringify(customOnly));
      
      setActiveLevelIdx(0);
      setSelectedPath(['start']);
      setSuccessCelebration(false);
      setErrorMsg(null);
    }
  };

  // Connect node coordinates for drawing lines
  const getCoordinatesForNodeId = (id: string) => {
    const node = activeLevel.nodes.find((n) => n.id === id);
    if (!node) return { x: 0, y: 0 };
    return { x: node.x, y: node.y };
  };

  return (
    <div className="bg-white/90 dark:bg-[#1c1c21]/90 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-3xl p-5 shadow-xs relative overflow-hidden transition-all duration-200">
      {/* Sparkles Background Effect */}
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <Brain className="w-24 h-24 text-emerald-500 animate-pulse" />
      </div>

      {/* Header Info */}
      <div className="flex items-center justify-between gap-2 mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-[#1E8A69] dark:text-[#4CC9A0] flex items-center justify-center">
            <Workflow className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-sm font-black text-[#12302B] dark:text-[#f4f4f5] flex items-center gap-1">
              <span>Нейрограф: Нові Звʼязки</span>
              <span className="text-xs bg-emerald-500/10 text-[#1E8A69] dark:text-[#4CC9A0] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">Гра</span>
            </h3>
            <p className="text-[11px] text-[#55726B] dark:text-[#8FAAA3]">
              Перебудуй шлях звички від кави ☕ до зубної щітки 🪥
            </p>
          </div>
        </div>

        {/* Dynamic Synaptic Energy Badge */}
        <div className="bg-gradient-to-r from-amber-500/15 to-emerald-500/15 border border-amber-500/30 px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
          <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
          <span className="text-xs font-bold font-mono text-[#12302B] dark:text-[#f4f4f5]">
            {synapticEnergy} <span className="text-[9px] text-[#55726B] dark:text-[#8FAAA3] uppercase">NE</span>
          </span>
        </div>
      </div>

      {/* Level Selection Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-4 scrollbar-none">
        {levels.map((lvl, idx) => {
          const isSelected = activeLevelIdx === idx;
          const isDone = completedLevels.includes(lvl.id);
          const isCustom = lvl.id.startsWith('lvl-custom-');
          return (
            <div key={lvl.id} className="relative flex-none">
              <button
                type="button"
                onClick={() => {
                  setActiveLevelIdx(idx);
                  setSelectedPath(['start']);
                  setSuccessCelebration(false);
                  setErrorMsg(null);
                }}
                className={`py-1.5 px-3 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#1E8A69] text-white shadow-xs scale-102'
                    : 'bg-[#CBDDD7]/40 dark:bg-[#1D3832]/20 text-[#55726B] dark:text-[#8FAAA3] hover:bg-[#CBDDD7]/60'
                }`}
              >
                <span>{lvl.startEmoji}➔{lvl.targetEmoji}</span>
                {isDone && <span className="text-[10px]" title="Вирішено">✓</span>}
              </button>
              {isCustom && (
                <button
                  type="button"
                  onClick={(e) => handleDeleteLevel(lvl.id, e)}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center text-[8px] cursor-pointer shadow-2xs"
                  title="Видалити"
                >
                  ✕
                </button>
              )}
            </div>
          );
        })}

        <button
          type="button"
          onClick={() => setShowCreator(!showCreator)}
          className="py-1.5 px-3 rounded-full text-xs font-bold border border-dashed border-[#1E8A69]/50 text-[#1E8A69] dark:text-[#4CC9A0] hover:bg-emerald-500/10 flex items-center gap-1 flex-none cursor-pointer"
        >
          <Plus className="w-3 h-3" />
          <span>Свій звʼязок</span>
        </button>
      </div>

      {/* Custom Level Creator Form inside the component */}
      {showCreator && (
        <form onSubmit={handleCreateCustomLevel} className="mb-4 p-4 bg-emerald-500/5 border border-[#1E8A69]/30 rounded-2xl space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#12302B] dark:text-[#f4f4f5]">
              Новий кастомний нейроланцюжок
            </span>
            <button
              type="button"
              onClick={() => setShowCreator(false)}
              className="text-[10px] text-rose-500 hover:underline cursor-pointer"
            >
              Скасувати
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] font-bold text-[#55726B] dark:text-[#8FAAA3] block mb-1">
                1. ТРИГЕР (НАПРИКЛАД: КАВА, СТРЕС)
              </label>
              <div className="flex gap-1">
                <select
                  value={customEmojiStart}
                  onChange={(e) => setCustomEmojiStart(e.target.value)}
                  className="p-1.5 text-sm bg-white dark:bg-[#121212] border border-[#B7CDC6] dark:border-[#2d2d35] rounded-xl outline-none"
                >
                  {['☕', '⚡', '🍽️', '🚗', '🍻', '⏳', '💻', '📞', '🌧️'].map(e => <option key={e} value={e}>{e}</option>)}
                </select>
                <input
                  type="text"
                  placeholder="Ранкова кава"
                  value={customTrigger}
                  onChange={(e) => setCustomTrigger(e.target.value)}
                  className="w-full py-1 px-2 text-xs bg-white dark:bg-[#121212] border border-[#B7CDC6] dark:border-[#2d2d35] rounded-xl outline-none"
                  maxLength={30}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[9px] font-bold text-[#55726B] dark:text-[#8FAAA3] block mb-1">
                2. КОРИСНА ДІЯ-ЗАМІНИК
              </label>
              <div className="flex gap-1">
                <select
                  value={customEmojiEnd}
                  onChange={(e) => setCustomEmojiEnd(e.target.value)}
                  className="p-1.5 text-sm bg-white dark:bg-[#121212] border border-[#B7CDC6] dark:border-[#2d2d35] rounded-xl outline-none"
                >
                  {['🪥', '🏃', '🌬️', '💧', '🍵', '🧘', '🍎', '🧴', '🚶'].map(e => <option key={e} value={e}>{e}</option>)}
                </select>
                <input
                  type="text"
                  placeholder="Зубна щітка"
                  value={customSubstitute}
                  onChange={(e) => setCustomSubstitute(e.target.value)}
                  className="w-full py-1 px-2 text-xs bg-white dark:bg-[#121212] border border-[#B7CDC6] dark:border-[#2d2d35] rounded-xl outline-none"
                  maxLength={30}
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-[#1E8A69] hover:bg-[#167054] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ініціалізувати новий нейронний шлях</span>
          </button>
        </form>
      )}

      {/* Objective Banner */}
      <div className="p-3 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent rounded-2xl border border-emerald-500/20 mb-4">
        <p className="text-xs text-[#12302B] dark:text-[#f4f4f5] font-semibold leading-relaxed">
          🎯 Ціль: <span className="font-bold">{activeLevel.description}</span>
        </p>
      </div>

      {/* Main Game Neural Board Screen */}
      <div className="relative w-full h-72 bg-[#E9F1EE]/60 dark:bg-[#121215]/80 border-2 border-dashed border-[#B7CDC6] dark:border-[#2d2d35]/60 rounded-2xl overflow-hidden shadow-inner">
        
        {/* SVG Synapse Connection Lines Layer */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
          {/* Static dotted blueprint lines */}
          {activeLevel.nodes.map((node) => {
            if (node.type === 'start') return null;
            // Draw lines from start to intermediates, and intermediates to target
            const startNode = activeLevel.nodes.find((n) => n.id === 'start');
            if (startNode && node.type === 'intermediate') {
              return (
                <line
                  key={`static-${startNode.id}-${node.id}`}
                  x1={`${startNode.x}%`}
                  y1={`${startNode.y}%`}
                  x2={`${node.x}%`}
                  y2={`${node.y}%`}
                  stroke="#CBDDD7"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  className="dark:stroke-neutral-800"
                />
              );
            }
            if (node.type === 'target') {
              return activeLevel.nodes
                .filter((n) => n.type === 'intermediate')
                .map((inter) => (
                  <line
                    key={`static-${inter.id}-${node.id}`}
                    x1={`${inter.x}%`}
                    y1={`${inter.y}%`}
                    x2={`${node.x}%`}
                    y2={`${node.y}%`}
                    stroke="#CBDDD7"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    className="dark:stroke-neutral-800"
                  />
                ));
            }
            return null;
          })}

          {/* Active Glowing Synaptic Pathways */}
          {selectedPath.map((nodeId, idx) => {
            if (idx === 0) return null;
            const fromCoords = getCoordinatesForNodeId(selectedPath[idx - 1]);
            const toCoords = getCoordinatesForNodeId(nodeId);

            return (
              <g key={`active-group-${idx}`}>
                {/* Thick glow underlay */}
                <line
                  x1={`${fromCoords.x}%`}
                  y1={`${fromCoords.y}%`}
                  x2={`${toCoords.x}%`}
                  y2={`${toCoords.y}%`}
                  stroke="#10B981"
                  strokeWidth="8"
                  strokeLinecap="round"
                  opacity="0.3"
                  className="animate-pulse"
                />
                {/* Main sharp neon line */}
                <line
                  x1={`${fromCoords.x}%`}
                  y1={`${fromCoords.y}%`}
                  x2={`${toCoords.x}%`}
                  y2={`${toCoords.y}%`}
                  stroke="#10B981"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  className="animate-dash"
                />
                {/* Glowing moving signal impulse pebble */}
                <circle r="4" fill="#67E8F9" className="animate-pulse">
                  <animateMotion
                    dur="1.2s"
                    repeatCount="indefinite"
                    path={`M ${fromCoords.x * 3.5},${fromCoords.y * 2.8} L ${toCoords.x * 3.5},${toCoords.y * 2.8}`}
                    /* Approximate coordinate mapping for responsive SVG scale */
                  />
                </circle>
              </g>
            );
          })}
        </svg>

        {/* Floating Brain Nodes */}
        {activeLevel.nodes.map((node) => {
          const isSelected = selectedPath.includes(node.id);
          const isLastSelected = selectedPath[selectedPath.length - 1] === node.id;
          const isSelectable = !isSelected && (
            (node.type === 'intermediate') ||
            (node.type === 'target' && selectedPath.length >= 3)
          );

          return (
            <div
              key={node.id}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group"
              onMouseEnter={() => setHoveredNode(node)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <button
                type="button"
                onClick={() => handleNodeClick(node)}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-xl cursor-pointer transition-all duration-300 relative ${
                  isSelected
                    ? 'bg-[#1E8A69] border-2 border-emerald-400 text-white shadow-md shadow-emerald-500/20 scale-110'
                    : isSelectable
                    ? 'bg-white dark:bg-[#1c1c21] border-2 border-emerald-500/40 hover:border-emerald-500 hover:scale-105 hover:shadow-2xs'
                    : 'bg-white/70 dark:bg-[#1c1c21]/50 border border-neutral-300 dark:border-neutral-800 opacity-60'
                }`}
              >
                {/* Glow ring for active end elements */}
                {isLastSelected && (
                  <span className="absolute -inset-1.5 rounded-full border border-emerald-400 animate-ping opacity-60" />
                )}
                {/* Gentle bounce animation for current target suggestions */}
                {isSelectable && node.type === 'target' && (
                  <span className="absolute -inset-1 rounded-full border-2 border-dashed border-emerald-500 animate-pulse" />
                )}
                
                <span>{node.emoji}</span>
              </button>

              {/* Node Tiny Under-Label */}
              <span className={`absolute top-full mt-1.5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-center whitespace-nowrap px-1.5 py-0.5 rounded-md backdrop-blur-xs transition-colors duration-200 ${
                isSelected
                  ? 'text-[#1E8A69] dark:text-[#4CC9A0] bg-emerald-500/10'
                  : 'text-[#55726B] dark:text-[#8FAAA3]'
              }`}>
                {node.label}
              </span>
            </div>
          );
        })}

        {/* Hover Information Tooltip Overlay inside Board */}
        {hoveredNode && (
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-30 bg-[#12302B]/95 dark:bg-[#121212]/95 border border-white/10 px-3 py-1.5 rounded-xl max-w-[240px] text-center pointer-events-none shadow-md animate-in fade-in duration-100">
            <p className="text-[10px] font-bold text-white flex items-center justify-center gap-1">
              <span>{hoveredNode.emoji}</span>
              <span>{hoveredNode.label}</span>
            </p>
            <p className="text-[9px] text-[#8FAAA3] leading-tight mt-0.5">
              {hoveredNode.description}
            </p>
          </div>
        )}

        {/* Synaptic Misfire / Direct connection warning bubble */}
        {errorMsg && (
          <div className="absolute top-2.5 left-4 right-4 z-30 bg-rose-50 dark:bg-[#251214] border border-rose-300 dark:border-rose-950/50 p-2.5 rounded-xl shadow-md animate-in slide-in-from-top-2 duration-200">
            <p className="text-[11px] font-bold text-[#A33A2C] dark:text-[#F08C7D] leading-tight">
              {errorMsg}
            </p>
          </div>
        )}

        {/* Game Success Completion Celebration Panel! */}
        {successCelebration && (
          <div className="absolute inset-0 z-40 bg-[#12302B]/90 dark:bg-[#0A0A0C]/95 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-3xl mb-2 animate-bounce">
              🎉
            </div>
            
            <h4 className="text-base font-black text-white flex items-center gap-1.5 justify-center">
              <span>Шлях Прокладено!</span>
              <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
            </h4>
            
            <p className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider mb-2.5">
              +50 Нейронної Енергії Нараховано
            </p>

            <div className="bg-white/5 dark:bg-white/5 p-3 rounded-xl border border-white/10 max-w-sm mb-3.5">
              <p className="text-[11px] text-white/90 leading-relaxed">
                {activeLevel.insight}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetLevel}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Спробувати ще</span>
              </button>

              <button
                type="button"
                onClick={handleNextLevel}
                className="px-4 py-1.5 bg-[#1E8A69] hover:bg-[#167054] text-white font-bold text-[11px] rounded-xl flex items-center gap-1 cursor-pointer shadow-xs transition-all"
              >
                <span>Наступний звʼязок</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Manual Action Reset/Interactive guide button */}
      {!successCelebration && (
        <div className="flex items-center justify-between mt-3 text-xs">
          <div className="flex items-center gap-1 text-[#55726B] dark:text-[#8FAAA3] text-[10px]">
            <HelpCircle className="w-3.5 h-3.5 text-[#1E8A69] dark:text-[#4CC9A0]" />
            <span>Оберіть принаймні 2 заміни, щоб дійти до фіналу</span>
          </div>

          <button
            type="button"
            onClick={handleResetLevel}
            disabled={selectedPath.length <= 1}
            className="text-[10px] text-[#55726B] dark:text-[#8FAAA3] hover:text-[#12302B] dark:hover:text-[#f4f4f5] font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-40"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Очистити звʼязки</span>
          </button>
        </div>
      )}
    </div>
  );
};
