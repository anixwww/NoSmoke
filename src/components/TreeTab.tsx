import React, { useState, useEffect, useRef, useMemo } from 'react';
import { TreeState, MoneySettings, TreeSpeciesId, ForestTree } from '../types';
import { TREE_SPECIES, TREE_STAGES, getTreeStageInfo } from '../data/treeSpecies';
import { forestAudio } from '../data/forestSound';
import {
  Sprout,
  Droplets,
  Sun,
  Sparkles,
  Trees,
  Scissors,
  Info,
  Clock,
  Check,
  Hourglass,
  Volume2,
  VolumeX,
  Sunrise,
  Sunset,
  Moon,
  ChevronRight,
  Heart,
  Wind
} from 'lucide-react';

interface TreeTabProps {
  treeState: TreeState;
  money: MoneySettings | null;
  cigsAvoided: number;
  totalSeconds: number;
  onUpdateTreeState: (newState: TreeState) => void;
  onSwitchTab: (tab: any) => void;
}

const CIGS_PER_TREE = 300;

export const TreeTab: React.FC<TreeTabProps> = ({
  treeState,
  money,
  cigsAvoided,
  totalSeconds,
  onUpdateTreeState,
  onSwitchTab
}) => {
  // Main Navigation: 'sapling' (active tree) | 'forest' (the cozy grove)
  const [activeView, setActiveView] = useState<'sapling' | 'forest'>('sapling');

  // Modals & dialogues
  const [showSeedPicker, setShowSeedPicker] = useState(false);
  const [showStagesModal, setShowStagesModal] = useState(false);
  const [selectedSeed, setSelectedSeed] = useState<TreeSpeciesId>('oak');
  const [inspectTree, setInspectTree] = useState<ForestTree | null>(null);
  const [editingNickname, setEditingNickname] = useState('');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Time Sands slider & quick amounts
  const [customSandAmount, setCustomSandAmount] = useState<number>(60);
  const [isPouringSands, setIsPouringSands] = useState(false);
  const [sandParticles, setSandParticles] = useState<{ id: number; x: number; y: number }[]>([]);

  // Forest Atmosphere Theme: morning | twilight | night
  const ambience = treeState.ambienceTheme || 'twilight';
  const soundEnabled = treeState.ambientSoundEnabled ?? false;

  const currentTree = treeState.current;
  const currentSpecies = currentTree ? TREE_SPECIES[currentTree.speciesId] || TREE_SPECIES.oak : TREE_SPECIES.oak;
  const currentStage = currentTree ? getTreeStageInfo(currentTree.growth) : TREE_STAGES[0];

  // Sands of Time balance
  const spentSands = treeState.spentTimeSands || 0;
  const availableSands = Math.max(0, totalSeconds - spentSands);

  // Growth calculation helpers
  const totalForestCount = treeState.forest.length;
  const startedCount = totalForestCount + (currentTree ? 1 : 0);
  const unlockedSeedCount = Math.floor(cigsAvoided / CIGS_PER_TREE);
  const canPlantNew = unlockedSeedCount > startedCount && !currentTree;

  // Total oxygen produced by the forest
  const totalOxygenKg = useMemo(() => {
    return treeState.forest.reduce((sum, t) => sum + (t.oxygenProducedKg || 25), 0);
  }, [treeState.forest]);

  // Temporary feedback toast
  const feedbackTimerRef = useRef<any>(null);
  const showFeedback = (msg: string) => {
    setActionFeedback(msg);
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = setTimeout(() => setActionFeedback(null), 3200);
  };

  // Switch forest atmosphere
  const handleToggleAmbience = () => {
    const next: 'morning' | 'twilight' | 'night' =
      ambience === 'morning' ? 'twilight' : ambience === 'twilight' ? 'night' : 'morning';
    onUpdateTreeState({
      ...treeState,
      ambienceTheme: next
    });
  };

  // Toggle ambient sound
  const handleToggleSound = () => {
    const next = !soundEnabled;
    onUpdateTreeState({
      ...treeState,
      ambientSoundEnabled: next
    });
    if (next) {
      forestAudio.playSun();
      showFeedback('🍃 Звуковий супровід лісу увімкнено');
    }
  };

  // Water action
  const handleWater = () => {
    if (!currentTree) return;
    if (currentTree.water >= 98) {
      showFeedback('💧 Ґрунт біля коріння вже ідеально вологий!');
      return;
    }
    forestAudio.playWater();
    const nextGrowth = Math.min(100, currentTree.growth + 1.2);
    onUpdateTreeState({
      ...treeState,
      current: {
        ...currentTree,
        water: 100,
        growth: nextGrowth
      }
    });
    showFeedback('💧 Дерево напоєно живою джерельною водою (+1.2% росту)!');
  };

  // Sun warmth action
  const handleSun = () => {
    if (!currentTree) return;
    if (currentTree.sun >= 98) {
      showFeedback('☀️ Крона вбирає максимум сонячного проміння!');
      return;
    }
    forestAudio.playSun();
    const nextGrowth = Math.min(100, currentTree.growth + 1.2);
    onUpdateTreeState({
      ...treeState,
      current: {
        ...currentTree,
        sun: 100,
        growth: nextGrowth
      }
    });
    showFeedback('☀️ Теплі сонячні промені живлять листя (+1.2% росту)!');
  };

  // Organic compost / Minerals action
  const handleFood = () => {
    if (!currentTree) return;
    if (currentTree.food >= 98) {
      showFeedback('🌱 Земля насичена багатим лісовим гумусом!');
      return;
    }
    forestAudio.playFood();
    const nextGrowth = Math.min(100, currentTree.growth + 1.5);
    onUpdateTreeState({
      ...treeState,
      current: {
        ...currentTree,
        food: 100,
        growth: nextGrowth
      }
    });
    showFeedback('🌱 Ґрунт збагачено лісовими мінералами (+1.5% росту)!');
  };

  // Weed removal
  const handleRemoveWeed = (weedId: string) => {
    if (!currentTree) return;
    forestAudio.playWeedSnip();
    const remaining = currentTree.weeds.filter((w) => w.id !== weedId);
    const nextGrowth = Math.min(100, currentTree.growth + 2.5);
    onUpdateTreeState({
      ...treeState,
      current: {
        ...currentTree,
        weeds: remaining,
        growth: nextGrowth
      }
    });
    showFeedback('✂️ Бур’ян обережно вирвано, корінню вільно дихати (+2.5% росту)!');
  };

  // Channel Time Sands into the Tree
  const handleChannelTimeSands = (amount: number) => {
    if (!currentTree) return;
    if (amount <= 0 || availableSands < amount) {
      showFeedback('⏳ Недостатньо піщинок часу для цього прискорення!');
      return;
    }

    // Trigger visual particles
    setIsPouringSands(true);
    forestAudio.playSandPour();

    const particles = Array.from({ length: 12 }, (_, i) => ({
      id: Date.now() + i,
      x: 130 + Math.random() * 60,
      y: 80 + Math.random() * 80
    }));
    setSandParticles(particles);

    setTimeout(() => {
      setIsPouringSands(false);
      setSandParticles([]);
    }, 1200);

    // Calculate growth gained from time sands (60 sands = 1.5% growth)
    const growthGain = (amount / 60) * 1.5;
    const nextGrowth = Math.min(100, currentTree.growth + growthGain);

    // Auto-clears weeds if amount >= 300
    const nextWeeds = amount >= 300 ? [] : currentTree.weeds;

    // Replenish nourishment proportionally
    const nourishmentBoost = Math.min(40, (amount / 60) * 5);
    const nextWater = Math.min(100, currentTree.water + nourishmentBoost);
    const nextSun = Math.min(100, currentTree.sun + nourishmentBoost);
    const nextFood = Math.min(100, currentTree.food + nourishmentBoost);

    onUpdateTreeState({
      ...treeState,
      spentTimeSands: spentSands + amount,
      current: {
        ...currentTree,
        growth: nextGrowth,
        weeds: nextWeeds,
        water: nextWater,
        sun: nextSun,
        food: nextFood
      }
    });

    showFeedback(
      `⏳ Влито ${amount.toLocaleString()} піщинок часу! Ріст прискорено на +${growthGain.toFixed(1)}%`
    );
  };

  // Instant Mature with Time Sands
  const handleInstantMatureWithSands = () => {
    if (!currentTree || currentTree.growth >= 100) return;
    const missing = 100 - currentTree.growth;
    const neededSands = Math.ceil((missing / 1.5) * 60);

    if (availableSands < neededSands) {
      showFeedback(`⏳ Потрібно ${neededSands.toLocaleString()} піщинок часу. У вас є ${availableSands.toLocaleString()}.`);
      return;
    }

    handleChannelTimeSands(neededSands);
  };

  // Plant chosen seed
  const handlePlantSelectedSeed = () => {
    const now = Date.now();
    const newCurrent = {
      speciesId: selectedSeed,
      plantedAt: now,
      growth: 6,
      water: 90,
      sun: 90,
      food: 90,
      lastTick: now,
      nextWeedAt: now + 48 * 3600 * 1000,
      weeds: []
    };

    forestAudio.playFood();
    onUpdateTreeState({
      ...treeState,
      current: newCurrent
    });
    setShowSeedPicker(false);
    showFeedback(`🌱 Посаджено живе зернятко: ${TREE_SPECIES[selectedSeed].name}!`);
  };

  // Transfer fully grown tree into the permanent cozy grove
  const handleHarvestToGrove = () => {
    if (!currentTree || currentTree.growth < 100) return;
    const now = Date.now();
    const daysTaken = Math.max(1, Math.round((now - currentTree.plantedAt) / (24 * 3600 * 1000)));
    const oxygenKg = Math.round(18 + daysTaken * 2.5);

    const harvested: ForestTree = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      speciesId: currentTree.speciesId,
      plantedAt: currentTree.plantedAt,
      grownAt: now,
      nickname: `${currentSpecies.name} №${totalForestCount + 1}`,
      oxygenProducedKg: oxygenKg
    };

    forestAudio.playHarvest();
    onUpdateTreeState({
      ...treeState,
      forest: [harvested, ...treeState.forest],
      current: null
    });

    setActiveView('forest');
    showFeedback(`🎉 Дерево повністю розквітло та оселилося у вашому затишному гаю!`);
  };

  // Save nickname of inspected tree
  const handleSaveTreeNickname = () => {
    if (!inspectTree) return;
    const updatedForest = treeState.forest.map((t) =>
      t.id === inspectTree.id ? { ...t, nickname: editingNickname.trim() || t.nickname } : t
    );
    onUpdateTreeState({
      ...treeState,
      forest: updatedForest
    });
    setInspectTree(null);
    showFeedback('🌳 Затишну табличку оновлено!');
  };

  // Sky Gradients and Ambience colors
  const skyConfig = useMemo(() => {
    switch (ambience) {
      case 'morning':
        return {
          id: 'morningSky',
          c1: '#FCE7D0',
          c2: '#E0F2FE',
          c3: '#BBEFDB',
          sunColor: '#FBBF24',
          ambientName: 'Ранковий туман',
          icon: <Sunrise className="w-3.5 h-3.5 text-amber-500" />,
          hillBack: '#85BBA0',
          hillFront: '#5A9E7B',
          lanternGlow: '#FDE68A'
        };
      case 'twilight':
        return {
          id: 'twilightSky',
          c1: '#311B45',
          c2: '#7C3A62',
          c3: '#D97757',
          sunColor: '#F59E0B',
          ambientName: 'Золоті сутінки',
          icon: <Sunset className="w-3.5 h-3.5 text-orange-400" />,
          hillBack: '#274438',
          hillFront: '#163529',
          lanternGlow: '#FEF08A'
        };
      case 'night':
      default:
        return {
          id: 'nightSky',
          c1: '#070C18',
          c2: '#0F1C36',
          c3: '#15303E',
          sunColor: '#E2E8F0',
          ambientName: 'Зоряна ніч',
          icon: <Moon className="w-3.5 h-3.5 text-indigo-300" />,
          hillBack: '#122520',
          hillFront: '#0A1814',
          lanternGlow: '#FACC15'
        };
    }
  }, [ambience]);

  // Days spent growing
  const daysGrowing = currentTree
    ? Math.max(1, Math.floor((Date.now() - currentTree.plantedAt) / (24 * 3600 * 1000)))
    : 0;

  // Render SVG tree illustration with cozy natural detail
  const renderTreeSceneSvg = () => {
    const growth = currentTree ? currentTree.growth : 0;
    const species = currentSpecies;

    const trunkH = 14 + growth * 0.72;
    const trunkW = 7 + growth * 0.14;
    const baseY = 246;
    const topY = baseY - trunkH;
    const crownR = 14 + growth * 0.44;

    return (
      <svg viewBox="0 0 340 285" className="w-full h-auto select-none overflow-hidden rounded-3xl">
        <defs>
          {/* Dynamic Sky Gradient */}
          <linearGradient id="sanctuarySky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={skyConfig.c1} />
            <stop offset="55%" stopColor={skyConfig.c2} />
            <stop offset="100%" stopColor={skyConfig.c3} />
          </linearGradient>

          {/* Golden Sand Stream Gradient */}
          <linearGradient id="sandStreamGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.2" />
          </linearGradient>

          {/* Foliage Depth Filters */}
          <radialGradient id="foliageGlow" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor={species.leafColor2} />
            <stop offset="100%" stopColor={species.leafColor} />
          </radialGradient>

          <radialGradient id="lanternRadial" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={skyConfig.lanternGlow} stopOpacity="0.9" />
            <stop offset="60%" stopColor={skyConfig.lanternGlow} stopOpacity="0.3" />
            <stop offset="100%" stopColor={skyConfig.lanternGlow} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Sky Background */}
        <rect width="340" height="285" fill="url(#sanctuarySky)" />

        {/* Celestial Body (Sun, Moon or Twilight Sun) */}
        {ambience === 'night' ? (
          <g>
            <circle cx="270" cy="52" r="16" fill="#F8FAFC" opacity="0.9" />
            <circle cx="277" cy="48" r="14" fill={skyConfig.c2} />
            {/* Stars */}
            <g fill="#FFFFFF">
              <circle cx="45" cy="35" r="1.4" opacity="0.9" />
              <circle cx="95" cy="55" r="1" opacity="0.8" />
              <circle cx="140" cy="25" r="1.5" opacity="0.95" />
              <circle cx="190" cy="65" r="1" opacity="0.75" />
              <circle cx="225" cy="32" r="1.2" opacity="0.85" />
              <circle cx="75" cy="95" r="1.1" opacity="0.6" />
              <circle cx="310" cy="90" r="1.3" opacity="0.8" />
              <circle cx="165" cy="85" r="0.9" opacity="0.7" />
            </g>
          </g>
        ) : (
          <g>
            <circle cx="270" cy="58" r="28" fill={skyConfig.sunColor} opacity="0.25" />
            <circle cx="270" cy="58" r="17" fill={skyConfig.sunColor} opacity="0.85" />
            {/* Gentle morning/dusk birds in the distance */}
            <path d="M70,75 Q75,71 80,75 Q85,71 90,75" stroke="#4A5568" strokeWidth="1.2" fill="none" opacity="0.4" />
            <path d="M98,66 Q102,63 106,66 Q110,63 114,66" stroke="#4A5568" strokeWidth="1" fill="none" opacity="0.35" />
          </g>
        )}

        {/* Distant Misty Mountain Ridges */}
        <path
          d="M0,185 Q85,150 170,180 T340,172 L340,285 L0,285 Z"
          fill={skyConfig.hillBack}
          opacity="0.85"
        />
        <path
          d="M0,205 Q95,175 185,202 T340,196 L340,285 L0,285 Z"
          fill={skyConfig.hillFront}
        />

        {/* Hanging Forest Lanterns from invisible bough */}
        <g opacity={ambience === 'morning' ? 0.35 : 0.95}>
          {/* Left lantern */}
          <line x1="45" y1="0" x2="45" y2="105" stroke="#4B3A26" strokeWidth="1" />
          <circle cx="45" cy="115" r="22" fill="url(#lanternRadial)" />
          <rect x="40" y="105" width="10" height="15" rx="3" fill="#3D2817" />
          <rect x="42" y="108" width="6" height="9" rx="2" fill={skyConfig.lanternGlow} />

          {/* Right lantern */}
          <line x1="295" y1="0" x2="295" y2="120" stroke="#4B3A26" strokeWidth="1" />
          <circle cx="295" cy="130" r="24" fill="url(#lanternRadial)" />
          <rect x="290" y="120" width="10" height="15" rx="3" fill="#3D2817" />
          <rect x="292" y="123" width="6" height="9" rx="2" fill={skyConfig.lanternGlow} />
        </g>

        {/* Cozy Grassy Knoll & Soil Mound */}
        <ellipse cx="170" cy={baseY} rx="84" ry="24" fill="#3E2C1C" />
        <ellipse cx="170" cy={baseY - 4} rx="70" ry="17" fill="#583E26" />
        <ellipse cx="170" cy={baseY - 7} rx="58" ry="12" fill="#2E6B47" opacity="0.65" />

        {/* Blooming forest chamomile and wild clover at base */}
        <g opacity="0.9">
          <circle cx="118" cy="242" r="3" fill="#FEF08A" />
          <circle cx="118" cy="242" r="1.5" fill="#D97706" />
          <circle cx="128" cy="248" r="3" fill="#FFFFFF" />
          <circle cx="218" cy="244" r="3" fill="#FEF08A" />
          <circle cx="228" cy="240" r="3.5" fill="#FFFFFF" />
          <circle cx="228" cy="240" r="1.5" fill="#D97706" />
          {/* Glowing mushrooms */}
          <ellipse cx="138" cy="248" rx="4" ry="3" fill="#F43F5E" />
          <rect x="136.5" y="248" width="3" height="4" fill="#E2E8F0" rx="1" />
          <ellipse cx="204" cy="249" rx="3.5" ry="2.5" fill="#06B6D4" />
          <rect x="203" y="249" width="2" height="3" fill="#E2E8F0" rx="1" />
        </g>

        {/* NO ACTIVE TREE: show welcoming seedling bed */}
        {!currentTree && (
          <g>
            <circle cx="170" cy={baseY - 10} r="7" fill="#10B981" opacity="0.9" />
            <path
              d="M170,236 Q168,220 162,212 M170,236 Q174,222 178,214"
              stroke="#10B981"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            <ellipse cx="160" cy="210" rx="6" ry="4" fill="#34D399" transform="rotate(-30 160 210)" />
            <ellipse cx="180" cy="212" rx="6" ry="4" fill="#6EE7B7" transform="rotate(30 180 212)" />
          </g>
        )}

        {/* ACTIVE TREE RENDERING */}
        {currentTree && (
          <g>
            {/* Spreading Roots */}
            {growth >= 15 && (
              <g stroke={species.trunkColor} strokeWidth="3" strokeLinecap="round" fill="none">
                <path d={`M${170 - trunkW * 0.3},${baseY - 5} Q${150},${baseY + 4} ${138},${baseY + 8}`} />
                <path d={`M${170 + trunkW * 0.3},${baseY - 5} Q${190},${baseY + 4} ${202},${baseY + 8}`} />
              </g>
            )}

            {/* Tree Trunk with organic taper */}
            <path
              d={`
                M${170 - trunkW * 0.7},${baseY}
                Q${170 - trunkW * 0.4},${baseY - trunkH * 0.5} ${170 - trunkW * 0.35},${topY}
                L${170 + trunkW * 0.35},${topY}
                Q${170 + trunkW * 0.4},${baseY - trunkH * 0.5} ${170 + trunkW * 0.7},${baseY}
                Z
              `}
              fill={species.trunkColor}
            />

            {/* Bark Texture highlights */}
            {growth >= 30 && (
              <g stroke="rgba(0,0,0,0.18)" strokeWidth="1.2" strokeLinecap="round">
                <line x1="168" y1={baseY - 15} x2="168" y2={baseY - trunkH * 0.4} />
                <line x1="172" y1={baseY - 22} x2="173" y2={baseY - trunkH * 0.65} />
              </g>
            )}

            {/* Stage 1: Just a tiny curved sprout */}
            {growth < 15 && (
              <g>
                <path
                  d="M170,238 Q168,220 162,210"
                  stroke="#34D399"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                />
                <ellipse cx="158" cy="208" rx="6" ry="4" fill="#10B981" transform="rotate(-35 158 208)" />
                <ellipse cx="166" cy="214" rx="5" ry="3.5" fill="#34D399" transform="rotate(25 166 214)" />
                {/* Dew drop */}
                <circle cx="157" cy="206" r="1.8" fill="#E0F2FE" />
              </g>
            )}

            {/* Tree Foliage for species when >= 15% */}
            {growth >= 15 && (
              <g>
                {species.id === 'pine' ? (
                  // CARPATHIAN PINE (Layered Evergreen Cones)
                  <g>
                    {/* Bottom tier */}
                    <polygon
                      points={`170,${topY - crownR * 1.5} ${170 - crownR * 1.1},${topY - crownR * 0.15} ${170 + crownR * 1.1},${topY - crownR * 0.15}`}
                      fill={species.leafColor}
                    />
                    {/* Middle tier */}
                    <polygon
                      points={`170,${topY - crownR * 2.2} ${170 - crownR * 0.9},${topY - crownR * 0.8} ${170 + crownR * 0.9},${topY - crownR * 0.8}`}
                      fill={species.leafColor2}
                    />
                    {/* Top tier */}
                    <polygon
                      points={`170,${topY - crownR * 2.9} ${170 - crownR * 0.65},${topY - crownR * 1.5} ${170 + crownR * 0.65},${topY - crownR * 1.5}`}
                      fill={species.leafColor}
                    />
                    {/* Pinecones */}
                    {growth >= 60 && (
                      <g fill="#78350F">
                        <ellipse cx="154" cy={topY - crownR * 0.3} rx="3" ry="4.5" />
                        <ellipse cx="186" cy={topY - crownR * 0.35} rx="3" ry="4.5" />
                        <ellipse cx="163" cy={topY - crownR * 0.9} rx="2.5" ry="4" />
                      </g>
                    )}
                  </g>
                ) : (
                  // LUSH ROUND CANOPY (Oak, Sakura, Apple, Maple)
                  <g>
                    {/* Main crown foliage puffs */}
                    <circle
                      cx="170"
                      cy={topY - crownR * 0.75}
                      r={crownR * 1.05}
                      fill="url(#foliageGlow)"
                    />
                    <circle
                      cx={170 - crownR * 0.65}
                      cy={topY - crownR * 0.3}
                      r={crownR * 0.85}
                      fill={species.leafColor}
                    />
                    <circle
                      cx={170 + crownR * 0.65}
                      cy={topY - crownR * 0.3}
                      r={crownR * 0.85}
                      fill={species.leafColor2}
                    />
                    <circle
                      cx="170"
                      cy={topY - crownR * 1.25}
                      r={crownR * 0.7}
                      fill={species.leafColor2}
                    />

                    {/* Species specific embellishments */}
                    {growth >= 50 && (
                      <>
                        {/* SAKURA: Delicate Pink Blossom Clouds */}
                        {species.id === 'sakura' && (
                          <g fill="#FBCFE8">
                            <circle cx={152} cy={topY - crownR * 0.8} r="4.5" />
                            <circle cx={188} cy={topY - crownR * 0.7} r="4" />
                            <circle cx={170} cy={topY - crownR * 1.3} r="5" />
                            <circle cx={140} cy={topY - crownR * 0.3} r="4" />
                            <circle cx={196} cy={topY - crownR * 0.35} r="4.2" />
                            {/* Floating blossom petals drifting in the breeze */}
                            <ellipse cx="120" cy="180" rx="3" ry="2" fill="#F472B6" opacity="0.8" transform="rotate(25 120 180)" />
                            <ellipse cx="225" cy="205" rx="3.2" ry="1.8" fill="#F472B6" opacity="0.85" transform="rotate(-20 225 205)" />
                            <ellipse cx="205" cy="165" rx="2.8" ry="1.9" fill="#FBCFE8" opacity="0.75" />
                          </g>
                        )}

                        {/* APPLE TREE: Ruby red juicy apples */}
                        {species.id === 'apple' && (
                          <g fill="#EF4444">
                            <circle cx={155} cy={topY - crownR * 0.65} r="4.5" />
                            <circle cx={186} cy={topY - crownR * 0.55} r="4.8" />
                            <circle cx={170} cy={topY - crownR * 1.05} r="4.2" />
                            <circle cx={142} cy={topY - crownR * 0.25} r="4" />
                            <circle cx={194} cy={topY - crownR * 0.35} r="4.2" />
                            {/* Apple leaf caps */}
                            <ellipse cx="155" cy={topY - crownR * 0.65 - 5} rx="1.8" ry="1" fill="#10B981" />
                            <ellipse cx={186} cy={topY - crownR * 0.55 - 5} rx="1.8" ry="1" fill="#10B981" />
                          </g>
                        )}

                        {/* OAK: Majestic golden acorns */}
                        {species.id === 'oak' && (
                          <g fill="#92400E">
                            <ellipse cx={152} cy={topY - crownR * 0.5} rx="3.5" ry="5" />
                            <ellipse cx={188} cy={topY - crownR * 0.6} rx="3.5" ry="5" />
                            <ellipse cx={170} cy={topY - crownR * 1.1} rx="3.2" ry="4.5" />
                            <ellipse cx={138} cy={topY - crownR * 0.25} rx="3" ry="4" />
                          </g>
                        )}

                        {/* MAPLE: Golden glowing leaves */}
                        {species.id === 'maple' && (
                          <g fill="#F59E0B">
                            <polygon points={`155,${topY - crownR * 0.8} 150,${topY - crownR * 0.7} 160,${topY - crownR * 0.7}`} />
                            <polygon points={`185,${topY - crownR * 0.65} 180,${topY - crownR * 0.55} 190,${topY - crownR * 0.55}`} />
                            <polygon points={`170,${topY - crownR * 1.25} 165,${topY - crownR * 1.15} 175,${topY - crownR * 1.15}`} />
                          </g>
                        )}
                      </>
                    )}
                  </g>
                )}

                {/* Cozy forest bird resting on branch when >= 40% */}
                {growth >= 40 && (
                  <g opacity="0.95">
                    {/* Cute robin bird */}
                    <ellipse cx={170 + crownR * 0.55} cy={topY - crownR * 0.25} rx="5" ry="4" fill="#C2410C" />
                    <circle cx={170 + crownR * 0.55 + 3.5} cy={topY - crownR * 0.25 - 2} r="2.8" fill="#7C2D12" />
                    <circle cx={170 + crownR * 0.55 + 5} cy={topY - crownR * 0.25 - 2.5} r="0.7" fill="#F8FAFC" />
                    <polygon
                      points={`${170 + crownR * 0.55 + 5.5},${topY - crownR * 0.25 - 2} ${170 + crownR * 0.55 + 8},${topY - crownR * 0.25 - 1.5} ${170 + crownR * 0.55 + 5.5},${topY - crownR * 0.25 - 1}`}
                      fill="#F59E0B"
                    />
                  </g>
                )}
              </g>
            )}

            {/* Weeds around the roots */}
            {currentTree.weeds.map((w) => {
              const wx = w.slot === 0 ? 134 : 206;
              const wy = baseY - 6;
              return (
                <g
                  key={w.id}
                  onClick={() => handleRemoveWeed(w.id)}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <title>Торкніться, щоб вирвати бур’ян</title>
                  <path
                    d={`M${wx},${wy} Q${wx - 6},${wy - 18} ${wx - 10},${wy - 24}`}
                    stroke="#7E22CE"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <path
                    d={`M${wx},${wy} Q${wx + 6},${wy - 16} ${wx + 12},${wy - 22}`}
                    stroke="#7E22CE"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <circle cx={wx - 10} cy={wy - 24} r="3.5" fill="#C084FC" />
                  <circle cx={wx + 12} cy={wy - 22} r="3.5" fill="#C084FC" />
                </g>
              );
            })}
          </g>
        )}

        {/* TIME SANDS POURING ANIMATION CASCADE */}
        {isPouringSands && (
          <g>
            {/* Liquid sunlight beam */}
            <path
              d="M170,0 L185,0 L180,180 L160,180 Z"
              fill="url(#sandStreamGrad)"
            />
            {sandParticles.map((p) => (
              <circle
                key={p.id}
                cx={p.x}
                cy={p.y}
                r="2.5"
                fill="#FDE047"
                opacity="0.9"
                className="animate-pulse"
              />
            ))}
          </g>
        )}
      </svg>
    );
  };

  return (
    <div className="flex flex-col flex-1 pb-10 max-w-md mx-auto w-full select-none">
      {/* HEADER: Sanctuary Title & Atmosphere Controls */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#12302B] dark:text-[#f4f4f5] flex items-center gap-2">
            <span>🌿</span>
            <span>Затишний гай</span>
          </h1>
          <p className="text-xs text-[#55726B] dark:text-[#8FAAA3]">
            Твій живий ліс свободи та гармонії
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Ambience selector */}
          <button
            type="button"
            onClick={handleToggleAmbience}
            className="p-2 rounded-xl bg-white/80 dark:bg-[#141b18] hover:bg-white dark:hover:bg-[#1E2E28] border border-[#B7CDC6] dark:border-[#20342C] text-xs font-bold transition-all cursor-pointer shadow-2xs flex items-center gap-1"
            title={`Атмосфера: ${skyConfig.ambientName}. Натисніть, щоб змінити`}
          >
            {skyConfig.icon}
          </button>

          {/* Sound toggle */}
          <button
            type="button"
            onClick={handleToggleSound}
            className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-2xs ${
              soundEnabled
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                : 'bg-white/80 dark:bg-[#141b18] hover:bg-white dark:hover:bg-[#1E2E28] border-[#B7CDC6] dark:border-[#20342C] text-[#55726B] dark:text-[#8FAAA3]'
            }`}
            title={soundEnabled ? 'Вимкнути звуковий супровід' : 'Увімкнути звуковий супровід лісу'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Info Modal */}
          <button
            type="button"
            onClick={() => setShowStagesModal(true)}
            className="p-2 rounded-xl bg-white/80 dark:bg-[#141b18] hover:bg-white dark:hover:bg-[#1E2E28] border border-[#B7CDC6] dark:border-[#20342C] text-[#55726B] dark:text-[#8FAAA3] transition-all cursor-pointer shadow-2xs"
            title="Етапи розвитку дерева"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* TOP RESOURCE BAR: Sands of Time & Oxygen */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {/* Sands of Time Card */}
        <div className="p-2.5 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-300 flex items-center justify-center font-bold text-base">
              ⏳
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-[#8A5A1B] dark:text-[#FCD34D] tracking-wider">
                Піщинки часу
              </div>
              <div className="text-sm font-extrabold font-mono text-[#78350F] dark:text-[#FDE68A]">
                {availableSands.toLocaleString()}
              </div>
            </div>
          </div>
          <span className="text-[10px] font-semibold text-amber-700/80 dark:text-amber-300/80">
            +1/с
          </span>
        </div>

        {/* Forest Oxygen & Tree count Card */}
        <div className="p-2.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 flex items-center justify-center font-bold text-base">
              🍃
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-[#1E8A69] dark:text-[#6EE7B7] tracking-wider">
                Оксиген лісу
              </div>
              <div className="text-sm font-extrabold font-mono text-[#064E3B] dark:text-[#A7F3D0]">
                {totalOxygenKg} кг О₂
              </div>
            </div>
          </div>
          <span className="text-[10px] font-semibold text-emerald-700/80 dark:text-emerald-300/80">
            {totalForestCount} 🌲
          </span>
        </div>
      </div>

      {/* 2-SEGMENTED VIEW SWITCHER: Sapling Care vs The Cozy Grove */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-gray-200/70 dark:bg-black/40 rounded-2xl mb-3">
        <button
          type="button"
          onClick={() => setActiveView('sapling')}
          className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeView === 'sapling'
              ? 'bg-white dark:bg-[#18181d] text-[#1E8A69] dark:text-[#4CC9A0] shadow-xs'
              : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
          }`}
        >
          <Sprout className="w-3.5 h-3.5" />
          <span>Саджанець під опікою</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveView('forest')}
          className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeView === 'forest'
              ? 'bg-white dark:bg-[#18181d] text-[#1E8A69] dark:text-[#4CC9A0] shadow-xs'
              : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
          }`}
        >
          <Trees className="w-3.5 h-3.5" />
          <span>Твій затишний ліс ({totalForestCount})</span>
        </button>
      </div>

      {/* ACTION FEEDBACK TOAST */}
      {actionFeedback && (
        <div className="p-2.5 mb-3 bg-emerald-600/15 border border-emerald-500/30 rounded-2xl text-xs font-semibold text-center text-emerald-800 dark:text-emerald-200 animate-fade-in shadow-2xs">
          {actionFeedback}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 1: 🌱 SAPLING CARE VIEW */}
      {/* ========================================================================= */}
      {activeView === 'sapling' && (
        <>
          {/* Main Visual Scene Container */}
          <div className="relative border border-[#B7CDC6] dark:border-[#20342C] rounded-3xl overflow-hidden mb-3 shadow-sm">
            {renderTreeSceneSvg()}

            {/* Species Badge Overlay */}
            {currentTree && (
              <div className="absolute top-3 left-3 px-3 py-1 bg-white/85 dark:bg-[#141b18]/85 backdrop-blur-xs rounded-full border border-[#B7CDC6] dark:border-[#20342C] text-xs font-bold flex items-center gap-1.5 text-[#12302B] dark:text-[#f4f4f5] shadow-xs">
                <span>{currentSpecies.icon}</span>
                <span>{currentSpecies.name}</span>
                <span className="text-[10px] text-[#55726B] dark:text-[#8FAAA3] font-normal">
                  • {Math.floor(currentTree.growth)}%
                </span>
              </div>
            )}

            {/* Weed Warning Bubble */}
            {currentTree && currentTree.weeds.length > 0 && (
              <div className="absolute top-3 right-3 px-3 py-1 bg-purple-600 text-white rounded-full text-xs font-bold flex items-center gap-1.5 animate-bounce shadow-md">
                <Scissors className="w-3 h-3" />
                <span>Вирви бур'ян!</span>
              </div>
            )}
          </div>

          {/* ACTIVE GROWING TREE CONTROLS */}
          {currentTree ? (
            <div className="flex flex-col gap-3">
              {/* Growth Status Card */}
              <div className="p-4 rounded-3xl bg-white/80 dark:bg-[#141b18] border border-[#B7CDC6] dark:border-[#20342C] shadow-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <span className="text-xs uppercase font-extrabold text-[#1E8A69] dark:text-[#4CC9A0] tracking-wider">
                      Етап {currentStage.stageNum}: {currentStage.name}
                    </span>
                    <p className="text-[11px] text-[#55726B] dark:text-[#8FAAA3]">
                      Росте вже {daysGrowing} дн. • {currentSpecies.symbol}
                    </p>
                  </div>
                  <span className="text-xl font-black font-mono text-[#1E8A69] dark:text-[#4CC9A0]">
                    {Math.floor(currentTree.growth)}%
                  </span>
                </div>

                {/* Growth Progress Bar */}
                <div className="w-full h-3 bg-[#CBDDD7] dark:bg-[#1D3832] rounded-full overflow-hidden mb-2.5">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(5, currentTree.growth)}%` }}
                  />
                </div>

                <p className="text-xs text-[#12302B] dark:text-[#d1d5db] leading-relaxed mb-3">
                  💡 {currentStage.careTip}
                </p>

                {/* Care buttons: Water, Sun, Food */}
                <div className="grid grid-cols-3 gap-2">
                  {/* Water */}
                  <button
                    type="button"
                    onClick={handleWater}
                    className="p-2.5 rounded-2xl border border-[#B7CDC6] dark:border-[#20342C] bg-sky-500/5 hover:bg-sky-500/15 text-[#12302B] dark:text-[#f4f4f5] flex flex-col items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-2xs"
                  >
                    <Droplets className="w-5 h-5 text-sky-500" />
                    <span className="text-xs font-bold">Волога</span>
                    <div className="w-full h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-500 rounded-full" style={{ width: `${currentTree.water}%` }} />
                    </div>
                    <span className="text-[10px] font-mono opacity-80">{Math.round(currentTree.water)}%</span>
                  </button>

                  {/* Sun */}
                  <button
                    type="button"
                    onClick={handleSun}
                    className="p-2.5 rounded-2xl border border-[#B7CDC6] dark:border-[#20342C] bg-amber-500/5 hover:bg-amber-500/15 text-[#12302B] dark:text-[#f4f4f5] flex flex-col items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-2xs"
                  >
                    <Sun className="w-5 h-5 text-amber-500" />
                    <span className="text-xs font-bold">Тепло</span>
                    <div className="w-full h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${currentTree.sun}%` }} />
                    </div>
                    <span className="text-[10px] font-mono opacity-80">{Math.round(currentTree.sun)}%</span>
                  </button>

                  {/* Compost / Food */}
                  <button
                    type="button"
                    onClick={handleFood}
                    className="p-2.5 rounded-2xl border border-[#B7CDC6] dark:border-[#20342C] bg-emerald-500/5 hover:bg-emerald-500/15 text-[#12302B] dark:text-[#f4f4f5] flex flex-col items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-2xs"
                  >
                    <Sprout className="w-5 h-5 text-emerald-500" />
                    <span className="text-xs font-bold">Пожива</span>
                    <div className="w-full h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${currentTree.food}%` }} />
                    </div>
                    <span className="text-[10px] font-mono opacity-80">{Math.round(currentTree.food)}%</span>
                  </button>
                </div>
              </div>

              {/* ⏳ CHAMBER OF TIME SANDS ACCELERATION */}
              <div className="p-4 rounded-3xl bg-gradient-to-br from-amber-950/40 via-[#181a14] to-emerald-950/40 border border-amber-500/40 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Hourglass className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
                    <h3 className="text-xs uppercase font-extrabold text-amber-300 tracking-wider">
                      Прискорення Піщинками часу
                    </h3>
                  </div>
                  <span className="text-xs font-bold font-mono text-amber-300">
                    {availableSands.toLocaleString()} ⏳
                  </span>
                </div>

                <p className="text-[11px] text-amber-200/80 mb-3 leading-snug">
                  1 секунда життя без тютюну = 1 піщинка часу. Спрямуйте плин часу, щоб прискорити ріст вашого дерева:
                </p>

                {/* Quick Sand Injection Buttons */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {/* Option 1: 60 sands (+1.5%) */}
                  <button
                    type="button"
                    disabled={availableSands < 60 || currentTree.growth >= 100}
                    onClick={() => handleChannelTimeSands(60)}
                    className="p-2 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 flex flex-col items-center gap-0.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs active:scale-95"
                  >
                    <span className="text-xs font-extrabold">Жменя часу</span>
                    <span className="text-[10px] font-mono font-bold text-white">60 ⏳</span>
                    <span className="text-[9px] text-amber-400 font-semibold">+1.5% росту</span>
                  </button>

                  {/* Option 2: 300 sands (+8.0% + auto weed clear) */}
                  <button
                    type="button"
                    disabled={availableSands < 300 || currentTree.growth >= 100}
                    onClick={() => handleChannelTimeSands(300)}
                    className="p-2 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 flex flex-col items-center gap-0.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs active:scale-95"
                  >
                    <span className="text-xs font-extrabold">Потік часу</span>
                    <span className="text-[10px] font-mono font-bold text-white">300 ⏳</span>
                    <span className="text-[9px] text-amber-400 font-semibold">+8% + бур'яни</span>
                  </button>

                  {/* Option 3: 1,800 sands (+45%) */}
                  <button
                    type="button"
                    disabled={availableSands < 1800 || currentTree.growth >= 100}
                    onClick={() => handleChannelTimeSands(1800)}
                    className="p-2 rounded-2xl bg-gradient-to-r from-amber-500/25 to-orange-500/25 hover:from-amber-500/35 hover:to-orange-500/35 border border-amber-500/50 text-amber-200 flex flex-col items-center gap-0.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs active:scale-95"
                  >
                    <span className="text-xs font-extrabold">Ріка вічності</span>
                    <span className="text-[10px] font-mono font-bold text-white">1,800 ⏳</span>
                    <span className="text-[9px] text-amber-400 font-semibold">+45% росту</span>
                  </button>
                </div>

                {/* Instant Complete Growth to 100% Button */}
                {currentTree.growth < 100 && (
                  <button
                    type="button"
                    onClick={handleInstantMatureWithSands}
                    disabled={availableSands < Math.ceil(((100 - currentTree.growth) / 1.5) * 60)}
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500/30 to-emerald-500/30 hover:from-amber-500/40 hover:to-emerald-500/40 border border-amber-400/40 text-amber-200 text-xs font-bold flex items-center justify-between transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                  >
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Миттєво виростити до 100%</span>
                    </span>
                    <span className="font-mono text-[11px] font-bold text-white">
                      {Math.ceil(((100 - currentTree.growth) / 1.5) * 60).toLocaleString()} ⏳
                    </span>
                  </button>
                )}
              </div>

              {/* CELEBRATION BUTTON: HARVEST TO GROVE WHEN GROWN */}
              {currentTree.growth >= 100 && (
                <button
                  type="button"
                  onClick={handleHarvestToGrove}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg animate-pulse transition-all"
                >
                  <Trees className="w-5 h-5" />
                  <span>Дерево дозріло! Посадити у Вічний ліс 🎉</span>
                </button>
              )}
            </div>
          ) : (
            /* NO ACTIVE TREE: Plant Seed / Waiting for next 300 cigs */
            <div className="p-5 rounded-3xl bg-white/80 dark:bg-[#141b18] border border-[#B7CDC6] dark:border-[#20342C] text-center shadow-xs">
              {!money ? (
                <div>
                  <h3 className="text-sm font-bold text-[#12302B] dark:text-[#f4f4f5] mb-1">
                    Вкажіть свої звички у розділі «Гроші»
                  </h3>
                  <p className="text-xs text-[#55726B] dark:text-[#8FAAA3] mb-3 leading-relaxed">
                    Застосунок порахує збережені сигарети та відкриє посадку дерев (кожні 300 сигарет = 1 врятоване дерево).
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
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mx-auto mb-2 text-2xl">
                    🌱
                  </div>
                  <h3 className="text-base font-bold text-[#12302B] dark:text-[#f4f4f5] mb-1">
                    Ви врятували нове дерево!
                  </h3>
                  <p className="text-xs text-[#55726B] dark:text-[#8FAAA3] mb-4 leading-relaxed">
                    За кожні 300 невикурених сигарет відкривається нове зернятко на вибір.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowSeedPicker(true)}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white font-extrabold text-sm rounded-2xl cursor-pointer shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Sprout className="w-4 h-4" />
                    <span>Обрати зернятко для вирощування</span>
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-[#12302B] dark:text-[#f4f4f5]">
                      Відлік до наступного зернятка
                    </span>
                    <span className="text-xs font-mono font-bold text-[#1E8A69] dark:text-[#4CC9A0]">
                      {Math.floor(cigsAvoided % CIGS_PER_TREE)} / {CIGS_PER_TREE}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-[#CBDDD7] dark:bg-[#1D3832] rounded-full overflow-hidden mb-2.5">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                      style={{
                        width: `${Math.min(100, Math.max(3, ((cigsAvoided % CIGS_PER_TREE) / CIGS_PER_TREE) * 100))}%`
                      }}
                    />
                  </div>
                  <p className="text-xs text-[#55726B] dark:text-[#8FAAA3] leading-relaxed">
                    Залишилося утриматися ще від{' '}
                    <strong className="text-[#12302B] dark:text-[#f4f4f5]">
                      {Math.max(1, CIGS_PER_TREE - Math.floor(cigsAvoided % CIGS_PER_TREE))}
                    </strong>{' '}
                    сигарет, щоб отримати наступне живе дерево!
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: 🌲 THE COZY GROVE (PANORAMA & SANCTUARY) */}
      {/* ========================================================================= */}
      {activeView === 'forest' && (
        <div className="flex flex-col gap-3">
          {/* Panoramic Grove Meadow Illustration */}
          <div className="relative border border-[#B7CDC6] dark:border-[#20342C] rounded-3xl overflow-hidden shadow-sm bg-gradient-to-b from-sky-900/20 to-emerald-950/30 p-3">
            <svg viewBox="0 0 340 210" className="w-full h-auto select-none">
              {/* Meadow backdrop */}
              <rect width="340" height="210" fill="url(#sanctuarySky)" rx="18" />

              {/* Rolling emerald hills */}
              <path d="M0,130 Q90,95 180,125 T340,120 L340,210 L0,210 Z" fill={skyConfig.hillBack} opacity="0.85" />
              <path d="M0,150 Q100,120 200,145 T340,140 L340,210 L0,210 Z" fill={skyConfig.hillFront} />

              {/* Cozy wooden bench in the clearing */}
              <g opacity="0.9">
                {/* Bench legs */}
                <line x1="150" y1="185" x2="150" y2="195" stroke="#4A3420" strokeWidth="2.5" />
                <line x1="190" y1="185" x2="190" y2="195" stroke="#4A3420" strokeWidth="2.5" />
                {/* Bench seat */}
                <rect x="144" y="183" width="52" height="4" rx="2" fill="#78502B" />
                {/* Bench back */}
                <rect x="144" y="174" width="52" height="4" rx="2" fill="#8C5E33" />
                <line x1="152" y1="174" x2="152" y2="183" stroke="#4A3420" strokeWidth="2" />
                <line x1="188" y1="174" x2="188" y2="183" stroke="#4A3420" strokeWidth="2" />
                {/* Cozy lantern resting on bench */}
                <rect x="178" y="177" width="4" height="6" fill="#FDE047" rx="1" />
              </g>

              {/* Harvested Trees planted across the meadow */}
              {treeState.forest.length > 0 ? (
                treeState.forest.map((t, idx) => {
                  const sp = TREE_SPECIES[t.speciesId] || TREE_SPECIES.oak;
                  // Distribute horizontally
                  const step = 300 / Math.max(1, treeState.forest.length + 1);
                  const tx = 25 + step * (idx + 1);
                  const ty = 160 + (idx % 2 === 0 ? -12 : 6);
                  return (
                    <g
                      key={t.id}
                      onClick={() => {
                        setInspectTree(t);
                        setEditingNickname(t.nickname || `${sp.name} №${idx + 1}`);
                      }}
                      className="cursor-pointer hover:opacity-85 transition-opacity"
                    >
                      <title>{t.nickname || sp.name} (Натисніть для перегляду)</title>
                      {/* Tree Trunk */}
                      <rect x={tx - 3} y={ty - 34} width="6" height="34" rx="2" fill={sp.trunkColor} />
                      {/* Tree Canopy */}
                      <circle cx={tx} cy={ty - 42} r="18" fill={sp.leafColor} />
                      <circle cx={tx + 5} cy={ty - 45} r="14" fill={sp.leafColor2} />
                      <circle cx={tx - 6} cy={ty - 38} r="12" fill={sp.leafColor} />
                      {/* Species icon indicator */}
                      <circle cx={tx} cy={ty + 6} r="4" fill="#FFFFFF" opacity="0.3" />
                    </g>
                  );
                })
              ) : (
                /* No trees in grove yet: welcoming sign */
                <g>
                  {/* Wooden signpost */}
                  <rect x="168" y="145" width="4" height="28" fill="#5A3A1E" rx="1" />
                  <rect x="145" y="132" width="50" height="18" fill="#85532F" rx="3" />
                  <text x="170" y="144" fill="#FEF08A" fontSize="8" fontWeight="bold" textAnchor="middle">
                    Твій ліс
                  </text>
                </g>
              )}
            </svg>
          </div>

          {/* Grove Statistics Card */}
          <div className="p-4 rounded-3xl bg-white/80 dark:bg-[#141b18] border border-[#B7CDC6] dark:border-[#20342C] shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Trees className="w-4 h-4 text-[#1E8A69]" />
                <h3 className="text-sm font-bold text-[#12302B] dark:text-[#f4f4f5]">
                  Хроніка вашого лісу
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-[#1E8A69] dark:text-[#4CC9A0]">
                {totalForestCount} дерев
              </span>
            </div>

            {totalForestCount > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {treeState.forest.map((f, i) => {
                  const sp = TREE_SPECIES[f.speciesId] || TREE_SPECIES.oak;
                  const plantDate = new Date(f.plantedAt).toLocaleDateString('uk-UA');
                  const growDate = new Date(f.grownAt).toLocaleDateString('uk-UA');
                  return (
                    <div
                      key={f.id}
                      onClick={() => {
                        setInspectTree(f);
                        setEditingNickname(f.nickname || `${sp.name} №${i + 1}`);
                      }}
                      className="p-3 rounded-2xl bg-white dark:bg-[#1c1c21] border border-[#B7CDC6] dark:border-[#20342C] flex items-center justify-between cursor-pointer hover:border-emerald-500 transition-all shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{sp.icon}</span>
                        <div>
                          <h4 className="text-xs font-bold text-[#12302B] dark:text-[#f4f4f5]">
                            {f.nickname || `${sp.name} №${i + 1}`}
                          </h4>
                          <p className="text-[10px] text-[#55726B] dark:text-[#8FAAA3]">
                            Посаджено {plantDate} • +{f.oxygenProducedKg || 25} кг О₂
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 px-2">
                <p className="text-xs text-[#55726B] dark:text-[#8FAAA3] leading-relaxed">
                  Ваш затишний гай ще очікує на своє перше величне дерево. Доглядайте за першим саджанцем та прискорюйте його Піщинками часу!
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: SEED PICKER */}
      {/* ========================================================================= */}
      {showSeedPicker && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#E9F1EE] dark:bg-[#121212] border border-[#B7CDC6] dark:border-[#20342C] rounded-3xl p-5 max-w-sm w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-4">
              <span className="text-3xl">🌱</span>
              <h2 className="text-lg font-bold text-[#12302B] dark:text-[#f4f4f5] mt-1">
                Оберіть зернятко дерева
              </h2>
              <p className="text-xs text-[#55726B] dark:text-[#8FAAA3]">
                Кожне дерево має свій символізм, вигляд та життєву силу.
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
                        ? 'border-emerald-600 bg-white dark:bg-[#1c1c21] shadow-sm'
                        : 'border-[#B7CDC6] dark:border-[#20342C] bg-white/50 dark:bg-[#1c1c21]/50 hover:border-emerald-500/60'
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
                        <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-0.5">
                      {sp.symbol}
                    </p>
                    <p className="text-[11px] text-[#55726B] dark:text-[#8FAAA3] leading-snug">
                      {sp.description}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowSeedPicker(false)}
                className="flex-1 py-2.5 border border-[#B7CDC6] dark:border-[#20342C] text-xs font-semibold rounded-xl text-[#55726B] dark:text-[#8FAAA3] cursor-pointer"
              >
                Скасувати
              </button>
              <button
                type="button"
                onClick={handlePlantSelectedSeed}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm transition-colors"
              >
                Посадити зернятко
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: INSPECT TREE PLAQUE */}
      {/* ========================================================================= */}
      {inspectTree && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#E9F1EE] dark:bg-[#121212] border border-[#B7CDC6] dark:border-[#20342C] rounded-3xl p-5 max-w-sm w-full shadow-2xl">
            <div className="text-center mb-3">
              <span className="text-4xl">
                {TREE_SPECIES[inspectTree.speciesId]?.icon || '🌳'}
              </span>
              <h3 className="text-base font-bold text-[#12302B] dark:text-[#f4f4f5] mt-1">
                Табличка дерева
              </h3>
              <p className="text-xs text-[#55726B] dark:text-[#8FAAA3]">
                {TREE_SPECIES[inspectTree.speciesId]?.name} • {TREE_SPECIES[inspectTree.speciesId]?.botanicalName}
              </p>
            </div>

            {/* Rename Input */}
            <div className="mb-4">
              <label className="block text-[11px] font-bold text-[#55726B] dark:text-[#8FAAA3] mb-1">
                Затишне ім'я дерева:
              </label>
              <input
                type="text"
                value={editingNickname}
                onChange={(e) => setEditingNickname(e.target.value)}
                maxLength={30}
                className="w-full px-3 py-2 bg-white dark:bg-[#1c1c21] border border-[#B7CDC6] dark:border-[#20342C] rounded-xl text-xs font-bold text-[#12302B] dark:text-[#f4f4f5] focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Tree Info Details */}
            <div className="p-3 bg-white/60 dark:bg-[#1c1c21]/60 rounded-2xl mb-4 text-xs flex flex-col gap-1.5 text-[#12302B] dark:text-[#f4f4f5]">
              <div className="flex justify-between">
                <span className="text-[#55726B] dark:text-[#8FAAA3]">Посаджено:</span>
                <span className="font-semibold">{new Date(inspectTree.plantedAt).toLocaleDateString('uk-UA')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#55726B] dark:text-[#8FAAA3]">Перенесено до лісу:</span>
                <span className="font-semibold">{new Date(inspectTree.grownAt).toLocaleDateString('uk-UA')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#55726B] dark:text-[#8FAAA3]">Оксиген свободи:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">+{inspectTree.oxygenProducedKg || 25} кг О₂</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setInspectTree(null)}
                className="flex-1 py-2.5 border border-[#B7CDC6] dark:border-[#20342C] text-xs font-semibold rounded-xl text-[#55726B] dark:text-[#8FAAA3] cursor-pointer"
              >
                Закрити
              </button>
              <button
                type="button"
                onClick={handleSaveTreeNickname}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm transition-colors"
              >
                Зберегти
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: GROWTH STAGES INFO */}
      {/* ========================================================================= */}
      {showStagesModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#E9F1EE] dark:bg-[#121212] border border-[#B7CDC6] dark:border-[#20342C] rounded-3xl p-5 max-w-sm w-full shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-emerald-600" />
                <h3 className="text-base font-bold text-[#12302B] dark:text-[#f4f4f5]">
                  Етапи розвитку дерева
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowStagesModal(false)}
                className="text-xs font-bold text-[#55726B] hover:text-[#12302B] p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#55726B] dark:text-[#8FAAA3] mb-4 leading-relaxed">
              Ріст дерева синхронізовано з часом вашої свободи від тютюну. Кожна секунда дарує 1 Піщинку часу, якими можна прискорювати розвиток вашого гаю.
            </p>

            <div className="flex flex-col gap-3 mb-4">
              {TREE_STAGES.map((st) => (
                <div
                  key={st.stageNum}
                  className="p-3 bg-white dark:bg-[#1c1c21] border border-[#B7CDC6] dark:border-[#20342C] rounded-2xl"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
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
                    🌱 {st.careTip}
                  </p>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowStagesModal(false)}
              className="w-full py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Зрозуміло
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
