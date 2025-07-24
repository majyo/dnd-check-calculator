import { useState } from 'react';
import type { Player, SkillCheckEvent, CheckSession } from '../types';

interface DataManagerProps {
  players: Player[];
  events: SkillCheckEvent[];
  sessionHistory: CheckSession[];
  onPlayersImport: (players: Player[]) => void;
  onEventsImport: (events: SkillCheckEvent[]) => void;
  onSessionHistoryImport: (sessions: CheckSession[]) => void;
}

interface ImportedData {
  players?: Player[];
  events?: SkillCheckEvent[];
  sessionHistory?: CheckSession[];
  exportDate: string;
  version: string;
  type: string;
}

export function DataManager({
  players,
  events,
  sessionHistory,
  onPlayersImport,
  onEventsImport,
  onSessionHistoryImport
}: DataManagerProps) {
  const [importType, setImportType] = useState<'all' | 'players' | 'events' | 'sessions'>('all');
  const [isImporting, setIsImporting] = useState(false);

  // 导出功能
  const exportData = (type: 'all' | 'players' | 'events' | 'sessions') => {
    let data: ImportedData;
    let filename: string;

    const timestamp = new Date().toISOString().split('T')[0];

    switch (type) {
      case 'players':
        data = {
          players,
          exportDate: new Date().toISOString(),
          version: '1.0',
          type: 'players'
        };
        filename = `dnd-players-${timestamp}.json`;
        break;

      case 'events':
        data = {
          events,
          exportDate: new Date().toISOString(),
          version: '1.0',
          type: 'events'
        };
        filename = `dnd-events-${timestamp}.json`;
        break;

      case 'sessions':
        data = {
          sessionHistory,
          exportDate: new Date().toISOString(),
          version: '1.0',
          type: 'sessions'
        };
        filename = `dnd-sessions-${timestamp}.json`;
        break;

      default: // 'all'
        data = {
          players,
          events,
          sessionHistory,
          exportDate: new Date().toISOString(),
          version: '1.0',
          type: 'all'
        };
        filename = `dnd-data-${timestamp}.json`;
        break;
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 导入功能
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/json') {
      alert('请选择JSON格式的文件');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string) as ImportedData;
        processImportedData(importedData);
      } catch (error) {
        alert('文件格式错误，请检查JSON文件是否有效');
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);

    // 重置文件输入
    event.target.value = '';
  };

  const processImportedData = (data: ImportedData) => {
    setIsImporting(true);

    try {
      // 验证数据格式
      if (!data.version || !data.exportDate) {
        alert('无效的数据格式：缺少版本信息');
        return;
      }

      switch (importType) {
        case 'players': {
          if (data.players && Array.isArray(data.players)) {
            if (confirm(`确定要导入 ${data.players.length} 个玩家吗？这将覆盖现有的玩家数据。`)) {
              // 验证玩家数据格式
              const validPlayers = data.players.filter((player: Player) =>
                player.id && player.name && typeof player.skills === 'object'
              );
              onPlayersImport(validPlayers);
              alert(`成功导入 ${validPlayers.length} 个玩家`);
            }
          } else {
            alert('文件中没有有效的玩家数据');
          }
          break;
        }

        case 'events': {
          if (data.events && Array.isArray(data.events)) {
            if (confirm(`确定要导入 ${data.events.length} 个检定事件吗？这将覆盖现有的事件数据。`)) {
              // 验证事件数据格式
              const validEvents = data.events.filter((event: SkillCheckEvent) =>
                event.id && event.name && event.skill && typeof event.difficulty === 'number'
              );
              onEventsImport(validEvents);
              alert(`成功导入 ${validEvents.length} 个检定事件`);
            }
          } else {
            alert('文件中没有有效的检定事件数据');
          }
          break;
        }

        case 'sessions': {
          if (data.sessionHistory && Array.isArray(data.sessionHistory)) {
            if (confirm(`确定要导入 ${data.sessionHistory.length} 个会话记录吗？这将覆盖现有的会话历史。`)) {
              // 验证会话数据格式并转换日期
              const validSessions = data.sessionHistory
                .filter((session: CheckSession) =>
                  session.id && session.name && Array.isArray(session.items)
                )
                .map((session: CheckSession) => ({
                  ...session,
                  createdAt: new Date(session.createdAt),
                  completedAt: session.completedAt ? new Date(session.completedAt) : undefined
                }));
              onSessionHistoryImport(validSessions);
              alert(`成功导入 ${validSessions.length} 个会话记录`);
            }
          } else {
            alert('文件中没有有效的会话历史数据');
          }
          break;
        }

        case 'all': {
          let importCount = 0;
          const messages: string[] = [];

          if (data.players && Array.isArray(data.players)) {
            const validPlayers = data.players.filter((player: Player) =>
              player.id && player.name && typeof player.skills === 'object'
            );
            if (validPlayers.length > 0) {
              messages.push(`${validPlayers.length} 个玩家`);
              importCount++;
            }
          }

          if (data.events && Array.isArray(data.events)) {
            const validEvents = data.events.filter((event: SkillCheckEvent) =>
              event.id && event.name && event.skill && typeof event.difficulty === 'number'
            );
            if (validEvents.length > 0) {
              messages.push(`${validEvents.length} 个检定事件`);
              importCount++;
            }
          }

          if (data.sessionHistory && Array.isArray(data.sessionHistory)) {
            const validSessions = data.sessionHistory
              .filter((session: CheckSession) =>
                session.id && session.name && Array.isArray(session.items)
              )
              .map((session: CheckSession) => ({
                ...session,
                createdAt: new Date(session.createdAt),
                completedAt: session.completedAt ? new Date(session.completedAt) : undefined
              }));
            if (validSessions.length > 0) {
              messages.push(`${validSessions.length} 个会话记录`);
              importCount++;
            }
          }

          if (importCount > 0) {
            if (confirm(`确定要导入以下数据吗？这将覆盖现有数据：\n${messages.join('、')}`)) {
              // 执行实际导入
              if (data.players && Array.isArray(data.players)) {
                const validPlayers = data.players.filter((player: Player) =>
                  player.id && player.name && typeof player.skills === 'object'
                );
                if (validPlayers.length > 0) {
                  onPlayersImport(validPlayers);
                }
              }

              if (data.events && Array.isArray(data.events)) {
                const validEvents = data.events.filter((event: SkillCheckEvent) =>
                  event.id && event.name && event.skill && typeof event.difficulty === 'number'
                );
                if (validEvents.length > 0) {
                  onEventsImport(validEvents);
                }
              }

              if (data.sessionHistory && Array.isArray(data.sessionHistory)) {
                const validSessions = data.sessionHistory
                  .filter((session: CheckSession) =>
                    session.id && session.name && Array.isArray(session.items)
                  )
                  .map((session: CheckSession) => ({
                    ...session,
                    createdAt: new Date(session.createdAt),
                    completedAt: session.completedAt ? new Date(session.completedAt) : undefined
                  }));
                if (validSessions.length > 0) {
                  onSessionHistoryImport(validSessions);
                }
              }

              alert(`成功导入：${messages.join('、')}`);
            }
          } else {
            alert('文件中没有找到有效的数据');
          }
          break;
        }

        default:
          alert('未知的导入类型');
          break;
      }
    } catch (error) {
      alert(`导入失败：${error instanceof Error ? error.message : '未知错误'}`);
      console.error('Import processing error:', error);
    } finally {
      setIsImporting(false);
    }
  };

  const getDataStats = () => {
    return {
      players: players.length,
      events: events.length,
      sessions: sessionHistory.length,
      totalChecks: sessionHistory.reduce((sum, session) => sum + session.items.length, 0)
    };
  };

  const stats = getDataStats();

  return (
    <div className="data-manager">
      <h2>数据管理</h2>

      {/* 数据统计 */}
      <div className="data-stats">
        <h3>当前数据统计</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">玩家</span>
            <span className="stat-value">{stats.players}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">检定事件</span>
            <span className="stat-value">{stats.events}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">会话记录</span>
            <span className="stat-value">{stats.sessions}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">总检定次数</span>
            <span className="stat-value">{stats.totalChecks}</span>
          </div>
        </div>
      </div>

      {/* 导出功能 */}
      <div className="export-section">
        <h3>数据导出</h3>
        <p>将数据导出为JSON文件，可用于备份或在其他设备上导入</p>
        <div className="export-buttons">
          <button
            onClick={() => exportData('all')}
            className="export-btn export-all"
            disabled={stats.players === 0 && stats.events === 0 && stats.sessions === 0}
          >
            导出全部数据
          </button>
          <button
            onClick={() => exportData('players')}
            className="export-btn"
            disabled={stats.players === 0}
          >
            导出玩家数据 ({stats.players})
          </button>
          <button
            onClick={() => exportData('events')}
            className="export-btn"
            disabled={stats.events === 0}
          >
            导出检定事件 ({stats.events})
          </button>
          <button
            onClick={() => exportData('sessions')}
            className="export-btn"
            disabled={stats.sessions === 0}
          >
            导出会话记录 ({stats.sessions})
          </button>
        </div>
      </div>

      {/* 导入功能 */}
      <div className="import-section">
        <h3>数据导入</h3>
        <p>从JSON文件导入数据。注意：导入操作将覆盖现有数据，请谨慎操作。</p>

        <div className="import-type-selection">
          <label>导入类型：</label>
          <select
            value={importType}
            onChange={(e) => setImportType(e.target.value as 'all' | 'players' | 'events' | 'sessions')}
            className="import-type-select"
          >
            <option value="all">全部数据</option>
            <option value="players">仅玩家数据</option>
            <option value="events">仅检定事件</option>
            <option value="sessions">仅会话记录</option>
          </select>
        </div>

        <div className="import-controls">
          <input
            type="file"
            accept=".json"
            onChange={handleFileImport}
            className="file-input"
            id="import-file"
            disabled={isImporting}
          />
          <label htmlFor="import-file" className={`file-input-label ${isImporting ? 'disabled' : ''}`}>
            {isImporting ? '导入中...' : '选择JSON文件导入'}
          </label>
        </div>

        <div className="import-warning">
          <p>⚠️ 警告：导入操作将完全替换对应类型的现有数据，此操作不可撤销。建议在导入前先导出备份。</p>
        </div>
      </div>
    </div>
  );
}
