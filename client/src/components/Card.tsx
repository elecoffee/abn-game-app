import React from 'react';
import { Card as CardType, SaltWaterCard } from '../../../shared/const';
import { cn } from '@/lib/utils';

interface CardProps {
  card: CardType | SaltWaterCard;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

// 化学式をレンダリング: 化学量論係数は普通サイズ、化学式内の数字は下付き
const renderFormula = (formula: string) => {
  const subscripts: { [key: string]: string } = {
    '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
    '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉'
  };

  // 例: "2H2SO4" -> coeff="2", rest="H2SO4"
  // 例: "H2O" -> coeff=null, rest="H2O"
  const match = formula.match(/^(\d+)(.+)$|^(.+)$/);
  
  if (!match) return formula;

  let coeff = '';
  let chemicalPart = '';

  if (match[1]) {
    // 化学量論係数がある場合
    coeff = match[1];
    chemicalPart = match[2];
  } else {
    // 化学量論係数がない場合
    chemicalPart = match[3];
  }

  // 化学式部分の数字を下付きに変換
  // 元素記号の直後の数字を下付きにする
  const convertedChemical = chemicalPart.replace(/([A-Z][a-z]?)(\d+)/g, (fullMatch, element, number) => {
    const subscriptNumber = number.split('').map((d: string) => subscripts[d] || d).join('');
    return element + subscriptNumber;
  });

  // "+" や " " を含む場合（例: "H2O + H2O"）の処理
  const finalChemical = convertedChemical.split(/(\s*\+\s*)/).map((part, idx) => {
    if (part.includes('+')) return part; // "+" は変換しない
    // 各部分の数字を下付きに変換
    return part.replace(/(\d+)/g, (match: string) => {
      return match.split('').map((d: string) => subscripts[d] || d).join('');
    });
  }).join('');

  return (
    <>
      {coeff && <span>{coeff}</span>}
      <span>{finalChemical}</span>
    </>
  );
};

export const Card: React.FC<CardProps> = ({ card, selected, onClick, disabled, className }) => {
  const isAcid = card.type === 'acid';
  const isBase = card.type === 'base';
  const isOp = card.type === 'operation';
  const isSalt = card.type === 'salt_water';

  return (
    <div
      onClick={!disabled ? onClick : undefined}
      className={cn(
        "relative w-32 h-48 rounded-xl border-2 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col items-center justify-between p-3",
        "bg-slate-900/80 backdrop-blur-md",
        isAcid && "border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.3)]",
        isBase && "border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]",
        isOp && "border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]",
        isSalt && "border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)]",
        selected && "scale-105 -translate-y-2 ring-4 ring-white ring-offset-2 ring-offset-slate-900",
        disabled && "opacity-50 grayscale cursor-not-allowed",
        className
      )}
    >
      {/* 背景装飾 */}
      <div className={cn(
        "absolute inset-0 opacity-10 pointer-events-none",
        isAcid && "bg-[radial-gradient(circle_at_center,#ec4899,transparent)]",
        isBase && "bg-[radial-gradient(circle_at_center,#22d3ee,transparent)]",
        isOp && "bg-[radial-gradient(circle_at_center,#fbbf24,transparent)]",
        isSalt && "bg-[radial-gradient(circle_at_center,#34d399,transparent)]",
      )} />

      <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">
        {card.type.replace('_', ' ')}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 w-full">
        <div className={cn(
          "text-lg font-black tracking-tighter leading-tight break-words px-1",
          isAcid && "text-pink-400",
          isBase && "text-cyan-300",
          isOp && "text-amber-300",
          isSalt && "text-emerald-300",
        )}>
          {renderFormula(card.formula)}
        </div>
        <div className="text-[9px] font-medium text-slate-300 leading-tight px-1 break-words">
          {card.name}
        </div>
      </div>

      {card.effect && (
        <div className="w-full mt-2 py-1 px-2 rounded bg-white/5 border border-white/10 text-[8px] text-center font-bold text-white/80 break-words">
          {card.effect === 'reverse' && '逆合成'}
          {card.effect === 'skip' && 'スキップ'}
          {card.effect === 'draw2' && '試薬購入'}
          {card.effect === 'shuffle' && 'かく拌'}
          {card.effect === 'multiply2' && '濃度2倍'}
          {card.effect === 'multiply3' && '濃度3倍'}
          {card.effect === 'onepot' && 'ワンポット'}
        </div>
      )}

      {isSalt && (card as SaltWaterCard).waterCount > 0 && (
        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
          {(card as SaltWaterCard).waterCount}
        </div>
      )}
    </div>
  );
};
