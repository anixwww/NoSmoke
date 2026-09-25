import React, { useState, useEffect, useRef } from 'react';
import { DragonState, DragonRelic, DragonActiveBuff, TabType } from '../types';
import {
  DRAGON_STAGES,
  DRAGON_ARTIFACTS,
  DRAGON_BUFFS,
  AstralArtifact,
  AstralBuffDef,
  getDragonStage,
  getDragonLevelTitle,
  getLevelUpCost,
  getDungeonEnemy,
  dragonAudio
} from '../data/dragonData';
import {
  Sparkles,
  Wind,
  Swords,
  Shield,
  Flame,
  Zap,
  Award,
  Crown,
  Edit2,
  Check,
  Lock,
  ChevronRight,
  Info,
  Clock,
  Play
} from 'lucide-react';

interface DragonTabProps {
  cigsAvoided: number;
  totalFreeMs: number;
  dragonState: DragonState;
  onUpdateDragonState: (newState: DragonState) => void;
  onSwitchTab: (tab: TabType) => void;
}

export const DragonTab: React.FC<DragonTabProps> = ({
  cigsAvoided,
  totalFreeMs,
  dragonState,
  onUpdateDragonState,
  onSwitchTab
}) => {
  // Navigation tabs inside Dragon game
  const [activeSection, setActiveSection] = useState<'dungeon' | 'level' | 'artifacts' | 'buffs'>('dungeon');

  // Dragon interaction state
  const [isRenaming, setIsRenaming] = useState(false);
  const [nameInput, setNameInput] = useState(dragonState.name || 'Астрал');
  const [pettingFeedback, setPettingFeedback] = useState<string | null>(null);
  const [dragonMood, setDragonMood] = useState<'calm' | 'happy' | 'breathing' | 'combat'>('calm');
  const [stardustParticles, setStardustParticles] = useState<{ id: number; x: number; y: number }[]>([]);

  // Synchronized Breathing Mode directly on dragon
  const [isBreathingMode, setIsBreathingMode] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathTimer, setBreathTimer] = useState(4);
  const [completedBreaths, setCompletedBreaths] = useState(0);

  // Auto-Dungeon & Auto-Feed to 100% state
  const [isAutoDungeonRunning, setIsAutoDungeonRunning] = useState(false);

  // Active Buffs countdown interval
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute Active Buffs
  const now = Date.now();
  const activeBuffs = (dragonState.activeBuffs || []).filter((b) => b.expiresAt > now);

  // Calculate Equipped Artifacts bonuses
  const equippedIds = dragonState.equippedArtifacts || [];
  const equippedArtifacts = DRAGON_ARTIFACTS.filter((a) => equippedIds.includes(a.id));

  // Multipliers
  let stardustMultiplier = 1.0;
  let damageReduction = 0;
  let powerBonus = 0;
  let critBonus = 0;

  for (const art of equippedArtifacts) {
    if (art.effectType === 'stardust_boost') stardustMultiplier += art.effectValue;
    if (art.effectType === 'defense') damageReduction += art.effectValue;
    if (art.effectType === 'combat_power') powerBonus += art.effectValue;
    if (art.effectType === 'crit_power') critBonus += art.effectValue;
  }

  for (const buff of activeBuffs) {
    if (buff.id === 'will_light') stardustMultiplier += 0.50;
    if (buff.id === 'serenity_shield') damageReduction += 0.40;
    if (buff.id === 'dragon_fury') powerBonus += Math.floor((dragonState.level || 1) * 15);
  }

  // Combat Power
  const currentLevel = dragonState.level || 1;
  const currentStardust = dragonState.stardust || 0;
  const levelTitle = getDragonLevelTitle(currentLevel);
  const levelCost = getLevelUpCost(currentLevel);
  const currentStage = getDragonStage(cigsAvoided);

  const combatPower = Math.floor(
    (dragonState.stardust || 0) * 0.4 +
    currentLevel * 14 +
    powerBonus +
    (dragonState.energy || 70) * 0.3
  );

  // Dungeon battle state
  const currentFloor = dragonState.dungeonFloor || 1;
  const currentEnemy = getDungeonEnemy(currentFloor);
  const [enemyHp, setEnemyHp] = useState(currentEnemy.hp);
  const [dragonHp, setDragonHp] = useState(100 + currentLevel * 20);
  const [battleState, setBattleState] = useState<'ready' | 'fighting' | 'won' | 'lost'>('ready');
  const [battleLogs, setBattleLogs] = useState<string[]>([]);
  const [isAttacking, setIsAttacking] = useState(false);

  // Reset enemy when floor changes
  useEffect(() => {
    setEnemyHp(currentEnemy.hp);
    setDragonHp(100 + currentLevel * 20);
    setBattleState('ready');
    setBattleLogs([]);
  }, [currentFloor, currentLevel]);

  // Breathing loop
  useEffect(() => {
    if (!isBreathingMode) return;
    let bInterval: any;
    bInterval = setInterval(() => {
      setBreathTimer((prev) => {
        if (prev <= 1) {
          if (breathPhase === 'inhale') {
            setBreathPhase('hold');
            return 4;
          } else if (breathPhase === 'hold') {
            setBreathPhase('exhale');
            return 4;
          } else {
            setBreathPhase('inhale');
            setCompletedBreaths((c) => c + 1);
            dragonAudio.playBreathSwell();
            return 4;
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(bInterval);
  }, [isBreathingMode, breathPhase]);

  // Touch & Stroke (Petting) interaction handler
  const handlePetDragon = (e?: React.MouseEvent<any> | React.TouchEvent<any>) => {
    let x = 100;
    let y = 100;
    if (e && e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      let clientX = rect.left + rect.width / 2;
      let clientY = rect.top + rect.height / 2;
      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = (e as React.MouseEvent).clientX;
        clientY = (e as React.MouseEvent).clientY;
      }
      x = clientX - rect.left;
      y = clientY - rect.top;
    }

    // Add particle
    setStardustParticles((prev) => [
      ...prev.slice(-10),
      { id: Date.now() + Math.random(), x, y }
    ]);

    setDragonMood('happy');
    dragonAudio.playPet();

    // Reward gentle touch with energy and affinity
    const newEnergy = Math.min(100, (dragonState.energy || 70) + 1);
    const newAffinity = Math.min(100, (dragonState.affinity || 50) + 1);

    onUpdateDragonState({
      ...dragonState,
      energy: newEnergy,
      affinity: newAffinity
    });

    setPettingFeedback('💖 Дракон задоволено муркоче (+⚡ Енергія)');
    setTimeout(() => {
      setDragonMood('calm');
      setPettingFeedback(null);
    }, 2200);
  };

  // Feed Dragon with Stardust
  const handleFeedDragon = () => {
    if (currentStardust < 10) {
      setPettingFeedback('Потрібно щонайменше 10 ✨ Зоряного пилу для годування');
      setTimeout(() => setPettingFeedback(null), 2500);
      return;
    }

    const newStardust = currentStardust - 10;
    const newEnergy = Math.min(100, (dragonState.energy || 70) + 25);
    const newAffinity = Math.min(100, (dragonState.affinity || 50) + 3);

    dragonAudio.playFeed();
    setDragonMood('happy');

    onUpdateDragonState({
      ...dragonState,
      stardust: newStardust,
      energy: newEnergy,
      affinity: newAffinity,
      lastFed: Date.now()
    });

    setPettingFeedback('✨ Дракон ввібрав зоряний пил! Енергія +25% ⚡');
    setTimeout(() => {
      setDragonMood('calm');
      setPettingFeedback(null);
    }, 2500);
  };

  // Restore Energy to 100% via Feeding Stardust
  const handleFeedTo100Percent = () => {
    const curEnergy = dragonState.energy ?? 70;
    if (curEnergy >= 100) {
      setPettingFeedback('⚡ Енергія дракона вже на максимумі (100%)!');
      setTimeout(() => setPettingFeedback(null), 2500);
      return;
    }

    const missing = 100 - curEnergy;
    const feedsNeeded = Math.ceil(missing / 25);
    const maxFeeds = Math.floor((dragonState.stardust || 0) / 10);

    if (maxFeeds === 0) {
      setPettingFeedback('Недостатньо зоряного пилу для годування (потрібно 10 ✨)');
      setTimeout(() => setPettingFeedback(null), 2500);
      return;
    }

    const actualFeeds = Math.min(feedsNeeded, maxFeeds);
    const spentStardust = actualFeeds * 10;
    const gainedEnergy = actualFeeds * 25;
    const newEnergy = Math.min(100, curEnergy + gainedEnergy);

    dragonAudio.playFeed();
    setDragonMood('happy');

    onUpdateDragonState({
      ...dragonState,
      energy: newEnergy,
      stardust: (dragonState.stardust || 0) - spentStardust,
      affinity: Math.min(100, (dragonState.affinity || 50) + actualFeeds * 2),
      lastFed: Date.now()
    });

    setPettingFeedback(`⚡ Енергію відновлено до ${newEnergy}% (-${spentStardust} ✨ пилу)!`);
    setTimeout(() => {
      setDragonMood('calm');
      setPettingFeedback(null);
    }, 2500);
  };

  // Toggle Live Auto Dungeon Crawl
  const handleToggleAutoDungeon = () => {
    if (isAutoDungeonRunning) {
      setIsAutoDungeonRunning(false);
      setPettingFeedback('⏹️ Авто-рейд зупинено гравцем');
      setTimeout(() => setPettingFeedback(null), 2500);
      return;
    }

    // Starting auto-raid: check energy, if below 100%, try to feed to 100%
    let curEnergy = dragonState.energy ?? 70;
    let curStardust = dragonState.stardust ?? 0;

    if (curEnergy < 100 && curStardust >= 10) {
      const missing = 100 - curEnergy;
      const feedsNeeded = Math.ceil(missing / 25);
      const actualFeeds = Math.min(feedsNeeded, Math.floor(curStardust / 10));
      const spent = actualFeeds * 10;
      curEnergy = Math.min(100, curEnergy + actualFeeds * 25);
      curStardust -= spent;

      dragonAudio.playFeed();
      onUpdateDragonState({
        ...dragonState,
        energy: curEnergy,
        stardust: curStardust,
        lastFed: Date.now()
      });
    }

    if (curEnergy < 15) {
      setPettingFeedback('❌ Потрібно щонайменше 15 ⚡ енергії або 10 ✨ пилу для авто-проходження!');
      setTimeout(() => setPettingFeedback(null), 3000);
      return;
    }

    setIsAutoDungeonRunning(true);
    setPettingFeedback(`⚡ Авто-рейд розпочато! Дракон самостійно зачищає данж та відновлює енергію до 100%`);
    setTimeout(() => setPettingFeedback(null), 3000);
  };

  // Execute 1 step of live auto-dungeon crawl
  const executeAutoDungeonStep = () => {
    let curEnergy = dragonState.energy ?? 70;
    let curStardust = dragonState.stardust ?? 0;
    let curInfernal = dragonState.infernalDust ?? 0;
    let curFloor = dragonState.dungeonFloor ?? 1;
    let curWins = dragonState.dungeonWins ?? 0;

    // 1. If energy < 15, auto-feed to 100% with stardust
    if (curEnergy < 15) {
      const missing = 100 - curEnergy;
      const feedsNeeded = Math.ceil(missing / 25);
      const maxFeeds = Math.floor(curStardust / 10);

      if (maxFeeds === 0) {
        setIsAutoDungeonRunning(false);
        setPettingFeedback('❌ Авто-рейд зупинено: закінчився зоряний пил для годування дракона!');
        setTimeout(() => setPettingFeedback(null), 3500);
        return;
      }

      const actualFeeds = Math.min(feedsNeeded, maxFeeds);
      const spent = actualFeeds * 10;
      const newEnergy = Math.min(100, curEnergy + actualFeeds * 25);
      const newStardust = curStardust - spent;

      dragonAudio.playFeed();
      onUpdateDragonState({
        ...dragonState,
        energy: newEnergy,
        stardust: newStardust,
        lastFed: Date.now()
      });

      const feedMsg = `🥣 Авто-годування: енергію відновлено до ${newEnergy}% (-${spent} ✨)`;
      setPettingFeedback(feedMsg);
      setBattleLogs((prev) => [feedMsg, ...prev.slice(0, 4)]);
      return; // Wait for next tick to attack with full energy
    }

    // 2. Battle current enemy on current floor
    const enemy = getDungeonEnemy(curFloor);
    const effectivePower = Math.floor(
      curStardust * 0.4 + currentLevel * 14 + powerBonus + curEnergy * 0.3
    );

    // Can win?
    if (effectivePower * 2.1 < enemy.hp) {
      setIsAutoDungeonRunning(false);
      setPettingFeedback(`⚠️ Авто-рейд зупинено: Ворог «${enemy.name}» (Поверх ${curFloor}) занадто могутній!`);
      setTimeout(() => setPettingFeedback(null), 3500);
      return;
    }

    // Defeat enemy
    dragonAudio.playAttack();
    const nextEnergy = Math.max(0, curEnergy - 15);
    const dustWon = Math.round(enemy.rewardStardust * stardustMultiplier);
    const infernalWon = enemy.rewardInfernalDust;

    const nextStardust = curStardust + dustWon;
    const nextInfernal = curInfernal + infernalWon;
    const nextFloor = curFloor + 1;
    const nextWins = curWins + 1;

    const logText = `⚡ Авто: Поверх ${curFloor} (${enemy.name}) зачищено! +${dustWon} ✨` + (infernalWon > 0 ? ` +${infernalWon} 🔥` : '');
    setBattleLogs((prev) => [logText, ...prev.slice(0, 4)]);

    onUpdateDragonState({
      ...dragonState,
      energy: nextEnergy,
      stardust: nextStardust,
      infernalDust: nextInfernal,
      dungeonFloor: nextFloor,
      dungeonWins: nextWins
    });
  };

  // Live Auto-Dungeon Runner Loop
  useEffect(() => {
    if (!isAutoDungeonRunning) return;

    const timer = setTimeout(() => {
      executeAutoDungeonStep();
    }, 950);

    return () => clearTimeout(timer);
  }, [isAutoDungeonRunning, dragonState]);

  // Instant Multi-Floor Auto-Raid
  const handleInstantAutoRaid = () => {
    let simEnergy = dragonState.energy ?? 70;
    let simStardust = dragonState.stardust ?? 0;
    let simInfernal = dragonState.infernalDust ?? 0;
    let simFloor = dragonState.dungeonFloor ?? 1;
    let simWins = dragonState.dungeonWins ?? 0;

    let clearedCount = 0;
    let dustWonTotal = 0;
    let infernalWonTotal = 0;
    let stardustSpentOnFood = 0;

    // Loop up to 50 floors in one instant rush
    for (let i = 0; i < 50; i++) {
      // Auto-feed to 100% whenever energy drops below 15
      if (simEnergy < 15) {
        const missing = 100 - simEnergy;
        const feedsNeeded = Math.ceil(missing / 25);
        const possibleFeeds = Math.min(feedsNeeded, Math.floor(simStardust / 10));

        if (possibleFeeds === 0) {
          break; // Out of food
        }
        const spent = possibleFeeds * 10;
        simStardust -= spent;
        simEnergy = Math.min(100, simEnergy + possibleFeeds * 25);
        stardustSpentOnFood += spent;
      }

      if (simEnergy < 15) break;

      const enemy = getDungeonEnemy(simFloor);
      const effectivePower = Math.floor(
        simStardust * 0.4 + currentLevel * 14 + powerBonus + simEnergy * 0.3
      );

      // Check if dragon can win
      if (effectivePower * 2.1 < enemy.hp) {
        break;
      }

      simEnergy -= 15;
      const dustWon = Math.round(enemy.rewardStardust * stardustMultiplier);
      const infernalWon = enemy.rewardInfernalDust;

      simStardust += dustWon;
      simInfernal += infernalWon;
      simFloor += 1;
      simWins += 1;

      clearedCount += 1;
      dustWonTotal += dustWon;
      infernalWonTotal += infernalWon;
    }

    if (clearedCount > 0 || stardustSpentOnFood > 0) {
      dragonAudio.playLevelUp();
      onUpdateDragonState({
        ...dragonState,
        energy: simEnergy,
        stardust: simStardust,
        infernalDust: simInfernal,
        dungeonFloor: simFloor,
        dungeonWins: simWins
      });

      const msg = `🎉 Миттєвий рейд: +${clearedCount} поверхів, +${dustWonTotal} ✨` +
        (infernalWonTotal > 0 ? ` +${infernalWonTotal} 🔥` : '') +
        (stardustSpentOnFood > 0 ? ` (годування: -${stardustSpentOnFood} пилу, енергія ${simEnergy}%)` : '');
      setPettingFeedback(msg);
      setBattleLogs((prev) => [msg, ...prev.slice(0, 4)]);
      setTimeout(() => setPettingFeedback(null), 4000);
    } else {
      setPettingFeedback('❌ Неможливо пройти поверх: недостатньо енергії/пилу або ворог занадто сильний!');
      setTimeout(() => setPettingFeedback(null), 3000);
    }
  };

  // Level up dragon
  const handleLevelUp = () => {
    if (currentStardust < levelCost) {
      setPettingFeedback(`Потрібно ${levelCost} ✨ Зоряного пилу для підвищення рівня`);
      setTimeout(() => setPettingFeedback(null), 2500);
      return;
    }

    dragonAudio.playLevelUp();
    const nextLevel = currentLevel + 1;

    onUpdateDragonState({
      ...dragonState,
      stardust: currentStardust - levelCost,
      level: nextLevel,
      energy: 100
    });

    setPettingFeedback(`🎉 Рівень підвищено до ${nextLevel}! Бойова сила зросла на +14 ⚔️`);
    setTimeout(() => setPettingFeedback(null), 3000);
  };

  // Activate Astral Buff
  const handleActivateBuff = (buff: AstralBuffDef) => {
    if ((dragonState.energy || 70) < buff.costEnergy) {
      setPettingFeedback(`Недостатньо енергії! Потрібно ${buff.costEnergy} ⚡ для бафу`);
      setTimeout(() => setPettingFeedback(null), 2500);
      return;
    }

    // Deduct energy & add active buff
    const durationMs = buff.durationMinutes * 60 * 1000 * (equippedIds.includes('heart_star') ? 2 : 1);
    const expiresAt = Date.now() + durationMs;

    const newBuff: DragonActiveBuff = {
      id: buff.id,
      name: buff.name,
      icon: buff.icon,
      expiresAt
    };

    const filtered = (dragonState.activeBuffs || []).filter((b) => b.id !== buff.id && b.expiresAt > Date.now());

    dragonAudio.playFeed();

    onUpdateDragonState({
      ...dragonState,
      energy: Math.max(0, (dragonState.energy || 70) - buff.costEnergy),
      activeBuffs: [...filtered, newBuff]
    });

    setPettingFeedback(`🌟 Активовано «${buff.name}» на ${buff.durationMinutes} хв!`);
    setTimeout(() => setPettingFeedback(null), 2800);
  };

  // Forge or Equip Artifact
  const handleForgeArtifact = (artifact: AstralArtifact) => {
    if (currentStardust < artifact.costStardust || (dragonState.infernalDust || 0) < artifact.costInfernalDust) {
      setPettingFeedback('Недостатньо ресурсів для створення артефакту!');
      setTimeout(() => setPettingFeedback(null), 2500);
      return;
    }

    dragonAudio.playLevelUp();
    const nextEquipped = [...equippedIds, artifact.id];

    onUpdateDragonState({
      ...dragonState,
      stardust: currentStardust - artifact.costStardust,
      infernalDust: (dragonState.infernalDust || 0) - artifact.costInfernalDust,
      equippedArtifacts: nextEquipped
    });

    setPettingFeedback(`🏺 Артефакт «${artifact.name}» викувано та екіпіровано!`);
    setTimeout(() => setPettingFeedback(null), 3000);
  };

  // Start Dungeon Combat
  const handleStartDungeonFight = () => {
    if ((dragonState.energy || 70) < 15) {
      setPettingFeedback('Потрібно 15 ⚡ Енергії для входу в данж! Нагодуйте або погладьте дракона.');
      setTimeout(() => setPettingFeedback(null), 3000);
      return;
    }

    onUpdateDragonState({
      ...dragonState,
      energy: Math.max(0, (dragonState.energy || 70) - 15)
    });

    setBattleState('fighting');
    setDragonHp(100 + currentLevel * 20);
    setEnemyHp(currentEnemy.hp);
    setBattleLogs([`⚔️ Дракон увійшов на поверх ${currentFloor}. Ворог: ${currentEnemy.name} (${currentEnemy.hp} HP)!`]);
  };

  // Dungeon Attack Move
  const handleDungeonMove = (move: 'breath' | 'shield' | 'nova' | 'quick') => {
    if (battleState !== 'fighting' || isAttacking) return;

    setIsAttacking(true);
    dragonAudio.playAttack();

    let dmg = 0;
    let log = '';

    if (move === 'breath') {
      dmg = Math.floor(combatPower * (0.85 + Math.random() * 0.3));
      log = `🔥 Подих дракона спопеляє ворога на ${dmg} шкоди!`;
    } else if (move === 'shield') {
      dmg = Math.floor(combatPower * 0.5);
      log = `🛡️ Дракон виставив щит та контратакував на ${dmg} шкоди!`;
    } else if (move === 'nova') {
      const critMultiplier = 1.6 + critBonus;
      dmg = Math.floor(combatPower * critMultiplier);
      log = `✨ ЗОРЯНА НАДНОВА! Астральний вибух завдає ${dmg} критичної шкоди!`;
    } else if (move === 'quick') {
      // Instant auto-resolve
      const won = combatPower * 2.2 >= currentEnemy.hp;
      if (won) {
        handleVictory();
        setIsAttacking(false);
        return;
      } else {
        handleDefeat();
        setIsAttacking(false);
        return;
      }
    }

    const nextEnemyHp = Math.max(0, enemyHp - dmg);
    setEnemyHp(nextEnemyHp);
    setBattleLogs((prev) => [log, ...prev.slice(0, 4)]);

    if (nextEnemyHp <= 0) {
      setTimeout(() => {
        handleVictory();
        setIsAttacking(false);
      }, 500);
    } else {
      // Enemy counter-attacks
      setTimeout(() => {
        const rawEnemyDmg = Math.floor(currentEnemy.power * (0.8 + Math.random() * 0.4));
        const mitigatedDmg = Math.max(4, Math.floor(rawEnemyDmg * (1 - damageReduction)));
        const nextDragonHp = Math.max(0, dragonHp - mitigatedDmg);
        setDragonHp(nextDragonHp);

        setBattleLogs((prev) => [
          `👾 ${currentEnemy.name} завдає у відповідь ${mitigatedDmg} шкоди!`,
          ...prev.slice(0, 4)
        ]);

        if (nextDragonHp <= 0) {
          handleDefeat();
        }
        setIsAttacking(false);
      }, 600);
    }
  };

  const handleVictory = () => {
    dragonAudio.playLevelUp();
    setBattleState('won');

    const dustWon = Math.round(currentEnemy.rewardStardust * stardustMultiplier);
    const infernalWon = currentEnemy.rewardInfernalDust;

    setBattleLogs((prev) => [
      `🏆 ПЕРЕМОГА! ${currentEnemy.name} переможено! +${dustWon} ✨ пилу` + (infernalWon > 0 ? ` та +${infernalWon} 🔥 пекельного пилу!` : ''),
      ...prev
    ]);

    onUpdateDragonState({
      ...dragonState,
      stardust: currentStardust + dustWon,
      infernalDust: (dragonState.infernalDust || 0) + infernalWon,
      dungeonFloor: currentFloor + 1,
      dungeonWins: (dragonState.dungeonWins || 0) + 1
    });
  };

  const handleDefeat = () => {
    setBattleState('lost');
    setBattleLogs((prev) => [
      '🛡️ Дракон відступив для відновлення сил. Підвищіть силу чи рівень дракона!',
      ...prev
    ]);
  };

  // Rename dragon save
  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = nameInput.trim() || 'Астрал';
    onUpdateDragonState({
      ...dragonState,
      name: clean
    });
    setIsRenaming(false);
    setPettingFeedback(`Дракона тепер звуть: ${clean} ✨`);
    setTimeout(() => setPettingFeedback(null), 2500);
  };

  return (
    <div className="flex flex-col flex-1 pb-12 max-w-md mx-auto w-full px-2 sm:px-0">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSwitchTab('counter')}
            className="p-1.5 -ml-1 text-xs font-semibold text-[#1E8A69] dark:text-[#4CC9A0] hover:bg-[#1E8A69]/10 rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
          >
            ← Назад
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-[#12302B] dark:text-[#f4f4f5] tracking-tight flex items-center gap-1.5">
              <span>{dragonState.name || 'Астрал'}</span>
              <span className="text-sm">🐉</span>
              <button
                type="button"
                onClick={() => setIsRenaming(true)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-0.5"
                title="Перейменувати дракона"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </h1>
            <p className="text-[11px] text-[#55726B] dark:text-[#8FAAA3]">
              {levelTitle.title} • Рівень {currentLevel}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onSwitchTab('orbit')}
          className="px-2.5 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all"
          title="Заробити зоряний пил у симуляторі орбіт"
        >
          <span>🪐 Орбіти</span>
        </button>
      </div>

      {/* Rename input if editing */}
      {isRenaming && (
        <form onSubmit={handleSaveName} className="p-2 mb-2 bg-white/90 dark:bg-[#1c1c21] border border-[#B7CDC6] dark:border-[#2d2d35] rounded-xl flex items-center gap-2 shadow-xs">
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            maxLength={18}
            placeholder="Ім'я дракона..."
            className="flex-1 px-2.5 py-1 text-xs bg-white dark:bg-[#121212] border border-[#B7CDC6] dark:border-[#2d2d35] rounded-lg text-[#12302B] dark:text-[#f4f4f5] focus:outline-hidden"
          />
          <button type="submit" className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg cursor-pointer">
            Зберегти
          </button>
          <button type="button" onClick={() => setIsRenaming(false)} className="px-2 py-1 text-xs text-gray-500">
            Скасувати
          </button>
        </form>
      )}

      {/* Top 4 Key Resources (Energy, Stardust, Infernal Dust, Combat Power) */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        {/* 1. Energy */}
        <div className="p-2.5 rounded-2xl bg-white/70 dark:bg-[#141b18] border border-[#B7CDC6] dark:border-[#1E2E28] text-center shadow-2xs">
          <div className="flex items-center justify-center gap-1 text-[10px] font-semibold text-[#55726B] dark:text-[#8FAAA3]">
            <span>⚡</span>
            <span>Енергія</span>
          </div>
          <div className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
            {Math.round(dragonState.energy || 70)}%
          </div>
        </div>

        {/* 2. Stardust */}
        <div className="p-2.5 rounded-2xl bg-white/70 dark:bg-[#141b18] border border-[#B7CDC6] dark:border-[#1E2E28] text-center shadow-2xs">
          <div className="flex items-center justify-center gap-1 text-[10px] font-semibold text-[#55726B] dark:text-[#8FAAA3]">
            <span>✨</span>
            <span>Пил</span>
          </div>
          <div className="text-sm sm:text-base font-black text-amber-500 dark:text-amber-400 font-mono mt-0.5">
            {currentStardust}
          </div>
        </div>

        {/* 3. Infernal Dust */}
        <div className="p-2.5 rounded-2xl bg-white/70 dark:bg-[#141b18] border border-[#B7CDC6] dark:border-[#1E2E28] text-center shadow-2xs">
          <div className="flex items-center justify-center gap-1 text-[10px] font-semibold text-[#55726B] dark:text-[#8FAAA3]">
            <span>🔥</span>
            <span>Пекельний</span>
          </div>
          <div className="text-sm sm:text-base font-black text-rose-500 font-mono mt-0.5">
            {dragonState.infernalDust || 0}
          </div>
        </div>

        {/* 4. Combat Power */}
        <div className="p-2.5 rounded-2xl bg-white/70 dark:bg-[#141b18] border border-[#B7CDC6] dark:border-[#1E2E28] text-center shadow-2xs">
          <div className="flex items-center justify-center gap-1 text-[10px] font-semibold text-[#55726B] dark:text-[#8FAAA3]">
            <span>⚔️</span>
            <span>Сила</span>
          </div>
          <div className="text-sm sm:text-base font-black text-purple-600 dark:text-purple-400 font-mono mt-0.5">
            {combatPower}
          </div>
        </div>
      </div>

      {/* Main Living Dragon Sanctuary (Interactive Touch & Petting Space) */}
      <div
        onMouseDown={handlePetDragon}
        onTouchStart={handlePetDragon}
        className="relative h-60 w-full rounded-3xl bg-gradient-to-b from-[#061411] via-[#091D17] to-[#040A09] border border-emerald-900/60 overflow-hidden shadow-xl select-none cursor-pointer flex flex-col justify-between p-3.5 group mb-3"
      >
        {/* Ambient Starlight Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-4 left-10 w-1.5 h-1.5 rounded-full bg-white opacity-60 animate-star-twinkle" />
          <div className="absolute top-12 right-12 w-2 h-2 rounded-full bg-cyan-300 opacity-70 animate-star-twinkle" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-12 left-1/4 w-1.5 h-1.5 rounded-full bg-amber-300 opacity-60 animate-star-twinkle" style={{ animationDelay: '1.8s' }} />
        </div>

        {/* Dynamic Stardust Sparkles on user finger touch */}
        {stardustParticles.map((p) => (
          <div
            key={p.id}
            className="absolute pointer-events-none text-base animate-ping"
            style={{ left: p.x - 8, top: p.y - 8 }}
          >
            ✨
          </div>
        ))}

        {/* Top Floating Badges (Stage & Mood) */}
        <div className="flex items-center justify-between z-10 pointer-events-none">
          <div className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-bold text-emerald-300 flex items-center gap-1 border border-white/10">
            <span>{currentStage.icon}</span>
            <span>{currentStage.name}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {activeBuffs.map((b) => (
              <span
                key={b.id}
                className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-[10px] text-amber-300 font-bold flex items-center gap-1 animate-pulse"
                title={`${b.name} діє ще ${Math.max(0, Math.ceil((b.expiresAt - now) / 60000))} хв`}
              >
                <span>{b.icon}</span>
                <span>{Math.max(0, Math.ceil((b.expiresAt - now) / 60000))}хв</span>
              </span>
            ))}
          </div>
        </div>

        {/* Center: The Cosmic Dragon SVG Animation */}
        <div className="relative flex-1 flex items-center justify-center">
          <div className={`w-44 h-44 relative transition-transform duration-300 ${dragonMood === 'happy' ? 'scale-105' : ''}`}>
            {/* Pulsing Aura */}
            <div
              className="absolute inset-0 rounded-full blur-2xl transition-all duration-700 pointer-events-none"
              style={{
                backgroundColor: currentStage.color,
                opacity: isBreathingMode ? (breathPhase === 'inhale' ? 0.45 : 0.2) : 0.2
              }}
            />

            <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-xl select-none" style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id="bodyGlowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#6EE7B7" />
                  <stop offset="50%" stopColor="#0D9488" />
                  <stop offset="100%" stopColor="#064E3B" />
                </linearGradient>
                <linearGradient id="wingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38BDF8" />
                  <stop offset="60%" stopColor="#0D9488" />
                  <stop offset="100%" stopColor="#1E1B4B" />
                </linearGradient>
              </defs>

              {/* Left Wing (gentle flapping) */}
              <g className="animate-wing-left" style={{ transformOrigin: '90px 95px' }}>
                <path
                  d="M90,88 C60,50 30,55 18,72 C12,80 20,95 38,98 C22,108 30,122 50,118 C65,115 82,105 90,95 Z"
                  fill="url(#wingGrad)"
                  opacity="0.9"
                />
                <path d="M90,88 Q45,65 20,72" stroke="#A7F3D0" strokeWidth="1.5" fill="none" opacity="0.7" />
              </g>

              {/* Right Wing */}
              <g className="animate-wing-right" style={{ transformOrigin: '110px 95px' }}>
                <path
                  d="M110,88 C140,50 170,55 182,72 C188,80 180,95 162,98 C178,108 170,122 150,118 C135,115 118,105 110,95 Z"
                  fill="url(#wingGrad)"
                  opacity="0.9"
                />
                <path d="M110,88 Q155,65 180,72" stroke="#A7F3D0" strokeWidth="1.5" fill="none" opacity="0.7" />
              </g>

              {/* Tail */}
              <path
                d="M100,125 C100,155 125,170 120,188 C118,194 110,196 106,190 C100,182 110,165 96,150"
                fill="none"
                stroke="#0D9488"
                strokeWidth="7"
                strokeLinecap="round"
              />
              <polygon points="120,192 125,182 118,186 112,183 115,190" fill="#F59E0B" />

              {/* Torso */}
              <ellipse cx="100" cy="108" rx="20" ry="28" fill="url(#bodyGlowGrad)" />

              {/* Pulsing Breathing Core */}
              <g
                className={isBreathingMode ? '' : 'animate-breathing'}
                style={{
                  transformOrigin: '100px 105px',
                  transform: isBreathingMode
                    ? (breathPhase === 'inhale' ? 'scale(1.3)' : breathPhase === 'hold' ? 'scale(1.25)' : 'scale(0.95)')
                    : undefined,
                  transition: 'transform 1s ease-in-out'
                }}
              >
                <polygon points="100,94 108,104 100,116 92,104" fill="#67E8F9" />
                <circle cx="100" cy="104" r="3" fill="#FFFFFF" />
                <circle cx="100" cy="104" r="10" fill="#67E8F9" opacity="0.3" />
              </g>

              {/* Head */}
              <ellipse cx="100" cy="62" rx="14" ry="18" fill="#10B981" />
              <path d="M90,62 L100,74 L110,62 Z" fill="#059669" />

              {/* Horns */}
              <path d="M94,52 C88,40 76,32 70,30 C76,36 84,46 90,52 Z" fill="#F59E0B" />
              <path d="M106,52 C112,40 124,32 130,30 C124,36 116,46 110,52 Z" fill="#F59E0B" />

              {/* Eyes */}
              <circle cx="94" cy="60" r="3" fill="#FDE68A" />
              <circle cx="106" cy="60" r="3" fill="#FDE68A" />
              <circle cx="94" cy="60" r="1.5" fill="#12302B" />
              <circle cx="106" cy="60" r="1.5" fill="#12302B" />
            </svg>
          </div>
        </div>

        {/* Bottom Hint or Feedback */}
        <div className="text-center z-10 pointer-events-none">
          {pettingFeedback ? (
            <span className="text-xs font-bold text-amber-300 bg-black/60 px-3 py-1 rounded-full backdrop-blur-md animate-in fade-in">
              {pettingFeedback}
            </span>
          ) : isBreathingMode ? (
            <span className="text-xs font-bold text-cyan-300 bg-black/60 px-3 py-1 rounded-full backdrop-blur-md">
              {breathPhase === 'inhale' ? 'Вдих...' : breathPhase === 'hold' ? 'Затримка...' : 'Видих...'} ({breathTimer}с)
            </span>
          ) : (
            <span className="text-[11px] text-white/70 bg-black/40 px-3 py-0.5 rounded-full backdrop-blur-xs">
              Торкніться, щоб погладити • Проведіть пальцем
            </span>
          )}
        </div>
      </div>

      {/* Direct Quick Actions Bar beneath the dragon */}
      <div className="grid grid-cols-3 gap-2 mb-2.5">
        {/* Pet / Care */}
        <button
          type="button"
          onClick={(e) => handlePetDragon(e)}
          className="py-2.5 px-2 rounded-2xl bg-white/80 dark:bg-[#141b18] hover:bg-white dark:hover:bg-[#1E2E28] border border-[#B7CDC6] dark:border-[#20342C] text-xs font-bold text-[#12302B] dark:text-[#f4f4f5] flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
        >
          <span>💖</span>
          <span>Погладити</span>
        </button>

        {/* Restore 100% Energy via Feeding */}
        <button
          type="button"
          disabled={(dragonState.energy ?? 70) >= 100 || currentStardust < 10}
          onClick={handleFeedTo100Percent}
          className="py-2.5 px-2 rounded-2xl bg-gradient-to-r from-amber-500/20 to-emerald-500/20 hover:from-amber-500/30 hover:to-emerald-500/30 border border-amber-500/40 text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-[0.98] disabled:opacity-40"
          title="Відновити енергію дракона до 100% шляхом годування зоряним пилом"
        >
          <span>⚡</span>
          <span>Енергія 100%</span>
        </button>

        {/* Synchronous Breathing */}
        <button
          type="button"
          onClick={() => setIsBreathingMode(!isBreathingMode)}
          className={`py-2.5 px-2 rounded-2xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-[0.98] ${
            isBreathingMode
              ? 'bg-cyan-500/20 border-cyan-500 text-cyan-700 dark:text-cyan-300'
              : 'bg-white/80 dark:bg-[#141b18] hover:bg-white dark:hover:bg-[#1E2E28] border-[#B7CDC6] dark:border-[#20342C] text-[#12302B] dark:text-[#f4f4f5]'
          }`}
        >
          <Wind className="w-3.5 h-3.5" />
          <span>{isBreathingMode ? 'Завершити' : 'Дихання'}</span>
        </button>
      </div>

      {/* ⚡ PROMINENT AUTO-DUNGEON COMMAND BAR */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/80 via-indigo-950/70 to-emerald-950/80 border border-purple-500/40 shadow-md mb-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className={`p-2.5 rounded-xl text-lg flex-shrink-0 ${isAutoDungeonRunning ? 'bg-emerald-500/20 text-emerald-400 animate-pulse' : 'bg-purple-500/20 text-purple-300'}`}>
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-white">
                Авто-проходження данжів
              </span>
              {isAutoDungeonRunning && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-black text-[9px] font-black animate-pulse">
                  АКТИВНО • Поверх {currentFloor}
                </span>
              )}
            </div>
            <p className="text-[10px] text-purple-200/80 mt-0.5">
              Авто-зачистка поверхів + відновлення енергії до 100% годуванням
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handleToggleAutoDungeon}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-xs active:scale-95 flex-1 sm:flex-none ${
              isAutoDungeonRunning
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 animate-pulse'
                : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-600 hover:opacity-95 text-white shadow-purple-600/30'
            }`}
          >
            <span>{isAutoDungeonRunning ? '⏹️ Зупинити' : '▶️ Запустити авто-рейд'}</span>
          </button>

          <button
            type="button"
            disabled={isAutoDungeonRunning}
            onClick={handleInstantAutoRaid}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-40"
            title="Миттєво зачистити всі доступні поверхи з авто-годуванням"
          >
            <span>🚀 Миттєво</span>
          </button>
        </div>
      </div>

      {/* Clean 4-Segmented Control (Dungeon, Level, Artifacts, Buffs) */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-gray-200/70 dark:bg-black/40 rounded-2xl mb-3">
        <button
          type="button"
          onClick={() => setActiveSection('dungeon')}
          className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer ${
            activeSection === 'dungeon'
              ? 'bg-white dark:bg-[#18181d] text-purple-700 dark:text-purple-300 shadow-xs'
              : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
          }`}
        >
          <Swords className="w-3.5 h-3.5" />
          <span>Данж</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('level')}
          className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer ${
            activeSection === 'level'
              ? 'bg-white dark:bg-[#18181d] text-emerald-700 dark:text-emerald-300 shadow-xs'
              : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
          }`}
        >
          <Crown className="w-3.5 h-3.5" />
          <span>Рівень</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('artifacts')}
          className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer ${
            activeSection === 'artifacts'
              ? 'bg-white dark:bg-[#18181d] text-amber-700 dark:text-amber-300 shadow-xs'
              : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Артефакти</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('buffs')}
          className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer ${
            activeSection === 'buffs'
              ? 'bg-white dark:bg-[#18181d] text-cyan-700 dark:text-cyan-300 shadow-xs'
              : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Бафи</span>
        </button>
      </div>

      {/* SECTION 1: ⚔️ DUNGEON */}
      {activeSection === 'dungeon' && (
        <div className="p-4 rounded-3xl bg-white/80 dark:bg-[#141b18] border border-[#B7CDC6] dark:border-[#1E2E28] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm">⚔️</span>
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#12302B] dark:text-[#f4f4f5]">
                  Поверх {currentFloor} • {currentEnemy.name}
                </h3>
              </div>
              <p className="text-[11px] text-[#55726B] dark:text-[#8FAAA3]">
                {currentEnemy.title} • {currentEnemy.description}
              </p>
            </div>
            {currentEnemy.isBoss && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-500 text-[10px] font-black border border-rose-500/30 animate-pulse">
                БОС 👹 (+{currentEnemy.rewardInfernalDust} 🔥)
              </span>
            )}
          </div>

          {/* Enemy vs Dragon Battle Arena */}
          <div className="p-3 rounded-2xl bg-black/5 dark:bg-black/30 border border-gray-200 dark:border-white/5 mb-3">
            <div className="grid grid-cols-2 gap-3 mb-2.5">
              {/* Dragon HP */}
              <div>
                <div className="flex justify-between text-[11px] font-bold text-emerald-700 dark:text-emerald-400 mb-0.5">
                  <span>🐉 {dragonState.name || 'Дракон'}</span>
                  <span>{dragonHp} HP</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(0, (dragonHp / (100 + currentLevel * 20)) * 100))}%` }}
                  />
                </div>
              </div>

              {/* Enemy HP */}
              <div>
                <div className="flex justify-between text-[11px] font-bold text-rose-600 dark:text-rose-400 mb-0.5">
                  <span>{currentEnemy.icon} Ворог</span>
                  <span>{enemyHp} HP</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 transition-all duration-300 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(0, (enemyHp / currentEnemy.hp) * 100))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Combat Actions */}
            {battleState === 'ready' && (
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={handleStartDungeonFight}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
                >
                  <Swords className="w-3.5 h-3.5" />
                  <span>Увійти в бій (15 ⚡)</span>
                </button>

                <button
                  type="button"
                  onClick={handleToggleAutoDungeon}
                  className={`py-2.5 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-xs active:scale-95 ${
                    isAutoDungeonRunning
                      ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white'
                  }`}
                >
                  <span>{isAutoDungeonRunning ? '⏹️ Зупинити авто-рейд' : '⚡ Авто-рейд (+100% ⚡)'}</span>
                </button>
              </div>
            )}

            {battleState === 'fighting' && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  type="button"
                  disabled={isAttacking}
                  onClick={() => handleDungeonMove('breath')}
                  className="py-2 px-2.5 rounded-xl bg-gradient-to-r from-orange-500/20 to-amber-500/20 hover:from-orange-500/30 hover:to-amber-500/30 border border-orange-500/30 text-xs font-bold text-orange-700 dark:text-orange-300 flex items-center justify-between cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <span className="flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-orange-500" />
                    <span>Подих</span>
                  </span>
                  <span className="text-[10px] font-mono opacity-80">~{Math.floor(combatPower * 0.9)}</span>
                </button>

                <button
                  type="button"
                  disabled={isAttacking}
                  onClick={() => handleDungeonMove('shield')}
                  className="py-2 px-2.5 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 border border-blue-500/30 text-xs font-bold text-blue-700 dark:text-blue-300 flex items-center justify-between cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <span className="flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-blue-500" />
                    <span>Щит</span>
                  </span>
                  <span className="text-[10px] font-mono opacity-80">Блок</span>
                </button>

                <button
                  type="button"
                  disabled={isAttacking}
                  onClick={() => handleDungeonMove('nova')}
                  className="py-2 px-2.5 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 text-xs font-bold text-purple-700 dark:text-purple-300 flex items-center justify-between cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                    <span>Наднова</span>
                  </span>
                  <span className="text-[10px] font-mono opacity-80">Крит</span>
                </button>

                <button
                  type="button"
                  disabled={isAttacking}
                  onClick={() => handleDungeonMove('quick')}
                  className="py-2 px-2.5 rounded-xl bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/15 text-xs font-bold text-[#12302B] dark:text-[#f4f4f5] flex items-center justify-center gap-1 cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Швидкий бій</span>
                </button>
              </div>
            )}

            {battleState === 'won' && (
              <div className="mt-2 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-center animate-in fade-in">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 block mb-1">
                  🎉 Поверх зачищено! +{Math.round(currentEnemy.rewardStardust * stardustMultiplier)} ✨
                  {currentEnemy.rewardInfernalDust > 0 && ` +${currentEnemy.rewardInfernalDust} 🔥`}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setBattleState('ready');
                    setEnemyHp(getDungeonEnemy(currentFloor).hp);
                  }}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Наступний поверх →
                </button>
              </div>
            )}

            {battleState === 'lost' && (
              <div className="mt-2 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-center animate-in fade-in">
                <span className="text-xs font-bold text-rose-700 dark:text-rose-300 block mb-1">
                  🛡️ Дракон відступив для відпочинку
                </span>
                <button
                  type="button"
                  onClick={handleStartDungeonFight}
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Спробувати знову (15 ⚡)
                </button>
              </div>
            )}
          </div>

          {/* Battle Logs */}
          {battleLogs.length > 0 && (
            <div className="space-y-1 text-[11px] text-[#55726B] dark:text-[#8FAAA3] font-mono">
              {battleLogs.map((log, i) => (
                <div key={i} className="truncate">{log}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: ⬆️ LEVEL UP & PROGRESSION */}
      {activeSection === 'level' && (
        <div className="p-4 rounded-3xl bg-white/80 dark:bg-[#141b18] border border-[#B7CDC6] dark:border-[#1E2E28] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#12302B] dark:text-[#f4f4f5]">
                  Прокачка дракона
                </h3>
              </div>
              <p className="text-[11px] text-[#55726B] dark:text-[#8FAAA3]">
                Кожен рівень дає +14 до сили ⚔️ та відновлює енергію до 100%
              </p>
            </div>

            <button
              type="button"
              disabled={currentStardust < levelCost}
              onClick={handleLevelUp}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 ${
                currentStardust >= levelCost
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/20'
                  : 'bg-gray-200 dark:bg-white/5 text-gray-400 cursor-not-allowed'
              }`}
            >
              <span>⬆️</span>
              <span>Підвищити ({levelCost}✨)</span>
            </button>
          </div>

          {/* Evolution Roadmap */}
          <div className="space-y-2 mt-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#55726B] dark:text-[#8FAAA3]">
              Етапи еволюції (за невикуреними сигаретами)
            </span>
            {DRAGON_STAGES.map((st) => {
              const isUnlocked = cigsAvoided >= st.minCigs;
              const isCurrent = currentStage.id === st.id;

              return (
                <div
                  key={st.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 ${
                    isCurrent
                      ? 'bg-emerald-500/10 border-emerald-500/40'
                      : isUnlocked
                      ? 'bg-white/50 dark:bg-white/5 border-gray-200 dark:border-white/5'
                      : 'bg-gray-100 dark:bg-black/20 border-dashed border-gray-300 dark:border-white/10 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xl">{st.icon}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#12302B] dark:text-[#f4f4f5] truncate">
                          {st.name}
                        </span>
                        {isCurrent && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold">
                            Зараз
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#55726B] dark:text-[#8FAAA3] truncate">
                        {st.description}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono font-bold text-gray-500 shrink-0">
                    {st.minCigs}+ сиг.
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 3: 🏺 ARTIFACTS */}
      {activeSection === 'artifacts' && (
        <div className="p-4 rounded-3xl bg-white/80 dark:bg-[#141b18] border border-[#B7CDC6] dark:border-[#1E2E28] shadow-xs">
          <div className="mb-3">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#12302B] dark:text-[#f4f4f5]">
                Астральні Артефакти ({equippedIds.length}/{DRAGON_ARTIFACTS.length})
              </h3>
            </div>
            <p className="text-[11px] text-[#55726B] dark:text-[#8FAAA3]">
              Куйте та екіпіруйте реліквії за Зоряний пил та Пекельний пил з босів
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {DRAGON_ARTIFACTS.map((art) => {
              const isEquipped = equippedIds.includes(art.id);
              const canAfford = currentStardust >= art.costStardust && (dragonState.infernalDust || 0) >= art.costInfernalDust;

              return (
                <div
                  key={art.id}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isEquipped
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : 'bg-white/50 dark:bg-white/5 border-gray-200 dark:border-white/10'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span className="text-2xl shrink-0 p-1 rounded-xl bg-black/5 dark:bg-white/5">
                      {art.icon}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#12302B] dark:text-[#f4f4f5] truncate">
                          {art.name}
                        </span>
                        {isEquipped && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold flex items-center gap-0.5">
                            <Check className="w-2.5 h-2.5" />
                            <span>Екіпіровано</span>
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#55726B] dark:text-[#8FAAA3] leading-snug">
                        {art.description}
                      </p>
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 block mt-0.5">
                        ⚡ {art.perkText}
                      </span>
                    </div>
                  </div>

                  {!isEquipped && (
                    <button
                      type="button"
                      disabled={!canAfford}
                      onClick={() => handleForgeArtifact(art)}
                      className={`px-3 py-2 rounded-xl text-[11px] font-bold shrink-0 transition-all cursor-pointer ${
                        canAfford
                          ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-xs active:scale-95'
                          : 'bg-gray-200 dark:bg-white/5 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <span className="block">{art.costStardust} ✨</span>
                      {art.costInfernalDust > 0 && (
                        <span className="block text-[9px]">{art.costInfernalDust} 🔥</span>
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 4: 🌟 BUFFS */}
      {activeSection === 'buffs' && (
        <div className="p-4 rounded-3xl bg-white/80 dark:bg-[#141b18] border border-[#B7CDC6] dark:border-[#1E2E28] shadow-xs">
          <div className="mb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-500" />
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#12302B] dark:text-[#f4f4f5]">
                Благословення Дракона (Бафи)
              </h3>
            </div>
            <p className="text-[11px] text-[#55726B] dark:text-[#8FAAA3]">
              Активуйте тимчасові посилення за накопичену енергію дракона ⚡
            </p>
          </div>

          <div className="space-y-2.5">
            {DRAGON_BUFFS.map((buff) => {
              const active = activeBuffs.find((b) => b.id === buff.id);
              const canAfford = (dragonState.energy || 70) >= buff.costEnergy;

              return (
                <div
                  key={buff.id}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    active
                      ? 'bg-cyan-500/10 border-cyan-500/40'
                      : 'bg-white/50 dark:bg-white/5 border-gray-200 dark:border-white/10'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span className="text-2xl shrink-0 p-1.5 rounded-xl bg-black/5 dark:bg-white/5">
                      {buff.icon}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#12302B] dark:text-[#f4f4f5]">
                          {buff.name}
                        </span>
                        {active && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-cyan-600 text-white font-bold flex items-center gap-1 animate-pulse">
                            <Clock className="w-2.5 h-2.5" />
                            <span>{Math.ceil((active.expiresAt - now) / 60000)} хв</span>
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#55726B] dark:text-[#8FAAA3]">
                        {buff.description}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!canAfford}
                    onClick={() => handleActivateBuff(buff)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                      active
                        ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30'
                        : canAfford
                        ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-xs active:scale-95'
                        : 'bg-gray-200 dark:bg-white/5 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <span>{buff.costEnergy} ⚡</span>
                    <span className="block text-[9px] opacity-80">{active ? 'Подовжити' : 'Увімкнути'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
