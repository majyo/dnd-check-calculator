import { useState } from 'react';
import type { CheckSession, CheckItem } from '../types';

interface CheckSessionManagerProps {
  session: CheckSession | null;
  onUpdateSession: (session: CheckSession) => void;
  onCloseSession: () => void;
}

export function CheckSessionManager({ session, onUpdateSession, onCloseSession }: CheckSessionManagerProps) {
  const [customValues, setCustomValues] = useState<Record<string, string>>({});
  const [customBonuses, setCustomBonuses] = useState<Record<string, string>>({});

  if (!session) {
    return (
      <div className="check-session-manager">
        <p>请先创建一个检定会话</p>
      </div>
    );
  }

  const rollD20 = () => Math.floor(Math.random() * 20) + 1;

  const rollWithAdvantage = () => {
    const roll1 = rollD20();
    const roll2 = rollD20();
    return Math.max(roll1, roll2);
  };

  const rollWithDisadvantage = () => {
    const roll1 = rollD20();
    const roll2 = rollD20();
    return Math.min(roll1, roll2);
  };

  const calculateResult = (item: CheckItem): CheckItem => {
    const baseValue = item.diceRoll || item.customValue || 0;
    const customBonus = item.customBonus || 0;
    const total = baseValue + item.modifier + customBonus;
    const result = total >= item.difficulty ? 'success' : 'failure';
    return { ...item, total, result };
  };

  const rollForItem = (itemId: string) => {
    const updatedItems = session.items.map(item => {
      if (item.id === itemId) {
        let diceRoll: number;

        if (item.advantage && !item.disadvantage) {
          diceRoll = rollWithAdvantage();
        } else if (item.disadvantage && !item.advantage) {
          diceRoll = rollWithDisadvantage();
        } else {
          diceRoll = rollD20();
        }

        // 保持当前输入的自定义加值
        const customBonus = parseInt(customBonuses[itemId]) || 0;
        const updatedItem = {
          ...item,
          diceRoll,
          customValue: undefined, // 投掷时清除自定义值
          customBonus
        };
        return calculateResult(updatedItem);
      }
      return item;
    });

    onUpdateSession({ ...session, items: updatedItems });
    // 投掷后不清空输入框，保持用户输入状态方便反复调整
  };

  const rollForAll = () => {
    const updatedItems = session.items.map(item => {
      if (item.result === 'pending' || (!item.diceRoll && !item.customValue)) {
        let diceRoll: number;

        if (item.advantage && !item.disadvantage) {
          diceRoll = rollWithAdvantage();
        } else if (item.disadvantage && !item.advantage) {
          diceRoll = rollWithDisadvantage();
        } else {
          diceRoll = rollD20();
        }

        // 保持当前输入的自定义加值
        const customBonus = parseInt(customBonuses[item.id]) || 0;
        const updatedItem = {
          ...item,
          diceRoll,
          customValue: undefined, // 投掷时清除自定义值
          customBonus
        };
        return calculateResult(updatedItem);
      }
      return item;
    });

    onUpdateSession({ ...session, items: updatedItems });
    // 批量投掷后不清空输入框，保持用户输入状态方便反复调整
  };

  const handleCustomValueChange = (itemId: string, value: string) => {
    setCustomValues(prev => ({ ...prev, [itemId]: value }));
    
    // 如果输入为空，重置item状态
    if (!value.trim()) {
      const updatedItems = session.items.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            customValue: undefined,
            diceRoll: undefined,
            total: undefined,
            result: 'pending' as const
          };
        }
        return item;
      });
      onUpdateSession({ ...session, items: updatedItems });
      return;
    }
    
    const numericValue = parseInt(value);
    if (!isNaN(numericValue) && numericValue >= 1 && numericValue <= 20) {
      const updatedItems = session.items.map(item => {
        if (item.id === itemId) {
          const customBonus = parseInt(customBonuses[itemId]) || 0;
          const updatedItem = {
            ...item,
            customValue: numericValue,
            diceRoll: undefined,
            customBonus
          };
          return calculateResult(updatedItem);
        }
        return item;
      });
      onUpdateSession({ ...session, items: updatedItems });
    }
  };

  const handleCustomBonusChange = (itemId: string, value: string) => {
    setCustomBonuses(prev => ({ ...prev, [itemId]: value }));
    
    // 实时计算结果
    const updatedItems = session.items.map(item => {
      if (item.id === itemId) {
        const customBonus = parseInt(value) || 0;
        const updatedItem = {
          ...item,
          customBonus
        };
        // 只有在有骰子结果或自定义值时才重新计算
        if (item.diceRoll || item.customValue) {
          return calculateResult(updatedItem);
        }
        return updatedItem;
      }
      return item;
    });
    onUpdateSession({ ...session, items: updatedItems });
  };

  const toggleAdvantage = (itemId: string) => {
    const updatedItems = session.items.map(item => {
      if (item.id === itemId) {
        const updatedItem = {
          ...item,
          advantage: !item.advantage,
          disadvantage: item.advantage ? item.disadvantage : false
        };
        return item.diceRoll || item.customValue ? calculateResult(updatedItem) : updatedItem;
      }
      return item;
    });

    onUpdateSession({ ...session, items: updatedItems });
  };

  const toggleDisadvantage = (itemId: string) => {
    const updatedItems = session.items.map(item => {
      if (item.id === itemId) {
        const updatedItem = {
          ...item,
          disadvantage: !item.disadvantage,
          advantage: item.disadvantage ? item.advantage : false
        };
        return item.diceRoll || item.customValue ? calculateResult(updatedItem) : updatedItem;
      }
      return item;
    });

    onUpdateSession({ ...session, items: updatedItems });
  };


  const resetAll = () => {
    const updatedItems = session.items.map(item => ({
      ...item,
      diceRoll: undefined,
      customValue: undefined,
      total: undefined,
      result: 'pending' as const,
      customBonus: undefined,
      advantage: false,
      disadvantage: false
    }));

    onUpdateSession({ ...session, items: updatedItems });
    setCustomValues({});
    setCustomBonuses({});
  };

  const getResultStats = () => {
    const total = session.items.length;
    const success = session.items.filter(item => item.result === 'success').length;
    const failure = session.items.filter(item => item.result === 'failure').length;
    const pending = session.items.filter(item => item.result === 'pending').length;

    return { total, success, failure, pending };
  };

  const stats = getResultStats();

  return (
    <div className="check-session-manager">
      <div className="session-header">
        <h2>{session.name}</h2>
        <div className="session-stats">
          <span className="stat success">成功: {stats.success}</span>
          <span className="stat failure">失败: {stats.failure}</span>
          <span className="stat pending">待检定: {stats.pending}</span>
        </div>
        <div className="session-actions">
          <button onClick={rollForAll} className="roll-all-btn">
            自动投掷全部
          </button>
          <button onClick={resetAll} className="reset-all-btn">
            重置全部
          </button>
          <button onClick={onCloseSession} className="close-session-btn">
            关闭会话
          </button>
        </div>
      </div>

      <div className="check-items">
        {session.items.map(item => (
          <div key={item.id} className={`check-item ${item.result}`}>
            <div className="item-info">
              <h4>{item.playerName}</h4>
              <div className="check-details">
                <span className="event-name">{item.eventName}</span>
                <span className="skill">({item.skill})</span>
                <span className="modifier">修正值: {item.modifier >= 0 ? '+' : ''}{item.modifier}</span>
                <span className="difficulty">DC: {item.difficulty}</span>
              </div>
            </div>

            <div className="roll-section">
              <div className="roll-controls">
                <button onClick={() => rollForItem(item.id)} className="roll-btn">
                  投掷
                </button>
                <div className="custom-roll">
                  <input
                    type="number"
                    min="1"
                    max="20"
                    placeholder="自定义(1-20)"
                    value={customValues[item.id] || ''}
                    onChange={(e) => handleCustomValueChange(item.id, e.target.value)}
                  />
                </div>
                <div className="custom-bonus">
                  <input
                    type="number"
                    placeholder="自定义加值"
                    value={customBonuses[item.id] || ''}
                    onChange={(e) => handleCustomBonusChange(item.id, e.target.value)}
                  />
                </div>
                <div className="advantage-disadvantage">
                  <label>
                    <input
                      type="checkbox"
                      checked={item.advantage}
                      onChange={() => toggleAdvantage(item.id)}
                    />
                    优势
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={item.disadvantage}
                      onChange={() => toggleDisadvantage(item.id)}
                    />
                    劣势
                  </label>
                </div>
              </div>

              {item.result !== 'pending' && (
                <div className="roll-result">
                  <div className="dice-value">
                    骰子: {item.diceRoll || item.customValue}
                    {item.customValue && <span className="custom-indicator">(自定义)</span>}
                    {item.advantage && <span className="advantage-indicator">(优势)</span>}
                    {item.disadvantage && <span className="disadvantage-indicator">(劣势)</span>}
                  </div>
                  <div className="calculation">
                    {item.diceRoll || item.customValue} + {item.modifier}
                    {item.customBonus ? ` + ${item.customBonus}` : ''} = {item.total}
                  </div>
                  {item.customBonus && (
                    <div className="custom-bonus-display">
                      自定义加值: +{item.customBonus}
                    </div>
                  )}
                  <div className={`result ${item.result}`}>
                    {item.result === 'success' ? '成功' : '失败'}
                  </div>
                </div>
              )}

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
