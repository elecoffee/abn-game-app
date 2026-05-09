export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;

export type CardType = 'acid' | 'base' | 'operation' | 'salt_water';

export interface Card {
  id: string;
  type: CardType;
  name: string;
  formula: string;
  valence?: number; // 価数
  effect?: 'reverse' | 'skip' | 'draw2' | 'shuffle' | 'multiply2' | 'multiply3' | 'onepot';
  count?: number;
}

export interface SaltWaterCard extends Card {
  type: 'salt_water';
  acidRequired: string;
  baseRequired: string;
  acidCount: number;
  baseCount: number;
  waterCount: number; // これが勝利点になる
}

export const ACIDS: Card[] = [
  { id: 'hcl', type: 'acid', name: '塩酸', formula: 'HCl', valence: 1 },
  { id: 'ch3cooh', type: 'acid', name: '酢酸', formula: 'CH3COOH', valence: 1 },
  { id: 'h2so4', type: 'acid', name: '硫酸', formula: 'H2SO4', valence: 2 },
  { id: 'h3po4', type: 'acid', name: 'リン酸', formula: 'H3PO4', valence: 3 },
];

export const BASES: Card[] = [
  { id: 'naoh', type: 'base', name: '水酸化ナトリウム', formula: 'NaOH', valence: 1 },
  { id: 'nh3', type: 'base', name: 'アンモニア水', formula: 'NH3/H2O', valence: 1 },
  { id: 'caoh2', type: 'base', name: '水酸化カルシウム', formula: 'Ca(OH)2', valence: 2 },
  { id: 'feoh3', type: 'base', name: '水酸化鉄(III)', formula: 'Fe(OH)3', valence: 3 },
];

export const OPERATIONS: Card[] = [
  { id: 'buy', type: 'operation', name: 'ワンポット合成', formula: '+2種類', effect: 'onepot' },
  { id: 'stir', type: 'operation', name: '溶液の作成', formula: 'かく拌', effect: 'shuffle' },
  { id: 'conc2', type: 'operation', name: '溶液濃度の調製', formula: 'x2 mol', effect: 'multiply2' },
  { id: 'conc3', type: 'operation', name: '溶液濃度の調製', formula: 'x3 mol', effect: 'multiply3' },
];

export const SALT_WATER_CARDS: SaltWaterCard[] = [
  { id: 'sw1', type: 'salt_water', name: '塩化ナトリウム', formula: 'NaCl + H2O', acidRequired: 'hcl', baseRequired: 'naoh', acidCount: 1, baseCount: 1, waterCount: 1 },
  { id: 'sw2', type: 'salt_water', name: '塩化アンモニウム', formula: 'NH4Cl + H2O', acidRequired: 'hcl', baseRequired: 'nh3', acidCount: 1, baseCount: 1, waterCount: 1 },
  { id: 'sw3', type: 'salt_water', name: '塩化カルシウム', formula: 'CaCl2 + 2H2O', acidRequired: 'hcl', baseRequired: 'caoh2', acidCount: 2, baseCount: 1, waterCount: 2 },
  { id: 'sw4', type: 'salt_water', name: '塩化鉄(III)', formula: 'FeCl3 + 3H2O', acidRequired: 'hcl', baseRequired: 'feoh3', acidCount: 3, baseCount: 1, waterCount: 3 },
  { id: 'sw5', type: 'salt_water', name: '酢酸ナトリウム', formula: 'CH3COONa + H2O', acidRequired: 'ch3cooh', baseRequired: 'naoh', acidCount: 1, baseCount: 1, waterCount: 1 },
  { id: 'sw6', type: 'salt_water', name: '酢酸アンモニウム', formula: 'CH3COONH4 + H2O', acidRequired: 'ch3cooh', baseRequired: 'nh3', acidCount: 1, baseCount: 1, waterCount: 1 },
  { id: 'sw7', type: 'salt_water', name: '酢酸カルシウム', formula: '(CH3COO)2Ca + 2H2O', acidRequired: 'ch3cooh', baseRequired: 'caoh2', acidCount: 2, baseCount: 1, waterCount: 2 },
  { id: 'sw8', type: 'salt_water', name: '酢酸鉄(III)', formula: '(CH3COO)3Fe + 3H2O', acidRequired: 'ch3cooh', baseRequired: 'feoh3', acidCount: 3, baseCount: 1, waterCount: 3 },
  { id: 'sw9', type: 'salt_water', name: '硫酸水素ナトリウム', formula: 'NaHSO4 + H2O', acidRequired: 'h2so4', baseRequired: 'naoh', acidCount: 1, baseCount: 1, waterCount: 1 },
  { id: 'sw10', type: 'salt_water', name: '硫酸ナトリウム', formula: 'Na2SO4 + 2H2O', acidRequired: 'h2so4', baseRequired: 'naoh', acidCount: 1, baseCount: 2, waterCount: 2 },
  { id: 'sw11', type: 'salt_water', name: '硫酸アンモニウム', formula: '(NH4)2SO4 + 2H2O', acidRequired: 'h2so4', baseRequired: 'nh3', acidCount: 1, baseCount: 2, waterCount: 2 },
  { id: 'sw12', type: 'salt_water', name: '硫酸カルシウム', formula: 'CaSO4 + 2H2O', acidRequired: 'h2so4', baseRequired: 'caoh2', acidCount: 1, baseCount: 1, waterCount: 2 },
  { id: 'sw13', type: 'salt_water', name: '硫酸鉄(III)', formula: 'Fe2(SO4)3 + 6H2O', acidRequired: 'h2so4', baseRequired: 'feoh3', acidCount: 3, baseCount: 2, waterCount: 6 },
  { id: 'sw14', type: 'salt_water', name: 'リン酸ナトリウム', formula: 'Na3PO4 + 3H2O', acidRequired: 'h3po4', baseRequired: 'naoh', acidCount: 1, baseCount: 3, waterCount: 3 },
  { id: 'sw15', type: 'salt_water', name: 'リン酸アンモニウム', formula: '(NH4)3PO4 + 3H2O', acidRequired: 'h3po4', baseRequired: 'nh3', acidCount: 1, baseCount: 3, waterCount: 3 },
  { id: 'sw16', type: 'salt_water', name: 'リン酸カルシウム', formula: 'Ca3(PO4)2 + 6H2O', acidRequired: 'h3po4', baseRequired: 'caoh2', acidCount: 2, baseCount: 3, waterCount: 6 },
  { id: 'sw17', type: 'salt_water', name: 'リン酸鉄(III)', formula: 'FePO4 + 3H2O', acidRequired: 'h3po4', baseRequired: 'feoh3', acidCount: 1, baseCount: 1, waterCount: 3 },
];
