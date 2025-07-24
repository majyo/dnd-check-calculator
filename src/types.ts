// D&D 5e 技能检定计算器的类型定义

// D&D 5e 技能列表（中文）
export const DND_SKILLS = [
  '运动', '杂技', '巧手', '隐匿',
  '奥秘', '历史', '调查', '自然', '宗教',
  '驯兽', '洞察', '医药', '察觉', '求生',
  '欺瞒', '威吓', '表演', '说服'
] as const;

// 英文到中文的技能映射（用于兼容性）
export const SKILL_TRANSLATION: Record<string, string> = {
  'Athletics': '运动',
  'Acrobatics': '杂技',
  'Sleight of Hand': '巧手',
  'Stealth': '隐匿',
  'Arcana': '奥秘',
  'History': '历史',
  'Investigation': '调查',
  'Nature': '自然',
  'Religion': '宗教',
  'Animal Handling': '驯兽',
  'Insight': '洞察',
  'Medicine': '医药',
  'Perception': '察觉',
  'Survival': '求生',
  'Deception': '欺瞒',
  'Intimidation': '威吓',
  'Performance': '表演',
  'Persuasion': '说服'
};

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
  // 新增字段用于会话历史
  status: 'active' | 'completed' | 'archived';
  completedAt?: Date;
}

// 新增会话历史相关类型
export interface SessionHistory {
  sessions: CheckSession[];
}

export interface SessionSummary {
  id: string;
  name: string;
  createdAt: Date;
  completedAt?: Date;
  status: 'active' | 'completed' | 'archived';
  playerCount: number;
  eventCount: number;
  totalChecks: number;
  successCount: number;
}
