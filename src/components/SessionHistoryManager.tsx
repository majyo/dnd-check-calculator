import { useState } from 'react';
import type { CheckSession, SessionSummary } from '../types';

interface SessionHistoryManagerProps {
  sessionHistory: CheckSession[];
  currentSession: CheckSession | null;
  onLoadSession: (session: CheckSession) => void;
  onDeleteSession: (sessionId: string) => void;
  onArchiveSession: (sessionId: string) => void;
}

export function SessionHistoryManager({
  sessionHistory,
  currentSession,
  onLoadSession,
  onDeleteSession,
  onArchiveSession
}: SessionHistoryManagerProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'archived'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const generateSessionSummary = (session: CheckSession): SessionSummary => {
    const playerIds = new Set(session.items.map(item => item.playerId));
    const eventIds = new Set(session.items.map(item => item.eventId));
    const completedChecks = session.items.filter(item => item.result !== 'pending');
    const successCount = completedChecks.filter(item => item.result === 'success').length;

    return {
      id: session.id,
      name: session.name,
      createdAt: session.createdAt,
      completedAt: session.completedAt,
      status: session.status,
      playerCount: playerIds.size,
      eventCount: eventIds.size,
      totalChecks: session.items.length,
      successCount
    };
  };

  const filteredSessions = sessionHistory.filter(session => {
    const matchesFilter = filter === 'all' || session.status === filter;
    const matchesSearch = session.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const sortedSessions = filteredSessions.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '进行中';
      case 'completed': return '已完成';
      case 'archived': return '已归档';
      default: return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'active': return 'status-active';
      case 'completed': return 'status-completed';
      case 'archived': return 'status-archived';
      default: return '';
    }
  };

  return (
    <div className="session-history-manager">
      <h2>会话历史</h2>

      <div className="history-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="搜索会话名称..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-buttons">
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            全部 ({sessionHistory.length})
          </button>
          <button
            className={filter === 'active' ? 'active' : ''}
            onClick={() => setFilter('active')}
          >
            进行中 ({sessionHistory.filter(s => s.status === 'active').length})
          </button>
          <button
            className={filter === 'completed' ? 'active' : ''}
            onClick={() => setFilter('completed')}
          >
            已完成 ({sessionHistory.filter(s => s.status === 'completed').length})
          </button>
          <button
            className={filter === 'archived' ? 'active' : ''}
            onClick={() => setFilter('archived')}
          >
            已归档 ({sessionHistory.filter(s => s.status === 'archived').length})
          </button>
        </div>
      </div>

      <div className="sessions-list">
        {sortedSessions.length === 0 ? (
          <div className="no-sessions">
            {searchTerm ? '没有找到匹配的会话' : '暂无会话历史'}
          </div>
        ) : (
          sortedSessions.map(session => {
            const summary = generateSessionSummary(session);
            const isCurrentSession = currentSession?.id === session.id;

            return (
              <div key={session.id} className={`session-card ${isCurrentSession ? 'current' : ''}`}>
                <div className="session-header">
                  <h3 className="session-name">
                    {session.name}
                    {isCurrentSession && <span className="current-badge">当前会话</span>}
                  </h3>
                  <span className={`session-status ${getStatusClass(session.status)}`}>
                    {getStatusText(session.status)}
                  </span>
                </div>

                <div className="session-info">
                  <div className="session-meta">
                    <span>创建时间: {formatDate(session.createdAt)}</span>
                    {session.completedAt && (
                      <span>完成时间: {formatDate(session.completedAt)}</span>
                    )}
                  </div>

                  <div className="session-stats">
                    <span>玩家: {summary.playerCount}</span>
                    <span>事件: {summary.eventCount}</span>
                    <span>检定: {summary.totalChecks}</span>
                    <span>成功: {summary.successCount}/{summary.totalChecks}</span>
                  </div>
                </div>

                <div className="session-actions">
                  {!isCurrentSession && (
                    <button
                      onClick={() => onLoadSession(session)}
                      className="load-btn"
                    >
                      加载会话
                    </button>
                  )}

                  {session.status === 'active' && (
                    <button
                      onClick={() => onArchiveSession(session.id)}
                      className="archive-btn"
                    >
                      归档
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (confirm(`确定要删除会话"${session.name}"吗？此操作不可撤销。`)) {
                        onDeleteSession(session.id);
                      }
                    }}
                    className="delete-btn"
                  >
                    删除
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
