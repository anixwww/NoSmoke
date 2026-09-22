import React from 'react';
import { TreeState, MoneySettings, TreeSpeciesId } from '../types';
import { TREE_SPECIES, TREE_STAGES, getTreeStageInfo } from '../data/treeSpecies';
import { Sprout, Droplets, Sun, Sparkles, Trees, Scissors, Info, Clock, Check } from 'lucide-react';

interface TreeTabProps {
  treeState: TreeState;
  money: MoneySettings | null;
  cigsAvoided: number;
  onUpdateTreeState: (newState: TreeState) => void;
  onSwitchTab: (tab: any) => void;
}

const CIGS_PER_TREE = 300;

export const TreeTab: React.FC<TreeTabProps> = ({
  treeState,
  money,
  cigsAvoided,
  onUpdateTreeState,
  onSwitchTab,
}) => {
  const [showSeedPicker, setShowSeedPicker] = React.useState(false);
  const [showStagesModal, setShowStagesModal] = React.useState(false);
  const [selectedSeed, setSelectedSeed] = React.useState<TreeSpeciesId>('oak');
  const [actionFeedback, setActionFeedback] = React.useState<string | null>(null);

  const totalForestCount = treeState.forest.length;
  const startedCount = totalForestCount + (treeState.current ? 1 : 0);
  const unlockedCount = Math.floor(cigsAvoided / CIGS_PER_TREE);
  const canPlantNew = unlockedCount > startedCount && !treeState.current;

  const currentTree = treeState.current;
  const currentSpecies = currentTree ? TREE_SPECIES[currentTree.speciesId] : TREE_SPECIES.oak;
  const currentStage = currentTree ? getTreeStageInfo(currentTree.growth) : TREE_STAGES[0];

  const feedbackTimerRef = React.useRef<any>(null);
  const showFeedback = (msg: string) => {
    setActionFeedback(msg);
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = setTimeout(() => setActionFeedback(null), 3000);
  };

  // Water action
  const handleWater = () => {
    if (!currentTree) return;
    if (currentTree.water >= 90) {
      showFeedback('Ґрунт достатньо вологий!');
      return;
    }
    const updated: TreeState = {
      ...treeState,
      current: {
        ...currentTree,
        water: 100,
        growth: Math.min(100, currentTree.growth + 1.2)
      }
    };
    onUpdateTreeState(updated);
    showFeedback('Дерево полито! Вологість 100% 💧');
  };

  // Sun action
  const handleSun = () => {
    if (!currentTree) return;
    if (currentTree.sun >= 90) {
      showFeedback('Сонця й так достатньо!');
      return;
    }
    const updated: TreeState = {
      ...treeState,
      current: {
        ...currentTree,
        sun: 100,
        growth: Math.min(100, currentTree.growth + 1.2)
      }
    };
    onUpdateTreeState(updated);
    showFeedback('Дано сонячне світло! ☀️');
  };

  // Food action
  const handleFood = () => {
    if (!currentTree) return;
    if (currentTree.food >= 90) {
      showFeedback('Поживи в землі вистачає!');
      return;
    }
    const updated: TreeState = {
      ...treeState,
      current: {
        ...currentTree,
        food: 100,
        growth: Math.min(100, currentTree.growth + 1.5)
      }
    };
    onUpdateTreeState(updated);
    showFeedback('Ґрунт підживлено мінералами! 🌱');
  };

  // Weed removal
  const handleRemoveWeed = (weedId: string) => {
    if (!currentTree) return;
    const remaining = currentTree.weeds.filter((w) => w.id !== weedId);
    const updated: TreeState = {
      ...treeState,
      current: {
        ...currentTree,
        weeds: remaining,
        growth: Math.min(100, currentTree.growth + 2)
      }
    };
    onUpdateTreeState(updated);
    showFeedback('Бур’ян вирвано! Дерево дихає легше ✂️');
  };

  // Plant chosen seed
  const handlePlantSelectedSeed = () => {
    const now = Date.now();
    const newCurrent = {
      speciesId: selectedSeed,
      plantedAt: now,
      growth: 5,
      water: 80,
      sun: 80,
      food: 80,
      lastTick: now,
      nextWeedAt: now + 36 * 3600 * 1000,
      weeds: []
    };
    onUpdateTreeState({
      ...treeState,
      current: newCurrent
    });
    setShowSeedPicker(false);
    showFeedback(`Посаджено зернятко: ${TREE_SPECIES[selectedSeed].name}! 🌱`);
  };

  // Harvest tree
  const handleHarvest = () => {
    if (!currentTree || currentTree.growth < 100) return;
    const now = Date.now();
    const harvested = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      speciesId: currentTree.speciesId,
      plantedAt: currentTree.plantedAt,
      grownAt: now
    };
    onUpdateTreeState({
      forest: [harvested, ...treeState.forest],
      current: null
    });
    showFeedback(`Дерево додано до вашого лісу! Вітаємо! 🌲`);
  };

  // Days spent growing
  const daysGrowing = currentTree
    ? Math.max(1, Math.floor((Date.now() - currentTree.plantedAt) / (24 * 3600 * 1000)))
    : 0;

  // Render SVG tree illustration based on species and growth
  const renderTreeSvg = () => {
    const growth = currentTree ? currentTree.growth : 0;
    const species = currentSpecies;

    const trunkH = 8 + (growth * 0.55);
    const trunkW = 5 + (growth * 0.1);
    const baseY = 238;
    const topY = baseY - trunkH;
    const crownR = 12 + (growth * 0.38);

    return (
      <svg viewBox="0 0 320 270" className="w-full h-auto drop-shadow-sm select-none">
        {/* Space background with stars */}
        <defs>
          <linearGradient id="spaceGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#04060A" />
            <stop offset="100%" stopColor="#0D1322" />
          </linearGradient>
        </defs>

        <rect width="320" height="270" fill="url(#spaceGrad)" rx="18" />

        {/* Tiny twinkling stars */}
        <g fill="#FFFFFF">
          <circle cx="45" cy="35" r="1.2" opacity="0.9" />
          <circle cx="78" cy="65" r="0.8" opacity="0.7" />
          <circle cx="120" cy="28" r="1.5" opacity="0.95" />
          <circle cx="165" cy="55" r="1" opacity="0.6" />
          <circle cx="210" cy="32" r="1.3" opacity="0.85" />
          <circle cx="260" cy="70" r="0.9" opacity="0.75" />
          <circle cx="295" cy="40" r="1.4" opacity="0.9" />
          <circle cx="35" cy="95" r="1" opacity="0.7" />
          <circle cx="90" cy="120" r="1.2" opacity="0.8" />
          <circle cx="145" cy="90" r="0.8" opacity="0.6" />
          <circle cx="195" cy="115" r="1.5" opacity="0.9" />
          <circle cx="245" cy="95" r="1.1" opacity="0.8" />
          <circle cx="280" cy="130" r="0.7" opacity="0.5" />
          <circle cx="60" cy="150" r="1.3" opacity="0.85" />
          <circle cx="110" cy="165" r="1" opacity="0.7" />
          <circle cx="230" cy="155" r="1.4" opacity="0.9" />
        </g>

        {/* Hills */}
        <path d="M0,202 Q80,172 160,200 T320,196 L320,270 L0,270 Z" fill="#8CC496" />
        <path d="M0,216 Q90,188 170,214 T320,210 L320,270 L0,270 Z" fill="#A5D3AA" />

        {/* Soil mound */}
        <ellipse cx="160" cy="238" rx="64" ry="18" fill="#8C6641" />
        <ellipse cx="160" cy="235" rx="46" ry="12" fill="#5E4229" />

        {/* No active tree: show soil seed bed */}
        {!currentTree && (
          <g>
            <circle cx="160" cy="230" r="5" fill="#3E9F69" />
            <line x1="160" y1="230" x2="160" y2="223" stroke="#3E9F69" strokeWidth="2" strokeLinecap="round" />
            <line x1="160" y1="225" x2="165" y2="222" stroke="#68C88F" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}

        {/* Active tree rendering */}
        {currentTree && (
          <g>
            {/* Trunk */}
            <rect
              x={(160 - trunkW / 2).toFixed(1)}
              y={topY.toFixed(1)}
              width={trunkW.toFixed(1)}
              height={trunkH.toFixed(1)}
              rx={(trunkW / 2).toFixed(1)}
              fill={species.trunkColor}
            />

            {/* Tree species-specific foliage */}
            {growth >= 10 && (
              <>
                {species.id === 'pine' ? (
                  // Pine triangular tiers
                  <g>
                    <polygon
                      points={`160,${topY - crownR * 1.5} ${160 - crownR * 0.9},${topY - crownR * 0.2} ${160 + crownR * 0.9},${topY - crownR * 0.2}`}
                      fill={species.leafColor}
                    />
                    <polygon
                      points={`160,${topY - crownR * 2.2} ${160 - crownR * 0.75},${topY - crownR * 0.8} ${160 + crownR * 0.75},${topY - crownR * 0.8}`}
                      fill={species.leafColor2}
                    />
                    <polygon
                      points={`160,${topY - crownR * 2.8} ${160 - crownR * 0.55},${topY - crownR * 1.5} ${160 + crownR * 0.55},${topY - crownR * 1.5}`}
                      fill={species.leafColor}
                    />
                  </g>
                ) : (
                  // Round/Lush crown for Oak, Sakura, Apple, Maple
                  <g>
                    <circle
                      cx="160"
                      cy={(topY - crownR * 0.6).toFixed(1)}
                      r={crownR.toFixed(1)}
                      fill={species.leafColor}
                    />
                    <circle
                      cx={(160 - crownR * 0.6).toFixed(1)}
                      cy={(topY - crownR * 0.2).toFixed(1)}
                      r={(crownR * 0.75).toFixed(1)}
                      fill={species.leafColor2}
                    />
                    <circle
                      cx={(160 + crownR * 0.6).toFixed(1)}
                      cy={(topY - crownR * 0.2).toFixed(1)}
                      r={(crownR * 0.75).toFixed(1)}
                      fill={species.leafColor2}
                    />
                  </g>
                )}

                {/* Species special decorations when > 60% grown */}
                {growth >= 60 && (
                  <>
                    {species.id === 'sakura' && (
                      // Pink Sakura blossoms
                      <g fill="#FFB7D5">
                        <circle cx="145" cy={topY - crownR * 0.8} r="3.5" />
                        <circle cx="172" cy={topY - crownR * 0.7} r="3.5" />
                        <circle cx="160" cy={topY - crownR * 1.1} r="4" />
                        <circle cx="135" cy={topY - crownR * 0.3} r="3" />
                        <circle cx="180" cy={topY - crownR * 0.35} r="3" />
                      </g>
                    )}

                    {species.id === 'apple' && (
                      // Red juicy apples
                      <g fill="#EF4444">
                        <circle cx="148" cy={topY - crownR * 0.6} r="4" />
                        <circle cx="174" cy={topY - crownR * 0.5} r="4" />
                        <circle cx="160" cy={topY - crownR * 0.9} r="4.2" />
                        <circle cx="138" cy={topY - crownR * 0.2} r="3.8" />
                      </g>
                    )}

                    {species.id === 'oak' && (
                      // Acorns
                      <g fill="#92400E">
                        <ellipse cx="146" cy={topY - crownR * 0.5} rx="3" ry="4" />
                        <ellipse cx="175" cy={topY - crownR * 0.6} rx="3" ry="4" />
                        <ellipse cx="162" cy={topY - crownR * 0.95} rx="3" ry="4" />
                      </g>
                    )}
                  </>
                )}
              </>
            )}

            {/* Weeds */}
            {currentTree.weeds.map((w) => {
              const wx = w.slot === 0 ? 126 : 194;
              const wy = 236;
              return (
                <g
                  key={w.id}
                  onClick={() => handleRemoveWeed(w.id)}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <title>Натисніть, щоб вирвати бур’ян</title>
                  <path
                    d={`M${wx},${wy} q-3,-14 -8,-18`}
                    stroke="#8A5DB4"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <path
                    d={`M${wx},${wy} q4,-16 10,-20`}
                    stroke="#8A5DB4"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <circle cx={wx - 8} cy={wy - 18} r="3" fill="#C58BE6" />
                  <circle cx={wx + 10} cy={wy - 20} r="3" fill="#C58BE6" />
                </g>
              );
            })}
          </g>
        )}
      </svg>
    );
  };

  return (
    <div className="flex flex-col flex-1 pb-8 max-w-md mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSwitchTab('counter')}
            className="p-1.5 -ml-1 text-xs font-semibold text-[#1E8A69] dark:text-[#4CC9A0] hover:bg-[#1E8A69]/10 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
          >
            ← Назад
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#12302B] dark:text-[#f4f4f5] tracking-tight">
              Живий ліс свободи
            </h1>
            <p className="text-xs text-[#55726B] dark:text-[#8FAAA3]">
              1 дерево = 300 невикурених сигарет
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowStagesModal(true)}
          className="px-2.5 py-1.5 border border-[#B7CDC6] dark:border-[#2d2d35] hover:bg-white/50 rounded-xl text-xs font-semibold flex items-center gap-1.5 text-[#55726B] dark:text-[#8FAAA3] cursor-pointer"
        >
          <Info className="w-3.5 h-3.5 text-[#1E8A69]" />
          <span>Етапи росту</span>
        </button>
      </div>

      {/* Tree Visual Scene */}
      <div className="relative border border-[#B7CDC6] dark:border-[#2d2d35] rounded-2xl overflow-hidden mb-3 shadow-xs">
        {renderTreeSvg()}

        {/* Species badge */}
        {currentTree && (
          <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 dark:bg-[#1c1c21]/90 backdrop-blur-xs rounded-full border border-[#B7CDC6] dark:border-[#2d2d35] text-xs font-bold flex items-center gap-1.5 text-[#12302B] dark:text-[#f4f4f5]">
            <span>{currentSpecies.icon}</span>
            <span>{currentSpecies.name}</span>
          </div>
        )}

        {/* Weeds alert */}
        {currentTree && currentTree.weeds.length > 0 && (
          <div className="absolute top-3 right-3 px-2.5 py-1 bg-[#8A5DB4] text-white rounded-full text-[11px] font-bold flex items-center gap-1 animate-bounce">
            <Scissors className="w-3 h-3" />
            <span>Вирви бур’ян!</span>
          </div>
        )}
      </div>

      {/* Action feedback */}
      {actionFeedback && (
        <div className="p-2 mb-3 bg-[#1E8A69]/15 border border-[#1E8A69]/30 rounded-xl text-xs font-semibold text-center text-[#1E8A69] dark:text-[#4CC9A0]">
          {actionFeedback}
        </div>
      )}

      {/* Active growing tree card */}
      {currentTree ? (
        <div className="p-4 bg-white/70 dark:bg-[#1c1c21]/70 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-2xl mb-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-xs uppercase font-bold text-[#1E8A69] dark:text-[#4CC9A0] tracking-wider">
                Стадія {currentStage.stageNum}: {currentStage.name}
              </span>
              <p className="text-xs text-[#55726B] dark:text-[#8FAAA3]">
                Росте вже {daysGrowing} дн. (орієнтовний цикл ~{currentSpecies.growDaysRealistic} днів)
              </p>
            </div>
            <span className="text-lg font-bold font-mono text-[#1E8A69] dark:text-[#4CC9A0]">
              {Math.floor(currentTree.growth)}%
            </span>
          </div>

          {/* Growth paused warning */}
          {(currentTree.water < 30 || currentTree.sun < 30 || currentTree.food < 30) && currentTree.growth < 100 && (
            <div className="mb-3 p-2.5 bg-[#A33A2C]/10 border border-[#A33A2C]/30 rounded-xl text-xs font-semibold text-[#A33A2C] dark:text-[#F08C7D] flex items-center gap-2">
              <span>⚠️ Ріст зупинено: вологість, світло або пожива нижче 30%! Потрібна увага.</span>
            </div>
          )}

          {/* Growth progress bar */}
          <div className="w-full h-2.5 bg-[#CBDDD7] dark:bg-[#1D3832] rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-[#1E8A69] dark:bg-[#4CC9A0] rounded-full transition-all duration-500"
              style={{ width: `${Math.max(5, currentTree.growth)}%` }}
            />
          </div>

          <p className="text-xs text-[#12302B] dark:text-[#f4f4f5] leading-relaxed mb-4">
            💡 {currentStage.careTip}
          </p>

          {/* Care buttons: Water, Sun, Food */}
          <div className="grid grid-cols-3 gap-2.5 mb-2">
            <button
              type="button"
              onClick={handleWater}
              className="p-2.5 border border-[#B7CDC6] dark:border-[#2d2d35] hover:bg-[#4C9BE2]/10 rounded-xl flex flex-col items-center gap-1 cursor-pointer transition-colors"
            >
              <Droplets className="w-5 h-5 text-[#4C9BE2]" />
              <span className="text-xs font-bold">Полити</span>
              <div className="w-full h-1.5 bg-[#CBDDD7] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#4C9BE2]"
                  style={{ width: `${currentTree.water}%` }}
                />
              </div>
              <span className="text-[10px] text-[#55726B] dark:text-[#8FAAA3] font-mono">
                {Math.round(currentTree.water)}%
              </span>
            </button>

            <button
              type="button"
              onClick={handleSun}
              className="p-2.5 border border-[#B7CDC6] dark:border-[#2d2d35] hover:bg-[#F4B73C]/10 rounded-xl flex flex-col items-center gap-1 cursor-pointer transition-colors"
            >
              <Sun className="w-5 h-5 text-[#F4B73C]" />
              <span className="text-xs font-bold">Світло</span>
              <div className="w-full h-1.5 bg-[#CBDDD7] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#F4B73C]"
                  style={{ width: `${currentTree.sun}%` }}
                />
              </div>
              <span className="text-[10px] text-[#55726B] dark:text-[#8FAAA3] font-mono">
                {Math.round(currentTree.sun)}%
              </span>
            </button>

            <button
              type="button"
              onClick={handleFood}
              className="p-2.5 border border-[#B7CDC6] dark:border-[#2d2d35] hover:bg-[#3E9F69]/10 rounded-xl flex flex-col items-center gap-1 cursor-pointer transition-colors"
            >
              <Sprout className="w-5 h-5 text-[#3E9F69]" />
              <span className="text-xs font-bold">Пожива</span>
              <div className="w-full h-1.5 bg-[#CBDDD7] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#3E9F69]"
                  style={{ width: `${currentTree.food}%` }}
                />
              </div>
              <span className="text-[10px] text-[#55726B] dark:text-[#8FAAA3] font-mono">
                {Math.round(currentTree.food)}%
              </span>
            </button>
          </div>

          {/* Harvest button when fully grown */}
          {currentTree.growth >= 100 && (
            <button
              type="button"
              onClick={handleHarvest}
              className="w-full mt-3 py-2.5 bg-[#1E8A69] text-white font-bold text-sm rounded-xl cursor-pointer shadow-md hover:bg-[#187558] transition-all flex items-center justify-center gap-2"
            >
              <Trees className="w-4 h-4" />
              <span>Дерево виросло! Перенести до лісу</span>
            </button>
          )}
        </div>
      ) : (
        /* No active tree: Seed choice card */
        <div className="p-4 bg-white/70 dark:bg-[#1c1c21]/70 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-2xl mb-4 shadow-xs">
          {!money ? (
            <div className="text-center py-3">
              <h3 className="text-sm font-bold text-[#12302B] dark:text-[#f4f4f5] mb-1">
                Вкажіть свої звички у розділі «Гроші»
              </h3>
              <p className="text-xs text-[#55726B] dark:text-[#8FAAA3] mb-3 leading-relaxed">
                Застосунок підрахує кількість невикурених сигарет і відкриє посадку дерев (кожні 300 сигарет).
              </p>
              <button
                type="button"
                onClick={() => onSwitchTab('money')}
                className="px-4 py-2 bg-[#1E8A69] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Вказати звички →
              </button>
            </div>
          ) : canPlantNew ? (
            <div className="text-center py-2">
              <div className="w-12 h-12 rounded-2xl bg-[#1E8A69]/15 text-[#1E8A69] dark:text-[#4CC9A0] flex items-center justify-center mx-auto mb-2 text-2xl">
                🌱
              </div>
              <h3 className="text-base font-bold text-[#12302B] dark:text-[#f4f4f5] mb-1">
                Ви досягли 300 невикурених сигарет!
              </h3>
              <p className="text-xs text-[#55726B] dark:text-[#8FAAA3] mb-3 leading-relaxed">
                Ви врятували дерево! Тепер оберіть зернятко з кількох порід і почніть вирощувати свій унікальний саджанець.
              </p>
              <button
                type="button"
                onClick={() => setShowSeedPicker(true)}
                className="w-full py-3 bg-[#1E8A69] hover:bg-[#187558] text-white font-bold text-sm rounded-xl cursor-pointer shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Sprout className="w-4 h-4" />
                <span>Обрати зернятко дерева на вибір</span>
              </button>
            </div>
          ) : (
            <div className="py-2">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-[#12302B] dark:text-[#f4f4f5]">
                  Відлік до наступного зернятка (300 сигарет)
                </span>
                <span className="text-xs font-bold text-[#1E8A69] dark:text-[#4CC9A0]">
                  {Math.floor(cigsAvoided % CIGS_PER_TREE)} / {CIGS_PER_TREE}
                </span>
              </div>
              <div className="w-full h-2.5 bg-[#CBDDD7] dark:bg-[#1D3832] rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-[#1E8A69] dark:bg-[#4CC9A0] rounded-full"
                  style={{
                    width: `${Math.min(100, Math.max(3, ((cigsAvoided % CIGS_PER_TREE) / CIGS_PER_TREE) * 100))}%`
                  }}
                />
              </div>
              <p className="text-xs text-[#55726B] dark:text-[#8FAAA3]">
                Залишилося утриматися ще від{' '}
                <strong className="text-[#12302B] dark:text-[#f4f4f5]">
                  {Math.max(1, CIGS_PER_TREE - Math.floor(cigsAvoided % CIGS_PER_TREE))}
                </strong>{' '}
                сигарет, щоб отримати нове зернятко на вибір!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Forest summary section */}
      <div className="p-4 bg-white/50 dark:bg-[#1c1c21]/50 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-2xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Trees className="w-4 h-4 text-[#1E8A69]" />
            <h3 className="text-sm font-bold text-[#12302B] dark:text-[#f4f4f5]">
              Твій ліс ({totalForestCount})
            </h3>
          </div>
          <span className="text-xs text-[#55726B] dark:text-[#8FAAA3]">
            Врятовано: {totalForestCount * CIGS_PER_TREE} сигарет
          </span>
        </div>

        {totalForestCount > 0 ? (
          <div className="flex flex-wrap gap-2.5 pt-1">
            {treeState.forest.map((f) => {
              const sp = TREE_SPECIES[f.speciesId] || TREE_SPECIES.oak;
              return (
                <div
                  key={f.id}
                  className="p-2 bg-white dark:bg-[#1c1c21] border border-[#B7CDC6] dark:border-[#2d2d35] rounded-xl flex items-center gap-1.5 shadow-2xs"
                  title={`${sp.name} — вирощено ${new Date(f.grownAt).toLocaleDateString('uk-UA')}`}
                >
                  <span className="text-lg">{sp.icon}</span>
                  <span className="text-xs font-semibold text-[#12302B] dark:text-[#f4f4f5]">
                    {sp.name}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-[#55726B] dark:text-[#8FAAA3] italic">
            Ваш ліс поки що порожній. Щойно виросте перше дерево, воно з’явиться тут назавжди.
          </p>
        )}
      </div>

      {/* SEED PICKER MODAL */}
      {showSeedPicker && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#E9F1EE] dark:bg-[#121212] border border-[#B7CDC6] dark:border-[#2d2d35] rounded-3xl p-5 max-w-sm w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-4">
              <span className="text-3xl">🌱</span>
              <h2 className="text-lg font-bold text-[#12302B] dark:text-[#f4f4f5] mt-1">
                Оберіть зернятко дерева
              </h2>
              <p className="text-xs text-[#55726B] dark:text-[#8FAAA3]">
                Кожна порода має свій символізм, вигляд та реалістичний цикл розвитку.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 mb-5">
              {(Object.keys(TREE_SPECIES) as TreeSpeciesId[]).map((key) => {
                const sp = TREE_SPECIES[key];
                const isSelected = selectedSeed === key;
                return (
                  <div
                    key={key}
                    onClick={() => setSelectedSeed(key)}
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#1E8A69] bg-white dark:bg-[#1c1c21] shadow-sm'
                        : 'border-[#B7CDC6] dark:border-[#2d2d35] bg-white/40 dark:bg-[#1c1c21]/40 hover:border-[#1E8A69]/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{sp.icon}</span>
                        <div>
                          <h4 className="text-sm font-bold text-[#12302B] dark:text-[#f4f4f5]">
                            {sp.name}
                          </h4>
                          <span className="text-[10px] text-[#55726B] dark:text-[#8FAAA3] italic">
                            {sp.botanicalName}
                          </span>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-[#1E8A69] text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-[#1E8A69] dark:text-[#4CC9A0] mb-0.5">
                      {sp.symbol}
                    </p>
                    <p className="text-[11px] text-[#55726B] dark:text-[#8FAAA3] leading-snug">
                      {sp.description}
                    </p>
                    <div className="mt-1.5 flex items-center gap-1 text-[10px] font-medium text-[#12302B] dark:text-[#f4f4f5]">
                      <Clock className="w-3 h-3 text-[#1E8A69]" />
                      <span>Орієнтовний цикл догляду: ~{sp.growDaysRealistic} днів</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowSeedPicker(false)}
                className="flex-1 py-2.5 border border-[#B7CDC6] dark:border-[#2d2d35] text-xs font-semibold rounded-xl text-[#55726B] dark:text-[#8FAAA3] cursor-pointer"
              >
                Скасувати
              </button>
              <button
                type="button"
                onClick={handlePlantSelectedSeed}
                className="flex-1 py-2.5 bg-[#1E8A69] hover:bg-[#187558] text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm transition-colors"
              >
                Посадити зернятко
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REALISTIC GROWTH STAGES MODAL */}
      {showStagesModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#E9F1EE] dark:bg-[#121212] border border-[#B7CDC6] dark:border-[#2d2d35] rounded-3xl p-5 max-w-sm w-full shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-[#1E8A69]" />
                <h3 className="text-base font-bold text-[#12302B] dark:text-[#f4f4f5]">
                  Етапи розвитку дерева
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowStagesModal(false)}
                className="text-xs font-bold text-[#55726B] hover:text-[#12302B] p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#55726B] dark:text-[#8FAAA3] mb-4 leading-relaxed">
              У природі дерево росте роками, проте в застосунку процес синхронізовано з першими трьома тижнями вашої відмови від тютюну — періодом формування стійкої звички.
            </p>

            <div className="flex flex-col gap-3 mb-4">
              {TREE_STAGES.map((st) => (
                <div
                  key={st.stageNum}
                  className="p-3 bg-white dark:bg-[#1c1c21] border border-[#B7CDC6] dark:border-[#2d2d35] rounded-xl"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-[#1E8A69] dark:text-[#4CC9A0]">
                      Етап {st.stageNum}: {st.name}
                    </span>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-[#CBDDD7]/50 rounded-full">
                      {st.approxDays}
                    </span>
                  </div>
                  <p className="text-xs text-[#12302B] dark:text-[#f4f4f5] leading-snug mb-1">
                    {st.description}
                  </p>
                  <p className="text-[11px] text-[#55726B] dark:text-[#8FAAA3] italic">
                    🌱 Порада: {st.careTip}
                  </p>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowStagesModal(false)}
              className="w-full py-2.5 bg-[#1E8A69] text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Зрозуміло
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
