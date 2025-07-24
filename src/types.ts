// D&D 5e 技能检定计算器的类型定义

export interface Player {
  id: string;
  name: string;
  skills: Record<string, number>; // 技能名 -> 修正值
}

export interface SkillCheckEvent {
  id: string;
  name: string;
  skill: string;
  difficulty: number; // DC值
  description?: string;
}

export interface CheckItem {
  id: string;
  playerId: string;
  playerName: string;
  eventId: string;
  eventName: string;
  skill: string;
  modifier: number;
  diceRoll?: number;
  customValue?: number;
  difficulty: number;
  result?: 'success' | 'failure' | 'pending';
  total?: number;
  // 新增字段
  customBonus?: number; // 自定义加值
  advantage?: boolean; // 优势
  disadvantage?: boolean; // 劣势
}

export interface CheckSession {
  id: string;
  name: string;
  items: CheckItem[];
  createdAt: Date;
}
