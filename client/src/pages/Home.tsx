import { useState } from 'react';
import { useGame } from '@/hooks/useGame';
import { Card } from '@/components/Card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FlaskConical, Trophy, History, Play, RotateCcw, ChevronRight, ChevronLeft, Zap, Target, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function Home() {
  const {
    gameState,
    players,
    currentPlayerIndex,
    fieldSaltWater,
    saltWaterDeck,
    deck,
    logs,
    initGame,
    drawCard,
    playReaction,
    endTurn
  } = useGame();

  const [selectedHandIds, setSelectedHandIds] = useState<string[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [isLogExpanded, setIsLogExpanded] = useState(true);

  const currentPlayer = players[currentPlayerIndex];
  const isPlayerTurn = currentPlayer?.id === 'player';

  const toggleHandSelection = (id: string) => {
    setSelectedHandIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // CPUターンの自動進行は useGame 内の useEffect で管理されているため、ここではUI表示のみ

  if (gameState === 'start') {
    return (
      <div className="min-h-screen bg-[#0A0E14] flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/hero-bg.png')] bg-cover bg-center opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0E14]/80 to-[#0A0E14]" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center space-y-8 max-w-2xl"
        >
          <div className="space-y-2">
            <h1 className="text-6xl font-black tracking-tighter text-white italic">
              ABN <span className="text-pink-500">RE</span>ACTOR
            </h1>
            <p className="text-cyan-400 font-mono tracking-widest uppercase text-sm">
              Acid-Base Neutralization Digital Card Game
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl space-y-6 shadow-2xl">
            <p className="text-slate-300 leading-relaxed">
              酸と塩基のカードを組み合わせ、正しい中和反応を再現せよ。<br />
              生成される水分子（H₂O）の数が君の勝利点となる。<br />
              化学量論係数を見極め、ラボの頂点を目指せ。
            </p>
            <Button 
              onClick={initGame}
              size="lg"
              className="w-full h-16 text-xl font-bold bg-gradient-to-r from-pink-600 to-cyan-600 hover:from-pink-500 hover:to-cyan-500 rounded-2xl shadow-[0_0_30px_rgba(236,72,153,0.4)] transition-all hover:scale-105"
            >
              <Play className="mr-2 fill-current" /> 実験開始
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (gameState === 'end') {
    const winner = [...players].sort((a, b) => b.score - a.score)[0];
    return (
      <div className="min-h-screen bg-[#0A0E14] flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/5 backdrop-blur-2xl border border-white/10 p-12 rounded-[3rem] text-center space-y-8 max-w-md w-full shadow-2xl"
        >
          <Trophy className="w-24 h-24 mx-auto text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]" />
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-white">実験終了</h2>
            <p className="text-cyan-400 font-mono">WINNER: {winner.name}</p>
          </div>

          <div className="space-y-4">
            {players.sort((a, b) => b.score - a.score).map((p, i) => (
              <div key={p.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-slate-400 font-bold">#{i+1} {p.name}</span>
                <span className="text-2xl font-black text-white">{p.score} <span className="text-xs text-slate-500">H₂O</span></span>
              </div>
            ))}
          </div>

          <Button 
            onClick={initGame}
            className="w-full h-12 bg-gradient-to-r from-pink-600 to-cyan-600 hover:from-pink-500 hover:to-cyan-500 rounded-xl font-bold"
          >
            <RotateCcw className="w-4 h-4 mr-2" /> もう一度
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0A0E14] flex flex-col overflow-hidden relative">
      <header className="bg-black/40 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex items-center justify-between gap-6 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-cyan-500 flex items-center justify-center font-black text-white text-sm">
            Ω
          </div>
          <h1 className="text-lg font-black tracking-tight text-white">ABN REACTOR</h1>
        </div>

        <div>
          <Button 
            onClick={initGame}
            variant="outline"
            size="sm"
            className="text-xs h-8"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            最初から
          </Button>
        </div>

        <div className="flex gap-4">
          {players.map((p, i) => (
            <motion.div 
              key={p.id}
              animate={i === currentPlayerIndex ? { scale: 1.1 } : { scale: 1 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "relative flex flex-col items-center px-4 py-1 rounded-xl transition-all duration-500 border",
                i === currentPlayerIndex 
                  ? "bg-gradient-to-br from-cyan-500/20 to-pink-500/10 border-cyan-500/70 shadow-[0_0_25px_rgba(34,211,238,0.4)]" 
                  : "bg-transparent border-transparent opacity-50"
              )}>
              {i === currentPlayerIndex && (
                <motion.div 
                  layoutId="active-turn"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-4 h-4 bg-cyan-500 rounded-full shadow-[0_0_15px_#22d3ee] animate-pulse"
                />
              )}
              <div className="flex items-center gap-1">
                {p.strategy === 'aggressive' && <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}><Zap className="w-2 h-2 text-yellow-400" /></motion.div>}
                {p.strategy === 'tactical' && <Target className="w-2 h-2 text-red-400" />}
                {p.strategy === 'collector' && <Layers className="w-2 h-2 text-purple-400" />}
                <span className={cn(
                  "text-[9px] font-bold uppercase tracking-widest transition-all",
                  i === currentPlayerIndex ? "text-cyan-400" : "text-slate-500"
                )}>
                  {p.name}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <motion.span 
                  animate={i === currentPlayerIndex ? { scale: 1.2 } : { scale: 1 }}
                  className="text-lg font-black leading-none"
                >
                  {p.score}
                </motion.span>
                <span className="text-[9px] text-slate-500 font-bold">H₂O</span>
                <div className="ml-2 flex gap-0.5">
                  {Array.from({ length: p.hand.length }).map((_, idx) => (
                    <motion.div 
                      key={idx}
                      animate={i === currentPlayerIndex ? { height: [12, 16, 12] } : {}}
                      transition={{ duration: 0.6, repeat: Infinity }}
                      className={cn(
                        "w-1 rounded-full",
                        i === currentPlayerIndex ? "h-4 bg-cyan-500" : "h-3 bg-slate-700"
                      )} 
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ターン情報バナー */}
        {isPlayerTurn && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="ml-auto text-right text-xs font-bold text-cyan-400 uppercase tracking-widest"
          >
            🎮 YOUR TURN - Select cards and execute reaction
          </motion.div>
        )}
        {!isPlayerTurn && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="ml-auto text-right text-xs font-bold text-yellow-400 uppercase tracking-widest animate-pulse"
          >
            🤖 {currentPlayer?.name} is analyzing...
          </motion.div>
        )}
      </header>

      <main className="flex-1 flex p-6 gap-6 overflow-hidden relative">
        {/* 背景グリッド */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

        {/* 左側：フィールド（塩／水カード） */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Reaction Field (生成物)
            </h3>
            <span className="text-[10px] font-mono text-slate-600">DECK: {saltWaterDeck.length}</span>
          </div>
          
          <div className="flex-1 grid grid-cols-5 gap-4 content-start">
            <AnimatePresence>
              {fieldSaltWater.map((card) => (
                <motion.div
                  key={card.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.2 }}
                >
                  <Card 
                    card={card} 
                    selected={selectedFieldId === card.id}
                    onClick={() => isPlayerTurn && setSelectedFieldId(card.id)}
                    disabled={!isPlayerTurn}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* 右側：ログとアクション */}
        <motion.div 
          animate={{ width: isLogExpanded ? 320 : 80 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="flex flex-col gap-4 z-10 overflow-hidden"
        >
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl flex-1 flex flex-col overflow-hidden shadow-2xl relative">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-cyan-400" />
                {isLogExpanded && <span className="text-xs font-bold uppercase tracking-widest">Lab Logs</span>}
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-slate-400 hover:text-white"
                onClick={() => setIsLogExpanded(!isLogExpanded)}
              >
                {isLogExpanded ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </Button>
            </div>
            
            <AnimatePresence mode="wait">
              {isLogExpanded && (
                <motion.div
                  key="logs"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-3">
                      {logs.map((log, i) => {
                        const isThinking = log.includes('🤖');
                        const isDecision = log.includes('💡');
                        const isPass = log.includes('⏭️');
                        
                        return (
                          <motion.div 
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={cn(
                              "text-[11px] font-mono leading-relaxed border-l-2 pl-3 py-1 rounded-r",
                              isThinking && "border-yellow-500/50 bg-yellow-500/5 text-yellow-300",
                              isDecision && "border-cyan-500/50 bg-cyan-500/5 text-cyan-300 font-semibold",
                              isPass && "border-slate-500/30 bg-slate-500/5 text-slate-400",
                              !isThinking && !isDecision && !isPass && "border-cyan-500/30 text-slate-400"
                            )}
                          >
                            {log}
                          </motion.div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className={cn(
            "bg-gradient-to-br from-pink-500/10 to-cyan-500/10 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl transition-all duration-300",
            isLogExpanded ? "p-6 space-y-4" : "p-2 space-y-2"
          )}>
            {isLogExpanded ? (
              <>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Deck Status</span>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-pink-500 to-cyan-500 transition-all duration-1000" 
                      style={{ width: `${(deck.length / 100) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-600">
                    <span>REMAINING: {deck.length}</span>
                    <span>{Math.round((deck.length / 100) * 100)}%</span>
                  </div>
                </div>

                <Button 
                  disabled={!isPlayerTurn}
                  onClick={() => {
                    setSelectedHandIds([]);
                    setSelectedFieldId(null);
                    endTurn();
                  }}
                  className="w-full h-12 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold"
                >
                  ターン終了 (パス)
                </Button>
                
                <Button 
                  disabled={!isPlayerTurn || !selectedFieldId || selectedHandIds.length === 0}
                  onClick={() => {
                    const success = playReaction(currentPlayerIndex, selectedFieldId!, selectedHandIds);
                    if (success) {
                      setSelectedHandIds([]);
                      setSelectedFieldId(null);
                    } else {
                      alert("反応条件を満たしていません。酸・塩基の種類と数を確認してください。");
                    }
                  }}
                  className="w-full h-16 bg-gradient-to-r from-pink-600 to-cyan-600 hover:from-pink-500 hover:to-cyan-500 rounded-2xl font-black text-lg shadow-lg shadow-pink-500/20"
                >
                  反応実行！
                </Button>
              </>
            ) : (
              <div className="flex flex-col gap-2 items-center">
                <Button 
                  disabled={!isPlayerTurn}
                  size="icon"
                  onClick={() => {
                    setSelectedHandIds([]);
                    setSelectedFieldId(null);
                    endTurn();
                  }}
                  className="w-12 h-12 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl"
                  title="ターン終了"
                >
                  <Play className="w-4 h-4 rotate-90" />
                </Button>
                <Button 
                  disabled={!isPlayerTurn || !selectedFieldId || selectedHandIds.length === 0}
                  size="icon"
                  onClick={() => {
                    const success = playReaction(currentPlayerIndex, selectedFieldId!, selectedHandIds);
                    if (success) {
                      setSelectedHandIds([]);
                      setSelectedFieldId(null);
                    } else {
                      alert("反応条件を満たしていません。");
                    }
                  }}
                  className="w-12 h-12 bg-gradient-to-r from-pink-600 to-cyan-600 rounded-xl"
                  title="反応実行"
                >
                  <FlaskConical className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </main>

      {/* 手札エリア */}
      <footer className="h-64 bg-black/60 backdrop-blur-2xl border-t border-white/10 p-6 flex flex-col gap-4 z-20">
        <div className="flex items-center justify-between px-4">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Your Hand (手札)</span>
          <div className="flex gap-2">
            {selectedHandIds.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedHandIds([])}
                className="text-[10px] h-6 text-slate-400 hover:text-white"
              >
                選択解除
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center gap-4 overflow-x-auto pb-4">
          <AnimatePresence>
            {players.find(p => p.id === 'player')?.hand.map((card, idx) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: -50, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.8 }}
                transition={{ delay: idx * 0.05, type: "spring", stiffness: 300 }}
                whileHover={{ y: -10 }}
              >
                <Card 
                  card={card} 
                  selected={selectedHandIds.includes(card.id)}
                  onClick={() => toggleHandSelection(card.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </footer>
    </div>
  );
}
