import { useState, useEffect } from 'react'
import './App.css'
import type { Player, SkillCheckEvent, CheckSession } from './types'
import { PlayerManager } from './components/PlayerManager'
import { EventManager } from './components/EventManager'
import { CheckSessionCreator } from './components/CheckSessionCreator'
import { CheckSessionManager } from './components/CheckSessionManager'
import { SessionHistoryManager } from './components/SessionHistoryManager'

function App() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [events, setEvents] = useState<SkillCheckEvent[]>([]);
  const [currentSession, setCurrentSession] = useState<CheckSession | null>(null);
  const [sessionHistory, setSessionHistory] = useState<CheckSession[]>([]);
  const [activeTab, setActiveTab] = useState<'setup' | 'session' | 'history'>('setup');

  // 从localStorage加载会话历史
  useEffect(() => {
    const savedHistory = localStorage.getItem('dnd-session-history');
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory) as CheckSession[];
        const sessionsWithDates = parsedHistory.map((session) => ({
          ...session,
          createdAt: new Date(session.createdAt),
          completedAt: session.completedAt ? new Date(session.completedAt) : undefined
        }));
        setSessionHistory(sessionsWithDates);
      } catch (error) {
        console.error('Failed to load session history:', error);
      }
    }
  }, []);

  // 保存会话历史到localStorage
  const saveSessionHistory = (history: CheckSession[]) => {
    localStorage.setItem('dnd-session-history', JSON.stringify(history));
  };

  const handleCreateSession = (session: CheckSession) => {
    const newSession = {
      ...session,
      status: 'active' as const,
      createdAt: new Date()
    };

    setCurrentSession(newSession);

    // 添加到历史记录
    const updatedHistory = [newSession, ...sessionHistory];
    setSessionHistory(updatedHistory);
    saveSessionHistory(updatedHistory);

    setActiveTab('session');
  };

  const handleUpdateSession = (session: CheckSession) => {
    setCurrentSession(session);

    // 更新历史记录中的会话
    const updatedHistory = sessionHistory.map(s =>
      s.id === session.id ? session : s
    );
    setSessionHistory(updatedHistory);
    saveSessionHistory(updatedHistory);
  };

  const handleCloseSession = () => {
    if (currentSession) {
      // 将当前会话标记为已完成
      const completedSession = {
        ...currentSession,
        status: 'completed' as const,
        completedAt: new Date()
      };

      const updatedHistory = sessionHistory.map(s =>
        s.id === currentSession.id ? completedSession : s
      );
      setSessionHistory(updatedHistory);
      saveSessionHistory(updatedHistory);
    }

    setCurrentSession(null);
    setActiveTab('setup');
  };

  const handleLoadSession = (session: CheckSession) => {
    // 如果有当前会话，先关闭它
    if (currentSession && currentSession.id !== session.id) {
      const completedSession = {
        ...currentSession,
        status: 'completed' as const,
        completedAt: new Date()
      };

      const updatedHistory = sessionHistory.map(s =>
        s.id === currentSession.id ? completedSession : s
      );
      setSessionHistory(updatedHistory);
      saveSessionHistory(updatedHistory);
    }

    // 加载选中的会话
    const loadedSession = {
      ...session,
      status: 'active' as const
    };

    setCurrentSession(loadedSession);

    // 更新历史记录
    const updatedHistory = sessionHistory.map(s =>
      s.id === session.id ? loadedSession : s
    );
    setSessionHistory(updatedHistory);
    saveSessionHistory(updatedHistory);

    setActiveTab('session');
  };

  const handleDeleteSession = (sessionId: string) => {
    // 如果删除的是当前会话，则清空当前会话
    if (currentSession?.id === sessionId) {
      setCurrentSession(null);
      setActiveTab('setup');
    }

    const updatedHistory = sessionHistory.filter(s => s.id !== sessionId);
    setSessionHistory(updatedHistory);
    saveSessionHistory(updatedHistory);
  };

  const handleArchiveSession = (sessionId: string) => {
    const updatedHistory = sessionHistory.map(s =>
      s.id === sessionId ? { ...s, status: 'archived' as const } : s
    );
    setSessionHistory(updatedHistory);
    saveSessionHistory(updatedHistory);
  };

  return (
    <div className="app">
      <header>
        <h1>D&D 5e 技能检定计算器</h1>
        <nav className="tab-nav">
          <button
            className={activeTab === 'setup' ? 'active' : ''}
            onClick={() => setActiveTab('setup')}
          >
            设置
          </button>
          <button
            className={activeTab === 'session' ? 'active' : ''}
            onClick={() => setActiveTab('session')}
            disabled={!currentSession}
          >
            检定会话
          </button>
          <button
            className={activeTab === 'history' ? 'active' : ''}
            onClick={() => setActiveTab('history')}
          >
            历史记录 ({sessionHistory.length})
          </button>
        </nav>
      </header>

      <main>
        {activeTab === 'setup' ? (
          <div className="setup-tab">
            <div className="setup-grid">
              <PlayerManager
                players={players}
                onPlayersChange={setPlayers}
              />
              <EventManager
                events={events}
                onEventsChange={setEvents}
              />
            </div>
            <CheckSessionCreator
              players={players}
              events={events}
              onCreateSession={handleCreateSession}
            />
          </div>
        ) : activeTab === 'session' ? (
          <CheckSessionManager
            session={currentSession}
            onUpdateSession={handleUpdateSession}
            onCloseSession={handleCloseSession}
          />
        ) : (
          <SessionHistoryManager
            sessionHistory={sessionHistory}
            currentSession={currentSession}
            onLoadSession={handleLoadSession}
            onDeleteSession={handleDeleteSession}
            onArchiveSession={handleArchiveSession}
          />
        )}
      </main>
    </div>
  )
}

export default App
