import { useState, useCallback, useEffect } from 'react';
import { Card, SaltWaterCard, ACIDS, BASES, OPERATIONS, SALT_WATER_CARDS } from '../../../shared/const';
import { nanoid } from 'nanoid';

export type GameState = 'start' | 'playing' | 'end';

export type CPUStrategy = 'aggressive' | 'tactical' | 'collector';

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  score: number;
  collectedCards: SaltWaterCard[];
  isCPU: boolean;
  strategy?: CPUStrategy;
}

export const useGame = () => {
  const [gameState, setGameState] = useState<GameState>('start');
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [deck, setDeck] = useState<Card[]>([]);
  const [saltWaterDeck, setSaltWaterDeck] = useState<SaltWaterCard[]>([]);
  const [fieldSaltWater, setFieldSaltWater] = useState<SaltWaterCard[]>([]);
  const [isReverse, setIsReverse] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const addLog = useCallback((msg: string) => {
    setLogs(prev => [msg, ...prev].slice(0, 50));
  }, []);

  const createDeck = useCallback(() => {
    const newDeck: Card[] = [];
    ACIDS.forEach(acid => {
      for (let i = 0; i < 10; i++) {
        let effect: Card['effect'] = undefined;
        if (i < 2) effect = 'reverse';
        if (i >= 2 && i < 4) effect = 'skip';
        newDeck.push({ ...acid, id: nanoid(), effect });
      }
    });
    BASES.forEach(base => {
      for (let i = 0; i < 10; i++) {
        let effect: Card['effect'] = undefined;
        if (i < 2) effect = 'reverse';
        if (i >= 2 && i < 4) effect = 'skip';
        newDeck.push({ ...base, id: nanoid(), effect });
      }
    });
    OPERATIONS.forEach(op => {
      let count = (op.id === 'conc2' || op.id === 'conc3') ? 9 : 6;
      for (let i = 0; i < count; i++) {
        newDeck.push({
          ...op,
          id: nanoid(),
          effect: op.effect
        });
      }
    });
    return newDeck.sort(() => Math.random() - 0.5);
  }, []);

  const initGame = useCallback(() => {
    const newDeck = createDeck();
    // 塩カードにもユニークIDを割り当てる
    const newSaltWaterDeck = [...SALT_WATER_CARDS]
      .map(c => ({ ...c, id: nanoid() }))
      .sort(() => Math.random() - 0.5);

    const initialPlayers: Player[] = [
      { id: 'player', name: 'あなた', hand: [], score: 0, collectedCards: [], isCPU: false },
      { id: 'cpu1', name: 'CPU 1 (速攻)', hand: [], score: 0, collectedCards: [], isCPU: true, strategy: 'aggressive' },
      { id: 'cpu2', name: 'CPU 2 (慎重)', hand: [], score: 0, collectedCards: [], isCPU: true, strategy: 'tactical' },
      { id: 'cpu3', name: 'CPU 3 (収集)', hand: [], score: 0, collectedCards: [], isCPU: true, strategy: 'collector' },
    ];
    initialPlayers.forEach(p => { p.hand = newDeck.splice(0, 6); });
    const initialField = newSaltWaterDeck.splice(0, 10);
    setPlayers(initialPlayers);
    setDeck(newDeck);
    setSaltWaterDeck(newSaltWaterDeck.slice(10));
    setFieldSaltWater(initialField);
    setCurrentPlayerIndex(0);
    setIsReverse(false);
    setGameState('playing');
    setLogs(['実験開始！']);
  }, [createDeck]);

  const drawCard = useCallback(async (playerIndex: number) => {
    return new Promise<void>((resolve) => {
      setDeck(prevDeck => {
        if (prevDeck.length === 0) {
          setGameState('end');
          resolve();
          return prevDeck;
        }
        const newCard = prevDeck[0];
        const remainingDeck = prevDeck.slice(1);
        setPlayers(prevPlayers => {
          const nextPlayers = [...prevPlayers];
          if (nextPlayers[playerIndex]) {
            nextPlayers[playerIndex].hand = [...nextPlayers[playerIndex].hand, newCard];
          }
          return nextPlayers;
        });
        addLog(`${players[playerIndex]?.name || '誰か'}が試薬を購入しました。`);
        resolve();
        return remainingDeck;
      });
    });
  }, [players, addLog]);

  const endTurn = useCallback(async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    // ターン終了時に1枚ドロー
    await drawCard(currentPlayerIndex);

    // 少し待機してUIを安定させる
    await new Promise(r => setTimeout(r, 800));

    setCurrentPlayerIndex(prev => {
      const step = isReverse ? -1 : 1;
      let next = prev + step;
      if (next >= players.length) next = 0;
      if (next < 0) next = players.length - 1;
      return next;
    });

    setIsProcessing(false);
  }, [currentPlayerIndex, isReverse, players.length, drawCard, isProcessing]);

  // ターン開始時の自動ドロー
  useEffect(() => {
    const startTurn = async () => {
      if (gameState === 'playing' && !isProcessing) {
        setIsProcessing(true);
        await drawCard(currentPlayerIndex);
        setIsProcessing(false);
      }
    };
    startTurn();
  }, [currentPlayerIndex, gameState]);

  const playReaction = useCallback((playerIndex: number, saltWaterCardId: string, selectedHandIds: string[]) => {
    const player = players[playerIndex];
    const saltWaterCard = fieldSaltWater.find(c => c.id === saltWaterCardId);
    if (!saltWaterCard) return false;

    const selectedCards = player.hand.filter(c => selectedHandIds.includes(c.id));
    let acidCount = 0;
    let baseCount = 0;
    let hasMultiplier2 = false;
    let hasMultiplier3 = false;
    let hasReverse = false;
    let hasSkip = false;

    let hasOnePot = false;
    let hasShuffle = false;
    selectedCards.forEach(c => {
      const acidDef = ACIDS.find(a => a.id === saltWaterCard.acidRequired);
      const baseDef = BASES.find(b => b.id === saltWaterCard.baseRequired);
      if (acidDef && c.formula === acidDef.formula) acidCount++;
      if (baseDef && c.formula === baseDef.formula) baseCount++;
      if (c.effect === 'multiply2') hasMultiplier2 = true;
      if (c.effect === 'multiply3') hasMultiplier3 = true;
      if (c.effect === 'reverse') hasReverse = true;
      if (c.effect === 'skip') hasSkip = true;
      if (c.effect === 'onepot') hasOnePot = true;
      if (c.effect === 'shuffle') hasShuffle = true;
    });

    let effectiveAcidCount = acidCount;
    let effectiveBaseCount = baseCount;
    if (hasMultiplier3) {
      if (acidCount > 0) effectiveAcidCount = acidCount * 3;
      else if (baseCount > 0) effectiveBaseCount = baseCount * 3;
    } else if (hasMultiplier2) {
      if (acidCount > 0) effectiveAcidCount = acidCount * 2;
      else if (baseCount > 0) effectiveBaseCount = baseCount * 2;
    }

    if (effectiveAcidCount >= saltWaterCard.acidCount && effectiveBaseCount >= saltWaterCard.baseCount) {
      // ワンポット合成（+2種類）の処理
      let targetCards = [saltWaterCard];
      if (hasOnePot) {
        // フィールドから追加で2枚取得（もしあれば）
        const extra = fieldSaltWater.filter(c => c.id !== saltWaterCardId).slice(0, 2);
        targetCards = [...targetCards, ...extra];
        addLog(`${player.name}がワンポット合成を発動！ 追加で${extra.length}種類の塩を獲得しました。`);
      }

      addLog(`${player.name}が「${targetCards.map(c => c.name).join(', ')}」を合成しました！ (+${targetCards.reduce((sum, c) => sum + c.waterCount, 0)} H2O)`);

      setPlayers(prev => {
        const next = [...prev];
        const p = next[playerIndex];
        p.hand = p.hand.filter(c => !selectedHandIds.includes(c.id));
        p.collectedCards.push(...targetCards);
        p.score += targetCards.reduce((sum, c) => sum + c.waterCount, 0);
        return next;
      });

      setFieldSaltWater(prev => {
        const targetIds = targetCards.map(c => c.id);
        let next = prev.filter(c => !targetIds.includes(c.id));

        // 補充
        const needed = targetCards.length;
        const available = saltWaterDeck.slice(0, needed);
        next = [...next, ...available];
        setSaltWaterDeck(d => d.slice(needed));

        if (next.length === 0 && saltWaterDeck.length === 0) {
          setGameState('end');
        }
        return next;
      });
      if (hasReverse) setIsReverse(prev => !prev);

      if (hasShuffle) {
        addLog(`${player.name}が「かく拌」を発動！ フィールドを入れ替えます。`);
        setFieldSaltWater(prev => {
          const combined = [...prev, ...saltWaterDeck].sort(() => Math.random() - 0.5);
          const newField = combined.slice(0, 10);
          setSaltWaterDeck(combined.slice(10));
          return newField;
        });
      }

      if (hasSkip) {
        // スキップ処理を endTurn に統合せず、ここで完結させる
        setIsProcessing(true);
        drawCard(playerIndex).then(() => {
          setTimeout(() => {
            setCurrentPlayerIndex(prev => {
              const step = isReverse ? -2 : 2;
              let next = prev + step;
              while (next >= players.length) next -= players.length;
              while (next < 0) next += players.length;
              return next;
            });
            setIsProcessing(false);
          }, 800);
        });
      } else {
        endTurn();
      }
      return true;
    }
    return false;
  }, [players, fieldSaltWater, saltWaterDeck, isReverse, endTurn, drawCard, addLog]);

  const findPossibleReaction = useCallback((playerIndex: number) => {
    const player = players[playerIndex];
    if (!player) return null;

    const possibleReactions: { saltWaterCardId: string, selectedIds: string[], score: number }[] = [];

    for (const saltWaterCard of fieldSaltWater) {
      const acidDef = ACIDS.find(a => a.id === saltWaterCard.acidRequired);
      const baseDef = BASES.find(b => b.id === saltWaterCard.baseRequired);
      if (!acidDef || !baseDef) continue;

      const acidCards = player.hand.filter(c => c.formula === acidDef.formula);
      const baseCards = player.hand.filter(c => c.formula === baseDef.formula);
      const multiplierCards = player.hand.filter(c => c.effect === 'multiply2' || c.effect === 'multiply3');

      // 1. 濃度調整なし
      if (acidCards.length >= saltWaterCard.acidCount && baseCards.length >= saltWaterCard.baseCount) {
        possibleReactions.push({
          saltWaterCardId: saltWaterCard.id,
          selectedIds: [...acidCards.slice(0, saltWaterCard.acidCount).map(c => c.id), ...baseCards.slice(0, saltWaterCard.baseCount).map(c => c.id)],
          score: saltWaterCard.waterCount
        });
      }

      // 2. 濃度調整あり
      for (const mCard of multiplierCards) {
        const multiplier = mCard.effect === 'multiply3' ? 3 : 2;
        if (acidCards.length > 0 && (acidCards.length * multiplier) >= saltWaterCard.acidCount && baseCards.length >= saltWaterCard.baseCount) {
          possibleReactions.push({
            saltWaterCardId: saltWaterCard.id,
            selectedIds: [acidCards[0].id, mCard.id, ...baseCards.slice(0, saltWaterCard.baseCount).map(c => c.id)],
            score: saltWaterCard.waterCount
          });
        }
        if (baseCards.length > 0 && acidCards.length >= saltWaterCard.acidCount && (baseCards.length * multiplier) >= saltWaterCard.baseCount) {
          possibleReactions.push({
            saltWaterCardId: saltWaterCard.id,
            selectedIds: [...acidCards.slice(0, saltWaterCard.acidCount).map(c => c.id), baseCards[0].id, mCard.id],
            score: saltWaterCard.waterCount
          });
        }
      }
    }

    if (possibleReactions.length === 0) return null;

    // 戦略に応じた選択
    switch (player.strategy) {
      case 'aggressive':
        // 最初に見つかったものを実行（スピード重視）
        return possibleReactions[0];
      case 'tactical':
        // 最もスコアが高いものを実行
        return possibleReactions.sort((a, b) => b.score - a.score)[0];
      case 'collector':
        // スコアが3以上のものがあれば実行、なければ温存（ドローを優先）
        const highValue = possibleReactions.find(r => r.score >= 3);
        return highValue || (player.hand.length > 8 ? possibleReactions[0] : null);
      default:
        return possibleReactions[0];
    }
  }, [players, fieldSaltWater]);

  useEffect(() => {
    let isCancelled = false;

    // 厳格なチェック：プレイヤーのターン（ID: 'player'）の場合は、いかなるCPUロジックも実行しない
    if (players[currentPlayerIndex]?.id === 'player') {
      return;
    }

    const runCPUTurn = async () => {
      const currentPlayer = players[currentPlayerIndex];
      // 二重チェック：isCPUフラグだけでなく、IDも確認
      if (
        gameState === 'playing' &&
        currentPlayer &&
        currentPlayer.isCPU &&
        currentPlayer.id !== 'player' &&
        !isProcessing
      ) {
        // 思考時間を短縮（800ms）
        await new Promise(r => setTimeout(r, 800));

        if (isCancelled) return;

        // 待機中に状態が変わっていないか再確認
        const playerIndex = players.findIndex(p => p.id === currentPlayer.id);
        if (currentPlayerIndex !== playerIndex || isProcessing) return;

        const reaction = findPossibleReaction(currentPlayerIndex);
        if (reaction) {
          const success = playReaction(currentPlayerIndex, reaction.saltWaterCardId, reaction.selectedIds);
          // 反応失敗時も自動的にターンを進める
          if (!success) {
            setTimeout(() => {
              if (!isCancelled) endTurn();
            }, 500);
          }
        } else {
          // タイムアウト機構：反応がない場合は即座にターン終了
          endTurn();
        }
      }
    };

    // タイムアウト設定（最大3秒でCPUターンを強制終了）
    const timeoutId = setTimeout(() => {
      // ここでも厳格にチェック
      if (
        !isCancelled &&
        gameState === 'playing' &&
        players[currentPlayerIndex]?.isCPU &&
        players[currentPlayerIndex]?.id !== 'player' &&
        !isProcessing
      ) {
        endTurn();
      }
    }, 3000);

    runCPUTurn();
    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [gameState, currentPlayerIndex, players, endTurn, findPossibleReaction, playReaction, isProcessing]);

  return {
    gameState, players, currentPlayerIndex, fieldSaltWater, saltWaterDeck, deck, logs, initGame,
    drawCard,
    playReaction,
    endTurn
  };
};